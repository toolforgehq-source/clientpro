"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function ROICalculator() {
  const [deals, setDeals] = useState(12);
  const [commission, setCommission] = useState(9000);

  const totalPastClients = deals * 3;
  const repeatClients = Math.round(totalPastClients * 0.2);
  const referrals = Math.round(totalPastClients * 0.21);
  const totalOpportunities = repeatClients + referrals;
  const missedRevenue = totalOpportunities * commission;

  const annualCost =
    totalPastClients <= 20
      ? 470
      : totalPastClients <= 100
        ? 1490
        : totalPastClients <= 500
          ? 2990
          : 7990;

  return (
    <section className="py-12 md:py-20 bg-gray-100">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Calculate What You&apos;re Losing
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10"
        >
          <div className="space-y-8 mb-10">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-dark">
                  How many deals do you close per year?
                </label>
                <span className="text-2xl font-bold text-primary">{deals}</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={deals}
                onChange={(e) => setDeals(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5</span>
                <span>50</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-dark block mb-3">
                Average commission per deal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  $
                </span>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded-lg pl-8 pr-4 py-3 text-lg font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6 md:p-8">
            <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
              Based on industry data:
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">
                  Past clients who will buy/sell again (20%)
                </span>
                <span className="font-bold text-dark">
                  {repeatClients} clients
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">
                  Potential referrals (21%)
                </span>
                <span className="font-bold text-dark">
                  {referrals} referrals
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">
                  Total missed deals
                </span>
                <span className="font-bold text-primary text-xl">
                  {totalOpportunities} deals
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">
                  Revenue you&apos;re probably missing
                </span>
                <span className="font-bold text-primary text-xl">
                  {formatCurrency(missedRevenue)}
                </span>
              </div>
            </div>

            <div className="bg-dark rounded-lg p-4 text-center">
              <p className="text-white text-sm mb-1">
                ClientPro costs{" "}
                <span className="font-bold text-accent">
                  {formatCurrency(annualCost)}/year
                </span>{" "}
                for your volume.
              </p>
              <p className="text-white font-bold text-lg">
                Recapture just ONE deal and you&apos;re profitable. Forever.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="#pricing"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Stop Losing Money &rarr;
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
