const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const Message = require("../models/Message");
const Client = require("../models/Client");
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireSubscription = require("../middleware/requireSubscription");
const { validatePagination } = require("../utils/validation");
const { getTwilioClient } = require("../config/twilio");
const { generateAIMessage } = require("../services/aiMessageGenerator");
const { getMarketContext } = require("../services/marketContextProvider");
const { personalizeMessage } = require("../services/messagePersonalizer");
const { classifyReply, INTENTS } = require("../services/replyIntentClassifier");
const logger = require("../utils/logger");

const router = Router();

// Send a custom message to one, multiple, or all clients
router.post(
  "/custom",
  auth,
  requireSubscription,
  [
    body("message_text").trim().notEmpty().withMessage("Message text is required").isLength({ max: 320 }).withMessage("Message text must be 320 characters or less"),
    body("client_ids").optional().isArray().withMessage("client_ids must be an array"),
    body("send_to_all").optional().isBoolean().withMessage("send_to_all must be a boolean"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const { message_text, client_ids, send_to_all } = req.body;

      if (!send_to_all && (!client_ids || client_ids.length === 0)) {
        return res.status(400).json({ error: { message: "Select at least one client or send to all", code: "NO_RECIPIENTS" } });
      }

      let clients;
      if (send_to_all) {
        clients = await Client.findActiveByAgent(req.user.id);
      } else {
        clients = await Client.findByIdsAndAgent(client_ids, req.user.id);
        if (clients.length === 0) {
          return res.status(400).json({ error: { message: "No valid clients found", code: "NO_VALID_CLIENTS" } });
        }
      }

      if (clients.length === 0) {
        return res.status(400).json({ error: { message: "No active clients to message", code: "NO_CLIENTS" } });
      }

      // Schedule messages for immediate delivery (next cron tick)
      const scheduledFor = new Date().toISOString();
      let created = 0;

      for (const client of clients) {
        await Message.create({
          client_id: client.id,
          agent_id: req.user.id,
          message_text,
          scheduled_for: scheduledFor,
        });
        created++;
      }

      logger.info(`Agent ${req.user.id} sent custom message to ${created} client(s)`);
      res.status(201).json({ message: `Custom message scheduled for ${created} client(s)`, count: created });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", auth, requireSubscription, validatePagination, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const result = await Message.findByAgent(req.user.id, {
      status: status || undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/upcoming", auth, requireSubscription, async (req, res, next) => {
  try {
    const messages = await Message.findUpcoming(req.user.id, 30);

    const grouped = {};
    for (const msg of messages) {
      const weekStart = new Date(msg.scheduled_for);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(msg);
    }

    res.json({ upcoming: grouped, total: messages.length });
  } catch (err) {
    next(err);
  }
});

router.get("/replies", auth, requireSubscription, async (req, res, next) => {
  try {
    const { intent } = req.query;
    const requestedIntent = typeof intent === "string" && INTENTS.includes(intent) ? intent : null;
    const all = await Message.findAllReplies(req.user.id);
    const replies = requestedIntent
      ? all.filter((m) => m.reply_intent === requestedIntent)
      : all;

    const counts = { total: all.length };
    for (const id of INTENTS) counts[id] = 0;
    counts.unclassified = 0;
    for (const m of all) {
      if (m.reply_intent && counts[m.reply_intent] !== undefined) counts[m.reply_intent]++;
      else counts.unclassified++;
    }

    res.json({
      replies,
      total: replies.length,
      counts,
      intents: INTENTS,
      filter: requestedIntent,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/reply/:messageId/reclassify", auth, requireSubscription, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message || message.agent_id !== req.user.id) {
      return res.status(404).json({ error: { message: "Message not found", code: "NOT_FOUND" } });
    }
    if (message.status !== "replied" || !message.reply_text) {
      return res.status(400).json({ error: { message: "Message has no reply to classify", code: "NO_REPLY" } });
    }

    const [client, agent] = await Promise.all([
      Client.findByIdAndAgent(message.client_id, req.user.id),
      User.findById(req.user.id),
    ]);

    const classification = await classifyReply({
      replyText: message.reply_text,
      client,
      agent,
      lastAgentMessage: message.message_text,
    });

    const updated = await Message.saveReplyClassification(message.id, {
      intent: classification.intent,
      confidence: classification.confidence,
      reason: classification.reason,
      draftReply: classification.draft_reply,
    });

    res.json({
      message: updated,
      classification: {
        intent: classification.intent,
        confidence: classification.confidence,
        reason: classification.reason,
        draft_reply: classification.draft_reply,
        ai_used: classification.ai_used,
        model: classification.model,
        fallback_reason: classification.fallback_reason,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/conversation/:clientId", auth, requireSubscription, async (req, res, next) => {
  try {
    const client = await Client.findByIdAndAgent(req.params.clientId, req.user.id);
    if (!client) {
      return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
    }

    const messages = await Message.findConversation(req.params.clientId, req.user.id);

    // Batch mark all unread replies in this conversation as read
    await Message.markConversationRead(req.params.clientId, req.user.id);

    res.json({
      client: {
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        phone_number: client.phone_number,
      },
      messages,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/reply",
  auth,
  requireSubscription,
  [
    body("client_id").trim().notEmpty().withMessage("Client ID is required"),
    body("message_text").trim().notEmpty().withMessage("Message text is required").isLength({ max: 320 }).withMessage("Message text must be 320 characters or less"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const { client_id, message_text } = req.body;

      const client = await Client.findByIdAndAgent(client_id, req.user.id);
      if (!client) {
        return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
      }

      const agent = await User.findById(req.user.id);
      if (!agent || agent.subscription_status !== "active") {
        return res.status(403).json({ error: { message: "Active subscription required to send replies", code: "SUBSCRIPTION_INACTIVE" } });
      }

      if (!agent.twilio_phone_number) {
        return res.status(400).json({ error: { message: "No Twilio phone number configured. Please set up your phone number in Settings.", code: "NO_TWILIO" } });
      }

      const twilioClient = getTwilioClient();
      if (!twilioClient) {
        return res.status(500).json({ error: { message: "SMS service not available", code: "TWILIO_UNAVAILABLE" } });
      }

      const twilioMessage = await twilioClient.messages.create({
        from: agent.twilio_phone_number,
        to: client.phone_number,
        body: message_text,
      });

      const message = await Message.createSentReply({
        client_id,
        agent_id: req.user.id,
        message_text,
        twilio_message_sid: twilioMessage.sid,
      });

      logger.info(`Agent ${req.user.id} sent reply to client ${client_id}: ${twilioMessage.sid}`);
      res.status(201).json({ message });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  auth,
  requireSubscription,
  [body("message_text").trim().notEmpty().withMessage("Message text required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const message = await Message.findById(req.params.id);
      if (!message || message.agent_id !== req.user.id) {
        return res.status(404).json({ error: { message: "Message not found", code: "NOT_FOUND" } });
      }

      if (message.status !== "scheduled") {
        return res.status(400).json({ error: { message: "Can only edit scheduled messages", code: "NOT_EDITABLE" } });
      }

      // Manual edits mark the message as not AI-generated — the agent's wording wins.
      const updated = await Message.updateText(req.params.id, req.body.message_text, {
        aiGenerated: false,
      });
      res.json({ message: updated });
    } catch (err) {
      next(err);
    }
  }
);

// Preview an AI-personalized draft for an arbitrary (client, template) pair
// without saving anything. Used by the dashboard's "Preview with AI" button
// and by the onboarding wizard's first-message preview.
router.post(
  "/preview-ai",
  auth,
  requireSubscription,
  [
    body("client_id").trim().notEmpty().withMessage("client_id is required"),
    body("template_text").optional().isString(),
    body("template_name").optional().isString(),
    body("trigger_days_after_closing").optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const { client_id, template_text, template_name, trigger_days_after_closing } = req.body;

      const client = await Client.findByIdAndAgent(client_id, req.user.id);
      if (!client) {
        return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
      }

      const agent = await User.findById(req.user.id);
      if (!agent) {
        return res.status(404).json({ error: { message: "Agent not found", code: "NOT_FOUND" } });
      }

      const fallbackTemplate =
        "Hey {{first_name}}! Checking in — hope you're doing well in {{city}}. Let me know if you or anyone in your circle is thinking about real estate.";
      const template = {
        name: template_name || "Preview",
        trigger_days_after_closing: Number.isFinite(trigger_days_after_closing)
          ? trigger_days_after_closing
          : 0,
        message_template: template_text && template_text.trim() ? template_text : fallbackTemplate,
      };

      const marketContext = getMarketContext(client);
      const result = await generateAIMessage({ template, client, agent, marketContext });
      const mailMergePreview = personalizeMessage(template.message_template, client, agent);

      res.json({
        preview: result.text,
        mail_merge_preview: mailMergePreview,
        ai_generated: result.ai_generated,
        model: result.model,
        fallback_reason: result.fallback_reason,
        market_context: marketContext,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Regenerate an existing scheduled message using AI + market context and
// save the new text in-place. Returns the updated message.
router.post("/:id/regenerate-ai", auth, requireSubscription, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || message.agent_id !== req.user.id) {
      return res.status(404).json({ error: { message: "Message not found", code: "NOT_FOUND" } });
    }

    if (message.status !== "scheduled") {
      return res.status(400).json({ error: { message: "Can only regenerate scheduled messages", code: "NOT_EDITABLE" } });
    }

    const client = await Client.findByIdAndAgent(message.client_id, req.user.id);
    if (!client) {
      return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
    }

    const agent = await User.findById(req.user.id);
    if (!agent) {
      return res.status(404).json({ error: { message: "Agent not found", code: "NOT_FOUND" } });
    }

    // Use the existing message text as the template intent. We don't track
    // which template row produced a scheduled message, so the current text
    // is the best signal of what the agent wants this message to say.
    const template = {
      name: "Scheduled",
      trigger_days_after_closing: 0,
      message_template: message.message_text,
    };

    const marketContext = getMarketContext(client);
    const result = await generateAIMessage({ template, client, agent, marketContext });

    const updated = await Message.updateText(req.params.id, result.text, {
      aiGenerated: result.ai_generated,
    });

    res.json({
      message: updated,
      ai_generated: result.ai_generated,
      model: result.model,
      fallback_reason: result.fallback_reason,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/read", auth, requireSubscription, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || message.agent_id !== req.user.id) {
      return res.status(404).json({ error: { message: "Message not found", code: "NOT_FOUND" } });
    }

    await Message.markRead(req.params.id);
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, requireSubscription, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || message.agent_id !== req.user.id) {
      return res.status(404).json({ error: { message: "Message not found", code: "NOT_FOUND" } });
    }

    const cancelled = await Message.cancel(req.params.id);
    if (!cancelled) {
      return res.status(400).json({ error: { message: "Can only cancel scheduled messages", code: "NOT_CANCELLABLE" } });
    }

    res.json({ message: "Message cancelled" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
