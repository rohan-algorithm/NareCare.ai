import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen } from '@/src/ui/Screen';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Ionicons, type IconName } from '@/src/ui/Icon';
import { colors, fonts, mealSlotAccent, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { livingContextLabel } from '@/src/content/meals';
import { CANTEEN_SWAPS } from '@/src/content/canteenSwaps';
import type { Slot } from '@/src/content/mealLibrary';
import {
  localDate,
  nextSwap,
  planForDate,
  prefsFrom,
  proteinTarget,
  SLOTS,
  weekDates,
} from '@/src/features/mealPlan';
import { openRecipeVideo } from '@/src/features/videoDemo';
import type { CuisinePreference, DietPreference, LivingContext } from '@/src/types';

const SLOT_LABEL: Record<Slot, [string, string]> = {
  breakfast: ['Breakfast', 'नाश्ता'],
  midMorning: ['Mid-morning', 'बीच सुबह'],
  lunch: ['Lunch', 'दोपहर'],
  evening: ['Evening', 'शाम'],
  dinner: ['Dinner', 'रात'],
};

const DIETS: [DietPreference, string, string][] = [
  ['vegetarian', 'Vegetarian', 'शाकाहारी'],
  ['eggetarian', 'Eggetarian', 'अंडा + शाकाहारी'],
  ['non_veg', 'Non-veg', 'मांसाहारी'],
  ['vegan', 'Vegan', 'वीगन'],
  ['jain', 'Jain', 'जैन'],
];
const CUISINES: [CuisinePreference, string, string][] = [
  ['north_indian', 'North Indian', 'उत्तर भारतीय'],
  ['south_indian', 'South Indian', 'दक्षिण भारतीय'],
  ['bengali', 'Bengali', 'बंगाली'],
  ['gujarati', 'Gujarati', 'गुजराती'],
  ['pan_indian', 'Mix of all', 'सब मिलाकर'],
];
const KITCHENS: LivingContext[] = ['family_kitchen', 'hostel_mess', 'tiffin', 'eating_out'];
const ALLERGIES: [string, string][] = [['Gluten', 'ग्लूटेन'], ['Dairy', 'डेयरी'], ['Nuts', 'नट्स'], ['Soy', 'सोया']];
const DISLIKES: [string, string][] = [
  ['Paneer', 'पनीर'], ['Oats', 'ओट्स'], ['Millet', 'मिलेट'], ['Soya', 'सोया चंक'], ['Rajma', 'राजमा'],
  ['Bhindi', 'भिंडी'], ['Lauki', 'लौकी'], ['Sattu', 'सत्तू'], ['Tofu', 'टोफू'], ['Fish', 'मछली'],
];

function dayLabel(date: string, today: string, hi: boolean): string {
  if (date === today) return hi ? 'आज' : 'Today';
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { weekday: 'short' });
}

export default function Diet() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const mealMarks = useAppStore((s) => s.mealMarks);
  const markMeal = useAppStore((s) => s.markMeal);
  const mealSwaps = useAppStore((s) => s.mealSwaps);
  const swapMeal = useAppStore((s) => s.swapMeal);
  const updateFoodPrefs = useAppStore((s) => s.updateFoodPrefs);
  const hi = profile?.language === 'hi';
  const lang = hi ? 'hi' : 'en';
  const seed = profile?.name ?? 'naricare';
  const [today] = useState(() => localDate());
  const [date, setDate] = useState(today);
  const [editing, setEditing] = useState(false);
  const dates = useMemo(() => weekDates(today), [today]);
  const prefs = useMemo(() => prefsFrom(profile), [profile]);
  const plan = useMemo(() => planForDate(prefs, date, seed, mealSwaps), [prefs, date, seed, mealSwaps]);

  const target = proteinTarget(profile?.weightKg);
  const planned = SLOTS.reduce((a, s) => a + (plan[s]?.proteinG ?? 0), 0);
  const eaten = SLOTS.reduce((a, s) => a + (mealMarks[`${date}|${s}`] === 'ate' ? (plan[s]?.proteinG ?? 0) : 0), 0);
  const shown = date === today ? eaten : planned;
  const ateCount = SLOTS.filter((s) => mealMarks[`${date}|${s}`] === 'ate').length;
  const showCanteen = prefs.context === 'hostel_mess' || prefs.context === 'eating_out';

  const swap = (slot: Slot) => {
    const used = SLOTS.filter((s) => s !== slot).map((s) => plan[s]?.id ?? '');
    const next = nextSwap(slot, prefs, plan[slot]?.id, used);
    if (next) swapMeal(date, slot, next.id);
  };

  const toggleList = (key: 'allergies' | 'dislikes', v: string) => {
    const cur = profile?.[key] ?? [];
    updateFoodPrefs({ [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  const dietLabel = DIETS.find((d) => d[0] === prefs.diet);
  const cuisineLabel = CUISINES.find((c) => c[0] === prefs.cuisine);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{hi ? 'आपका खाना' : 'Your food plan'}</Text>
          <Text style={styles.title}>{hi ? 'आज की प्लेट' : 'Today’s plate'}</Text>
        </View>
        <Pressable onPress={() => setEditing((v) => !v)} style={styles.editBtn}>
          <Ionicons name={editing ? 'checkmark' : 'options-outline'} size={18} color={colors.ink} />
          <Text style={styles.editText}>{editing ? (hi ? 'हो गया' : 'Done') : hi ? 'पसंद बदलें' : 'Preferences'}</Text>
        </Pressable>
      </View>

      <View style={styles.tags}>
        <Tag icon="leaf" text={dietLabel ? (hi ? dietLabel[2] : dietLabel[1]) : ''} />
        <Tag icon="map" text={cuisineLabel ? (hi ? cuisineLabel[2] : cuisineLabel[1]) : ''} />
        <Tag icon="home" text={livingContextLabel(prefs.context, lang)} />
      </View>

      <Pressable onPress={() => router.push('/plate' as any)} style={styles.scan}>
        <Ionicons name="camera" size={22} color="#E8801A" />
        <View style={{ flex: 1 }}>
          <Text style={styles.scanTitle}>{hi ? 'थाली स्कैन करें' : 'Scan any plate'}</Text>
          <Text style={styles.scanSub}>{hi ? 'घर, मेस या शादी: PCOS स्कोर + एक सुधार' : 'Home, mess or a wedding: PCOS score + one fix'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      {editing && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.card}>
          <PrefGroup title={hi ? 'डाइट' : 'Diet'}>
            {DIETS.map(([id, en, h]) => (
              <Pill key={id} label={hi ? h : en} on={prefs.diet === id} onPress={() => updateFoodPrefs({ dietPreference: id })} />
            ))}
          </PrefGroup>
          <PrefGroup title={hi ? 'स्वाद' : 'Cuisine'}>
            {CUISINES.map(([id, en, h]) => (
              <Pill key={id} label={hi ? h : en} on={prefs.cuisine === id} onPress={() => updateFoodPrefs({ cuisinePreference: id })} />
            ))}
          </PrefGroup>
          <PrefGroup title={hi ? 'आप कहाँ खाती हैं' : 'Where you eat'}>
            {KITCHENS.map((k) => (
              <Pill key={k} label={livingContextLabel(k, lang)} on={prefs.context === k} onPress={() => updateFoodPrefs({ livingContext: k })} />
            ))}
          </PrefGroup>
          <PrefGroup title={hi ? 'एलर्जी (कभी नहीं दिखेगा)' : 'Allergies (never shown)'}>
            {ALLERGIES.map(([en, h]) => (
              <Pill key={en} label={hi ? h : en} on={prefs.allergies.includes(en)} onPress={() => toggleList('allergies', en)} />
            ))}
          </PrefGroup>
          <PrefGroup title={hi ? 'पसंद नहीं' : 'Don’t like'}>
            {DISLIKES.map(([en, h]) => (
              <Pill key={en} label={hi ? h : en} on={prefs.dislikes.includes(en)} onPress={() => toggleList('dislikes', en)} />
            ))}
          </PrefGroup>
        </Animated.View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }} contentContainerStyle={{ gap: 8 }}>
        {dates.map((d) => {
          const on = d === date;
          return (
            <Pressable key={d} onPress={() => setDate(d)} style={[styles.day, on && styles.dayOn]}>
              <Text style={[styles.dayTop, on && styles.dayTextOn]}>{dayLabel(d, today, hi)}</Text>
              <Text style={[styles.dayNum, on && styles.dayTextOn]}>{Number(d.slice(8))}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <LinearGradient colors={['#2A3D38', '#3D6B5C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroRow}>
          <Stat value={`${shown}g`} label={date === today ? (hi ? 'प्रोटीन खाया' : 'protein eaten') : hi ? 'प्रोटीन प्लान' : 'protein planned'} />
          <Stat value={`${target}g`} label={hi ? 'रोज़ का लक्ष्य' : 'daily goal'} />
          <Stat value={`${ateCount}/5`} label={hi ? 'खाना हुआ' : 'meals done'} />
        </View>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.min(100, Math.round((shown / target) * 100))}%` }]} />
        </View>
        <Text style={styles.heroFoot}>
          {hi ? `आपके वज़न के हिसाब से ~${target}g प्रोटीन।` : `~${target}g protein, set from your weight.`}
        </Text>
      </LinearGradient>

      {SLOTS.map((slot, i) => {
        const meal = plan[slot];
        if (!meal) return null;
        const key = `${date}|${slot}`;
        const status = mealMarks[key];
        const accent = mealSlotAccent[slot];
        return (
          <Animated.View key={`${slot}-${meal.id}`} entering={FadeInDown.delay(40 * i).duration(320)} style={[styles.card, status === 'ate' && { opacity: 0.75 }]}>
            <View style={styles.mealTop}>
              <View style={[styles.slotPill, { backgroundColor: accent.bg }]}>
                <Text style={[styles.slotText, { color: accent.ink }]}>{hi ? SLOT_LABEL[slot][1] : SLOT_LABEL[slot][0]}</Text>
              </View>
              <Text style={styles.macro}>
                {hi ? 'प्रोटीन' : 'Protein'} {meal.proteinG}g · {hi ? 'फाइबर' : 'Fibre'} {meal.fiberG}g
              </Text>
            </View>
            <Text style={styles.mealName}>{hi ? meal.nameHi : meal.name}</Text>
            <Text style={styles.benefit}>{hi ? meal.benefitHi : meal.benefit}</Text>
            <View style={styles.actions}>
              <Action
                icon={status === 'ate' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                label={hi ? 'खाया' : 'Ate'}
                active={status === 'ate'}
                onPress={() => markMeal(key, 'ate')}
              />
              <Action icon="swap-horizontal" label={hi ? 'बदलें' : 'Swap'} onPress={() => swap(slot)} />
              <Action
                icon="close-circle-outline"
                label={hi ? 'छोड़ा' : 'Skipped'}
                active={status === 'skipped'}
                onPress={() => markMeal(key, 'skipped')}
              />
              {meal.cook ? (
                <Pressable onPress={() => void openRecipeVideo(meal.cook as string, lang)} style={styles.cook}>
                  <Ionicons name="logo-youtube" size={16} color="#E62117" />
                  <Text style={styles.cookText}>{hi ? 'बनाना देखें' : 'How to cook'}</Text>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        );
      })}

      <Pressable onPress={() => router.push('/tonight')} style={{ marginTop: spacing.md }}>
        <LinearGradient colors={['#FF8A7A', '#E24B5A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tonight}>
          <Ionicons name="moon" size={20} color="#fff" />
          <Text style={styles.tonightText}>{hi ? 'रात को क्या खाऊँ? जल्दी जवाब' : 'What do I eat tonight? Quick answer'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </LinearGradient>
      </Pressable>

      {showCanteen && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{hi ? 'क्रेविंग? कम-बुरा विकल्प' : 'Craving? The least-bad swap'}</Text>
          {CANTEEN_SWAPS.map((s) => (
            <View key={s.craving} style={styles.swapRow}>
              <Text style={styles.swapFrom}>{hi ? s.cravingHi : s.craving}</Text>
              <Text style={styles.swapTo}>→ {hi ? s.swapHi : s.swap}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={() => router.push('/grocery')} style={styles.grocery}>
        <Ionicons name="cart" size={18} color={colors.blushDeep} />
        <Text style={styles.groceryText}>{hi ? 'इस हफ्ते की ग्रोसरी लिस्ट' : 'This week’s grocery list'}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      <Disclaimer lang={lang} />
    </Screen>
  );
}

function Tag({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={13} color={colors.forest} />
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

function PrefGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.prefTitle}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

function Pill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, on && styles.pillOn]}>
      <Text style={[styles.pillText, on && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Action({ icon, label, active, onPress }: { icon: IconName; label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.action, active && styles.actionOn]} hitSlop={4}>
      <Ionicons name={icon} size={16} color={active ? '#fff' : colors.ink} />
      <Text style={[styles.actionText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted },
  title: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink, letterSpacing: -0.6 },
  editBtn: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  editText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E6F2ED', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.forest },
  card: { ...CARD, marginTop: spacing.sm },
  prefTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.mist },
  pillOn: { backgroundColor: colors.forest },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  pillTextOn: { color: '#fff', fontFamily: fonts.bodyBold },
  day: { width: 58, paddingVertical: 10, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  dayOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  dayTop: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.muted },
  dayNum: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink, marginTop: 2 },
  dayTextOn: { color: '#fff' },
  hero: { borderRadius: 24, padding: spacing.md, marginTop: spacing.md, gap: 10 },
  heroRow: { flexDirection: 'row' },
  statValue: { fontFamily: fonts.displayBold, fontSize: 22, color: '#fff' },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: 'rgba(255,255,255,0.7)' },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: '#9FE0C4' },
  heroFoot: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  slotText: { fontFamily: fonts.bodyBold, fontSize: 11.5 },
  macro: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.muted },
  mealName: { fontFamily: fonts.bodyBold, fontSize: 16.5, color: colors.ink, marginTop: 8, lineHeight: 22 },
  benefit: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.mist },
  actionOn: { backgroundColor: colors.good },
  actionText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  cook: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: '#FFF0F0' },
  cookText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#C4161C' },
  tonight: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 20, padding: 16 },
  tonightText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: '#fff' },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  swapRow: { paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  swapFrom: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  swapTo: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  scan: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: spacing.md, borderWidth: 1, borderColor: '#FFE0BF' },
  scanTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  scanSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  grocery: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
  groceryText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
