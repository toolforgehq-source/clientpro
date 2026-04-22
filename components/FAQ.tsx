"use client";

import { motion } from "framer-motion";

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
    a: "No. ClientPro starts at $29/month\u2014less than a single client lunch. One referral from a past client pays for the entire year. This is an investment that pays for itself.",
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
    a: "You can import clients via CSV today\u2014it takes 30 seconds. Native integrations with Follow Up Boss, KVCore, and LionDesk are launching soon. Once connected, new past clients sync automatically.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-12 md:py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark text-center mb-4"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-500 mb-12 md:mb-16 max-w-2xl mx-auto"
        >
          Everything agents ask before signing up. If something isn&rsquo;t
          here, email{" "}
          <a
            href="mailto:support@clientpro.io"
            className="underline hover:text-primary"
          >
            support@clientpro.io
          </a>
          .
        </motion.p>

        <div className="max-w-3xl mx-auto grid gap-4 md:grid-cols-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow"
            >
              <h3 className="font-semibold text-dark mb-2">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
