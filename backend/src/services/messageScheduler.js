const { query } = require("../config/database");
const Message = require("../models/Message");
const { personalizeMessage } = require("./messagePersonalizer");
const logger = require("../utils/logger");

const scheduleMessagesForClient = async (client, agent) => {
  const templates = await query(
    "SELECT * FROM templates WHERE is_active = true ORDER BY trigger_days_after_closing ASC"
  );

  let scheduled = 0;
  const closingDate = new Date(client.closing_date);

  for (const template of templates.rows) {
    const scheduledFor = new Date(closingDate);
    scheduledFor.setDate(scheduledFor.getDate() + template.trigger_days_after_closing);

    if (scheduledFor <= new Date()) {
      continue;
    }

    const messageText = personalizeMessage(template.message_template, client, agent);

    await Message.create({
      client_id: client.id,
      agent_id: agent.id,
      message_text: messageText,
      scheduled_for: scheduledFor.toISOString(),
    });

    scheduled++;
  }

  logger.info(`Scheduled ${scheduled} messages for client ${client.id}`);
  return scheduled;
};

module.exports = { scheduleMessagesForClient };
