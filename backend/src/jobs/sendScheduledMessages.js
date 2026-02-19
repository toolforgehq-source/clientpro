const Message = require("../models/Message");
const { sendMessage } = require("../services/messageSender");
const logger = require("../utils/logger");

const sendScheduledMessages = async () => {
  logger.info("Running scheduled message job...");

  try {
    const messages = await Message.findScheduledDue();
    logger.info(`Found ${messages.length} messages to send`);

    let sent = 0;
    let failed = 0;

    for (const message of messages) {
      const success = await sendMessage(message);
      if (success) sent++;
      else failed++;
    }

    logger.info(`Scheduled message job complete: ${sent} sent, ${failed} failed`);
  } catch (err) {
    logger.error("Scheduled message job error:", err.message);
  }
};

module.exports = sendScheduledMessages;
