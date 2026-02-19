const { query } = require("../config/database");

const Message = {
  async create({ client_id, agent_id, message_text, scheduled_for }) {
    const result = await query(
      `INSERT INTO messages (client_id, agent_id, message_text, scheduled_for)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [client_id, agent_id, message_text, scheduled_for]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query("SELECT * FROM messages WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByAgent(agentId, { status, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "m.agent_id = $1";
    const params = [agentId];
    let idx = 2;

    if (status) {
      whereClause += ` AND m.status = $${idx++}`;
      params.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM messages m WHERE ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT m.*, c.first_name as client_first_name, c.last_name as client_last_name, c.phone_number as client_phone
       FROM messages m
       JOIN clients c ON c.id = m.client_id
       WHERE ${whereClause}
       ORDER BY m.scheduled_for DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return {
      messages: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  },

  async findUpcoming(agentId, days = 30) {
    const result = await query(
      `SELECT m.*, c.first_name as client_first_name, c.last_name as client_last_name, c.phone_number as client_phone
       FROM messages m
       JOIN clients c ON c.id = m.client_id
       WHERE m.agent_id = $1 AND m.status = 'scheduled' AND m.scheduled_for BETWEEN now() AND now() + interval '${days} days'
       ORDER BY m.scheduled_for ASC`,
      [agentId]
    );
    return result.rows;
  },

  async findUnreadReplies(agentId) {
    const result = await query(
      `SELECT m.*, c.first_name as client_first_name, c.last_name as client_last_name, c.phone_number as client_phone
       FROM messages m
       JOIN clients c ON c.id = m.client_id
       WHERE m.agent_id = $1 AND m.status = 'replied' AND m.is_read = false
       ORDER BY m.reply_at DESC`,
      [agentId]
    );
    return result.rows;
  },

  async updateText(id, messageText) {
    const result = await query(
      "UPDATE messages SET message_text = $2, updated_at = now() WHERE id = $1 AND status = 'scheduled' RETURNING *",
      [id, messageText]
    );
    return result.rows[0] || null;
  },

  async markRead(id) {
    const result = await query(
      "UPDATE messages SET is_read = true, updated_at = now() WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  async cancel(id) {
    const result = await query(
      "UPDATE messages SET status = 'cancelled', updated_at = now() WHERE id = $1 AND status = 'scheduled' RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },

  async cancelFutureForClient(clientId) {
    const result = await query(
      "UPDATE messages SET status = 'cancelled', updated_at = now() WHERE client_id = $1 AND status = 'scheduled' RETURNING id",
      [clientId]
    );
    return result.rowCount;
  },

  async findScheduledDue() {
    const result = await query(
      `SELECT m.*, c.first_name as client_first_name, c.last_name as client_last_name, c.phone_number as client_phone, c.city as client_city, c.state as client_state, c.property_type as client_property_type
       FROM messages m
       JOIN clients c ON c.id = m.client_id
       JOIN users u ON u.id = m.agent_id
       WHERE m.status = 'scheduled' AND m.scheduled_for <= now() AND m.retry_count < 3 AND c.is_active = true AND u.is_active = true AND u.subscription_status = 'active'
       ORDER BY m.scheduled_for ASC
       LIMIT 100`
    );
    return result.rows;
  },

  async markSending(id) {
    await query("UPDATE messages SET status = 'sending', updated_at = now() WHERE id = $1", [id]);
  },

  async markSent(id, twilioMessageSid) {
    await query(
      "UPDATE messages SET status = 'sent', sent_at = now(), twilio_message_sid = $2, updated_at = now() WHERE id = $1",
      [id, twilioMessageSid]
    );
  },

  async markDelivered(id) {
    await query("UPDATE messages SET status = 'delivered', delivered_at = now(), updated_at = now() WHERE id = $1", [id]);
  },

  async markFailed(id, reason) {
    await query(
      "UPDATE messages SET status = 'failed', failed_reason = $2, updated_at = now() WHERE id = $1",
      [id, reason]
    );
  },

  async incrementRetry(id) {
    await query("UPDATE messages SET retry_count = retry_count + 1, updated_at = now() WHERE id = $1", [id]);
  },

  async markReplied(id, replyText) {
    await query(
      "UPDATE messages SET status = 'replied', reply_text = $2, reply_at = now(), is_read = false, updated_at = now() WHERE id = $1",
      [id, replyText]
    );
  },

  async findRecentSentToClient(clientId) {
    const result = await query(
      "SELECT * FROM messages WHERE client_id = $1 AND status IN ('sent', 'delivered') ORDER BY sent_at DESC LIMIT 1",
      [clientId]
    );
    return result.rows[0] || null;
  },

  async countByAgentThisMonth(agentId) {
    const result = await query(
      "SELECT COUNT(*) FROM messages WHERE agent_id = $1 AND sent_at >= date_trunc('month', now()) AND status IN ('sent', 'delivered', 'replied')",
      [agentId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async getReplyCountByClient(clientId) {
    const result = await query(
      "SELECT COUNT(*) FROM messages WHERE client_id = $1 AND status = 'replied'",
      [clientId]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = Message;
