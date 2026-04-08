/**
 * Middleware that requires an active subscription to access the route.
 * Must be used AFTER the auth middleware (which sets req.user).
 *
 * Routes that should NOT use this middleware:
 *   - /auth/me, /auth/profile (user needs to see their own status)
 *   - /billing/* (user needs to complete payment)
 *   - /auth/register, /auth/login (unauthenticated routes)
 *
 * Routes that SHOULD use this middleware:
 *   - /clients, /messages, /referrals, /analytics, /team, /push
 */
const requireSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: { message: "Authentication required", code: "AUTH_REQUIRED" },
    });
  }

  if (req.user.subscription_status !== "active") {
    return res.status(403).json({
      error: {
        message: "Active subscription required. Please complete payment to access this feature.",
        code: "SUBSCRIPTION_REQUIRED",
      },
    });
  }

  next();
};

module.exports = requireSubscription;
