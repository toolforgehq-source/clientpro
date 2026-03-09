"use client";

import { motion } from "framer-motion";
import { Shield, Lock, MessageSquare, Zap, ArrowRight } from "lucide-react";

const reasons = [
  {
    icon: MessageSquare,
    title: "Texts From Your Area Code",
    description:
      "You get a dedicated local number matched to your area code that forwards directly to your phone. Clients text and call you back—no generic marketing blasts.",
  },
  {
    icon: Zap,
    title: "Set It and Forget It",
    description:
      "Import your clients once. We handle the rest\u2014personalized check-ins, home tips, market updates. 4-5 texts per year, timed perfectly.",
  },
  {
    icon: ArrowRight,
    title: "Built for Referrals",
    description:
      "Every message is designed to keep you top-of-mind. When their friend needs an agent, your name comes up first.",
  },
];

const integrations = [
  "CSV Import",
];

const badges = [
  { icon: Shield, label: "TCPA Compliant" },
  { icon: Lock, label: "Bank-Level Encryption" },
];

export default function SocialProof() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Why Agents Choose ClientPro
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The only tool built specifically to turn past clients into your
            biggest source of repeat business and referrals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-gray-100 rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <reason.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">{reason.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CRM Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-100 rounded-2xl p-8 md:p-12 mb-16 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-dark mb-3">
            Works With Your Existing Tools
          </h3>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Import your past clients via CSV and get started in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((name, i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Urgency callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-primary/40 bg-primary/5 rounded-xl p-6 md:p-8 max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-dark text-lg font-medium mb-2">
            Every day you wait, another agent is staying in touch with your past clients.
          </p>
          <p className="text-slate-600">
            The average agent loses 2&ndash;3 referrals per year simply by not following up.
            One text every few months is all it takes to stay top-of-mind.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 md:gap-12"
        >
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500">
              <badge.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
