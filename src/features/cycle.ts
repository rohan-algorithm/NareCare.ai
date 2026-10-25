import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { CyclePhase, SymptomLog } from '@/src/types';

export function getCycleDay(logs: SymptomLog[], today = new Date()): number | null {
  const starts = logs
    .filter((l) => l.periodStatus === 'started' || l.periodStatus === 'flowing')
    .map((l) => parseISO(l.logDate))
    .sort((a, b) => b.getTime() - a.getTime());

  if (!starts.length) return null;
  const day = differenceInCalendarDays(today, starts[0]) + 1;
  return day > 0 && day <= 45 ? day : null;
}

export function getCyclePhase(cycleDay: number | null): CyclePhase {
  if (cycleDay == null) return 'unknown';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay === 14) return 'ovulation';
  if (cycleDay <= 28) return 'luteal';
  return 'unknown';
}

export function phaseCopy(
  phase: CyclePhase,
  lang: 'en' | 'hi' = 'en',
): { title: string; move: string } {
  const hi = lang === 'hi';
  switch (phase) {
    case 'follicular':
      return {
        title: hi ? 'फॉलिकुलर — ऊर्जा बढ़ रही' : 'Follicular — energy rising',
        move: hi ? 'तेज़ चाल या हल्की स्ट्रेंथ (15–20 मिनट)' : 'Brisk walk or light strength (15–20 min)',
      };
    case 'ovulation':
      return {
        title: hi ? 'ओव्यूलेशन — मध्यम दिन' : 'Ovulation — moderate day',
        move: hi ? 'स्थिर कार्डियो, तीव्रता नरम रखें' : 'Steady cardio, keep intensity kind',
      };
    case 'luteal':
      return {
        title: hi ? 'ल्यूटियल — नरमी से' : 'Luteal — go gentle',
        move: hi ? 'योग, स्ट्रेच, धीमी सैर' : 'Yoga, stretch, slow walks',
      };
    default:
      return {
        title: hi ? 'साइकल दिन अज्ञात' : 'Cycle day unknown',
        move: hi ? '10 मिनट रिस्टोरेटिव योग से शुरू' : 'Start with 10 min restorative yoga',
      };
  }
}
