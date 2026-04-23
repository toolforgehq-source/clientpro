const User = require("../models/User");
const Client = require("../models/Client");
const Message = require("../models/Message");
const { getTwilioClient } = require("../config/twilio");
const { sendReplyNotificationEmail } = require("./emailService");
const { notifyNewReply } = require("./pushService");
const { classifyReply } = require("./replyIntentClassifier");
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
  if (STOP_KEYWORDS.some((kw) => bodyLower.includes(kw))) {
    await Client.softDelete(client.id);
    await Message.cancelFutureForClient(client.id);
    logger.info(`Client ${client.id} opted out (STOP)`);
    return;
  }

  const recentMessage = await Message.findRecentSentToClient(client.id);
  let repliedMessageId = null;
  if (recentMessage) {
    const replied = await Message.markReplied(recentMessage.id, Body);
    repliedMessageId = replied?.id || recentMessage.id;
  }

  const newScore = Math.min(100, (client.engagement_score || 50) + 10);
  await Client.updateEngagementScore(client.id, newScore);

  // Classify the reply so the agent inbox can prioritize it. We never let
  // classification failures break the webhook — `classifyReply` itself
  // never throws, but wrap the save path in try/catch anyway.
  if (repliedMessageId) {
    try {
      const lastAgentMessage = recentMessage?.message_text || null;
      const classification = await classifyReply({
        replyText: Body,
        client,
        agent,
        lastAgentMessage,
      });
      await Message.saveReplyClassification(repliedMessageId, {
        intent: classification.intent,
        confidence: classification.confidence,
        reason: classification.reason,
        draftReply: classification.draft_reply,
      });
      logger.info(
        `Reply ${repliedMessageId} classified as ${classification.intent} (${classification.ai_used ? "ai" : "heuristic"})`
      );
    } catch (classifyErr) {
      logger.error(`Reply classification persist failed for ${repliedMessageId}:`, classifyErr.message);
    }
  }

  const twilioClient = getTwilioClient();
  if (twilioClient && agent.phone_number) {
    try {
      await twilioClient.messages.create({
        from: To,
        to: agent.phone_number,
        body: `[ClientPro] ${client.first_name} ${client.last_name}: ${Body}`,
      });
      logger.info(`Forwarded SMS to agent ${agent.id} at ${agent.phone_number}`);
    } catch (fwdErr) {
      logger.error(`Failed to forward SMS to agent ${agent.id}:`, fwdErr.message);
    }
  }

  await sendReplyNotificationEmail(
    agent.email,
    agent.first_name,
    `${client.first_name} ${client.last_name}`,
    Body
  );

  // Send push notification to agent's devices
  try {
    await notifyNewReply(
      agent.id,
      `${client.first_name} ${client.last_name}`,
      Body
    );
  } catch (pushErr) {
    logger.error(`Push notification failed for agent ${agent.id}:`, pushErr.message);
  }

  logger.info(`Reply processed for client ${client.id}, agent ${agent.id}`);
};

module.exports = { handleIncomingSMS };
