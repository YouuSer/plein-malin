"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FUEL_TYPES, type FuelType, FUEL_TYPE_KEYS } from "@/lib/constants";
import { PriceTag, getPriceVariant } from "@/components/ui/PriceTag";
import { SavingsCalculator } from "@/components/station/SavingsCalculator";
import { PriceTrendChart } from "@/components/station/PriceTrendChart";
import { FillUpForm } from "@/components/station/FillUpForm";
import { CommunityReports } from "@/components/station/CommunityReports";
import { ShareButton } from "@/components/share/ShareButton";
import { StationJsonLd } from "@/components/station/StationJsonLd";
import { useSession } from "@/lib/auth-client";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface StationDetail {
  id: string;
  name: string | null;
  address: string;
  city: string;
  postalCode: string;
  department: string | null;
  latitude: number;
  longitude: number;
  services: string[];
  isAutomate24h: boolean;
  prices: { fuelType: FuelType; price: number; updatedAt: string; shortage: string | null }[];
  priceHistory: { fuelType: string; price: number; recordedAt: string }[];
}

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFuel, setSelectedFuel] = useState<FuelType>("e10");
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [showFillUp, setShowFillUp] = useState(false);
  const { data: session } = useSession();
  const { preferences, isHydrated: preferencesReady } = useUserPreferences();

  const toggleFavorite = useCallback(async () => {
    if (!session?.user) {
      router.push("/connexion");
      return;
    }
    const res = await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setIsFavorited(data.favorited);
    }
  }, [session, id, router]);

  const createAlert = useCallback(async () => {
    if (!session?.user) {
      router.push("/connexion");
      return;
    }
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) return;

    await fetch("/api/user/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stationId: id,
        fuelType: selectedFuel,
        targetPrice: price,
      }),
    });
    setShowAlertForm(false);
    setAlertPrice("");
  }, [session, id, selectedFuel, alertPrice, router]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((data) => {
        const favIds = (data.favorites ?? []).map((f: { id: string }) => f.id);
        setIsFavorited(favIds.includes(id));
      })
      .catch(() => {});
  }, [session, id]);

  useEffect(() => {
    fetch(`/api/stations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStation(data);
        if (data.prices?.length > 0) {
          setSelectedFuel(data.prices[0].fuelType);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!preferencesReady || !station?.prices?.length) return;
    if (station.prices.some((price) => price.fuelType === preferences.preferredFuel)) {
      setSelectedFuel(preferences.preferredFuel);
    }
  }, [preferencesReady, preferences.preferredFuel, station]);

  if (loading) {
    return (
      <div className="p-5 lg:p-6 space-y-5 max-w-4xl">
        <div className="h-6 w-48 skeleton rounded-lg" />
        <div className="h-4 w-64 skeleton rounded-lg" />
        <div className="h-40 skeleton rounded-xl" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-5 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
        Station introuvable
      </div>
    );
  }

  const allPrices = station.prices.map((p) => p.price);
  const mainPrice = station.prices.find((p) => p.fuelType === selectedFuel);
  const lastUpdate = mainPrice
    ? formatTimeSince(new Date(mainPrice.updatedAt))
    : null;

  return (
    <div className="h-full overflow-y-auto">
      <StationJsonLd station={station} />

      <div className="p-4 lg:p-5 space-y-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-secondary)" }}>
            Carte
          </Link>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          <span>{station.name ?? station.city}</span>
        </nav>

        {/* Station header */}
        <div className="dashboard-card !p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold">{station.name ?? "Station"}</h1>
                {station.isAutomate24h && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--surface-secondary)",
                      color: "var(--brand)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    24h/24
                  </span>
                )}
              </div>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {station.address}, {station.postalCode} {station.city}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleFavorite}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{
                  background: isFavorited ? "var(--price-high-soft)" : "var(--surface-secondary)",
                  border: "1px solid var(--border)",
                }}
                aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  style={{ color: isFavorited ? "var(--price-high)" : "var(--text-tertiary)" }}
                  fill={isFavorited ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {mainPrice && (
                <ShareButton
                  stationId={station.id}
                  stationName={station.name ?? station.city}
                  fuelType={selectedFuel}
                  price={mainPrice.price}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Price grid — full width */}
          <div className="dashboard-card lg:col-span-2">
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="text-sm font-semibold">Prix des carburants</h2>
              {lastUpdate && (
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Mis a jour {lastUpdate}
                </span>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {FUEL_TYPE_KEYS.map((fuelKey) => {
                const price = station.prices.find((p) => p.fuelType === fuelKey);
                if (!price) return null;
                const fuel = FUEL_TYPES[fuelKey];
                const isSelected = selectedFuel === fuelKey;
                return (
                  <button
                    key={fuelKey}
                    onClick={() => setSelectedFuel(fuelKey)}
                    className="flex items-center justify-between p-3 rounded-lg transition-all"
                    style={{
                      background: isSelected ? "var(--surface-secondary)" : "transparent",
                      border: isSelected ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
                    }}
                  >
                    <span className="text-sm font-medium">{fuel.label}</span>
                    <PriceTag
                      price={price.price}
                      size="sm"
                      variant={getPriceVariant(price.price, allPrices)}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Savings calculator */}
          {mainPrice && (
            <div className="dashboard-card">
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <h2 className="text-sm font-semibold">Economies estimees</h2>
              </div>
              <div className="p-4">
                <SavingsCalculator
                  stationPrice={mainPrice.price}
                  areaPrices={allPrices}
                  tankSize={preferences.tankSizeL}
                />
              </div>
            </div>
          )}

          {/* Price trends */}
          {station.priceHistory.length > 0 && (
            <div className="dashboard-card lg:col-span-2">
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <h2 className="text-sm font-semibold">Evolution du prix</h2>
              </div>
              <div className="p-4">
                <PriceTrendChart data={station.priceHistory} fuelType={selectedFuel} />
              </div>
            </div>
          )}

          {/* Services */}
          {station.services.length > 0 && (
            <div className="dashboard-card">
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <h2 className="text-sm font-semibold">Services</h2>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {station.services.map((service) => (
                  <span
                    key={service}
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--surface-secondary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Community reports */}
          <div className="dashboard-card lg:col-span-2">
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="text-sm font-semibold">Signalements communaute</h2>
            </div>
            <div className="p-4">
              <CommunityReports stationId={station.id} />
            </div>
          </div>

          {/* Actions */}
          <div className="dashboard-card lg:col-span-3">
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              {/* Fill-up */}
              {mainPrice && !showFillUp && (
                <button
                  onClick={() => {
                    if (!session?.user) {
                      router.push("/connexion");
                      return;
                    }
                    setShowFillUp(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg"
                  style={{ background: "var(--brand)" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                  </svg>
                  J&apos;ai fait le plein ici
                </button>
              )}

              {showFillUp && mainPrice && (
                <div className="flex-1">
                  <FillUpForm
                    stationId={station.id}
                    defaultFuel={selectedFuel}
                    defaultPrice={mainPrice.price}
                    onSubmit={() => setShowFillUp(false)}
                    onCancel={() => setShowFillUp(false)}
                  />
                </div>
              )}

              {/* Alert */}
              {!showAlertForm ? (
                <button
                  onClick={() => {
                    if (!session?.user) {
                      router.push("/connexion");
                      return;
                    }
                    setShowAlertForm(true);
                    if (mainPrice) setAlertPrice((mainPrice.price - 0.02).toFixed(3));
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg"
                  style={{
                    background: "var(--surface-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Alerte prix
                </button>
              ) : (
                <div
                  className="flex-1 p-4 space-y-3 rounded-lg"
                  style={{
                    background: "var(--surface-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="text-sm font-semibold">
                    M&apos;alerter quand {FUEL_TYPES[selectedFuel].label} descend sous :
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="number"
                      step="0.001"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm outline-none rounded-lg"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                      placeholder="1.550"
                    />
                    <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>EUR/L</span>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowAlertForm(false)}
                      className="flex-1 py-2 text-sm font-medium rounded-lg"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={createAlert}
                      className="flex-1 py-2 text-sm font-semibold text-white rounded-lg"
                      style={{ background: "var(--brand)" }}
                    >
                      Creer
                    </button>
                  </div>
                </div>
              )}

              {/* Maps link */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg"
                style={{
                  background: "var(--surface-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Itineraire
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  return `il y a ${diffDays}j`;
}
