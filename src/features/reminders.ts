import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { buildWorkout } from '@/src/features/workoutEngine';
import { boostFor, planToday } from '@/src/features/todayWorkout';
import { nextLesson, programWeek } from '@/src/content/academy';
import { predictNextPeriod } from '@/src/features/insights';
import { localDate, planForDate, prefsFrom } from '@/src/features/mealPlan';
import { formatAlarmTime, type ReminderPref } from '@/src/features/reminderDefaults';
import { expectedBy, litres, waterGoal } from '@/src/features/water';
import { logStreak } from '@/src/features/streak';
import { useAppStore } from '@/src/store/useAppStore';

export type { ReminderKey, ReminderPref } from '@/src/features/reminderDefaults';
export { DEFAULT_REMINDERS } from '@/src/features/reminderDefaults';

const HORIZON_DAYS = 7;

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export async function getNotifications() {
  if (isExpoGo() || Platform.OS === 'web') return null;
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
  await N.setNotificationChannelAsync('naricare-water', {
    name: 'Water',
    importance: N.AndroidImportance.DEFAULT,
  });
  await N.setNotificationChannelAsync('naricare-meals', {
    name: 'Meals',
    importance: N.AndroidImportance.HIGH,
  });
}

/** Buttons on water and meal notifications; handled in useNudgeEngine. */
async function ensureCategories(N: typeof import('expo-notifications')) {
  await N.setNotificationCategoryAsync('water', [
    { identifier: 'water1', buttonTitle: '+1 glass 💧', options: { opensAppToForeground: true } },
    { identifier: 'water2', buttonTitle: '+2 glasses', options: { opensAppToForeground: true } },
  ]);
  await N.setNotificationCategoryAsync('meal', [
    { identifier: 'ate', buttonTitle: 'Ate it ✓', options: { opensAppToForeground: true } },
    { identifier: 'swap', buttonTitle: 'Swap', options: { opensAppToForeground: true } },
  ]);
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

type Nudge = {
  at: Date;
  title: string;
  body: string;
  href: string;
  channel: string;
  category?: 'water' | 'meal';
  extra?: Record<string, string>;
};

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
  const loggedToday = s.symptomLogs.some((l) => l.logDate === today);
  const movedToday = s.exerciseLogs.some((e) => e.completed && e.date.slice(0, 10) === today);
  const goal = waterGoal(p?.weightKg);
  const streak = logStreak(s.symptomLogs).current;
  const out: Nudge[] = [];
  const enabled = (key: string) => s.reminders.find((r) => r.key === key && r.enabled);

  for (let d = 0; d < HORIZON_DAYS; d++) {
    const date = addDays(today, d);
    const isToday = d === 0;
    const plan = planForDate(prefs, date, seed, s.mealSwaps);
    const [y, m, dd] = date.split('-').map(Number);
    const session = planToday(s.moveSettings, s.activeProgram, isToday ? s.symptomLogs : []);
    const daySeed = isToday ? session.seed : `${session.seed}|${date}`;
    const routine = buildWorkout(session.focus, { ...s.moveSettings, minutes: session.minutes, lowImpact: session.lowImpact, periodSafe: session.gentle }, daySeed, boostFor(session.week));

    for (const r of s.reminders.filter((x) => x.enabled)) {
      if (isToday && s.scheduleDone[r.key]) continue;
      const when = at(date, r.hour, r.minute);
      if (r.kind === 'meal') {
        const slot = r.slot ?? 'breakfast';
        if (isToday && s.mealMarks[`${date}|${slot}`]) continue;
        const m = plan[slot];
        if (!m) continue;
        out.push({
          at: when,
          title: hi ? `🍽 ${r.titleHi}: ${m.nameHi}` : `🍽 ${r.title}: ${m.name}`,
          body: hi ? `${m.benefitHi} रेसिपी और बदलाव के लिए टैप करें।` : `${m.benefit} Tap for the recipe or a swap.`,
          href: '/diet',
          channel: 'naricare-meals',
          category: 'meal',
          extra: { date, slot },
        });
      } else if (r.kind === 'water') {
        const every = r.everyHours ?? 2;
        for (let h = r.hour; h <= (r.untilHour ?? r.hour); h += every) {
          const aim = Math.max(1, expectedBy(goal, h + 1));
          const had = isToday ? s.waterGlasses : 0;
          if (isToday && had >= aim) continue;
          const left = goal - had;
          out.push({
            at: at(date, h, r.minute),
            title: isToday
              ? hi
                ? `💧 ${had}/${goal} गिलास · ${litres(left)} बाकी`
                : `💧 ${had} of ${goal} glasses · ${litres(left)} to go`
              : hi
                ? `💧 पानी का समय · लक्ष्य ${goal} गिलास`
                : `💧 Water time · goal ${goal} glasses`,
            body: hi
              ? `${formatAlarmTime(h + 1, 0)} तक ${aim} गिलास का लक्ष्य। पीने के बाद +1 दबाएँ।`
              : `Aim for ${aim} by ${formatAlarmTime(h + 1, 0)}. Tap +1 after you drink.`,
            href: '/home',
            channel: 'naricare-water',
            category: 'water',
          });
        }
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
          title: hi ? `💪 ${routine.title.hi} · ${routine.minutes} मिनट` : `💪 ${routine.title.en} · ${routine.minutes} min`,
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
    const weekday = new Date(y, m - 1, dd).getDay();
    const wantsBody = (p?.goals ?? []).includes('lose_weight') || s.bodyLogs.length > 0;
    if (wantsBody && weekday === 1 && !(isToday && s.bodyLogs.some((b) => b.date === today))) {
      out.push({
        at: at(date, 7, 30),
        title: hi ? '⚖️ सोमवार का वज़न और कमर' : '⚖️ Monday weigh-in',
        body: hi ? 'खाने से पहले, 30 सेकंड। आपका 5% लक्ष्य चार्ट पर है।' : 'Before breakfast, 30 seconds. Your 5% goal is on the chart.',
        href: '/progress',
        channel: 'naricare-daily',
      });
    }
    if (dd === 1) {
      out.push({
        at: at(date, 19, 0),
        title: hi ? '🪞 मासिक त्वचा, बाल और मूड चेक-इन' : '🪞 Monthly skin, hair & mood check-in',
        body: hi ? '1 मिनट। 3–6 महीने में यही आपका सबसे बड़ा सबूत बनेगा।' : 'One minute. Over 3–6 months this becomes your strongest proof.',
        href: '/progress?tab=skin',
        channel: 'naricare-daily',
      });
    }
    const lesson = nextLesson(programWeek(s.programStart, at(date, 12, 0)), s.lessonsDone, p?.goals ?? []);
    if (lesson && !(isToday && s.lastLessonDate === today) && d % 2 === 0) {
      out.push({
        at: at(date, 20, 30),
        title: hi ? `📖 2 मिनट: ${lesson.title.hi}` : `📖 2 minutes: ${lesson.title.en}`,
        body: hi ? 'आज का छोटा पाठ, सरल भाषा में। सुन भी सकती हैं।' : 'Today’s short lesson, in plain words. You can listen to it too.',
        href: `/learn/${lesson.id}`,
        channel: 'naricare-daily',
      });
    }
    if (weekday === 0) {
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

/** Lock-screen-safe text: says what kind of reminder it is, nothing about health. */
function discreetBody(n: Nudge, hi: boolean): string {
  if (n.category === 'water') return hi ? 'पानी का समय 💧' : 'Water break 💧';
  if (n.category === 'meal') return hi ? 'खाने का समय' : 'Meal time';
  if (n.channel === 'naricare-move') return hi ? 'आज का मूव तैयार है' : 'Your move for today is ready';
  return hi ? 'आपके लिए एक छोटा रिमाइंडर' : 'A small reminder for you';
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
    await ensureCategories(N).catch(() => undefined);
    await N.cancelAllScheduledNotificationsAsync();
    const nudges = buildNudges().slice(0, 90);
    const { discreet, profile } = useAppStore.getState();
    const hi = profile?.language === 'hi';
    for (const n of nudges) {
      await N.scheduleNotificationAsync({
        content: {
          title: discreet ? 'NariCare' : n.title,
          body: discreet ? discreetBody(n, hi) : n.body,
          sound: true,
          data: { url: n.href, ...n.extra },
          ...(n.category ? { categoryIdentifier: n.category } : {}),
        },
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
      body: 'Tap to open Exercise with the timer ready.',
      data: { url: '/move?start=1' },
    },
    trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: 'naricare-move' },
  });
}
