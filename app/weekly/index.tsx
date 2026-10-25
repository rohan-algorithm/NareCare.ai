import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { computeProgressPulse } from '@/src/features/progressPulse';
import { buildInsights, predictNextPeriod } from '@/src/features/insights';

export default function WeeklyReview() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.symptomLogs);
  const mealMarks = useAppStore((s) => s.mealMarks);
  const exerciseLogs = useAppStore((s) => s.exerciseLogs);
  const streakDays = useAppStore((s) => s.streakDays);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';

  const pulse = computeProgressPulse(logs, lang);
  const insights = buildInsights(logs, lang).slice(0, 2);
  const prediction = predictNextPeriod(logs);
  const mealsLogged = Object.keys(mealMarks).length;
  const workouts = exerciseLogs.filter((e) => {
    const d = new Date(e.date);
    return Date.now() - d.getTime() < 7 * 86400000;
  }).length;
  const crashWeek = logs.filter((l) => l.energyCrash).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'साप्ताहिक रिव्यू' : 'Weekly review',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{hi ? 'इस हफ़्ते' : 'This week'}</Label>
          <Display style={{ marginTop: 6 }}>{hi ? 'क्या काम कर रहा है' : "What's working"}</Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {hi
              ? 'एक नज़र — लक्षण, भोजन, मूव।'
              : 'One glance — symptoms, meals, move.'}
          </Body>
        </Animated.View>

        <View style={styles.pulse}>
          <View style={{ flex: 1 }}>
            <Label style={{ color: 'rgba(255,255,255,0.55)' }}>Progress Pulse</Label>
            <Text style={styles.headline}>{pulse.headline}</Text>
            <Muted style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>{pulse.detail}</Muted>
          </View>
          <ProgressRing value={pulse.score} size={72} stroke={6} />
        </View>

        <View style={styles.stats}>
          <Stat label={hi ? 'लॉग्स' : 'Logs'} value={String(logs.length)} />
          <Stat label={hi ? 'मील्स' : 'Meals'} value={String(mealsLogged)} />
          <Stat label={hi ? 'मूव' : 'Move'} value={String(workouts)} />
          <Stat label={hi ? 'स्ट्रीक' : 'Streak'} value={`${streakDays}d`} />
        </View>

        <Muted style={{ marginTop: spacing.lg }}>
          {hi ? prediction.labelHi : prediction.label}
        </Muted>

        <Pressable onPress={() => router.push('/track')} style={styles.insulinRow}>
          <View style={{ flex: 1 }}>
            <Label>{hi ? 'इंसुलिन चेक-इन · Dr. Meera' : 'Insulin check-in · Dr. Meera'}</Label>
            <Title style={{ marginTop: 4, fontSize: 16 }}>
              {crashWeek === 0
                ? hi
                  ? 'इस हफ़्ते कोई क्रैश नहीं'
                  : 'No crashes logged this week'
                : hi
                  ? `${crashWeek} दिन पोस्ट-मील क्रैश`
                  : `${crashWeek} post-meal crash day(s)`}
            </Title>
            <Muted style={{ marginTop: 4 }}>
              {hi
                ? 'Track में टैग करें · ऐप खुराक नहीं सुझाती'
                : 'Tag in Track · app never doses meds'}
            </Muted>
          </View>
          <Text style={styles.link}>{hi ? 'लॉग →' : 'Log →'}</Text>
        </Pressable>

        {insights.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <Label>{hi ? 'इनसाइट्स' : 'Insights'}</Label>
            {insights.map((ins) => (
              <View key={ins.id} style={styles.insight}>
                <Title style={{ fontSize: 16 }}>{hi ? ins.titleHi : ins.title}</Title>
                <Muted style={{ marginTop: 4 }}>{hi ? ins.detailHi : ins.detail}</Muted>
              </View>
            ))}
          </View>
        )}

        <Pressable onPress={() => router.push('/track')} style={{ marginTop: spacing.xl }}>
          <Text style={styles.link}>{hi ? 'आज Track करें →' : 'Log today in Track →'}</Text>
        </Pressable>
        <Disclaimer lang={lang} />
      </Screen>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Muted>{label}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    marginTop: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headline: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.white,
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.lg,
  },
  stat: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.forest,
    letterSpacing: -0.5,
  },
  insight: {
    marginTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  insulinRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  link: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.blushDeep },
});
