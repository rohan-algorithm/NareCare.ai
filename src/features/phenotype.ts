import type { Phenotype, UserProfile } from '@/src/types';

const METABOLIC = new Set(['weight_gain', 'fatigue', 'cravings', 'irregular_periods']);
const ANDROGENIC = new Set(['acne', 'hair_fall', 'facial_hair']);
const INFLAMMATORY = new Set(['bloating', 'mood_swings', 'fatigue', 'acne']);

/** Scores onboarding symptoms into a primary PCOS phenotype. */
export function derivePhenotype(symptoms: string[]): Phenotype {
  let metabolic = 0;
  let androgenic = 0;
  let inflammatory = 0;

  for (const s of symptoms) {
    if (METABOLIC.has(s)) metabolic += 1;
    if (ANDROGENIC.has(s)) androgenic += 1;
    if (INFLAMMATORY.has(s)) inflammatory += 1;
  }

  const ranked = [
    { key: 'metabolic' as const, score: metabolic },
    { key: 'androgenic' as const, score: androgenic },
    { key: 'inflammatory' as const, score: inflammatory },
  ].sort((a, b) => b.score - a.score);

  if (ranked[0].score === 0) return 'mixed';
  if (ranked[0].score - ranked[1].score <= 1 && ranked[1].score > 0) return 'mixed';
  return ranked[0].key;
}

export function phenotypeLabel(p: Phenotype, lang: 'en' | 'hi' = 'en'): string {
  const map = {
    metabolic: { en: 'Metabolic focus', hi: 'मेटाबॉलिक फोकस' },
    androgenic: { en: 'Androgen focus', hi: 'एंड्रोजन फोकस' },
    inflammatory: { en: 'Inflammation focus', hi: 'सूजन फोकस' },
    mixed: { en: 'Balanced focus', hi: 'संतुलित फोकस' },
  };
  return map[p][lang];
}

export function dailyFocus(
  profile: UserProfile,
  lang: 'en' | 'hi' = 'en',
): { title: string; why: string } {
  const hi = lang === 'hi';
  switch (profile.phenotype) {
    case 'metabolic':
      return {
        title: hi ? 'प्रोटीन-पहले नाश्ता + 15 मिनट वॉक' : 'Protein-first breakfast + 15 min walk',
        why: hi
          ? 'इंसुलिन स्पाइक कम करता है — क्रेविंग और वजन बढ़ने से जुड़ा।'
          : 'Helps blunt insulin spikes that drive cravings and weight gain.',
      };
    case 'androgenic':
      return {
        title: hi ? 'स्पीयरमिंट टी + एंटी-इंफ्लेमेटरी प्लेट' : 'Spearmint tea + anti-inflammatory plate',
        why: hi
          ? 'हफ़्तों में त्वचा साफ़ और अनचाहे बाल धीमे करने में मदद।'
          : 'Supports clearer skin and slower unwanted hair growth over weeks.',
      };
    case 'inflammatory':
      return {
        title: hi ? 'हल्दी-अदरक वाला गरम पेय + हल्का योग' : 'Turmeric-ginger warm drink + gentle yoga',
        why: hi
          ? 'सूजन का बोझ कम करता है — सूजन और मूड स्विंग से जुड़ा।'
          : 'Calms the inflammatory load that fuels bloating and mood swings.',
      };
    default:
      return {
        title: hi ? 'लक्षण लॉग + आज की 2 माइक्रो-आदतें' : 'Log symptoms + finish today’s 2 micro-habits',
        why: hi
          ? 'मिश्रित पैटर्न को टाइट फीडबैक लूप चाहिए।'
          : 'Mixed patterns need a tight feedback loop to see what actually helps you.',
      };
  }
}
