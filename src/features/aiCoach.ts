import type { Phenotype, UserProfile } from '@/src/types';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  /** What the coach did in the app while answering. */
  actions?: { text: string; href?: string; ok: boolean }[];
};

const DISCLAIMER =
  '\n\n— Educational only. Discuss medical decisions with your doctor.';

const TIPS: Partial<Record<Phenotype, { en: string[]; hi: string[] }>> & Record<'default', { en: string[]; hi: string[] }> = {
  metabolic: {
    en: [
      'Prioritize protein at breakfast (eggs, paneer, moong cheela, sprouts).',
      'Walk 10–15 min after lunch to blunt the post-meal glucose spike.',
      'Swap white rice for millet/brown rice half-plates when possible.',
    ],
    hi: [
      'नाश्ते में पहले प्रोटीन (अंडे, पनीर, मूंग चीला, स्प्राउट्स)।',
      'लंच के बाद 10–15 मिनट टहलें, शुगर का उछाल कम होगा।',
      'जब हो सके, सफ़ेद चावल की जगह आधी प्लेट मिलेट/ब्राउन राइस।',
    ],
  },
  androgenic: {
    en: [
      'Spearmint tea 1–2 cups/day is commonly used for androgen support (ask your doctor).',
      'Keep dairy lighter if acne flares; watch skin for 2–3 weeks.',
      'Strength + steady protein helps SHBG and skin over months, not days.',
    ],
    hi: [
      'दिन में 1–2 कप पुदीना चाय आम तौर पर ली जाती है (डॉक्टर से पूछें)।',
      'मुंहासे बढ़ें तो डेयरी कम करें; 2–3 हफ्ते त्वचा पर नज़र रखें।',
      'स्ट्रेंथ और नियमित प्रोटीन महीनों में त्वचा सुधारते हैं, दिनों में नहीं।',
    ],
  },
  inflammatory: {
    en: [
      'Turmeric-ginger warm drink + leafy greens help the inflammatory load.',
      'Sleep and stress matter as much as food — luteal yoga is your friend.',
      'Cut refined sugar/maida first; that alone often calms bloating.',
    ],
    hi: [
      'हल्दी-अदरक का गर्म पेय और हरी सब्ज़ियाँ सूजन कम करने में मदद करती हैं।',
      'नींद और तनाव उतने ही ज़रूरी हैं जितना खाना; योग आपका साथी है।',
      'पहले चीनी और मैदा कम करें; अक्सर इसी से पेट फूलना कम होता है।',
    ],
  },
  default: {
    en: [
      'Track 7 days of symptoms so Progress Pulse can show what’s working.',
      'Keep only 2 micro-habits/day — consistency beats intensity.',
      'Log meals as ate/swapped/skipped so we can personalize next week.',
    ],
    hi: [
      '7 दिन लक्षण लॉग करें ताकि पता चले क्या काम कर रहा है।',
      'दिन में सिर्फ़ 2 छोटी आदतें; नियमितता तीव्रता से बेहतर।',
      'खाना खाया/बदला/छोड़ा लॉग करें ताकि अगला हफ्ता आपके हिसाब से बने।',
    ],
  },
};

function phenotypeTips(p: Phenotype, hi = false): string[] {
  const set = TIPS[p] ?? TIPS.default;
  return hi ? set.hi : set.en;
}

/** On-device coach — swaps to OpenAI Edge Function when keys are connected. */
export function coachReply(userText: string, profile: UserProfile | null): string {
  const q = userText.toLowerCase();
  const name = profile?.name ?? 'friend';
  const ph = profile?.phenotype ?? 'mixed';
  const ctx = profile?.livingContext?.replaceAll('_', ' ') ?? 'your kitchen';
  const tips = phenotypeTips(ph);

  if (/hello|hi |namaste|hey/.test(q)) {
    return `Namaste ${name}! I’m your NariCare coach. Ask about diet, cravings, cycle, labs, exercise, or mood — I’ll answer for your ${ph} pattern and ${ctx}.${DISCLAIMER}`;
  }
  if (/craving|sweet|sugar|chocolate/.test(q)) {
    return `Cravings are common in PCOS (insulin + stress). Try: protein snack first (roasted chana / curd + cucumber), spearmint or cinnamon chai without sugar, and a 10-min walk. For ${ctx}, keep a mess-safe option ready so you don’t default to fried snacks.${DISCLAIMER}`;
  }
  if (/period|cycle|irregular|late/.test(q)) {
    return `Irregular cycles are core to PCOS. Log period start days in Track — we predict using your last cycles. In luteal phase go gentle (yoga). Follicular phase is better for brisk walks. If cycles are >90 days apart, please see a gynecologist.${DISCLAIMER}`;
  }
  if (/acne|hair|hirsut|facial/.test(q)) {
    return `Skin/hair changes often track androgens. Spearmint tea, anti-inflammatory plates, and sleep help over 8–12 weeks. Lab markers to discuss: total/free testosterone, SHBG, DHEA-S. Upload reports in Lab Decoder for plain-language readouts.${DISCLAIMER}`;
  }
  if (/weight|lose|fat|bmi/.test(q)) {
    return `Sustainable PCOS weight work = insulin first, not crash diets. Protein breakfast, half-carb plates, evening walks, 7h sleep. Your living context (${ctx}) matters — we already adapt swaps for mess/tiffin. Aim 0.25–0.5 kg/week if weight is a goal.${DISCLAIMER}`;
  }
  if (/exercise|yoga|workout|walk/.test(q)) {
    return `Open Move for today’s cycle-synced routine (15–20 min). Follicular: brisk walk/strength. Luteal: butterfly pose sequence. Short sessions beat skipped gym days.${DISCLAIMER}`;
  }
  if (/lab|report|insulin|lh|fsh|testosterone|vitamin/.test(q)) {
    return `Use Lab Decoder → Decode sample (or upload). We explain LH:FSH, insulin, testosterone, TSH, Vitamin D in Hindi+English and flag High/Low/Borderline. Bring Doctor Visit Kit to your next consult.${DISCLAIMER}`;
  }
  if (/diet|food|eat|meal|dal|rice/.test(q)) {
    return `Today’s plate is under Diet, adapted for ${ctx}. PCOS basics: low-GI carbs, high protein breakfast, no maida/sugar spikes, methi/flax/cinnamon when you can. Want a swap? Tap Swap on any meal card.${DISCLAIMER}`;
  }
  if (/stress|mood|anxiet|depress|sleep/.test(q)) {
    return `Mood and sleep swing hormones hard. Tonight: no screens 30 min before bed, legs-up-wall 4 min, warm water. Community (anonymous) helps when family pressure is heavy. If mood stays low >2 weeks, please seek clinical support.${DISCLAIMER}`;
  }
  if (/family|relative|shaadi|marriage|weight kam|pressure|script/.test(q)) {
    return `Family pressure is real. Soft reply for “bas thoda weight kam karo”: “I’m working with my doctor on PCOS — weight is one piece; hormones and cycle matter more. Ask how I’m feeling.” More scripts live under Council → Scripts. You’re not rude for protecting your health.${DISCLAIMER}`;
  }
  if (/bad day|flare|bloated|angry|exhausted|can't|cannot/.test(q)) {
    return `Bad-day mode exists on Home — turn it on. Today only needs one tiny win (water, or one council ask). Skip Move with kindness if cramps/exhaustion. Come back tomorrow; quitting the app is the only real failure.${DISCLAIMER}`;
  }
  if (/hostel|mess|maggi|canteen|late night/.test(q)) {
    return `Hostel/mess mode: half sabzi rule, curd if available. Late-night Maggi → half pack + egg/paneer. See Diet → canteen swaps. Stock roasted chana in your room — willpower at 1am is a myth.${DISCLAIMER}`;
  }

  return `${name}, for your ${ph} focus, start here:\n1) ${tips[0]}\n2) ${tips[1]}\n3) ${tips[2]}\n\nAsk me something specific (cravings, periods, labs, hostel food) for a sharper answer.${DISCLAIMER}`;
}

export function dailyAiTip(
  profile: UserProfile | null,
  cyclePhase: string,
  lang: 'en' | 'hi' = 'en',
): string {
  const ph = profile?.phenotype ?? 'mixed';
  const hi = lang === 'hi';
  const tips = phenotypeTips(ph, hi);
  if (cyclePhase === 'luteal') {
    return hi
      ? `ल्यूटियल दिन — ${tips[1]} आज नरम योग > HIIT।`
      : `Luteal day — ${tips[1]} Soft yoga > HIIT today.`;
  }
  if (cyclePhase === 'follicular') {
    return hi
      ? `फॉलिकुलर ऊर्जा बढ़ रही — ${tips[0]}`
      : `Follicular energy rising — ${tips[0]}`;
  }
  return tips[0];
}
