import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { BrandMark } from '@/src/ui/BrandMark';
import { Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { getCycleDay, getCyclePhase, phaseCopy } from '@/src/features/cycle';
import { phenotypeLabel } from '@/src/features/phenotype';
import { primaryProblemToday } from '@/src/features/solveToday';
import {
  formatAlarmTime,
  nextUpReminder,
  reminderTitle,
} from '@/src/features/reminderDefaults';
import { greeting as greet } from '@/src/i18n/copy';

/**
 * Flo + Oura Today: status → one primary action → Ask → up next → schedule.
 * Tabs cover Eat / Move / Track — no duplicate shortcuts or habit dashboard.
 */
export default function Home() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.symptomLogs);
  const addWater = useAppStore((s) => s.addWater);
  const resetWaterIfNeeded = useAppStore((s) => s.resetWaterIfNeeded);
  const resetHabitsIfNeeded = useAppStore((s) => s.resetHabitsIfNeeded);
  const resetCouncilIfNeeded = useAppStore((s) => s.resetCouncilIfNeeded);
  const badDayMode = useAppStore((s) => s.badDayMode);
  const setBadDayMode = useAppStore((s) => s.setBadDayMode);
  const streakDays = useAppStore((s) => s.streakDays);
  const reminders = useAppStore((s) => s.reminders);
  const scheduleDone = useAppStore((s) => s.scheduleDone);
  const markScheduleDone = useAppStore((s) => s.markScheduleDone);
  const resetScheduleIfNeeded = useAppStore((s) => s.resetScheduleIfNeeded);
  const hasSeenGuide = useAppStore((s) => s.hasSeenGuide);
  const alarmsArmed = useAppStore((s) => s.alarmsArmed);
  const setAlarmsArmed = useAppStore((s) => s.setAlarmsArmed);
  const [arming, setArming] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const phenotype = profile?.phenotype ?? 'mixed';

  useEffect(() => {
    resetWaterIfNeeded();
    resetHabitsIfNeeded();
    resetCouncilIfNeeded();
    resetScheduleIfNeeded();
  }, [resetWaterIfNeeded, resetHabitsIfNeeded, resetCouncilIfNeeded, resetScheduleIfNeeded]);

  useEffect(() => {
    if (!hasSeenGuide) {
      const id = setTimeout(() => router.push('/guide'), 400);
      return () => clearTimeout(id);
    }
  }, [hasSeenGuide, router]);

  const cycleDay = getCycleDay(logs);
  const phase = getCyclePhase(cycleDay);
  const phaseInfo = phaseCopy(phase, lang);
  const primary = useMemo(() => primaryProblemToday(phenotype, logs), [phenotype, logs]);
  const next = nextUpReminder(reminders);
  const scheduleList = reminders.filter((r) => r.enabled);
  const scheduleDoneCount = scheduleList.filter((r) => scheduleDone[r.key]).length;

  const armAlarms = async () => {
    setArming(true);
    try {
      const { scheduleReminders } = await import('@/src/features/reminders');
      const n = await scheduleReminders(reminders);
      setAlarmsArmed(true);
      Alert.alert(hi ? 'अलार्म ऑन' : 'Alarms on', hi ? `${n} अलार्म सेट।` : `${n} alarms set.`);
    } catch (e: any) {
      Alert.alert(hi ? 'अलार्म' : 'Alarms', e?.message ?? (hi ? 'सीमित सपोर्ट।' : 'Limited support.'));
      setAlarmsArmed(true);
    } finally {
      setArming(false);
    }
  };

  const openScheduleItem = (href: string, key: string, kind?: string) => {
    if (key === 'water') {
      addWater();
      markScheduleDone(key);
      return;
    }
    if (kind !== 'move') markScheduleDone(key);
    if (href.startsWith('/home')) return;
    router.push(href as any);
  };

  if (badDayMode) {
    return (
      <Screen scroll>
        <View style={styles.softTop}>
          <BrandMark size={32} showWordmark />
        </View>
        <Display style={{ marginTop: spacing.xl, fontSize: 32, lineHeight: 38 }}>
          {hi ? 'आज नरमी से' : 'Soft day'}
        </Display>
        <Muted style={{ marginTop: spacing.md, maxWidth: 280, fontSize: 16, lineHeight: 24 }}>
          {hi
            ? 'परफेक्ट प्लान कल। आज पानी, साँस, और एक छोटी जीत।'
            : 'Perfect plans can wait. Today: water, breath, one tiny win.'}
        </Muted>
        <Button
          label={hi ? 'फ्लेयर केयर खोलें' : 'Open flare care'}
          onPress={() => router.push('/flare')}
          style={{ marginTop: spacing.xl }}
        />
        <Button
          label={hi ? 'Calm 3 मिनट' : '3-min Calm breathe'}
          variant="secondary"
          onPress={() => router.push('/move?start=1')}
          style={{ marginTop: spacing.sm }}
        />
        <Pressable onPress={() => setBadDayMode(false)} style={styles.quietLink}>
          <Text style={styles.linkMuted}>{hi ? 'पूरा होम वापस →' : 'Back to full home →'}</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(380)}>
        <View style={styles.topRow}>
          <BrandMark size={28} showWordmark />
          <Pressable onPress={() => setBadDayMode(true)} hitSlop={12}>
            <Text style={styles.topLink}>{hi ? 'Soft day' : 'Soft day'}</Text>
          </Pressable>
        </View>

        <Label style={{ marginTop: spacing.xl }}>{greet(lang)}</Label>
        <Display style={{ marginTop: 4, fontSize: 28, lineHeight: 34 }}>
          {profile?.name ?? (hi ? 'आप' : 'Friend')}
        </Display>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.statusBlock}>
        <View style={styles.cycleRing}>
          <Text style={styles.cycleDay}>{cycleDay ? `D${cycleDay}` : '—'}</Text>
          <Text style={styles.cyclePhase} numberOfLines={1}>
            {phaseInfo.title}
          </Text>
        </View>
        <View style={styles.statusCopy}>
          <Title style={{ fontSize: 17 }}>{hi ? 'आज का फोकस' : 'Today’s focus'}</Title>
          <Muted style={{ marginTop: 6 }} numberOfLines={3}>
            {hi ? primary.patientVoiceHi : primary.patientVoice}
          </Muted>
          <Text style={styles.metaLine}>
            {phenotypeLabel(phenotype, lang)} · {streakDays}
            {hi ? ' दिन स्ट्रीक' : 'd streak'}
          </Text>
        </View>
      </Animated.View>

      <Button
        label={hi ? primary.ctaHi : primary.cta}
        onPress={() => router.push(primary.solveHref as any)}
        style={{ marginTop: spacing.lg }}
      />

      <Pressable onPress={() => router.push('/ai')} style={styles.askLink}>
        <Text style={styles.link}>{hi ? 'AI कोच से पूछें →' : 'Ask AI coach →'}</Text>
      </Pressable>

      {next && (
        <Pressable
          onPress={() => openScheduleItem(next.href, next.key, next.kind)}
          style={styles.nextRow}
        >
          <View style={{ flex: 1 }}>
            <Label>{hi ? 'अगला' : 'Up next'}</Label>
            <Title style={{ marginTop: 4, fontSize: 16 }}>
              {formatAlarmTime(next.hour, next.minute)} · {reminderTitle(next, lang)}
            </Title>
          </View>
          <Text style={styles.nextCta}>
            {next.kind === 'move' ? (hi ? 'शुरू' : 'Start') : hi ? 'खोलें' : 'Open'}
          </Text>
        </Pressable>
      )}

      {!alarmsArmed && (
        <Pressable onPress={armAlarms} style={styles.quietLink}>
          <Text style={styles.link}>
            {arming ? (hi ? 'सेट…' : 'Arming…') : hi ? 'डेली अलार्म ऑन करें →' : 'Turn daily alarms on →'}
          </Text>
        </Pressable>
      )}

      <Pressable onPress={() => setShowSchedule((v) => !v)} style={styles.quietLink}>
        <Text style={styles.linkMuted}>
          {showSchedule
            ? hi
              ? 'शेड्यूल छुपाएँ'
              : 'Hide schedule'
            : hi
              ? `शेड्यूल ${scheduleDoneCount}/${scheduleList.length} →`
              : `Schedule ${scheduleDoneCount}/${scheduleList.length} →`}
        </Text>
      </Pressable>

      {showSchedule &&
        scheduleList.map((r) => {
          const done = !!scheduleDone[r.key];
          return (
            <Pressable
              key={r.key}
              onPress={() => openScheduleItem(r.href, r.key, r.kind)}
              style={styles.schedRow}
            >
              <Text style={styles.schedTime}>{formatAlarmTime(r.hour, r.minute)}</Text>
              <Text style={[styles.schedTitle, done && { opacity: 0.45 }]}>
                {reminderTitle(r, lang)}
              </Text>
              <Text style={styles.schedCheck}>{done ? '✓' : ''}</Text>
            </Pressable>
          );
        })}

      <Pressable onPress={() => router.push('/weekly')} style={styles.quietLink}>
        <Text style={styles.linkMuted}>
          {hi ? 'साप्ताहिक समीक्षा →' : 'Weekly review →'}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  softTop: { marginTop: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topLink: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  statusBlock: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  cycleRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: colors.blush,
    backgroundColor: colors.blushSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cycleDay: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.blushDeep,
    letterSpacing: -0.8,
  },
  cyclePhase: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.blushDeep,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.85,
  },
  statusCopy: { flex: 1 },
  metaLine: {
    marginTop: 10,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.muted,
  },
  askLink: { marginTop: spacing.md },
  nextRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  nextCta: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.blushDeep,
  },
  quietLink: { marginTop: spacing.md },
  link: { fontFamily: fonts.bodyBold, color: colors.blushDeep, fontSize: 14 },
  linkMuted: { fontFamily: fonts.bodyMedium, color: colors.muted, fontSize: 13 },
  schedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  schedTime: {
    width: 56,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.muted,
  },
  schedTitle: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  schedCheck: { fontFamily: fonts.bodyBold, color: colors.forest, width: 20 },
});
