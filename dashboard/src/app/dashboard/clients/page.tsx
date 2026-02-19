"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Search, Plus, Upload, MoreHorizontal, ArrowUpDown, Trash2, Eye, Pencil } from "lucide-react";
import { api, Client } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { formatDate, getEngagementColor, PROPERTY_TYPE_LABELS, TIER_CLIENT_LIMITS } from "@/lib/utils";
import { Users } from "lucide-react";

const columnHelper = createColumnHelper<Client>();

export default function ClientsPage() {
  const router = useRouter();
  const { user, usage } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteModal, setDeleteModal] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data } = await api.clients.list({ page, limit: 25, search: search || undefined });
    if (data) {
      setClients(data.clients || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const { error } = await api.clients.delete(deleteModal.id);
    setDeleting(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Client removed and future messages cancelled");
      setDeleteModal(null);
      setDeleteConfirm(false);
      fetchClients();
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    const { data, error } = await api.clients.import(importFile);
    setImporting(false);
    if (error) {
      toast("error", error);
    } else if (data) {
      toast("success", `Imported ${data.success_count} clients. ${data.error_count} errors.`);
      setImportModal(false);
      setImportFile(null);
      fetchClients();
    }
  };

  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: "name",
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor("phone_number", {
      header: "Phone",
      cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => `${row.property_address || ""} ${row.city || ""}`.trim(), {
      id: "property",
      header: "Property",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <span className="text-gray-900">{row.property_address || "N/A"}</span>
            {row.property_type && (
              <span className="ml-1 text-xs text-gray-500">
                ({PROPERTY_TYPE_LABELS[row.property_type] || row.property_type})
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("closing_date", {
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Closing Date <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => <span className="text-gray-600">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("engagement_score", {
      header: "Engagement",
      cell: (info) => (
        <Badge className={getEngagementColor(info.getValue())}>{info.getValue()}</Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const client = info.row.original;
        const isOpen = menuOpen === client.id;
        return (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(isOpen ? null : client.id);
              }}
              className="rounded p-1 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            {isOpen && (
              <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/clients/${client.id}`);
                    setMenuOpen(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/clients/${client.id}?edit=true`);
                    setMenuOpen(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal(client);
                    setMenuOpen(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const clientLimit = user ? TIER_CLIENT_LIMITS[user.subscription_tier] : 20;

  return (
    <div onClick={() => setMenuOpen(null)}>
      <Header
        title="Clients"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setImportModal(true)}>
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </Button>
            <Button onClick={() => router.push("/dashboard/clients/new")}>
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </div>
        }
      />
      <p className="mb-4 text-sm text-gray-500">
        {usage?.clients_count ?? 0} of {clientLimit} clients
      </p>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading clients..." />
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title={search ? "No clients found" : "No clients yet"}
            description={
              search
                ? "Try a different search term"
                : "Add your first client to start automating follow-up"
            }
            actionLabel={search ? undefined : "Add Client"}
            onAction={search ? undefined : () => router.push("/dashboard/clients/new")}
          />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => router.push(`/dashboard/clients/${row.original.id}`)}
                      className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 25 + 1}-{Math.min(page * 25, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={!!deleteModal} onClose={() => { setDeleteModal(null); setDeleteConfirm(false); }} title="Delete Client">
        <p className="text-sm text-gray-600">
          This will delete <strong>{deleteModal?.first_name} {deleteModal?.last_name}</strong> and cancel all future messages. This cannot be undone.
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
          <Button variant="ghost" onClick={() => { setDeleteModal(null); setDeleteConfirm(false); }}>
            Cancel
          </Button>
          <Button variant="danger" disabled={!deleteConfirm} loading={deleting} onClick={handleDelete}>
            Delete Client
          </Button>
        </div>
      </Modal>

      <Modal open={importModal} onClose={() => { setImportModal(false); setImportFile(null); }} title="Import Clients from CSV">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with columns: first_name, last_name, phone_number, closing_date, property_address, city, state, zip, property_type, email, notes
          </p>
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {importFile ? importFile.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-400">CSV files only, max 5MB</p>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setImportModal(false); setImportFile(null); }}>
              Cancel
            </Button>
            <Button disabled={!importFile} loading={importing} onClick={handleImport}>
              Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
