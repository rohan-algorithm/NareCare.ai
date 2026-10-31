/**
 * Self-check built on the Rotterdam criteria used in the 2023 International PCOS
 * Guideline: PCOS needs 2 of 3 — irregular ovulation, androgen excess, polycystic
 * ovaries on ultrasound — after other causes are ruled out. This is a screening
 * aid, never a diagnosis.
 */

export type Domain = 'ovulation' | 'androgen' | 'ovaries' | 'metabolic';

export type CheckOption = { id: string; en: string; hi: string; pts: Partial<Record<Domain, number>>; flag?: 'pill' | 'young' };
export type CheckQuestion = { id: string; en: string; hi: string; helpEn?: string; helpHi?: string; options: CheckOption[] };

export const QUESTIONS: CheckQuestion[] = [
  {
    id: 'cycle',
    en: 'How many days from the start of one period to the next, usually?',
    hi: 'आमतौर पर एक पीरियड शुरू होने से अगले तक कितने दिन?',
    options: [
      { id: 'regular', en: '21 to 35 days, fairly regular', hi: '21 से 35 दिन, लगभग नियमित', pts: {} },
      { id: 'short', en: 'Less than 21 days', hi: '21 दिन से कम', pts: { ovulation: 2 } },
      { id: 'long', en: '36 to 60 days', hi: '36 से 60 दिन', pts: { ovulation: 3 } },
      { id: 'very_long', en: 'More than 60 days, or no periods for months', hi: '60 दिन से ज़्यादा, या महीनों पीरियड नहीं', pts: { ovulation: 4 } },
      { id: 'unpredictable', en: 'Totally unpredictable', hi: 'बिल्कुल अनिश्चित', pts: { ovulation: 3 } },
      { id: 'pill', en: 'I’m on birth-control pills', hi: 'मैं गर्भनिरोधक गोलियाँ लेती हूँ', pts: {}, flag: 'pill' },
    ],
  },
  {
    id: 'per_year',
    en: 'How many periods did you have in the last 12 months?',
    hi: 'पिछले 12 महीनों में कितने पीरियड आए?',
    options: [
      { id: '10plus', en: '10 or more', hi: '10 या ज़्यादा', pts: {} },
      { id: '8_9', en: '8 or 9', hi: '8 या 9', pts: { ovulation: 1 } },
      { id: 'under8', en: 'Fewer than 8', hi: '8 से कम', pts: { ovulation: 3 } },
      { id: 'unsure', en: 'Not sure', hi: 'पता नहीं', pts: {} },
    ],
  },
  {
    id: 'hair',
    en: 'Dark, coarse hair on your chin, upper lip, chest, belly or back?',
    hi: 'ठुड्डी, ऊपरी होंठ, छाती, पेट या पीठ पर काले, मोटे बाल?',
    helpEn: 'Think of how often you thread, wax or shave these areas.',
    helpHi: 'सोचें कि इन जगहों पर कितनी बार थ्रेडिंग, वैक्स या शेव करती हैं।',
    options: [
      { id: 'none', en: 'No, or just fine light hair', hi: 'नहीं, या सिर्फ़ हल्के बारीक बाल', pts: {} },
      { id: 'some', en: 'Some, I remove it monthly', hi: 'कुछ, महीने में हटाती हूँ', pts: { androgen: 1 } },
      { id: 'moderate', en: 'Quite a lot, every 1 to 2 weeks', hi: 'काफ़ी, हर 1-2 हफ्ते', pts: { androgen: 3 } },
      { id: 'heavy', en: 'A lot, almost daily', hi: 'बहुत, लगभग रोज़', pts: { androgen: 4 } },
    ],
  },
  {
    id: 'acne',
    en: 'Acne that continues past your teens, often on the jawline or chin?',
    hi: 'किशोर उम्र के बाद भी मुंहासे, अक्सर जबड़े या ठुड्डी पर?',
    options: [
      { id: 'no', en: 'No', hi: 'नहीं', pts: {} },
      { id: 'mild', en: 'Mild, comes and goes', hi: 'हल्के, आते-जाते रहते हैं', pts: { androgen: 1 } },
      { id: 'persistent', en: 'Persistent or painful', hi: 'लगातार या दर्दनाक', pts: { androgen: 2 } },
    ],
  },
  {
    id: 'scalp',
    en: 'Hair thinning on the top of your head, or a widening parting?',
    hi: 'सिर के ऊपर बाल पतले होना, या मांग चौड़ी होना?',
    options: [
      { id: 'no', en: 'No', hi: 'नहीं', pts: {} },
      { id: 'some', en: 'A little', hi: 'थोड़ा', pts: { androgen: 1 } },
      { id: 'marked', en: 'Clearly, it worries me', hi: 'साफ़ दिखता है, चिंता होती है', pts: { androgen: 2 } },
    ],
  },
  {
    id: 'usg',
    en: 'Has an ultrasound ever said “polycystic ovaries” or “many follicles”?',
    hi: 'क्या कभी अल्ट्रासाउंड में “पॉलीसिस्टिक ओवरी” या “कई फॉलिकल” लिखा आया?',
    options: [
      { id: 'yes', en: 'Yes', hi: 'हाँ', pts: { ovaries: 4 } },
      { id: 'no', en: 'No, it was normal', hi: 'नहीं, सामान्य था', pts: {} },
      { id: 'never', en: 'Never had one', hi: 'कभी नहीं करवाया', pts: {} },
    ],
  },
  {
    id: 'waist',
    en: 'Weight gain mostly around the waist, and hard to lose?',
    hi: 'वज़न ज़्यादातर पेट के आसपास बढ़ता है और कम करना मुश्किल?',
    options: [
      { id: 'yes', en: 'Yes', hi: 'हाँ', pts: { metabolic: 2 } },
      { id: 'no', en: 'No', hi: 'नहीं', pts: {} },
    ],
  },
  {
    id: 'skin',
    en: 'Dark, velvety skin on the back of your neck, armpits or groin?',
    hi: 'गर्दन के पीछे, बगल या जांघों के बीच काली, मखमली त्वचा?',
    helpEn: 'Called acanthosis nigricans. It is a sign of insulin resistance.',
    helpHi: 'इसे एकैन्थोसिस निग्रिकन्स कहते हैं, इंसुलिन रेज़िस्टेंस का संकेत।',
    options: [
      { id: 'yes', en: 'Yes', hi: 'हाँ', pts: { metabolic: 3 } },
      { id: 'no', en: 'No', hi: 'नहीं', pts: {} },
    ],
  },
  {
    id: 'family',
    en: 'Does your mother or a sister have PCOS or type 2 diabetes?',
    hi: 'क्या माँ या बहन को PCOS या टाइप 2 डायबिटीज़ है?',
    options: [
      { id: 'yes', en: 'Yes', hi: 'हाँ', pts: { metabolic: 2 } },
      { id: 'no', en: 'No', hi: 'नहीं', pts: {} },
      { id: 'unsure', en: 'Not sure', hi: 'पता नहीं', pts: {} },
    ],
  },
  {
    id: 'menarche',
    en: 'When did you get your first period?',
    hi: 'पहला पीरियड कब आया था?',
    options: [
      { id: 'over2', en: 'More than 2 years ago', hi: '2 साल से ज़्यादा पहले', pts: {} },
      { id: 'under2', en: 'Within the last 2 years', hi: 'पिछले 2 साल में', pts: {}, flag: 'young' },
    ],
  },
];

export type CheckAnswers = Record<string, string>;
export type Band = 'low' | 'possible' | 'likely';

export type CheckResult = {
  score: number;
  band: Band;
  criteria: { ovulation: boolean; androgen: boolean; ovaries: boolean | null };
  metabolic: boolean;
  flags: ('pill' | 'young')[];
  date: string;
};

export function scoreCheck(answers: CheckAnswers): CheckResult {
  const pts: Record<Domain, number> = { ovulation: 0, androgen: 0, ovaries: 0, metabolic: 0 };
  const flags: CheckResult['flags'] = [];
  for (const q of QUESTIONS) {
    const o = q.options.find((x) => x.id === answers[q.id]);
    if (!o) continue;
    for (const [d, v] of Object.entries(o.pts)) pts[d as Domain] += v ?? 0;
    if (o.flag) flags.push(o.flag);
  }
  const criteria = {
    ovulation: pts.ovulation >= 3,
    androgen: pts.androgen >= 3,
    ovaries: answers.usg === 'never' || !answers.usg ? null : pts.ovaries > 0,
  };
  const met = [criteria.ovulation, criteria.androgen, criteria.ovaries === true].filter(Boolean).length;
  // Weighted 0-100: the three Rotterdam criteria carry the score; metabolic signs add a little.
  const raw =
    Math.min(pts.ovulation, 5) / 5 * 36 +
    Math.min(pts.androgen, 5) / 5 * 34 +
    (pts.ovaries > 0 ? 20 : 0) +
    Math.min(pts.metabolic, 6) / 6 * 10;
  let score = Math.round(raw);
  if (met >= 2) score = Math.max(score, 70);
  score = Math.min(100, score);
  if (met === 1) score = Math.max(score, 35);
  const band: Band = met >= 2 || score >= 60 ? 'likely' : score >= 30 ? 'possible' : 'low';
  return { score, band, criteria, metabolic: pts.metabolic >= 3, flags, date: new Date().toISOString() };
}

export const BAND_COPY: Record<Band, { en: [string, string]; hi: [string, string]; color: string }> = {
  low: {
    en: ['Low likelihood', 'Your answers don’t point strongly to PCOS. If periods or symptoms change, check again.'],
    hi: ['कम संभावना', 'आपके जवाब PCOS की ओर ज़्यादा इशारा नहीं करते। लक्षण बदलें तो दोबारा जाँचें।'],
    color: '#2A8F6A',
  },
  possible: {
    en: ['Possible PCOS', 'Some signs match. It’s worth a check-up with a gynaecologist and a few blood tests.'],
    hi: ['PCOS संभव', 'कुछ संकेत मिलते हैं। गाइनी से जाँच और कुछ ब्लड टेस्ट करवाना ठीक रहेगा।'],
    color: '#E8A23A',
  },
  likely: {
    en: ['PCOS likely', 'Your answers match the criteria doctors use. Please see a gynaecologist to confirm and rule out other causes.'],
    hi: ['PCOS की संभावना ज़्यादा', 'आपके जवाब डॉक्टरों के मानदंड से मिलते हैं। पुष्टि और दूसरे कारण जाँचने के लिए गाइनी से मिलें।'],
    color: '#E24B5A',
  },
};

/** Tests a gynaecologist typically uses to confirm PCOS and rule out look-alikes. */
export const TESTS: { en: string; hi: string; why: string; whyHi: string }[] = [
  { en: 'Pelvic ultrasound', hi: 'पेल्विक अल्ट्रासाउंड', why: 'Checks ovaries for many small follicles', whyHi: 'ओवरी में कई छोटे फॉलिकल देखता है' },
  { en: 'Total & free testosterone', hi: 'टोटल और फ्री टेस्टोस्टेरोन', why: 'Confirms androgen excess', whyHi: 'एंड्रोजन की अधिकता की पुष्टि' },
  { en: 'TSH (thyroid)', hi: 'TSH (थायरॉइड)', why: 'Thyroid problems cause similar symptoms', whyHi: 'थायरॉइड भी ऐसे लक्षण देता है' },
  { en: 'Prolactin', hi: 'प्रोलैक्टिन', why: 'High prolactin can stop periods', whyHi: 'ज़्यादा प्रोलैक्टिन पीरियड रोक सकता है' },
  { en: 'Fasting glucose / HbA1c', hi: 'फास्टिंग शुगर / HbA1c', why: 'Screens for insulin resistance and diabetes', whyHi: 'इंसुलिन रेज़िस्टेंस और डायबिटीज़ की जाँच' },
  { en: 'Lipid profile', hi: 'लिपिड प्रोफाइल', why: 'PCOS raises heart-health risk', whyHi: 'PCOS से दिल का जोखिम बढ़ता है' },
];
