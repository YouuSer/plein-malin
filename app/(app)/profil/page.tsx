"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { FUEL_TYPES, type FuelType } from "@/lib/constants";
import { StationCard } from "@/components/station/StationCard";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { StatsCards } from "@/components/gamification/StatsCards";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { StationWithPrices } from "@/lib/types";

interface EarnedBadge {
  type: string;
  earnedAt: string;
  isNew?: boolean;
}

interface GamificationData {
  badges: EarnedBadge[];
  streak: number;
  stats: {
    fillUps: number;
    totalSaved: number;
    uniqueStations: number;
    reports: number;
  };
}

interface Alert {
  id: number;
  fuelType: FuelType;
  targetPrice: number;
  stationName: string | null;
  isActive: boolean;
}

export default function ProfilPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<StationWithPrices[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [favLoading, setFavLoading] = useState(true);
  const [gamification, setGamification] = useState<GamificationData | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((data) => setFavorites(data.favorites ?? []))
      .catch(() => {})
      .finally(() => setFavLoading(false));

    fetch("/api/user/alerts")
      .then((r) => r.json())
      .then((data) => setAlerts(data.alerts ?? []))
      .catch(() => {});

    fetch("/api/user/badges")
      .then((r) => r.json())
      .then((data) => setGamification(data))
      .catch(() => {});
  }, [session]);

  const deleteAlert = async (alertId: number) => {
    await fetch(`/api/user/alerts?id=${alertId}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="h-full overflow-y-auto p-4 lg:p-5">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-28 skeleton rounded-2xl" />
          <div className="h-40 skeleton rounded-2xl" />
          <div className="h-56 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-8">
        <div className="dashboard-card max-w-md w-full text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--surface-secondary)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7" style={{ color: "var(--text-tertiary)" }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Connectez-vous</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Sauvegardez vos stations favorites et activez vos alertes prix.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/connexion" className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: "var(--brand-gradient)", backgroundImage: "var(--brand-gradient)" }}>
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl"
              style={{ background: "var(--surface-secondary)", border: "1px solid var(--border)" }}
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allPrices = favorites.flatMap((s) => s.prices.map((p) => p.price));

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="dashboard-card !p-4">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
                style={{ background: "var(--brand-gradient)", backgroundImage: "var(--brand-gradient)" }}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold truncate">{session.user.name}</h1>
                <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                  {session.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-56">
                <ThemeToggle />
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl"
                style={{
                  background: "var(--price-high-soft)",
                  color: "var(--price-high)",
                  border: "1px solid rgba(200, 63, 63, 0.25)",
                }}
              >
                Se deconnecter
              </button>
            </div>
          </div>
        </div>

        {gamification && (
          <>
            <div className="dashboard-card !p-4">
              <StatsCards stats={gamification.stats} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="dashboard-card !p-4">
                <div className="panel-header !px-0 !pt-0 !pb-3 !border-b">
                  <h2 className="text-sm font-semibold">Serie</h2>
                </div>
                <div className="pt-3">
                  <StreakCounter streak={gamification.streak} />
                </div>
              </div>
              <div className="dashboard-card !p-4">
                <div className="panel-header !px-0 !pt-0 !pb-3 !border-b">
                  <h2 className="text-sm font-semibold">Badges ({gamification.badges.length})</h2>
                </div>
                <div className="pt-3">
                  <BadgeGrid earned={gamification.badges} />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="dashboard-card !p-0 overflow-hidden">
          <div className="panel-header">
            <h2 className="text-sm font-semibold">Stations favorites</h2>
            <span className="metric-pill">{favorites.length}</span>
          </div>
          <div className="p-3">
            {favLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 skeleton rounded-xl" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
                Aucune station favorite. Explorez la carte pour en ajouter.
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    selectedFuel="e10"
                    allPricesForFuel={allPrices}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card !p-0 overflow-hidden">
          <div className="panel-header">
            <h2 className="text-sm font-semibold">Alertes prix</h2>
            <span className="metric-pill">{alerts.length}</span>
          </div>
          <div className="p-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
                Aucune alerte active. Creez-en une depuis une page station.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{
                      background: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--surface)" }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: "var(--brand)" }}>
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">
                        {FUEL_TYPES[alert.fuelType]?.label ?? alert.fuelType} &lt; {alert.targetPrice.toFixed(3)} EUR
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                        {alert.stationName ?? "Toutes les stations"}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
                      style={{ background: "var(--surface)" }}
                      aria-label="Supprimer l'alerte"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: "var(--price-high)" }}>
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
