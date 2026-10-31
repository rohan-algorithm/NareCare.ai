export const GLASS_ML = 250;

/** ~35 ml per kg, rounded to glasses and kept between 8 and 12. */
export function waterGoal(weightKg?: number): number {
  const ml = (weightKg ?? 60) * 35;
  return Math.max(8, Math.min(12, Math.round(ml / GLASS_ML)));
}

export function litres(glasses: number): string {
  return `${((glasses * GLASS_ML) / 1000).toFixed(glasses % 4 === 0 ? 0 : 2).replace(/0$/, '')} L`;
}

/** Glasses she should have had by this hour if spread evenly from wake to evening. */
export function expectedBy(goal: number, hour: number, start = 8, end = 20): number {
  if (hour <= start) return 0;
  if (hour >= end) return goal;
  return Math.round((goal * (hour - start)) / (end - start));
}
