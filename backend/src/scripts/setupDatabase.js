require("dotenv").config();
const { pool } = require("../config/database");
const logger = require("../utils/logger");

const schema = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  company_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'starter'
    CHECK (subscription_tier IN ('starter', 'professional', 'elite', 'team', 'brokerage')),
  subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'past_due', 'cancelled')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  twilio_phone_number TEXT UNIQUE,
  twilio_phone_sid TEXT,
  parent_user_id UUID REFERENCES users(id),
  user_role TEXT DEFAULT 'agent'
    CHECK (user_role IN ('agent', 'team_admin', 'broker_admin')),
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  property_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  property_type TEXT CHECK (property_type IN ('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'other')),
  closing_date DATE NOT NULL,
  notes TEXT,
  engagement_score INTEGER DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_clients_agent ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_closing_date ON clients(closing_date);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sending', 'sent', 'delivered', 'failed', 'replied', 'cancelled')),
  twilio_message_sid TEXT UNIQUE,
  reply_text TEXT,
  reply_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  failed_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_scheduled ON messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_by_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  referral_first_name TEXT NOT NULL,
  referral_last_name TEXT NOT NULL,
  referral_phone TEXT,
  referral_email TEXT,
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_agent ON referrals(agent_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_days_after_closing INTEGER NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

const seedTemplates = `
INSERT INTO templates (name, trigger_days_after_closing, message_template)
SELECT * FROM (VALUES
  ('Week 1 Welcome', 7, 'Hey {{first_name}}! Hope you''re settling into {{city}} well! Let me know if you need anything. 🏡'),
  ('Month 3 Check-in', 90, 'How''s the {{property_type}} treating you, {{first_name}}? Any questions about the neighborhood?'),
  ('Month 6 Market Update', 180, 'Quick update {{first_name}}: Homes in {{city}} are performing well! Your investment is looking good. 📈'),
  ('Year 1 Anniversary', 365, 'Happy house-iversary {{first_name}}! 🎉 Can you believe it''s been a year? Hope you''re loving {{city}}!'),
  ('Annual Check-in', 730, 'Just checking in {{first_name}}! How''s life in {{city}}? Let me know if you or anyone you know needs help with real estate.')
) AS t(name, trigger_days, template)
WHERE NOT EXISTS (SELECT 1 FROM templates LIMIT 1);
`;

async function setupDatabase() {
  try {
    logger.info("Setting up database...");
    await pool.query(schema);
    logger.info("Schema created successfully");

    await pool.query(seedTemplates);
    logger.info("Seed data inserted");

    logger.info("Database setup complete!");
  } catch (err) {
    logger.error("Database setup failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(() => process.exit(1));
