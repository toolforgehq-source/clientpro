"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  StickyNote,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  UserPlus,
} from "lucide-react";
import { api, Client, Message, Referral } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import {
  formatDate,
  getEngagementColor,
  getStatusColor,
  PROPERTY_TYPE_LABELS,
  formatPhone,
  toE164,
  US_STATES,
  PROPERTY_TYPES,
} from "@/lib/utils";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(searchParams.get("edit") === "true");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMessageModal, setEditMessageModal] = useState<Message | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [savingMessage, setSavingMessage] = useState(false);

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    property_address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "",
    closing_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await api.clients.get(clientId);
      if (error || !data) {
        toast("error", error || "Client not found");
        router.push("/dashboard/clients");
        return;
      }
      setClient(data.client);
      setMessages(data.messages || []);
      setReferrals(data.referrals || []);
      setEditForm({
        first_name: data.client.first_name,
        last_name: data.client.last_name,
        phone_number: formatPhone(data.client.phone_number),
        email: data.client.email || "",
        property_address: data.client.property_address || "",
        city: data.client.city || "",
        state: data.client.state || "",
        zip: data.client.zip || "",
        property_type: data.client.property_type || "",
        closing_date: data.client.closing_date?.split("T")[0] || "",
        notes: data.client.notes || "",
      });
      setLoading(false);
    };
    fetchData();
  }, [clientId, router, toast]);

  const handleEdit = async () => {
    setSaving(true);
    const { data, error } = await api.clients.update(clientId, {
      ...editForm,
      phone_number: toE164(editForm.phone_number),
      email: editForm.email || undefined,
    });
    setSaving(false);
    if (error) {
      toast("error", error);
    } else if (data) {
      setClient(data.client);
      toast("success", "Client updated");
      setEditModal(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await api.clients.delete(clientId);
    setDeleting(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Client removed");
      router.push("/dashboard/clients");
    }
  };

  const handleSaveMessage = async () => {
    if (!editMessageModal) return;
    setSavingMessage(true);
    const { error } = await api.messages.update(editMessageModal.id, {
      message_text: editMessageText,
    });
    setSavingMessage(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Message updated");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editMessageModal.id ? { ...m, message_text: editMessageText } : m
        )
      );
      setEditMessageModal(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading client..." />;
  if (!client) return null;

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );

  return (
    <div>
      <Header
        title={`${client.first_name} ${client.last_name}`}
        breadcrumbs={[
          { label: "Clients", href: "/dashboard/clients" },
          { label: `${client.first_name} ${client.last_name}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={getEngagementColor(client.engagement_score)}>
              Score: {client.engagement_score}
            </Badge>
            <Button variant="secondary" size="sm" onClick={() => setEditModal(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Client Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${client.phone_number}`} className="hover:text-primary">
                  {client.phone_number}
                </a>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {client.email}
                </div>
              )}
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  {client.property_address && <p>{client.property_address}</p>}
                  <p>
                    {[client.city, client.state, client.zip].filter(Boolean).join(", ")}
                  </p>
                  {client.property_type && (
                    <p className="text-xs text-gray-400">
                      {PROPERTY_TYPE_LABELS[client.property_type] || client.property_type}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                Closed {formatDate(client.closing_date)}
              </div>
              {client.notes && (
                <div className="flex items-start gap-2 text-gray-600">
                  <StickyNote className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p>{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">Automated Messages</h3>
            {sortedMessages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages scheduled</p>
            ) : (
              <div className="space-y-4">
                {sortedMessages.map((msg) => {
                  const isSent = msg.status === "sent" || msg.status === "delivered";
                  const isFailed = msg.status === "failed";
                  return (
                    <div key={msg.id} className="relative flex gap-3 pl-6">
                      <div className="absolute left-0 top-1">
                        {isSent ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isFailed ? (
                          <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-xs text-red-600">!</span>
                          </div>
                        ) : (
                          <Clock className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {msg.message_type?.replace(/_/g, " ")}
                          </span>
                          <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {msg.message_text}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {isSent
                              ? `Sent ${formatDate(msg.sent_at || msg.scheduled_date)}`
                              : `Scheduled ${formatDate(msg.scheduled_date)}`}
                          </span>
                          {!isSent && !isFailed && msg.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditMessageModal(msg);
                                setEditMessageText(msg.message_text);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                        {msg.reply_text && (
                          <div className="mt-2 rounded-lg bg-green-50 p-2 border border-green-100">
                            <p className="text-xs font-medium text-green-700">Client replied:</p>
                            <p className="text-sm text-green-800">{msg.reply_text}</p>
                            <p className="mt-1 text-xs text-green-600">
                              {msg.reply_at ? formatDate(msg.reply_at) : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Referrals</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/dashboard/referrals?from=${clientId}`)}
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {referrals.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="h-10 w-10" />}
                title="No referrals yet"
                description="Track referrals from this client"
              />
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="rounded-lg border border-gray-100 p-3">
                    <p className="font-medium text-gray-900 text-sm">
                      {ref.referral_first_name} {ref.referral_last_name}
                    </p>
                    <Badge className={`mt-1 ${getStatusColor(ref.status)}`}>{ref.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Client" maxWidth="max-w-xl">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="edit_first_name"
              label="First Name"
              value={editForm.first_name}
              onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
            />
            <Input
              id="edit_last_name"
              label="Last Name"
              value={editForm.last_name}
              onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
            />
          </div>
          <Input
            id="edit_phone"
            label="Phone"
            value={editForm.phone_number}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, phone_number: formatPhone(e.target.value) }))
            }
          />
          <Input
            id="edit_email"
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            id="edit_address"
            label="Property Address"
            value={editForm.property_address}
            onChange={(e) => setEditForm((f) => ({ ...f, property_address: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="edit_city"
              label="City"
              value={editForm.city}
              onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={editForm.state}
                onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              id="edit_zip"
              label="ZIP"
              value={editForm.zip}
              onChange={(e) => setEditForm((f) => ({ ...f, zip: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={editForm.property_type}
              onChange={(e) => setEditForm((f) => ({ ...f, property_type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <Input
            id="edit_closing_date"
            label="Closing Date"
            type="date"
            value={editForm.closing_date}
            onChange={(e) => setEditForm((f) => ({ ...f, closing_date: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleEdit}>Save Changes</Button>
        </div>
      </Modal>

      <Modal open={deleteModal} onClose={() => { setDeleteModal(false); setDeleteConfirm(false); }} title="Delete Client">
        <p className="text-sm text-gray-600">
          This will delete <strong>{client.first_name} {client.last_name}</strong> and cancel all future messages.
        </p>
        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">I understand this cannot be undone</span>
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => { setDeleteModal(false); setDeleteConfirm(false); }}>Cancel</Button>
          <Button variant="danger" disabled={!deleteConfirm} loading={deleting} onClick={handleDelete}>Delete Client</Button>
        </div>
      </Modal>

      <Modal
        open={!!editMessageModal}
        onClose={() => setEditMessageModal(null)}
        title="Edit Message"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Text</label>
            <textarea
              value={editMessageText}
              onChange={(e) => setEditMessageText(e.target.value)}
              rows={4}
              maxLength={160}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {editMessageText.length}/160 characters
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">SMS Preview</p>
            <div className="rounded-lg bg-green-100 p-3 text-sm text-gray-800 max-w-[250px]">
              {editMessageText || "..."}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditMessageModal(null)}>Cancel</Button>
            <Button loading={savingMessage} onClick={handleSaveMessage}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
