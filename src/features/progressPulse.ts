import type { SymptomLog } from '@/src/types';

export type ProgressPulse = {
  score: number;
  headline: string;
  detail: string;
  wins: string[];
};

function avgSeverity(logs: SymptomLog[]): number {
  if (!logs.length) return 0;
  const totals = logs.map((l) => {
    const vals = Object.values(l.symptoms);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return totals.reduce((a, b) => a + b, 0) / totals.length;
}

/** Closed-loop insight: recent vs prior week symptom load + mood. */
export function computeProgressPulse(
  logs: SymptomLog[],
  lang: 'en' | 'hi' = 'en',
): ProgressPulse {
  const sorted = [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate));
  const recent = sorted.slice(0, 7);
  const prior = sorted.slice(7, 14);
  const hi = lang === 'hi';

  if (recent.length < 3) {
    return {
      score: 40,
      headline: hi ? 'बेसलाइन बन रही है' : 'Building your baseline',
      detail: hi
        ? 'इस हफ़्ते 3+ दिन लॉग करें — Progress Pulse को सबूत के लिए छोटी स्ट्रीक चाहिए।'
        : 'Log 3+ days this week — Progress Pulse needs a short streak to prove what’s working.',
      wins: [hi ? 'Track खोलकर आज के लक्षण लॉग करें (2 मिनट)' : 'Open Track and log today’s symptoms (2 min)'],
    };
  }

  const recentAvg = avgSeverity(recent);
  const priorAvg = prior.length ? avgSeverity(prior) : recentAvg + 0.4;
  const moodRecent = recent.reduce((a, l) => a + l.mood, 0) / recent.length;
  const dropPct = Math.max(0, Math.round(((priorAvg - recentAvg) / Math.max(priorAvg, 0.5)) * 100));
  const score = Math.min(95, Math.round(45 + dropPct * 0.6 + (moodRecent - 2.5) * 8));

  const wins: string[] = [];
  if (dropPct >= 15)
    wins.push(
      hi
        ? `लक्षण भार पिछले हफ़्ते से ~${dropPct}% कम`
        : `Symptom load down ~${dropPct}% vs last week`,
    );
  if (moodRecent >= 3.5) wins.push(hi ? 'मूड ज़्यादा स्थिर' : 'Mood trending steadier');
  if (recent.filter((l) => l.periodStatus !== 'none').length)
    wins.push(hi ? 'साइकल दिन कैप्चर हुए' : 'Cycle days captured for prediction');
  if (!wins.length)
    wins.push(
      hi
        ? 'निरंतरता ही जीत है — रोज़ की 2 माइक्रो-आदतें रखें'
        : 'Consistency is the win — keep the 2 daily micro-habits',
    );

  return {
    score,
    headline: dropPct >= 15 ? (hi ? 'प्लान लग रहा है' : 'Plan is landing') : hi ? 'अभी कैलिब्रेट हो रहा' : 'Still calibrating',
    detail:
      dropPct >= 15
        ? hi
          ? 'लॉग दिखाते हैं कि जीवनशैली लूप चल रहा है। meals + माइक्रो-आदतें स्थिर रखें।'
          : 'Your logs show the lifestyle loop is moving. Keep meals + micro-habits steady this week.'
        : hi
          ? 'अभी बड़ा ड्रॉप नहीं — हफ़्ते 1–2 में सामान्य। प्रोटीन नाश्ता और नींद पर ध्यान दें।'
          : 'No big symptom drop yet — normal in weeks 1–2. Focus on protein breakfast and sleep.',
    wins,
  };
}
