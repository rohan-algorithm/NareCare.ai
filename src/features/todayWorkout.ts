import { PROGRAM_BY_ID, boostFor, parseKey, sessionKeys } from '@/src/content/programs';
import { localDate } from '@/src/features/mealPlan';
import type { Focus } from '@/src/features/workoutEngine';
import type { ActiveProgram, MoveSettings } from '@/src/store/useAppStore';
import type { SymptomLog } from '@/src/types';

const ROTATION: Focus[] = ['full', 'cardio', 'glute_core', 'yoga', 'upper_core', 'mobility', 'lower'];

export type PlannedSession = {
  focus: Focus;
  minutes: number;
  seed: string;
  week: number;
  lowImpact: boolean;
  programId?: string;
  sessionKey?: string;
  sessionNo?: number;
  sessionTotal?: number;
  gentle: boolean;
  programDone?: boolean;
};

export function planToday(settings: MoveSettings, program: ActiveProgram, logs: SymptomLog[], mode: 'auto' | 'gentle' | 'regular' = 'auto'): PlannedSession {
  const today = localDate();
  const todayLog = logs.find((l) => l.logDate === today);
  const periodDay = todayLog?.periodStatus === 'started' || todayLog?.periodStatus === 'flowing';
  const cramps = (todayLog?.symptoms?.cramps ?? 0) > 0;
  const gentle = mode === 'gentle' || (mode === 'auto' && (periodDay || cramps));

  const p = program ? PROGRAM_BY_ID[program.id] : undefined;
  if (p && program) {
    const keys = sessionKeys(p);
    const next = keys.find((k) => !program.done.includes(k));
    if (next) {
      const { week, index } = parseKey(next);
      return {
        focus: gentle ? 'mobility' : p.sessions[index],
        minutes: gentle ? 15 : p.minutes,
        seed: `${p.id}|${next}`,
        week,
        lowImpact: settings.lowImpact || !!p.lowImpact,
        programId: p.id,
        sessionKey: gentle ? undefined : next,
        sessionNo: keys.indexOf(next) + 1,
        sessionTotal: keys.length,
        gentle,
      };
    }
    return { focus: 'yoga', minutes: settings.minutes, seed: today, week: 1, lowImpact: settings.lowImpact, programId: p.id, gentle, programDone: true };
  }
  const day = Math.round(new Date(`${today}T12:00:00Z`).getTime() / 864e5);
  return {
    focus: gentle ? 'mobility' : ROTATION[day % ROTATION.length],
    minutes: gentle ? 15 : settings.minutes,
    seed: today,
    week: 1,
    lowImpact: settings.lowImpact,
    gentle,
  };
}

export { boostFor };
