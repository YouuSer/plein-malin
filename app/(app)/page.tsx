"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StationMap } from "@/components/map/StationMap";
import { StationCard } from "@/components/station/StationCard";
import { StationListSkeleton } from "@/components/ui/Skeleton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useStations } from "@/hooks/useStations";
import { useFuelFilter } from "@/contexts/FuelFilterContext";
import { FUEL_TYPES } from "@/lib/constants";
import { useSession } from "@/lib/auth-client";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDistance } from "@/lib/geo";
import type { StationWithPrices } from "@/lib/types";

const RADIUS_PRESETS = [5, 10, 15, 25] as const;

type GeolocationBannerState = "loading" | "default" | "denied" | "active";

function getRelativeAgeLabel(updatedAt?: string): string {
  if (!updatedAt) return "MAJ inconnue";

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return "MAJ inconnue";

  const diffMin = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 60000));
  if (diffMin < 60) return `MAJ ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `MAJ ${diffHours} h`;

  return `MAJ ${Math.floor(diffHours / 24)} j`;
}

function inferGeolocationBannerState(params: {
  loading: boolean;
  error: string | null;
  isDefault: boolean;
}): GeolocationBannerState {
  const { loading, error, isDefault } = params;

  if (loading) return "loading";
  if (error?.toLowerCase().includes("refuse")) return "denied";
  if (isDefault) return "default";
  return "active";
}

function getGeolocationMessage(state: GeolocationBannerState): string {
  if (state === "loading") {
    return "Localisation en cours. Chargement des resultats les plus proches...";
  }
  if (state === "denied") {
    return "Acces a la position refuse. Vous pouvez activer la geolocalisation ou rechercher une ville.";
  }
  return "Vue France par defaut. Activez votre position pour voir le meilleur prix autour de vous.";
}

export default function HomePage() {
  const { selectedFuel, searchPosition, searchLabel, radiusKm, setRadiusKm } = useFuelFilter();
  const {
    position: geoPosition,
    isDefault,
    loading: geoLoading,
    error: geoError,
    refresh: refreshGeolocation,
  } = useGeolocation();

  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [insightsOpen, setInsightsOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const { favoriteIds, toggleFavorite, loading: favoritesLoading } = useFavorites();

  const position = searchPosition ?? geoPosition;
  const { stations, loading: stationsLoading, error: stationsError } = useStations(
    position,
    selectedFuel,
    radiusKm
  );

  const loading = stationsLoading || geoLoading;

  const sortedStations = useMemo(() => {
    const sortName = (station: StationWithPrices) => station.name ?? station.city ?? "";

    return [...stations].sort((a, b) => {
      const priceA =
        a.prices.find((price) => price.fuelType === selectedFuel)?.price ??
        Number.POSITIVE_INFINITY;
      const priceB =
        b.prices.find((price) => price.fuelType === selectedFuel)?.price ??
        Number.POSITIVE_INFINITY;
      if (priceA !== priceB) return priceA - priceB;

      const distanceA = a.distance ?? Number.POSITIVE_INFINITY;
      const distanceB = b.distance ?? Number.POSITIVE_INFINITY;
      if (distanceA !== distanceB) return distanceA - distanceB;

      return sortName(a).localeCompare(sortName(b), "fr");
    });
  }, [stations, selectedFuel]);

  const allPricesForFuel = useMemo(
    () =>
      stations
        .map((station) => station.prices.find((price) => price.fuelType === selectedFuel)?.price)
        .filter((price): price is number => price != null),
    [stations, selectedFuel]
  );

  const topLocations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const station of stations) {
      const key = station.city || "Inconnue";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([city, count]) => ({ city, count }));
  }, [stations]);

  const maxLocationCount = topLocations[0]?.count ?? 1;
  const cheapest = sortedStations[0];
  const cheapestPrice = cheapest?.prices.find((price) => price.fuelType === selectedFuel)?.price;

  const avgPrice = allPricesForFuel.length
    ? allPricesForFuel.reduce((sum, price) => sum + price, 0) / allPricesForFuel.length
    : null;

  const geolocationBannerState = inferGeolocationBannerState({
    loading: geoLoading,
    error: geoError,
    isDefault,
  });

  const nearestCity = useMemo(() => {
    let nearestStation: StationWithPrices | null = null;

    for (const station of stations) {
      if (!station.city) continue;
      if (!nearestStation) {
        nearestStation = station;
        continue;
      }

      const candidateDistance = station.distance ?? Number.POSITIVE_INFINITY;
      const nearestDistance = nearestStation.distance ?? Number.POSITIVE_INFINITY;
      if (candidateDistance < nearestDistance) {
        nearestStation = station;
      }
    }

    return nearestStation?.city ?? null;
  }, [stations]);

  const locationLabel =
    searchLabel ??
    nearestCity ??
    (geolocationBannerState === "active" ? "Autour de vous" : "France metropolitaine");

  const handleStationClick = useCallback(
    (station: StationWithPrices) => {
      router.push(`/station/${station.id}`);
    },
    [router]
  );

  const handleToggleFavorite = useCallback(
    async (stationId: string) => {
      if (!session?.user) {
        router.push("/connexion");
        return;
      }

      await toggleFavorite(stationId);
    },
    [router, session?.user, toggleFavorite]
  );

  const bestUpdateLabel = getRelativeAgeLabel(
    cheapest?.prices.find((price) => price.fuelType === selectedFuel)?.updatedAt
  );

  const shouldShowGeolocationBanner = geolocationBannerState !== "active";
  const canRetryGeolocation = geolocationBannerState === "default" || geolocationBannerState === "denied";

  const emptyStateMessage = useMemo(() => {
    if (searchLabel) {
      return `Aucune station ${FUEL_TYPES[selectedFuel].label} trouvee autour de ${locationLabel} dans ${radiusKm} km.`;
    }
    if (geolocationBannerState === "denied") {
      return `Aucune station ${FUEL_TYPES[selectedFuel].label} dans ${radiusKm} km. Autorisez la geolocalisation ou recherchez une ville.`;
    }
    if (geolocationBannerState === "default") {
      return `Aucune station ${FUEL_TYPES[selectedFuel].label} dans ${radiusKm} km depuis la vue France. Activez votre position pour affiner.`;
    }

    return `Aucune station ${FUEL_TYPES[selectedFuel].label} dans ${radiusKm} km autour de vous.`;
  }, [geolocationBannerState, locationLabel, radiusKm, searchLabel, selectedFuel]);

  return (
    <div className="h-full p-3 md:p-4 lg:p-5 flex flex-col gap-3">
      {shouldShowGeolocationBanner && (
        <div
          className="rounded-xl border px-3 py-2.5 flex items-center justify-between gap-3"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div className="text-sm min-w-0" style={{ color: "var(--text-secondary)" }}>
            {getGeolocationMessage(geolocationBannerState)}
          </div>

          {canRetryGeolocation && (
            <button
              onClick={refreshGeolocation}
              className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg"
              style={{
                background: "var(--brand-gradient)",
                backgroundImage: "var(--brand-gradient)",
                color: "#fff",
              }}
            >
              Activer ma position
            </button>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 flex gap-4">
        <aside
          className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col shrink-0 w-full md:w-[380px] lg:w-[410px] rounded-2xl border overflow-hidden`}
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="panel-header">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-[0.08em]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Live View
              </div>
              <h1 className="text-lg font-semibold leading-tight mt-0.5">
                Stations {FUEL_TYPES[selectedFuel].label}
              </h1>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Zone: {locationLabel}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="metric-pill">{stations.length} stations</span>
              {geolocationBannerState === "active" && !searchLabel && (
                <span
                  className="text-[11px] font-semibold px-2 py-1 rounded-full border inline-flex items-center gap-1"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />
                  Position activee
                </span>
              )}
            </div>
          </div>

          <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Rayon:
              </span>
              {RADIUS_PRESETS.map((radiusPreset) => {
                const active = radiusKm === radiusPreset;
                return (
                  <button
                    key={radiusPreset}
                    onClick={() => setRadiusKm(radiusPreset)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: active ? "var(--brand-gradient)" : "var(--surface-secondary)",
                      backgroundImage: active ? "var(--brand-gradient)" : undefined,
                      color: active ? "#fff" : "var(--text-secondary)",
                      border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                    }}
                  >
                    {radiusPreset} km
                  </button>
                );
              })}
            </div>

            <div className="dashboard-card !p-3">
              <div
                className="text-xs font-bold uppercase tracking-[0.08em]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Recap rapide
              </div>
              <div className="text-sm font-semibold mt-1">
                {cheapestPrice && cheapest
                  ? `${cheapest.name ?? cheapest.city} a ${cheapestPrice.toFixed(3)} EUR/L`
                  : "Meilleur prix indisponible"}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                {cheapest?.distance != null ? `Distance ${formatDistance(cheapest.distance)} · ` : ""}
                {bestUpdateLabel}
              </div>
            </div>

            <div className="mt-2.5">
              <button
                onClick={() => setInsightsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold"
                style={{
                  background: "var(--surface-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <span>Insights locaux</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 transition-transform ${insightsOpen ? "rotate-180" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {insightsOpen && (
                <div className="mt-2.5 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="dashboard-card !p-3">
                      <div className="panel-label">Prix moyen</div>
                      <div className="panel-value mt-1">{avgPrice ? `${avgPrice.toFixed(3)} EUR/L` : "-"}</div>
                    </div>
                    <div className="dashboard-card !p-3">
                      <div className="panel-label">Meilleur prix</div>
                      <div className="panel-value mt-1" style={{ color: "var(--price-low)" }}>
                        {cheapestPrice ? `${cheapestPrice.toFixed(3)} EUR/L` : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-card !p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">Top zones</div>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Rayon {radiusKm} km
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {topLocations.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                          Pas de donnees disponibles.
                        </p>
                      ) : (
                        topLocations.map((location) => (
                          <div key={location.city}>
                            <div
                              className="flex items-center justify-between text-xs mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <span className="font-medium truncate">{location.city}</span>
                              <span>{location.count}</span>
                            </div>
                            <div className="h-2 rounded-full" style={{ background: "var(--surface-secondary)" }}>
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(location.count / maxLocationCount) * 100}%`,
                                  background: "var(--brand-gradient)",
                                  backgroundImage: "var(--brand-gradient)",
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2.5">
            {loading ? (
              <StationListSkeleton count={7} />
            ) : stationsError ? (
              <div className="dashboard-card text-center py-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
                {stationsError}
                {geolocationBannerState === "denied" && (
                  <div className="mt-1.5">Essayez d'activer votre position ou de rechercher une ville.</div>
                )}
              </div>
            ) : sortedStations.length === 0 ? (
              <div className="dashboard-card text-center py-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
                {emptyStateMessage}
              </div>
            ) : (
              sortedStations.map((station, index) => (
                <StationCard
                  key={station.id}
                  station={station}
                  selectedFuel={selectedFuel}
                  allPricesForFuel={allPricesForFuel}
                  rank={index + 1}
                  showFreshness
                  showQuickActions
                  isFavorited={favoriteIds.has(station.id)}
                  onToggleFavorite={handleToggleFavorite}
                  favoriteDisabled={Boolean(session?.user) && favoritesLoading}
                />
              ))
            )}
          </div>
        </aside>

        <section
          className={`${mobileView === "map" ? "flex" : "hidden"} md:flex flex-1 rounded-2xl border overflow-hidden relative`}
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="absolute top-3 left-3 z-10 hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{
              background: "rgba(255,255,255,0.86)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />
            {locationLabel} · rayon {radiusKm} km
          </div>

          <StationMap
            stations={stations}
            selectedFuel={selectedFuel}
            userPosition={position}
            isDefaultPosition={isDefault && !searchPosition}
            onStationClick={handleStationClick}
          />
        </section>
      </div>

      <div
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex rounded-full overflow-hidden border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <button
          onClick={() => setMobileView("list")}
          className="px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            background: mobileView === "list" ? "var(--brand-gradient)" : "transparent",
            backgroundImage: mobileView === "list" ? "var(--brand-gradient)" : undefined,
            color: mobileView === "list" ? "#fff" : "var(--text-secondary)",
          }}
        >
          Liste
        </button>
        <button
          onClick={() => setMobileView("map")}
          className="px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            background: mobileView === "map" ? "var(--brand-gradient)" : "transparent",
            backgroundImage: mobileView === "map" ? "var(--brand-gradient)" : undefined,
            color: mobileView === "map" ? "#fff" : "var(--text-secondary)",
          }}
        >
          Carte
        </button>
      </div>
    </div>
  );
}
