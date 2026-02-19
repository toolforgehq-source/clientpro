"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function CountUp({
  target,
  suffix = "%",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 91,
    label: "of agents never contact past clients after closing",
  },
  {
    value: 41,
    label: "of business comes from repeat clients (20%) + referrals (21%)",
  },
  {
    value: 82,
    label: "of sellers say they'd work with you again—but only 23% actually do",
  },
];

export default function Problem() {
  return (
    <section className="py-12 md:py-20 bg-dark">
      <div className="max-w-container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16"
        >
          You&apos;re Leaving $50,000 on the Table Every Year
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <p className="text-5xl md:text-6xl font-bold text-primary mb-3">
                <CountUp target={stat.value} />
              </p>
              <p className="text-gray-300 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-300 text-lg text-center max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          You worked hard to close that deal. But the moment you hand over the
          keys, that relationship goes cold. Three years later, they&apos;re
          ready to upgrade&mdash;but they call the agent who texted them last
          month, not you. Their sister asks for a referral&mdash;they recommend
          whoever stayed in touch. You&apos;re invisible.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-primary/40 bg-primary/10 rounded-xl p-6 max-w-3xl mx-auto text-center"
        >
          <p className="text-white text-lg font-medium">
            The average homeowner moves every 7&ndash;13 years. If you&apos;re
            not staying in touch, someone else will be there when they&apos;re
            ready.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
