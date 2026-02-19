const { query } = require("../config/database");

const Client = {
  async create({ agent_id, first_name, last_name, phone_number, email, property_address, city, state, zip, property_type, closing_date, notes }) {
    const result = await query(
      `INSERT INTO clients (agent_id, first_name, last_name, phone_number, email, property_address, city, state, zip, property_type, closing_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [agent_id, first_name, last_name, phone_number, email || null, property_address || null, city || null, state || null, zip || null, property_type || null, closing_date, notes || null]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query("SELECT * FROM clients WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByAgentId(agentId, { page = 1, limit = 50, search = null } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "agent_id = $1 AND is_active = true";
    const params = [agentId];
    let idx = 2;

    if (search) {
      whereClause += ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR phone_number ILIKE $${idx} OR property_address ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM clients WHERE ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM messages WHERE client_id = c.id AND status IN ('sent', 'delivered')) as total_messages_sent,
        (SELECT MIN(scheduled_for) FROM messages WHERE client_id = c.id AND status = 'scheduled' AND scheduled_for > now()) as next_message_date
       FROM clients c
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return {
      clients: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  },

  async findByIdAndAgent(id, agentId) {
    const result = await query(
      "SELECT * FROM clients WHERE id = $1 AND agent_id = $2",
      [id, agentId]
    );
    return result.rows[0] || null;
  },

  async update(id, fields) {
    const allowed = ["first_name", "last_name", "phone_number", "email", "property_address", "city", "state", "zip", "property_type", "closing_date", "notes", "is_active", "engagement_score"];
    const sets = [];
    const vals = [id];
    let idx = 2;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        vals.push(fields[key]);
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = now()");
    const result = await query(
      `UPDATE clients SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
      vals
    );
    return result.rows[0];
  },

  async softDelete(id) {
    const result = await query(
      "UPDATE clients SET is_active = false, updated_at = now() WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  async findByPhone(phone, agentId) {
    const result = await query(
      "SELECT * FROM clients WHERE phone_number = $1 AND agent_id = $2",
      [phone, agentId]
    );
    return result.rows[0] || null;
  },

  async findByPhoneGlobal(phone) {
    const result = await query(
      "SELECT * FROM clients WHERE phone_number = $1 AND is_active = true",
      [phone]
    );
    return result.rows;
  },

  async countByAgent(agentId) {
    const result = await query(
      "SELECT COUNT(*) FROM clients WHERE agent_id = $1 AND is_active = true",
      [agentId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async updateEngagementScore(id, score) {
    const clamped = Math.min(100, Math.max(0, score));
    await query(
      "UPDATE clients SET engagement_score = $2, updated_at = now() WHERE id = $1",
      [id, clamped]
    );
  },

  async getAllActive() {
    const result = await query("SELECT * FROM clients WHERE is_active = true");
    return result.rows;
  },
};

module.exports = Client;
