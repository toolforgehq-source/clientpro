"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="pt-24 md:pt-32 pb-0 bg-white">
      <div className="max-w-container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium text-primary mb-4">
              Join 500+ agents who stay connected to past clients
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
              Never Lose Touch With a Past Client Again
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Automated text messages that keep you top-of-mind. When
              they&apos;re ready to buy again&mdash;or their friend needs an
              agent&mdash;you get the call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#pricing"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-center hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Building Your Pipeline &rarr;
              </a>
              <a
                href="#how-it-works"
                className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-center hover:bg-primary hover:text-white transition-all duration-200"
              >
                See How It Works &darr;
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-72 mx-auto">
              <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.25rem] overflow-hidden">
                  <div className="bg-primary px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                      SM
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Sarah Mitchell
                      </p>
                      <p className="text-white/70 text-xs">Past Client</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 min-h-[320px]">
                    <div className="flex justify-end">
                      <div className="bg-primary text-white text-sm px-4 py-2 rounded-2xl rounded-br-md max-w-[85%]">
                        Hey Sarah! How&apos;s life in Austin? 🏡
                      </div>
                    </div>
                    <p className="text-center text-xs text-slate-400">
                      2:34 PM
                    </p>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-dark text-sm px-4 py-2 rounded-2xl rounded-bl-md max-w-[85%]">
                        Love it! Actually, my sister is looking to buy...
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-white text-sm px-4 py-2 rounded-2xl rounded-br-md max-w-[85%]">
                        I&apos;d love to help her! When&apos;s a good time to
                        chat?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-dark text-sm px-4 py-2 rounded-2xl rounded-bl-md max-w-[85%]">
                        She&apos;s free this weekend! I&apos;ll send you her
                        number 😊
                      </div>
                    </div>
                    <p className="text-center text-xs text-accent font-medium pt-2">
                      +$9,000 referral commission
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-100 mt-16 py-6">
        <div className="max-w-container mx-auto px-6 text-center">
          <p className="text-lg text-slate-700 font-medium">
            <span className="text-primary font-bold">41%</span> of your business
            should come from past clients. Most agents get less than{" "}
            <span className="text-primary font-bold">10%</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
