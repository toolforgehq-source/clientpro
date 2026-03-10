const Stripe = require("stripe");

let stripeClient = null;

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Stripe secret key not configured");
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

const STRIPE_PRODUCTS = [
  { name: "Solo", tier: "solo", price_monthly: 2900, price_annual: 27800 },
  { name: "Starter", tier: "starter", price_monthly: 4900, price_annual: 47000 },
  { name: "Professional", tier: "professional", price_monthly: 14900, price_annual: 149000 },
  { name: "Elite", tier: "elite", price_monthly: 29900, price_annual: 299000 },
  { name: "Team", tier: "team", price_monthly: 79900, price_annual: 799000 },
  { name: "Brokerage", tier: "brokerage", price_monthly: 149900, price_annual: 1499000 },
];

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

module.exports = { getStripeClient, STRIPE_PRODUCTS, findStripePriceId };
