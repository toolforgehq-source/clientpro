/**
 * Migration: Update database CHECK constraints for subscription_tier and subscription_status.
 *
 * - Adds 'solo' to subscription_tier allowed values
 * - Adds 'pending' to subscription_status allowed values
 * - Changes subscription_status default from 'active' to 'pending'
 *
 * Safe to run multiple times (idempotent).
 */
const { pool } = require("../config/database");
const logger = require("../utils/logger");

async function migrateConstraints() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Drop and recreate subscription_tier constraint to include 'solo'
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
    `);
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check
        CHECK (subscription_tier IN ('solo', 'starter', 'professional', 'elite', 'team', 'brokerage'));
    `);

    // Drop and recreate subscription_status constraint to include 'pending'
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;
    `);
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_subscription_status_check
        CHECK (subscription_status IN ('pending', 'active', 'past_due', 'cancelled'));
    `);

    // Update default for subscription_status to 'pending'
    await client.query(`
      ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'pending';
    `);

    await client.query("COMMIT");
    logger.info("Migration: subscription constraints updated successfully (solo tier + pending status)");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrateConstraints;
