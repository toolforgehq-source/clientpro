"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Brain,
  RefreshCw,
  Users,
  BarChart3,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Automated Text Messages",
    description:
      "Messages sent from your dedicated number. Clients can reply directly. Feels like you, not a robot.",
  },
  {
    icon: Brain,
    title: "AI Personalization",
    badge: "Professional+",
    description:
      "Every message customized based on their property type, location, and how long they've owned. Not generic templates.",
  },
  {
    icon: RefreshCw,
    title: "Repeat Client Tracking",
    description:
      "See which past clients are approaching typical move timelines. Know when to reach out personally.",
  },
  {
    icon: Users,
    title: "Referral Management",
    description:
      "Track who's referring you. Thank them automatically. Never miss a warm lead.",
  },
  {
    icon: BarChart3,
    title: "Engagement Analytics",
    description:
      "Know who's responding and who needs a personal call. See your pipeline building in real-time.",
  },
  {
    icon: Building2,
    title: "White-Label for Brokerages",
    description:
      "Brand the entire platform as your proprietary tech. Recruit better agents with better tools.",
  },
];

export default function Features() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark text-center mb-16"
        >
          Everything You Need to Stay Connected
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-slate-200 rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
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
