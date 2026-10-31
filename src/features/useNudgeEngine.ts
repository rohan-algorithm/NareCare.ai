import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, AppState } from 'react-native';

import { getNotifications, rebuildNudges } from '@/src/features/reminders';
import { useAppStore } from '@/src/store/useAppStore';

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
      const handle = (r: import('expo-notifications').NotificationResponse) => {
        const data = r.notification.request.content.data ?? {};
        const st = useAppStore.getState();
        const hi = st.profile?.language === 'hi';
        const done = (msg: string) => {
          void N.dismissNotificationAsync(r.notification.request.identifier).catch(() => undefined);
          setTimeout(() => {
            router.push('/home');
            Alert.alert(msg);
          }, 600);
        };
        switch (r.actionIdentifier) {
          case 'water1':
          case 'water2': {
            const n = r.actionIdentifier === 'water2' ? 2 : 1;
            st.addWater(n);
            const g = useAppStore.getState().waterGlasses;
            return done(hi ? `💧 ${n} गिलास जोड़ा · आज ${g}` : `💧 Added ${n} · ${g} glasses today`);
          }
          case 'ate':
            if (typeof data.date === 'string' && typeof data.slot === 'string') st.markMeal(`${data.date}|${data.slot}`, 'ate');
            return done(hi ? '✓ खाना लॉग हुआ' : '✓ Meal logged');
          default: {
            const url = data.url;
            if (typeof url === 'string') setTimeout(() => router.push(url as any), 600);
          }
        }
      };
      const last = await N.getLastNotificationResponseAsync();
      if (last?.notification && !cancelled) {
        handle(last);
        await N.clearLastNotificationResponseAsync();
      }
      sub = N.addNotificationResponseReceivedListener(handle);
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
        s.waterGlasses !== prev.waterGlasses
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
