"use client";

import { motion } from "framer-motion";
import { Users, BarChart3, Shield, Eye, Building2, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Every Agent Stays Connected",
    description:
      "Roll out automated past-client follow-up across your entire brokerage. Every agent gets personalized texts from their own number.",
  },
  {
    icon: BarChart3,
    title: "Team Dashboard",
    description:
      "See all agent activity, message performance, and team-wide referrals in one place. Know which agents are generating repeat business.",
  },
  {
    icon: Eye,
    title: "Manager Oversight",
    description:
      "Review messages before they go out. Ensure brand consistency and compliance across every agent on your team.",
  },
  {
    icon: Shield,
    title: "Full TCPA Compliance",
    description:
      "Built-in opt-out handling, audit trails, and compliance tools. Protect your brokerage from regulatory risk.",
  },
];

const painPoints = [
  {
    problem: "Agents leave and take their client relationships with them",
    solution: "ClientPro keeps past-client relationships active at the brokerage level",
  },
  {
    problem: "No visibility into agent follow-up activity",
    solution: "Dashboard shows every message, every response, every referral",
  },
  {
    problem: "Inconsistent client experience across your team",
    solution: "Standardized, professional follow-up from every agent",
  },
  {
    problem: "Paying for CRM tools agents don't actually use",
    solution: "Set it and forget it\u2014agents import clients once, we handle the rest",
  },
];

export default function BrokeragesContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-slate-900 to-dark" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative max-w-container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              <span>For Brokerages &amp; Team Leaders</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Your Agents Are Losing Referrals.{" "}
              <span className="text-primary">Fix It at Scale.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Most agents never follow up with past clients after closing.
              That means your brokerage is leaving repeat business and
              referrals on the table every single month. ClientPro fixes
              that for every agent on your team, automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:sales@clientpro.io"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-center hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Talk to Sales &rarr;
              </a>
              <a
                href="/#pricing"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-center hover:bg-white/10 transition-all duration-200"
              >
                View Pricing
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              The Problem Every Brokerage Faces
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              You invest in recruiting and training agents. But the repeat
              business and referrals from their past clients? That revenue
              disappears the moment they stop following up.
            </p>
          </motion.div>

          <div className="space-y-6 max-w-3xl mx-auto">
            {painPoints.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-100 rounded-xl p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-red-500 text-sm font-bold">&times;</span>
                  </div>
                  <div>
                    <p className="text-dark font-medium mb-2">{item.problem}</p>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <p className="text-slate-600">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="max-w-container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              What You Get With ClientPro for Brokerages
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Brokerage Pricing
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Unlimited agents, unlimited clients, dedicated account manager.
            </p>

            <div className="bg-gray-100 rounded-2xl p-8 md:p-12 mb-8">
              <div className="mb-6">
                <span className="text-5xl font-bold text-dark">$1,499</span>
                <span className="text-slate-500 text-lg">/mo</span>
                <p className="text-sm text-slate-500 mt-2">
                  $14,990/year &middot;{" "}
                  <span className="text-accent font-medium">Save $2,998</span>
                </p>
              </div>
              <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-primary font-bold">&#10003;</span>
                  Unlimited agents
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-primary font-bold">&#10003;</span>
                  Unlimited clients
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-primary font-bold">&#10003;</span>
                  Team dashboard &amp; manager oversight
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-primary font-bold">&#10003;</span>
                  Engagement insights for every agent
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-primary font-bold">&#10003;</span>
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-primary font-bold">&#10003;</span>
                  TCPA compliance tools &amp; audit trails
                </li>
              </ul>
              <a
                href="mailto:sales@clientpro.io"
                className="inline-block bg-primary text-white px-10 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Contact Sales &rarr;
              </a>
            </div>

            <p className="text-slate-500 text-sm">
              Need a custom plan for your brokerage? Email{" "}
              <a
                href="mailto:sales@clientpro.io"
                className="text-primary hover:underline"
              >
                sales@clientpro.io
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 md:py-24 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative max-w-container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Stop Leaving Money on the Table?
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              If each agent recaptures just one deal per year from a past
              client, the ROI pays for itself many times over.
            </p>
            <a
              href="mailto:sales@clientpro.io"
              className="inline-block bg-primary text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Talk to Sales &rarr;
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
