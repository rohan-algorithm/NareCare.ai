import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { Button } from '@/src/ui/Button';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { FLARE_CARE } from '@/src/content/patientProblems';
import { waterGoal } from '@/src/features/water';
import { useAppStore } from '@/src/store/useAppStore';

export default function Flare() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const addWater = useAppStore((s) => s.addWater);
  const setBadDayMode = useAppStore((s) => s.setBadDayMode);
  const waterGlasses = useAppStore((s) => s.waterGlasses);
  const weightKg = useAppStore((s) => s.profile?.weightKg);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const [done, setDone] = useState<Record<number, boolean>>({});

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'फ्लेयर केयर' : 'Flare care',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <ScreenHeader
          showLogo={false}
          door={hi ? 'आप अकेली नहीं' : 'You’re not failing'}
          title={hi ? FLARE_CARE.title.hi : FLARE_CARE.title.en}
          subtitle={
            hi
              ? 'आज सिर्फ़ छोटी जीत। परफेक्ट प्लान कल।'
              : 'Tiny wins only today. Perfect plans can wait.'
          }
        />

        {FLARE_CARE.steps.map((step, i) => {
          const checked = !!done[i];
          const canOpen = !!step.href || step.action === 'water';
          return (
            <Animated.View key={step.en} entering={FadeInDown.delay(50 * i).duration(360)}>
              <Pressable
                onPress={() => {
                  if (step.action === 'water') {
                    addWater();
                    setDone((d) => ({ ...d, [i]: true }));
                    return;
                  }
                  if (step.href) {
                    setDone((d) => ({ ...d, [i]: true }));
                    router.push(step.href as any);
                    return;
                  }
                  setDone((d) => ({ ...d, [i]: !d[i] }));
                }}
                style={styles.row}
              >
                <View style={[styles.check, checked && styles.checkOn]}>
                  <Text style={styles.checkMark}>{checked ? '✓' : ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Title style={[{ fontSize: 16 }, checked && { opacity: 0.45 }]}>
                    {hi ? step.hi : step.en}
                  </Title>
                  {step.action === 'water' && (
                    <Muted style={{ marginTop: 4 }}>
                      {waterGlasses}/{waterGoal(weightKg)} {hi ? 'गिलास' : 'glasses'}
                    </Muted>
                  )}
                </View>
                {canOpen ? <Text style={styles.arrow}>→</Text> : null}
              </Pressable>
            </Animated.View>
          );
        })}

        <Button
          label={hi ? 'होम पर Soft day चालू करें' : 'Turn on Soft day on Home'}
          onPress={() => {
            setBadDayMode(true);
            router.replace('/home');
          }}
          style={{ marginTop: spacing.xl }}
        />
        <Disclaimer lang={lang} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  checkMark: { color: colors.white, fontSize: 13, fontFamily: fonts.bodyBold },
  arrow: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.blushDeep },
});
