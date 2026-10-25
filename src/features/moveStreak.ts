import type { ExerciseLog } from '@/src/store/useAppStore';
import { WEEKLY_MOVE_PLAN, getExercise } from '@/src/content/exercises';

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Last N days of Move activity for streak grid (Active / today / empty). */
export function moveStreakDays(logs: ExerciseLog[], days = 14) {
  const active = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const today = ymd(new Date());
  const out: { date: string; label: string; active: boolean; isToday: boolean }[] = [];
  const start = addDays(new Date(), -(days - 1));
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const date = ymd(d);
    out.push({
      date,
      label: labels[d.getDay()],
      active: active.has(date),
      isToday: date === today,
    });
  }
  return out;
}

export function moveActiveCount(logs: ExerciseLog[], days = 14) {
  return moveStreakDays(logs, days).filter((d) => d.active).length;
}

export type WeekPlanDay = {
  weekday: number;
  dayIndex: number; // 1–7 Mon-first for display
  labelEn: string;
  labelHi: string;
  exerciseId: string | null;
  isRest: boolean;
  isToday: boolean;
  done: boolean;
};

/** Mon-first week plan with one primary session per day (rest Sunday light). */
export function buildWeekPlan(logs: ExerciseLog[], today = new Date()): WeekPlanDay[] {
  const active = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const todayY = ymd(today);
  const monOffset = (today.getDay() + 6) % 7; // 0=Mon
  const monday = addDays(today, -monOffset);
  const names = [
    { en: 'Mon', hi: 'सोम' },
    { en: 'Tue', hi: 'मंगल' },
    { en: 'Wed', hi: 'बुध' },
    { en: 'Thu', hi: 'गुरु' },
    { en: 'Fri', hi: 'शुक्र' },
    { en: 'Sat', hi: 'शनि' },
    { en: 'Sun', hi: 'रवि' },
  ];

  return names.map((n, i) => {
    const d = addDays(monday, i);
    const jsDay = d.getDay(); // 0=Sun
    const ids = WEEKLY_MOVE_PLAN[jsDay] ?? [];
    const primary = ids[0] ?? null;
    const date = ymd(d);
    return {
      weekday: jsDay,
      dayIndex: i + 1,
      labelEn: n.en,
      labelHi: n.hi,
      exerciseId: primary,
      isRest: !primary,
      isToday: date === todayY,
      done: active.has(date),
    };
  });
}

export function weekPlanTitle(day: WeekPlanDay, lang: 'en' | 'hi') {
  if (!day.exerciseId) return lang === 'hi' ? 'रेस्ट डे' : 'Rest day';
  const ex = getExercise(day.exerciseId);
  if (!ex) return lang === 'hi' ? 'रेस्ट डे' : 'Rest day';
  return lang === 'hi' ? ex.nameHi : ex.name;
}
