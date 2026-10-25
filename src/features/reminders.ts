import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { ReminderPref } from '@/src/features/reminderDefaults';

export type { ReminderKey, ReminderPref } from '@/src/features/reminderDefaults';
export { DEFAULT_REMINDERS } from '@/src/features/reminderDefaults';

/** Expo Go (SDK 53+) lacks some notifications native modules on Android. */
function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

async function getNotifications() {
  if (isExpoGo()) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function scheduleReminders(prefs: ReminderPref[]): Promise<number> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    throw new Error(
      'Phone alarms need a development build. In Expo Go, use Today’s schedule on Home — tap rows to start Move.',
    );
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    /* older builds */
  }

  const ok = await ensureNotificationPermission();
  if (!ok) return 0;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('naricare-daily', {
        name: 'NariCare Daily',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    } catch {
      /* ignore */
    }
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  let scheduled = 0;

  for (const r of prefs.filter((p) => p.enabled)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${r.title}`,
        body: r.body,
        sound: true,
        data: { href: r.href, key: r.key },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
        channelId: 'naricare-daily',
      },
    });
    scheduled += 1;
  }
  return scheduled;
}

export async function sendTestReminder(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    throw new Error(
      'Test alarms need a development build. Use Home → Today’s schedule → Start for now.',
    );
  }
  const ok = await ensureNotificationPermission();
  if (!ok) throw new Error('Permission denied');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Exercise alarm (test)',
      body: 'Tap to open Move and Start — no photo needed.',
      data: { href: '/move?start=1', key: 'evening_move' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}
