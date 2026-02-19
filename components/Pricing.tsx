"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthly: 49,
    annual: 470,
    features: [
      "20 clients",
      "4-5 personalized texts/year",
      "Messages from your number",
      "Edit any message before it sends",
      "Referral tracking",
      "Email support",
    ],
    cta: "Get Started",
    href: "https://app.clientpro.io/register",
    popular: false,
  },
  {
    name: "Professional",
    monthly: 149,
    annual: 1490,
    features: [
      "100 clients",
      "4-5 personalized texts/year",
      "Messages from your number",
      "Edit any message before it sends",
      "Referral tracking",
      "Email support",
    ],
    cta: "Get Started",
    href: "https://app.clientpro.io/register",
    popular: true,
  },
  {
    name: "Elite",
    monthly: 299,
    annual: 2990,
    features: [
      "500 clients",
      "4-5 personalized texts/year",
      "Messages from your number",
      "Edit any message before it sends",
      "Referral tracking",
      "Engagement insights",
      "Email support",
    ],
    cta: "Get Started",
    href: "https://app.clientpro.io/register",
    popular: false,
  },
  {
    name: "Team",
    monthly: 799,
    annual: 7990,
    features: [
      "10 agents",
      "1,000 clients",
      "Everything in Elite+",
      "Team dashboard",
      "Manager oversight",
      "Email support",
    ],
    cta: "Get Started",
    href: "https://app.clientpro.io/register",
    popular: false,
  },
  {
    name: "Brokerage",
    monthly: 1499,
    annual: 14990,
    features: [
      "Unlimited agents",
      "Unlimited clients",
      "Everything in Team+",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@clientpro.io",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "Clients", values: ["20", "100", "500", "1,000", "Unlimited"] },
  { name: "Texts Per Year", values: ["4-5", "4-5", "4-5", "4-5", "4-5"] },
  { name: "Messages From Your Number", values: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
  { name: "Edit Before Sending", values: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
  { name: "Referral Tracking", values: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
  { name: "Engagement Insights", values: ["—", "—", "Yes", "Yes", "Yes"] },
  { name: "Team Dashboard", values: ["—", "—", "—", "Yes", "Yes"] },
  { name: "Manager Oversight", values: ["—", "—", "—", "Yes", "Yes"] },
  { name: "Dedicated Account Manager", values: ["—", "—", "—", "—", "Yes"] },
  { name: "Support", values: ["Email", "Email", "Email", "Email", "Email"] },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="pricing" className="py-12 md:py-20 bg-gray-100">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Simple Pricing. Massive ROI.
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            One deal pays for an entire year. Everything after that is pure
            profit.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium ${!annual ? "text-dark" : "text-slate-400"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                annual ? "bg-primary" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  annual ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${annual ? "text-dark" : "text-slate-400"}`}
            >
              Annual{" "}
              <span className="text-accent text-xs font-semibold">
                Save 2 months
              </span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-6 ${
                plan.popular
                  ? "border-2 border-primary shadow-xl ring-1 ring-primary/20"
                  : "border border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold text-dark mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-dark">
                  ${plan.monthly.toLocaleString()}
                </span>
                <span className="text-slate-500">/mo</span>
                {annual && (
                  <p className="text-sm text-slate-500 mt-1">
                    ${plan.annual.toLocaleString()}/year
                  </p>
                )}
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl"
                    : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {plan.cta} &rarr;
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mb-8">
          All plans include: 4-5 personalized texts per year, messages from your number, edit before sending, referral tracking, TCPA-compliant opt-outs, and secure data storage.
        </p>

        <div className="text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-primary font-semibold text-sm hover:underline"
          >
            {showComparison ? "Hide" : "Show"} Feature Comparison &darr;
          </button>
        </div>

        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 overflow-x-auto"
          >
            <table className="w-full min-w-[700px] bg-white rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-4 text-sm font-semibold text-dark">
                    Feature
                  </th>
                  {plans.map((plan, i) => (
                    <th
                      key={i}
                      className={`p-4 text-sm font-semibold text-center ${
                        plan.popular ? "text-primary" : "text-dark"
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-gray-100/50" : "bg-white"}
                  >
                    <td className="p-4 text-sm text-slate-700">
                      {feature.name}
                    </td>
                    {feature.values.map((val, j) => (
                      <td
                        key={j}
                        className="p-4 text-sm text-center text-slate-600"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </section>
  );
}
