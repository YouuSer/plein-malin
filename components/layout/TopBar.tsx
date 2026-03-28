"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterChips } from "@/components/ui/FilterChips";
import { useFuelFilter } from "@/contexts/FuelFilterContext";
import { useSession } from "@/lib/auth-client";

interface TopBarProps {
  onMenuClick: () => void;
}

const FUEL_FILTER_ROUTES = ["/", "/classement", "/tendances"];

const PAGE_LABELS: Record<string, string> = {
  "/": "Live View",
  "/classement": "Classement",
  "/tendances": "Tendances",
  "/profil": "Profil",
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const { selectedFuel, setSelectedFuel, setSearch } = useFuelFilter();
  const { data: session } = useSession();
  const showFuelFilter = FUEL_FILTER_ROUTES.includes(pathname);

  const pageLabel = Object.entries(PAGE_LABELS).find(([route]) =>
    route === "/" ? pathname === route : pathname.startsWith(route)
  )?.[1] ?? "Plein Malin";

  const handleSearchSelect = (pos: { lat: number; lng: number }, label: string) => {
    setSearch(pos, label);
  };

  return (
    <header
      className="shrink-0 flex items-center gap-3 px-4 lg:px-5 border-b"
      style={{
        height: "var(--topbar-height)",
        background: "var(--topbar-bg)",
        borderColor: "var(--topbar-border)",
      }}
    >
      <div className="flex items-center gap-2.5 shrink-0 min-w-[148px] lg:min-w-[210px]">
        <button
          onClick={onMenuClick}
          className="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ background: "rgba(255, 255, 255, 0.06)", color: "#d4d8df" }}
          aria-label="Ouvrir la navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shrink-0"
            style={{ background: "var(--brand-gradient)", backgroundImage: "var(--brand-gradient)" }}
          >
            PM
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="text-[15px] font-semibold leading-none text-white truncate">Plein Malin</div>
            <div className="text-[11px] leading-none mt-1" style={{ color: "#93a0b1" }}>
              {pageLabel}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 min-w-0 flex justify-center">
        <div className="w-full max-w-2xl">
          <SearchBar onSelect={handleSearchSelect} tone="topbar" />
        </div>
      </div>

      {showFuelFilter && (
        <div className="hidden xl:block shrink-0">
          <FilterChips selected={selectedFuel} onChange={setSelectedFuel} tone="topbar" />
        </div>
      )}

      <div className="shrink-0 flex items-center gap-2">
        <button
          className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl"
          style={{ background: "rgba(255, 255, 255, 0.06)", color: "#c5cdd8" }}
          aria-label="Notifications"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
          </svg>
        </button>

        <Link
          href="/profil"
          className="shrink-0 rounded-xl px-2 py-1.5 flex items-center gap-2 border"
          style={{
            borderColor: "rgba(255, 255, 255, 0.12)",
            background: "rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="hidden md:block text-sm font-semibold" style={{ color: "#dce2eb" }}>
            {session?.user?.name ?? "Profil"}
          </div>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
            style={{
              background: session?.user ? "var(--brand-gradient)" : "rgba(255, 255, 255, 0.08)",
              color: "#fff",
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </Link>
      </div>
    </header>
  );
}
