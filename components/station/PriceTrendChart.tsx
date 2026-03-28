"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FUEL_TYPES, type FuelType } from "@/lib/constants";

interface PricePoint {
  fuelType: string;
  price: number;
  recordedAt: string;
}

interface PriceTrendChartProps {
  data: PricePoint[];
  fuelType: FuelType;
}

export function PriceTrendChart({ data, fuelType }: PriceTrendChartProps) {
  const filtered = data
    .filter((d) => d.fuelType === fuelType)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    .map((d) => ({
      date: new Date(d.recordedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      price: d.price,
    }));

  if (filtered.length < 2) {
    return (
      <div
        className="text-center py-8 text-sm font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        Pas assez de donnees pour afficher les tendances
      </div>
    );
  }

  const fuel = FUEL_TYPES[fuelType];

  return (
    <div className="h-52 animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9f6e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#0d9f6e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(3)}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-glass-heavy)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "var(--shadow-lg)",
            }}
            formatter={(value) => [
              `${Number(value).toFixed(3)} EUR/L`,
              fuel.label,
            ]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#0d9f6e"
            strokeWidth={2.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#0d9f6e",
              stroke: "white",
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
