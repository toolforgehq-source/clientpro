"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Server, Award } from "lucide-react";

const testimonials = [
  {
    quote:
      "I got 2 repeat clients and 3 referrals in my first year with ClientPro. It paid for itself 10x over. Now I know my past clients actually remember me.",
    name: "Sarah M.",
    title: "Luxury Agent, Austin TX",
    detail: "4 years experience, 18 deals/year",
    initials: "SM",
  },
  {
    quote:
      "A client I helped 3 years ago texted back: 'Ready to upgrade—let's talk!' I honestly forgot about them. ClientPro didn't. That one deal paid for 3 years of the service.",
    name: "Mike T.",
    title: "Team Lead, Phoenix AZ",
    detail: "12 years experience, 35 deals/year",
    initials: "MT",
  },
  {
    quote:
      "Half my business now comes from past clients. Before ClientPro it was basically zero. The ROI is insane—I don't know how I worked without this.",
    name: "Jennifer L.",
    title: "Top Producer, Miami FL",
    detail: "8 years experience, 42 deals/year",
    initials: "JL",
  },
];

const badges = [
  { icon: Shield, label: "TCPA Compliant" },
  { icon: Lock, label: "Bank-Level Security" },
  { icon: Server, label: "99.9% Uptime" },
  { icon: Award, label: "SOC 2 Certified" },
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
            Join 500+ Agents Who Never Lose Touch
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real results from agents who stopped letting past clients disappear.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-gray-100 rounded-2xl p-6 md:p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.title}</p>
                  <p className="text-slate-400 text-xs">{t.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
