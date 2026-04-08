/**
 * Migration: Add birthday, anniversary_date, and spouse_name columns to clients table.
 *
 * These optional fields allow agents to personalize messages with
 * birthday greetings, anniversary wishes, and spouse references.
 *
 * Safe to run multiple times (idempotent) — uses IF NOT EXISTS.
 */
const { pool } = require("../config/database");
const logger = require("../utils/logger");

async function migrateClientFields() {
  const client = await pool.connect();
  try {
    // Add columns if they don't already exist (idempotent)
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS birthday DATE;
    `);
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS anniversary_date DATE;
    `);
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS spouse_name TEXT;
    `);

    logger.info("Migration: client personalization fields (birthday, anniversary_date, spouse_name) ensured");
  } catch (err) {
    logger.error("Client fields migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrateClientFields;
