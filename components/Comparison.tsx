"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

type Cell = "yes" | "no" | "partial";

interface Row {
  feature: string;
  note?: string;
  clientpro: Cell;
  bombbomb: Cell;
  happygrasshopper: Cell;
  followupboss: Cell;
}

const rows: Row[] = [
  {
    feature: "Dedicated local-area-code number for each agent",
    note: "Clients see YOU on caller ID, not a shortcode",
    clientpro: "yes",
    bombbomb: "no",
    happygrasshopper: "no",
    followupboss: "partial",
  },
  {
    feature: "10-year cadence built for past clients",
    note: "22 messages scheduled across the client lifecycle",
    clientpro: "yes",
    bombbomb: "no",
    happygrasshopper: "partial",
    followupboss: "no",
  },
  {
    feature: "Built-in TCPA compliance + opt-out handling",
    clientpro: "yes",
    bombbomb: "partial",
    happygrasshopper: "partial",
    followupboss: "partial",
  },
  {
    feature: "Message personalization with client property data",
    clientpro: "yes",
    bombbomb: "no",
    happygrasshopper: "partial",
    followupboss: "partial",
  },
  {
    feature: "AI-personalized messages with live market data",
    note: "Rolling out Q2 \u2014 ClientPro leading the category",
    clientpro: "partial",
    bombbomb: "no",
    happygrasshopper: "no",
    followupboss: "no",
  },
  {
    feature: "Referral pipeline tracking",
    clientpro: "yes",
    bombbomb: "no",
    happygrasshopper: "no",
    followupboss: "yes",
  },
  {
    feature: "Team + brokerage dashboard",
    clientpro: "yes",
    bombbomb: "partial",
    happygrasshopper: "partial",
    followupboss: "yes",
  },
  {
    feature: "Price (solo agent starting tier)",
    clientpro: "yes",
    bombbomb: "partial",
    happygrasshopper: "partial",
    followupboss: "partial",
  },
];

const priceRow = {
  clientpro: "$29/mo",
  bombbomb: "$49/mo",
  happygrasshopper: "$69/mo",
  followupboss: "$69/mo",
};

function CellIcon({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <div className="flex justify-center">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-4 h-4 text-primary" strokeWidth={3} />
        </div>
      </div>
    );
  }
  if (value === "no") {
    return (
      <div className="flex justify-center">
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
          <X className="w-4 h-4 text-slate-400" strokeWidth={3} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
        <Minus className="w-4 h-4 text-yellow-600" strokeWidth={3} />
      </div>
    </div>
  );
}

export default function Comparison() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            How ClientPro compares
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Most agent tools try to do everything. ClientPro is the only one
            built from day one for past-client follow-up.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm"
        >
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left text-xs uppercase tracking-wide text-slate-500 font-semibold px-6 py-4 w-[40%]">
                  Feature
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="text-primary font-bold text-base">
                    ClientPro
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    {priceRow.clientpro}
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="text-slate-700 font-semibold text-base">
                    BombBomb
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    {priceRow.bombbomb}
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="text-slate-700 font-semibold text-base">
                    Happy Grasshopper
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    {priceRow.happygrasshopper}
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="text-slate-700 font-semibold text-base">
                    Follow Up Boss
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    {priceRow.followupboss}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={
                    i % 2 === 0 ? "bg-white" : "bg-gray-100/40"
                  }
                >
                  <td className="px-6 py-4 align-top">
                    <p className="text-dark font-medium">{row.feature}</p>
                    {row.note && (
                      <p className="text-xs text-slate-500 mt-1">{row.note}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 bg-primary/5">
                    <CellIcon value={row.clientpro} />
                  </td>
                  <td className="px-4 py-4">
                    <CellIcon value={row.bombbomb} />
                  </td>
                  <td className="px-4 py-4">
                    <CellIcon value={row.happygrasshopper} />
                  </td>
                  <td className="px-4 py-4">
                    <CellIcon value={row.followupboss} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-6 text-xs text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-3 h-3 text-primary" strokeWidth={3} />
            </div>
            <span>Full support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
              <Minus className="w-3 h-3 text-yellow-600" strokeWidth={3} />
            </div>
            <span>Partial / add-on</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
              <X className="w-3 h-3 text-slate-400" strokeWidth={3} />
            </div>
            <span>Not offered</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-slate-400 mt-4 max-w-2xl mx-auto"
        >
          Prices and features reflect each vendor&rsquo;s publicly listed solo
          agent entry plan at time of publication. Comparison is our honest
          read of the space &mdash; if something changed, email{" "}
          <a
            href="mailto:support@clientpro.io"
            className="underline hover:text-primary"
          >
            support@clientpro.io
          </a>{" "}
          and we&rsquo;ll update it.
        </motion.p>
      </div>
    </section>
  );
}
