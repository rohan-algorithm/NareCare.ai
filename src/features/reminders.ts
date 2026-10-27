import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getExercise, todaysExercises } from '@/src/content/exercises';
import { getCycleDay, getCyclePhase } from '@/src/features/cycle';
import { predictNextPeriod } from '@/src/features/insights';
import { localDate, planForDate, prefsFrom } from '@/src/features/mealPlan';
import type { ReminderPref } from '@/src/features/reminderDefaults';
import { isSubscriptionActive, useAppStore } from '@/src/store/useAppStore';

export type { ReminderKey, ReminderPref } from '@/src/features/reminderDefaults';
export { DEFAULT_REMINDERS } from '@/src/features/reminderDefaults';

const HORIZON_DAYS = 7;

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export async function getNotifications() {
  if (isExpoGo()) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

async function ensureChannels(N: typeof import('expo-notifications')) {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync('naricare-daily', {
    name: 'Daily plan',
    importance: N.AndroidImportance.DEFAULT,
  });
  await N.setNotificationChannelAsync('naricare-move', {
    name: 'Workout alarm',
    importance: N.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 200, 300],
  });
  await N.setNotificationChannelAsync('naricare-streak', {
    name: 'Streak saver',
    importance: N.AndroidImportance.HIGH,
  });
}

/** Channels must exist before the Android 13+ prompt can appear. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const N = await getNotifications();
  if (!N) return false;
  try {
    await ensureChannels(N);
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    return (await N.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

type Nudge = { at: Date; title: string; body: string; href: string; channel: string };

function at(date: string, hour: number, minute: number): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + n));
}

function rotate<T>(list: T[], date: string): T {
  const n = Number(date.replaceAll('-', ''));
  return list[n % list.length];
}

/** Builds a week of personal nudges from current state; tasks already done today are skipped. */
function buildNudges(): Nudge[] {
  const s = useAppStore.getState();
  const p = s.profile;
  const hi = p?.language === 'hi';
  const name = p?.name?.split(' ')[0] ?? '';
  const today = localDate();
  const now = Date.now();
  const prefs = prefsFrom(p);
  const seed = p?.name ?? 'naricare';
  const cycleDay = getCycleDay(s.symptomLogs);
  const loggedToday = s.symptomLogs.some((l) => l.logDate === today);
  const movedToday = s.exerciseLogs.some((e) => e.completed && e.date.slice(0, 10) === today);
  const ateToday = Object.entries(s.mealMarks).some(([k, v]) => k.startsWith(`${today}|`) && v === 'ate');
  const streak = s.streakDays;
  const out: Nudge[] = [];
  const enabled = (key: string) => s.reminders.find((r) => r.key === key && r.enabled);

  for (let d = 0; d < HORIZON_DAYS; d++) {
    const date = addDays(today, d);
    const isToday = d === 0;
    const plan = planForDate(prefs, date, seed, s.mealSwaps);
    const dayCycle = cycleDay ? cycleDay + d : null;
    const phase = getCyclePhase(dayCycle);
    const [y, m, dd] = date.split('-').map(Number);
    const routine = todaysExercises(phase, new Date(y, m - 1, dd).getDay())[0] ?? getExercise('calm_breathe');

    for (const r of s.reminders.filter((x) => x.enabled)) {
      if (isToday && s.scheduleDone[r.key]) continue;
      const when = at(date, r.hour, r.minute);
      if (r.kind === 'meal') {
        if (isToday && ateToday) continue;
        const b = plan.breakfast;
        out.push({
          at: when,
          title: hi ? `${name}, आज का नाश्ता: ${b?.nameHi ?? 'प्रोटीन नाश्ता'}` : `${name ? `${name}, ` : ''}breakfast today: ${b?.name ?? 'protein first'}`,
          body: hi ? `${b?.benefitHi ?? ''} पूरा प्लान देखें →` : `${b?.benefit ?? ''} Tap for today’s plate.`,
          href: '/diet',
          channel: 'naricare-daily',
        });
      } else if (r.kind === 'water') {
        if (isToday && s.waterGlasses >= 8) continue;
        out.push({
          at: when,
          title: rotate(hi ? ['💧 2 गिलास पानी, अभी', '💧 पानी ब्रेक', '💧 प्यास से पहले पानी'] : ['💧 Two glasses of water, now', '💧 Water break', '💧 Sip before you’re thirsty'], date),
          body: hi ? 'हाइड्रेशन से क्रेविंग और थकान कम होती है।' : 'Hydration takes the edge off cravings and the afternoon slump.',
          href: '/home',
          channel: 'naricare-daily',
        });
      } else if (r.kind === 'log') {
        if (isToday && loggedToday) continue;
        out.push({
          at: when,
          title: streak > 1 ? (hi ? `🔥 ${streak} दिन की स्ट्रीक, 2-मिनट लॉग` : `🔥 ${streak}-day streak · 2-minute log`) : hi ? '2 मिनट: आज कैसा लगा?' : '2 minutes: how do you feel today?',
          body: hi ? 'यही लॉग हर हफ्ते सबूत बनता है कि प्लान काम कर रहा है।' : 'These logs become your weekly proof that the plan is working.',
          href: '/track',
          channel: 'naricare-daily',
        });
      } else if (r.kind === 'move') {
        if (isToday && movedToday) continue;
        out.push({
          at: when,
          title: hi ? `🧘 ${routine?.nameHi ?? 'आज का मूव'} · ${routine?.durationMin ?? 15} मिनट` : `🧘 ${routine?.name ?? 'Today’s move'} · ${routine?.durationMin ?? 15} min`,
          body: rotate(
            hi
              ? ['टाइमर और आवाज़ तैयार है। बस शुरू करें।', 'जिम नहीं, सिर्फ़ चटाई। अभी 15 मिनट।', 'छोटा सेशन > छूटा सेशन।']
              : ['Timer and voice coach are ready. Just press start.', 'No gym, just a mat. 15 minutes, now.', 'A short session beats a skipped one.'],
            date,
          ),
          href: '/move?start=1',
          channel: 'naricare-move',
        });
      } else if (r.kind === 'ritual') {
        out.push({
          at: when,
          title: hi ? '🍵 शाम की रस्म' : '🍵 Evening ritual',
          body: hi ? 'पुदीना चाय + मुट्ठी भर भुना चना: शाम की भूख शांत।' : 'Spearmint tea + a handful of roasted chana settles 6 pm hunger.',
          href: '/meds',
          channel: 'naricare-daily',
        });
      } else if (r.kind === 'sleep') {
        out.push({
          at: when,
          title: hi ? '🌙 सोने की तैयारी' : '🌙 Wind down',
          body: hi ? 'स्क्रीन बंद, 4 मिनट दीवार पर पैर। नींद हॉर्मोन संभालती है।' : 'Screens off, 4 minutes legs-up-the-wall. Sleep steadies your hormones.',
          href: '/flare',
          channel: 'naricare-daily',
        });
      }
    }

    if (enabled('symptom_log') && !(isToday && loggedToday) && streak > 0) {
      out.push({
        at: at(date, 21, 15),
        title: hi ? `⚠️ ${streak} दिन की स्ट्रीक आज रात खत्म होगी` : `⚠️ Your ${streak}-day streak ends tonight`,
        body: hi ? 'सोने से पहले 2-मिनट लॉग करके बचाएँ।' : 'Save it with a 2-minute log before bed.',
        href: '/track',
        channel: 'naricare-streak',
      });
    }
    if (new Date(y, m - 1, dd).getDay() === 0) {
      out.push({
        at: at(date, 10, 0),
        title: hi ? '📈 आपका साप्ताहिक सबूत तैयार है' : '📈 Your weekly proof is ready',
        body: hi ? 'देखें इस हफ्ते क्या काम किया, और अगले हफ्ते का एक लक्ष्य।' : 'See what worked this week, plus one goal for next week.',
        href: '/weekly',
        channel: 'naricare-daily',
      });
    }
  }

  const next = predictNextPeriod(s.symptomLogs).nextDate;
  if (next) {
    const eve = addDays(next.slice(0, 10), -1);
    out.push({
      at: at(eve, 9, 0),
      title: hi ? '🌸 पीरियड कल आ सकता है' : '🌸 Your period may start tomorrow',
      body: hi ? 'आने पर लॉग करें; इन दिनों के लिए हल्का योग तैयार है।' : 'Log it when it comes; a gentle routine is ready for those days.',
      href: '/track',
      channel: 'naricare-daily',
    });
  }

  const sub = s.subscription;
  if (sub.status === 'trial' && sub.trialEndsAt) {
    const end = new Date(sub.trialEndsAt);
    const remind = new Date(end.getTime() - 24 * 3600 * 1000);
    out.push({
      at: remind,
      title: hi ? 'आपका फ्री ट्रायल कल खत्म होगा' : 'Your free trial ends tomorrow',
      body: hi
        ? 'प्लान जारी रखना है तो कुछ न करें। नहीं चाहिए तो आज Play Store में रद्द करें, कोई चार्ज नहीं।'
        : 'To keep your plan, do nothing. Not for you? Cancel in Play Store today and you won’t be charged.',
      href: '/home',
      channel: 'naricare-daily',
    });
  }

  for (const days of [2, 4]) {
    out.push({
      at: at(addDays(today, days), 19, 30),
      title: hi ? `${name}, आपका प्लान इंतज़ार कर रहा है` : `${name ? `${name}, ` : ''}your plan is waiting`,
      body: hi ? 'कोई बात नहीं जो छूट गया। आज बस एक छोटा कदम।' : 'Missed days don’t undo progress. Just one small step today.',
      href: '/home',
      channel: 'naricare-daily',
    });
  }

  return out.filter((n) => n.at.getTime() > now + 60_000).sort((a, b) => a.at.getTime() - b.at.getTime());
}

let rebuilding: Promise<number> | null = null;

/** Replaces all scheduled notifications with a fresh, personalised week. */
export async function rebuildNudges(): Promise<number> {
  if (rebuilding) return rebuilding;
  rebuilding = (async () => {
    const N = await getNotifications();
    if (!N) return 0;
    const perm = await N.getPermissionsAsync();
    if (!perm.granted) return 0;
    await ensureChannels(N);
    await N.cancelAllScheduledNotificationsAsync();
    if (!isSubscriptionActive(useAppStore.getState().subscription)) return 0;
    const nudges = buildNudges().slice(0, 60);
    for (const n of nudges) {
      await N.scheduleNotificationAsync({
        content: { title: n.title, body: n.body, sound: true, data: { url: n.href } },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: n.at, channelId: n.channel },
      });
    }
    return nudges.length;
  })();
  try {
    return await rebuilding;
  } finally {
    rebuilding = null;
  }
}

export async function scheduleReminders(prefs: ReminderPref[]): Promise<number> {
  const N = await getNotifications();
  if (!N) {
    throw new Error('Reminders need the installed app (not Expo Go).');
  }
  if (!(await ensureNotificationPermission())) return 0;
  useAppStore.getState().setReminders(prefs);
  return rebuildNudges();
}

export async function sendTestReminder(): Promise<void> {
  const N = await getNotifications();
  if (!N) throw new Error('Test reminders need the installed app (not Expo Go).');
  if (!(await ensureNotificationPermission())) throw new Error('Permission denied');
  await N.scheduleNotificationAsync({
    content: {
      title: '🧘 Test: your workout alarm',
      body: 'Tap to open Move with the timer ready.',
      data: { url: '/move?start=1' },
    },
    trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: 'naricare-move' },
  });
}
