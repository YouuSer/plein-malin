"use client";

import { useEffect, useMemo, useState } from "react";
import { FUEL_TYPE_KEYS, FUEL_TYPES, type FuelType } from "@/lib/constants";
import type { UserPreferences, VehicleType } from "@/lib/types";
import { VEHICLE_TANK_PRESETS } from "@/hooks/useUserPreferences";

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
  { key: "utilitaire", label: "Utilitaire", subtitle: "Grand volume" },
  { key: "moto", label: "Moto", subtitle: "Deux roues" },
];

function clampTankSize(value: number): number {
  return Math.min(140, Math.max(15, Math.round(value)));
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FUEL_TYPE_KEYS.map((fuelKey) => {
                  const active = preferredFuel === fuelKey;
                  return (
                    <button
                      key={fuelKey}
                      onClick={() => setPreferredFuel(fuelKey)}
                      className="px-3 py-2.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: active ? "var(--brand-gradient)" : "var(--surface-secondary)",
                        backgroundImage: active ? "var(--brand-gradient)" : undefined,
                        color: active ? "#fff" : "var(--text-secondary)",
                        border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                      }}
                    >
                      {FUEL_TYPES[fuelKey].label}
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
                      className="w-full text-left p-3 rounded-lg"
                      style={{
                        background: active ? "var(--brand-gradient-subtle)" : "var(--surface-secondary)",
                        border: `1px solid ${active ? "rgba(0, 128, 96, 0.28)" : "var(--border)"}`,
                      }}
                    >
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {option.subtitle} · Reservoir estime {VEHICLE_TANK_PRESETS[option.key]}L
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
                    min={15}
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
