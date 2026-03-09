"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type ShowcaseItem = {
  src: string;
  alt: string;
  label: string;
  description: string;
  type: "image" | "video";
};

const items: ShowcaseItem[] = [
  {
    src: "/screenshots/demo.mp4",
    alt: "ClientPro product walkthrough demo video",
    label: "Watch Demo",
    description:
      "A real walkthrough of the ClientPro dashboard — see how easy it is to manage clients and automated follow-up.",
    type: "video",
  },
  {
    src: "/screenshots/dashboard.png",
    alt: "ClientPro Dashboard — track clients, messages, replies, and referrals at a glance",
    label: "Dashboard",
    description:
      "See all your clients, scheduled messages, replies, and referrals in one place.",
    type: "image",
  },
  {
    src: "/screenshots/clients.png",
    alt: "ClientPro Clients list — manage past clients with property details and engagement scores",
    label: "Client Management",
    description:
      "Import past clients via CSV or add them manually. Every client gets automated, personalized follow-up.",
    type: "image",
  },
  {
    src: "/screenshots/messages.png",
    alt: "ClientPro Messages — view upcoming automated texts with edit and cancel options",
    label: "Message Schedule",
    description:
      "Preview every message before it sends. Edit the copy, reschedule, or let it go out automatically.",
    type: "image",
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-12 md:py-20 bg-slate-50 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="relative max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            See It in Action
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real screenshots from the ClientPro dashboard. What you see is what
            you get.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {items.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active === i
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Screenshot display */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-400">
                app.clientpro.io
              </span>
            </div>
            <div className="relative w-full aspect-[16/9]">
              {items[active].type === "video" ? (
                <video
                  src={items[active].src}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <Image
                  src={items[active].src}
                  alt={items[active].alt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                />
              )}
            </div>
          </div>
          <p className="text-center text-slate-600 mt-6 text-lg">
            {items[active].description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
