import { periodStarts } from '@/src/features/cycle';
import { differenceInCalendarDays, parseISO, addDays, format } from 'date-fns';
import type { SymptomLog } from '@/src/types';

export type Insight = {
  id: string;
  title: string;
  titleHi: string;
  detail: string;
  detailHi: string;
  tone: 'good' | 'neutral' | 'watch';
};

function avgFor(logs: SymptomLog[], key: string): number | null {
  const vals = logs
    .map((l) => l.symptoms[key])
    .filter((v): v is number => typeof v === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function buildInsights(logs: SymptomLog[], lang: 'en' | 'hi' = 'en'): Insight[] {
  const sorted = [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate));
  const recent = sorted.slice(0, 7);
  const prior = sorted.slice(7, 14);
  const insights: Insight[] = [];

  if (recent.length < 3) {
    insights.push({
      id: 'baseline',
      title: 'Building your baseline',
      titleHi: 'बेसलाइन बन रही है',
      detail: 'Log 3+ days this week — insights unlock after a short streak.',
      detailHi: 'इस हफ़्ते 3+ दिन लॉग करें — फिर insights खुलेंगे।',
      tone: 'neutral',
    });
    return insights;
  }

  for (const key of ['acne', 'bloating', 'cravings', 'fatigue', 'mood_swing', 'hair_fall']) {
    const r = avgFor(recent, key);
    const p = avgFor(prior, key);
    if (r == null || p == null || p === 0) continue;
    const drop = ((p - r) / p) * 100;
    if (drop >= 20) {
      const label = key.replace('_', ' ');
      insights.push({
        id: `drop-${key}`,
        title: `${label} down ~${Math.round(drop)}%`,
        titleHi: `${label} लगभग ${Math.round(drop)}% कम`,
        detail: `vs last week — keep meals + micro-habits steady.`,
        detailHi: `पिछले हफ़्ते से तुलना — meals और habits जारी रखें।`,
        tone: 'good',
      });
    } else if (drop <= -20) {
      insights.push({
        id: `up-${key}`,
        title: `${key.replace('_', ' ')} trending up`,
        titleHi: `${key.replace('_', ' ')} बढ़ रहा है`,
        detail: 'Worth noting for your Doctor Visit Kit this month.',
        detailHi: 'Doctor Visit Kit में इस महीने ज़रूर लिखें।',
        tone: 'watch',
      });
    }
  }

  const moods = recent.map((l) => l.mood);
  const moodAvg = moods.reduce((a, b) => a + b, 0) / moods.length;
  if (moodAvg >= 3.8) {
    insights.push({
      id: 'mood-good',
      title: 'Mood steadier this week',
      titleHi: 'इस हफ़्ते मूड बेहतर',
      detail: `Average mood ${moodAvg.toFixed(1)}/5 across ${recent.length} logs.`,
      detailHi: `${recent.length} लॉग्स में औसत मूड ${moodAvg.toFixed(1)}/5।`,
      tone: 'good',
    });
  }

  if (!insights.length) {
    insights.push({
      id: 'steady',
      title: 'Holding steady',
      titleHi: 'स्थिर चल रहा है',
      detail: 'No big swings yet — consistency is the win. Check Progress Pulse Friday.',
      detailHi: 'बड़े बदलाव नहीं — नियमितता ही जीत है।',
      tone: 'neutral',
    });
  }

  return insights.slice(0, 4);
}

/**
 * Average of the last 3 cycles predicts the next start. When cycles vary by more
 * than a week (common in PCOS) the label gives a window, not a false exact date.
 */
export function predictNextPeriod(logs: SymptomLog[]): {
  nextDate: string | null;
  /** likely range to shade on a calendar */
  windowStart?: string | null;
  windowEnd?: string | null;
  avgLength: number | null;
  label: string;
  labelHi: string;
} {
  const starts = periodStarts(logs).map((d) => parseISO(d));
  if (starts.length < 2) {
    return {
      nextDate: null,
      avgLength: null,
      label: 'Log 2+ period starts for prediction',
      labelHi: 'प्रेडिक्शन के लिए 2+ पीरियड स्टार्ट लॉग करें',
    };
  }
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) gaps.push(differenceInCalendarDays(starts[i], starts[i - 1]));
  const recentGaps = gaps.filter((g) => g >= 15).slice(-3);
  if (!recentGaps.length) {
    return { nextDate: null, avgLength: null, label: 'Log a few more cycles for prediction', labelHi: 'प्रेडिक्शन के लिए कुछ और साइकल लॉग करें' };
  }
  const avg = Math.round(recentGaps.reduce((a, b) => a + b, 0) / recentGaps.length);
  const last = starts[starts.length - 1];
  const lo = Math.min(...recentGaps);
  const hi = Math.max(...recentGaps);
  if (hi - lo > 7) {
    const from = addDays(last, lo);
    const to = addDays(last, hi);
    return {
      nextDate: format(from, 'yyyy-MM-dd'),
      windowStart: format(from, 'yyyy-MM-dd'),
      windowEnd: format(to, 'yyyy-MM-dd'),
      avgLength: avg,
      label: `Cycles vary (${lo}–${hi} days): next period likely ${format(from, 'd MMM')} – ${format(to, 'd MMM')}`,
      labelHi: `साइकल बदलते हैं (${lo}–${hi} दिन): अगला पीरियड ${format(from, 'd MMM')} – ${format(to, 'd MMM')} के बीच`,
    };
  }
  const next = addDays(last, avg);
  if (differenceInCalendarDays(new Date(), next) > 3) {
    return {
      nextDate: null,
      avgLength: avg,
      label: `Later than your usual ${avg}-day cycle (expected ~${format(next, 'd MMM')})`,
      labelHi: `आपके सामान्य ${avg} दिन के साइकल से देर (अपेक्षित ~${format(next, 'd MMM')})`,
    };
  }
  return {
    nextDate: format(next, 'yyyy-MM-dd'),
    windowStart: format(addDays(next, -2), 'yyyy-MM-dd'),
    windowEnd: format(addDays(next, 2), 'yyyy-MM-dd'),
    avgLength: avg,
    label: `Next period ~${format(next, 'd MMM')} · avg ${avg}-day cycle`,
    labelHi: `अगला पीरियड ~${format(next, 'd MMM')} · औसत ${avg} दिन`,
  };
}

/** Lengths between logged period starts, oldest first. */
export function cycleLengths(logs: SymptomLog[]): { start: string; days: number }[] {
  const starts = periodStarts(logs);
  const out: { start: string; days: number }[] = [];
  for (let i = 1; i < starts.length; i++) {
    out.push({ start: starts[i], days: differenceInCalendarDays(parseISO(starts[i]), parseISO(starts[i - 1])) });
  }
  return out;
}
