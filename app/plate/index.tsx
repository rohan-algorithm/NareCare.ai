import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { Ionicons, IconBubble } from '@/src/ui/Icon';
import { colors, fonts, gradients, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { PLATE_ITEMS, scorePlate } from '@/src/features/plateScore';
import { labScanAvailable, pickPhoto } from '@/src/features/labOcr';
import { callEdge } from '@/src/lib/identity';
import { localDate } from '@/src/features/mealPlan';

type ScanResult = { ids: string[]; dishes: string[]; dishesHi: string[]; isFood: boolean };

export default function Plate() {
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const scans = useAppStore((s) => s.plateScans);
  const addPlateScan = useAppStore((s) => s.addPlateScan);
  const [ids, setIds] = useState<string[]>([]);
  const [dishes, setDishes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const result = useMemo(() => scorePlate(ids), [ids]);
  const toggle = (id: string) => {
    setSaved(false);
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const [weekAvg] = useState(() => {
    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const recent = scans.filter((s) => s.date >= since);
    return recent.length ? Math.round((recent.reduce((a, s) => a + s.score, 0) / recent.length) * 10) / 10 : null;
  });

  const snap = async (source: 'camera' | 'library') => {
    setBusy(true);
    try {
      const photo = await pickPhoto(source);
      if (!photo) return;
      const res = await callEdge<ScanResult>('plate-scan', { image: photo.base64, mimeType: photo.mimeType }, 45000);
      if (!res.isFood || !res.ids.length) {
        Alert.alert(hi ? 'थाली नहीं पहचानी' : 'Couldn’t read the plate', hi ? 'नीचे टैप करके चुनें कि थाली में क्या है।' : 'Tap below to choose what’s on your plate.');
        return;
      }
      setIds(res.ids);
      setDishes(hi ? res.dishesHi : res.dishes);
      setSaved(false);
    } catch {
      Alert.alert(hi ? 'स्कैन नहीं हुआ' : 'Scan failed', hi ? 'नीचे टैप करके चुनें।' : 'Tap what’s on your plate below instead.');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    addPlateScan({ date: localDate(), score: result.score, label: (dishes.length ? dishes : ids).join(', ') });
    setSaved(true);
  };

  const ringColor = result.score >= 8 ? colors.good : result.score >= 5 ? colors.amber : colors.blushDeep;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: hi ? 'थाली स्कैनर' : 'Plate scanner', headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface }, headerShadowVisible: false }} />
      <Screen scroll>
        <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroTitle}>{hi ? 'क्या यह थाली PCOS के लिए अच्छी है?' : 'Is this plate PCOS-friendly?'}</Text>
          <Text style={styles.heroBody}>
            {hi ? 'फोटो लें या टैप करें, स्कोर और एक आसान सुधार पाएँ।' : 'Snap it or tap it. Get a score and one easy fix.'}
          </Text>
          {weekAvg != null ? (
            <Text style={styles.heroStat}>{hi ? `इस हफ्ते औसत: ${weekAvg}/10` : `This week’s average: ${weekAvg}/10`}</Text>
          ) : null}
        </LinearGradient>

        {labScanAvailable ? (
          <View style={styles.row}>
            <Pressable disabled={busy} onPress={() => snap('camera')} style={styles.action}>
              {busy ? <ActivityIndicator color={colors.blushDeep} /> : <IconBubble name="camera" color={colors.blushDeep} bg={colors.blushSoft} />}
              <Text style={styles.actionText}>{busy ? (hi ? 'देख रहे हैं…' : 'Looking…') : hi ? 'फोटो लें' : 'Snap plate'}</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={() => snap('library')} style={styles.action}>
              <IconBubble name="images" color="#7C5CFF" bg="#EEE9FF" />
              <Text style={styles.actionText}>{hi ? 'गैलरी से' : 'From gallery'}</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>{hi ? 'थाली में क्या है? टैप करें' : 'What’s on your plate? Tap all that apply'}</Text>
        {dishes.length ? <Text style={styles.dishes}>{hi ? 'दिखा:' : 'Spotted:'} {dishes.join(', ')}</Text> : null}
        <View style={styles.grid}>
          {PLATE_ITEMS.map((p) => {
            const on = ids.includes(p.id);
            return (
              <Pressable key={p.id} onPress={() => toggle(p.id)} style={[styles.item, on && styles.itemOn]}>
                <Ionicons name={p.icon} size={16} color={on ? '#fff' : colors.forest} />
                <Text style={[styles.itemText, on && styles.itemTextOn]}>{hi ? p.hi : p.en}</Text>
              </Pressable>
            );
          })}
        </View>

        {ids.length > 0 && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.result}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={styles.ringBg}>
                <ProgressRing value={result.score * 10} size={86} stroke={8} centerText={`${result.score}`} label="/10" progressColor={ringColor} trackColor={colors.mist} textColor={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.verdict}>
                  {result.score >= 8 ? (hi ? 'बढ़िया PCOS थाली!' : 'Great PCOS plate!') : result.score >= 5 ? (hi ? 'अच्छी, थोड़ा सुधार' : 'Good, one tweak away') : hi ? 'इसे बेहतर बनाएँ' : 'Let’s fix this plate'}
                </Text>
                {result.good.map((g) => (
                  <Text key={g.en} style={styles.good}>✓ {hi ? g.hi : g.en}</Text>
                ))}
              </View>
            </View>
            {result.fix ? (
              <View style={styles.fix}>
                <Ionicons name="bulb" size={18} color={colors.amber} />
                <Text style={styles.fixText}>{hi ? result.fix.hi : result.fix.en}</Text>
              </View>
            ) : null}
            <Button label={saved ? (hi ? 'सेव हो गया ✓' : 'Saved ✓') : hi ? 'थाली सेव करें' : 'Save this plate'} disabled={saved} onPress={save} style={{ marginTop: spacing.md }} />
          </Animated.View>
        )}

        {scans.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.section}>{hi ? 'हाल की थालियाँ' : 'Recent plates'}</Text>
            {scans.slice(-5).reverse().map((s, i) => (
              <View key={`${s.date}-${i}`} style={styles.histRow}>
                <Text style={[styles.histScore, { color: s.score >= 8 ? colors.good : s.score >= 5 ? '#9A6A12' : colors.blushDeep }]}>{s.score}</Text>
                <Text style={styles.histLabel} numberOfLines={1}>{s.label}</Text>
                <Text style={styles.histDate}>{s.date.slice(5)}</Text>
              </View>
            ))}
          </View>
        )}
      </Screen>
    </>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  hero: { borderRadius: 26, padding: spacing.lg, gap: 6, marginTop: spacing.sm },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 28, color: '#fff' },
  heroBody: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.92)' },
  heroStat: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff', marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  action: { ...CARD, flex: 1, alignItems: 'center', gap: 8 },
  actionText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  section: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginTop: spacing.lg, marginBottom: 8 },
  dishes: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  itemOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  itemText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  itemTextOn: { color: '#fff', fontFamily: fonts.bodyBold },
  result: { ...CARD, marginTop: spacing.md },
  ringBg: { backgroundColor: '#fff', borderRadius: 50 },
  verdict: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.ink, marginBottom: 4 },
  good: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.good, marginTop: 2 },
  fix: { flexDirection: 'row', gap: 8, backgroundColor: colors.amberSoft, borderRadius: 14, padding: 12, marginTop: spacing.md },
  fixText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 20, color: colors.ink },
  history: { ...CARD, marginTop: spacing.md },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  histScore: { width: 28, fontFamily: fonts.displayBold, fontSize: 18 },
  histLabel: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  histDate: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
});
