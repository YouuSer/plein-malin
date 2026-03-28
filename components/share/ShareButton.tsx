"use client";

import { useState } from "react";
import type { FuelType } from "@/lib/constants";
import { FUEL_TYPES } from "@/lib/constants";

interface ShareButtonProps {
  stationId: string;
  stationName: string;
  fuelType: FuelType;
  price: number;
}

export function ShareButton({
  stationId,
  stationName,
  fuelType,
  price,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "prix_du_jour",
        data: { stationId, stationName, fuelType, price },
      }),
    });

    if (!res.ok) return;
    const { token } = await res.json();

    const url = `${window.location.origin}/partage/${token}`;
    const text = `${FUEL_TYPES[fuelType].label} a ${price.toFixed(3)} EUR/L chez ${stationName} - Plein Malin`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Plein Malin", text, url });
        return;
      } catch {
        // User cancelled or not supported
      }
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all tap-scale"
      style={{
        background: copied ? "var(--price-low-soft)" : "var(--surface-secondary)",
        color: copied ? "var(--price-low)" : "var(--text-secondary)",
        border: `1.5px solid ${copied ? "rgba(16, 185, 129, 0.3)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
      }}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          Copie !
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Partager
        </>
      )}
    </button>
  );
}
