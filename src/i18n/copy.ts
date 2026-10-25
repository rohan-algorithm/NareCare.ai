import type { Language } from '@/src/types';

const dict = {
  greeting_morning: { en: 'Good morning', hi: 'सुप्रभात' },
  greeting_afternoon: { en: 'Good afternoon', hi: 'नमस्कार' },
  greeting_evening: { en: 'Good evening', hi: 'शुभ संध्या' },
  progress_pulse: { en: 'Progress Pulse', hi: 'प्रोग्रेस पल्स' },
  todays_two: { en: "Today's two things", hi: 'आज की दो बातें' },
  ai_tip: { en: 'AI tip · today', hi: 'आज का AI टिप' },
  ask_coach: { en: 'Ask AI Coach →', hi: 'AI कोच से पूछें →' },
  water: { en: 'Water', hi: 'पानी' },
  glasses: { en: 'glasses', hi: 'गिलास' },
  supplements: { en: 'Supplements today', hi: 'आज के सप्लीमेंट्स' },
  living_context: { en: 'Living context', hi: 'रहने का तरीका' },
  grocery: { en: 'Grocery list', hi: 'किराना सूची' },
  weekly_review: { en: 'Weekly review', hi: 'साप्ताहिक रिव्यू' },
  insights: { en: 'Your insights', hi: 'आपकी insights' },
  educational: {
    en: 'Educational companion only. Not a diagnosis or treatment.',
    hi: 'केवल शैक्षिक साथी। निदान या इलाज नहीं।',
  },
  council_today: { en: 'Council · Today', hi: 'परिषद · आज' },
  explore: { en: 'Explore', hi: 'खोजें' },
  meds_log: { en: 'Meds & supplements', hi: 'दवा / सप्लीमेंट' },
  exam_kit: { en: 'Exam-week kit', hi: 'परीक्षा किट' },
  doctor_kit: { en: 'Doctor Visit Kit', hi: 'डॉक्टर विज़िट किट' },
  no_dosing: {
    en: 'Adherence only — never dosing advice.',
    hi: 'केवल पालन — खुराक सलाह कभी नहीं।',
  },
} as const;

export type CopyKey = keyof typeof dict;

export function t(key: CopyKey, lang: Language = 'en'): string {
  return dict[key][lang] ?? dict[key].en;
}

export function greeting(lang: Language): string {
  const h = new Date().getHours();
  if (h < 12) return t('greeting_morning', lang);
  if (h < 17) return t('greeting_afternoon', lang);
  return t('greeting_evening', lang);
}
