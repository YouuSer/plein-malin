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
      className="rounded-xl p-4"
      style={{
        background: isPositive
          ? "var(--price-low-soft)"
          : "var(--price-high-soft)",
        border: `1px solid ${isPositive ? "var(--price-low)" : "var(--price-high)"}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">
          {isPositive ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: "var(--price-low)" }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.46L7.82 10.12a.75.75 0 00-1.14.976l2.25 2.625a.75.75 0 001.177-.047l3.75-5.483z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: "var(--price-high)" }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          )}
        </span>
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
        className="grid grid-cols-3 gap-3 text-center text-xs"
        style={{ color: isPositive ? "var(--price-low)" : "var(--price-high)" }}
      >
        <div>
          <div className="font-bold text-base tabular-nums">
            {savings.perLiter > 0 ? "-" : "+"}
            {Math.abs(savings.perLiter).toFixed(3)}
          </div>
          <div className="opacity-70">EUR/L vs moyenne</div>
        </div>
        <div>
          <div className="font-bold text-base tabular-nums">
            {savings.perFillUp > 0 ? "-" : "+"}
            {Math.abs(savings.perFillUp).toFixed(2)}
          </div>
          <div className="opacity-70">EUR/plein ({tankSize}L)</div>
        </div>
        <div>
          <div className="font-bold text-base tabular-nums">
            {savings.perYear > 0 ? "-" : "+"}
            {Math.abs(savings.perYear).toFixed(0)}
          </div>
          <div className="opacity-70">EUR/an estime</div>
        </div>
      </div>
    </div>
  );
}
