import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Screen } from '@/src/ui/Screen';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Trainer } from '@/src/ui/Trainer';
import { requirePro, useIsPro } from '@/src/features/pro';
import { Ionicons, type IconName } from '@/src/ui/Icon';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { PROGRAMS, PROGRAM_BY_ID, sessionKeys } from '@/src/content/programs';
import { MOVES } from '@/src/content/trainerMoves';
import { buildWorkout, FOCUS_TITLE, type Focus } from '@/src/features/workoutEngine';
import { boostFor, planToday, type PlannedSession } from '@/src/features/todayWorkout';
import { localDate } from '@/src/features/mealPlan';
import { openRoutineVideo } from '@/src/features/videoDemo';

const QUICK: { focus: Focus; min: number; en: string; hi: string; icon: IconName; color: string }[] = [
  { focus: 'cardio', min: 10, en: '10-min fat burn', hi: '10-मिनट फैट बर्न', icon: 'flame', color: '#E8801A' },
  { focus: 'glute_core', min: 15, en: 'Glutes & core', hi: 'ग्लूट्स और कोर', icon: 'body', color: '#E24B5A' },
  { focus: 'full', min: 20, en: 'Full-body strength', hi: 'फुल-बॉडी स्ट्रेंथ', icon: 'barbell', color: '#7C5CFF' },
  { focus: 'yoga', min: 15, en: 'PCOS yoga flow', hi: 'PCOS योग फ्लो', icon: 'leaf', color: '#2A8F6A' },
  { focus: 'mobility', min: 10, en: 'Period-day gentle', hi: 'पीरियड के दिन हल्का', icon: 'water', color: '#C4453A' },
  { focus: 'mobility', min: 5, en: '5-min desk reset', hi: '5-मिनट डेस्क रीसेट', icon: 'desktop', color: '#0E8A9A' },
];

const LEVELS: [1 | 2 | 3, string, string][] = [
  [1, 'Beginner', 'शुरुआती'],
  [2, 'Intermediate', 'मध्यम'],
  [3, 'Advanced', 'एडवांस'],
];

function workoutHref(p: { focus: Focus; minutes: number; seed: string; week: number; lowImpact: boolean; programId?: string; sessionKey?: string; gentle?: boolean }) {
  const q = new URLSearchParams({
    focus: p.focus,
    min: String(p.minutes),
    seed: p.seed,
    week: String(p.week),
    low: p.lowImpact ? '1' : '0',
    ...(p.gentle ? { gentle: '1' } : {}),
    ...(p.programId ? { program: p.programId } : {}),
    ...(p.sessionKey ? { session: p.sessionKey } : {}),
  });
  return `/workout?${q.toString()}`;
}

function WeekRing({ minutes }: { minutes: number }) {
  const size = 92;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, minutes / 150);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.mist} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.good} strokeWidth={stroke} fill="none" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - v)} strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <Text style={styles.ringValue}>{minutes}</Text>
      <Text style={styles.ringLabel}>/150</Text>
    </View>
  );
}

export default function Move() {
  const router = useRouter();
  const pro = useIsPro();
  const { start } = useLocalSearchParams<{ start?: string }>();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const goals = useAppStore((s) => s.profile?.goals ?? []);
  const weightKg = useAppStore((s) => s.profile?.weightKg);
  const settings = useAppStore((s) => s.moveSettings);
  const setMoveSettings = useAppStore((s) => s.setMoveSettings);
  const activeProgram = useAppStore((s) => s.activeProgram);
  const startProgram = useAppStore((s) => s.startProgram);
  const history = useAppStore((s) => s.workoutHistory);
  const logs = useAppStore((s) => s.symptomLogs);
  const [mode, setMode] = useState<'auto' | 'gentle' | 'regular'>('auto');
  const [short, setShort] = useState(false);
  const [editing, setEditing] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [today] = useState(() => localDate());
  const autoStarted = useRef(false);

  const basePlan = useMemo(() => planToday(settings, activeProgram, logs, mode), [settings, activeProgram, logs, mode]);
  const plan: PlannedSession = short ? { ...basePlan, minutes: 10, sessionKey: undefined } : basePlan;
  const workout = useMemo(
    () => buildWorkout(plan.focus, { ...settings, minutes: plan.minutes, lowImpact: plan.lowImpact, periodSafe: plan.gentle }, plan.seed, boostFor(plan.week), weightKg),
    [plan.focus, plan.minutes, plan.lowImpact, plan.gentle, plan.seed, plan.week, settings, weightKg],
  );
  const preview = workout.steps.filter((s, i, a) => s.block === 'main' && a.findIndex((x) => x.exId === s.exId) === i).slice(0, 4);
  const href = workoutHref(plan);

  useEffect(() => {
    if (start === '1' && !autoStarted.current) {
      autoStarted.current = true;
      router.push(href as any);
    }
  }, [start]); // eslint-disable-line react-hooks/exhaustive-deps

  const weekStart = useMemo(() => {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return localDate(d);
  }, [today]);
  const thisWeek = history.filter((h) => h.date >= weekStart);
  const weekMinutes = thisWeek.reduce((a, h) => a + h.minutes, 0);
  const weekKcal = thisWeek.reduce((a, h) => a + h.kcal, 0);
  const streak = useMemo(() => {
    const days = new Set(history.map((h) => h.date));
    let n = 0;
    const d = new Date(`${today}T12:00:00`);
    if (!days.has(today)) d.setDate(d.getDate() - 1);
    while (days.has(localDate(d))) {
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [history, today]);
  const doneToday = history.some((h) => h.date === today);

  const program = activeProgram ? PROGRAM_BY_ID[activeProgram.id] : undefined;
  const programTotal = program ? sessionKeys(program).length : 0;
  const recommended = PROGRAMS.find((p) => p.forGoals.some((g) => goals.includes(g)))?.id ?? 'strength';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{hi ? 'मूव' : 'Move'}</Text>
          <Text style={styles.title}>{hi ? 'आज का वर्कआउट' : 'Today’s workout'}</Text>
        </View>
        <Pressable onPress={() => setEditing((v) => !v)} style={styles.iconBtn}>
          <Ionicons name={editing ? 'checkmark' : 'options-outline'} size={20} color={colors.ink} />
        </Pressable>
      </View>

      {editing && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.card}>
          <Text style={styles.prefTitle}>{hi ? 'लेवल' : 'Level'}</Text>
          <View style={styles.wrap}>
            {LEVELS.map(([l, en, h]) => (
              <Pill key={l} label={hi ? h : en} on={settings.level === l} onPress={() => setMoveSettings({ level: l })} />
            ))}
          </View>
          <Text style={styles.prefTitle}>{hi ? 'रोज़ कितना समय' : 'Time per workout'}</Text>
          <View style={styles.wrap}>
            {[10, 15, 20, 30].map((m) => (
              <Pill key={m} label={`${m} min`} on={settings.minutes === m} onPress={() => setMoveSettings({ minutes: m })} />
            ))}
          </View>
          <Text style={styles.prefTitle}>{hi ? 'घर पर सामान' : 'Equipment at home'}</Text>
          <View style={styles.wrap}>
            {(
              [
                ['dumbbell', 'Dumbbells or water bottles', 'डम्बल या पानी की बोतलें'],
              ] as const
            ).map(([id, en, h]) => (
              <Pill
                key={id}
                label={hi ? h : en}
                on={settings.equipment.includes(id)}
                onPress={() => setMoveSettings({ equipment: settings.equipment.includes(id) ? settings.equipment.filter((e) => e !== id) : [...settings.equipment, id] })}
              />
            ))}
          </View>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>{hi ? 'लो-इम्पैक्ट (बिना कूदे)' : 'Low impact (no jumping)'}</Text>
              <Text style={styles.small}>{hi ? 'घुटनों, पड़ोसियों और ज़्यादा वज़न के लिए।' : 'Kinder to knees, neighbours and heavier bodies.'}</Text>
            </View>
            <Switch value={settings.lowImpact} onValueChange={(v) => setMoveSettings({ lowImpact: v })} trackColor={{ true: colors.good, false: colors.mistDeep }} thumbColor="#fff" />
          </View>
        </Animated.View>
      )}

      <View style={styles.weekCard}>
        <WeekRing minutes={weekMinutes} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.weekTitle}>{hi ? 'इस हफ्ते के मिनट' : 'Active minutes this week'}</Text>
          <Text style={styles.small}>{hi ? 'PCOS गाइडलाइन: हफ्ते में 150 मिनट।' : 'PCOS guideline: 150 minutes a week.'}</Text>
          <View style={styles.weekStats}>
            <MiniStat icon="checkmark-done" value={`${thisWeek.length}`} label={hi ? 'वर्कआउट' : 'workouts'} />
            <MiniStat icon="flame" value={`${weekKcal}`} label="kcal" />
            <MiniStat icon="trending-up" value={`${streak}`} label={hi ? 'दिन स्ट्रीक' : 'day streak'} />
          </View>
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(350)}>
        <LinearGradient colors={plan.gentle ? ['#C4453A', '#8E2E50'] : ['#FF8A7A', '#E24B5A', '#9B3A74']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroKicker}>
            {plan.gentle
              ? hi ? 'आज हल्का दिन · पीरियड/ऐंठन' : 'Gentle day · period or cramps'
              : program && plan.sessionNo
                ? `${hi ? program.title.hi : program.title.en} · ${hi ? 'हफ्ता' : 'Week'} ${plan.week} · ${plan.sessionNo}/${plan.sessionTotal}`
                : hi ? 'आज की पसंद' : 'Today’s pick'}
          </Text>
          <Text style={styles.heroTitle}>{hi ? workout.title.hi : workout.title.en}</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>⏱ {workout.minutes} min</Text>
            <Text style={styles.heroMetaText}>🔥 ~{workout.kcal} kcal</Text>
            <Text style={styles.heroMetaText}>💪 {hi ? LEVELS[settings.level - 1][2] : LEVELS[settings.level - 1][1]}</Text>
          </View>
          <View style={styles.thumbs}>
            {preview.map((s) => (
              <Trainer key={s.exId} moveId={s.exId} style={styles.heroThumb} />
            ))}
          </View>
          <Pressable onPress={() => router.push(href as any)} style={styles.startBtn}>
            <Ionicons name={doneToday ? 'refresh' : 'play'} size={18} color={colors.blushDeep} />
            <Text style={styles.startText}>{doneToday ? (hi ? 'फिर से करें' : 'Do it again') : hi ? 'शुरू करें' : 'Start workout'}</Text>
          </Pressable>
          <View style={styles.heroAlt}>
            <Pressable onPress={() => setMode(basePlan.gentle ? 'regular' : 'gentle')} hitSlop={6}>
              <Text style={styles.heroAltText}>{basePlan.gentle ? (hi ? 'सामान्य वर्कआउट करें' : 'Regular workout instead') : hi ? 'आज हल्का चाहिए' : 'Gentle instead'}</Text>
            </Pressable>
            <Pressable onPress={() => setShort((v) => !v)} hitSlop={6}>
              <Text style={styles.heroAltText}>{short ? (hi ? 'पूरा वर्कआउट' : 'Full length') : hi ? 'सिर्फ़ 10 मिनट' : 'Only 10 min'}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.section}>{hi ? 'आपका प्रोग्राम' : 'Your program'}</Text>
      {program && activeProgram && !browsing ? (
        <View style={styles.card}>
          <Text style={styles.progTitle}>{hi ? program.title.hi : program.title.en}</Text>
          <Text style={styles.small}>{hi ? program.pitch.hi : program.pitch.en}</Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${(activeProgram.done.length / programTotal) * 100}%` }]} />
          </View>
          <Text style={styles.small}>
            {activeProgram.done.length}/{programTotal} {hi ? 'सेशन पूरे · हर हफ्ते थोड़ा कठिन होता है' : 'sessions done · gets a little harder each week'}
          </Text>
          {plan.programDone ? <Text style={styles.doneBadge}>{hi ? '🎉 प्रोग्राम पूरा! अगला चुनें।' : '🎉 Program complete! Pick your next one.'}</Text> : null}
          <Pressable onPress={() => setBrowsing(true)} style={{ marginTop: 10 }}>
            <Text style={styles.link}>{hi ? 'प्रोग्राम बदलें' : 'Change program'}</Text>
          </Pressable>
        </View>
      ) : (
        PROGRAMS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              const go = () => {
                startProgram(p.id);
                setBrowsing(false);
              };
              if (p.id === recommended) go();
              else requirePro('program', go);
            }}
            style={[styles.card, p.id === recommended && styles.recommended]}
          >
            {!pro && p.id !== recommended ? (
              <View style={styles.proTag}>
                <Ionicons name="lock-closed" size={11} color="#7A4A00" />
                <Text style={styles.proTagText}>PRO</Text>
              </View>
            ) : null}
            {p.id === recommended ? <Text style={styles.recBadge}>{hi ? 'आपके लक्ष्य के लिए सुझाया' : 'Recommended for your goal'}</Text> : null}
            <Text style={styles.progTitle}>{hi ? p.title.hi : p.title.en}</Text>
            <Text style={styles.small}>{hi ? p.pitch.hi : p.pitch.en}</Text>
            <Text style={styles.link}>{hi ? 'यह प्रोग्राम शुरू करें →' : 'Start this program →'}</Text>
          </Pressable>
        ))
      )}

      <Text style={styles.section}>{hi ? 'झटपट वर्कआउट' : 'Quick workouts'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {QUICK.map((q) => (
          <Pressable
            key={q.en}
            onPress={() => router.push(workoutHref({ focus: q.focus, minutes: q.min, seed: `${today}|${q.en}`, week: 1, lowImpact: settings.lowImpact }) as any)}
            style={styles.quick}
          >
            <View style={[styles.quickIcon, { backgroundColor: `${q.color}22` }]}>
              <Ionicons name={q.icon} size={20} color={q.color} />
            </View>
            <Text style={styles.quickTitle}>{hi ? q.hi : q.en}</Text>
            <Text style={styles.small}>
              {q.min} min · {hi ? FOCUS_TITLE[q.focus].hi : FOCUS_TITLE[q.focus].en}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable onPress={() => router.push('/exercises' as any)} style={[styles.card, styles.row]}>
        <Ionicons name="library" size={22} color="#7C5CFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.progTitle}>{hi ? 'एक्सरसाइज़ लाइब्रेरी' : 'Exercise library'}</Text>
          <Text style={styles.small}>{hi ? `${MOVES.length} एक्सरसाइज़ और योगासन, ट्रेनर डेमो के साथ` : `${MOVES.length} exercises & yoga poses, demonstrated by your trainer`}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <Pressable onPress={() => void openRoutineVideo('PCOS workout at home', settings.minutes, hi ? 'hi' : 'en')} style={[styles.card, styles.row]}>
        <Ionicons name="logo-youtube" size={22} color="#E62117" />
        <View style={{ flex: 1 }}>
          <Text style={styles.progTitle}>{hi ? 'वीडियो के साथ करें' : 'Follow along on video'}</Text>
          <Text style={styles.small}>{hi ? 'YouTube पर इंस्ट्रक्टर वाले क्लास' : 'Instructor-led classes on YouTube'}</Text>
        </View>
        <Ionicons name="open-outline" size={18} color={colors.muted} />
      </Pressable>

      {history.length > 0 && (
        <>
          <Text style={styles.section}>{hi ? 'हाल के वर्कआउट' : 'Recent workouts'}</Text>
          <View style={styles.card}>
            {history
              .slice(-5)
              .reverse()
              .map((h, i) => (
                <View key={`${h.date}-${i}`} style={styles.histRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.good} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histTitle}>{h.title}</Text>
                    <Text style={styles.small}>
                      {h.date.slice(5)} · {h.minutes} min · {h.kcal} kcal
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </>
      )}

      <Disclaimer lang={hi ? 'hi' : 'en'} />
    </Screen>
  );
}

function Pill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, on && styles.pillOn]}>
      <Text style={[styles.pillText, on && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

function MiniStat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={styles.mini}>
      <Ionicons name={icon} size={14} color={colors.blushDeep} />
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted },
  title: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink, letterSpacing: -0.6 },
  iconBtn: { ...CARD, width: 44, height: 44, borderRadius: 22, padding: 0, alignItems: 'center', justifyContent: 'center' },
  card: { ...CARD, marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted, marginTop: 10, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.mist },
  pillOn: { backgroundColor: colors.forest },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  pillTextOn: { color: '#fff', fontFamily: fonts.bodyBold },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  switchTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.muted },
  weekCard: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: spacing.md },
  ringValue: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink },
  ringLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted, marginTop: -4 },
  weekTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  weekStats: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 },
  mini: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  miniLabel: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  hero: { borderRadius: 28, padding: spacing.lg, marginTop: spacing.md, gap: 8 },
  heroKicker: { fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 26, color: '#fff', letterSpacing: -0.5 },
  heroMeta: { flexDirection: 'row', gap: 14 },
  heroMetaText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff' },
  thumbs: { flexDirection: 'row', gap: 8, marginTop: 4 },
  heroThumb: { flex: 1, aspectRatio: 1, borderRadius: 14, backgroundColor: '#FFF3F0', overflow: 'hidden' },
  proTag: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFC857', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, zIndex: 2 },
  proTagText: { fontFamily: fonts.bodyBold, fontSize: 10.5, color: '#7A4A00', letterSpacing: 0.4 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 14, marginTop: 6 },
  startText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.blushDeep },
  heroAlt: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  heroAltText: { fontFamily: fonts.bodyBold, fontSize: 13, color: 'rgba(255,255,255,0.9)', textDecorationLine: 'underline' },
  section: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.ink, marginTop: spacing.lg, letterSpacing: -0.3 },
  progTitle: { fontFamily: fonts.bodyBold, fontSize: 15.5, color: colors.ink, marginBottom: 4 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.blushSoft, marginVertical: 10, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.blushDeep },
  doneBadge: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.good, marginTop: 8 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.blushDeep, marginTop: 8 },
  recommended: { borderWidth: 2, borderColor: colors.blushDeep },
  recBadge: { alignSelf: 'flex-start', fontFamily: fonts.bodyBold, fontSize: 11, color: '#fff', backgroundColor: colors.blushDeep, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', marginBottom: 8 },
  quick: { ...CARD, width: 150, gap: 6 },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  histTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
