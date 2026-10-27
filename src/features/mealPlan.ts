import { MEAL_BY_ID, MEAL_LIBRARY, type MealItem, type Slot } from '@/src/content/mealLibrary';
import type { CuisinePreference, DietPreference, LivingContext, Phenotype, UserProfile } from '@/src/types';

export const SLOTS: Slot[] = ['breakfast', 'midMorning', 'lunch', 'evening', 'dinner'];

export type FoodPrefs = {
  diet: DietPreference;
  cuisine: CuisinePreference;
  context: LivingContext;
  allergies: string[];
  dislikes: string[];
  phenotype: Phenotype;
};

export function prefsFrom(profile: UserProfile | null): FoodPrefs {
  return {
    diet: profile?.dietPreference ?? 'vegetarian',
    cuisine: profile?.cuisinePreference ?? 'north_indian',
    context: profile?.livingContext ?? 'family_kitchen',
    allergies: profile?.allergies ?? [],
    dislikes: profile?.dislikes ?? [],
    phenotype: profile?.phenotype ?? 'mixed',
  };
}

function dietAllows(pref: DietPreference, m: MealItem): boolean {
  switch (pref) {
    case 'vegan':
      return m.diet === 'vegan';
    case 'jain':
      return m.jain && (m.diet === 'vegan' || m.diet === 'veg');
    case 'vegetarian':
      return m.diet === 'vegan' || m.diet === 'veg';
    case 'eggetarian':
      return m.diet !== 'nonveg';
    default:
      return true;
  }
}

function hardOk(m: MealItem, p: FoodPrefs): boolean {
  if (!dietAllows(p.diet, m)) return false;
  const allergies = p.allergies.map((a) => a.toLowerCase());
  if (m.allergens.some((a) => allergies.includes(a))) return false;
  const text = `${m.name} ${m.ingredients.join(' ')}`.toLowerCase();
  return !p.dislikes.some((d) => d && text.includes(d.toLowerCase()));
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function score(m: MealItem, p: FoodPrefs): number {
  let s = 0;
  if (m.contexts.includes(p.context)) s += 4;
  if (m.cuisines === 'all' || p.cuisine === 'pan_indian' || m.cuisines.includes(p.cuisine as never)) s += 2;
  if (p.phenotype === 'metabolic') s += m.proteinG / 6 + m.fiberG / 8;
  else if (p.phenotype === 'inflammatory') s += m.fiberG / 5 + (/fish|saag|palak|flax|millet/i.test(m.name) ? 1 : 0);
  else if (p.phenotype === 'androgenic') s += m.proteinG / 7 + m.fiberG / 7;
  else s += m.proteinG / 8 + m.fiberG / 8;
  return s;
}

/** Ranked options for a slot; diet, allergies and dislikes are never relaxed. */
export function slotOptions(slot: Slot, p: FoodPrefs): MealItem[] {
  const pool = MEAL_LIBRARY.filter((m) => m.slots.includes(slot) && hardOk(m, p));
  const inContext = pool.filter((m) => m.contexts.includes(p.context));
  const base = inContext.length ? inContext : pool;
  return [...base].sort((a, b) => score(b, p) - score(a, p));
}

function dayNumber(date: string): number {
  return Math.round(new Date(`${date}T12:00:00Z`).getTime() / 864e5);
}

/** Rotates through the best-ranked options so consecutive days differ. */
function pick(slot: Slot, p: FoodPrefs, date: string, seed: string, usedToday: Set<string>): MealItem | null {
  const opts = slotOptions(slot, p);
  if (!opts.length) return null;
  const top = opts.slice(0, Math.max(3, Math.ceil(opts.length * 0.6)));
  const start = Math.floor(hash(`${seed}|${slot}`) * top.length) + dayNumber(date);
  for (let i = 0; i < top.length; i++) {
    const m = top[(start + i) % top.length];
    if (!usedToday.has(m.id)) return m;
  }
  return top[start % top.length];
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type PlannedDay = Record<Slot, MealItem | null>;

export function planForDate(p: FoodPrefs, date: string, seed: string, swaps: Record<string, string>): PlannedDay {
  const out = {} as PlannedDay;
  const usedToday = new Set<string>();
  for (const slot of SLOTS) {
    const swapped = swaps[`${date}|${slot}`];
    const swappedMeal = swapped ? MEAL_BY_ID[swapped] : undefined;
    const m = swappedMeal && hardOk(swappedMeal, p) ? swappedMeal : pick(slot, p, date, seed, usedToday);
    out[slot] = m;
    if (m) usedToday.add(m.id);
  }
  return out;
}

export function nextSwap(slot: Slot, p: FoodPrefs, currentId: string | undefined, usedToday: string[]): MealItem | null {
  const opts = slotOptions(slot, p);
  if (opts.length < 2) return null;
  const start = Math.max(0, opts.findIndex((m) => m.id === currentId));
  for (let i = 1; i <= opts.length; i++) {
    const m = opts[(start + i) % opts.length];
    if (m.id !== currentId && !usedToday.includes(m.id)) return m;
  }
  return null;
}

/** ~1 g protein per kg body weight, within a sensible band. */
export function proteinTarget(weightKg?: number): number {
  if (!weightKg || weightKg < 30) return 60;
  return Math.max(50, Math.min(90, Math.round(weightKg)));
}

export function weekDates(from: string, n = 7): string[] {
  return Array.from({ length: n }, (_, i) => shiftDate(from, i));
}

export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
