"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const PRIMARY_NAV: NavItem[] = [
  {
    href: "/",
    label: "Live View",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    href: "/classement",
    label: "Classement",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M8 21V11M16 21V7M12 21V3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/tendances",
    label: "Tendances",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const SECONDARY_NAV: NavItem[] = [
  {
    href: "/profil",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function SidebarLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl transition-all`}
      style={{
        background: active ? "var(--sidebar-active-bg)" : "transparent",
        color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
        border: active ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: active ? "var(--shadow-xs)" : "none",
      }}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col shrink-0 sidebar-transition border-r ${className ?? ""}`}
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        background: "var(--sidebar-bg)",
        borderColor: "var(--border)",
      }}
    >
      <div className="px-3 pt-4 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className={`rounded-xl border px-3 py-2.5 ${collapsed ? "text-center" : ""}`}
          style={{
            borderColor: "var(--border)",
            background: "rgba(255, 255, 255, 0.54)",
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            {collapsed ? "FR" : "Zone"}
          </div>
          {!collapsed && <div className="text-sm font-semibold mt-0.5">France metropolitaine</div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-5">
        <section>
          {!collapsed && (
            <h3 className="px-2.5 mb-2 text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--text-tertiary)" }}>
              Navigation
            </h3>
          )}
          <nav className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return <SidebarLink key={item.href} item={item} collapsed={collapsed} active={active} />;
            })}
          </nav>
        </section>

        <section>
          {!collapsed && (
            <h3 className="px-2.5 mb-2 text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--text-tertiary)" }}>
              Compte
            </h3>
          )}
          <nav className="space-y-1">
            {SECONDARY_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return <SidebarLink key={item.href} item={item} collapsed={collapsed} active={active} />;
            })}
          </nav>
        </section>
      </div>

      <div className="px-2 pb-3 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={onToggle}
          className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl transition-colors`}
          style={{
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            background: "rgba(255, 255, 255, 0.64)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0">
            {collapsed ? (
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          {!collapsed && <span className="text-sm font-semibold">Reduire</span>}
        </button>
      </div>
    </aside>
  );
}
