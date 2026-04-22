/**
 * Minimal Follow Up Boss API client for read-only contact sync.
 *
 * FUB auth: HTTP Basic with the API key as the username and an empty
 * password. See https://docs.followupboss.com/reference/authentication.
 *
 * We send X-System / X-System-Key identification headers when
 * FUB_SYSTEM_NAME / FUB_SYSTEM_KEY are configured, per FUB's registered-system
 * guidance. Both are optional at runtime; missing values just mean the
 * request goes out un-identified (still works for basic reads).
 *
 * This module never logs the API key and never returns it out of the
 * functions — callers pass the key in, the network call uses it, nothing
 * else sees it.
 */
const logger = require("../utils/logger");

const BASE_URL = "https://api.followupboss.com/v1";

function buildAuthHeader(apiKey) {
  const token = Buffer.from(`${apiKey}:`, "utf8").toString("base64");
  return `Basic ${token}`;
}

function buildHeaders(apiKey) {
  const headers = {
    Accept: "application/json",
    Authorization: buildAuthHeader(apiKey),
  };
  if (process.env.FUB_SYSTEM_NAME) {
    headers["X-System"] = process.env.FUB_SYSTEM_NAME;
  }
  if (process.env.FUB_SYSTEM_KEY) {
    headers["X-System-Key"] = process.env.FUB_SYSTEM_KEY;
  }
  return headers;
}

async function fubFetch(apiKey, path, { method = "GET", query = null, timeoutMs = 15000 } = {}) {
  if (!apiKey) {
    const err = new Error("Missing FUB API key");
    err.code = "FUB_MISSING_KEY";
    throw err;
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(apiKey),
      signal: controller.signal,
    });
  } catch (netErr) {
    const err = new Error(`FUB network error: ${netErr.message}`);
    err.code = "FUB_NETWORK";
    err.cause = netErr;
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const bodyText = await response.text();
  let body = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { raw: bodyText };
    }
  }

  if (!response.ok) {
    const err = new Error(
      body?.errorMessage || body?.message || `FUB HTTP ${response.status}`
    );
    err.status = response.status;
    err.code =
      response.status === 401 || response.status === 403
        ? "FUB_UNAUTHORIZED"
        : response.status === 429
        ? "FUB_RATE_LIMITED"
        : "FUB_HTTP_ERROR";
    err.retryAfterSeconds = response.status === 429
      ? parseInt(response.headers.get("retry-after") || "0", 10) || null
      : null;
    throw err;
  }

  return body;
}

/**
 * Calls GET /v1/identity. Used to validate the API key and grab the
 * connected account's display name / id for UI.
 *
 * Returns { id, name } — both are best-effort since FUB's identity
 * response shape can vary by account type (user vs team). If we can't find
 * a name, we return { id, name: null } and the UI falls back to "Connected".
 */
async function getIdentity(apiKey) {
  const raw = await fubFetch(apiKey, "/identity");
  const id = raw?.id ?? raw?.accountId ?? raw?.account?.id ?? null;
  const name =
    raw?.name ||
    raw?.account?.name ||
    [raw?.firstName, raw?.lastName].filter(Boolean).join(" ").trim() ||
    null;
  return { id: id == null ? null : Number(id), name: name || null, raw };
}

/**
 * Calls GET /v1/people with pagination. Returns the raw FUB response so the
 * caller can decide what to persist.
 */
async function listPeople(apiKey, { offset = 0, limit = 100, sort = "created" } = {}) {
  return fubFetch(apiKey, "/people", {
    query: { offset, limit, sort },
  });
}

/**
 * Paginates through GET /v1/people up to `maxPeople` results. Yields batches
 * via `onBatch({ people, fetched, total })`. Stops when we've hit maxPeople
 * or when FUB returns fewer than `pageSize` results (end of list).
 *
 * Uses a polite 250ms delay between pages. FUB's global rate limit is
 * 200 req / 10s, so this is well under even a dozen parallel users.
 */
async function iteratePeople(apiKey, { maxPeople = 1000, pageSize = 100, onBatch } = {}) {
  let offset = 0;
  let fetched = 0;
  let total = null;

  while (fetched < maxPeople) {
    const pageLimit = Math.min(pageSize, maxPeople - fetched);
    const page = await listPeople(apiKey, { offset, limit: pageLimit });
    const raw = Array.isArray(page?.people) ? page.people : [];
    if (total === null) {
      total = Number(page?._metadata?.total ?? page?.total ?? raw.length) || raw.length;
    }

    if (raw.length === 0) break;

    // Defensive cap in case FUB returns more than we asked for or more than
    // the caller's max. Keeps onBatch honest and bounds the work.
    const people = raw.slice(0, pageLimit);

    if (typeof onBatch === "function") {
      await onBatch({ people, fetched, total });
    }

    fetched += people.length;
    offset += people.length;

    if (raw.length < pageLimit) break;

    // Be polite to FUB's rate limiter.
    await new Promise((r) => setTimeout(r, 250));
  }

  return { fetched, total: total ?? fetched };
}

module.exports = {
  getIdentity,
  listPeople,
  iteratePeople,
  // exported for testing
  _internal: { fubFetch, buildAuthHeader, buildHeaders, BASE_URL },
};

// Keep the linter happy about unused logger if we later add warn paths.
void logger;
