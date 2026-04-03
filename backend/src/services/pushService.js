const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");
const logger = require("../utils/logger");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:contact@clientpro.io";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  logger.info("Web Push VAPID configured");
} else {
  logger.warn("VAPID keys not set — push notifications disabled");
}

async function sendPushToUser(userId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn("Push notification skipped — VAPID keys not configured");
    return;
  }

  const subscriptions = await PushSubscription.findByUserId(userId);
  if (subscriptions.length === 0) {
    logger.info(`No push subscriptions for user ${userId}`);
    return;
  }

  const payloadStr = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payloadStr
        );
        logger.info(`Push sent to ${sub.endpoint.slice(0, 50)}...`);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          logger.info(`Removing expired push subscription: ${sub.endpoint.slice(0, 50)}...`);
          await PushSubscription.deleteByEndpoint(sub.endpoint);
        } else {
          logger.error(`Push failed for ${sub.endpoint.slice(0, 50)}...: ${err.message}`);
        }
        throw err;
      }
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  logger.info(`Push notifications: ${sent}/${subscriptions.length} sent for user ${userId}`);
}

async function notifyNewReply(agentId, clientName, messageBody) {
  const body = messageBody.length > 100 ? messageBody.slice(0, 97) + "..." : messageBody;
  await sendPushToUser(agentId, {
    title: `${clientName} replied`,
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: `reply-${agentId}`,
    data: {
      type: "client_reply",
      url: "/dashboard/messages",
    },
  });
}

module.exports = { sendPushToUser, notifyNewReply };
