"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserPlus,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { useDemo } from "@/context/DemoContext";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/demo", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/clients", label: "Clients", icon: Users },
  { href: "/demo/messages", label: "Messages", icon: MessageSquare },
  { href: "/demo/referrals", label: "Referrals", icon: UserPlus },
  { href: "/demo/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DemoSidebar() {
  const pathname = usePathname();
  const { user } = useDemo();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/demo") return pathname === "/demo";
    return pathname.startsWith(href);
  };

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  const navContent = (
    <>
      <div className="p-4 border-b border-gray-100">
        <Link href="/demo" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <span className="text-xl font-bold text-dark">ClientPro</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <a
          href="https://app.clientpro.io/register"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Sign Up for Real &rarr;
        </a>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-12 left-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col pt-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </div>
        </div>
      )}

      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-10 bg-white border-r border-gray-200">
        {navContent}
      </aside>
    </>
  );
}
