import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { Chip } from '@/src/ui/Chip';
import { Card } from '@/src/ui/Card';
import { Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, mealSlotAccent, radii, shadow, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import {
  NORTH_INDIAN_WEEK,
  livingContextLabel,
  resolveMealForContext,
} from '@/src/content/meals';
import { CANTEEN_SWAPS } from '@/src/content/canteenSwaps';
import { Disclaimer } from '@/src/ui/Disclaimer';
import type { LivingContext } from '@/src/types';

const SLOTS = [
  ['breakfast', 'Breakfast', 'सुबह'],
  ['midMorning', 'Snack', 'नाश्ता'],
  ['lunch', 'Lunch', 'दोपहर'],
  ['evening', 'Evening', 'शाम'],
  ['dinner', 'Dinner', 'रात'],
] as const;

export default function Diet() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const setLivingContext = useAppStore((s) => s.setLivingContext);
  const mealMarks = useAppStore((s) => s.mealMarks);
  const markMeal = useAppStore((s) => s.markMeal);

  const ctx = profile?.livingContext ?? 'family_kitchen';
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const dayIndex = (new Date().getDate() - 1) % 7;
  const plan = NORTH_INDIAN_WEEK[dayIndex];
  const showCanteen = ctx === 'hostel_mess' || ctx === 'eating_out';

  const dayTotals = useMemo(() => {
    let cal = 0;
    let protein = 0;
    let fiber = 0;
    let done = 0;
    for (const [key] of SLOTS) {
      const meal = resolveMealForContext(plan[key], ctx);
      cal += meal.calories;
      protein += meal.proteinG;
      fiber += meal.fiberG;
      if (mealMarks[`${plan.day}-${key}`] === 'ate') done += 1;
    }
    return { cal, protein, fiber, done };
  }, [plan, ctx, mealMarks]);

  const proteinTarget = 75;
  const proteinPct = Math.min(100, Math.round((dayTotals.protein / proteinTarget) * 100));

  return (
    <Screen scroll variant="immersive">
      <ScreenHeader
        door={hi ? 'खाएँ' : 'Eat'}
        title={hi ? 'आज की प्लेट' : 'Today’s plate'}
        subtitle={livingContextLabel(ctx, hi ? 'hi' : 'en')}
      />

      <LinearGradient
        colors={['#2A3D38', '#3D6B5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dayHero}
      >
        <Label style={{ color: 'rgba(255,255,255,0.55)' }}>
          {hi ? `दिन ${plan.day}` : `Day ${plan.day}`}
        </Label>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroNum}>{dayTotals.cal}</Text>
            <Text style={styles.heroUnit}>kcal</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroNum}>{dayTotals.protein}g</Text>
            <Text style={styles.heroUnit}>{hi ? 'प्रोटीन' : 'protein'}</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroNum}>{dayTotals.fiber}g</Text>
            <Text style={styles.heroUnit}>{hi ? 'फाइबर' : 'fiber'}</Text>
          </View>
        </View>
        <View style={styles.proteinTrack}>
          <View style={styles.proteinHead}>
            <Text style={styles.proteinLabel}>
              {hi ? 'प्रोटीन लक्ष्य' : 'Protein goal'} · {proteinTarget}g
            </Text>
            <Text style={styles.proteinPct}>{proteinPct}%</Text>
          </View>
          <View style={styles.proteinBar}>
            <View style={[styles.proteinFill, { width: `${proteinPct}%` }]} />
          </View>
        </View>
        <Text style={styles.heroFoot}>
          {dayTotals.done}/5 {hi ? 'प्लेट्स' : 'plates'}
        </Text>
      </LinearGradient>

      <Pressable onPress={() => router.push('/tonight')} style={styles.tonightCta}>
        <LinearGradient colors={['#FF7A6A', '#E25548']} style={styles.tonightGrad}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tonightTitle}>
              {hi ? 'रात को क्या खाऊँ?' : 'What do I eat tonight?'}
            </Text>
          </View>
          <Text style={styles.tonightArrow}>→</Text>
        </LinearGradient>
      </Pressable>

      <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        {hi ? 'आप कहाँ खाती हो' : 'Where you eat'}
      </Label>
      <View style={styles.wrap}>
        {(
          ['family_kitchen', 'hostel_mess', 'tiffin', 'eating_out'] as LivingContext[]
        ).map((c) => (
          <Chip
            key={c}
            label={livingContextLabel(c, hi ? 'hi' : 'en')}
            selected={ctx === c}
            tone="gold"
            onPress={() => setLivingContext(c)}
          />
        ))}
      </View>

      <Label style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        {hi ? 'मील चार्ट' : 'Meal chart'}
      </Label>

      {SLOTS.map(([key, label, hiLabel], i) => {
        const mealId = plan[key];
        const meal = resolveMealForContext(mealId, ctx);
        const markKey = `${plan.day}-${key}`;
        const status = mealMarks[markKey];
        const accent = mealSlotAccent[key];
        return (
          <Animated.View key={key} entering={FadeInDown.delay(50 * i).duration(380)}>
            <View style={[styles.mealCard, shadow.soft]}>
              <View style={[styles.mealAccent, { backgroundColor: accent.bar }]} />
              <View style={styles.mealBody}>
                <View style={styles.mealTop}>
                  <View style={[styles.slotPill, { backgroundColor: accent.bg }]}>
                    <Text style={[styles.slotPillText, { color: accent.ink }]}>
                      {hi ? hiLabel : label}
                    </Text>
                  </View>
                  <Text style={styles.kcalInline}>
                    {meal.calories} kcal · P{meal.proteinG} · F{meal.fiberG}
                  </Text>
                </View>
                <Title style={{ marginTop: spacing.sm, fontSize: 18 }}>
                  {hi ? meal.nameHi : meal.name}
                </Title>
                <Muted style={{ marginTop: 4 }} numberOfLines={2}>
                  {meal.pcosBenefit}
                </Muted>

                <View style={styles.actions}>
                  {(
                    [
                      ['ate', 'Ate', 'खाया'],
                      ['swapped', 'Swapped', 'बदला'],
                      ['skipped', 'Skipped', 'छोड़ा'],
                    ] as const
                  ).map(([s, en, hiMark]) => (
                    <Pressable
                      key={s}
                      onPress={() => markMeal(markKey, s)}
                      style={[styles.mark, status === s && styles.markOn]}
                    >
                      <Text style={[styles.markText, status === s && styles.markTextOn]}>
                        {hi ? hiMark : en}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        );
      })}

      {showCanteen && (
        <>
          <Label style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
            {hi ? 'रात की कैंटीन' : 'Late-night canteen'}
          </Label>
          {CANTEEN_SWAPS.map((s) => (
            <Card key={s.craving} tone="rose" style={{ marginBottom: spacing.sm }}>
              <Title style={{ fontSize: 15 }}>{hi ? s.cravingHi : s.craving}</Title>
              <Muted style={{ marginTop: 6 }}>→ {hi ? s.swapHi : s.swap}</Muted>
            </Card>
          ))}
        </>
      )}

      <Pressable onPress={() => router.push('/grocery')} style={{ marginBottom: spacing.md, marginTop: spacing.sm }}>
        <Text style={styles.groceryLink}>
          {hi ? 'इस हफ़्ते की किराना →' : 'This week’s grocery →'}
        </Text>
      </Pressable>
      <Disclaimer lang={lang} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayHero: {
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.lift,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroNum: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.white,
    letterSpacing: -0.5,
  },
  heroUnit: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  proteinTrack: { marginTop: spacing.lg },
  proteinHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  proteinLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  proteinPct: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.amber },
  proteinBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  proteinFill: { height: 10, backgroundColor: colors.amber, borderRadius: 5 },
  heroFoot: {
    marginTop: spacing.md,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  tonightCta: { marginTop: spacing.lg, borderRadius: radii.xl, overflow: 'hidden', ...shadow.soft },
  tonightGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tonightTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.white,
  },
  tonightArrow: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.white },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  mealAccent: { width: 6 },
  mealBody: { flex: 1, padding: spacing.md },
  mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  slotPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  kcalInline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.muted,
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  mark: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.mist,
  },
  markOn: { backgroundColor: colors.blushDeep },
  markText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ink },
  markTextOn: { color: colors.white },
  groceryLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.blushDeep,
  },
});
