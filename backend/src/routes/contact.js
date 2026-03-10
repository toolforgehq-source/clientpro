const express = require("express");
const { body, validationResult } = require("express-validator");
const { sendEmail } = require("../services/emailService");
const logger = require("../utils/logger");

const router = express.Router();

const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL || "toolforgehq@gmail.com";

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 5000 })
      .withMessage("Message must be under 5000 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      await sendEmail(
        CONTACT_RECIPIENT,
        `Contact Form: ${name}`,
        `<h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>`
      );

      logger.info(`Contact form submission from ${email}`);
      res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
      logger.error("Contact form error:", err.message);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  }
);

module.exports = router;
