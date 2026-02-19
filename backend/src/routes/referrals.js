const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const Referral = require("../models/Referral");
const Client = require("../models/Client");
const auth = require("../middleware/auth");
const { validatePagination } = require("../utils/validation");

const router = Router();

router.post(
  "/",
  auth,
  [
    body("referred_by_client_id").isUUID().withMessage("Valid client ID required"),
    body("referral_first_name").trim().notEmpty().withMessage("First name required"),
    body("referral_last_name").trim().notEmpty().withMessage("Last name required"),
    body("referral_phone").optional().matches(/^\+1\d{10}$/),
    body("referral_email").optional().isEmail().normalizeEmail(),
    body("notes").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const client = await Client.findByIdAndAgent(req.body.referred_by_client_id, req.user.id);
      if (!client) {
        return res.status(404).json({ error: { message: "Referring client not found", code: "NOT_FOUND" } });
      }

      const referral = await Referral.create({ ...req.body, agent_id: req.user.id });

      const newScore = Math.min(100, (client.engagement_score || 50) + 10);
      await Client.updateEngagementScore(client.id, newScore);

      res.status(201).json({ referral });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", auth, validatePagination, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const result = await Referral.findByAgent(req.user.id, {
      status: status || undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  auth,
  [
    body("status").optional().isIn(["new", "contacted", "qualified", "converted", "lost"]),
    body("notes").optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const referral = await Referral.findByIdAndAgent(req.params.id, req.user.id);
      if (!referral) {
        return res.status(404).json({ error: { message: "Referral not found", code: "NOT_FOUND" } });
      }

      const updated = await Referral.update(req.params.id, req.body);
      res.json({ referral: updated });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
