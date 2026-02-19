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
  { name: "Starter", tier: "starter", price_monthly: 4900, price_annual: 47000 },
  { name: "Professional", tier: "professional", price_monthly: 14900, price_annual: 149000 },
  { name: "Elite", tier: "elite", price_monthly: 29900, price_annual: 299000 },
  { name: "Team", tier: "team", price_monthly: 79900, price_annual: 799000 },
  { name: "Brokerage", tier: "brokerage", price_monthly: 149900, price_annual: 1499000 },
];

module.exports = { getStripeClient, STRIPE_PRODUCTS };
