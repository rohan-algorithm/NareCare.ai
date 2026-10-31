import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/src/ui/BrandMark';
import { Ionicons, type IconName } from '@/src/ui/Icon';
import { Trainer } from '@/src/ui/Trainer';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useLang } from '@/src/i18n/useLang';
import { useAppStore } from '@/src/store/useAppStore';

const FEATURES: { icon: IconName; en: string; hi: string; fg: string; bg: string }[] = [
  { icon: 'restaurant', en: 'Indian meal plan', hi: 'भारतीय खाना प्लान', fg: '#C4453A', bg: '#FFE9E5' },
  { icon: 'fitness', en: 'Home workouts & yoga', hi: 'घर पर वर्कआउट और योग', fg: '#2A8F6A', bg: '#E2F4EC' },
  { icon: 'calendar', en: 'Honest cycle tracking', hi: 'सच्चा साइकल ट्रैकिंग', fg: '#B4236B', bg: '#FCE4F0' },
  { icon: 'sparkles', en: 'AI coach that acts', hi: 'AI कोच जो काम करे', fg: '#6B4FD8', bg: '#EEE9FF' },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = useLang();
  const hi = lang === 'hi';
  const completeWelcome = useAppStore((s) => s.completeWelcome);
  const updateSetupDraft = useAppStore((s) => s.updateSetupDraft);
  const skipSignupDemo = useAppStore((s) => s.skipSignupDemo);
  const signInDemo = useAppStore((s) => s.signInDemo);

  // No signup wall: an anonymous account is created in the background and
  // purchases are tied to her Google Play account, so she goes straight to her plan.
  const start = () => {
    completeWelcome();
    signInDemo();
    router.replace('/setup');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFE3DC', '#FFF8F6', '#FFF8F6']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10, paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <BrandMark size={34} showWordmark />
          <View style={styles.langToggle}>
            {(['en', 'hi'] as const).map((l) => (
              <Pressable key={l} onPress={() => updateSetupDraft({ language: l })} style={[styles.langBtn, lang === l && styles.langOn]}>
                <Text style={[styles.langText, lang === l && styles.langTextOn]}>{l === 'en' ? 'EN' : 'हिं'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
          <LinearGradient colors={['#FFFFFF', '#FFF1EE']} style={StyleSheet.absoluteFill} />
          <Trainer moveId="tree" style={styles.trainer} />
          <View style={[styles.float, { top: 18, left: 14 }]}>
            <Ionicons name="water" size={14} color="#2F80ED" />
            <Text style={styles.floatText}>{hi ? '6/9 गिलास' : '6/9 glasses'}</Text>
          </View>
          <View style={[styles.float, { top: 62, right: 14 }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.good} />
            <Text style={styles.floatText}>{hi ? 'डिनर बदला: मूंग चीला' : 'Dinner swapped: moong cheela'}</Text>
          </View>
          <View style={[styles.float, { bottom: 18, left: 14 }]}>
            <Ionicons name="flower" size={14} color="#B4236B" />
            <Text style={styles.floatText}>{hi ? 'साइकल दिन 32' : 'Cycle day 32'}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <Text style={styles.kicker}>{hi ? 'भारतीय महिलाओं के लिए PCOS ऐप' : 'The PCOS app for Indian women'}</Text>
          <Text style={styles.title}>{hi ? 'आपका PCOS प्लान,\nआपकी ज़िंदगी के हिसाब से।' : 'Your PCOS plan,\nbuilt for Indian life.'}</Text>
          <Text style={styles.body}>
            {hi
              ? 'दाल-रोटी वाला खाना प्लान, घर पर ट्रेनर के साथ वर्कआउट, सच्चा साइकल ट्रैकिंग और AI कोच। मुफ़्त शुरू करें।'
              : 'Meals with dal-roti, not quinoa. Home workouts with a trainer. Honest cycle tracking and an AI coach. Free to start.'}
          </Text>
        </Animated.View>

        <View style={styles.grid}>
          {FEATURES.map((f, i) => (
            <Animated.View key={f.en} entering={FadeInDown.delay(140 + i * 50).duration(380)} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={18} color={f.fg} />
              </View>
              <Text style={styles.featureText}>{hi ? f.hi : f.en}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.trust}>
          <Ionicons name="shield-checkmark" size={16} color={colors.teal} />
          <Text style={styles.trustText}>
            {hi
              ? '2023 अंतरराष्ट्रीय PCOS गाइडलाइन पर आधारित · हिंदी और अंग्रेज़ी · आपका डेटा निजी'
              : 'Built on the 2023 International PCOS Guideline · Hindi & English · Your data stays private'}
          </Text>
        </View>
      </ScrollView>

      <Animated.View entering={FadeInUp.duration(400)} style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable onPress={start} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}>
          <LinearGradient colors={['#FF7A6A', '#E24B5A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaFill}>
            <Text style={styles.ctaText}>{hi ? 'मेरा फ्री प्लान बनाएँ' : 'Get my free plan'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => router.push('/pcos-check')} style={styles.second}>
          <Ionicons name="pulse" size={17} color={colors.blushDeep} />
          <Text style={styles.secondText}>{hi ? 'क्या मुझे PCOS है? 2-मिनट जाँच' : 'Could I have PCOS? Take the 2-min check'}</Text>
        </Pressable>
        <View style={styles.links}>
          <Pressable
            onPress={() => {
              completeWelcome();
              router.push('/labs');
            }}
            hitSlop={8}
          >
            <Text style={styles.link}>{hi ? 'लैब रिपोर्ट मुफ़्त समझें' : 'Decode a lab report free'}</Text>
          </Pressable>
          {__DEV__ ? (
            <Pressable
              onPress={() => {
                skipSignupDemo();
                router.replace('/home');
              }}
              hitSlop={8}
            >
              <Text style={styles.linkMuted}>Dev: demo</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.fine}>{hi ? 'शैक्षिक साथी · निदान नहीं' : 'Educational companion · not a diagnosis'}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langToggle: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 999, padding: 3, borderWidth: 1, borderColor: colors.line },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  langOn: { backgroundColor: colors.blushDeep },
  langText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.muted },
  langTextOn: { color: '#fff' },
  hero: { height: 250, borderRadius: 30, marginTop: spacing.md, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.08 },
  trainer: { flex: 1, marginTop: 22 },
  float: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...shadowCard,
    shadowOpacity: 0.12,
    elevation: 4,
  },
  floatText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.ink },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.blushDeep, marginTop: spacing.lg },
  title: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 36, color: colors.ink, letterSpacing: -0.8, marginTop: 8 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  feature: { width: '48.8%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: colors.line },
  featureIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 12.5, lineHeight: 16, color: colors.ink },
  trust: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: spacing.md, paddingHorizontal: 4 },
  trustText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 17, color: colors.teal },
  footer: { paddingHorizontal: spacing.lg, paddingTop: 10, gap: 10, backgroundColor: 'rgba(255,248,246,0.97)', borderTopWidth: 1, borderTopColor: colors.line },
  cta: { borderRadius: 999, overflow: 'hidden' },
  ctaFill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17 },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 17, color: '#fff' },
  second: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 999, borderWidth: 1.5, borderColor: colors.blushSoft, backgroundColor: '#fff' },
  secondText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.blushDeep },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.teal },
  linkMuted: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  fine: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center' },
});
