/**
 * Migration: Follow Up Boss read-only integration fields.
 *
 * - users.fub_api_key_encrypted (TEXT, nullable) — per-agent FUB API key stored
 *   AES-256-GCM encrypted at rest. Encryption key is derived from env
 *   FUB_KEY_ENCRYPTION_SECRET (falls back to JWT_SECRET). Never returned by
 *   any API; only decrypted server-side when calling the FUB API.
 * - users.fub_identity_id (BIGINT, nullable) — the FUB identity account id
 *   returned by GET /v1/identity; used for display ("Connected as ...").
 * - users.fub_identity_name (TEXT, nullable) — display name of the connected
 *   FUB account.
 * - users.fub_last_sync_at (TIMESTAMPTZ, nullable) — last successful import.
 * - users.fub_last_sync_count (INTEGER, nullable) — number of contacts
 *   imported in the most recent sync.
 * - clients.fub_person_id (BIGINT, nullable) — FUB's id for the imported
 *   person, used to dedupe on re-sync.
 * - UNIQUE(agent_id, fub_person_id) partial index on clients — per-agent
 *   dedup without blocking manually-entered clients (which have fub_person_id
 *   NULL).
 *
 * Idempotent — safe to run multiple times.
 */
const { pool } = require("../config/database");
const logger = require("../utils/logger");

async function migrateFubIntegration() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS fub_api_key_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS fub_identity_id BIGINT,
      ADD COLUMN IF NOT EXISTS fub_identity_name TEXT,
      ADD COLUMN IF NOT EXISTS fub_last_sync_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS fub_last_sync_count INTEGER;
    `);
    await client.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS fub_person_id BIGINT;
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_agent_fub_person
        ON clients (agent_id, fub_person_id)
        WHERE fub_person_id IS NOT NULL;
    `);
    logger.info(
      "Migration: FUB integration fields ensured (users.fub_*, clients.fub_person_id)"
    );
  } catch (err) {
    logger.error("FUB integration migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrateFubIntegration;
