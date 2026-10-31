import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Trainer } from '@/src/ui/Trainer';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { MOVES, type TrainerMove } from '@/src/content/trainerMoves';
import { openMoveDemo } from '@/src/features/videoDemo';

const PARTS: [string, string, string, (e: TrainerMove) => boolean][] = [
  ['all', 'All', 'सब', () => true],
  ['yoga', 'Yoga', 'योग', (e) => e.kind === 'yoga'],
  ['legs', 'Legs & glutes', 'पैर-ग्लूट्स', (e) => e.kind === 'strength' && (e.part === 'legs' || e.part === 'glutes')],
  ['core', 'Core', 'कोर', (e) => e.kind === 'strength' && e.part === 'core'],
  ['upper', 'Upper body', 'ऊपरी शरीर', (e) => e.kind === 'strength' && e.part === 'upper'],
  ['cardio', 'Cardio', 'कार्डियो', (e) => e.kind === 'cardio'],
  ['stretch', 'Stretch', 'स्ट्रेच', (e) => e.kind === 'stretch'],
];
const EQS: [string, string, string][] = [
  ['any', 'Any equipment', 'कोई भी'],
  ['none', 'No equipment', 'बिना सामान'],
  ['dumbbell', 'Dumbbells', 'डम्बल'],
  ['knee', 'Knee-friendly', 'घुटनों के लिए आसान'],
];

export default function Exercises() {
  const insets = useSafeAreaInsets();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const [q, setQ] = useState('');
  const [part, setPart] = useState('all');
  const [eq, setEq] = useState('any');
  const [open, setOpen] = useState<TrainerMove | null>(null);
  const list = useMemo(() => {
    const pf = PARTS.find((p) => p[0] === part)![3];
    const needle = q.trim().toLowerCase();
    return MOVES.filter(
      (e) =>
        pf(e) &&
        (eq === 'any' || (eq === 'knee' ? e.kneeSafe && !e.impact : e.eq === eq)) &&
        (!needle || e.name.toLowerCase().includes(needle) || e.nameHi.includes(needle)),
    );
  }, [q, part, eq]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: hi ? 'एक्सरसाइज़ लाइब्रेरी' : 'Exercise library', headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface }, headerShadowVisible: false }} />
      <View style={styles.root}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder={hi ? 'खोजें: स्क्वाट, योग…' : 'Search: squat, plank, yoga…'} placeholderTextColor={colors.muted} style={styles.input} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.md }}>
          {PARTS.map(([id, en, h]) => (
            <Pressable key={id} onPress={() => setPart(id)} style={[styles.chip, part === id && styles.chipOn]}>
              <Text style={[styles.chipText, part === id && styles.chipTextOn]}>{hi ? h : en}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.md }}>
          {EQS.map(([id, en, h]) => (
            <Pressable key={id} onPress={() => setEq(id)} style={[styles.chip, eq === id && styles.chipOn2]}>
              <Text style={[styles.chipText, eq === id && styles.chipTextOn]}>{hi ? h : en}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.count}>
          {list.length} {hi ? 'एक्सरसाइज़, आपकी ट्रेनर के डेमो के साथ' : 'exercises, demonstrated by your trainer'}
        </Text>
        <FlatList
          data={list}
          keyExtractor={(e) => e.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: spacing.md }}
          contentContainerStyle={{ gap: 10, paddingBottom: insets.bottom + 24 }}
          initialNumToRender={10}
          renderItem={({ item }) => (
            <Pressable onPress={() => setOpen(item)} style={styles.card}>
              <Trainer moveId={item.id} still style={styles.thumb} />
              <Text style={styles.name} numberOfLines={2}>
                {hi ? item.nameHi : item.name}
              </Text>
              <Text style={styles.sub}>
                {item.level === 1 ? (hi ? 'शुरुआती' : 'Beginner') : hi ? 'मध्यम' : 'Intermediate'}
                {item.eq !== 'none' ? (hi ? ' · डम्बल' : ' · dumbbells') : ''}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)} presentationStyle="pageSheet">
        {open ? (
          <View style={[styles.sheet, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => setOpen(null)} hitSlop={10} style={{ alignSelf: 'flex-end', padding: 8 }}>
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              <Trainer moveId={open.id} style={styles.big} />
              <Text style={styles.sheetTitle}>{hi ? open.nameHi : open.name}</Text>
              <Text style={styles.sheetSub}>
                {open.level === 1 ? (hi ? 'शुरुआती' : 'Beginner') : hi ? 'मध्यम' : 'Intermediate'} ·{' '}
                {open.eq === 'none' ? (hi ? 'बिना सामान' : 'No equipment') : hi ? 'डम्बल' : 'Dumbbells'}
                {open.impact ? (hi ? ' · हाई-इम्पैक्ट' : ' · High impact') : hi ? ' · लो-इम्पैक्ट' : ' · Low impact'}
              </Text>
              {open.why ? (
                <View style={styles.why}>
                  <Text style={styles.whyTitle}>{hi ? 'PCOS में क्यों' : 'Why it helps with PCOS'}</Text>
                  <Text style={styles.whyText}>{hi ? open.whyHi : open.why}</Text>
                </View>
              ) : null}
              {(hi ? open.stepsHi : open.steps).map((s, i) => (
                <View key={i} style={styles.step}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}
              <Text style={styles.tip}>💡 {hi ? open.tipHi : open.tip}</Text>
              <Pressable onPress={() => void openMoveDemo(open.name, hi ? 'hi' : 'en')} style={styles.video}>
                <Ionicons name="logo-youtube" size={20} color="#E62117" />
                <Text style={styles.videoText}>{hi ? 'वीडियो डेमो देखें' : 'Watch a video demo'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, marginHorizontal: spacing.md, marginTop: spacing.sm, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line },
  input: { flex: 1, height: 46, fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  chips: { flexGrow: 0, marginTop: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  chipOn2: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  chipTextOn: { color: '#fff', fontFamily: fonts.bodyBold },
  count: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginHorizontal: spacing.md, marginVertical: 10 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 8, borderWidth: 1, borderColor: colors.line },
  thumb: { width: '100%', aspectRatio: 1.15, borderRadius: 12, backgroundColor: '#FFF3F0', overflow: 'hidden' },
  name: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink, marginTop: 6 },
  sub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 2 },
  sheet: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  big: { width: '100%', aspectRatio: 1.2, borderRadius: 24, backgroundColor: '#FFF3F0', overflow: 'hidden' },
  why: { backgroundColor: colors.sageMist, borderRadius: 16, padding: 12, marginTop: 6, marginBottom: 4 },
  whyTitle: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.teal },
  whyText: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.ink, marginTop: 3 },
  sheetTitle: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, marginTop: spacing.md },
  sheetSub: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: spacing.sm },
  step: { flexDirection: 'row', gap: 10, marginTop: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.blushSoft, color: colors.blushDeep, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 12.5, lineHeight: 24 },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  tip: { fontFamily: fonts.bodyMedium, fontSize: 13.5, lineHeight: 20, color: colors.teal, marginTop: 10 },
  video: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF0F0', borderRadius: 16, padding: 14, marginTop: spacing.lg },
  videoText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#C4161C' },
});
