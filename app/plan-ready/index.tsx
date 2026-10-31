import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@/src/ui/Icon';
import { Trainer } from '@/src/ui/Trainer';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { PROGRAMS } from '@/src/content/programs';
import { localDate, planForDate, prefsFrom, proteinTarget } from '@/src/features/mealPlan';
import { phenotypeLabel } from '@/src/features/phenotype';
import { waterGoal } from '@/src/features/water';
import { buildWorkout, FOCUS_TITLE } from '@/src/features/workoutEngine';
import { useAppStore } from '@/src/store/useAppStore';

const DIET: Record<string, [string, string]> = {
  vegetarian: ['vegetarian', 'शाकाहारी'],
  eggetarian: ['eggetarian', 'अंडा-शाकाहारी'],
  non_veg: ['non-veg', 'मांसाहारी'],
  vegan: ['vegan', 'वीगन'],
  jain: ['Jain', 'जैन'],
};

/** After the quiz: shows her plan being built, then the plan itself, before any price. */
export default function PlanReady() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.moveSettings);
  const startProgram = useAppStore((s) => s.startProgram);
  const markPaywallSeen = useAppStore((s) => s.markPaywallSeen);
  const hi = profile?.language === 'hi';
  const [done, setDone] = useState(0);

  const goals = profile?.goals ?? [];
  const program = PROGRAMS.find((p) => p.forGoals.some((g) => goals.includes(g))) ?? PROGRAMS[1];
  const plan = useMemo(() => planForDate(prefsFrom(profile), localDate(), profile?.name ?? 'naricare', {}), [profile]);
  const workout = useMemo(
    () => buildWorkout(program.sessions[0], { ...settings, minutes: program.minutes, lowImpact: !!program.lowImpact }, `${localDate()}|first`),
    [program, settings],
  );
  const diet = DIET[profile?.dietPreference ?? 'vegetarian'] ?? DIET.vegetarian;
  const cuisine = (profile?.cuisinePreference ?? 'north_indian')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const steps = [
    hi ? `${diet[1]} · ${cuisine} खाने से मिलान` : `Matching meals to ${diet[0]} · ${cuisine}`,
    hi ? `प्रोटीन लक्ष्य ${proteinTarget(profile?.weightKg)}g/दिन` : `Protein target ${proteinTarget(profile?.weightKg)} g a day`,
    hi ? `प्रोग्राम चुना: ${program.title.hi}` : `Choosing your program: ${program.title.en}`,
    hi ? `पानी लक्ष्य ${waterGoal(profile?.weightKg)} गिलास` : `Water goal: ${waterGoal(profile?.weightKg)} glasses`,
    hi ? 'आपके दिन के हिसाब से रिमाइंडर' : 'Fitting reminders around your day',
  ];

  useEffect(() => {
    if (done >= steps.length) return;
    const t = setTimeout(() => setDone((d) => d + 1), 650);
    return () => clearTimeout(t);
  }, [done, steps.length]);

  useEffect(() => {
    startProgram(program.id);
  }, [program.id, startProgram]);

  const ready = done >= steps.length;
  const timeline = [
    [hi ? 'हफ्ता 1–2' : 'Week 1–2', hi ? 'स्थिर ऊर्जा, कम क्रेविंग, रोज़ की आदत' : 'Steadier energy, fewer cravings, a daily routine'],
    [hi ? 'हफ्ता 4' : 'Week 4', hi ? 'पहला प्रोग्रेस चार्ट: वज़न/कमर, मूड, लक्षण' : 'Your first progress chart: waist, mood, symptoms'],
    [hi ? 'हफ्ता 8–12' : 'Week 8–12', hi ? 'कई महिलाओं को साइकल और त्वचा में बदलाव दिखता है' : 'Many women start to see changes in cycles and skin'],
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={[styles.pad, { paddingTop: insets.top + 16, paddingBottom: 180 }]}>
        <Text style={styles.kicker}>{ready ? (hi ? 'आपका प्लान तैयार है' : 'Your plan is ready') : hi ? 'आपका प्लान बन रहा है…' : 'Building your plan…'}</Text>
        <Text style={styles.title}>
          {profile?.name
            ? `${profile.name}, ${hi ? 'यह सिर्फ़ आपके लिए है' : 'this is made for you'}`
            : hi
              ? 'यह सिर्फ़ आपके लिए है'
              : 'This is made for you'}
        </Text>

        <View style={styles.card}>
          {steps.map((s, i) => (
            <View key={s} style={[styles.stepRow, i >= done && { opacity: i === done ? 0.7 : 0.3 }]}>
              <Ionicons name={i < done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={i < done ? colors.good : colors.muted} />
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>

        {ready ? (
          <Animated.View entering={FadeInDown.duration(450)}>
            <View style={styles.focusPill}>
              <Ionicons name="pulse" size={14} color={colors.blushDeep} />
              <Text style={styles.focusText}>{phenotypeLabel(profile?.phenotype ?? 'mixed', hi ? 'hi' : 'en')}</Text>
            </View>

            <Text style={styles.section}>{hi ? 'आज की थाली' : 'Day 1 on your plate'}</Text>
            <View style={styles.card}>
              {(['breakfast', 'lunch', 'dinner'] as const).map((slot) => {
                const m = plan[slot];
                if (!m) return null;
                return (
                  <View key={slot} style={styles.mealRow}>
                    <Text style={styles.mealSlot}>{slot === 'breakfast' ? (hi ? 'नाश्ता' : 'Breakfast') : slot === 'lunch' ? (hi ? 'लंच' : 'Lunch') : hi ? 'डिनर' : 'Dinner'}</Text>
                    <Text style={styles.mealName}>{hi ? m.nameHi : m.name}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.section}>{hi ? 'आपका पहला वर्कआउट' : 'Your first workout'}</Text>
            <View style={[styles.card, styles.workout]}>
              <Trainer moveId={workout.steps.find((s) => s.block === 'main')?.exId ?? 'squat'} style={styles.workoutAnim} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>{hi ? program.title.hi : program.title.en}</Text>
                <Text style={styles.small}>
                  {hi ? FOCUS_TITLE[program.sessions[0]].hi : FOCUS_TITLE[program.sessions[0]].en} · {workout.minutes} min
                </Text>
                <Text style={styles.small}>{hi ? 'घर पर, ट्रेनर और आवाज़ के साथ' : 'At home, with a trainer and voice coach'}</Text>
              </View>
            </View>

            <Text style={styles.section}>{hi ? 'क्या उम्मीद करें' : 'What to expect'}</Text>
            <View style={styles.card}>
              {timeline.map(([w, t], i) => (
                <View key={w} style={styles.tlRow}>
                  <View style={styles.tlDot}>
                    <Text style={styles.tlNum}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tlWeek}>{w}</Text>
                    <Text style={styles.small}>{t}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.fine}>
                {hi
                  ? 'नतीजे हर किसी के अलग होते हैं। यह इलाज नहीं, आपके डॉक्टर के साथ चलने वाला साथी है।'
                  : 'Results differ for everyone. This is a companion alongside your doctor, not a treatment.'}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      {ready ? (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable onPress={() => router.replace('/paywall')} style={styles.cta}>
            <LinearGradient colors={['#FF7A6A', '#E24B5A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaFill}>
              <Text style={styles.ctaText}>{hi ? 'पूरा प्लान अनलॉक करें' : 'Unlock my full plan'}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => {
              markPaywallSeen();
              router.replace('/home');
            }}
            hitSlop={8}
          >
            <Text style={styles.later}>{hi ? 'अभी फ्री वर्ज़न से शुरू करें' : 'Start with the free version'}</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 20, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  pad: { paddingHorizontal: spacing.lg },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.blushDeep },
  title: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 34, color: colors.ink, letterSpacing: -0.6, marginTop: 6 },
  card: { ...CARD, padding: 14, gap: 10, marginTop: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.ink, textTransform: 'none' },
  focusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.blushSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: spacing.md },
  focusText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.blushDeep },
  section: { fontFamily: fonts.bodyBold, fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted, marginTop: spacing.lg },
  mealRow: { gap: 2 },
  mealSlot: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.blushDeep, textTransform: 'uppercase', letterSpacing: 0.4 },
  mealName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  workout: { flexDirection: 'row', alignItems: 'center' },
  workoutAnim: { width: 96, height: 90, borderRadius: 14, backgroundColor: '#FFF3F0', overflow: 'hidden' },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 2 },
  tlRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tlDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.blushSoft, alignItems: 'center', justifyContent: 'center' },
  tlNum: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.blushDeep },
  tlWeek: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  fine: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, color: colors.muted },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: 12, gap: 12, alignItems: 'center', backgroundColor: 'rgba(255,248,246,0.97)', borderTopWidth: 1, borderTopColor: colors.line },
  cta: { alignSelf: 'stretch', borderRadius: 999, overflow: 'hidden' },
  ctaFill: { paddingVertical: 17, alignItems: 'center' },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 17, color: '#fff' },
  later: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
});
