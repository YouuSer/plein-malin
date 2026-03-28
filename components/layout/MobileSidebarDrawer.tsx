"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
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

export function MobileSidebarDrawer({ open, onClose }: MobileSidebarDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 backdrop-overlay animate-fade-in" onClick={onClose} />

      <aside
        className="absolute left-0 top-0 bottom-0 w-[286px] flex flex-col animate-slide-in-left border-r"
        style={{
          background: "var(--sidebar-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="h-16 px-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs"
              style={{ background: "var(--brand-gradient)", backgroundImage: "var(--brand-gradient)" }}
            >
              PM
            </div>
            <div>
              <div className="text-sm font-semibold">Plein Malin</div>
              <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Navigation
              </div>
            </div>
          </Link>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.5)" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: "var(--text-secondary)" }}>
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                style={{
                  background: isActive ? "var(--sidebar-active-bg)" : "transparent",
                  color: isActive ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                  border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                }}
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
