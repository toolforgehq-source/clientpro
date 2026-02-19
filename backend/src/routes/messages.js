const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const { validatePagination } = require("../utils/validation");

const router = Router();

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
    const replies = await Message.findUnreadReplies(req.user.id);
    res.json({ replies, total: replies.length });
  } catch (err) {
    next(err);
  }
});

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
