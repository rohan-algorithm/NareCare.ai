import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { getCycleDay, getCyclePhase, phaseCopy } from '@/src/features/cycle';
import { predictNextPeriod } from '@/src/features/insights';

export default function CycleCalm() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.symptomLogs);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const cycleDay = getCycleDay(logs);
  const phase = getCyclePhase(cycleDay, logs);
  const phaseInfo = phaseCopy(phase, lang);
  const prediction = predictNextPeriod(logs);
  const starts = logs.filter((l) => l.periodStatus === 'started' || l.periodStatus === 'flowing');

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'साइकल शांति' : 'Cycle calm',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{hi ? 'PCOS-ईमानदार' : 'PCOS-honest'}</Label>
          <Display style={{ marginTop: 6 }}>
            {hi ? 'आपकी साइकल\nघड़ी नहीं है' : 'Your cycle\nisn’t a clock'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {hi
              ? 'हम ओव्यूलेशन का झूठा वादा नहीं करते। आखिरी पीरियड + पैटर्न — बस।'
              : 'We don’t fake ovulation certainty. Last period + patterns — that’s enough.'}
          </Body>
        </Animated.View>

        <View style={styles.block}>
          <Title style={{ fontSize: 17 }}>{hi ? 'अभी क्या पता है' : 'What we know'}</Title>
          <Muted style={{ marginTop: 10 }}>
            {hi ? 'पीरियड शुरू लॉग्स' : 'Period-start logs'}: {starts.length}
          </Muted>
          <Muted style={{ marginTop: 6 }}>
            {cycleDay
              ? hi
                ? `आखिरी शुरू से दिन ${cycleDay} · ${phaseInfo.title}`
                : `Day ${cycleDay} since last start · ${phaseInfo.title}`
              : hi
                ? 'अभी साइकल दिन लॉक नहीं — Track में शुरू लॉग करें'
                : 'Cycle day unlocks after you log a start in Track'}
          </Muted>
        </View>

        <View style={styles.block}>
          <Label>{hi ? 'संभावित विंडो (विनम्र)' : 'Likely window (humble)'}</Label>
          <Title style={{ marginTop: 8, fontSize: 18 }}>
            {hi ? prediction.labelHi : prediction.label}
          </Title>
          <Muted style={{ marginTop: 8 }}>
            {hi
              ? 'अगर 90+ दिन गैप हो — गायनी से मिलें। ऐप निदान नहीं करती।'
              : 'If gaps are 90+ days — see a gynae. The app never diagnoses.'}
          </Muted>
        </View>

        <Muted style={{ marginTop: spacing.lg }}>
          {hi
            ? 'आज: Track में 2 मिनट — पीरियड + मूड।'
            : 'Today: 2 minutes in Track — period + mood.'}
        </Muted>

        <Button
          label={hi ? 'अभी लॉग करें' : 'Log now'}
          onPress={() => router.push('/track')}
          style={{ marginTop: spacing.lg }}
        />
        <Pressable onPress={() => router.push('/doctor-kit')} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>{hi ? 'Doctor Kit →' : 'Doctor Kit →'}</Text>
        </Pressable>
        <Disclaimer lang={lang} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  link: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.blushDeep },
});
