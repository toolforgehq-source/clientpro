const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const Message = require("../models/Message");
const Client = require("../models/Client");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { validatePagination } = require("../utils/validation");
const { getTwilioClient } = require("../config/twilio");
const logger = require("../utils/logger");

const router = Router();

// Send a custom message to one, multiple, or all clients
router.post(
  "/custom",
  auth,
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

router.get("/", auth, validatePagination, async (req, res, next) => {
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

router.get("/upcoming", auth, async (req, res, next) => {
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

router.get("/replies", auth, async (req, res, next) => {
  try {
    const replies = await Message.findAllReplies(req.user.id);
    res.json({ replies, total: replies.length });
  } catch (err) {
    next(err);
  }
});

router.get("/conversation/:clientId", auth, async (req, res, next) => {
  try {
    const client = await Client.findByIdAndAgent(req.params.clientId, req.user.id);
    if (!client) {
      return res.status(404).json({ error: { message: "Client not found", code: "NOT_FOUND" } });
    }

    const messages = await Message.findConversation(req.params.clientId, req.user.id);

    // Mark all unread replies in this conversation as read
    for (const msg of messages) {
      if (msg.status === "replied" && !msg.is_read) {
        await Message.markRead(msg.id);
      }
    }

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
      if (!agent || !agent.twilio_phone_number) {
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

      const updated = await Message.updateText(req.params.id, req.body.message_text);
      res.json({ message: updated });
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:id/read", auth, async (req, res, next) => {
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

router.delete("/:id", auth, async (req, res, next) => {
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
