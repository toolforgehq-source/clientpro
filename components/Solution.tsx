"use client";

import { motion } from "framer-motion";
import { UserPlus, MessageCircle, PhoneCall } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Add Your Clients",
    description:
      "Import your past clients or add them one at a time. Takes 30 seconds per client.",
  },
  {
    icon: MessageCircle,
    title: "We Keep You Top-of-Mind",
    description:
      "Personalized texts go out from your number. Home tips, market updates, check-ins. Feels like you, not a robot.",
  },
  {
    icon: PhoneCall,
    title: "Get Repeat Business + Referrals",
    description:
      "When they're ready to move again—or their friend needs an agent—you get the call. Not your competition.",
  },
];

const timeline = [
  { time: "Week 1", message: "Hey [Name]! Hope you're settling into [City] well! 🏡" },
  { time: "Month 3", message: "How's the [property type] treating you? Any questions?" },
  { time: "Month 6", message: "Quick update: Homes in [City] are up 4% this quarter 📈" },
  { time: "Year 1", message: "Happy house-iversary! 🎉 Can you believe it's been a year?" },
  { time: "Year 2+", message: "Just checking in! How's life in [City]?" },
];

export default function Solution() {
  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Be the First Agent They Think Of
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether they&apos;re ready to buy again or someone they know needs
            help, ClientPro keeps you top-of-mind with automated, personalized
            messages.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-semibold text-primary mb-2">
                Step {i + 1}
              </p>
              <h3 className="text-xl font-bold text-dark mb-3">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-dark text-center mb-10">
            Your Automated Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20" />
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-start gap-4 mb-8 ${
                  i % 2 === 0
                    ? "md:flex-row md:text-right"
                    : "md:flex-row-reverse md:text-left"
                }`}
              >
                <div className="hidden md:block flex-1">
                  {i % 2 === 0 ? (
                    <div className="pr-8">
                      <p className="text-sm font-bold text-primary">{item.time}</p>
                      <div className="bg-gray-100 rounded-xl p-4 mt-2 text-left">
                        <p className="text-sm text-slate-600">{item.message}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-8">
                      <p className="text-sm font-bold text-primary">{item.time}</p>
                      <div className="bg-gray-100 rounded-xl p-4 mt-2 text-left">
                        <p className="text-sm text-slate-600">{item.message}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative z-10 w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2" />
                <div className="flex-1 md:hidden pl-6">
                  <p className="text-sm font-bold text-primary">{item.time}</p>
                  <div className="bg-gray-100 rounded-xl p-4 mt-2">
                    <p className="text-sm text-slate-600">{item.message}</p>
                  </div>
                </div>
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
