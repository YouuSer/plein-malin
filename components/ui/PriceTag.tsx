interface PriceTagProps {
  price: number;
  size?: "sm" | "md" | "lg";
  variant?: "low" | "mid" | "high" | "neutral";
  glow?: boolean;
}

export function PriceTag({
  price,
  size = "md",
  variant = "neutral",
  glow = false,
}: PriceTagProps) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3 py-1.5",
    lg: "text-lg px-4 py-2 font-extrabold",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    low: {
      background: "var(--price-low-soft)",
      color: "var(--price-low)",
      border: "1px solid rgba(10, 138, 102, 0.3)",
    },
    mid: {
      background: "var(--price-mid-soft)",
      color: "var(--price-mid)",
      border: "1px solid rgba(185, 133, 23, 0.3)",
    },
    high: {
      background: "var(--price-high-soft)",
      color: "var(--price-high)",
      border: "1px solid rgba(200, 63, 63, 0.28)",
    },
    neutral: {
      background: "var(--surface-secondary)",
      color: "var(--fg)",
      border: "1px solid var(--border)",
    },
  };

  return (
    <span
      className={`inline-flex items-baseline font-bold tabular-nums ${sizeClasses[size]} ${glow && variant === "low" ? "animate-pulse-glow" : ""}`}
      style={{
        ...variantStyles[variant],
        borderRadius: "10px",
      }}
    >
      {price.toFixed(3)}
      <span className="text-[0.65em] font-semibold ml-0.5 opacity-60">EUR/L</span>
    </span>
  );
}

/** Determine price variant based on percentile within a set */
export function getPriceVariant(
  price: number,
  allPrices: number[]
): "low" | "mid" | "high" {
  if (allPrices.length === 0) return "mid";
  const sorted = [...allPrices].sort((a, b) => a - b);
  const p20 = sorted[Math.floor(sorted.length * 0.2)] ?? price;
  const p80 = sorted[Math.floor(sorted.length * 0.8)] ?? price;
  if (price <= p20) return "low";
  if (price >= p80) return "high";
  return "mid";
}
