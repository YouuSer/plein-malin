"use client";

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const active = streak > 0;

  return (
    <div
      className="flex items-center gap-4 p-4 animate-fade-in-up"
      style={{
        background: active
          ? "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f59e0b 100%)"
          : "var(--surface-secondary)",
        borderRadius: "var(--radius-lg)",
        boxShadow: active ? "0 4px 20px rgba(249, 115, 22, 0.3)" : "var(--shadow-xs)",
        border: active ? "none" : "1px solid var(--border)",
      }}
    >
      {/* Flame icon */}
      <div className={active ? "animate-streak-fire" : ""}>
        {active ? (
          <svg viewBox="0 0 32 32" className="w-10 h-10" fill="none">
            <defs>
              <linearGradient id="flame" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fff7ed" />
              </linearGradient>
            </defs>
            <path
              d="M16 2c0 6-4 8-6 12s0 10 6 14c6-4 8-10 6-14s-6-6-6-12z"
              fill="url(#flame)"
            />
            <path
              d="M16 12c0 3-2 4-3 6s0 5 3 7c3-2 4-5 3-7s-3-3-3-6z"
              fill="white"
              opacity="0.6"
            />
          </svg>
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--border)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" style={{ color: "var(--text-tertiary)" }}>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </div>
        )}
      </div>

      <div>
        <div
          className="text-xl font-extrabold"
          style={{ color: active ? "#fff" : "var(--text-tertiary)" }}
        >
          {active ? `${streak} semaine${streak > 1 ? "s" : ""}` : "Pas de streak"}
        </div>
        <div
          className="text-sm font-medium"
          style={{
            color: active ? "rgba(255,255,255,0.85)" : "var(--text-tertiary)",
          }}
        >
          {active
            ? "Continuez a enregistrer vos pleins !"
            : "Enregistrez un plein pour demarrer"}
        </div>
      </div>
    </div>
  );
}
