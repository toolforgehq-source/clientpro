const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { message: "Authentication required", code: "AUTH_REQUIRED" },
    });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      "SELECT id, email, first_name, last_name, phone_number, company_name, subscription_tier, subscription_status, twilio_phone_number, parent_user_id, user_role, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: { message: "User not found", code: "USER_NOT_FOUND" },
      });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(401).json({
        error: { message: "Account deactivated", code: "ACCOUNT_INACTIVE" },
      });
    }

    if (user.subscription_status === "cancelled") {
      return res.status(403).json({
        error: { message: "Subscription cancelled", code: "SUB_CANCELLED" },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: { message: "Token expired", code: "TOKEN_EXPIRED" },
      });
    }
    return res.status(401).json({
      error: { message: "Invalid token", code: "INVALID_TOKEN" },
    });
  }
};

module.exports = auth;
