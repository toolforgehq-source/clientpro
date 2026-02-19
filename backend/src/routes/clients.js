const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const Client = require("../models/Client");
const Message = require("../models/Message");
const Referral = require("../models/Referral");
const auth = require("../middleware/auth");
const { checkClientLimit, TIER_LIMITS } = require("../middleware/validateTier");
const { scheduleMessagesForClient } = require("../services/messageScheduler");
const { validatePhone, validatePropertyType, validatePagination } = require("../utils/validation");
const logger = require("../utils/logger");

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  "/",
  auth,
  checkClientLimit,
  [
    body("first_name").trim().notEmpty().withMessage("First name required"),
    body("last_name").trim().notEmpty().withMessage("Last name required"),
    validatePhone(),
    body("closing_date").isISO8601().withMessage("Valid closing date required"),
    body("property_address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("zip").optional().trim(),
    validatePropertyType(),
    body("email").optional().isEmail().normalizeEmail(),
    body("notes").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const existing = await Client.findByPhone(req.body.phone_number, req.user.id);
      if (existing) {
        return res.status(409).json({ error: { message: "Client with this phone number already exists", code: "DUPLICATE_CLIENT" } });
      }

      const client = await Client.create({ ...req.body, agent_id: req.user.id });
      const scheduled = await scheduleMessagesForClient(client, req.user);

      res.status(201).json({ client, messages_scheduled: scheduled });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", auth, validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const result = await Client.findByAgentId(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const client = await Client.findByIdAndAgent(req.params.id, req.user.id);
    if (!client) {
      return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
    }

    const messages = await Message.findByAgent(req.user.id, { status: undefined, page: 1, limit: 100 });
    const clientMessages = messages.messages.filter((m) => m.client_id === client.id);

    const referrals = await Referral.findByAgent(req.user.id, { page: 1, limit: 100 });
    const clientReferrals = referrals.referrals.filter((r) => r.referred_by_client_id === client.id);

    res.json({ client, messages: clientMessages, referrals: clientReferrals });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  auth,
  [
    body("first_name").optional().trim().notEmpty(),
    body("last_name").optional().trim().notEmpty(),
    body("phone_number").optional().matches(/^\+1\d{10}$/),
    body("email").optional().isEmail().normalizeEmail(),
    body("property_address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
    body("zip").optional().trim(),
    validatePropertyType(),
    body("closing_date").optional().isISO8601(),
    body("notes").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const client = await Client.findByIdAndAgent(req.params.id, req.user.id);
      if (!client) {
        return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
      }

      const updated = await Client.update(req.params.id, req.body);
      res.json({ client: updated });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const client = await Client.findByIdAndAgent(req.params.id, req.user.id);
    if (!client) {
      return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
    }

    await Client.softDelete(req.params.id);
    await Message.cancelFutureForClient(req.params.id);

    res.json({ message: "Client removed and future messages cancelled" });
  } catch (err) {
    next(err);
  }
});

router.post("/import", auth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: "CSV file required", code: "NO_FILE" } });
    }

    const content = req.file.buffer.toString("utf-8");
    let records;
    try {
      records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
    } catch (parseErr) {
      return res.status(400).json({ error: { message: "Invalid CSV format", code: "INVALID_CSV" } });
    }

    const tier = req.user.subscription_tier;
    const limits = TIER_LIMITS[tier];
    let maxClients = (tier === "team" || tier === "brokerage") ? limits.max_total_clients : limits.max_clients;
    const currentCount = await Client.countByAgent(req.user.id);
    const available = maxClients === Infinity ? Infinity : maxClients - currentCount;

    const results = { success_count: 0, error_count: 0, errors: [] };
    const phoneRegex = /^\+1\d{10}$/;

    for (let i = 0; i < records.length; i++) {
      if (results.success_count >= available) {
        results.errors.push({ row: i + 1, error: "Client limit reached" });
        results.error_count++;
        continue;
      }

      const row = records[i];
      if (!row.first_name || !row.last_name || !row.phone_number || !row.closing_date) {
        results.errors.push({ row: i + 1, error: "Missing required fields (first_name, last_name, phone_number, closing_date)" });
        results.error_count++;
        continue;
      }

      if (!phoneRegex.test(row.phone_number)) {
        results.errors.push({ row: i + 1, error: "Invalid phone format (must be +1XXXXXXXXXX)" });
        results.error_count++;
        continue;
      }

      try {
        const existing = await Client.findByPhone(row.phone_number, req.user.id);
        if (existing) {
          results.errors.push({ row: i + 1, error: "Duplicate phone number" });
          results.error_count++;
          continue;
        }

        const client = await Client.create({
          agent_id: req.user.id,
          first_name: row.first_name,
          last_name: row.last_name,
          phone_number: row.phone_number,
          closing_date: row.closing_date,
          property_address: row.property_address || null,
          city: row.city || null,
          state: row.state || null,
          zip: row.zip || null,
          property_type: row.property_type || null,
          email: row.email || null,
          notes: row.notes || null,
        });

        await scheduleMessagesForClient(client, req.user);
        results.success_count++;
      } catch (err) {
        results.errors.push({ row: i + 1, error: err.message });
        results.error_count++;
      }
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
