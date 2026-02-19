const { Router } = require("express");
const { query } = require("../config/database");
const Client = require("../models/Client");
const Message = require("../models/Message");
const Referral = require("../models/Referral");
const auth = require("../middleware/auth");
const { requireTier } = require("../middleware/validateTier");

const router = Router();

router.get(
  "/dashboard",
  auth,
  requireTier("elite", "team", "brokerage"),
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const totalClients = await Client.countByAgent(userId);
      const messagesSentThisMonth = await Message.countByAgentThisMonth(userId);
      const referralsThisYear = await Referral.countByAgentThisYear(userId);

      const replyRateResult = await query(
        `SELECT
          COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'replied')) as total_sent,
          COUNT(*) FILTER (WHERE status = 'replied') as total_replied
         FROM messages WHERE agent_id = $1`,
        [userId]
      );
      const { total_sent, total_replied } = replyRateResult.rows[0];
      const replyRate = parseInt(total_sent, 10) > 0
        ? Math.round((parseInt(total_replied, 10) / parseInt(total_sent, 10)) * 100)
        : 0;

      const topEngagedResult = await query(
        `SELECT id, first_name, last_name, engagement_score, phone_number
         FROM clients
         WHERE agent_id = $1 AND is_active = true AND engagement_score > 70
         ORDER BY engagement_score DESC
         LIMIT 10`,
        [userId]
      );

      const lowEngagedResult = await query(
        `SELECT id, first_name, last_name, engagement_score, phone_number
         FROM clients
         WHERE agent_id = $1 AND is_active = true AND engagement_score < 30
         ORDER BY engagement_score ASC
         LIMIT 10`,
        [userId]
      );

      res.json({
        total_clients: totalClients,
        messages_sent_this_month: messagesSentThisMonth,
        reply_rate: replyRate,
        referrals_this_year: referralsThisYear,
        top_engaged_clients: topEngagedResult.rows,
        low_engaged_clients: lowEngagedResult.rows,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
