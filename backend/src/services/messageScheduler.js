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

/**
 * Birthday message templates — one per year for 10 years.
 */
const BIRTHDAY_TEMPLATES = [
  "Happy birthday, {{first_name}}! 🎂 Hope you have an amazing day! — {{agent_name}}",
  "Happy birthday, {{first_name}}! 🎉 Wishing you a wonderful year ahead! — {{agent_name}}",
  "Hey {{first_name}}, happy birthday! 🎂 Hope it's a great one! — {{agent_name}}",
];

/**
 * Anniversary message templates.
 */
const ANNIVERSARY_TEMPLATES = [
  "Happy anniversary, {{first_name}} & {{spouse_name}}! 💍 Wishing you both a wonderful celebration! — {{agent_name}}",
  "Happy anniversary, {{first_name}}! 🥂 Hope you and {{spouse_name}} have a beautiful day! — {{agent_name}}",
  "Hey {{first_name}}, happy anniversary to you and {{spouse_name}}! 💍 Enjoy the special day! — {{agent_name}}",
];

/**
 * Schedule recurring birthday and/or anniversary messages for a client.
 * Creates one message per year for the next 10 years on the appropriate date.
 * Idempotent — skips dates that already have a scheduled message.
 */
const scheduleRecurringMessages = async (client, agent) => {
  if (!client.birthday && !client.anniversary_date) return 0;

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
  const now = new Date();
  const currentYear = now.getFullYear();

  const datesToSchedule = [];

  if (client.birthday) {
    const bday = new Date(client.birthday);
    for (let y = 0; y < 10; y++) {
      const year = currentYear + y;
      const scheduledFor = new Date(year, bday.getMonth(), bday.getDate(), 9, 0, 0);
      if (scheduledFor > now) {
        const templateText = BIRTHDAY_TEMPLATES[y % BIRTHDAY_TEMPLATES.length];
        datesToSchedule.push({ date: scheduledFor, template: templateText });
      }
    }
  }

  if (client.anniversary_date) {
    const anniv = new Date(client.anniversary_date);
    for (let y = 0; y < 10; y++) {
      const year = currentYear + y;
      const scheduledFor = new Date(year, anniv.getMonth(), anniv.getDate(), 9, 0, 0);
      if (scheduledFor > now) {
        const templateText = ANNIVERSARY_TEMPLATES[y % ANNIVERSARY_TEMPLATES.length];
        datesToSchedule.push({ date: scheduledFor, template: templateText });
      }
    }
  }

  for (const { date, template } of datesToSchedule) {
    const dateKey = date.toISOString().split("T")[0];
    if (existingDates.has(dateKey)) continue;

    const messageText = personalizeMessage(template, client, agent);

    await Message.create({
      client_id: client.id,
      agent_id: agent.id,
      message_text: messageText,
      scheduled_for: date.toISOString(),
    });

    existingDates.add(dateKey);
    scheduled++;
  }

  logger.info(`Scheduled ${scheduled} recurring messages for client ${client.id}`);
  return scheduled;
};

module.exports = { scheduleMessagesForClient, backfillMessagesForAllClients, scheduleRecurringMessages };
