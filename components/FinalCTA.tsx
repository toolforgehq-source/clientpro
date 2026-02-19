"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="py-12 md:py-20 bg-dark">
      <div className="max-w-container mx-auto px-6 text-center">
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
            className="inline-block bg-primary text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Building Your Pipeline &rarr;
          </a>
          <p className="text-slate-500 text-sm mt-6">
            No credit card required to explore pricing. Takes 2 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
