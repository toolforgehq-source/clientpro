"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  RefreshCw,
  Users,
  BarChart3,
  UsersRound,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Automated Text Messages",
    description:
      "12 personalized texts over 5 years from a dedicated local number matched to your area code. Consistent check-ins every 2-3 months in year one, then milestone anniversaries. Each message includes their name, property details, and city. Edit any message or let them send as-is.",
  },
  {
    icon: RefreshCw,
    title: "Repeat Client Tracking",
    description:
      "See which past clients are approaching typical move timelines (7-13 years). Know when to reach out personally.",
  },
  {
    icon: Users,
    title: "Referral Management",
    description:
      "When a client refers someone, you see it instantly. Track every referral opportunity.",
  },
  {
    icon: BarChart3,
    title: "Engagement Insights",
    badge: "Elite+",
    description:
      "See who's responding to your messages and who might need a personal call.",
  },
  {
    icon: UsersRound,
    title: "Team Dashboard",
    badge: "Team+",
    description:
      "Managers see all agent activity, message performance, and team-wide referrals.",
  },
  {
    icon: Smartphone,
    title: "Works On Any Device",
    description:
      "Add ClientPro to your phone's home screen for an app-like experience. No download required — works on iPhone, Android, and desktop.",
  },
];

export default function Features() {
  return (
    <section className="relative py-12 md:py-20 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      <div className="relative max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Everything You Need to Stay Connected
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful tools that work on autopilot so you can focus on closing deals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-dark">{feature.title}</h3>
                {feature.badge && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                    {feature.badge}
                  </span>
                )}
              </div>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
