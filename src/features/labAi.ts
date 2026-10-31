import { LAB_MARKERS, statusFor } from '@/src/content/labMarkers';
import type { Phenotype } from '@/src/types';

export type LabFinding = {
  key: string;
  name: string;
  value: number;
  unit: string;
  status: 'Normal' | 'Borderline' | 'High' | 'Low';
  explainEn: string;
  explainHi: string;
  action: string;
};

export type LabAnalysis = {
  id: string;
  createdAt: string;
  findings: LabFinding[];
  summaryEn: string;
  summaryHi: string;
  phenotypeHint: Phenotype;
  doctorQuestions: string[];
};

export function analyzeLabValues(
  values: Record<string, number>,
  phenotype?: Phenotype
): LabAnalysis {
  const findings: LabFinding[] = LAB_MARKERS.filter((m) => values[m.key] != null).map((m) => {
    const value = values[m.key];
    return {
      key: m.key,
      name: m.name,
      value,
      unit: m.unit,
      status: statusFor(value, m),
      explainEn: m.explainEn,
      explainHi: m.explainHi,
      action: m.action,
    };
  });

  const highs = findings.filter((f) => f.status === 'High' || f.status === 'Borderline');
  const lows = findings.filter((f) => f.status === 'Low');

  let phenotypeHint: Phenotype = phenotype ?? 'mixed';
  if (values.fasting_insulin > 15 || values.hba1c >= 5.7) phenotypeHint = 'metabolic';
  else if (values.total_testosterone > 70 || values.lh_fsh_ratio > 2) phenotypeHint = 'androgenic';

  const parts: string[] = [];
  if (highs.length) parts.push(`${highs.length} marker(s) high/borderline (${highs.map((h) => h.name).join(', ')})`);
  if (lows.length) parts.push(`${lows.length} low (${lows.map((l) => l.name).join(', ')})`);
  if (!parts.length) parts.push('Most markers in typical range — keep lifestyle steady and recheck as advised');

  const focusEn = { metabolic: 'insulin and blood sugar', androgenic: 'androgens (skin, hair, cycle)', inflammatory: 'inflammation and sleep', mixed: 'a balanced routine' }[phenotypeHint];
  const focusHi = { metabolic: 'इंसुलिन और ब्लड शुगर', androgenic: 'एंड्रोजन (त्वचा, बाल, साइकल)', inflammatory: 'सूजन और नींद', mixed: 'संतुलित रूटीन' }[phenotypeHint];
  const flagged = highs.length + lows.length;
  const summaryEn = `${parts.join('; ')}. Suggested focus for your plan: ${focusEn}. This is not a diagnosis; take these numbers to your doctor.`;
  const summaryHi = flagged
    ? `${flagged} मार्कर ध्यान देने लायक हैं। आपके प्लान का सुझाया फोकस: ${focusHi}। यह निदान नहीं है; ये नंबर डॉक्टर को दिखाएँ।`
    : `ज़्यादातर मार्कर सामान्य दायरे में हैं। सुझाया फोकस: ${focusHi}। यह निदान नहीं है; डॉक्टर से चर्चा करें।`;

  const doctorQuestions = [
    'Do I need HOMA-IR / free testosterone / SHBG with this panel?',
    'How often should I repeat fasting insulin and Vitamin D?',
    'Are my LH:FSH values timed correctly in my cycle?',
    'Given these numbers, should lifestyle changes come before medication?',
  ];

  return {
    id: `lab-${Date.now()}`,
    createdAt: new Date().toISOString(),
    findings,
    summaryEn,
    summaryHi,
    phenotypeHint,
    doctorQuestions,
  };
}

export const SAMPLE_LAB_VALUES: Record<string, number> = {
  lh_fsh_ratio: 2.5,
  total_testosterone: 58,
  fasting_insulin: 18,
  hba1c: 5.4,
  tsh: 2.1,
  vit_d: 18,
};
