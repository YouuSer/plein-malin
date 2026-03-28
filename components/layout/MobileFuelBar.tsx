"use client";

import { usePathname } from "next/navigation";
import { FilterChips } from "@/components/ui/FilterChips";
import { useFuelFilter } from "@/contexts/FuelFilterContext";

const FUEL_FILTER_ROUTES = ["/", "/classement", "/tendances"];

export function MobileFuelBar() {
  const pathname = usePathname();
  const { selectedFuel, setSelectedFuel } = useFuelFilter();
  const showFuelFilter = FUEL_FILTER_ROUTES.includes(pathname);

  if (!showFuelFilter) return null;

  return (
    <div
      className="lg:hidden shrink-0 border-b px-3 py-2"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <FilterChips selected={selectedFuel} onChange={setSelectedFuel} />
    </div>
  );
}
