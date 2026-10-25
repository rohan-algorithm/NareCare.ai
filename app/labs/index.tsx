import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { EmptyState } from '@/src/ui/EmptyState';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { SAMPLE_LAB_VALUES } from '@/src/features/labAi';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

export default function Labs() {
  const saveLabAnalysis = useAppStore((s) => s.saveLabAnalysis);
  const labAnalyses = useAppStore((s) => s.labAnalyses);
  const profile = useAppStore((s) => s.profile);
  const [busy, setBusy] = useState(false);
  const latest = labAnalyses[0];
  const hi = profile?.language === 'hi';

  const runAi = () => {
    setBusy(true);
    setTimeout(() => {
      saveLabAnalysis(SAMPLE_LAB_VALUES);
      setBusy(false);
    }, 700);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'लैब डिकोडर' : 'Lab decoder',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{hi ? 'AI रिपोर्ट' : 'AI report'}</Label>
          <Display style={{ marginTop: 6 }}>
            {hi ? 'समझें।\nबेहतर सवाल पूछें' : 'Decode.\nAsk better questions'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {hi
              ? 'SRL / Thyrocare / Dr Lal · सादी हिंदी + English · डॉक्टर सवाल। खुराक कभी नहीं।'
              : 'SRL / Thyrocare / Dr Lal · plain Hindi + English · doctor questions. Never doses.'}
          </Body>
        </Animated.View>

        {!latest ? (
          <EmptyState
            title={hi ? 'अभी कोई डिकोड नहीं' : 'No decode yet'}
            body={
              hi
                ? 'सैंपल PCOS पैनल चलाएँ — मार्कर, समझ, डॉक्टर सवाल।'
                : 'Run the sample PCOS panel — markers, plain explainers, doctor questions.'
            }
            cta={busy ? (hi ? 'विश्लेषण…' : 'Analyzing…') : hi ? 'सैंपल डिकोड चलाएँ' : 'Run sample decode'}
            onPress={runAi}
          />
        ) : (
          <Button
            label={busy ? (hi ? 'विश्लेषण…' : 'Analyzing…') : hi ? 'फिर से विश्लेषण' : 'Re-run analysis'}
            variant="secondary"
            onPress={runAi}
            style={{ marginTop: spacing.lg }}
          />
        )}

        {latest && (
          <>
            <Card tone="dark" style={{ marginBottom: spacing.md }}>
              <Label style={{ color: 'rgba(255,255,255,0.5)' }}>AI summary</Label>
              <Body style={{ color: colors.white, marginTop: 8 }}>{latest.summaryEn}</Body>
              <Muted style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>{latest.summaryHi}</Muted>
              <View style={styles.hint}>
                <Text style={styles.hintText}>Pattern hint · {latest.phenotypeHint}</Text>
              </View>
            </Card>

            {latest.findings.map((m, i) => (
              <Animated.View key={m.key} entering={FadeInDown.delay(30 * i).duration(300)}>
                <Card tone="solid" style={{ marginBottom: spacing.md }}>
                  <View style={styles.row}>
                    <Title>{m.name}</Title>
                    <View style={[styles.badge, badgeTone[m.status]]}>
                      <Text style={styles.badgeText}>{m.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.value}>
                    {m.value} {m.unit}
                  </Text>
                  <Body style={{ marginTop: 10 }}>{m.explainEn}</Body>
                  <Muted style={{ marginTop: 6 }}>{m.explainHi}</Muted>
                  <Text style={styles.action}>{m.action}</Text>
                </Card>
              </Animated.View>
            ))}

            <Card tone="gold">
              <Title>{hi ? 'डॉक्टर से पूछें' : 'Ask your doctor'}</Title>
              {latest.doctorQuestions.map((q) => (
                <Text key={q} style={styles.q}>
                  · {q}
                </Text>
              ))}
            </Card>
          </>
        )}
        <Disclaimer lang={hi ? 'hi' : 'en'} />
      </Screen>
    </>
  );
}

const badgeTone = StyleSheet.create({
  Normal: { backgroundColor: colors.mist },
  Borderline: { backgroundColor: colors.amberSoft },
  High: { backgroundColor: colors.blushSoft },
  Low: { backgroundColor: colors.blushSoft },
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.blushDeep,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  action: {
    marginTop: spacing.md,
    fontFamily: fonts.bodyMedium,
    color: colors.teal,
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.amber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  hintText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink, textTransform: 'capitalize' },
  q: {
    marginTop: 8,
    fontFamily: fonts.body,
    color: colors.ink,
    lineHeight: 20,
  },
});
