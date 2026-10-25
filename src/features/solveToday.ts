import { problemsForProfile, type PatientProblem } from '@/src/content/patientProblems';
import type { Phenotype, SymptomLog } from '@/src/types';

/** Pick the top problem to solve today from phenotype + recent logs. */
export function primaryProblemToday(
  phenotype: Phenotype,
  logs: SymptomLog[],
): PatientProblem {
  const ranked = problemsForProfile(phenotype);
  const recent = [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate))[0];
  if (!recent) return ranked[0];

  if (recent.energyCrash) return ranked.find((p) => p.id === 'low_energy') ?? ranked[0];
  const sym = recent.symptoms;
  if ((sym.cravings ?? 0) >= 3) return ranked.find((p) => p.id === 'cravings') ?? ranked[0];
  if ((sym.bloating ?? 0) >= 3) return ranked.find((p) => p.id === 'bloating') ?? ranked[0];
  if ((sym.acne ?? 0) >= 3 || (sym.hair_fall ?? 0) >= 3)
    return ranked.find((p) => p.id === 'acne_hair') ?? ranked[0];
  if ((sym.mood_swing ?? 0) >= 3 || recent.mood <= 2)
    return ranked.find((p) => p.id === 'mood') ?? ranked[0];
  if ((sym.fatigue ?? 0) >= 3) return ranked.find((p) => p.id === 'low_energy') ?? ranked[0];
  if (recent.periodStatus !== 'none')
    return ranked.find((p) => p.id === 'irregular_cycle') ?? ranked[0];
  return ranked[0];
}
