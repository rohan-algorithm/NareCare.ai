import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, shadow, spacing } from '@/src/theme/tokens';
import { personalPromise } from '@/src/content/personalPlan';
import { useAppStore } from '@/src/store/useAppStore';

const STEPS = [
  {
    id: 'why',
    enTitle: 'What NariCare solves',
    hiTitle: 'NariCare क्या सुलझाता है',
    en: 'PCOS plans fail when they ignore Indian kitchens, irregular cycles, and busy days. We fix that loop.',
    hi: 'PCOS प्लान तब फेल होते हैं जब भारतीय रसोई, अनियमित साइकल और व्यस्त दिन छूट जाते हैं। हम वही लूप ठीक करते हैं।',
  },
  {
    id: 'core',
    enTitle: 'How Home works',
    hiTitle: 'होम कैसे काम करता है',
    en: '① One primary action for today ② Ask AI when stuck ③ Up next / schedule when you want it ④ Eat · Move · Track in the tabs — not stacked on Home.',
    hi: '① आज का एक मुख्य काम ② अटकें तो AI पूछें ③ शेड्यूल ज़रूरत पर ④ खाएँ · मूव · ट्रैक टैब में — होम पर नहीं।',
  },
  {
    id: 'ai',
    enTitle: 'Where AI helps',
    hiTitle: 'AI कहाँ मदद करता है',
    en: 'AI Coach answers food, cravings, cycle, and lab questions in plain language — never doses medicine. Lab AI explains Indian reports.',
    hi: 'AI कोच भोजन, क्रेविंग, साइकल और लैब के सवाल सादे शब्दों में — दवा की खुराक कभी नहीं। Lab AI भारतीय रिपोर्ट समझाता है।',
  },
  {
    id: 'alarm',
    enTitle: 'Alarms → action',
    hiTitle: 'अलार्म → कार्रवाई',
    en: 'When the exercise alarm rings, open Exercise and tap Start. No photo needed — just do the 10–15 min routine and mark complete.',
    hi: 'एक्सरसाइज़ अलार्म पर Move खोलें और Start दबाएँ। फ़ोटो नहीं — 10–15 मिनट रूटीन करें और पूरा मार्क करें।',
  },
];

export default function Guide() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const completeGuide = useAppStore((s) => s.completeGuide);
  const lang = profile?.language ?? 'en';
  const promise = personalPromise(profile, lang);
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  const finish = () => {
    completeGuide();
    router.replace('/home');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'शुरुआती गाइड' : 'Starter guide',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>
            {lang === 'hi' ? `स्टेप ${step + 1}/${STEPS.length}` : `Step ${step + 1}/${STEPS.length}`}
          </Label>
          <Display style={{ marginTop: 6 }}>{lang === 'hi' ? s.hiTitle : s.enTitle}</Display>
          <Body style={{ color: colors.muted, marginTop: spacing.md }}>
            {lang === 'hi' ? s.hi : s.en}
          </Body>
        </Animated.View>

        {step === 0 && (
          <View style={styles.promise}>
            <Title style={{ fontSize: 18 }}>{promise.headline}</Title>
            <Muted style={{ marginTop: 8 }}>{promise.sub}</Muted>
          </View>
        )}

        {step === 1 && (
          <View style={{ marginTop: spacing.lg, gap: 10 }}>
            {promise.cores.map((c) => (
              <View key={c.title} style={styles.core}>
                <Title style={{ fontSize: 16 }}>{c.title}</Title>
                <Muted style={{ marginTop: 4 }}>{c.detail}</Muted>
              </View>
            ))}
          </View>
        )}

        {step === 2 && (
          <Pressable onPress={() => router.push('/ai')} style={styles.aiCard}>
            <Label style={{ color: colors.blushDeep }}>AI</Label>
            <Title style={{ marginTop: 8 }}>
              {lang === 'hi' ? 'AI कोच आज़माएँ →' : 'Try AI Coach →'}
            </Title>
            <Muted style={{ marginTop: 6 }}>
              {lang === 'hi'
                ? 'क्रेविंग, मेस फ़ूड, लैब — कुछ भी पूछें।'
                : 'Ask about cravings, mess food, labs — anything.'}
            </Muted>
          </Pressable>
        )}

        {step === 3 && (
          <View style={styles.alarmDemo}>
            <Text style={styles.alarmTime}>6:30 PM</Text>
            <Title style={{ marginTop: 8 }}>
              {lang === 'hi' ? 'एक्सरसाइज़ अलार्म' : 'Exercise alarm'}
            </Title>
            <Muted style={{ marginTop: 6 }}>
              {lang === 'hi'
                ? 'अलार्म → एक्सरसाइज़ → Start → पूरा करें। फ़ोटो ज़रूरी नहीं।'
                : 'Alarm → Exercise → Start → complete. No photo required.'}
            </Muted>
          </View>
        )}

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
          ))}
        </View>

        {step < STEPS.length - 1 ? (
          <Button
            label={lang === 'hi' ? 'आगे' : 'Continue'}
            onPress={() => setStep((x) => x + 1)}
            style={{ marginTop: spacing.lg }}
          />
        ) : (
          <Button
            label={lang === 'hi' ? 'होम पर जाएँ · अलार्म सेट करें' : 'Go to Home · set alarms'}
            onPress={finish}
            style={{ marginTop: spacing.lg }}
          />
        )}
        <Button
          label={lang === 'hi' ? 'छोड़ें' : 'Skip for now'}
          variant="ghost"
          onPress={finish}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  promise: {
    marginTop: spacing.lg,
    backgroundColor: colors.blushSoft,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.soft,
  },
  core: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadow.soft,
  },
  aiCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.mist,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  alarmDemo: {
    marginTop: spacing.lg,
    backgroundColor: colors.blushDeep,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  alarmTime: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.white,
    letterSpacing: -0.5,
  },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mistDeep },
  dotOn: { width: 24, backgroundColor: colors.blushDeep },
});
