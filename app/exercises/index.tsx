import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseAnim } from '@/src/ui/ExerciseAnim';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { CATALOG, type CatEx } from '@/src/content/workoutCatalog';
import { openMoveDemo } from '@/src/features/videoDemo';

const PARTS: [string, string, string, (e: CatEx) => boolean][] = [
  ['all', 'All', 'सब', () => true],
  ['legs', 'Legs & glutes', 'पैर-ग्लूट्स', (e) => e.cat === 'strength' && (e.part === 'upper_legs' || e.part === 'lower_legs')],
  ['upper', 'Upper body', 'ऊपरी शरीर', (e) => e.cat === 'strength' && ['chest', 'shoulders', 'back', 'upper_arms', 'lower_arms'].includes(e.part)],
  ['core', 'Core', 'कोर', (e) => e.cat === 'strength' && e.part === 'core'],
  ['cardio', 'Cardio', 'कार्डियो', (e) => e.cat === 'cardio' || e.part === 'full_body'],
  ['yoga', 'Yoga & stretch', 'योग-स्ट्रेच', (e) => e.cat === 'stretch'],
];
const EQS: [string, string, string][] = [
  ['any', 'Any equipment', 'कोई भी'],
  ['none', 'No equipment', 'बिना सामान'],
  ['dumbbell', 'Dumbbells', 'डंबल'],
  ['band', 'Bands', 'बैंड'],
];

export default function Exercises() {
  const insets = useSafeAreaInsets();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const [q, setQ] = useState('');
  const [part, setPart] = useState('all');
  const [eq, setEq] = useState('any');
  const [open, setOpen] = useState<CatEx | null>(null);
  const list = useMemo(() => {
    const pf = PARTS.find((p) => p[0] === part)![3];
    const needle = q.trim().toLowerCase();
    return CATALOG.filter((e) => pf(e) && (eq === 'any' || e.eq === eq) && (!needle || e.name.toLowerCase().includes(needle)));
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
          {list.length} {hi ? 'एक्सरसाइज़' : 'exercises'} · Exercise data by RepDB (repdb.co)
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
              <Image source={item.frames[item.frames.length - 1] as number} style={styles.thumb} contentFit="contain" />
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub}>
                {item.level === 1 ? (hi ? 'शुरुआती' : 'Beginner') : hi ? 'मध्यम' : 'Intermediate'}
                {item.eq !== 'none' ? ` · ${item.eq}` : ''}
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
              <ExerciseAnim exId={open.id} style={styles.big} />
              <Text style={styles.sheetTitle}>{open.name}</Text>
              <Text style={styles.sheetSub}>
                {open.level === 1 ? (hi ? 'शुरुआती' : 'Beginner') : hi ? 'मध्यम' : 'Intermediate'} · {open.eq === 'none' ? (hi ? 'बिना सामान' : 'No equipment') : open.eq}
                {open.impact ? (hi ? ' · हाई-इम्पैक्ट' : ' · High impact') : hi ? ' · लो-इम्पैक्ट' : ' · Low impact'}
              </Text>
              {open.steps.map((s, i) => (
                <View key={i} style={styles.step}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}
              {open.tips.map((t) => (
                <Text key={t} style={styles.tip}>
                  💡 {t}
                </Text>
              ))}
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
  thumb: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#E3F0FB' },
  name: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink, marginTop: 6 },
  sub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 2 },
  sheet: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  big: { width: '100%', aspectRatio: 1.1, borderRadius: 24 },
  sheetTitle: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, marginTop: spacing.md },
  sheetSub: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: spacing.sm },
  step: { flexDirection: 'row', gap: 10, marginTop: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.blushSoft, color: colors.blushDeep, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 12.5, lineHeight: 24 },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  tip: { fontFamily: fonts.bodyMedium, fontSize: 13.5, lineHeight: 20, color: colors.teal, marginTop: 10 },
  video: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF0F0', borderRadius: 16, padding: 14, marginTop: spacing.lg },
  videoText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#C4161C' },
});
