"use client";

import { UserPlus, Users } from "lucide-react";
import { useDemo } from "@/context/DemoContext";
import { DEMO_REFERRALS } from "@/lib/demoData";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function DemoReferralsPage() {
  const { triggerCTA } = useDemo();

  const stats = {
    total: DEMO_REFERRALS.length,
    new: DEMO_REFERRALS.filter((r) => r.status === "new").length,
    contacted: DEMO_REFERRALS.filter((r) => r.status === "contacted").length,
    converted: DEMO_REFERRALS.filter((r) => r.status === "converted").length,
  };

  return (
    <div>
      <Header
        title="Referrals"
        actions={
          <Button onClick={() => triggerCTA("add a referral")}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Referral
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="New"
          value={stats.new}
          icon={<UserPlus className="h-5 w-5" />}
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Converted"
          value={stats.converted}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Referral Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Referred By</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone / Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date Added</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_REFERRALS.map((ref) => (
                <tr key={ref.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {ref.referral_first_name} {ref.referral_last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ref.referring_client_name || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ref.referral_phone || ref.referral_email || "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(ref.status)}>{ref.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ref.created_at)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => triggerCTA("update this referral")}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
