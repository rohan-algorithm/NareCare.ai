import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/ui/Button';
import { BrandMark } from '@/src/ui/BrandMark';
import { Body, Muted } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    kicker: 'Made for Indian PCOS',
    kickerHi: 'भारतीय PCOS के लिए',
    title: 'Daily habits for\nyour PCOS.',
    titleHi: 'आपके PCOS के लिए\nरोज़ की आदतें।',
    body: 'A daily plan built around dal-roti, mess thalis and tiffins, not quinoa bowls. About 5 minutes a day.',
    bodyHi: 'दाल-रोटी, मेस थाली और टिफ़िन के हिसाब से प्लान, क्विनोआ नहीं। रोज़ ~5 मिनट।',
  },
  {
    kicker: 'Understand your reports',
    kickerHi: 'अपनी रिपोर्ट समझें',
    title: 'Snap your lab report.\nGet it in plain Hindi.',
    titleHi: 'रिपोर्ट की फोटो लें।\nसरल हिंदी में समझें।',
    body: 'LH:FSH, insulin, testosterone, thyroid, Vitamin D, explained simply, with questions for your doctor.',
    bodyHi: 'LH:FSH, इंसुलिन, टेस्टोस्टेरोन, थायरॉइड, विटामिन D: सरल भाषा में, डॉक्टर के सवालों के साथ।',
  },
  {
    kicker: 'See it working',
    kickerHi: 'असर देखें',
    title: 'Weekly proof.\nA doctor-ready PDF.',
    titleHi: 'हर हफ्ते सबूत।\nडॉक्टर के लिए PDF।',
    body: 'Your AI coach tracks what is working, and turns 8 weeks of data into one page for your gynae.',
    bodyHi: 'AI कोच बताता है क्या काम कर रहा है, और 8 हफ्तों का डेटा गाइनी के लिए एक पेज में।',
  },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeWelcome = useAppStore((s) => s.completeWelcome);
  const skipSignupDemo = useAppStore((s) => s.skipSignupDemo);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      return;
    }
    completeWelcome();
    router.replace('/login');
  };

  const skipSignup = () => {
    skipSignupDemo();
    router.replace('/home');
  };

  const freeDecode = () => {
    completeWelcome();
    router.push('/labs');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FFE8E2', '#FFF8F6', '#F5F0EE']} style={StyleSheet.absoluteFill} />
      <View style={[styles.brandRow, { paddingTop: insets.top + 8 }]}>
        <BrandMark size={36} showWordmark />
        <View style={styles.tag}>
          <Text style={styles.tagText}>PCOS · भारत</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: spacing.lg }}>
            <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoHero}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(60).duration(420)}>
              <Text style={styles.kicker}>{item.kicker}</Text>
              <Text style={styles.kickerHi}>{item.kickerHi}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Body style={styles.body}>{item.body}</Body>
              <Muted style={{ marginTop: 8, maxWidth: 340 }}>{item.bodyHi}</Muted>
            </Animated.View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={
            index === SLIDES.length - 1
              ? 'Start my journey · मेरी यात्रा शुरू'
              : 'Continue · आगे'
          }
          onPress={next}
        />
        <Button
          label="Decode my lab report free · रिपोर्ट मुफ़्त समझें"
          variant="secondary"
          onPress={freeDecode}
        />
        {__DEV__ ? <Button label="Dev: skip to demo" variant="ghost" onPress={skipSignup} /> : null}
        <Muted style={{ textAlign: 'center' }}>
          Educational companion · शैक्षिक साथी · Not a diagnosis
        </Muted>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  brandRow: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.blushSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.blushDeep,
    letterSpacing: 0.3,
  },
  hero: {
    height: height * 0.34,
    borderRadius: radii.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  logoHero: {
    width: '100%',
    height: '100%',
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.blushDeep,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  kickerHi: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.ink,
    letterSpacing: -0.8,
    marginTop: spacing.md,
    lineHeight: 38,
  },
  body: {
    marginTop: spacing.md,
    maxWidth: 340,
    color: colors.ink,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mistDeep,
  },
  dotActive: { backgroundColor: colors.blush, width: 22 },
});
