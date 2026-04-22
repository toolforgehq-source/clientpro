"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

// PLACEHOLDER CONTENT — swap these with real testimonials from launch agents.
// Each testimonial should include agent first + last name, brokerage, city,
// a specific dollar amount or deal count recaptured, and a headshot URL.
// Keep the structure identical so the layout doesn't shift.
const testimonials = [
  {
    quote:
      "I closed two deals in my first 90 days from past clients I hadn't talked to in years. ClientPro paid for itself 20x over in the first quarter.",
    name: "Your First Agent",
    role: "Listing Agent",
    company: "Your Brokerage",
    city: "Austin, TX",
    recaptured: "$18K in commissions in Q1",
    initials: "YA",
  },
  {
    quote:
      "I used to feel guilty about never following up. Now every past client hears from me on a cadence, from my number, and I don't lift a finger.",
    name: "Second Launch Agent",
    role: "Team Lead",
    company: "Your Brokerage",
    city: "Phoenix, AZ",
    recaptured: "3 referrals in first 6 months",
    initials: "SA",
  },
  {
    quote:
      "The dedicated local number is the real trick. Clients actually reply. One of them asked me to list their parents' house the same week.",
    name: "Third Launch Agent",
    role: "Associate Broker",
    company: "Your Brokerage",
    city: "Nashville, TN",
    recaptured: "$24K recaptured deal",
    initials: "TA",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-primary" />
            <span>Trusted by agents who take past clients seriously</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Real agents. Real deals recaptured.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Here&rsquo;s what agents say after 90 days of letting ClientPro
            work their past client list in the background.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-dark leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} &middot; {t.company}
                  </p>
                  <p className="text-xs text-slate-500">{t.city}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                  Result
                </p>
                <p className="text-sm text-dark font-medium">{t.recaptured}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-slate-400 mt-8"
        >
          Testimonials shown are placeholders until first customer interviews
          are recorded. Swap via <code>components/Testimonials.tsx</code>.
        </motion.p>
      </div>
    </section>
  );
}
