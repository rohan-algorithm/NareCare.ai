import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';

import type { SymptomLog } from '@/src/types';

export const MILESTONES = [3, 7, 14, 30, 60, 100];

export type LogStreak = {
  /** consecutive logged days ending today, or yesterday if today isn't logged yet */
  current: number;
  best: number;
  loggedToday: boolean;
  /** Sun → Sat of this week (matches the calendar): logged, missed, or still to come */
  week: ('done' | 'missed' | 'today' | 'future')[];
  /** next badge to earn and how far along she is */
  next: number | null;
  earned: number[];
  total: number;
};

const key = (d: Date) => format(d, 'yyyy-MM-dd');

/** The daily logging streak, computed from her logs so a missed day really resets it. */
export function logStreak(logs: SymptomLog[], now = new Date()): LogStreak {
  const days = new Set(logs.map((l) => l.logDate));
  const today = key(now);
  const loggedToday = days.has(today);

  let current = 0;
  for (let d = loggedToday ? now : addDays(now, -1); days.has(key(d)); d = addDays(d, -1)) current += 1;

  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1])) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const sunday = startOfWeek(now, { weekStartsOn: 0 });
  const week = Array.from({ length: 7 }, (_, i) => {
    const k = key(addDays(sunday, i));
    if (k === today) return loggedToday ? 'done' : 'today';
    if (k > today) return 'future';
    return days.has(k) ? 'done' : 'missed';
  }) as LogStreak['week'];

  return {
    current,
    best: Math.max(best, current),
    loggedToday,
    week,
    next: MILESTONES.find((m) => m > current) ?? null,
    earned: MILESTONES.filter((m) => m <= Math.max(best, current)),
    total: days.size,
  };
}
