import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getNotifications, rebuildNudges } from '@/src/features/reminders';
import { isSubscriptionActive, useAppStore } from '@/src/store/useAppStore';

export function useNudgeEngine() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let sub: { remove: () => void } | undefined;
    (async () => {
      const N = await getNotifications();
      if (!N || cancelled) return;
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      const go = (n: { request: { content: { data?: Record<string, unknown> | null } } }) => {
        const url = n.request.content.data?.url;
        if (typeof url !== 'string') return;
        const paid = isSubscriptionActive(useAppStore.getState().subscription);
        setTimeout(() => router.push((paid ? url : '/') as any), 600);
      };
      const last = await N.getLastNotificationResponseAsync();
      if (last?.notification && !cancelled) {
        go(last.notification);
        await N.clearLastNotificationResponseAsync();
      }
      sub = N.addNotificationResponseReceivedListener((r) => go(r.notification));
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [router]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const kick = () => {
      if (!useAppStore.getState().alarmsArmed) return;
      clearTimeout(timer);
      timer = setTimeout(() => void rebuildNudges().catch(() => undefined), 2500);
    };
    kick();
    const app = AppState.addEventListener('change', (s) => s === 'active' && kick());
    const unsub = useAppStore.subscribe((s, prev) => {
      if (
        s.symptomLogs !== prev.symptomLogs ||
        s.exerciseLogs !== prev.exerciseLogs ||
        s.mealMarks !== prev.mealMarks ||
        s.mealSwaps !== prev.mealSwaps ||
        s.bodyLogs !== prev.bodyLogs ||
        s.lessonsDone !== prev.lessonsDone ||
        s.scheduleDone !== prev.scheduleDone ||
        s.reminders !== prev.reminders ||
        s.profile !== prev.profile ||
        s.subscription !== prev.subscription ||
        s.alarmsArmed !== prev.alarmsArmed ||
        (s.waterGlasses >= 8) !== (prev.waterGlasses >= 8)
      )
        kick();
    });
    return () => {
      clearTimeout(timer);
      app.remove();
      unsub();
    };
  }, []);
}
