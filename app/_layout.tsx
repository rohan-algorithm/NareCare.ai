import {
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { colors } from '@/src/theme/tokens';
import { useNudgeEngine } from '@/src/features/useNudgeEngine';
import { ProSheetHost } from '@/src/ui/ProSheet';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function hideSplash() {
  SplashScreen.hideAsync().catch(() => undefined);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });
  const [timedOut, setTimedOut] = useState(false);
  const ready = Boolean(fontsLoaded || fontError || timedOut);
  useNudgeEngine();

  useEffect(() => {
    if (ready) hideSplash();
  }, [ready]);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: 'fade',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: colors.ink },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(setup)" />
        <Stack.Screen name="(paywall)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="labs/index" options={{ headerShown: true, title: 'Lab AI Decoder', animation: 'slide_from_right' }} />
        <Stack.Screen name="community/index" options={{ headerShown: true, title: 'Community', animation: 'slide_from_right' }} />
        <Stack.Screen name="doctor-kit/index" options={{ headerShown: true, title: 'Doctor Visit Kit', animation: 'slide_from_right' }} />
        <Stack.Screen name="ai/index" options={{ headerShown: true, title: 'AI Coach', animation: 'slide_from_right' }} />
        <Stack.Screen name="reminders/index" options={{ headerShown: true, title: 'Reminders', animation: 'slide_from_right' }} />
        <Stack.Screen name="grocery/index" options={{ headerShown: true, title: 'Grocery', animation: 'slide_from_right' }} />
        <Stack.Screen name="weekly/index" options={{ headerShown: true, title: 'Weekly review', animation: 'slide_from_right' }} />
        <Stack.Screen name="council/index" options={{ headerShown: true, title: 'Expert Council', animation: 'slide_from_right' }} />
        <Stack.Screen name="exam-kit/index" options={{ headerShown: true, title: 'Exam kit', animation: 'slide_from_right' }} />
        <Stack.Screen name="meds/index" options={{ headerShown: true, title: 'Meds & supplements', animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy/index" options={{ headerShown: true, title: 'Privacy', animation: 'slide_from_right' }} />
        <Stack.Screen name="tonight/index" options={{ headerShown: true, title: "Tonight's plate", animation: 'slide_from_right' }} />
        <Stack.Screen name="flare/index" options={{ headerShown: true, title: 'Flare care', animation: 'slide_from_right' }} />
        <Stack.Screen name="cycle-calm/index" options={{ headerShown: true, title: 'Cycle calm', animation: 'slide_from_right' }} />
        <Stack.Screen name="guide/index" options={{ headerShown: true, title: 'Starter guide', animation: 'slide_from_right' }} />
      </Stack>
      <ProSheetHost />
    </>
  );
}
