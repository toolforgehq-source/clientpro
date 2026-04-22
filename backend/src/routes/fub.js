/**
 * Follow Up Boss read-only integration routes.
 *
 * Wedge scope for this PR:
 *   POST   /api/fub/connect      — validate + store an agent's API key
 *   DELETE /api/fub/disconnect   — clear the stored key
 *   GET    /api/fub/status       — { connected, identity, last_sync_* }
 *   GET    /api/fub/preview      — dry-run: show total + first 5 mapped people
 *   POST   /api/fub/import       — import up to N contacts, schedule messages
 *
 * Every route here requires auth + active subscription. The API key is
 * never returned to the client after it's been saved — only `connected: true`
 * plus display-safe identity metadata.
 */
const { Router } = require("express");
const { body, query: queryValidator, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const requireSubscription = require("../middleware/requireSubscription");
const { checkClientLimit, TIER_LIMITS } = require("../middleware/validateTier");
const User = require("../models/User");
const Client = require("../models/Client");
const { encrypt, decrypt } = require("../config/fubCrypto");
const fubClient = require("../services/followUpBossClient");
const { mapPersonToClient } = require("../services/fubMapper");
const { scheduleMessagesForClient, scheduleRecurringMessages } = require("../services/messageScheduler");
const logger = require("../utils/logger");

const router = Router();

const PREVIEW_SIZE = 5;
const DEFAULT_IMPORT_CAP = 500;
const HARD_IMPORT_CAP = 2000;

function handleFubError(err, res, fallback = "FUB request failed") {
  if (err?.code === "FUB_UNAUTHORIZED") {
    return res.status(401).json({
      error: {
        message:
          "Follow Up Boss rejected the API key. Check that you copied it from Admin → API and try again.",
        code: "FUB_UNAUTHORIZED",
      },
    });
  }
  if (err?.code === "FUB_RATE_LIMITED") {
    return res.status(429).json({
      error: {
        message: `Follow Up Boss rate limit hit. Try again in ${err.retryAfterSeconds || 10}s.`,
        code: "FUB_RATE_LIMITED",
        retry_after_seconds: err.retryAfterSeconds || null,
      },
    });
  }
  if (err?.code === "FUB_NETWORK") {
    return res.status(502).json({
      error: { message: "Couldn't reach Follow Up Boss. Try again in a moment.", code: "FUB_NETWORK" },
    });
  }
  logger.error("FUB route error:", err?.message || err);
  return res.status(500).json({ error: { message: fallback, code: "FUB_ERROR" } });
}

async function getDecryptedKey(userId) {
  const enc = await User.getFubApiKeyEncrypted(userId);
  if (!enc) return null;
  return decrypt(enc);
}

function statusPayload(user) {
  return {
    connected: Boolean(user?.fub_connected),
    identity: user?.fub_connected
      ? {
          id: user.fub_identity_id ?? null,
          name: user.fub_identity_name ?? null,
        }
      : null,
    last_sync_at: user?.fub_last_sync_at
      ? new Date(user.fub_last_sync_at).toISOString()
      : null,
    last_sync_count: user?.fub_last_sync_count ?? null,
  };
}

router.get("/status", auth, requireSubscription, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(statusPayload(user));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/connect",
  auth,
  requireSubscription,
  [body("api_key").isString().trim().isLength({ min: 10 }).withMessage("API key required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const apiKey = req.body.api_key.trim();

      // Validate the key with FUB before saving anything.
      let identity;
      try {
        identity = await fubClient.getIdentity(apiKey);
      } catch (fubErr) {
        return handleFubError(fubErr, res, "Could not validate FUB API key");
      }

      const encrypted = encrypt(apiKey);
      if (!encrypted) {
        return res.status(500).json({ error: { message: "Failed to secure API key", code: "ENCRYPT_FAIL" } });
      }

      await User.setFubConnection(req.user.id, {
        encryptedKey: encrypted,
        identityId: identity.id,
        identityName: identity.name,
      });

      const user = await User.findById(req.user.id);
      res.json(statusPayload(user));
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/disconnect", auth, requireSubscription, async (req, res, next) => {
  try {
    await User.clearFubConnection(req.user.id);
    const user = await User.findById(req.user.id);
    res.json(statusPayload(user));
  } catch (err) {
    next(err);
  }
});

router.get("/preview", auth, requireSubscription, async (req, res, next) => {
  try {
    const apiKey = await getDecryptedKey(req.user.id);
    if (!apiKey) {
      return res.status(400).json({ error: { message: "Follow Up Boss isn't connected", code: "FUB_NOT_CONNECTED" } });
    }

    let page;
    try {
      page = await fubClient.listPeople(apiKey, { offset: 0, limit: PREVIEW_SIZE });
    } catch (fubErr) {
      return handleFubError(fubErr, res, "Could not preview FUB contacts");
    }

    const people = Array.isArray(page?.people) ? page.people : [];
    const total = Number(page?._metadata?.total ?? page?.total ?? people.length) || people.length;

    const mapped = people.map((person) => {
      const m = mapPersonToClient(person);
      return {
        fub_person_id: person?.id ?? null,
        ok: m.ok,
        reason: m.ok ? null : m.reason,
        client: m.ok
          ? {
              first_name: m.client.first_name,
              last_name: m.client.last_name,
              phone_number: m.client.phone_number,
              city: m.client.city,
              state: m.client.state,
            }
          : null,
      };
    });

    res.json({ total, sample_size: mapped.length, people: mapped });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/import",
  auth,
  requireSubscription,
  checkClientLimit,
  [
    body("limit").optional().isInt({ min: 1, max: HARD_IMPORT_CAP }).toInt(),
    body("default_closing_date").optional({ values: "falsy" }).isISO8601().withMessage("Valid default_closing_date required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const apiKey = await getDecryptedKey(req.user.id);
      if (!apiKey) {
        return res.status(400).json({ error: { message: "Follow Up Boss isn't connected", code: "FUB_NOT_CONNECTED" } });
      }

      const tier = req.user.subscription_tier;
      const limits = TIER_LIMITS[tier];
      const maxClients =
        tier === "team" || tier === "brokerage" ? limits.max_total_clients : limits.max_clients;
      const currentCount = await Client.countByAgent(req.user.id);
      const available =
        maxClients === Infinity ? Infinity : Math.max(0, maxClients - currentCount);

      const requested = req.body.limit ?? DEFAULT_IMPORT_CAP;
      const cap = Math.min(requested, HARD_IMPORT_CAP, available === Infinity ? requested : available);
      const defaultClosingDate = req.body.default_closing_date || null;

      const results = {
        requested,
        considered: 0,
        imported: 0,
        skipped_duplicates: 0,
        skipped_invalid: 0,
        errors: [],
      };

      let fubFetched = 0;

      try {
        await fubClient.iteratePeople(apiKey, {
          maxPeople: cap,
          pageSize: 100,
          onBatch: async ({ people }) => {
            for (const person of people) {
              results.considered++;
              fubFetched++;

              const mapped = mapPersonToClient(person, { defaultClosingDate });
              if (!mapped.ok) {
                results.skipped_invalid++;
                results.errors.push({
                  fub_person_id: person?.id ?? null,
                  reason: mapped.reason,
                });
                continue;
              }

              try {
                // Dedup first by FUB id (re-sync), then by phone (manual entry).
                const existingByFub = await Client.findByFubPersonId(req.user.id, mapped.fub_person_id);
                if (existingByFub) {
                  results.skipped_duplicates++;
                  continue;
                }
                const existingByPhone = await Client.findByPhone(mapped.client.phone_number, req.user.id);
                if (existingByPhone) {
                  results.skipped_duplicates++;
                  continue;
                }

                if (results.imported >= cap) {
                  // Tier cap reached mid-batch.
                  return;
                }

                const created = await Client.create({
                  ...mapped.client,
                  agent_id: req.user.id,
                  fub_person_id: mapped.fub_person_id,
                });
                await scheduleMessagesForClient(created, req.user);
                await scheduleRecurringMessages(created, req.user);
                results.imported++;
              } catch (rowErr) {
                results.errors.push({
                  fub_person_id: person?.id ?? null,
                  reason: rowErr.message,
                });
              }
            }
          },
        });
      } catch (fubErr) {
        // Record what we did import before bailing.
        if (results.imported > 0) {
          await User.recordFubSync(req.user.id, results.imported).catch(() => {});
        }
        return handleFubError(fubErr, res, "FUB import failed mid-run");
      }

      await User.recordFubSync(req.user.id, results.imported);

      res.json({
        ...results,
        fub_fetched: fubFetched,
        capped_by_tier: available !== Infinity && results.considered >= available,
      });
    } catch (err) {
      next(err);
    }
  }
);

void queryValidator;
module.exports = router;
