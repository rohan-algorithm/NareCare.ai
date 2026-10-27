import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { BrandMark } from '@/src/ui/BrandMark';
import { Display, Muted } from '@/src/ui/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadowCard, spacing } from '@/src/theme/tokens';
import { Ionicons, IconBubble, type IconName } from '@/src/ui/Icon';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { TrialWins } from '@/src/ui/TrialWins';
import { nextLesson, programWeek } from '@/src/content/academy';
import { boostFor, planToday } from '@/src/features/todayWorkout';
import { buildWorkout } from '@/src/features/workoutEngine';
import { dailyAiTip } from '@/src/features/aiCoach';
import { useAppStore } from '@/src/store/useAppStore';
import { getCycleDay, getCyclePhase, phaseCopy } from '@/src/features/cycle';
import { primaryProblemToday } from '@/src/features/solveToday';
import { greeting as greet } from '@/src/i18n/copy';

export default function Home() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.symptomLogs);
  const resetWaterIfNeeded = useAppStore((s) => s.resetWaterIfNeeded);
  const resetHabitsIfNeeded = useAppStore((s) => s.resetHabitsIfNeeded);
  const resetCouncilIfNeeded = useAppStore((s) => s.resetCouncilIfNeeded);
  const badDayMode = useAppStore((s) => s.badDayMode);
  const setBadDayMode = useAppStore((s) => s.setBadDayMode);
  const streakDays = useAppStore((s) => s.streakDays);
  const reminders = useAppStore((s) => s.reminders);
  const scheduleDone = useAppStore((s) => s.scheduleDone);
  const resetScheduleIfNeeded = useAppStore((s) => s.resetScheduleIfNeeded);
  const hasSeenGuide = useAppStore((s) => s.hasSeenGuide);
  const alarmsArmed = useAppStore((s) => s.alarmsArmed);
  const setAlarmsArmed = useAppStore((s) => s.setAlarmsArmed);
  const exerciseLogs = useAppStore((s) => s.exerciseLogs);
  const mealMarks = useAppStore((s) => s.mealMarks);
  const lessonsDone = useAppStore((s) => s.lessonsDone);
  const programStart = useAppStore((s) => s.programStart);
  const ensureProgramStart = useAppStore((s) => s.ensureProgramStart);
  const ttcOn = useAppStore((s) => s.ttc.on);
  const moveSettings = useAppStore((s) => s.moveSettings);
  const activeProgram = useAppStore((s) => s.activeProgram);
  const todayMove = useMemo(() => {
    const plan = planToday(moveSettings, activeProgram, logs);
    return buildWorkout(plan.focus, { ...moveSettings, minutes: plan.minutes, lowImpact: plan.lowImpact }, plan.seed, boostFor(plan.week), profile?.weightKg);
  }, [moveSettings, activeProgram, logs, profile?.weightKg]);
  const [arming, setArming] = useState(false);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const phenotype = profile?.phenotype ?? 'mixed';

  useEffect(() => {
    resetWaterIfNeeded();
    resetHabitsIfNeeded();
    resetCouncilIfNeeded();
    resetScheduleIfNeeded();
  }, [resetWaterIfNeeded, resetHabitsIfNeeded, resetCouncilIfNeeded, resetScheduleIfNeeded]);

  useEffect(() => ensureProgramStart(), [ensureProgramStart]);

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

  const armAlarms = async () => {
    setArming(true);
    try {
      const { scheduleReminders } = await import('@/src/features/reminders');
      const n = await scheduleReminders(reminders);
      if (n > 0) {
        setAlarmsArmed(true);
        Alert.alert(
          hi ? 'स्मार्ट रिमाइंडर चालू' : 'Smart reminders on',
          hi ? 'ये आपके प्लान के हिसाब से आएँगे और काम पूरा होने पर चुप हो जाएँगे।' : 'They follow your plan and go quiet once a task is done.',
        );
      } else {
        Alert.alert(
          hi ? 'नोटिफिकेशन बंद हैं' : 'Notifications are off',
          hi ? 'सेटिंग्स में NariCare के नोटिफिकेशन चालू करें।' : 'Turn on notifications for NariCare in Settings.',
          [
            { text: hi ? 'बाद में' : 'Later', style: 'cancel' },
            { text: hi ? 'सेटिंग्स खोलें' : 'Open Settings', onPress: () => void Linking.openSettings() },
          ],
        );
      }
    } catch (e: any) {
      Alert.alert(hi ? 'रिमाइंडर' : 'Reminders', e?.message ?? '');
    } finally {
      setArming(false);
    }
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

  const tip = dailyAiTip(profile, phase, lang);
  const initial = (profile?.name ?? 'N').trim().charAt(0).toUpperCase();
  const todayStr = new Date().toISOString().slice(0, 10);
  const localToday = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const isToday = (d?: string) => !!d && (d.startsWith(localToday) || d.startsWith(todayStr));

  const tasks: { key: string; icon: IconName; title: string; sub: string; href: string; done: boolean; fg: string; bg: string }[] = [
    {
      key: 'eat',
      icon: 'restaurant',
      title: hi ? 'खाएँ: आज की प्लेट' : 'Eat: today’s plate',
      sub: hi ? 'प्रोटीन नाश्ता + आपके खाने के हिसाब से' : 'Protein breakfast, matched to your kitchen',
      href: '/diet',
      done:
        !!scheduleDone['morning_protein'] ||
        Object.entries(mealMarks).some(([k, v]) => k.startsWith(`${localToday}|`) && v === 'ate'),
      fg: '#C4453A',
      bg: '#FFE9E5',
    },
    {
      key: 'move',
      icon: 'fitness',
      title: hi ? `मूव: ${todayMove.minutes} मिनट` : `Move: ${todayMove.minutes} minutes`,
      sub: hi ? `${todayMove.title.hi} · ~${todayMove.kcal} kcal` : `${todayMove.title.en} · ~${todayMove.kcal} kcal`,
      href: '/move?start=1',
      done: exerciseLogs.some((l) => l.completed && isToday(l.date)),
      fg: '#2A8F6A',
      bg: '#E2F4EC',
    },
    {
      key: 'log',
      icon: 'create',
      title: hi ? 'लॉग: 2 मिनट' : 'Log: 2 minutes',
      sub: hi ? 'सबूत बनाएँ कि प्लान काम कर रहा है' : 'Build the proof that your plan works',
      href: '/track',
      done: logs.some((l) => isToday(l.logDate)),
      fg: '#7C5CFF',
      bg: '#EEE9FF',
    },
  ];
  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  const goals = profile?.goals ?? [];
  const week = programWeek(programStart);
  const lesson = nextLesson(week, lessonsDone, goals);

  const proTools: { icon: IconName; label: string; sub: string; href: string; fg: string; bg: string }[] = [
    { icon: 'stats-chart', label: hi ? 'प्रोग्रेस प्रूफ़' : 'Progress proof', sub: hi ? 'वज़न, त्वचा, मूड, पीरियड' : 'Weight, skin, mood, cycles', href: '/progress', fg: '#E24B5A', bg: '#FFE4DE' },
    { icon: 'school', label: hi ? 'PCOS अकादमी' : 'PCOS Academy', sub: hi ? '8 हफ्ते, 2-मिनट पाठ' : '8 weeks, 2-min lessons', href: '/learn', fg: '#2A8F6A', bg: '#E2F4EC' },
    { icon: 'camera', label: hi ? 'थाली स्कैनर' : 'Plate scanner', sub: hi ? 'थाली का PCOS स्कोर' : 'PCOS score for any meal', href: '/plate', fg: '#E8801A', bg: '#FFEFD9' },
    { icon: 'flask', label: hi ? 'लैब डिकोडर' : 'Lab decoder', sub: hi ? 'रिपोर्ट सरल भाषा में' : 'Reports in plain language', href: '/labs', fg: '#7C5CFF', bg: '#EEE9FF' },
    ...(goals.includes('fertility') || ttcOn
      ? [{ icon: 'heart' as IconName, label: hi ? 'कंसीव करने की कोशिश' : 'Trying to conceive', sub: hi ? 'फर्टाइल विंडो, LH टेस्ट' : 'Fertile window, LH tests', href: '/ttc', fg: '#C4453A', bg: '#FFE9E5' }]
      : []),
    { icon: 'document-text', label: hi ? 'डॉक्टर किट' : 'Doctor kit', sub: hi ? 'गाइनी के लिए 1 पेज' : 'One page for your gynae', href: '/doctor-kit', fg: '#0E8A9A', bg: '#DFF4F7' },
    { icon: 'chatbubbles', label: hi ? 'कम्युनिटी' : 'Community', sub: hi ? 'गुमनाम और सुरक्षित' : 'Anonymous & safe', href: '/community', fg: '#4A4F8A', bg: '#EEF0FF' },
  ];

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(380)} style={styles.topRow}>
        <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>{greet(lang)}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {profile?.name ?? (hi ? 'आप' : 'Friend')}
          </Text>
        </View>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={16} color="#E8801A" />
          <Text style={styles.streakText}>{streakDays}</Text>
        </View>
        <Pressable onPress={() => setBadDayMode(true)} style={styles.roundBtn} hitSlop={8}>
          <Ionicons name="moon-outline" size={20} color={colors.ink} />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(420)}>
        <LinearGradient
          colors={[...gradients.hero]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBlob} />
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => router.push('/track')} style={styles.phasePill}>
              <Ionicons name="flower" size={13} color="#fff" />
              <Text style={styles.phaseText}>
                {cycleDay
                  ? `${hi ? 'दिन' : 'Day'} ${cycleDay} · ${phaseInfo.title}`
                  : hi ? 'पीरियड लॉग करें, साइकल सिंक होगा' : 'Log your period to sync your cycle'}
              </Text>
            </Pressable>
            <Text style={styles.heroTitle}>
              {doneCount === 3
                ? hi ? 'आज पूरा! शाबाश' : 'Done for today. Well done.'
                : hi ? 'आज के 3 काम' : 'Your 3 things today'}
            </Text>
            <Text style={styles.heroBody} numberOfLines={3}>
              “{hi ? primary.patientVoiceHi : primary.patientVoice}”
            </Text>
          </View>
          <ProgressRing
            value={pct}
            size={92}
            stroke={9}
            centerText={`${doneCount}/3`}
            label={hi ? 'पूरे' : 'done'}
            progressColor="#fff"
            trackColor="rgba(255,255,255,0.25)"
          />
        </LinearGradient>
      </Animated.View>

      <View style={{ marginTop: spacing.md, gap: 10 }}>
        {tasks.map((t, i) => (
          <Animated.View key={t.key} entering={FadeInDown.delay(120 + i * 50).duration(380)}>
            <Pressable onPress={() => router.push(t.href as any)} style={[styles.task, t.done && { opacity: 0.6 }]}>
              <IconBubble name={t.icon} color={t.fg} bg={t.bg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{t.title}</Text>
                <Text style={styles.taskSub}>{t.sub}</Text>
              </View>
              <Ionicons
                name={t.done ? 'checkmark-circle' : 'chevron-forward'}
                size={t.done ? 26 : 20}
                color={t.done ? colors.good : colors.muted}
              />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {lesson ? (
        <Pressable onPress={() => router.push(`/learn/${lesson.id}` as any)} style={styles.lessonCard}>
          <IconBubble name="school" color="#2A8F6A" bg="#E2F4EC" />
          <View style={{ flex: 1 }}>
            <Text style={styles.lessonKicker}>{hi ? `आज का 2-मिनट पाठ · हफ्ता ${week}` : `Today’s 2-min lesson · Week ${week}`}</Text>
            <Text style={styles.lessonTitle}>{hi ? lesson.title.hi : lesson.title.en}</Text>
          </View>
          <Ionicons name="play-circle" size={28} color="#2A8F6A" />
        </Pressable>
      ) : null}

      <TrialWins />

      <Animated.View entering={FadeInDown.delay(300).duration(420)}>
        <Pressable onPress={() => router.push('/coach' as any)}>
          <LinearGradient
            colors={[...gradients.forest]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            <View style={styles.aiHead}>
              <LinearGradient colors={[...gradients.ai]} style={styles.aiBadge}>
                <Ionicons name="sparkles" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.aiKicker}>{hi ? 'आज की AI सलाह' : 'AI insight for today'}</Text>
            </View>
            <Text style={styles.aiTip}>{tip}</Text>
            <View style={styles.aiAsk}>
              <Text style={styles.aiAskText}>{hi ? 'AI कोच से पूछें' : 'Ask your AI coach'}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {!alarmsArmed && (
        <Pressable onPress={armAlarms} style={styles.alarmBanner}>
          <Ionicons name="notifications" size={22} color={colors.blushDeep} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alarmText}>
              {arming ? (hi ? 'चालू हो रहे हैं…' : 'Turning on…') : hi ? 'स्मार्ट रिमाइंडर चालू करें' : 'Turn on smart reminders'}
            </Text>
            <Text style={styles.alarmSub}>
              {hi
                ? 'आपका नाश्ता, आज का मूव और स्ट्रीक, सही समय पर। काम पूरा होते ही चुप।'
                : 'Your breakfast, today’s move and your streak, at the right time. Quiet once done.'}
            </Text>
          </View>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>{hi ? 'आपके इलाज के औज़ार' : 'Your care tools'}</Text>
      <View style={styles.grid}>
        {proTools.map((t) => (
          <Pressable key={t.href} onPress={() => router.push(t.href as any)} style={styles.tile}>
            <IconBubble name={t.icon} color={t.fg} bg={t.bg} />
            <View>
              <Text style={styles.tileLabel} numberOfLines={1}>{t.label}</Text>
              <Text style={styles.tileSub} numberOfLines={2}>{t.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.push('/profile')} style={styles.moreRow}>
        <Text style={styles.moreText}>
          {hi ? 'और टूल्स: फ्लेयर केयर, मेड्स, ग्रोसरी, एग्ज़ाम किट…' : 'More: flare care, meds, grocery, exam kit…'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </Pressable>
    </Screen>
  );
}

const CARD = {
  backgroundColor: '#fff',
  borderRadius: 22,
  ...shadowCard,
  shadowOpacity: 0.07,
  shadowRadius: 14,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  softTop: { marginTop: spacing.sm },
  quietLink: { marginTop: spacing.md },
  link: { fontFamily: fonts.bodyBold, color: colors.blushDeep, fontSize: 14 },
  linkMuted: { fontFamily: fonts.bodyMedium, color: colors.muted, fontSize: 13 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBold, fontSize: 20, color: '#fff' },
  greet: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  name: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.ink, letterSpacing: -0.5 },
  roundBtn: { ...CARD, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  hero: {
    marginTop: spacing.lg,
    borderRadius: 30,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    ...shadowCard,
    shadowColor: '#E24B5A',
    shadowOpacity: 0.3,
  },
  heroBlob: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -60,
    bottom: -70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  phaseText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: '#fff', marginTop: 12, letterSpacing: -0.5 },
  heroBody: { fontStyle: 'italic', fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.92)', marginTop: 6 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    marginTop: 14,
  },
  heroCtaText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.blushDeep },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  stat: { flex: 1, borderRadius: 22, padding: 14, gap: 2 },
  statValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.ink, marginTop: 6, letterSpacing: -0.4 },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted },
  aiCard: { marginTop: spacing.md, borderRadius: 26, padding: spacing.lg, gap: 12 },
  aiHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiBadge: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  aiKicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  aiTip: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24, color: '#fff' },
  aiAsk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiAskText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },
  nextCard: { ...CARD, marginTop: spacing.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionKicker: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted },
  nextTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginTop: 2 },
  nextCta: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.blushDeep },
  alarmBanner: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.blushSoft,
    padding: 14,
    borderRadius: 18,
  },
  alarmText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.blushDeep },
  alarmSub: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.ink, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink, letterSpacing: -0.3, marginTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.sm },
  tile: { ...CARD, width: '48.5%', padding: 14, gap: 10, minHeight: 100 },
  tileLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  tileSub: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, color: colors.muted, marginTop: 2 },
  streakPill: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 42, borderRadius: 21 },
  streakText: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.ink },
  task: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  taskTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  taskSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  lessonCard: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: spacing.md, borderWidth: 1, borderColor: '#CDEBDD' },
  lessonKicker: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: '#2A8F6A' },
  lessonTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginTop: 2 },
  moreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingVertical: 10 },
  moreText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, flex: 1 },
  schedHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  schedRow: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 8 },
  schedTime: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted },
  schedTitle: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
});
