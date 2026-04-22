require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const messageRoutes = require("./routes/messages");
const referralRoutes = require("./routes/referrals");
const billingRoutes = require("./routes/billing");
const teamRoutes = require("./routes/team");
const analyticsRoutes = require("./routes/analytics");
const twilioRoutes = require("./routes/twilio");
const contactRoutes = require("./routes/contact");
const pushRoutes = require("./routes/push");

const sendScheduledMessages = require("./jobs/sendScheduledMessages");
const updateEngagementScores = require("./jobs/updateEngagementScores");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  "https://app.clientpro.io",
  "https://clientpro.io",
  "https://www.clientpro.io",
];

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (origin && origin.endsWith(".vercel.app"))
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.post("/api/billing/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/push", pushRoutes);

app.use(errorHandler);

cron.schedule("*/15 * * * *", () => {
  logger.info("Running cron: sendScheduledMessages");
  sendScheduledMessages();
});

cron.schedule("0 2 * * *", () => {
  logger.info("Running cron: updateEngagementScores");
  updateEngagementScores();
});

// Ensure database schema exists on startup
const ensureSchema = require("./scripts/ensureSchema");
ensureSchema().catch((err) => {
  logger.error("Schema initialization failed after retries:", err.message);
});

// Run database migrations on startup
const migrateConstraints = require("./scripts/migrateConstraints");
migrateConstraints().catch((err) => {
  logger.error("Startup migration failed (non-fatal):", err.message);
});

const migrateTemplates = require("./scripts/migrateTemplates");
migrateTemplates().catch((err) => {
  logger.error("Template migration failed (non-fatal):", err.message);
});

const migrateClientFields = require("./scripts/migrateClientFields");
migrateClientFields().catch((err) => {
  logger.error("Client fields migration failed (non-fatal):", err.message);
});

const migrateAIPersonalization = require("./scripts/migrateAIPersonalization");
migrateAIPersonalization().catch((err) => {
  logger.error("AI personalization migration failed (non-fatal):", err.message);
});

const migrateOnboarding = require("./scripts/migrateOnboarding");
migrateOnboarding().catch((err) => {
  logger.error("Onboarding migration failed (non-fatal):", err.message);
});

app.listen(PORT, () => {
  logger.info(`ClientPro API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
