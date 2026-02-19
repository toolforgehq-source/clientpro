const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const User = require("../models/User");
const Client = require("../models/Client");
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const { requireTier, requireRole } = require("../middleware/validateTier");
const { sendTeamInviteEmail } = require("../services/emailService");
const logger = require("../utils/logger");

const router = Router();

router.post(
  "/invite",
  auth,
  requireTier("team", "brokerage"),
  requireRole("team_admin", "broker_admin"),
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("role").optional().isIn(["agent", "team_admin"]).withMessage("Valid role required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const existing = await User.findByEmail(req.body.email);
      if (existing) {
        return res.status(409).json({ error: { message: "User with this email already exists", code: "EMAIL_EXISTS" } });
      }

      const teamCode = crypto.randomBytes(6).toString("hex");
      const signupUrl = `${process.env.FRONTEND_URL}/signup?team=${req.user.id}&code=${teamCode}&role=${req.body.role || "agent"}`;

      await sendTeamInviteEmail(
        req.body.email,
        `${req.user.first_name} ${req.user.last_name}`,
        teamCode,
        signupUrl
      );

      logger.info(`Team invite sent to ${req.body.email} from user ${req.user.id}`);
      res.json({ message: "Invite sent", email: req.body.email });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/remove",
  auth,
  requireTier("team", "brokerage"),
  requireRole("team_admin", "broker_admin"),
  [body("member_id").isUUID().withMessage("Valid member ID required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const member = await User.findById(req.body.member_id);
      if (!member || member.parent_user_id !== req.user.id) {
        return res.status(404).json({ error: { message: "Team member not found", code: "NOT_FOUND" } });
      }

      await User.updateProfile(member.id, {});
      const { query } = require("../config/database");
      await query("UPDATE users SET is_active = false, updated_at = now() WHERE id = $1", [member.id]);

      logger.info(`Team member ${member.id} removed by ${req.user.id}`);
      res.json({ message: "Team member removed" });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/members",
  auth,
  requireTier("team", "brokerage"),
  requireRole("team_admin", "broker_admin"),
  async (req, res, next) => {
    try {
      const members = await User.getTeamMembers(req.user.id);

      const membersWithStats = await Promise.all(
        members.map(async (member) => {
          const clientCount = await Client.countByAgent(member.id);
          const messagesSent = await Message.countByAgentThisMonth(member.id);
          return { ...member, clients_count: clientCount, messages_sent_this_month: messagesSent };
        })
      );

      res.json({ members: membersWithStats, total: membersWithStats.length });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
