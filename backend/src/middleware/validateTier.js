const { query } = require("../config/database");

const TIER_LIMITS = {
  starter: { max_clients: 20 },
  professional: { max_clients: 100 },
  elite: { max_clients: 500 },
  team: { max_agents: 10, max_total_clients: 1000 },
  brokerage: { max_agents: Infinity, max_total_clients: Infinity },
};

const checkClientLimit = async (req, res, next) => {
  const user = req.user;
  const tier = user.subscription_tier;
  const limits = TIER_LIMITS[tier];

  if (!limits) {
    return res.status(403).json({
      error: { message: "Invalid subscription tier", code: "INVALID_TIER" },
    });
  }

  let maxClients;
  if (tier === "team" || tier === "brokerage") {
    maxClients = limits.max_total_clients;
  } else {
    maxClients = limits.max_clients;
  }

  const result = await query(
    "SELECT COUNT(*) FROM clients WHERE agent_id = $1 AND is_active = true",
    [user.id]
  );
  const currentCount = parseInt(result.rows[0].count, 10);

  if (currentCount >= maxClients) {
    return res.status(403).json({
      error: {
        message: "Client limit reached. Upgrade to add more clients.",
        code: "CLIENT_LIMIT",
        details: { current: currentCount, limit: maxClients, tier },
      },
    });
  }

  req.clientCount = currentCount;
  req.clientLimit = maxClients;
  next();
};

const requireTier = (...allowedTiers) => {
  return (req, res, next) => {
    if (!allowedTiers.includes(req.user.subscription_tier)) {
      return res.status(403).json({
        error: {
          message: `This feature requires one of: ${allowedTiers.join(", ")}`,
          code: "TIER_REQUIRED",
        },
      });
    }
    next();
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.user_role)) {
      return res.status(403).json({
        error: {
          message: "Insufficient permissions",
          code: "ROLE_REQUIRED",
        },
      });
    }
    next();
  };
};

module.exports = { TIER_LIMITS, checkClientLimit, requireTier, requireRole };
