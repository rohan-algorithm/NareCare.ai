import { Stack } from 'expo-router';
import { useState } from 'react';
import { shareDoctorKitPdf } from '@/src/features/doctorKitPdf';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { phenotypeLabel } from '@/src/features/phenotype';
import { cycleStatus, getCycleDay, getCyclePhase } from '@/src/features/cycle';
import { computeProgressPulse } from '@/src/features/progressPulse';
import { CONSULT_QUESTIONS } from '@/src/content/consultQuestions';

export default function DoctorKit() {
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.symptomLogs);
  const mealMarks = useAppStore((s) => s.mealMarks);
  const exerciseLogs = useAppStore((s) => s.exerciseLogs);
  const labAnalyses = useAppStore((s) => s.labAnalyses);
  const noteDoctorKitExport = useAppStore((s) => s.noteDoctorKitExport);
  const bodyLogs = useAppStore((s) => s.bodyLogs);
  const skinLogs = useAppStore((s) => s.skinLogs);
  const mindChecks = useAppStore((s) => s.mindChecks);
  const ttc = useAppStore((s) => s.ttc);
  const [pdfBusy, setPdfBusy] = useState(false);
  const lang = profile?.language ?? 'en';
  const pulse = computeProgressPulse(logs, lang);
  const cycleDay = getCycleDay(logs);
  const phase = getCyclePhase(cycleDay, logs);
  const cyc = cycleStatus(logs);
  const pcosCheck = useAppStore((s) => s.pcosCheck);
  const adherence = Object.values(mealMarks).filter((s) => s === 'ate' || s === 'swapped').length;
  const recentBleed = logs
    .filter((l) => l.periodStatus !== 'none')
    .slice(-3)
    .map((l) => l.bleedPattern ?? '—')
    .join(', ');
  const crashDays = logs.filter((l) => l.energyCrash).length;

  const summaryText = [
    `NariCare · Visit Summary`,
    `Patient: ${profile?.name ?? '—'}`,
    `Phenotype: ${phenotypeLabel(profile?.phenotype ?? 'mixed')}`,
    `Cycle: ${cycleDay ? `Day ${cycleDay} (${phase})` : 'Not enough period logs'}`,
    `Bleed tags (recent): ${recentBleed || '—'}`,
    `Progress Pulse: ${pulse.score} · ${pulse.headline}`,
    `Symptom logs: ${logs.length}`,
    `Post-meal crash days logged: ${crashDays}`,
    `Meal adherence marks: ${adherence}`,
    `Living context: ${profile?.livingContext?.replaceAll('_', ' ') ?? '—'}`,
    `Wins: ${pulse.wins.join('; ')}`,
    '',
    'Questions for gynae:',
    ...CONSULT_QUESTIONS.map((q, i) => `${i + 1}. ${lang === 'hi' ? q.hi : q.en}`),
  ].join('\n');

  const sharePdf = async () => {
    setPdfBusy(true);
    try {
      await shareDoctorKitPdf({
        name: profile?.name ?? '—',
        age: profile?.age,
        focus: phenotypeLabel(profile?.phenotype ?? 'mixed'),
        cycle: cycleDay
          ? `Day ${cycleDay}${cyc.avg ? ` · usual cycle ${cyc.avg} days (${cyc.regular ? 'regular' : 'irregular'})` : ''}${phase !== 'unknown' ? ` · ${phase}` : ''}${cyc.overdue ? ' · NO PERIOD 90+ DAYS' : ''}`
          : 'Not enough period logs',
        bleed: recentBleed || '—',
        pulse,
        logs,
        crashDays,
        adherence,
        moves: exerciseLogs,
        livingContext: profile?.livingContext?.replaceAll('_', ' ') ?? '—',
        lab: labAnalyses[0],
        questions: [...(labAnalyses[0]?.doctorQuestions ?? []).slice(0, 3), ...CONSULT_QUESTIONS.slice(0, 5).map((q) => q.en)],
        body: bodyLogs,
        skin: skinLogs,
        mind: mindChecks,
        ttc: { on: ttc.on, since: ttc.since, positives: ttc.lhTests.filter((t) => t.result === 'pos').length },
        pcosCheck,
      });
      noteDoctorKitExport();
    } catch {
      try {
        await Share.share({ message: summaryText, title: 'NariCare Doctor Visit Kit' });
        noteDoctorKitExport();
      } catch {
        Alert.alert('Could not share', 'Show this screen at your appointment.');
      }
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'डॉक्टर किट' : 'Doctor visit kit',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{lang === 'hi' ? 'गायनी के लिए' : 'For your gynae'}</Label>
          <Display style={{ marginTop: 6 }}>
            {lang === 'hi' ? '15-मिनट\nविज़िट तैयार' : '15-minute\nconsult ready'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {lang === 'hi'
              ? 'एक स्नैपशॉट — “मुझे लगता है मुंहासे बेहतर हुए?” अब नहीं।'
              : 'One structured snapshot — no more “I think my acne got better?”'}
          </Body>
        </Animated.View>

        <Card tone="dark" style={{ marginTop: spacing.lg }}>
          <Text style={styles.sheetTitle}>NariCare · Visit Summary</Text>
          <Row label="Patient" value={profile?.name ?? '—'} light />
          <Row label="Phenotype focus" value={phenotypeLabel(profile?.phenotype ?? 'mixed')} light />
          <Row
            label="Cycle"
            value={cycleDay ? `Day ${cycleDay} (${phase})` : 'Not enough period logs'}
            light
          />
          <Row label="Bleed pattern (recent)" value={recentBleed || '—'} light />
          <Row label="Progress Pulse" value={`${pulse.score} · ${pulse.headline}`} light />
          <Row label="Symptom logs" value={String(logs.length)} light />
          <Row label="Energy-crash days" value={String(crashDays)} light />
          <Row label="Meal adherence marks" value={String(adherence)} light />
          <Row
            label="Living context"
            value={profile?.livingContext?.replaceAll('_', ' ') ?? '—'}
            light
          />
          <View style={styles.divider} />
          <Label style={{ color: 'rgba(255,255,255,0.5)' }}>Wins to mention</Label>
          {pulse.wins.map((w) => (
            <Text key={w} style={styles.win}>
              · {w}
            </Text>
          ))}
        </Card>

        <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          {lang === 'hi' ? 'गायनी से पूछें (Dr. Ananya)' : 'Ask your gynae (Dr. Ananya)'}
        </Label>
        <View style={styles.qList}>
          {CONSULT_QUESTIONS.slice(0, 5).map((q, i) => (
            <Text key={i} style={styles.qItem}>
              {i + 1}. {lang === 'hi' ? q.hi : q.en}
            </Text>
          ))}
        </View>

        <Button
          label={pdfBusy ? (lang === 'hi' ? 'PDF बन रहा है…' : 'Making PDF…') : lang === 'hi' ? 'PDF बनाएँ और शेयर करें' : 'Create & share PDF'}
          onPress={sharePdf}
          disabled={pdfBusy}
          style={{ marginTop: spacing.md }}
        />
        <Muted style={{ marginTop: spacing.md, textAlign: 'center' }}>
          {lang === 'hi'
            ? 'अगली अपॉइंटमेंट पर यह स्क्रीन दिखाएँ या शेयर करें।'
            : 'Show or share this at your next appointment.'}
        </Muted>
        <Disclaimer lang={lang} />
      </Screen>
    </>
  );
}

function Row({ label, value, light }: { label: string; value: string; light?: boolean }) {
  return (
    <View style={styles.row}>
      <Muted style={light ? { color: 'rgba(255,255,255,0.55)' } : undefined}>{label}</Muted>
      <Title
        style={[
          { marginTop: 2, textTransform: 'capitalize', fontSize: 15 },
          light ? { color: colors.white } : null,
        ]}
      >
        {value}
      </Title>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.white,
    marginBottom: spacing.md,
    letterSpacing: -0.4,
  },
  row: { marginBottom: spacing.sm },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: spacing.md,
  },
  win: {
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    lineHeight: 20,
  },
  qList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  qItem: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 10,
  },
});
