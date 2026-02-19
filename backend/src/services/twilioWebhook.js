const User = require("../models/User");
const Client = require("../models/Client");
const Message = require("../models/Message");
const { sendReplyNotificationEmail } = require("./emailService");
const logger = require("../utils/logger");

const STOP_KEYWORDS = ["stop", "unsubscribe", "cancel", "quit", "end"];

const handleIncomingSMS = async ({ From, To, Body, MessageSid }) => {
  logger.info(`Incoming SMS from ${From} to ${To}: ${Body}`);

  const agent = await User.findByTwilioNumber(To);
  if (!agent) {
    logger.warn(`No agent found for Twilio number ${To}`);
    return;
  }

  const clients = await Client.findByPhoneGlobal(From);
  const client = clients.find((c) => c.agent_id === agent.id);
  if (!client) {
    logger.warn(`No client found with phone ${From} for agent ${agent.id}`);
    return;
  }

  const bodyLower = Body.trim().toLowerCase();
  if (STOP_KEYWORDS.some((kw) => bodyLower === kw)) {
    await Client.softDelete(client.id);
    await Message.cancelFutureForClient(client.id);
    logger.info(`Client ${client.id} opted out (STOP)`);
    return;
  }

  const recentMessage = await Message.findRecentSentToClient(client.id);
  if (recentMessage) {
    await Message.markReplied(recentMessage.id, Body);
  }

  const newScore = Math.min(100, (client.engagement_score || 50) + 10);
  await Client.updateEngagementScore(client.id, newScore);

  await sendReplyNotificationEmail(
    agent.email,
    agent.first_name,
    `${client.first_name} ${client.last_name}`,
    Body
  );

  logger.info(`Reply processed for client ${client.id}, agent ${agent.id}`);
};

module.exports = { handleIncomingSMS };
