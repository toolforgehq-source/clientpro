require("dotenv").config();
const { getStripeClient, STRIPE_PRODUCTS } = require("../config/stripe");
const logger = require("../utils/logger");

async function setupStripe() {
  const stripe = getStripeClient();
  if (!stripe) {
    logger.error("Stripe not configured. Set STRIPE_SECRET_KEY in .env");
    process.exit(1);
  }

  logger.info("Setting up Stripe products and prices...");

  for (const product of STRIPE_PRODUCTS) {
    try {
      const existingProducts = await stripe.products.list({ active: true, limit: 100 });
      let stripeProduct = existingProducts.data.find(
        (p) => p.name === `ClientPro ${product.name}`
      );

      if (!stripeProduct) {
        stripeProduct = await stripe.products.create({
          name: `ClientPro ${product.name}`,
          metadata: { tier: product.tier },
        });
        logger.info(`Created product: ${stripeProduct.name}`);
      } else {
        logger.info(`Product already exists: ${stripeProduct.name}`);
      }

      const existingPrices = await stripe.prices.list({
        product: stripeProduct.id,
        active: true,
        limit: 10,
      });

      const hasMonthly = existingPrices.data.some(
        (p) => p.unit_amount === product.price_monthly && p.recurring && p.recurring.interval === "month"
      );
      const hasAnnual = existingPrices.data.some(
        (p) => p.unit_amount === product.price_annual && p.recurring && p.recurring.interval === "year"
      );

      if (!hasMonthly) {
        await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price_monthly,
          currency: "usd",
          recurring: { interval: "month" },
        });
        logger.info(`  Created monthly price: $${product.price_monthly / 100}/mo`);
      } else {
        logger.info(`  Monthly price already exists: $${product.price_monthly / 100}/mo`);
      }

      if (!hasAnnual) {
        await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price_annual,
          currency: "usd",
          recurring: { interval: "year" },
        });
        logger.info(`  Created annual price: $${product.price_annual / 100}/yr`);
      } else {
        logger.info(`  Annual price already exists: $${product.price_annual / 100}/yr`);
      }
    } catch (err) {
      logger.error(`Failed to set up ${product.name}:`, err.message);
    }
  }

  logger.info("Stripe setup complete!");
}

setupStripe().catch((err) => {
  logger.error("Stripe setup failed:", err.message);
  process.exit(1);
});
