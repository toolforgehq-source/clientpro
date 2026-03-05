"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="relative py-16 md:py-24 bg-dark overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="relative max-w-container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Stop Losing $50,000 in Repeat Business and Referrals
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Join 500+ agents who stay connected to past clients. One deal pays
            for itself. Forever.
          </p>
          <a
            href="#pricing"
            className="inline-block bg-primary text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Building Your Pipeline &rarr;
          </a>
          <p className="text-slate-400 text-sm mt-6">
            Setup in 2 minutes &middot; Cancel anytime &middot; TCPA compliant
          </p>
        </motion.div>
      </div>
    </section>
  );
}
