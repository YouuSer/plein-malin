"use client";

import {
  LineChart,
  Line,
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
        className="text-center py-6 text-sm"
        style={{ color: "var(--text-tertiary)" }}
      >
        Pas assez de donnees pour afficher les tendances
      </div>
    );
  }

  const fuel = FUEL_TYPES[fuelType];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={(v: number) => v.toFixed(3)}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [
              `${Number(value).toFixed(3)} EUR/L`,
              fuel.label,
            ]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={fuel.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: fuel.color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
