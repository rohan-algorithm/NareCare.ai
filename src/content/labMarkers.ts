export type LabMarker = {
  key: string;
  name: string;
  nameHi: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  explainEn: string;
  explainHi: string;
  action: string;
};

export const LAB_MARKERS: LabMarker[] = [
  {
    key: 'lh_fsh_ratio',
    name: 'LH:FSH ratio',
    nameHi: 'LH:FSH अनुपात',
    unit: ':1',
    normalLow: 0.5,
    normalHigh: 2,
    explainEn:
      'Normal is usually below 2:1. A higher ratio often means ovaries are being over-stimulated — common in PCOS.',
    explainHi:
      'सामान्यतः 2:1 से कम होता है। ज़्यादा अनुपात अंडाशय के ज़्यादा उत्तेजित होने का संकेत हो सकता है — PCOS में आम।',
    action: 'Discuss cycle timing of the blood draw with your doctor; ratios vary by day.',
  },
  {
    key: 'total_testosterone',
    name: 'Total testosterone',
    nameHi: 'टोटल टेस्टोस्टेरोन',
    unit: 'ng/dL',
    normalLow: 15,
    normalHigh: 70,
    explainEn: 'Higher levels can link to acne, hair fall, and facial hair.',
    explainHi: 'ज़्यादा स्तर मुँहासे, बाल झड़ना और चेहरे के बाल से जुड़ा हो सकता है।',
    action: 'Ask about lifestyle + whether free testosterone / SHBG were also checked.',
  },
  {
    key: 'fasting_insulin',
    name: 'Fasting insulin',
    nameHi: 'फास्टिंग इंसुलिन',
    unit: 'µIU/mL',
    normalLow: 2,
    normalHigh: 15,
    explainEn: 'Elevated fasting insulin is a metabolic PCOS clue even when sugar looks “normal”.',
    explainHi: 'शुगर सामान्य होने पर भी ऊँचा फास्टिंग इंसुलिन मेटाबॉलिक PCOS का संकेत हो सकता है।',
    action: 'Pair with fasting glucose / HOMA-IR discussion; protein-first meals help.',
  },
  {
    key: 'hba1c',
    name: 'HbA1c',
    nameHi: 'HbA1c',
    unit: '%',
    normalLow: 4,
    normalHigh: 5.6,
    explainEn: 'Shows 3-month average sugar control.',
    explainHi: 'पिछले ~3 महीनों की औसत शुगर कंट्रोल दिखाता है।',
    action: 'Borderline values deserve diet review — not panic.',
  },
  {
    key: 'tsh',
    name: 'TSH',
    nameHi: 'TSH',
    unit: 'mIU/L',
    normalLow: 0.4,
    normalHigh: 4.0,
    explainEn: 'Thyroid issues can mimic or worsen PCOS symptoms.',
    explainHi: 'थायरॉइड समस्याएँ PCOS जैसे लक्षण बढ़ा सकती हैं।',
    action: 'If symptomatic, ask about free T4 and antibodies too.',
  },
  {
    key: 'vit_d',
    name: 'Vitamin D',
    nameHi: 'विटामिन D',
    unit: 'ng/mL',
    normalLow: 30,
    normalHigh: 100,
    explainEn: 'Low vitamin D is very common in Indian women and can affect mood and hormones.',
    explainHi: 'भारतीय महिलाओं में विटामिन D कमी आम है — मूड और हॉर्मोन दोनों पर असर।',
    action: 'Supplementation only under clinician guidance.',
  },
];

export function statusFor(value: number, marker: LabMarker): 'Normal' | 'Borderline' | 'High' | 'Low' {
  if (value < marker.normalLow * 0.9) return 'Low';
  if (value > marker.normalHigh * 1.1) return 'High';
  if (value < marker.normalLow || value > marker.normalHigh) return 'Borderline';
  return 'Normal';
}
