"use client";

import { BarChart3, TrendingUp, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/ui/Badge";
import { DEMO_CLIENTS } from "@/lib/demoData";
import { getEngagementColor } from "@/lib/utils";
import { useDemo } from "@/context/DemoContext";

const monthlyData = [
  { name: "6mo ago", messages: 3 },
  { name: "5mo ago", messages: 5 },
  { name: "4mo ago", messages: 7 },
  { name: "3mo ago", messages: 6 },
  { name: "2mo ago", messages: 9 },
  { name: "This month", messages: 8 },
];

const replyData = [
  { name: "Week 1", rate: 45 },
  { name: "Month 3", rate: 32 },
  { name: "Month 6", rate: 28 },
  { name: "Year 1", rate: 38 },
];

export default function DemoAnalyticsPage() {
  const { triggerCTA } = useDemo();

  const topEngaged = [...DEMO_CLIENTS]
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .slice(0, 3);

  const lowEngaged = [...DEMO_CLIENTS]
    .sort((a, b) => a.engagement_score - b.engagement_score)
    .slice(0, 2);

  const avgEngagement = Math.round(
    DEMO_CLIENTS.reduce((sum, c) => sum + c.engagement_score, 0) / DEMO_CLIENTS.length
  );

  return (
    <div>
      <Header title="Analytics" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Average Engagement"
          value={avgEngagement}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Reply Rate"
          value="37.5%"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          title="Referrals / 100 Clients"
          value="60.0"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Messages Sent (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#1e8a9c"
                strokeWidth={2}
                dot={{ fill: "#1e8a9c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Reply Rate by Message Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={replyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip />
              <Bar dataKey="rate" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Top Engaged Clients</h3>
          <div className="space-y-2">
            {topEngaged.map((client) => (
              <button
                key={client.id}
                onClick={() => triggerCTA("view client details")}
                className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-900">
                  {client.first_name} {client.last_name}
                </span>
                <Badge className={getEngagementColor(client.engagement_score)}>
                  {client.engagement_score}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Low Engaged Clients</h3>
          <div className="space-y-2">
            {lowEngaged.map((client) => (
              <button
                key={client.id}
                onClick={() => triggerCTA("view client details")}
                className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-900">
                  {client.first_name} {client.last_name}
                </span>
                <Badge className={getEngagementColor(client.engagement_score)}>
                  {client.engagement_score}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
