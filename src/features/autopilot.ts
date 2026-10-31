import { localDate, nextSwap, planForDate, prefsFrom } from '@/src/features/mealPlan';
import { waterGoal } from '@/src/features/water';
import { isSubscriptionActive, useAppStore } from '@/src/store/useAppStore';

export type AutoChange = { key: string; text: string; textHi: string; href?: string; apply?: () => void };

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDate(d);
}

/** What Nari would change today, from her own logs. Pure: nothing is applied here. */
export function planAutopilot(): AutoChange[] {
  const s = useAppStore.getState();
  const today = localDate();
  const recent = s.symptomLogs.filter((l) => l.logDate >= daysAgo(1));
  const out: AutoChange[] = [];

  const bloated = recent.some((l) => (l.symptoms.bloating ?? 0) >= 2);
  if (bloated && !s.mealSwaps[`${today}|dinner`]) {
    const prefs = prefsFrom(s.profile);
    const plan = planForDate(prefs, today, s.profile?.name ?? 'naricare', s.mealSwaps);
    const used = Object.values(plan).flatMap((m) => (m ? [m.id] : []));
    const next = nextSwap('dinner', prefs, plan.dinner?.id, used);
    if (next) {
      out.push({
        key: 'dinner',
        text: `You logged bloating, so tonight’s dinner is now ${next.name}`,
        textHi: `आपने पेट फूलना लॉग किया, इसलिए आज का डिनर अब ${next.nameHi}`,
        href: '/diet',
        apply: () => useAppStore.getState().swapMeal(today, 'dinner', next.id),
      });
    }
  }

  const period = recent.some((l) => l.periodStatus === 'started' || l.periodStatus === 'flowing' || (l.symptoms.cramps ?? 0) >= 2);
  if (period) {
    out.push({
      key: 'gentle',
      text: 'Period or cramps logged: today’s workout is a gentle stretch',
      textHi: 'पीरियड/ऐंठन लॉग हुई: आज का वर्कआउट हल्का स्ट्रेच है',
      href: '/move',
    });
  }

  const last = s.workoutHistory[s.workoutHistory.length - 1];
  if (last && last.date < daysAgo(3) && s.moveSettings.minutes > 10) {
    out.push({
      key: 'restart',
      text: 'No workout for 3+ days: sessions are now 10 minutes to restart easily',
      textHi: '3+ दिन से वर्कआउट नहीं: आसान शुरुआत के लिए अब 10 मिनट के सेशन',
      href: '/move',
      apply: () => useAppStore.getState().setMoveSettings({ minutes: 10 }),
    });
  }

  const yWater = s.waterLog[daysAgo(1)];
  if (yWater !== undefined && yWater < waterGoal(s.profile?.weightKg) / 2) {
    out.push({
      key: 'water',
      text: `Only ${yWater} glasses yesterday: water reminders will tell you what’s left today`,
      textHi: `कल सिर्फ़ ${yWater} गिलास: आज रिमाइंडर बताएँगे कितना बाकी है`,
    });
  }

  const low = recent.find((l) => l.mood <= 2);
  if (low) {
    out.push({
      key: 'calm',
      text: 'Low mood logged: a 10-minute calming yoga is ready',
      textHi: 'मूड कम लॉग हुआ: 10 मिनट का शांत योग तैयार है',
      href: `/workout?focus=mobility&min=10&seed=${today}|calm&week=1&low=1`,
    });
  }
  return out;
}

/** Applies today's changes once, for Pro members, and records them in the agent log. */
export function runAutopilot(): number {
  const s = useAppStore.getState();
  const today = localDate();
  if (s.autopilotDate === today || !isSubscriptionActive(s.subscription)) return 0;
  const changes = planAutopilot();
  for (const c of changes) {
    c.apply?.();
    s.logAgent({ text: c.text, textHi: c.textHi, href: c.href });
  }
  s.setAutopilotDate(today);
  return changes.length;
}
