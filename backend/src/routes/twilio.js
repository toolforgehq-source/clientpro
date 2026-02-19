const { Router } = require("express");
const twilio = require("twilio");
const { handleIncomingSMS } = require("../services/twilioWebhook");
const logger = require("../utils/logger");

const router = Router();

const validateTwilioSignature = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next();

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return next();

  const signature = req.headers["x-twilio-signature"];
  const url = process.env.TWILIO_WEBHOOK_URL;

  if (!signature || !url) {
    logger.warn("Missing Twilio signature or webhook URL");
    return res.status(403).type("text/xml").send("<Response></Response>");
  }

  const isValid = twilio.validateRequest(authToken, signature, url, req.body);
  if (!isValid) {
    logger.warn("Invalid Twilio webhook signature");
    return res.status(403).type("text/xml").send("<Response></Response>");
  }

  next();
};

router.post("/incoming", validateTwilioSignature, async (req, res) => {
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
