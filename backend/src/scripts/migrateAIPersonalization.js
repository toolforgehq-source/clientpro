/**
 * Migration: add AI-personalization fields.
 *
 * - users.use_ai_personalization (BOOLEAN, default false) — per-agent opt-in
 *   for AI-generated SMS drafts. Defaults off so existing behaviour is
 *   completely unchanged for every current account.
 * - messages.ai_generated (BOOLEAN, default false) — marks which sent /
 *   scheduled messages were produced by the AI generator vs. the
 *   deterministic mail-merge. Used for dashboard badging and for future
 *   metrics on AI adoption / quality.
 *
 * Idempotent — safe to run multiple times.
 */
const { pool } = require("../config/database");
const logger = require("../utils/logger");

async function migrateAIPersonalization() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS use_ai_personalization BOOLEAN NOT NULL DEFAULT false;
    `);
    await client.query(`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false;
    `);
    logger.info(
      "Migration: AI personalization fields ensured (users.use_ai_personalization, messages.ai_generated)"
    );
  } catch (err) {
    logger.error("AI personalization migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrateAIPersonalization;
