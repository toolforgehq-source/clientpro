const { query } = require("../config/database");
const Message = require("../models/Message");
const { personalizeMessage } = require("./messagePersonalizer");
const logger = require("../utils/logger");

const scheduleMessagesForClient = async (client, agent) => {
  const templates = await query(
    "SELECT * FROM templates WHERE is_active = true ORDER BY trigger_days_after_closing ASC"
  );

  // Fetch existing scheduled/sent messages for this client to avoid duplicates
  const existing = await query(
    `SELECT scheduled_for::date AS sched_date FROM messages
     WHERE client_id = $1 AND status NOT IN ('cancelled', 'failed')`,
    [client.id]
  );
  const existingDates = new Set(
    existing.rows.map((r) => new Date(r.sched_date).toISOString().split("T")[0])
  );

  let scheduled = 0;
  const closingDate = new Date(client.closing_date);

  for (const template of templates.rows) {
    const scheduledFor = new Date(closingDate);
    scheduledFor.setDate(scheduledFor.getDate() + template.trigger_days_after_closing);

    if (scheduledFor <= new Date()) {
      continue;
    }

    // Skip if a message already exists for this date (idempotent)
    const dateKey = scheduledFor.toISOString().split("T")[0];
    if (existingDates.has(dateKey)) {
      continue;
    }

    const messageText = personalizeMessage(template.message_template, client, agent);

    await Message.create({
      client_id: client.id,
      agent_id: agent.id,
      message_text: messageText,
      scheduled_for: scheduledFor.toISOString(),
    });

    existingDates.add(dateKey);
    scheduled++;
  }

  logger.info(`Scheduled ${scheduled} messages for client ${client.id}`);
  return scheduled;
};

/**
 * Backfill scheduled messages for all active clients.
 * Called after template migrations to ensure existing clients
 * get messages for any newly added templates.
 */
const backfillMessagesForAllClients = async () => {
  const clients = await query(
    `SELECT c.*, u.id AS agent_user_id, u.first_name AS agent_first_name,
            u.last_name AS agent_last_name, u.company_name AS agent_company_name
     FROM clients c
     JOIN users u ON u.id = c.agent_id
     WHERE c.is_active = true AND u.is_active = true AND u.subscription_status = 'active'`
  );

  let totalScheduled = 0;

  for (const row of clients.rows) {
    const client = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      phone_number: row.phone_number,
      city: row.city,
      state: row.state,
      property_type: row.property_type,
      closing_date: row.closing_date,
    };

    const agent = {
      id: row.agent_user_id,
      first_name: row.agent_first_name,
      last_name: row.agent_last_name,
      company_name: row.agent_company_name,
    };

    const scheduled = await scheduleMessagesForClient(client, agent);
    totalScheduled += scheduled;
  }

  logger.info(`Backfill complete: ${totalScheduled} new messages scheduled for ${clients.rows.length} active clients`);
  return totalScheduled;
};

module.exports = { scheduleMessagesForClient, backfillMessagesForAllClients };
