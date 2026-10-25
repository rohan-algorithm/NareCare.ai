import { LAB_MARKERS, statusFor, type LabMarker } from '@/src/content/labMarkers';
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

  const summaryEn = `AI lab read: ${parts.join('; ')}. Pattern leans ${phenotypeHint}. This is not a diagnosis — bring Doctor Visit Kit to your clinician.`;
  const summaryHi = `AI लैब रीड: कुछ मार्कर ध्यान देने योग्य हो सकते हैं। पैटर्न ~${phenotypeHint} लगता है। यह निदान नहीं है — डॉक्टर से ज़रूर चर्चा करें।`;

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
