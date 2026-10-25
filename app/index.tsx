import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/src/theme/tokens';
import { isSubscriptionActive, useAppStore } from '@/src/store/useAppStore';

export default function Gate() {
  const hydrated = useAppStore((s) => s.hydrated);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const hasSeenWelcome = useAppStore((s) => s.hasSeenWelcome);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const profile = useAppStore((s) => s.profile);
  const subscription = useAppStore((s) => s.subscription);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useAppStore.persist.onFinishHydration(finish);
    if (useAppStore.persist.hasHydrated()) finish();
    finish(); // never hang the gate if persist is slow
    const t = setTimeout(() => setBootDone(true), 50);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [setHydrated]);

  if (!hydrated && !bootDone) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
        }}
      >
        <ActivityIndicator color={colors.blushDeep} />
      </View>
    );
  }

  if (!hasSeenWelcome) return <Redirect href="/welcome" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!profile) return <Redirect href="/setup" />;
  if (!isSubscriptionActive(subscription)) return <Redirect href="/paywall" />;
  return <Redirect href="/home" />;
}
