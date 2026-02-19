const { Router } = require("express");
const { handleIncomingSMS } = require("../services/twilioWebhook");
const logger = require("../utils/logger");

const router = Router();

router.post("/incoming", async (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body;

    if (!From || !To || !Body) {
      return res.status(400).type("text/xml").send("<Response></Response>");
    }

    await handleIncomingSMS({ From, To, Body, MessageSid });

    res.type("text/xml").send("<Response></Response>");
  } catch (err) {
    logger.error("Twilio webhook error:", err.message);
    res.type("text/xml").send("<Response></Response>");
  }
});

module.exports = router;
