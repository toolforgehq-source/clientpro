const { query } = require("../config/database");
const logger = require("../utils/logger");

/**
 * Idempotent migration: add reply-intent classification columns to messages.
 * Safe to run repeatedly and at every boot.
 */
async function migrateReplyIntent() {
  try {
    await query(`
      ALTER TABLE messages
        ADD COLUMN IF NOT EXISTS reply_intent TEXT,
        ADD COLUMN IF NOT EXISTS reply_intent_confidence REAL,
        ADD COLUMN IF NOT EXISTS reply_intent_reason TEXT,
        ADD COLUMN IF NOT EXISTS reply_draft_response TEXT,
        ADD COLUMN IF NOT EXISTS reply_classified_at TIMESTAMPTZ
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_reply_intent
        ON messages (agent_id, reply_intent)
        WHERE status = 'replied'
    `);

    logger.info("Reply-intent migration applied (or already up to date)");
  } catch (err) {
    logger.error("Reply-intent migration failed:", err.message);
    throw err;
  }
}

module.exports = migrateReplyIntent;
