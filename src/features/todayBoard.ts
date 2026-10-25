import { COUNCIL, type CouncilMember } from '@/src/content/council';
import type { CyclePhase, LivingContext, Phenotype } from '@/src/types';

export type TodayAsk = {
  id: string;
  memberId: string;
  memberName: string;
  role: CouncilMember['role'];
  title: string;
  titleHi: string;
  detail: string;
  detailHi: string;
  href?: string;
};

function matchesWhen(
  when: CouncilMember['todayTemplates'][0]['when'] | undefined,
  phase: CyclePhase,
  phenotype: Phenotype,
  living: LivingContext,
) {
  if (!when) return true;
  if (when.phases && !when.phases.includes(phase)) return false;
  if (when.phenotypes && !when.phenotypes.includes(phenotype)) return false;
  if (when.livingContexts && !when.livingContexts.includes(living)) return false;
  return true;
}

/** Build today’s council board — one ask per member that fits context, max 6. */
export function buildTodayBoard(opts: {
  phase: CyclePhase;
  phenotype: Phenotype;
  livingContext: LivingContext;
  lang?: 'en' | 'hi';
}): TodayAsk[] {
  const { phase, phenotype, livingContext } = opts;
  const daySeed = new Date().getDate();
  const asks: TodayAsk[] = [];

  for (const member of COUNCIL) {
    const eligible = member.todayTemplates.filter((t) =>
      matchesWhen(t.when, phase, phenotype, livingContext),
    );
    const pool = eligible.length ? eligible : member.todayTemplates;
    if (!pool.length) continue;
    const pick = pool[(daySeed + member.id.length) % pool.length];
    asks.push({
      id: `${member.id}:${pick.id}`,
      memberId: member.id,
      memberName: member.name,
      role: member.role,
      title: pick.title,
      titleHi: pick.titleHi,
      detail: pick.detail,
      detailHi: pick.detailHi,
      href: pick.href,
    });
  }

  return asks.slice(0, 6);
}

export function allFeatureAsks() {
  return COUNCIL.flatMap((m) =>
    m.featureAsks.map((f) => ({
      ...f,
      memberId: m.id,
      memberName: m.name,
      role: m.role,
    })),
  );
}

export function councilAvgRating() {
  const sum = COUNCIL.reduce((a, m) => a + m.rating, 0);
  return Math.round((sum / COUNCIL.length) * 10) / 10;
}
