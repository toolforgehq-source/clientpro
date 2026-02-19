"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { api, Referral, Client } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import { formatDate, getStatusColor } from "@/lib/utils";

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

function ReferralsContent() {
  const searchParams = useSearchParams();
  const fromClient = searchParams.get("from");
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(!!fromClient);
  const [detailModal, setDetailModal] = useState<Referral | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    referred_by_client_id: fromClient || "",
    referral_first_name: "",
    referral_last_name: "",
    referral_phone: "",
    referral_email: "",
    notes: "",
  });

  const [statusUpdate, setStatusUpdate] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [refRes, clientRes] = await Promise.all([
      api.referrals.list({ limit: 100 }),
      api.clients.list({ limit: 200 }),
    ]);
    if (refRes.data) setReferrals(refRes.data.referrals || []);
    if (clientRes.data) setClients(clientRes.data.clients || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!form.referred_by_client_id || !form.referral_first_name || !form.referral_last_name) {
      toast("error", "Please fill in required fields");
      return;
    }
    setSaving(true);
    const { error } = await api.referrals.create(form);
    setSaving(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Referral added!");
      setAddModal(false);
      setForm({
        referred_by_client_id: "",
        referral_first_name: "",
        referral_last_name: "",
        referral_phone: "",
        referral_email: "",
        notes: "",
      });
      fetchData();
    }
  };

  const handleStatusUpdate = async () => {
    if (!detailModal) return;
    setSaving(true);
    const { error } = await api.referrals.update(detailModal.id, {
      status: statusUpdate,
      notes: statusNotes,
    });
    setSaving(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Referral updated");
      setDetailModal(null);
      fetchData();
    }
  };

  if (loading) return <LoadingSpinner text="Loading referrals..." />;

  const stats = {
    total: referrals.length,
    new: referrals.filter((r) => r.status === "new").length,
    contacted: referrals.filter((r) => r.status === "contacted").length,
    converted: referrals.filter((r) => r.status === "converted").length,
  };

  return (
    <div>
      <Header
        title="Referrals"
        actions={
          <Button onClick={() => setAddModal(true)}>
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

      {referrals.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            icon={<UserPlus className="h-16 w-16" />}
            title="No referrals yet"
            description="Track referrals from your past clients"
            actionLabel="Add Referral"
            onAction={() => setAddModal(true)}
          />
        </div>
      ) : (
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
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {ref.referral_first_name} {ref.referral_last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ref.referring_client_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ref.referral_phone || ref.referral_email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(ref.status)}>{ref.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ref.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDetailModal(ref);
                          setStatusUpdate(ref.status);
                          setStatusNotes(ref.notes || "");
                        }}
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
      )}

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Referral">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who referred them? *</label>
            <select
              value={form.referred_by_client_id}
              onChange={(e) => setForm((f) => ({ ...f, referred_by_client_id: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="ref_first"
              label="First Name *"
              value={form.referral_first_name}
              onChange={(e) => setForm((f) => ({ ...f, referral_first_name: e.target.value }))}
            />
            <Input
              id="ref_last"
              label="Last Name *"
              value={form.referral_last_name}
              onChange={(e) => setForm((f) => ({ ...f, referral_last_name: e.target.value }))}
            />
          </div>
          <Input
            id="ref_phone"
            label="Phone"
            value={form.referral_phone}
            onChange={(e) => setForm((f) => ({ ...f, referral_phone: e.target.value }))}
          />
          <Input
            id="ref_email"
            label="Email"
            value={form.referral_email}
            onChange={(e) => setForm((f) => ({ ...f, referral_email: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAdd}>Add Referral</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Update Referral">
        {detailModal && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                {detailModal.referral_first_name} {detailModal.referral_last_name}
              </p>
              <p className="text-xs text-gray-500">
                Referred by {detailModal.referring_client_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDetailModal(null)}>Cancel</Button>
              <Button loading={saving} onClick={handleStatusUpdate}>Update</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading referrals..." />}>
      <ReferralsContent />
    </Suspense>
  );
}
