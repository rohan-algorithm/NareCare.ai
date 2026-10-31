/**
 * Grounded in what women with PCOS actually report needing:
 * irregular-cycle calm (not false certainty), Indian food that fits life,
 * flare/bad days, cravings, energy crashes, family pressure, proof of progress.
 */
import type { LivingContext, Phenotype } from '@/src/types';

export type ProblemId =
  | 'irregular_cycle'
  | 'cravings'
  | 'low_energy'
  | 'acne_hair'
  | 'bloating'
  | 'mood'
  | 'weight_stuck'
  | 'flare';

export type PatientProblem = {
  id: ProblemId;
  title: string;
  titleHi: string;
  patientVoice: string;
  patientVoiceHi: string;
  why: string;
  whyHi: string;
  solveHref: string;
  cta: string;
  ctaHi: string;
};

export const PATIENT_PROBLEMS: PatientProblem[] = [
  {
    id: 'irregular_cycle',
    title: 'Irregular periods stress me out',
    titleHi: 'अनियमित पीरियड तनाव देता है',
    patientVoice: 'Apps keep guessing my ovulation. I’m tired of being wrong.',
    patientVoiceHi: 'ऐप्स ओव्यूलेशन का अनुमान लगाती रहती हैं। गलत होने से थक गई हूँ।',
    why: 'PCOS cycles aren’t clocks. We track last period + patterns — never fake certainty.',
    whyHi: 'PCOS साइकल घड़ी नहीं। आखिरी पीरियड + पैटर्न — झूठा वादा नहीं।',
    solveHref: '/cycle-calm',
    cta: 'Calm my cycle anxiety',
    ctaHi: 'साइकल तनाव शांत करें',
  },
  {
    id: 'cravings',
    title: 'Night cravings wreck my plan',
    titleHi: 'रात की क्रेविंग प्लान बिगाड़ती है',
    patientVoice: 'I do well till 9pm, then Maggi wins.',
    patientVoiceHi: 'रात 9 तक ठीक, फिर मैगी जीत जाती है।',
    why: 'Insulin + stress. Protein first + canteen swaps beat willpower lectures.',
    whyHi: 'इंसुलिन + तनाव। पहले प्रोटीन + कैंटीन स्वैप — लेक्चर नहीं।',
    solveHref: '/tonight',
    cta: 'Fix tonight’s plate',
    ctaHi: 'रात की प्लेट ठीक करें',
  },
  {
    id: 'low_energy',
    title: 'I’m tired even after sleeping',
    titleHi: 'सोने के बाद भी थकान',
    patientVoice: 'People say I’m lazy. I’m not — my body crashes after meals.',
    patientVoiceHi: 'लोग कहते हैं आलसी हूँ। नहीं — खाने के बाद क्रैश होता है।',
    why: 'Post-meal walk + protein breakfast are first-line for metabolic PCOS.',
    whyHi: 'पोस्ट-मील वॉक + प्रोटीन नाश्ता मेटाबॉलिक PCOS की पहली लाइन।',
    solveHref: '/move',
    cta: '10-min energy plan',
    ctaHi: '10 मिनट ऊर्जा प्लान',
  },
  {
    id: 'acne_hair',
    title: 'Acne / hair fall won’t quit',
    titleHi: 'मुंहासे / बाल झड़ना नहीं रुकता',
    patientVoice: 'I’ve tried ten face washes. Nothing sticks for months.',
    patientVoiceHi: 'दस फेस वॉश ट्राई किए। महीनों कुछ नहीं टिकता।',
    why: 'Androgens need weeks of lifestyle + labs with your doctor — not miracle creams alone.',
    whyHi: 'एंड्रोजन को हफ़्तों की जीवनशैली + डॉक्टर की लैब चाहिए — सिर्फ़ क्रीम नहीं।',
    solveHref: '/labs',
    cta: 'Decode labs + next steps',
    ctaHi: 'लैब समझें + अगला कदम',
  },
  {
    id: 'bloating',
    title: 'Evening bloating every day',
    titleHi: 'शाम को रोज़ सूजन',
    patientVoice: 'By 6pm my stomach feels tight. I stop eating out of fear.',
    patientVoiceHi: 'शाम 6 तक पेट कसा। डर से खाना बंद कर देती हूँ।',
    why: 'Fiber + paced meals + luteal-gentle move. Track pattern for your gynae.',
    whyHi: 'फाइबर + धीमे भोजन + ल्यूटियल नरमी। गायनी के लिए पैटर्न ट्रैक करें।',
    solveHref: '/diet',
    cta: 'Anti-bloat plate today',
    ctaHi: 'आज एंटी-ब्लोट प्लेट',
  },
  {
    id: 'mood',
    title: 'Mood swings & family pressure',
    titleHi: 'मूड स्विंग और पारिवारिक दबाव',
    patientVoice: '“Bas thoda weight kam karo” hits harder than any missed workout.',
    patientVoiceHi: '“बस थोड़ा वेट कम करो” मिस्ड वर्कआउट से ज़्यादा चुभता है।',
    why: 'Family scripts + Soft day + AI coach. You’re not dramatic.',
    whyHi: 'पारिवारिक जवाब + Soft day + AI कोच। आप नाटकीय नहीं।',
    solveHref: '/council',
    cta: 'Get support + scripts',
    ctaHi: 'सहारा + जवाब लें',
  },
  {
    id: 'weight_stuck',
    title: 'Weight won’t budge',
    titleHi: 'वजन नहीं घटता',
    patientVoice: 'I eat less than my friends and still gain. It’s humiliating.',
    patientVoiceHi: 'दोस्तों से कम खाती हूँ फिर भी बढ़ता है। शर्मिंदा करती है।',
    why: 'Insulin first, not crash diets. Living-context plates + Progress Pulse proof.',
    whyHi: 'पहले इंसुलिन, क्रैश डाइट नहीं। असली प्लेट + Progress Pulse सबूत।',
    solveHref: '/weekly',
    cta: 'See what’s working',
    ctaHi: 'क्या काम कर रहा है देखें',
  },
  {
    id: 'flare',
    title: 'Today is a flare / bad day',
    titleHi: 'आज फ्लेयर / खराब दिन',
    patientVoice: 'Don’t show me five perfect habits. I need one tiny win.',
    patientVoiceHi: 'पाँच परफेक्ट आदतें न दिखाओ। एक छोटी जीत चाहिए।',
    why: 'Flare care: water, heat, kindness skip, soft food — no guilt.',
    whyHi: 'फ्लेयर केयर: पानी, गर्मी, दया स्किप, नरम खाना — बिना Guilt।',
    solveHref: '/flare',
    cta: 'Open flare care',
    ctaHi: 'फ्लेयर केयर खोलें',
  },
];

export function problemsForProfile(phenotype: Phenotype): PatientProblem[] {
  const order: ProblemId[] =
    phenotype === 'metabolic'
      ? ['cravings', 'low_energy', 'weight_stuck', 'irregular_cycle', 'flare', 'mood', 'bloating', 'acne_hair']
      : phenotype === 'androgenic'
        ? ['acne_hair', 'irregular_cycle', 'mood', 'cravings', 'flare', 'weight_stuck', 'low_energy', 'bloating']
        : phenotype === 'inflammatory'
          ? ['bloating', 'mood', 'flare', 'low_energy', 'irregular_cycle', 'cravings', 'acne_hair', 'weight_stuck']
          : ['irregular_cycle', 'cravings', 'flare', 'mood', 'low_energy', 'weight_stuck', 'bloating', 'acne_hair'];
  return order.map((id) => PATIENT_PROBLEMS.find((p) => p.id === id)!).filter(Boolean);
}

export function tonightPlate(ctx: LivingContext, lang: 'en' | 'hi') {
  const plans: Record<LivingContext, { en: string; hi: string; steps: { en: string; hi: string }[] }> = {
    family_kitchen: {
      en: 'Dal + sabzi + 1 roti + curd. Skip second helping of rice.',
      hi: 'दाल + सब्ज़ी + 1 रोटी + दही। चावल की दूसरी प्लेट स्किप।',
      steps: [
        { en: 'Start with curd or salad', hi: 'दही या सलाद से शुरू' },
        { en: 'Half plate sabzi', hi: 'आधी प्लेट सब्ज़ी' },
        { en: 'Walk 10 min after', hi: 'बाद में 10 मिनट वॉक' },
      ],
    },
    hostel_mess: {
      en: 'Whatever the mess is: half sabzi, less rice, curd if available.',
      hi: 'मेस जो भी हो: आधी सब्ज़ी, कम चावल, दही मिले तो लें।',
      steps: [
        { en: 'Skip fried side if possible', hi: 'तल हुआ साइड छोड़ें' },
        { en: 'Add roasted chana from room', hi: 'कमरे से भुना चना जोड़ें' },
        { en: 'Water before seconds', hi: 'सेकंड से पहले पानी' },
      ],
    },
    tiffin: {
      en: 'Open dabba: eat sabzi/protein first, then carbs. Save sweet for after walk.',
      hi: 'डिब्बा: पहले सब्ज़ी/प्रोटीन, फिर कार्ब। मीठा वॉक के बाद।',
      steps: [
        { en: 'Protein / sabzi first', hi: 'पहले प्रोटीन/सब्ज़ी' },
        { en: 'Slow last 5 bites', hi: 'आखिरी 5 निवाले धीरे' },
        { en: 'Stairs or stroll 8 min', hi: 'सीढ़ियाँ या 8 मिनट सैर' },
      ],
    },
    eating_out: {
      en: 'Grilled / tandoori / dal + salad. Share dessert. One mocktail max.',
      hi: 'ग्रिल्ड/तंदूरी/दाल + सलाद। मिठाई शेयर। एक मॉकट्रेल।',
      steps: [
        { en: 'Ask for less oil / butter', hi: 'कम तेल/मक्खन माँगें' },
        { en: 'Veg or protein starter first', hi: 'पहले वेज/प्रोटीन स्टार्टर' },
        { en: 'Park farther — walk back', hi: 'दूर पार्क — पैदल लौटें' },
      ],
    },
  };
  const p = plans[ctx];
  return {
    title: lang === 'hi' ? p.hi : p.en,
    steps: p.steps.map((s) => (lang === 'hi' ? s.hi : s.en)),
  };
}

export const FLARE_CARE = {
  title: { en: 'Flare care · tiny wins only', hi: 'फ्लेयर केयर · सिर्फ़ छोटी जीत' },
  steps: [
    {
      en: 'Drink 1 glass water now',
      hi: 'अभी 1 गिलास पानी पिएँ',
      href: undefined as string | undefined,
      action: 'water' as const,
    },
    {
      en: 'Heat on lower belly 10 min (if cramps)',
      hi: 'निचले पेट पर 10 मिनट गर्मी (ऐंठन हो तो)',
      href: undefined,
      action: null,
    },
    {
      en: 'Soft plate: curd + banana / khichdi — no hero meals',
      hi: 'नरम प्लेट: दही + केला / खिचड़ी — हीरो मील नहीं',
      href: '/tonight',
      action: null,
    },
    {
      en: 'Skip exercise with kindness — or 3 min breathing',
      hi: 'एक्सरसाइज़ दया से स्किप — या 3 मिनट साँस',
      href: '/move',
      action: null,
    },
    {
      en: 'Log mood only (30 sec) — enough for today',
      hi: 'सिर्फ़ मूड लॉग (30 सेकंड) — आज काफ़ी',
      href: '/track',
      action: null,
    },
  ],
};
