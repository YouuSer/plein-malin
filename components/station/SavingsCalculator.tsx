"use client";

import { calculateSavings, formatEur } from "@/lib/pricing";

interface SavingsCalculatorProps {
  stationPrice: number;
  areaPrices: number[];
  tankSize?: number;
}

export function SavingsCalculator({
  stationPrice,
  areaPrices,
  tankSize = 50,
}: SavingsCalculatorProps) {
  const savings = calculateSavings(stationPrice, areaPrices, tankSize);

  if (savings.perLiter === 0) return null;

  const isPositive = savings.perFillUp > 0;

  return (
    <div
      className="p-4 animate-fade-in-up"
      style={{
        background: isPositive
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.08))"
          : "var(--price-high-soft)",
        border: `1.5px solid ${isPositive ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: isPositive ? "var(--brand-gradient)" : "var(--price-high)",
            backgroundImage: isPositive ? "var(--brand-gradient)" : undefined,
            boxShadow: isPositive ? "var(--shadow-brand)" : undefined,
          }}
        >
          {isPositive ? (
            <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.46L7.82 10.12a.75.75 0 00-1.14.976l2.25 2.625a.75.75 0 001.177-.047l3.75-5.483z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <span
          className="font-bold text-sm"
          style={{
            color: isPositive ? "var(--price-low)" : "var(--price-high)",
          }}
        >
          {isPositive
            ? `Vous economisez ${formatEur(savings.perFillUp)} par plein`
            : `${formatEur(Math.abs(savings.perFillUp))} de plus par plein`}
        </span>
      </div>

      <div
        className="grid grid-cols-3 gap-3 text-center"
        style={{ color: isPositive ? "var(--price-low)" : "var(--price-high)" }}
      >
        <div
          className="p-2.5"
          style={{
            background: "rgba(255,255,255,0.5)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="font-extrabold text-lg tabular-nums">
            {savings.perLiter > 0 ? "-" : "+"}
            {Math.abs(savings.perLiter).toFixed(3)}
          </div>
          <div className="text-xs font-medium opacity-70">EUR/L vs moyenne</div>
        </div>
        <div
          className="p-2.5"
          style={{
            background: "rgba(255,255,255,0.5)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="font-extrabold text-lg tabular-nums">
            {savings.perFillUp > 0 ? "-" : "+"}
            {Math.abs(savings.perFillUp).toFixed(2)}
          </div>
          <div className="text-xs font-medium opacity-70">EUR/plein ({tankSize}L)</div>
        </div>
        <div
          className="p-2.5"
          style={{
            background: "rgba(255,255,255,0.5)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="font-extrabold text-lg tabular-nums">
            {savings.perYear > 0 ? "-" : "+"}
            {Math.abs(savings.perYear).toFixed(0)}
          </div>
          <div className="text-xs font-medium opacity-70">EUR/an estime</div>
        </div>
      </div>
    </div>
  );
}
