const { query } = require("../config/database");
const bcrypt = require("bcrypt");

const User = {
  async create({ email, password, first_name, last_name, phone_number, company_name, parent_user_id, user_role, subscription_tier }) {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, company_name, parent_user_id, user_role, subscription_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'agent'), COALESCE($9, 'starter'))
       RETURNING id, email, first_name, last_name, phone_number, company_name, subscription_tier, subscription_status, user_role, parent_user_id, created_at`,
      [email, password_hash, first_name, last_name, phone_number, company_name || null, parent_user_id || null, user_role || null, subscription_tier || null]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      "SELECT id, email, first_name, last_name, phone_number, company_name, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, twilio_phone_number, twilio_phone_sid, parent_user_id, user_role, is_active, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async updateProfile(id, { first_name, last_name, phone_number, company_name }) {
    const result = await query(
      `UPDATE users SET first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name), phone_number = COALESCE($4, phone_number), company_name = COALESCE($5, company_name), updated_at = now()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone_number, company_name, subscription_tier, subscription_status, user_role`,
      [id, first_name, last_name, phone_number, company_name]
    );
    return result.rows[0];
  },

  async updateSubscription(id, { subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id }) {
    const sets = [];
    const vals = [id];
    let idx = 2;
    if (subscription_tier !== undefined) { sets.push(`subscription_tier = $${idx++}`); vals.push(subscription_tier); }
    if (subscription_status !== undefined) { sets.push(`subscription_status = $${idx++}`); vals.push(subscription_status); }
    if (stripe_customer_id !== undefined) { sets.push(`stripe_customer_id = $${idx++}`); vals.push(stripe_customer_id); }
    if (stripe_subscription_id !== undefined) { sets.push(`stripe_subscription_id = $${idx++}`); vals.push(stripe_subscription_id); }
    sets.push("updated_at = now()");
    const result = await query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
      vals
    );
    return result.rows[0];
  },

  async updateTwilio(id, { twilio_phone_number, twilio_phone_sid }) {
    const result = await query(
      `UPDATE users SET twilio_phone_number = $2, twilio_phone_sid = $3, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, twilio_phone_number, twilio_phone_sid]
    );
    return result.rows[0];
  },

  async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1", [id, password_hash]);
  },

  async setResetToken(id, token, expiry) {
    await query(
      "UPDATE users SET reset_token = $2, reset_token_expires = $3, updated_at = now() WHERE id = $1",
      [id, token, expiry]
    );
  },

  async findByResetToken(token) {
    const result = await query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > now()",
      [token]
    );
    return result.rows[0] || null;
  },

  async clearResetToken(id) {
    await query(
      "UPDATE users SET reset_token = NULL, reset_token_expires = NULL, updated_at = now() WHERE id = $1",
      [id]
    );
  },

  async findByTwilioNumber(twilioNumber) {
    const result = await query("SELECT * FROM users WHERE twilio_phone_number = $1", [twilioNumber]);
    return result.rows[0] || null;
  },

  async findByStripeCustomerId(stripeCustomerId) {
    const result = await query("SELECT * FROM users WHERE stripe_customer_id = $1", [stripeCustomerId]);
    return result.rows[0] || null;
  },

  async getTeamMembers(parentId) {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone_number, company_name, subscription_tier, user_role, is_active, created_at
       FROM users WHERE parent_user_id = $1 ORDER BY created_at DESC`,
      [parentId]
    );
    return result.rows;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = User;
