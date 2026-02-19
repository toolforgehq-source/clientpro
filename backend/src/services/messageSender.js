const { getTwilioClient } = require("../config/twilio");
const Message = require("../models/Message");
const User = require("../models/User");
const logger = require("../utils/logger");

const sendMessage = async (message) => {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    logger.warn("Twilio not configured, skipping message send");
    await Message.markFailed(message.id, "Twilio not configured");
    return false;
  }

  try {
    await Message.markSending(message.id);

    const agent = await User.findById(message.agent_id);
    if (!agent || !agent.twilio_phone_number) {
      await Message.markFailed(message.id, "Agent has no Twilio number");
      return false;
    }

    const twilioMessage = await twilioClient.messages.create({
      from: agent.twilio_phone_number,
      to: message.client_phone,
      body: message.message_text,
    });

    await Message.markSent(message.id, twilioMessage.sid);
    logger.info(`Message ${message.id} sent via Twilio: ${twilioMessage.sid}`);
    return true;
  } catch (err) {
    logger.error(`Failed to send message ${message.id}:`, err.message);
    await Message.incrementRetry(message.id);

    const updated = await Message.findById(message.id);
    if (updated.retry_count >= 3) {
      await Message.markFailed(message.id, err.message);
    } else {
      await query(
        "UPDATE messages SET status = 'scheduled', updated_at = now() WHERE id = $1",
        [message.id]
      );
    }
    return false;
  }
};

const { query } = require("../config/database");

module.exports = { sendMessage };
