"use client";

interface StatsCardsProps {
  stats: {
    fillUps: number;
    totalSaved: number;
    uniqueStations: number;
    reports: number;
  };
}

const CARD_CONFIGS = [
  {
    key: "totalSaved" as const,
    label: "Economies totales",
    unit: "EUR",
    gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))",
    color: "var(--price-low)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: "fillUps" as const,
    label: "Pleins enregistres",
    unit: "",
    gradient: "var(--brand-gradient-subtle)",
    color: "var(--brand)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M2.22 2.22a.75.75 0 011.06 0l4.25 4.25H10a.75.75 0 010 1.5H7.56l7.22 7.22a.75.75 0 11-1.06 1.06l-1.5-1.5H6.75a.75.75 0 01-.75-.75V8.5L1.22 3.72a.75.75 0 010-1.06z" />
      </svg>
    ),
  },
  {
    key: "uniqueStations" as const,
    label: "Stations visitees",
    unit: "",
    gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.08))",
    color: "var(--amber)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: "reports" as const,
    label: "Signalements",
    unit: "",
    gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(13, 159, 110, 0.08))",
    color: "var(--brand-cyan)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CARD_CONFIGS.map((card, i) => {
        const rawValue = stats[card.key];
        const displayValue =
          card.key === "totalSaved" ? rawValue.toFixed(2) : rawValue.toString();

        return (
          <div
            key={card.key}
            className={`p-4 animate-fade-in-up stagger-${i + 1}`}
            style={{
              background: card.gradient,
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: card.color }}>
              {card.icon}
              <span className="text-xs font-bold">{card.label}</span>
            </div>
            <div
              className="text-2xl font-extrabold tabular-nums animate-count-up"
              style={{ color: card.color }}
            >
              {displayValue}
              {card.unit && (
                <span className="text-sm ml-1 font-bold">{card.unit}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
