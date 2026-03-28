"use client";

import { useEffect, useState } from "react";
import { useFuelFilter } from "@/contexts/FuelFilterContext";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export function OnboardingGate() {
  const { selectedFuel, setSelectedFuel } = useFuelFilter();
  const { preferences, isHydrated, savePreferences, markOnboardingCompleted } = useUserPreferences();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (selectedFuel !== preferences.preferredFuel) {
      setSelectedFuel(preferences.preferredFuel);
    }
  }, [isHydrated, selectedFuel, preferences.preferredFuel, setSelectedFuel]);

  useEffect(() => {
    if (!isHydrated) return;
    setOpen(!preferences.onboardingCompletedAt);
  }, [isHydrated, preferences.onboardingCompletedAt]);

  const handleSkip = () => {
    markOnboardingCompleted();
    setOpen(false);
  };

  const handleSave = (payload: {
    preferredFuel: typeof preferences.preferredFuel;
    vehicleType: typeof preferences.vehicleType;
    tankSizeL: number;
  }) => {
    savePreferences({
      preferredFuel: payload.preferredFuel,
      vehicleType: payload.vehicleType,
      tankSizeL: payload.tankSizeL,
      onboardingCompletedAt: new Date().toISOString(),
    });
    setSelectedFuel(payload.preferredFuel);
    setOpen(false);
  };

  if (!isHydrated) return null;

  return (
    <OnboardingModal
      open={open}
      initialPreferences={preferences}
      onSkip={handleSkip}
      onSave={handleSave}
    />
  );
}
