"use client";

import { BADGES } from "@/lib/gamification";

interface EarnedBadge {
  type: string;
  earnedAt: string;
  isNew?: boolean;
}

interface BadgeGridProps {
  earned: EarnedBadge[];
}

export function BadgeGrid({ earned }: BadgeGridProps) {
  const earnedMap = new Map(earned.map((b) => [b.type, b]));

  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGES.map((badge, i) => {
        const earnedBadge = earnedMap.get(badge.type);
        const isEarned = !!earnedBadge;
        const isNew = !!earnedBadge?.isNew;

        return (
          <div
            key={badge.type}
            className={`relative flex flex-col items-center text-center p-3.5 transition-all animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${isNew ? "animate-scale-bounce" : ""}`}
            style={{
              background: isEarned
                ? "var(--brand-gradient-subtle)"
                : "var(--surface-secondary)",
              opacity: isEarned ? 1 : 0.35,
              border: isNew
                ? "2px solid var(--brand)"
                : "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: isEarned ? "var(--shadow-sm)" : "none",
            }}
          >
            {isNew && (
              <span
                className="absolute -top-2 -right-2 text-xs font-extrabold px-2 py-0.5 rounded-full text-white animate-scale-bounce"
                style={{
                  background: "var(--brand-gradient)",
                  backgroundImage: "var(--brand-gradient)",
                  boxShadow: "var(--shadow-brand)",
                }}
              >
                NEW
              </span>
            )}
            <span className="text-2xl mb-1.5">{badge.icon}</span>
            <span className="text-xs font-bold leading-tight">
              {badge.name}
            </span>
            <span
              className="text-xs mt-1 leading-tight"
              style={{ color: "var(--text-tertiary)" }}
            >
              {badge.condition}
            </span>
          </div>
        );
      })}
    </div>
  );
}
