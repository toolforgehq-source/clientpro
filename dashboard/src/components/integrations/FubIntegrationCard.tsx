"use client";

import { useCallback, useEffect, useState } from "react";
import { api, FubImportResult, FubPreviewPerson, FubStatus } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "never";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FubIntegrationCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<FubStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<{ total: number; people: FubPreviewPerson[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<FubImportResult | null>(null);
  const [defaultClosingDate, setDefaultClosingDate] = useState("");

  const refreshStatus = useCallback(async () => {
    const { data } = await api.fub.status();
    if (data) setStatus(data);
    setLoadingStatus(false);
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast("error", "Paste your Follow Up Boss API key first.");
      return;
    }
    setConnecting(true);
    const { data, error } = await api.fub.connect({ api_key: apiKey.trim() });
    setConnecting(false);
    if (error) {
      toast("error", error);
      return;
    }
    if (data) setStatus(data);
    setApiKey("");
    toast("success", "Connected to Follow Up Boss");
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    const { data, error } = await api.fub.disconnect();
    setDisconnecting(false);
    if (error) {
      toast("error", error);
      return;
    }
    if (data) setStatus(data);
    setPreview(null);
    setImportResult(null);
    toast("success", "Disconnected from Follow Up Boss");
  };

  const handlePreview = async () => {
    setPreviewing(true);
    const { data, error } = await api.fub.preview();
    setPreviewing(false);
    if (error) {
      toast("error", error);
      return;
    }
    if (data) setPreview({ total: data.total, people: data.people });
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    const { data, error } = await api.fub.import({
      default_closing_date: defaultClosingDate || undefined,
    });
    setImporting(false);
    if (error) {
      toast("error", error);
      return;
    }
    if (data) {
      setImportResult(data);
      toast(
        "success",
        `Imported ${data.imported} contact${data.imported === 1 ? "" : "s"} from Follow Up Boss`
      );
      refreshStatus();
    }
  };

  if (loadingStatus) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading Follow Up Boss integration…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Follow Up Boss{" "}
            <span className="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              Read-only
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Pull past clients out of Follow Up Boss and schedule the 22-message ClientPro cadence
            for each one. This is read-only — we never write back to FUB.
          </p>
        </div>
        {status?.connected ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Not connected
          </span>
        )}
      </div>

      {!status?.connected ? (
        <div className="space-y-3">
          <Input
            id="fub_api_key"
            label="Follow Up Boss API key"
            type="password"
            placeholder="fka_live_…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500">
            Find your key in Follow Up Boss under <span className="font-medium">Admin → API</span>.
            It&apos;s stored encrypted at rest and only used to read your people list.
          </p>
          <Button loading={connecting} onClick={handleConnect}>
            Connect Follow Up Boss
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <div>
              Connected as{" "}
              <span className="font-medium text-gray-900">
                {status.identity?.name || "your Follow Up Boss account"}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Last import: {formatRelative(status.last_sync_at)}
              {status.last_sync_count != null && status.last_sync_count > 0
                ? ` · ${status.last_sync_count} contact${status.last_sync_count === 1 ? "" : "s"}`
                : ""}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" loading={previewing} onClick={handlePreview}>
              Preview contacts
            </Button>
            <Button loading={importing} onClick={handleImport}>
              Import contacts
            </Button>
            <Button variant="secondary" loading={disconnecting} onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>

          <div>
            <Input
              id="fub_default_closing_date"
              label="Default closing date (optional)"
              type="date"
              value={defaultClosingDate}
              onChange={(e) => setDefaultClosingDate(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for contacts that don&apos;t have a closing date. If left blank we use the date
              the person was added to Follow Up Boss.
            </p>
          </div>

          {preview && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-sm font-medium text-gray-900">
                Sample ({preview.people.length} of {preview.total} total)
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {preview.people.map((p, i) => (
                  <li key={p.fub_person_id ?? i} className="flex items-start justify-between gap-3">
                    <span className="text-gray-700">
                      {p.ok && p.client
                        ? `${p.client.first_name} ${p.client.last_name}`
                        : `FUB #${p.fub_person_id ?? "?"}`}
                    </span>
                    <span className={p.ok ? "text-gray-500" : "text-amber-700"}>
                      {p.ok && p.client
                        ? `${p.client.phone_number}${p.client.city ? ` · ${p.client.city}` : ""}`
                        : `Skip: ${p.reason}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {importResult && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-medium">Import complete</p>
              <ul className="mt-1 space-y-0.5">
                <li>Imported: {importResult.imported}</li>
                <li>Duplicates skipped: {importResult.skipped_duplicates}</li>
                <li>Invalid / missing fields: {importResult.skipped_invalid}</li>
                <li>Fetched from FUB: {importResult.fub_fetched}</li>
              </ul>
              {importResult.capped_by_tier && (
                <p className="mt-2 text-xs text-amber-800">
                  Your plan&apos;s client limit was reached — upgrade to import more.
                </p>
              )}
              {importResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-emerald-800">
                    {importResult.errors.length} row-level warning
                    {importResult.errors.length === 1 ? "" : "s"}
                  </summary>
                  <ul className="mt-1 space-y-0.5 text-xs text-emerald-900">
                    {importResult.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>
                        FUB #{e.fub_person_id ?? "?"}: {e.reason}
                      </li>
                    ))}
                    {importResult.errors.length > 20 && (
                      <li>… and {importResult.errors.length - 20} more</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
