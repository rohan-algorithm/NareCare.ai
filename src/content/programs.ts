import type { Focus } from '@/src/features/workoutEngine';

export type Program = {
  id: string;
  title: { en: string; hi: string };
  pitch: { en: string; hi: string };
  weeks: number;
  sessions: Focus[];
  minutes: number;
  lowImpact?: boolean;
  forGoals: string[];
};

export const PROGRAMS: Program[] = [
  {
    id: 'kickstart',
    title: { en: 'PCOS Metabolic Kickstart', hi: 'PCOS मेटाबॉलिक किकस्टार्ट' },
    pitch: {
      en: '4 weeks · 4 days a week. Strength circuits plus low-impact cardio to improve insulin sensitivity, energy and cycles.',
      hi: '4 हफ्ते · हफ्ते में 4 दिन। स्ट्रेंथ सर्किट और हल्का कार्डियो, इंसुलिन, ऊर्जा और पीरियड सुधारने के लिए।',
    },
    weeks: 4,
    sessions: ['full', 'cardio', 'lower', 'upper_core'],
    minutes: 20,
    forGoals: ['lose_weight'],
  },
  {
    id: 'strength',
    title: { en: 'Insulin Strength Builder', hi: 'इंसुलिन स्ट्रेंथ बिल्डर' },
    pitch: {
      en: '6 weeks · 3 days a week. Progressive full-body strength. More muscle means better blood-sugar control, at any weight.',
      hi: '6 हफ्ते · हफ्ते में 3 दिन। धीरे-धीरे बढ़ती ताकत। ज़्यादा मांसपेशी, बेहतर ब्लड शुगर, किसी भी वज़न पर।',
    },
    weeks: 6,
    sessions: ['lower', 'upper_core', 'full'],
    minutes: 25,
    forGoals: ['regulate_periods', 'wellness', 'manage_symptoms'],
  },
  {
    id: 'yoga',
    title: { en: 'Yoga for PCOS & Calm', hi: 'PCOS और शांति के लिए योग' },
    pitch: {
      en: '4 weeks · 5 days a week. Hip-opening flows and long holds to ease stress, cramps and sleep.',
      hi: '4 हफ्ते · हफ्ते में 5 दिन। तनाव, ऐंठन और नींद के लिए हिप खोलने वाले फ्लो।',
    },
    weeks: 4,
    sessions: ['yoga', 'mobility', 'yoga', 'glute_core', 'yoga'],
    minutes: 15,
    forGoals: ['manage_symptoms', 'fertility', 'skin_hair'],
  },
  {
    id: 'gentle',
    title: { en: 'Knee-Friendly Start', hi: 'घुटनों के लिए आसान शुरुआत' },
    pitch: {
      en: '3 weeks · 3 days a week. No jumping, no floor-to-standing rush. Built for beginners and heavier bodies.',
      hi: '3 हफ्ते · हफ्ते में 3 दिन। कोई कूदना नहीं। शुरुआत करने वालों और ज़्यादा वज़न वालों के लिए।',
    },
    weeks: 3,
    sessions: ['glute_core', 'full', 'mobility'],
    minutes: 15,
    lowImpact: true,
    forGoals: ['lose_weight', 'wellness'],
  },
];

export const PROGRAM_BY_ID: Record<string, Program> = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

export function sessionKeys(p: Program): string[] {
  const keys: string[] = [];
  for (let w = 1; w <= p.weeks; w++) p.sessions.forEach((_, i) => keys.push(`w${w}s${i + 1}`));
  return keys;
}

export function parseKey(key: string): { week: number; index: number } {
  const m = key.match(/^w(\d+)s(\d+)$/);
  return { week: Number(m?.[1] ?? 1), index: Number(m?.[2] ?? 1) - 1 };
}

/** Each later week adds 5 s of work per move; every second week adds a round. */
export function boostFor(week: number): { work: number; rounds: number } {
  return { work: Math.min(15, (week - 1) * 5), rounds: Math.floor((week - 1) / 2) };
}
