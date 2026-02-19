"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do messages come from my number?",
    a: "We provision you a dedicated business phone number through our system. To your clients, it looks like texts from you. They can reply directly and you see it instantly in your dashboard. It's seamless.",
  },
  {
    q: "Can I customize the messages?",
    a: "Yes. Every message is pre-written and personalized with your client's name, property details, and city. You can edit any message before it sends, or let them go out as-is. They feel personal because they are.",
  },
  {
    q: "What if a client wants to stop receiving messages?",
    a: 'They reply "STOP" and we automatically opt them out—100% compliant with TCPA regulations. You can also manually opt them out anytime. Full audit trail for compliance.',
  },
  {
    q: "Is there a free trial?",
    a: "No. We're a professional tool for serious agents who understand ROI. One repeat client or referral pays for the entire year. We don't need gimmicks.",
  },
  {
    q: "How long until I see results?",
    a: "Most agents report their first repeat client or referral within 90 days. Remember—past clients move every 7-13 years on average. You're planting seeds. When they're ready, you'll be top-of-mind.",
  },
  {
    q: "Do clients actually respond to these texts?",
    a: "Yes. We see 15-25% reply rates because the messages are genuinely helpful (home maintenance tips, market updates, check-ins) and come from YOUR number. It's relationship maintenance, not spam.",
  },
  {
    q: "Can I switch tiers anytime?",
    a: "Upgrade immediately. Downgrade at next billing cycle. No contracts, no penalties. You're in control.",
  },
  {
    q: "What's the real ROI?",
    a: "Average agent gets 3-5 deals per year from ClientPro (mix of repeat clients and referrals). At $9K average commission, that's $27K-$45K from a $470-$14,990 annual investment. The ROI speaks for itself.",
  },
  {
    q: "What industries does this work for?",
    a: "Primarily real estate agents, but also mortgage brokers, insurance agents, financial advisors, and any professional who relies on repeat business and referrals.",
  },
  {
    q: "Do you integrate with my CRM?",
    a: "You can import clients via CSV. Full native integrations (Follow Up Boss, KVCore, LionDesk) coming soon for Professional tier and above.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 md:py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark text-center mb-16"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100/50 transition-colors"
              >
                <span className="font-semibold text-dark pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-slate-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
