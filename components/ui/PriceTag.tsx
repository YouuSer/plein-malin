interface PriceTagProps {
  price: number;
  size?: "sm" | "md" | "lg";
  variant?: "low" | "mid" | "high" | "neutral";
}

export function PriceTag({
  price,
  size = "md",
  variant = "neutral",
}: PriceTagProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-2.5 py-1",
    lg: "text-xl px-3 py-1.5",
  };

  const variantStyles = {
    low: { background: "var(--price-low-soft)", color: "var(--price-low)" },
    mid: { background: "var(--price-mid-soft)", color: "var(--price-mid)" },
    high: { background: "var(--price-high-soft)", color: "var(--price-high)" },
    neutral: { background: "var(--surface-secondary)", color: "var(--fg)" },
  };

  return (
    <span
      className={`inline-flex items-baseline font-bold rounded-lg tabular-nums ${sizeClasses[size]}`}
      style={variantStyles[variant]}
    >
      {price.toFixed(3)}
      <span className="text-[0.65em] font-medium ml-0.5 opacity-70">EUR/L</span>
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
