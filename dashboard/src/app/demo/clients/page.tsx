"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Search, Plus, Upload, ArrowUpDown } from "lucide-react";
import { useDemo } from "@/context/DemoContext";
import { Client } from "@/lib/api";
import { DEMO_CLIENTS } from "@/lib/demoData";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate, getEngagementColor, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { Users } from "lucide-react";

const columnHelper = createColumnHelper<Client>();

export default function DemoClientsPage() {
  const { usage, triggerCTA } = useDemo();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = DEMO_CLIENTS.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(term) ||
      c.last_name.toLowerCase().includes(term) ||
      (c.city || "").toLowerCase().includes(term) ||
      (c.property_address || "").toLowerCase().includes(term)
    );
  });

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
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <Header
        title="Clients"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => triggerCTA("import your clients")}>
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </Button>
            <Button onClick={() => triggerCTA("add your first client")}>
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </div>
        }
      />
      <p className="mb-4 text-sm text-gray-500">
        {usage.clients_count} of 100 clients
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">Try a different search term</p>
        </div>
      ) : (
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
                    className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => triggerCTA("view client details")}
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
      )}
    </div>
  );
}
