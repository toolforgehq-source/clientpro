const Client = require("../models/Client");
const Message = require("../models/Message");
const logger = require("../utils/logger");

const updateEngagementScores = async () => {
  logger.info("Running engagement score update job...");

  try {
    const clients = await Client.getAllActive();
    let updated = 0;

    for (const client of clients) {
      const replyCount = await Message.getReplyCountByClient(client.id);
      const score = Math.min(100, 50 + replyCount * 10);

      if (score !== client.engagement_score) {
        await Client.updateEngagementScore(client.id, score);
        updated++;
      }
    }

    logger.info(`Engagement score update complete: ${updated} clients updated`);
  } catch (err) {
    logger.error("Engagement score update error:", err.message);
  }
};

module.exports = updateEngagementScores;
