import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Ionicons, IconBubble } from '@/src/ui/Icon';
import { SAMPLE_LAB_VALUES } from '@/src/features/labAi';
import { labScanAvailable, scanLabReport, toMarkerValues } from '@/src/features/labOcr';
import { colors, fonts, gradients, shadowCard, spacing } from '@/src/theme/tokens';
import { isSubscriptionActive, useAppStore } from '@/src/store/useAppStore';
import { sendCoachMessage } from '@/src/features/coachAgent';

const FIELDS: { key: string; en: string; hi: string; unit: string }[] = [
  { key: 'lh', en: 'LH', hi: 'LH', unit: 'mIU/mL' },
  { key: 'fsh', en: 'FSH', hi: 'FSH', unit: 'mIU/mL' },
  { key: 'total_testosterone', en: 'Total testosterone', hi: 'टेस्टोस्टेरोन', unit: 'ng/dL' },
  { key: 'fasting_insulin', en: 'Fasting insulin', hi: 'फास्टिंग इंसुलिन', unit: 'µIU/mL' },
  { key: 'hba1c', en: 'HbA1c', hi: 'HbA1c', unit: '%' },
  { key: 'tsh', en: 'TSH', hi: 'TSH', unit: 'mIU/L' },
  { key: 'vit_d', en: 'Vitamin D', hi: 'विटामिन D', unit: 'ng/mL' },
];

const STATUS: Record<string, { en: string; hi: string; fg: string; bg: string }> = {
  Normal: { en: 'Normal', hi: 'सामान्य', fg: colors.good, bg: '#E2F4EC' },
  Borderline: { en: 'Borderline', hi: 'सीमा पर', fg: '#9A6A12', bg: colors.amberSoft },
  High: { en: 'High', hi: 'ज़्यादा', fg: colors.blushDeep, bg: colors.blushSoft },
  Low: { en: 'Low', hi: 'कम', fg: colors.blushDeep, bg: colors.blushSoft },
};

export default function Labs() {
  const router = useRouter();
  const saveLabAnalysis = useAppStore((s) => s.saveLabAnalysis);
  const labAnalyses = useAppStore((s) => s.labAnalyses);
  const profile = useAppStore((s) => s.profile);
  const subscription = useAppStore((s) => s.subscription);
  const freeDecodeUsed = useAppStore((s) => s.freeDecodeUsed);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(!labScanAvailable);
  const [form, setForm] = useState<Record<string, string>>({});
  const latest = labAnalyses[0];
  const hi = profile?.language === 'hi';
  const paid = isSubscriptionActive(subscription);
  const canDecode = paid || !freeDecodeUsed;

  const upsell = () => router.replace('/');

  const scan = async (source: 'camera' | 'library') => {
    setBusy(true);
    try {
      const values = await scanLabReport(source);
      if (values) saveLabAnalysis(values);
    } catch (e: any) {
      const msg =
        e?.message === 'unreadable'
          ? hi ? 'रिपोर्ट साफ़ नहीं पढ़ी गई। रोशनी में सीधी फोटो लें या वैल्यू टाइप करें।' : 'Couldn’t read that clearly. Retake in good light, or type the values.'
          : e?.message === 'camera-denied'
            ? hi ? 'कैमरा अनुमति चाहिए।' : 'Camera permission is needed.'
            : hi ? 'अभी स्कैन नहीं हो पाया। वैल्यू टाइप करें।' : 'Scan failed right now. Type the values instead.';
      Alert.alert(hi ? 'लैब स्कैन' : 'Lab scan', msg);
      setManual(true);
    } finally {
      setBusy(false);
    }
  };

  const submitManual = () => {
    const raw: Record<string, number> = {};
    for (const f of FIELDS) {
      const n = parseFloat((form[f.key] ?? '').replace(',', '.'));
      if (Number.isFinite(n) && n > 0) raw[f.key] = n;
    }
    const values = toMarkerValues(raw);
    if (!Object.keys(values).length) {
      Alert.alert(hi ? 'कम से कम एक वैल्यू डालें' : 'Enter at least one value');
      return;
    }
    saveLabAnalysis(values);
    setForm({});
    setManual(false);
  };

  const askAi = () => {
    void sendCoachMessage(hi ? 'मेरी लेटेस्ट लैब रिपोर्ट समझाएँ' : 'Explain my latest lab report');
    router.push('/coach' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'लैब डिकोडर' : 'Lab decoder',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient colors={[...gradients.ai]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Ionicons name="flask" size={26} color="#fff" />
            <Text style={styles.heroTitle}>
              {hi ? 'अपनी रिपोर्ट सरल भाषा में समझें' : 'Understand your report in plain language'}
            </Text>
            <Text style={styles.heroBody}>
              {hi
                ? 'किसी भी भारतीय लैब की रिपोर्ट। डॉक्टर के लिए सवाल भी। खुराक कभी नहीं।'
                : 'Reports from any Indian lab. Plus questions for your doctor. Never doses.'}
            </Text>
            {!paid && !freeDecodeUsed ? (
              <View style={styles.freePill}>
                <Text style={styles.freeText}>{hi ? 'पहली रिपोर्ट मुफ़्त' : 'Your first report is free'}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </Animated.View>

        {canDecode ? (
          <View style={{ marginTop: spacing.md, gap: 10 }}>
            {labScanAvailable ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable disabled={busy} onPress={() => scan('camera')} style={styles.action}>
                  <IconBubble name="camera" color={colors.blushDeep} bg={colors.blushSoft} />
                  <Text style={styles.actionText}>{busy ? (hi ? 'पढ़ रहे हैं…' : 'Reading…') : hi ? 'फोटो लें' : 'Scan report'}</Text>
                </Pressable>
                <Pressable disabled={busy} onPress={() => scan('library')} style={styles.action}>
                  <IconBubble name="images" color="#7C5CFF" bg="#EEE9FF" />
                  <Text style={styles.actionText}>{hi ? 'गैलरी से' : 'From gallery'}</Text>
                </Pressable>
              </View>
            ) : null}
            <Pressable onPress={() => setManual((v) => !v)} style={styles.manualToggle}>
              <Ionicons name="create-outline" size={18} color={colors.ink} />
              <Text style={styles.manualToggleText}>{hi ? 'वैल्यू खुद टाइप करें' : 'Type values instead'}</Text>
              <Ionicons name={manual ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </Pressable>
            {manual ? (
              <View style={styles.card}>
                {FIELDS.map((f) => (
                  <View key={f.key} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>{hi ? f.hi : f.en}</Text>
                    <TextInput
                      value={form[f.key] ?? ''}
                      onChangeText={(t) => setForm((p) => ({ ...p, [f.key]: t }))}
                      keyboardType="decimal-pad"
                      placeholder="—"
                      placeholderTextColor={colors.muted}
                      style={styles.input}
                    />
                    <Text style={styles.unit}>{f.unit}</Text>
                  </View>
                ))}
                <Button label={hi ? 'समझाएँ' : 'Explain my values'} onPress={submitManual} style={{ marginTop: spacing.md }} />
                {__DEV__ ? (
                  <Pressable onPress={() => saveLabAnalysis(SAMPLE_LAB_VALUES)} style={{ marginTop: 10 }}>
                    <Text style={styles.linkMuted}>Dev: load sample panel</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          <Pressable onPress={upsell} style={[styles.card, styles.upsell]}>
            <Ionicons name="lock-closed" size={20} color={colors.blushDeep} />
            <Text style={styles.upsellText}>
              {hi ? 'और रिपोर्ट + पूरा 8-हफ्ते का प्लान अनलॉक करें' : 'Unlock more reports and your full 8-week plan'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.blushDeep} />
          </Pressable>
        )}

        {latest && (
          <>
            <View style={[styles.card, styles.summary]}>
              <Text style={styles.kicker}>{hi ? 'सारांश' : 'Summary'}</Text>
              <Text style={styles.summaryText}>{hi ? latest.summaryHi : latest.summaryEn}</Text>
            </View>

            {latest.findings.map((m, i) => {
              const st = STATUS[m.status];
              return (
                <Animated.View key={m.key} entering={FadeInDown.delay(40 * i).duration(320)} style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.markerName}>{m.name}</Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.fg }]}>{hi ? st.hi : st.en}</Text>
                    </View>
                  </View>
                  <Text style={styles.value}>
                    {m.value} <Text style={styles.valueUnit}>{m.unit}</Text>
                  </Text>
                  <Text style={styles.explain}>{hi ? m.explainHi : m.explainEn}</Text>
                  <Text style={styles.actionHint}>{m.action}</Text>
                </Animated.View>
              );
            })}

            <View style={[styles.card, { backgroundColor: colors.amberSoft }]}>
              <Text style={styles.markerName}>{hi ? 'डॉक्टर से पूछें' : 'Ask your doctor'}</Text>
              {latest.doctorQuestions.map((q) => (
                <Text key={q} style={styles.q}>• {q}</Text>
              ))}
            </View>

            {paid ? (
              <Button label={hi ? 'AI कोच से इस रिपोर्ट पर पूछें' : 'Ask the AI coach about this report'} onPress={askAi} style={{ marginTop: spacing.sm }} />
            ) : (
              <Pressable onPress={upsell}>
                <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
                  <Text style={styles.ctaTitle}>{hi ? 'अब आगे क्या?' : 'What do I do about it?'}</Text>
                  <Text style={styles.ctaBody}>
                    {hi
                      ? 'इन नंबरों के हिसाब से 8-हफ्ते का खाना + मूव प्लान, और हर हफ्ते सबूत कि असर हो रहा है।'
                      : 'Get an 8-week food + movement plan built on these numbers, with weekly proof it’s working.'}
                  </Text>
                  <View style={styles.ctaBtn}>
                    <Text style={styles.ctaBtnText}>{hi ? 'मेरा प्लान बनाएँ' : 'Build my plan'}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.blushDeep} />
                  </View>
                </LinearGradient>
              </Pressable>
            )}
          </>
        )}
        <Disclaimer lang={hi ? 'hi' : 'en'} />
      </Screen>
    </>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  hero: { borderRadius: 26, padding: spacing.lg, gap: 8, marginTop: spacing.sm },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 28, color: '#fff', letterSpacing: -0.4 },
  heroBody: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
  freePill: { alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 4 },
  freeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#7C5CFF' },
  action: { ...CARD, flex: 1, alignItems: 'center', gap: 10, paddingVertical: 18 },
  actionText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  manualToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  manualToggleText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  card: { ...CARD, marginTop: spacing.sm },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  fieldLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  input: { width: 90, height: 42, borderRadius: 12, backgroundColor: colors.mist, paddingHorizontal: 12, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, textAlign: 'right' },
  unit: { width: 56, fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  linkMuted: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted },
  upsell: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
  upsellText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  summary: { backgroundColor: colors.forest, marginTop: spacing.lg },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' },
  summaryText: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: '#fff', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  markerName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11.5 },
  value: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink, marginTop: 6, letterSpacing: -0.5 },
  valueUnit: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  explain: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.ink, marginTop: 6 },
  actionHint: { fontFamily: fonts.bodyMedium, fontSize: 12.5, lineHeight: 18, color: colors.teal, marginTop: 8 },
  q: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.ink, marginTop: 6 },
  cta: { borderRadius: 24, padding: spacing.lg, gap: 8, marginTop: spacing.md },
  ctaTitle: { fontFamily: fonts.displayBold, fontSize: 20, color: '#fff' },
  ctaBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.92)' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, marginTop: 6 },
  ctaBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.blushDeep },
});
