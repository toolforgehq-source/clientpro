const { Router } = require("express");
const auth = require("../middleware/auth");
const PushSubscription = require("../models/PushSubscription");
const logger = require("../utils/logger");

const router = Router();

// Subscribe to push notifications
router.post("/subscribe", auth, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: { message: "Invalid push subscription" } });
    }

    await PushSubscription.create(req.user.id, subscription);
    logger.info(`Push subscription saved for user ${req.user.id}`);

    res.json({ message: "Push subscription saved" });
  } catch (err) {
    logger.error("Push subscribe error:", err.message);
    res.status(500).json({ error: { message: "Failed to save push subscription" } });
  }
});

// Unsubscribe from push notifications
router.post("/unsubscribe", auth, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: { message: "Endpoint required" } });
    }

    await PushSubscription.deleteByUserIdAndEndpoint(req.user.id, endpoint);
    logger.info(`Push subscription removed for user ${req.user.id}`);

    res.json({ message: "Push subscription removed" });
  } catch (err) {
    logger.error("Push unsubscribe error:", err.message);
    res.status(500).json({ error: { message: "Failed to remove push subscription" } });
  }
});

// Get VAPID public key
router.get("/vapid-key", (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(503).json({ error: { message: "Push notifications not configured" } });
  }
  res.json({ vapidPublicKey: key });
});

module.exports = router;
