/**
 * Migration: Update message templates from 5 to 12 over 5 years.
 *
 * Replaces the original 5 templates with 12 templates that provide
 * consistent touchpoints every 2-3 months in year one, then milestone
 * anniversaries through year 5.
 *
 * Safe to run multiple times (idempotent) — checks if migration already ran.
 */
const { pool } = require("../config/database");
const logger = require("../utils/logger");

const newTemplates = [
  { name: "Week 1 Welcome", days: 7, template: "Hey {{first_name}}! Hope you're settling into {{city}} well! Let me know if you need anything. 🏡" },
  { name: "Month 1 Neighborhood", days: 30, template: "Hi {{first_name}}! How's the neighborhood treating you? Found any favorite local spots in {{city}} yet?" },
  { name: "Month 3 Check-in", days: 90, template: "How's the {{property_type}} treating you, {{first_name}}? Any questions about the neighborhood?" },
  { name: "Month 6 Market Update", days: 180, template: "Quick update {{first_name}}: Homes in {{city}} are performing well! Your investment is looking good. 📈" },
  { name: "Month 9 Referral Nudge", days: 270, template: "Hey {{first_name}}! Just thinking about you. If any friends or family are looking to buy or sell in {{city}}, I'd love to help them out!" },
  { name: "Year 1 Anniversary", days: 365, template: "Happy house-iversary {{first_name}}! 🎉 Can you believe it's been a year? Hope you're loving {{city}}!" },
  { name: "Month 15 Check-in", days: 450, template: "Hey {{first_name}}, just checking in! How's everything going with the {{property_type}}? Hope {{city}} is treating you well." },
  { name: "Month 18 Market Update", days: 540, template: "Hi {{first_name}}! Quick market update: {{city}} real estate is staying strong. Great news for your investment! Let me know if you ever have questions." },
  { name: "Year 2 Anniversary", days: 730, template: "Two years already, {{first_name}}! 🎉 Hope you're still loving {{city}}. Let me know if you or anyone you know needs help with real estate." },
  { name: "Month 30 Check-in", days: 900, template: "Hey {{first_name}}! It's been a while — just wanted to say hi and see how things are going in {{city}}. Always here if you need anything!" },
  { name: "Year 3 Anniversary", days: 1095, template: "Happy 3-year house-iversary {{first_name}}! 🏡 Time flies! Hope {{city}} still feels like home. Let me know if I can ever help." },
  { name: "Year 5 Milestone", days: 1825, template: "Wow {{first_name}}, 5 years in {{city}}! That's a real milestone. 🎉 Hope you're loving it. If you ever think about your next move, I'm always here for you." },
];

async function migrateTemplates() {
  const client = await pool.connect();
  try {
    // Check if migration already ran (12 templates exist)
    const { rows } = await client.query("SELECT COUNT(*) AS count FROM templates");
    const count = parseInt(rows[0].count, 10);

    if (count >= 12) {
      logger.info("Migration: templates already up to date (found " + count + ")");
      return;
    }

    await client.query("BEGIN");

    // Delete old templates (safe — these are system defaults, not user-customized)
    await client.query("DELETE FROM templates");

    // Insert all 12 new templates
    for (const t of newTemplates) {
      await client.query(
        "INSERT INTO templates (name, trigger_days_after_closing, message_template) VALUES ($1, $2, $3)",
        [t.name, t.days, t.template]
      );
    }

    await client.query("COMMIT");
    logger.info("Migration: templates updated to 12-message cadence over 5 years");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Template migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrateTemplates;
