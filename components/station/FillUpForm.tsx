"use client";

import { useState } from "react";
import { FUEL_TYPES, type FuelType, FUEL_TYPE_KEYS } from "@/lib/constants";

interface FillUpFormProps {
  stationId: string;
  defaultFuel: FuelType;
  defaultPrice: number;
  onSubmit: () => void;
  onCancel: () => void;
}

export function FillUpForm({
  stationId,
  defaultFuel,
  defaultPrice,
  onSubmit,
  onCancel,
}: FillUpFormProps) {
  const [fuelType, setFuelType] = useState<FuelType>(defaultFuel);
  const [liters, setLiters] = useState("40");
  const [price, setPrice] = useState(defaultPrice.toFixed(3));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    totalCost: number;
    savedVsAverage: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/fillups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId,
          fuelType,
          liters: parseFloat(liters),
          pricePerLiter: parseFloat(price),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setTimeout(() => {
          onSubmit();
        }, 2000);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div
        className="p-5 text-center space-y-3 animate-confetti-pop"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.08))",
          border: "1.5px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{
            background: "var(--brand-gradient)",
            backgroundImage: "var(--brand-gradient)",
            boxShadow: "var(--shadow-brand)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="font-bold text-base" style={{ color: "var(--price-low)" }}>
          Plein enregistre !
        </div>
        <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {result.totalCost.toFixed(2)} EUR · Economie :{" "}
          {result.savedVsAverage > 0 ? "+" : ""}
          {result.savedVsAverage.toFixed(2)} EUR vs la moyenne
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 animate-fade-in-up"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="text-sm font-bold">Enregistrer un plein</div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {FUEL_TYPE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFuelType(key)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold tap-scale transition-all"
            style={{
              background:
                fuelType === key ? "var(--brand-gradient)" : "var(--surface-secondary)",
              backgroundImage:
                fuelType === key ? "var(--brand-gradient)" : undefined,
              color: fuelType === key ? "#fff" : "var(--text-secondary)",
              border:
                fuelType === key ? "none" : "1px solid var(--border)",
            }}
          >
            {FUEL_TYPES[key].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Litres
          </label>
          <input
            type="number"
            step="0.1"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className="w-full px-3 py-2.5 text-sm font-medium outline-none input-brand"
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Prix/L (EUR)
          </label>
          <input
            type="number"
            step="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2.5 text-sm font-medium outline-none input-brand"
          />
        </div>
      </div>

      <div
        className="text-center text-base font-extrabold tabular-nums"
        style={{ color: "var(--brand)" }}
      >
        Total : {(parseFloat(liters || "0") * parseFloat(price || "0")).toFixed(2)} EUR
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-semibold tap-scale"
          style={{
            background: "var(--surface-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-bold text-white disabled:opacity-50 btn-brand"
        >
          {loading ? "..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
