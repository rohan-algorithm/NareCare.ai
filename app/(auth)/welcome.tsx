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
    kicker: 'What NariCare is',
    kickerHi: 'NariCare क्या है',
    title: 'Daily PCOS care\nthat fits India',
    titleHi: 'रोज़ की PCOS केयर\nभारत के हिसाब से',
    body: 'Eat better for your kitchen. Move gently. Track symptoms. Ask when stuck — in English or Hindi.',
    bodyHi: 'आपकी रसोई के हिसाब से खाएँ। नरमी से मूव। लक्षण ट्रैक। अटकें तो पूछें — अंग्रेज़ी या हिंदी।',
  },
  {
    kicker: 'Four doors',
    kickerHi: 'चार दरवाज़े',
    title: 'Eat · Move ·\nTrack · You',
    titleHi: 'खाएँ · मूव ·\nट्रैक · आप',
    body: 'Home = today’s one job + Ask. Tabs cover Eat, Move, Track. Labs and Council live under You.',
    bodyHi: 'होम = आज का एक काम + पूछें। टैब: खाएँ, मूव, ट्रैक। लैब और परिषद आप में।',
  },
  {
    kicker: 'Start simple',
    kickerHi: 'सिंपल शुरू',
    title: 'One job today.\nAlarms that open Move.',
    titleHi: 'आज एक काम।\nअलार्म → मूव शुरू।',
    body: 'No dashboard clutter. Soft day when you need it. Weekly review when you want proof.',
    bodyHi: 'कोई डैशबोर्ड नहीं। ज़रूरत हो तो Soft day। सबूत के लिए साप्ताहिक समीक्षा।',
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
          label="Skip signup — demo · साइनअप छोड़ें"
          variant="ghost"
          onPress={skipSignup}
        />
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
