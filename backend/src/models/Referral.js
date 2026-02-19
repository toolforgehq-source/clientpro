const { query } = require("../config/database");

const Referral = {
  async create({ agent_id, referred_by_client_id, referral_first_name, referral_last_name, referral_phone, referral_email, notes }) {
    const result = await query(
      `INSERT INTO referrals (agent_id, referred_by_client_id, referral_first_name, referral_last_name, referral_phone, referral_email, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [agent_id, referred_by_client_id, referral_first_name, referral_last_name, referral_phone || null, referral_email || null, notes || null]
    );
    return result.rows[0];
  },

  async findByAgent(agentId, { status, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "r.agent_id = $1";
    const params = [agentId];
    let idx = 2;

    if (status) {
      whereClause += ` AND r.status = $${idx++}`;
      params.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM referrals r WHERE ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT r.*, c.first_name as referred_by_first_name, c.last_name as referred_by_last_name
       FROM referrals r
       JOIN clients c ON c.id = r.referred_by_client_id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return {
      referrals: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  },

  async findByIdAndAgent(id, agentId) {
    const result = await query(
      "SELECT * FROM referrals WHERE id = $1 AND agent_id = $2",
      [id, agentId]
    );
    return result.rows[0] || null;
  },

  async update(id, { status, notes }) {
    const sets = ["updated_at = now()"];
    const vals = [id];
    let idx = 2;

    if (status) {
      sets.push(`status = $${idx++}`);
      vals.push(status);
      if (status === "contacted") sets.push("contacted_at = now()");
      if (status === "converted") sets.push("converted_at = now()");
    }
    if (notes !== undefined) {
      sets.push(`notes = $${idx++}`);
      vals.push(notes);
    }

    const result = await query(
      `UPDATE referrals SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
      vals
    );
    return result.rows[0];
  },

  async countByAgent(agentId) {
    const result = await query(
      "SELECT COUNT(*) FROM referrals WHERE agent_id = $1",
      [agentId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async countByAgentThisYear(agentId) {
    const result = await query(
      "SELECT COUNT(*) FROM referrals WHERE agent_id = $1 AND created_at >= date_trunc('year', now())",
      [agentId]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = Referral;
