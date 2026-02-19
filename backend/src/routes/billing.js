const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { getStripeClient, STRIPE_PRODUCTS } = require("../config/stripe");
const User = require("../models/User");
const auth = require("../middleware/auth");
const logger = require("../utils/logger");

const router = Router();

router.post(
  "/create-checkout-session",
  auth,
  [
    body("tier").isIn(["starter", "professional", "elite", "team", "brokerage"]).withMessage("Valid tier required"),
    body("billing_cycle").isIn(["monthly", "annual"]).withMessage("Valid billing cycle required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        return res.status(503).json({ error: { message: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" } });
      }

      const { tier, billing_cycle } = req.body;
      const user = req.user;

      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          metadata: { user_id: user.id },
        });
        customerId = customer.id;
        await User.updateSubscription(user.id, { stripe_customer_id: customerId });
      }

      const priceId = await findStripePriceId(stripe, tier, billing_cycle);
      if (!priceId) {
        return res.status(400).json({ error: { message: "Pricing not set up. Run npm run stripe:setup first.", code: "PRICE_NOT_FOUND" } });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: { user_id: user.id, tier },
      });

      res.json({ checkout_url: session.url });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/portal", auth, async (req, res, next) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(503).json({ error: { message: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" } });
    }

    if (!req.user.stripe_customer_id) {
      return res.status(400).json({ error: { message: "No billing account found", code: "NO_BILLING" } });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ portal_url: session.url });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/change-plan",
  auth,
  [body("new_tier").isIn(["starter", "professional", "elite", "team", "brokerage"]).withMessage("Valid tier required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", code: "VALIDATION", details: errors.array() } });
      }

      const stripe = getStripeClient();
      if (!stripe) {
        return res.status(503).json({ error: { message: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" } });
      }

      const user = await User.findById(req.user.id);
      if (!user.stripe_subscription_id) {
        return res.status(400).json({ error: { message: "No active subscription found", code: "NO_SUBSCRIPTION" } });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      const currentItem = subscription.items.data[0];

      const newPriceId = await findStripePriceId(stripe, req.body.new_tier, "monthly");
      if (!newPriceId) {
        return res.status(400).json({ error: { message: "Price not found for tier", code: "PRICE_NOT_FOUND" } });
      }

      await stripe.subscriptions.update(user.stripe_subscription_id, {
        items: [{ id: currentItem.id, price: newPriceId }],
        proration_behavior: "create_prorations",
      });

      await User.updateSubscription(user.id, { subscription_tier: req.body.new_tier });

      res.json({ message: "Plan updated successfully", new_tier: req.body.new_tier });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/webhook", async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe) return res.status(200).send();

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const tier = session.metadata.tier;
        if (userId && tier) {
          await User.updateSubscription(userId, {
            subscription_tier: tier,
            subscription_status: "active",
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          });
          logger.info(`Checkout completed: user ${userId} upgraded to ${tier}`);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const user = await User.findByStripeCustomerId(subscription.customer);
        if (user) {
          const status = subscription.status === "active" ? "active" : "past_due";
          await User.updateSubscription(user.id, {
            subscription_status: status,
            stripe_subscription_id: subscription.id,
          });
          logger.info(`Subscription updated for user ${user.id}: ${status}`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await User.findByStripeCustomerId(subscription.customer);
        if (user) {
          await User.updateSubscription(user.id, { subscription_status: "cancelled" });
          logger.info(`Subscription cancelled for user ${user.id}`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const user = await User.findByStripeCustomerId(invoice.customer);
        if (user) {
          await User.updateSubscription(user.id, { subscription_status: "past_due" });
          logger.info(`Payment failed for user ${user.id}`);
        }
        break;
      }
    }
  } catch (err) {
    logger.error("Stripe webhook handler error:", err.message);
  }

  res.status(200).json({ received: true });
});

async function findStripePriceId(stripe, tier, billingCycle) {
  const product = STRIPE_PRODUCTS.find((p) => p.tier === tier);
  if (!product) return null;

  const prices = await stripe.prices.list({ active: true, limit: 100 });
  const interval = billingCycle === "annual" ? "year" : "month";
  const amount = billingCycle === "annual" ? product.price_annual : product.price_monthly;

  const match = prices.data.find(
    (p) => p.unit_amount === amount && p.recurring && p.recurring.interval === interval
  );
  return match ? match.id : null;
}

module.exports = router;
