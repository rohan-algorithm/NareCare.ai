import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@/src/ui/Icon';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { BAND_COPY, QUESTIONS, TESTS, scoreCheck, type CheckAnswers, type CheckResult } from '@/src/content/pcosCheck';

export default function PcosCheck() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const saved = useAppStore((s) => s.pcosCheck);
  const setPcosCheck = useAppStore((s) => s.setPcosCheck);
  const hasProfile = useAppStore((s) => !!s.profile);
  const completeWelcome = useAppStore((s) => s.completeWelcome);
  const [step, setStep] = useState<number>(saved ? QUESTIONS.length : -1);
  const [answers, setAnswers] = useState<CheckAnswers>({});
  const [result, setResult] = useState<CheckResult | null>(saved);

  const header = <Stack.Screen options={{ headerShown: true, title: hi ? 'PCOS जाँच' : 'PCOS check', headerShadowVisible: false, headerStyle: { backgroundColor: colors.surface } }} />;

  const pick = (qid: string, oid: string) => {
    void Haptics.selectionAsync().catch(() => undefined);
    const next = { ...answers, [qid]: oid };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 180);
      return;
    }
    const r = scoreCheck(next);
    setPcosCheck(r);
    setResult(r);
    setStep(QUESTIONS.length);
  };

  if (step === -1) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + 32 }]}>
        {header}
        <View style={styles.introIcon}>
          <Ionicons name="pulse" size={34} color={colors.blushDeep} />
        </View>
        <Text style={styles.h1}>{hi ? 'क्या मुझे PCOS हो सकता है?' : 'Could I have PCOS?'}</Text>
        <Text style={styles.lead}>
          {hi
            ? '10 सवाल, 2 मिनट। डॉक्टर जिन रॉटरडैम मानदंडों से PCOS पहचानते हैं, उन्हीं पर आधारित स्कोर।'
            : '10 questions, 2 minutes. A score based on the Rotterdam criteria doctors use to identify PCOS.'}
        </Text>
        {[
          ['calendar', hi ? 'पीरियड कितने नियमित हैं' : 'How regular your periods are'],
          ['sparkles', hi ? 'एंड्रोजन के संकेत: बाल, मुंहासे, बाल झड़ना' : 'Androgen signs: hair, acne, hair loss'],
          ['scan', hi ? 'अल्ट्रासाउंड रिपोर्ट, अगर हो' : 'Ultrasound findings, if any'],
          ['fitness', hi ? 'इंसुलिन और पारिवारिक संकेत' : 'Insulin and family signs'],
        ].map(([icon, text]) => (
          <View key={text} style={styles.introRow}>
            <Ionicons name={icon as any} size={18} color={colors.teal} />
            <Text style={styles.introText}>{text}</Text>
          </View>
        ))}
        <Pressable onPress={() => setStep(0)} style={styles.cta}>
          <Text style={styles.ctaText}>{hi ? 'जाँच शुरू करें' : 'Start the check'}</Text>
        </Pressable>
        <Text style={styles.fine}>
          {hi ? 'यह एक स्क्रीनिंग है, निदान नहीं। आपके जवाब सिर्फ़ आपके फ़ोन पर रहते हैं।' : 'This is a screening, not a diagnosis. Your answers stay on your phone.'}
        </Text>
      </ScrollView>
    );
  }

  if (step < QUESTIONS.length) {
    const q = QUESTIONS[step];
    return (
      <View style={[styles.root, { paddingBottom: insets.bottom + 16 }]}>
        {header}
        <View style={styles.pad}>
          <View style={styles.progressRow}>
            <Pressable onPress={() => setStep(step - 1)} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((step + 1) / QUESTIONS.length) * 100}%` }]} />
            </View>
            <Text style={styles.count}>
              {step + 1}/{QUESTIONS.length}
            </Text>
          </View>
          <Animated.View key={q.id} entering={FadeInRight.duration(220)}>
            <Text style={styles.q}>{hi ? q.hi : q.en}</Text>
            {q.helpEn ? <Text style={styles.help}>{hi ? q.helpHi : q.helpEn}</Text> : null}
            <View style={{ gap: 10, marginTop: spacing.md }}>
              {q.options.map((o) => {
                const on = answers[q.id] === o.id;
                return (
                  <Pressable key={o.id} onPress={() => pick(q.id, o.id)} style={[styles.opt, on && styles.optOn]}>
                    <Text style={[styles.optText, on && { color: colors.blushDeep }]}>{hi ? o.hi : o.en}</Text>
                    <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.blushDeep : colors.lineStrong} />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  if (!result) return null;
  const band = BAND_COPY[result.band];
  const [title, body] = band[hi ? 'hi' : 'en'];
  const crit: [string, boolean | null][] = [
    [hi ? 'अनियमित ओव्यूलेशन (पीरियड)' : 'Irregular ovulation (periods)', result.criteria.ovulation],
    [hi ? 'एंड्रोजन अधिकता (बाल, मुंहासे)' : 'Androgen excess (hair, acne)', result.criteria.androgen],
    [hi ? 'अल्ट्रासाउंड पर पॉलीसिस्टिक ओवरी' : 'Polycystic ovaries on ultrasound', result.criteria.ovaries],
  ];
  const share = () =>
    void Share.share({
      message: hi
        ? `मेरा NariCare PCOS जाँच स्कोर: ${result.score}/100 (${title})। डॉक्टर से पूछने के टेस्ट: ${TESTS.map((t) => t.hi).join(', ')}।`
        : `My NariCare PCOS check score: ${result.score}/100 (${title}). Tests to ask my doctor about: ${TESTS.map((t) => t.en).join(', ')}.`,
    });

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + 32 }]}>
      {header}
      <Animated.View entering={FadeInDown.duration(380)} style={styles.scoreCard}>
        <ProgressRing value={result.score} size={128} stroke={12} centerText={`${result.score}`} label="/100" progressColor={band.color} trackColor={colors.mist} textColor={colors.ink} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.band, { color: band.color }]}>{title}</Text>
          <Text style={styles.bandBody}>{body}</Text>
        </View>
      </Animated.View>

      {result.flags.includes('pill') ? (
        <Text style={styles.note}>
          {hi
            ? '💊 गर्भनिरोधक गोलियाँ पीरियड को नियमित दिखाती हैं और लक्षण छुपा सकती हैं, इसलिए यह स्कोर कम दिख सकता है।'
            : '💊 Birth-control pills make periods look regular and can hide symptoms, so this score may read low.'}
        </Text>
      ) : null}
      {result.flags.includes('young') ? (
        <Text style={styles.note}>
          {hi
            ? '🌱 पहले पीरियड के 2 साल तक अनियमित चक्र आम हैं। डॉक्टर इस उम्र में अलग तरह से जाँचते हैं।'
            : '🌱 Irregular cycles are common in the first 2 years after your first period. Doctors assess this age differently.'}
        </Text>
      ) : null}

      <Text style={styles.section}>{hi ? 'रॉटरडैम मानदंड (3 में से 2 चाहिए)' : 'Rotterdam criteria (2 of 3 needed)'}</Text>
      <View style={styles.card}>
        {crit.map(([label, v]) => (
          <View key={label} style={styles.critRow}>
            <Ionicons
              name={v === null ? 'help-circle' : v ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color={v === null ? colors.muted : v ? colors.blushDeep : colors.good}
            />
            <Text style={styles.critText}>{label}</Text>
            <Text style={styles.critVal}>{v === null ? (hi ? 'जाँच नहीं' : 'Not checked') : v ? (hi ? 'संकेत हैं' : 'Signs present') : hi ? 'नहीं' : 'No'}</Text>
          </View>
        ))}
        {result.metabolic ? (
          <Text style={styles.metabolic}>
            {hi ? '⚠️ इंसुलिन रेज़िस्टेंस के संकेत भी हैं: शुगर टेस्ट ज़रूर करवाएँ।' : '⚠️ You also show signs of insulin resistance: get your blood sugar checked.'}
          </Text>
        ) : null}
      </View>

      {result.band !== 'low' ? (
        <>
          <Text style={styles.section}>{hi ? 'डॉक्टर से ये टेस्ट पूछें' : 'Tests to ask your doctor about'}</Text>
          <View style={styles.card}>
            {TESTS.map((t) => (
              <View key={t.en} style={styles.testRow}>
                <Ionicons name="flask-outline" size={18} color={colors.teal} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.testName}>{hi ? t.hi : t.en}</Text>
                  <Text style={styles.testWhy}>{hi ? t.whyHi : t.why}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Pressable
        onPress={() => {
          if (hasProfile) return router.push('/home');
          completeWelcome();
          router.replace('/');
        }}
        style={styles.cta}
      >
        <Text style={styles.ctaText}>
          {result.band === 'low' ? (hi ? 'हेल्दी हॉर्मोन प्लान देखें' : 'See your healthy-hormones plan') : hi ? 'मेरा PCOS प्लान शुरू करें' : 'Start my PCOS plan'}
        </Text>
      </Pressable>
      <View style={styles.row2}>
        <Pressable onPress={share} style={styles.ghost}>
          <Ionicons name="share-social-outline" size={18} color={colors.ink} />
          <Text style={styles.ghostText}>{hi ? 'डॉक्टर को भेजें' : 'Share with doctor'}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setAnswers({});
            setStep(0);
          }}
          style={styles.ghost}
        >
          <Ionicons name="refresh" size={18} color={colors.ink} />
          <Text style={styles.ghostText}>{hi ? 'दोबारा जाँचें' : 'Retake'}</Text>
        </Pressable>
      </View>
      <Text style={styles.fine}>
        {hi
          ? 'यह स्क्रीनिंग 2023 अंतरराष्ट्रीय PCOS गाइडलाइन के मानदंडों पर आधारित है। यह निदान नहीं है; PCOS की पुष्टि डॉक्टर ही जाँच और टेस्ट से करते हैं।'
          : 'Based on the criteria in the 2023 International PCOS Guideline. This is not a diagnosis; only a doctor can confirm PCOS after an exam and tests.'}
      </Text>
    </ScrollView>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 20, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  pad: { padding: spacing.lg },
  introIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.blushSoft, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 34, color: colors.ink, marginTop: spacing.md, letterSpacing: -0.5 },
  lead: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8, marginBottom: spacing.md },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  introText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  cta: { marginTop: spacing.lg, backgroundColor: colors.blushDeep, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#fff' },
  fine: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center', marginTop: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.mistDeep, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.blushDeep },
  count: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.muted },
  q: { fontFamily: fonts.displayBold, fontSize: 23, lineHeight: 30, color: colors.ink, marginTop: spacing.xl, letterSpacing: -0.3 },
  help: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: colors.muted, marginTop: 6 },
  opt: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  optOn: { borderColor: colors.blushDeep, backgroundColor: '#FFF6F4' },
  optText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  scoreCard: { ...CARD, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
  band: { fontFamily: fonts.displayBold, fontSize: 22, letterSpacing: -0.3 },
  bandBody: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: colors.ink, marginTop: 4 },
  note: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 19, color: colors.ink, backgroundColor: colors.amberSoft, borderRadius: 14, padding: 12, marginTop: spacing.md },
  section: { fontFamily: fonts.bodyBold, fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted, marginTop: spacing.lg, marginBottom: 8 },
  card: { ...CARD, padding: 14, gap: 12 },
  critRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  critText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  critVal: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.muted },
  metabolic: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: '#9A6A12' },
  testRow: { flexDirection: 'row', gap: 10 },
  testName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  testWhy: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  row2: { flexDirection: 'row', gap: 10, marginTop: 12 },
  ghost: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 999, paddingVertical: 13, borderWidth: 1, borderColor: colors.lineStrong },
  ghostText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
