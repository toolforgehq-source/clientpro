const { query } = require("../config/database");

const PushSubscription = {
  async create(userId, subscription) {
    const { endpoint, keys } = subscription;
    const result = await query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET
         user_id = $1, p256dh = $3, auth = $4, updated_at = now()
       RETURNING *`,
      [userId, endpoint, keys.p256dh, keys.auth]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await query(
      "SELECT * FROM push_subscriptions WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  },

  async deleteByEndpoint(endpoint) {
    await query("DELETE FROM push_subscriptions WHERE endpoint = $1", [endpoint]);
  },

  async deleteByUserIdAndEndpoint(userId, endpoint) {
    await query(
      "DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2",
      [userId, endpoint]
    );
  },
};

module.exports = PushSubscription;
