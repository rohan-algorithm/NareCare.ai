import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { CyclePhase, SymptomLog } from '@/src/types';

const bleeding = (l: SymptomLog) => l.periodStatus === 'started' || l.periodStatus === 'flowing';

/**
 * First day of each bleed. A "flowing" log only counts as a start when the day
 * before has no bleeding logged, so logging day 3 of a period doesn't restart the cycle.
 */
export function periodStarts(logs: SymptomLog[]): string[] {
  const bleedDays = new Set(logs.filter(bleeding).map((l) => l.logDate));
  const out: string[] = [];
  for (const l of [...logs].filter(bleeding).sort((a, b) => a.logDate.localeCompare(b.logDate))) {
    const prev = parseISO(l.logDate);
    prev.setDate(prev.getDate() - 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    const continues = bleedDays.has(prevKey) && l.periodStatus !== 'started';
    if (!continues && !out.includes(l.logDate)) out.push(l.logDate);
  }
  return out;
}

export function getCycleDay(logs: SymptomLog[], today = new Date()): number | null {
  const starts = periodStarts(logs);
  if (!starts.length) return null;
  const day = differenceInCalendarDays(today, parseISO(starts[starts.length - 1])) + 1;
  return day > 0 && day <= 400 ? day : null;
}

export type CycleStatus = {
  day: number | null;
  /** her own average of the last 3 cycles */
  avg: number | null;
  /** last 3 cycles all 21–35 days and within 7 days of each other */
  regular: boolean;
  /** later than her usual (or past 35 days when there's no history) */
  late: boolean;
  /** 90+ days without a period: the guideline says see a doctor */
  overdue: boolean;
};

export function cycleStatus(logs: SymptomLog[], today = new Date()): CycleStatus {
  const starts = periodStarts(logs);
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) gaps.push(differenceInCalendarDays(parseISO(starts[i]), parseISO(starts[i - 1])));
  const recent = gaps.filter((g) => g >= 15).slice(-3);
  const avg = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : null;
  const regular = recent.length >= 2 && recent.every((g) => g >= 21 && g <= 35) && Math.max(...recent) - Math.min(...recent) <= 7;
  const day = getCycleDay(logs, today);
  return {
    day,
    avg,
    regular,
    late: day != null && day > Math.max(35, (avg ?? 0) + 7),
    overdue: day != null && day >= 90,
  };
}

/**
 * Phases are only estimated for regular cycles: in PCOS many cycles don't ovulate,
 * so a "day 14 ovulation" label would be wrong more often than right.
 */
export function getCyclePhase(cycleDay: number | null, logs?: SymptomLog[]): CyclePhase {
  if (cycleDay == null) return 'unknown';
  const st = logs ? cycleStatus(logs) : null;
  if (st && !st.regular) return 'unknown';
  const len = st?.avg ?? 28;
  const ov = len - 14;
  if (cycleDay > len) return 'unknown';
  if (cycleDay < ov - 1) return 'follicular';
  if (cycleDay <= ov + 1) return 'ovulation';
  return 'luteal';
}

export function phaseCopy(
  phase: CyclePhase,
  lang: 'en' | 'hi' = 'en',
): { title: string; move: string } {
  const hi = lang === 'hi';
  switch (phase) {
    case 'follicular':
      return {
        title: hi ? 'फॉलिकुलर फेज़' : 'Follicular phase',
        move: hi ? 'तेज़ चाल या स्ट्रेंथ (15–20 मिनट)' : 'Brisk walk or strength (15–20 min)',
      };
    case 'ovulation':
      return {
        title: hi ? 'संभावित फर्टाइल दिन' : 'Likely fertile days',
        move: hi ? 'आपका सामान्य वर्कआउट' : 'Your usual workout',
      };
    case 'luteal':
      return {
        title: hi ? 'ल्यूटियल फेज़ · PMS हो सकता है' : 'Luteal phase · PMS may show',
        move: hi ? 'योग, स्ट्रेच, सैर' : 'Yoga, stretch, walks',
      };
    default:
      return {
        title: hi ? 'साइकल' : 'Cycle',
        move: hi ? '10 मिनट योग से शुरू' : 'Start with 10 min of yoga',
      };
  }
}

/** One honest line for the Home pill. */
export function cycleLabel(logs: SymptomLog[], lang: 'en' | 'hi' = 'en'): string {
  const hi = lang === 'hi';
  const st = cycleStatus(logs);
  if (st.day == null) return hi ? 'पीरियड लॉग करें, साइकल ट्रैक होगा' : 'Log your period to track your cycle';
  if (st.overdue) return hi ? `दिन ${st.day} · डॉक्टर से मिलें` : `Day ${st.day} · time to see a doctor`;
  if (st.late) return hi ? `दिन ${st.day} · सामान्य से लंबा` : `Day ${st.day} · longer than usual`;
  const phase = getCyclePhase(st.day, logs);
  if (phase !== 'unknown') return `${hi ? 'दिन' : 'Day'} ${st.day} · ${phaseCopy(phase, lang).title}`;
  return hi ? `साइकल का दिन ${st.day}` : `Cycle day ${st.day}`;
}
