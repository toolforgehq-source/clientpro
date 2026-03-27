"use client";

import { useEffect, useState, useMemo } from "react";
import { Send, Users, Search, Check } from "lucide-react";
import { api, Client } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface CustomMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

export default function CustomMessageModal({ open, onClose, onSent }: CustomMessageModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"recipients" | "compose">("recipients");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendToAll, setSendToAll] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (open) {
      setStep("recipients");
      setSelectedIds(new Set());
      setSendToAll(false);
      setMessageText("");
      setSearch("");
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await api.clients.list({ limit: 500 });
    if (data) {
      setClients(data.clients || []);
    }
    setLoading(false);
  };

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.phone_number.includes(q)
    );
  }, [clients, search]);

  const toggleClient = (id: string) => {
    setSendToAll(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (sendToAll) {
      setSendToAll(false);
      setSelectedIds(new Set());
    } else {
      setSendToAll(true);
      setSelectedIds(new Set());
    }
  };

  const recipientCount = sendToAll ? clients.length : selectedIds.size;

  const handleSend = async () => {
    if (!messageText.trim()) {
      toast("error", "Please enter a message");
      return;
    }
    if (recipientCount === 0) {
      toast("error", "Please select at least one client");
      return;
    }

    setSending(true);
    const payload: { message_text: string; client_ids?: string[]; send_to_all?: boolean } = {
      message_text: messageText.trim(),
    };

    if (sendToAll) {
      payload.send_to_all = true;
    } else {
      payload.client_ids = Array.from(selectedIds);
    }

    const { data, error } = await api.messages.sendCustom(payload);
    setSending(false);

    if (error) {
      toast("error", error);
    } else {
      toast("success", data?.message || "Messages scheduled!");
      onSent();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Custom Message" maxWidth="max-w-xl">
      {step === "recipients" ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Choose who should receive your message. You can pick specific clients or send to everyone.
          </p>

          {/* Send to All toggle */}
          <button
            onClick={toggleAll}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              sendToAll
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Send to all clients</p>
              <p className="text-xs text-gray-500">{clients.length} active client{clients.length !== 1 ? "s" : ""}</p>
            </div>
            {sendToAll && <Check className="h-5 w-5 text-primary" />}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">or select specific clients</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Client list */}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                Loading clients...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                {search ? "No clients match your search" : "No clients yet"}
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = !sendToAll && selectedIds.has(client.id);
                return (
                  <button
                    key={client.id}
                    onClick={() => toggleClient(client.id)}
                    disabled={sendToAll}
                    className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left transition-colors last:border-0 ${
                      sendToAll
                        ? "bg-primary/5 opacity-60"
                        : isSelected
                        ? "bg-primary/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                        isSelected || sendToAll
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {(isSelected || sendToAll) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {client.first_name} {client.last_name}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected count + Next */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              {recipientCount > 0
                ? `${recipientCount} client${recipientCount !== 1 ? "s" : ""} selected`
                : "No clients selected"}
            </p>
            <Button
              onClick={() => setStep("compose")}
              disabled={recipientCount === 0}
            >
              Next: Write Message
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recipient summary */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Users className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              Sending to{" "}
              <span className="font-medium text-gray-900">
                {sendToAll
                  ? `all ${clients.length} clients`
                  : `${selectedIds.size} client${selectedIds.size !== 1 ? "s" : ""}`}
              </span>
            </p>
            <button
              onClick={() => setStep("recipients")}
              className="ml-auto text-xs text-primary hover:underline"
            >
              Change
            </button>
          </div>

          {/* Message input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              maxLength={320}
              placeholder="Type your message here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {messageText.length}/320 characters
            </p>
          </div>

          {/* SMS Preview */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">SMS Preview</p>
            <div className="rounded-xl bg-green-100 px-4 py-2.5 text-sm text-gray-800 max-w-xs">
              {messageText || "Your message will appear here..."}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep("recipients")}>
              Back
            </Button>
            <Button
              loading={sending}
              onClick={handleSend}
              disabled={!messageText.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to {recipientCount} Client{recipientCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
