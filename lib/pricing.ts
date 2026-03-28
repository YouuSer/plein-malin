import { DEFAULT_TANK_SIZE } from "./constants";

interface SavingsResult {
  perLiter: number;
  perFillUp: number;
  perYear: number;
  areaAverage: number;
}

export function calculateSavings(
  stationPrice: number,
  areaPrices: number[],
  tankSize: number = DEFAULT_TANK_SIZE,
  fillUpsPerYear: number = 24
): SavingsResult {
  if (areaPrices.length === 0) {
    return { perLiter: 0, perFillUp: 0, perYear: 0, areaAverage: stationPrice };
  }

  const areaAverage =
    areaPrices.reduce((sum, p) => sum + p, 0) / areaPrices.length;
  const perLiter = areaAverage - stationPrice;
  const perFillUp = perLiter * tankSize;
  const perYear = perFillUp * fillUpsPerYear;

  return {
    perLiter: Math.round(perLiter * 1000) / 1000,
    perFillUp: Math.round(perFillUp * 100) / 100,
    perYear: Math.round(perYear * 100) / 100,
    areaAverage: Math.round(areaAverage * 1000) / 1000,
  };
}

export function formatEur(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1) return `${amount.toFixed(2)} EUR`;
  return `${(amount * 100).toFixed(1)} cts`;
}
