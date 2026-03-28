"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Carte",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    href: "/classement",
    label: "Classement",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M8 21V11M16 21V7M12 21V3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/tendances",
    label: "Tendances",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center justify-around px-2 py-1 border-t"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-lg transition-colors"
            style={{
              color: isActive ? "var(--accent)" : "var(--text-tertiary)",
            }}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
