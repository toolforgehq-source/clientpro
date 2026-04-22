/**
 * Migration: onboarding tracking for the first-run wizard.
 *
 * - users.onboarding_completed_at (TIMESTAMPTZ, nullable) — null until the
 *   agent finishes (or explicitly skips) the onboarding wizard. Used to
 *   decide whether /dashboard redirects a brand-new agent to the wizard.
 *
 * Idempotent — safe to run multiple times.
 */
const { pool } = require("../config/database");
const logger = require("../utils/logger");

async function migrateOnboarding() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
    `);
    logger.info(
      "Migration: onboarding fields ensured (users.onboarding_completed_at)"
    );
  } catch (err) {
    logger.error("Onboarding migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrateOnboarding;
