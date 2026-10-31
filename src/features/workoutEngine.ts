import { MOVES, MOVE_BY_ID, type TrainerMove } from '@/src/content/trainerMoves';

export type Focus = 'full' | 'lower' | 'upper_core' | 'glute_core' | 'cardio' | 'yoga' | 'mobility';
export type Level = 1 | 2 | 3;
export type MovePrefs = {
  level: Level;
  minutes: number;
  equipment: ('dumbbell' | 'band')[];
  lowImpact: boolean;
  /** period or cramp day: no inversions, deep belly work or jumping */
  periodSafe?: boolean;
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
  cardio: { en: 'Heart-pumping cardio', hi: 'दिल की धड़कन वाला कार्डियो' },
  yoga: { en: 'Yoga flow for PCOS', hi: 'PCOS के लिए योग फ्लो' },
  mobility: { en: 'Gentle stretch & breathe', hi: 'हल्का स्ट्रेच और साँस' },
};

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const PERIOD_AVOID = new Set(['legs-up', 'bow', 'down-dog', 'superman', 'leg-raise', 'flutter-kicks', 'bicycle', 'mountain-climbers', 'jumping-jacks', 'high-knees', 'butt-kicks']);

function eligible(e: TrainerMove, p: MovePrefs): boolean {
  if (p.periodSafe && PERIOD_AVOID.has(e.id)) return false;
  if (e.eq === 'dumbbell' && !p.equipment.includes('dumbbell')) return false;
  if (p.lowImpact && (e.impact || (e.kind === 'strength' && !e.kneeSafe))) return false;
  if (p.level === 1 && e.level > 1) return false;
  return true;
}

function pickFrom(pool: TrainerMove[], n: number, rand: () => number, used: Set<string>): TrainerMove[] {
  const groups = new Set([...used].map((id) => MOVE_BY_ID[id]?.group));
  const shuffled = [...pool].sort(() => rand() - 0.5);
  const out: TrainerMove[] = [];
  for (const e of shuffled) {
    if (out.length >= n) break;
    if (used.has(e.id) || groups.has(e.group)) continue;
    out.push(e);
    used.add(e.id);
    groups.add(e.group);
  }
  return out;
}

function mainSlots(focus: Focus): ((e: TrainerMove) => boolean)[] {
  const legs = (e: TrainerMove) => e.kind === 'strength' && (e.part === 'legs' || e.part === 'glutes');
  const glutes = (e: TrainerMove) => e.kind === 'strength' && e.part === 'glutes';
  const upper = (e: TrainerMove) => e.kind === 'strength' && e.part === 'upper';
  const core = (e: TrainerMove) => e.kind === 'strength' && e.part === 'core';
  const cardio = (e: TrainerMove) => e.kind === 'cardio' && !e.warmupOnly;
  switch (focus) {
    case 'lower':
      return [legs, glutes, legs, core, legs];
    case 'upper_core':
      return [upper, core, upper, core, upper];
    case 'glute_core':
      return [glutes, core, legs, core, glutes];
    case 'cardio':
      return [cardio, legs, cardio, core, cardio, upper];
    default:
      return [legs, upper, core, glutes, upper, cardio];
  }
}

const PARAMS: Record<Level, { work: number; rest: number; rounds: number }> = {
  1: { work: 30, rest: 30, rounds: 2 },
  2: { work: 40, rest: 20, rounds: 2 },
  3: { work: 45, rest: 15, rounds: 3 },
};

export function kcalFor(steps: Step[], weightKg = 65): number {
  const kcal = steps.reduce((sum, s) => sum + ((MOVE_BY_ID[s.exId]?.met ?? 3) * 3.5 * weightKg) / 200 * (s.work / 60), 0);
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
  const pool = MOVES.filter((e) => eligible(e, prefs));
  const used = new Set<string>();
  const steps: Step[] = [];
  const budget = prefs.minutes * 60;

  if (focus === 'yoga' || focus === 'mobility') {
    const hold = focus === 'yoga' ? 40 : 45;
    const first = focus === 'yoga' ? pool.filter((e) => e.kind === 'yoga') : pool.filter((e) => e.kind === 'stretch' || (e.kind === 'yoga' && e.cooldown));
    const fill = pool.filter((e) => e.kind === 'stretch' || e.kind === 'yoga');
    const secs = (e: TrainerMove) => (e.uni ? hold + 20 : hold) + 10;
    const flow: TrainerMove[] = [];
    let left = budget;
    for (const e of [...pickFrom(first, 30, rand, used), ...pickFrom(fill, 30, rand, used)]) {
      if (left < secs(e) && flow.length >= 4) continue;
      flow.push(e);
      left -= secs(e);
    }
    flow.sort((a, b) => flowStage(a) - flowStage(b));
    // Long sessions run out of new poses before time: hold each pose longer instead.
    const used0 = flow.reduce((a, e) => a + secs(e), 0);
    const h = used0 < budget * 0.9 ? Math.min(75, Math.round((hold * budget) / used0 / 5) * 5) : hold;
    flow.forEach((e, i) => steps.push({ exId: e.id, block: 'main', work: e.uni ? h + 20 : h, rest: i === flow.length - 1 ? 0 : 10 }));
  } else {
    const p = PARAMS[prefs.level];
    const work = p.work + boost.work;
    const warm = pickFrom(pool.filter((e) => e.warmup), 3, rand, used);
    warm.forEach((e) => steps.push({ exId: e.id, block: 'warmup', work: 30, rest: 5 }));

    const cool = pickFrom(pool.filter((e) => e.cooldown), 3, rand, used).sort((a, b) => flowStage(a) - flowStage(b));
    const coolSecs = cool.length * 35;
    const warmSecs = steps.reduce((a, s) => a + s.work + s.rest, 0);
    const mainBudget = Math.max(240, budget - warmSecs - coolSecs);

    const slots = mainSlots(focus);
    const circuit: TrainerMove[] = [];
    for (const slot of slots) {
      const [e] = pickFrom(pool.filter(slot), 1, rand, used);
      if (e) circuit.push(e);
    }
    const perRound = (n: number) => n * (work + p.rest);
    let n = circuit.length;
    let rounds = p.rounds + boost.rounds;
    while (rounds > 1 && perRound(n) * rounds > mainBudget) rounds -= 1;
    while (n > 3 && perRound(n) * rounds > mainBudget) n -= 1;
    while (perRound(n) * (rounds + 1) <= mainBudget && rounds < 5) rounds += 1;
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
export function easierAlternative(exId: string, prefs: MovePrefs, exclude: string[]): TrainerMove | null {
  const cur = MOVE_BY_ID[exId];
  if (!cur) return null;
  const pool = MOVES.filter(
    (e) =>
      e.id !== exId &&
      !exclude.includes(e.id) &&
      e.kind === cur.kind &&
      e.part === cur.part &&
      e.level === 1 &&
      !e.impact &&
      !e.warmupOnly &&
      (e.eq === 'none' || prefs.equipment.includes(e.eq)),
  );
  return pool.find((e) => e.group === cur.group) ?? pool.find((e) => e.kneeSafe) ?? pool[0] ?? null;
}

/** Standing → kneeling → face-down → seated → lying → breathing, so a flow never jumps up and down. */
function flowStage(e: TrainerMove): number {
  if (e.group === 'breath') return 6;
  if (!e.mat) return 0;
  if (e.anchor === 'hands' || e.anchor === 'knees' || e.anchor === 'footN') return 1;
  const t = e.frames[0].t;
  if (Math.abs(t) < 60) return 2;
  if (Math.abs(t + 90) < 20) return 3;
  return 4;
}
