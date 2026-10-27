import { getCycleDay, getCyclePhase } from '@/src/features/cycle';
import { computeProgressPulse } from '@/src/features/progressPulse';
import type { LabAnalysis } from '@/src/features/labAi';
import type { SymptomLog } from '@/src/types';

export type AiContext = {
  cycleDay: number | null;
  phase: string;
  labs: { name: string; value: number; unit: string; status: string }[];
  labDate: string | null;
  logsLast14: number;
  avgMood: number | null;
  topSymptoms: string[];
  movesLast7: number;
  mealsFollowed: number;
  streakDays: number;
  pulse: { score: number; headline: string; wins: string[] };
  body: { startKg?: number; latestKg?: number; latestWaistCm?: number; entries: number };
  skin: { facialHair: number; hairFall: number; acne: number; month: string } | null;
  mind: { phq2: number; gad2: number; date: string } | null;
  ttc: { on: boolean; triedMonths: string | null; lastLhPositive: string | null };
  goals: string[];
  lessonsDone: number;
  avgPlateScore7d: number | null;
};

type Source = {
  symptomLogs: SymptomLog[];
  labAnalyses: LabAnalysis[];
  exerciseLogs: { date: string; completed: boolean }[];
  mealMarks: Record<string, string>;
  streakDays: number;
  bodyLogs?: { date: string; weightKg?: number; waistCm?: number }[];
  skinLogs?: { date: string; facialHair: number; hairFall: number; acne: number }[];
  mindChecks?: { date: string; phq2: number; gad2: number }[];
  ttc?: { on: boolean; since: string | null; lhTests: { date: string; result: string }[] };
  profile?: { goals?: string[] } | null;
  lessonsDone?: string[];
  plateScans?: { date: string; score: number }[];
};

export function buildAiContext(s: Source): AiContext {
  const cycleDay = getCycleDay(s.symptomLogs);
  const since = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };
  const recent = s.symptomLogs.filter((l) => l.logDate >= since(14));
  const totals: Record<string, number> = {};
  for (const l of recent) for (const [k, v] of Object.entries(l.symptoms)) totals[k] = (totals[k] ?? 0) + v;
  const lab = s.labAnalyses[0];
  const pulse = computeProgressPulse(s.symptomLogs);
  return {
    cycleDay,
    phase: getCyclePhase(cycleDay),
    labs: lab ? lab.findings.map((f) => ({ name: f.name, value: f.value, unit: f.unit, status: f.status })) : [],
    labDate: lab?.createdAt.slice(0, 10) ?? null,
    logsLast14: recent.length,
    avgMood: recent.length ? Math.round((recent.reduce((a, l) => a + l.mood, 0) / recent.length) * 10) / 10 : null,
    topSymptoms: Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k.replaceAll('_', ' ')),
    movesLast7: s.exerciseLogs.filter((e) => e.completed && e.date.slice(0, 10) >= since(7)).length,
    mealsFollowed: Object.values(s.mealMarks).filter((m) => m === 'ate' || m === 'swapped').length,
    streakDays: s.streakDays,
    pulse: { score: pulse.score, headline: pulse.headline, wins: pulse.wins },
    body: (() => {
      const w = (s.bodyLogs ?? []).filter((b) => b.weightKg);
      const c = (s.bodyLogs ?? []).filter((b) => b.waistCm);
      return { startKg: w[0]?.weightKg, latestKg: w[w.length - 1]?.weightKg, latestWaistCm: c[c.length - 1]?.waistCm, entries: (s.bodyLogs ?? []).length };
    })(),
    skin: (() => {
      const l = (s.skinLogs ?? [])[(s.skinLogs ?? []).length - 1];
      return l ? { facialHair: l.facialHair, hairFall: l.hairFall, acne: l.acne, month: l.date } : null;
    })(),
    mind: (() => {
      const m = (s.mindChecks ?? [])[(s.mindChecks ?? []).length - 1];
      return m ? { phq2: m.phq2, gad2: m.gad2, date: m.date } : null;
    })(),
    ttc: {
      on: !!s.ttc?.on,
      triedMonths: s.ttc?.since ?? null,
      lastLhPositive: [...(s.ttc?.lhTests ?? [])].reverse().find((t) => t.result === 'pos')?.date ?? null,
    },
    goals: s.profile?.goals ?? [],
    lessonsDone: (s.lessonsDone ?? []).length,
    avgPlateScore7d: (() => {
      const recent = (s.plateScans ?? []).filter((p) => p.date >= since(7));
      return recent.length ? Math.round((recent.reduce((a, p) => a + p.score, 0) / recent.length) * 10) / 10 : null;
    })(),
  };
}

const CRISIS = /suicid|kill myself|end (my|it all)|self.?harm|want to die|marna chahti|jeena nahi|खुद को नुकसान|मरना चाहती|आत्महत्या/i;
const EMERGENCY = /(soak|soaking).{0,20}pad|pad every hour|faint|passed out|unbearable pain|severe pain|chest pain|bleeding.{0,20}pregnan|pregnan.{0,20}bleeding|बेहोश|बहुत तेज़ दर्द|बहुत ज़्यादा खून/i;
const DOSING = /\b(dose|dosage|how many mg|kitni goli|kitna mg|how much (metformin|inositol|myo|letrozole|spironolactone|pill)|mg of)\b|खुराक|कितनी गोली/i;

/** Returns a fixed reply when the message must not go to the model. */
export function safetyReply(text: string, hi: boolean): string | null {
  if (CRISIS.test(text)) {
    return hi
      ? 'आप अकेली नहीं हैं, और आपकी बात मायने रखती है। अभी किसी से बात करें: Tele-MANAS 14416 (24x7, मुफ़्त, हिंदी में)। तुरंत खतरा हो तो 112 पर कॉल करें। किसी भरोसेमंद व्यक्ति को अभी बताएँ।'
      : 'You are not alone, and what you are feeling matters. Please talk to someone now: Tele-MANAS 14416 (24x7, free, Hindi & English). If you are in immediate danger, call 112. Tell someone you trust right now.';
  }
  if (EMERGENCY.test(text)) {
    return hi
      ? 'यह जल्दी डॉक्टर को दिखाने वाली बात लगती है। बहुत ज़्यादा खून (हर घंटे पैड भीगना), बेहोशी, या तेज़ दर्द में आज ही डॉक्टर या इमरजेंसी में जाएँ, या 112 पर कॉल करें। ऐप इसका इलाज नहीं कर सकता।'
      : 'This sounds like something a doctor should see quickly. For very heavy bleeding (soaking a pad every hour), fainting, or severe pain, go to a doctor or emergency today, or call 112. The app can’t treat this.';
  }
  if (DOSING.test(text)) {
    return hi
      ? 'दवा या सप्लीमेंट की खुराक मैं नहीं बता सकती; यह आपकी सेहत, लैब और दूसरी दवाओं पर निर्भर करती है। अपने डॉक्टर या फार्मासिस्ट से पूछें। चाहें तो मैं डॉक्टर के लिए सवाल तैयार कर दूँ।'
      : 'I can’t give medicine or supplement doses; the right dose depends on your health, labs and other medicines. Please ask your doctor or pharmacist. I can help you prepare questions for that visit.';
  }
  return null;
}

/** Personal readout when the user asks about labs and we have their numbers. */
export function localLabReply(ctx: AiContext, hi: boolean): string | null {
  if (!ctx.labs.length) return null;
  const flagged = ctx.labs.filter((l) => l.status !== 'Normal');
  const lines = (flagged.length ? flagged : ctx.labs)
    .map((l) => `• ${l.name}: ${l.value} ${l.unit} (${l.status})`)
    .join('\n');
  return hi
    ? `आपकी ${ctx.labDate ?? 'हाल की'} रिपोर्ट से:\n${lines}\n\n${flagged.length ? 'ये मार्कर आपके प्लान का फोकस तय करते हैं। पूरी समझ लैब डिकोडर में है।' : 'ज़्यादातर मार्कर सामान्य हैं, रूटीन जारी रखें।'} डॉक्टर से ज़रूर चर्चा करें।`
    : `From your ${ctx.labDate ?? 'latest'} report:\n${lines}\n\n${flagged.length ? 'These markers set the focus of your plan. The full explanation is in Lab decoder.' : 'Most markers are in range, so keep your routine steady.'} Please discuss with your doctor.`;
}

export const WEEKLY_PROMPT =
  'Write my weekly PCOS summary from my data: 1) what went well, 2) what to change, 3) one small goal for next week. Use my actual numbers. Max 120 words.';
export const WEEKLY_PROMPT_HI =
  'मेरे डेटा से मेरा साप्ताहिक PCOS सारांश लिखें: 1) क्या अच्छा रहा, 2) क्या बदलें, 3) अगले हफ्ते का एक छोटा लक्ष्य। मेरे असली नंबर इस्तेमाल करें। 120 शब्द तक।';

export function localWeeklySummary(ctx: AiContext, hi: boolean): string {
  const good: string[] = [];
  const change: string[] = [];
  if (ctx.logsLast14 >= 5) good.push(hi ? `${ctx.logsLast14} दिन लॉग किए` : `you logged ${ctx.logsLast14} days`);
  else change.push(hi ? 'हफ्ते में कम से कम 5 दिन लॉग करें' : 'log at least 5 days a week so trends show up');
  if (ctx.movesLast7 >= 3) good.push(hi ? `${ctx.movesLast7} मूव सेशन` : `${ctx.movesLast7} movement sessions`);
  else change.push(hi ? 'हफ्ते में 3 बार 15 मिनट मूव' : 'aim for three 15-minute moves');
  if (ctx.mealsFollowed >= 5) good.push(hi ? `${ctx.mealsFollowed} भोजन प्लान के अनुसार` : `${ctx.mealsFollowed} meals on plan`);
  if (ctx.topSymptoms.length) change.push(hi ? `सबसे ज़्यादा: ${ctx.topSymptoms.join(', ')}; इन पर नज़र रखें` : `watch your top symptoms: ${ctx.topSymptoms.join(', ')}`);
  const goal =
    ctx.movesLast7 < 3
      ? hi ? 'अगले हफ्ते: 3 शाम को खाने के बाद 15 मिनट वॉक।' : 'Next week: a 15-minute walk after dinner, 3 evenings.'
      : ctx.logsLast14 < 5
        ? hi ? 'अगले हफ्ते: रोज़ 2-मिनट लॉग।' : 'Next week: a 2-minute log every day.'
        : hi ? 'अगले हफ्ते: हर नाश्ते में प्रोटीन।' : 'Next week: protein in every breakfast.';
  return hi
    ? `अच्छा रहा: ${good.join(', ') || 'आपने शुरुआत की, यही सबसे मुश्किल है'}।\nबदलें: ${change.join('; ') || 'यही रफ़्तार रखें'}।\n${goal}`
    : `Went well: ${good.join(', ') || 'you started, which is the hardest part'}.\nTo change: ${change.join('; ') || 'keep this pace'}.\n${goal}`;
}
