import { CATALOG, CATALOG_BY_ID, type CatEx } from '@/src/content/workoutCatalog';

export type Focus = 'full' | 'lower' | 'upper_core' | 'glute_core' | 'cardio' | 'yoga' | 'mobility';
export type Level = 1 | 2 | 3;
export type MovePrefs = {
  level: Level;
  minutes: number;
  equipment: ('dumbbell' | 'band')[];
  lowImpact: boolean;
};

export type Step = {
  exId: string;
  block: 'warmup' | 'main' | 'cooldown';
  work: number;
  rest: number;
  round?: number;
  rounds?: number;
};

export type Workout = {
  key: string;
  focus: Focus;
  title: { en: string; hi: string };
  minutes: number;
  kcal: number;
  steps: Step[];
};

export const FOCUS_TITLE: Record<Focus, { en: string; hi: string }> = {
  full: { en: 'Full-body strength', hi: 'फुल-बॉडी स्ट्रेंथ' },
  lower: { en: 'Legs & glutes', hi: 'पैर और ग्लूट्स' },
  upper_core: { en: 'Arms, back & core', hi: 'हाथ, पीठ और कोर' },
  glute_core: { en: 'Glutes & core', hi: 'ग्लूट्स और कोर' },
  cardio: { en: 'Fat-burn cardio', hi: 'फैट-बर्न कार्डियो' },
  yoga: { en: 'Yoga flow for PCOS', hi: 'PCOS के लिए योग फ्लो' },
  mobility: { en: 'Gentle stretch & breathe', hi: 'हल्का स्ट्रेच और साँस' },
};

const UPPER = ['chest', 'shoulders', 'back', 'upper_arms'];

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Needs a bar, bench, box, band anchor or open space, or is rehab-only: not for home circuits.
const BLOCK =
  /running|walking|tandem|heel-to-toe|supported single|neck|chin tuck|hyperextension|captain|pull ups|bench|shoulderstand|planche|jefferson|nordic|somersault|wrist|farmer|carry|shrug|box squat|terminal knee|leg curl|hip adduction/i;

function eligible(e: CatEx, p: MovePrefs): boolean {
  if (BLOCK.test(e.name)) return false;
  if (e.eq !== 'none' && !p.equipment.includes(e.eq)) return false;
  if (p.lowImpact && (e.impact || (e.cat === 'strength' && !e.kneeSafe))) return false;
  if (p.level === 1 && e.level > 1 && e.cat !== 'stretch') return false;
  return true;
}

function pickFrom(pool: CatEx[], n: number, rand: () => number, used: Set<string>): CatEx[] {
  const groups = new Set([...used].map((id) => CATALOG_BY_ID[id]?.group));
  const shuffled = [...pool].sort(() => rand() - 0.5);
  const out: CatEx[] = [];
  for (const e of shuffled) {
    if (out.length >= n) break;
    if (used.has(e.id) || groups.has(e.group)) continue;
    out.push(e);
    used.add(e.id);
    groups.add(e.group);
  }
  return out;
}

function mainSlots(focus: Focus): ((e: CatEx) => boolean)[] {
  const legs = (e: CatEx) => e.cat === 'strength' && (e.part === 'upper_legs' || e.part === 'lower_legs');
  const upper = (e: CatEx) => e.cat === 'strength' && UPPER.includes(e.part);
  const core = (e: CatEx) => e.cat === 'strength' && e.part === 'core';
  const cardio = (e: CatEx) => e.cat === 'cardio' || (e.cat === 'strength' && e.part === 'full_body');
  switch (focus) {
    case 'lower':
      return [legs, legs, legs, core, legs];
    case 'upper_core':
      return [upper, core, upper, core, upper];
    case 'glute_core':
      return [legs, core, legs, core, legs];
    case 'cardio':
      return [cardio, legs, cardio, core, cardio, upper];
    default:
      return [legs, upper, core, legs, upper, cardio];
  }
}

const PARAMS: Record<Level, { work: number; rest: number; rounds: number }> = {
  1: { work: 30, rest: 30, rounds: 2 },
  2: { work: 40, rest: 20, rounds: 2 },
  3: { work: 45, rest: 15, rounds: 3 },
};

export function kcalFor(steps: Step[], weightKg = 65): number {
  const kcal = steps.reduce((sum, s) => sum + ((CATALOG_BY_ID[s.exId]?.met ?? 3) * 3.5 * weightKg) / 200 * (s.work / 60), 0);
  return Math.round(kcal + (steps.reduce((a, s) => a + s.rest, 0) / 60) * 1.5);
}

/** Builds a warm-up, a circuit sized to the time budget and a cool-down. */
export function buildWorkout(
  focus: Focus,
  prefs: MovePrefs,
  seed: string,
  boost: { work: number; rounds: number } = { work: 0, rounds: 0 },
  weightKg?: number,
): Workout {
  const rand = rng(`${seed}|${focus}|${prefs.level}|${prefs.minutes}|${prefs.equipment.join()}|${prefs.lowImpact}`);
  const pool = CATALOG.filter((e) => eligible(e, prefs));
  const used = new Set<string>();
  const steps: Step[] = [];
  const budget = prefs.minutes * 60;

  if (focus === 'yoga' || focus === 'mobility') {
    const hold = focus === 'yoga' ? 45 : 50;
    const stretches = pool.filter((e) => e.cat === 'stretch');
    const count = Math.max(4, Math.round(budget / (hold + 10)));
    const flow = pickFrom(stretches, count, rand, used);
    flow.forEach((e, i) => steps.push({ exId: e.id, block: 'main', work: hold, rest: i === flow.length - 1 ? 0 : 10 }));
  } else {
    const p = PARAMS[prefs.level];
    const work = p.work + boost.work;
    const warm = pickFrom(pool.filter((e) => e.warmup || (e.mobility && e.cat !== 'stretch')), 3, rand, used);
    const warmFill = warm.length < 3 ? pickFrom(pool.filter((e) => e.cat === 'stretch' && !e.hold), 3 - warm.length, rand, used) : [];
    [...warm, ...warmFill].forEach((e) => steps.push({ exId: e.id, block: 'warmup', work: 30, rest: 5 }));

    const cool = pickFrom(pool.filter((e) => e.cat === 'stretch'), 3, rand, used);
    const coolSecs = cool.length * 35;
    const warmSecs = steps.reduce((a, s) => a + s.work + s.rest, 0);
    const mainBudget = Math.max(240, budget - warmSecs - coolSecs);

    const slots = mainSlots(focus);
    const circuit: CatEx[] = [];
    for (const slot of slots) {
      const [e] = pickFrom(pool.filter(slot), 1, rand, used);
      if (e) circuit.push(e);
    }
    const perRound = (n: number) => n * (work + p.rest);
    let n = circuit.length;
    let rounds = p.rounds + boost.rounds;
    while (rounds > 1 && perRound(n) * rounds > mainBudget) rounds -= 1;
    while (n > 3 && perRound(n) * rounds > mainBudget) n -= 1;
    while (perRound(n) * (rounds + 1) <= mainBudget && rounds < 4) rounds += 1;
    const chosen = circuit.slice(0, n);
    const leftover = mainBudget - perRound(n) * rounds;
    const finisher = Math.min(n, Math.floor(leftover / (work + p.rest)));
    const totalRounds = rounds + (finisher >= 2 ? 1 : 0);
    for (let r = 1; r <= rounds; r++) {
      chosen.forEach((e) => steps.push({ exId: e.id, block: 'main', work, rest: p.rest, round: r, rounds: totalRounds }));
    }
    if (finisher >= 2) {
      chosen.slice(0, finisher).forEach((e) => steps.push({ exId: e.id, block: 'main', work, rest: p.rest, round: rounds + 1, rounds: totalRounds }));
    }
    cool.forEach((e) => steps.push({ exId: e.id, block: 'cooldown', work: 30, rest: 5 }));
  }

  const total = steps.reduce((a, s) => a + s.work + s.rest, 0);
  return {
    key: `${seed}|${focus}`,
    focus,
    title: FOCUS_TITLE[focus],
    minutes: Math.max(5, Math.round(total / 60)),
    kcal: kcalFor(steps, weightKg),
    steps,
  };
}

/** Same body area, easier and low-impact, for the in-workout "make it easier" button. */
export function easierAlternative(exId: string, prefs: MovePrefs, exclude: string[]): CatEx | null {
  const cur = CATALOG_BY_ID[exId];
  if (!cur) return null;
  const pool = CATALOG.filter(
    (e) => e.id !== exId && !exclude.includes(e.id) && e.cat === cur.cat && e.part === cur.part && e.level === 1 && !e.impact && (e.eq === 'none' || prefs.equipment.includes(e.eq)),
  );
  return pool.find((e) => e.group === cur.group) ?? pool[0] ?? null;
}
