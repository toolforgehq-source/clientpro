"use client";

import { motion } from "framer-motion";
import { Gift, Users, DollarSign } from "lucide-react";

const steps = [
  {
    icon: Gift,
    title: "Share Your Link",
    description: "Get a unique referral link from your dashboard.",
  },
  {
    icon: Users,
    title: "They Sign Up",
    description: "When another agent joins using your link, you both win.",
  },
  {
    icon: DollarSign,
    title: "You Get a Free Month",
    description:
      "One free month for every agent who signs up. No limit.",
  },
];

export default function Referral() {
  return (
    <section className="py-12 md:py-20 bg-gray-100">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Know an Agent Who Should Be Here?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Refer a fellow agent and get a free month of ClientPro. They
            get a free month too. No limit on referrals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">
                {step.title}
              </h3>
              <p className="text-slate-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
