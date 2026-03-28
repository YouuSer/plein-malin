"use client";

import { useEffect, useMemo, useState } from "react";
import { FUEL_TYPE_KEYS, type FuelType } from "@/lib/constants";
import type { UserPreferences, VehicleType } from "@/lib/types";
import { VEHICLE_TANK_PRESETS } from "@/hooks/useUserPreferences";
import {
  mdiCarEstate,
  mdiCarHatchback,
  mdiCarSide,
  mdiMoped,
  mdiVanUtility,
} from "@mdi/js";
import { Motorcycle } from "@phosphor-icons/react";
import {
  IconCarSuvFilled,
} from "@tabler/icons-react";

interface OnboardingModalProps {
  open: boolean;
  initialPreferences: UserPreferences;
  onSkip: () => void;
  onSave: (payload: {
    preferredFuel: FuelType;
    vehicleType: VehicleType;
    tankSizeL: number;
  }) => void;
}

const VEHICLE_OPTIONS: Array<{ key: VehicleType; label: string; subtitle: string }> = [
  { key: "citadine", label: "Citadine", subtitle: "Usage urbain" },
  { key: "berline", label: "Berline", subtitle: "Usage mixte" },
  { key: "suv", label: "SUV", subtitle: "Long trajets" },
  { key: "monospace", label: "Monospace", subtitle: "Famille / volume" },
  { key: "utilitaire", label: "Utilitaire", subtitle: "Grand volume" },
  { key: "moto", label: "Moto", subtitle: "Deux roues" },
  { key: "scooter", label: "Scooter", subtitle: "Ville / agile" },
];

const FUEL_EURO_STYLES: Record<
  FuelType,
  {
    badgeShape: "circle" | "square" | "diamond";
    badgeLabel: string;
    badgeSecondaryLabel?: string;
    badgeBackground: string;
    badgeBorder: string;
    badgeText: string;
    badgeShadow: string;
    title: string;
    helper: string;
  }
> = {
  e10: {
    badgeShape: "circle",
    badgeLabel: "E10",
    badgeBackground: "linear-gradient(135deg, #3a9a2c, #78ca58)",
    badgeBorder: "rgba(111, 203, 87, 0.82)",
    badgeText: "#ffffff",
    badgeShadow: "rgba(66, 164, 54, 0.42)",
    title: "E10 - Sans plomb 95",
    helper: "Essence E10",
  },
  sp95: {
    badgeShape: "circle",
    badgeLabel: "E5",
    badgeBackground: "linear-gradient(135deg, #0b5b27, #16963e)",
    badgeBorder: "rgba(43, 162, 72, 0.88)",
    badgeText: "#ffffff",
    badgeShadow: "rgba(17, 109, 43, 0.45)",
    title: "E5 - Sans plomb 95",
    helper: "SP95",
  },
  sp98: {
    badgeShape: "circle",
    badgeLabel: "E5",
    badgeSecondaryLabel: "98",
    badgeBackground: "linear-gradient(135deg, #12766c, #1fb6a5)",
    badgeBorder: "rgba(39, 188, 170, 0.9)",
    badgeText: "#ffffff",
    badgeShadow: "rgba(18, 122, 111, 0.46)",
    title: "E5 - Sans plomb 98",
    helper: "SP98",
  },
  gazole: {
    badgeShape: "square",
    badgeLabel: "B7",
    badgeBackground: "linear-gradient(135deg, #d0c400, #f0e33e)",
    badgeBorder: "rgba(243, 233, 98, 0.88)",
    badgeText: "#4b4300",
    badgeShadow: "rgba(192, 177, 17, 0.48)",
    title: "B7 / Diesel",
    helper: "Gazole",
  },
  e85: {
    badgeShape: "circle",
    badgeLabel: "E85",
    badgeBackground: "linear-gradient(135deg, #1a9cbc, #49d4ef)",
    badgeBorder: "rgba(76, 214, 240, 0.88)",
    badgeText: "#ffffff",
    badgeShadow: "rgba(31, 161, 190, 0.46)",
    title: "E85 / Superethanol",
    helper: "Bioethanol",
  },
  gplc: {
    badgeShape: "diamond",
    badgeLabel: "LPG",
    badgeBackground: "linear-gradient(135deg, #166692, #2b8cc3)",
    badgeBorder: "rgba(78, 178, 223, 0.86)",
    badgeText: "#ffffff",
    badgeShadow: "rgba(24, 110, 152, 0.5)",
    title: "LPG / Gaz de petrole",
    helper: "GPLc",
  },
};

function VehicleIcon({ type, active }: { type: VehicleType; active: boolean }) {
  const color = active ? "#ffffff" : "var(--text-secondary)";

  if (type === "berline") {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0" aria-hidden="true">
        <path d={mdiCarSide} fill={color} />
      </svg>
    );
  }

  if (type === "suv") {
    return <IconCarSuvFilled size={28} color={color} className="shrink-0" aria-hidden="true" />;
  }

  if (type === "moto") {
    return <Motorcycle size={34} weight="fill" color={color} className="shrink-0" aria-hidden="true" />;
  }

  if (type === "scooter") {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0" aria-hidden="true">
        <path d={mdiMoped} fill={color} />
      </svg>
    );
  }

  const iconPathByType: Record<Exclude<VehicleType, "berline" | "suv" | "moto" | "scooter">, string> = {
    citadine: mdiCarHatchback,
    monospace: mdiCarEstate,
    utilitaire: mdiVanUtility,
  };

  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" aria-hidden="true">
      <path d={iconPathByType[type]} fill={color} />
    </svg>
  );
}

function clampTankSize(value: number): number {
  return Math.min(140, Math.max(5, Math.round(value)));
}

export function OnboardingModal({ open, initialPreferences, onSkip, onSave }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [preferredFuel, setPreferredFuel] = useState<FuelType>(initialPreferences.preferredFuel);
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialPreferences.vehicleType);
  const [tankSizeInput, setTankSizeInput] = useState(String(initialPreferences.tankSizeL));

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPreferredFuel(initialPreferences.preferredFuel);
    setVehicleType(initialPreferences.vehicleType);
    setTankSizeInput(String(initialPreferences.tankSizeL));
  }, [open, initialPreferences]);

  const progressLabel = useMemo(() => `Etape ${step + 1}/3`, [step]);

  if (!open) return null;

  const handleVehicleSelect = (next: VehicleType) => {
    setVehicleType(next);
    setTankSizeInput(String(VEHICLE_TANK_PRESETS[next]));
  };

  const handleConfirm = () => {
    const parsed = Number(tankSizeInput);
    const tankSizeL = Number.isFinite(parsed)
      ? clampTankSize(parsed)
      : VEHICLE_TANK_PRESETS[vehicleType];

    onSave({
      preferredFuel,
      vehicleType,
      tankSizeL,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(5, 8, 12, 0.55)" }} />

      <div
        className="relative w-full max-w-xl rounded-2xl border overflow-hidden animate-scale-in"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="panel-header !border-b !px-4 !py-3" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
              Bienvenue
            </p>
            <h2 className="text-base font-semibold mt-1">Personnalisons votre experience</h2>
          </div>
          <button
            onClick={onSkip}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--surface-secondary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            Passer
          </button>
        </div>

        <div className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
          {progressLabel}
        </div>

        <div className="px-4 pb-4 min-h-[250px]">
          {step === 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Quel carburant suivez-vous en priorite ?</p>
              <p className="text-[11px] mb-2.5" style={{ color: "var(--text-secondary)" }}>
                Si plusieurs carburants sont disponibles, la recherche suit votre preference.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FUEL_TYPE_KEYS.map((fuelKey) => {
                  const active = preferredFuel === fuelKey;
                  const fuelStyle = FUEL_EURO_STYLES[fuelKey];
                  const isDiamond = fuelStyle.badgeShape === "diamond";
                  const badgeRadius =
                    fuelStyle.badgeShape === "circle"
                      ? "999px"
                      : fuelStyle.badgeShape === "square"
                        ? "10px"
                        : "8px";

                  return (
                    <button
                      key={fuelKey}
                      onClick={() => setPreferredFuel(fuelKey)}
                      className="rounded-lg px-2 py-2 text-center transition-all"
                      style={{
                        background: active ? "rgba(45, 176, 128, 0.08)" : "var(--surface)",
                        border: "none",
                        boxShadow: active ? "0 0 0 2px rgba(45, 176, 128, 0.18) inset" : "none",
                      }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`relative w-11 h-11 flex items-center justify-center ${isDiamond ? "rotate-45" : ""}`}
                          style={{
                            borderRadius: badgeRadius,
                            background: fuelStyle.badgeBackground,
                            border: `2px solid ${fuelStyle.badgeBorder}`,
                            boxShadow: `0 4px 10px ${fuelStyle.badgeShadow}`,
                          }}
                        >
                          <div
                            className={`leading-none font-extrabold ${isDiamond ? "-rotate-45" : ""}`}
                            style={{
                              color: fuelStyle.badgeText,
                              fontSize: fuelStyle.badgeSecondaryLabel ? "10px" : "15px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "1px",
                            }}
                          >
                            <span>{fuelStyle.badgeLabel}</span>
                            {fuelStyle.badgeSecondaryLabel && (
                              <span style={{ fontSize: "9px", fontWeight: 800 }}>
                                {fuelStyle.badgeSecondaryLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="text-[11px] font-semibold leading-tight"
                          style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
                        >
                          {fuelStyle.title}
                        </div>
                        <div className="text-[10px] leading-none" style={{ color: "var(--text-tertiary)" }}>
                          {fuelStyle.helper}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-sm font-medium mb-3">Quel type de vehicule utilisez-vous le plus ?</p>
              <div className="space-y-2">
                {VEHICLE_OPTIONS.map((option) => {
                  const active = vehicleType === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleVehicleSelect(option.key)}
                      className="w-full text-left p-3 rounded-lg flex items-center gap-3"
                      style={{
                        background: active ? "var(--brand-gradient)" : "var(--surface-secondary)",
                        backgroundImage: active ? "var(--brand-gradient)" : undefined,
                        border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                        color: active ? "#fff" : "inherit",
                      }}
                    >
                      <VehicleIcon type={option.key} active={active} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{option.label}</div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: active ? "rgba(255,255,255,0.82)" : "var(--text-tertiary)" }}
                        >
                          {option.subtitle} · Reservoir estime {VEHICLE_TANK_PRESETS[option.key]}L
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-medium mb-3">Capacite de reservoir estimee</p>
              <div className="dashboard-card !p-3 !shadow-none">
                <div className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Valeur prefillee selon votre vehicule, modifiable.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={140}
                    step={1}
                    value={tankSizeInput}
                    onChange={(event) => setTankSizeInput(event.target.value)}
                    className="input-focus w-28 px-3 py-2 text-sm font-semibold"
                  />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    litres
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[35, 45, 55, 65, 75].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTankSizeInput(String(preset))}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: "var(--surface-secondary)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {preset}L
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40"
            style={{
              background: "var(--surface-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Retour
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep((prev) => Math.min(2, prev + 1))}
              className="text-xs font-semibold px-3 py-2 rounded-lg"
              style={{
                background: "var(--brand-gradient)",
                backgroundImage: "var(--brand-gradient)",
                color: "#fff",
              }}
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="text-xs font-semibold px-3 py-2 rounded-lg"
              style={{
                background: "var(--brand-gradient)",
                backgroundImage: "var(--brand-gradient)",
                color: "#fff",
              }}
            >
              Enregistrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
