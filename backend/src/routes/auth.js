const { Router } = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Client = require("../models/Client");
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const { TIER_LIMITS } = require("../middleware/validateTier");
const { getTwilioClient } = require("../config/twilio");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../services/emailService");
const { validateEmail, validatePassword, validatePhone } = require("../utils/validation");
const logger = require("../utils/logger");

const router = Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || "7d" });

const provisionTwilioNumber = async (user, areaCode) => {
  const twilioClient = getTwilioClient();
  if (!twilioClient) return null;

  try {
    const available = await twilioClient.availablePhoneNumbers("US").local.list({
      areaCode: areaCode || undefined,
      limit: 1,
    });

    if (available.length === 0) {
      const anyAvailable = await twilioClient.availablePhoneNumbers("US").local.list({ limit: 1 });
      if (anyAvailable.length === 0) return null;
      available.push(anyAvailable[0]);
    }

    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: available[0].phoneNumber,
      smsUrl: process.env.TWILIO_WEBHOOK_URL,
      smsMethod: "POST",
    });

    await User.updateTwilio(user.id, {
      twilio_phone_number: purchased.phoneNumber,
      twilio_phone_sid: purchased.sid,
    });

    logger.info(`Provisioned Twilio number ${purchased.phoneNumber} for user ${user.id}`);
    return purchased.phoneNumber;
  } catch (err) {
    logger.error("Failed to provision Twilio number:", err.message);
    return null;
  }
};

router.post(
  "/register",
  [
    validateEmail(),
    validatePassword(),
    body("first_name").trim().notEmpty().withMessage("First name required"),
    body("last_name").trim().notEmpty().withMessage("Last name required"),
    validatePhone(),
    body("company_name").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const existing = await User.findByEmail(req.body.email);
      if (existing) {
        return res.status(409).json({ error: { message: "Email already registered", code: "EMAIL_EXISTS" } });
      }

      const createData = {
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone_number: req.body.phone_number,
        company_name: req.body.company_name,
      };

      if (req.query.team && req.query.role) {
        const parentUser = await User.findById(req.query.team);
        if (parentUser && (parentUser.subscription_tier === "team" || parentUser.subscription_tier === "brokerage")) {
          const teamMembers = await User.getTeamMembers(parentUser.id);
          const tierLimits = TIER_LIMITS[parentUser.subscription_tier];
          if (tierLimits && tierLimits.max_agents !== Infinity && teamMembers.length >= tierLimits.max_agents) {
            return res.status(403).json({ error: { message: "Team agent limit reached", code: "AGENT_LIMIT" } });
          }
          createData.parent_user_id = parentUser.id;
          createData.user_role = req.query.role === "admin" ? "team_admin" : "agent";
          createData.subscription_tier = parentUser.subscription_tier;
        }
      }

      const user = await User.create(createData);
      const token = generateToken(user.id);

      const areaCode = req.body.phone_number ? req.body.phone_number.slice(2, 5) : null;
      const twilioNumber = await provisionTwilioNumber(user, areaCode);

      await sendWelcomeEmail(user.email, user.first_name);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          subscription_tier: user.subscription_tier,
          twilio_phone_number: twilioNumber,
          twilio_provisioned: !!twilioNumber,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  [validateEmail(), body("password").notEmpty().withMessage("Password required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const user = await User.findByEmail(req.body.email);
      if (!user) {
        return res.status(401).json({ error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" } });
      }

      const valid = await User.verifyPassword(req.body.password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" } });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: { message: "Account deactivated", code: "ACCOUNT_INACTIVE" } });
      }

      const token = generateToken(user.id);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          subscription_tier: user.subscription_tier,
          subscription_status: user.subscription_status,
          twilio_phone_number: user.twilio_phone_number,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = req.user;
    const tier = user.subscription_tier;
    const limits = TIER_LIMITS[tier] || {};
    const clientsCount = await Client.countByAgent(user.id);
    const messagesSent = await Message.countByAgentThisMonth(user.id);

    let maxClients;
    if (tier === "team" || tier === "brokerage") {
      maxClients = limits.max_total_clients;
    } else {
      maxClients = limits.max_clients;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        company_name: user.company_name,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status,
        twilio_phone_number: user.twilio_phone_number,
        user_role: user.user_role,
      },
      usage: {
        clients_count: clientsCount,
        clients_limit: maxClients === Infinity ? "unlimited" : maxClients,
        messages_sent_this_month: messagesSent,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/profile",
  auth,
  [
    body("first_name").optional().trim().notEmpty(),
    body("last_name").optional().trim().notEmpty(),
    body("phone_number").optional().matches(/^\+1\d{10}$/),
    body("company_name").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const updated = await User.updateProfile(req.user.id, req.body);
      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/forgot-password",
  [validateEmail()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const user = await User.findByEmail(req.body.email);
      if (!user) {
        return res.json({ message: "If that email exists, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000);
      await User.setResetToken(user.id, token, expiry);

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);

      res.json({ message: "If that email exists, a reset link has been sent." });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token required"),
    validatePassword("new_password"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const user = await User.findByResetToken(req.body.token);
      if (!user) {
        return res.status(400).json({ error: { message: "Invalid or expired reset token", code: "INVALID_TOKEN" } });
      }

      await User.updatePassword(user.id, req.body.new_password);
      await User.clearResetToken(user.id);

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
