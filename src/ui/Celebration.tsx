import * as Haptics from 'expo-haptics';
import { useEffect, useMemo } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn } from 'react-native-reanimated';

import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts } from '@/src/theme/tokens';
import { maybeAskForReview } from '@/src/features/review';
import { MILESTONES } from '@/src/features/streak';
import { useAppStore } from '@/src/store/useAppStore';

const { width: W, height: H } = Dimensions.get('window');
const CONFETTI = ['#FF7A6A', '#FFC857', '#3DDC97', '#7C5CFF', '#E24B5A', '#2F80ED'];

function Piece({ i }: { i: number }) {
  const y = useSharedValue(-40);
  const r = useSharedValue(0);
  const x0 = useMemo(() => ((i * 53) % 100) / 100, [i]);
  useEffect(() => {
    const delay = (i % 8) * 70;
    y.value = withDelay(delay, withTiming(H * 0.75, { duration: 1800 + (i % 5) * 220, easing: Easing.out(Easing.quad) }));
    r.value = withDelay(delay, withTiming(360 * (i % 2 ? 2 : -2), { duration: 2000 }));
  }, [i, r, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { rotate: `${r.value}deg` }] }));
  return <Animated.View style={[styles.piece, { left: x0 * W, backgroundColor: CONFETTI[i % CONFETTI.length], width: 7 + (i % 3) * 3 }, style]} />;
}

const COPY: Record<number, { en: string; hi: string }> = {
  3: { en: 'Three days in a row. A habit is starting.', hi: 'लगातार 3 दिन। आदत बन रही है।' },
  7: { en: 'A full week of logging. This is how patterns show up.', hi: 'पूरा एक हफ्ता। ऐसे ही पैटर्न दिखते हैं।' },
  14: { en: 'Two weeks! Your doctor kit now has real data.', hi: 'दो हफ्ते! आपकी डॉक्टर किट में अब असली डेटा है।' },
  30: { en: 'A whole month. You know your body better than ever.', hi: 'पूरा महीना। आप अपने शरीर को पहले से बेहतर जानती हैं।' },
  60: { en: 'Two months of showing up for yourself.', hi: 'दो महीने खुद के लिए।' },
  100: { en: '100 days. Truly remarkable.', hi: '100 दिन। सच में शानदार।' },
};

/** Full-screen moment when she earns a streak badge. Mounted once in the root layout. */
export function CelebrationHost() {
  const m = useAppStore((s) => s.celebrating);
  const celebrate = useAppStore((s) => s.celebrate);
  const hi = useAppStore((s) => s.profile?.language) === 'hi';

  useEffect(() => {
    if (m) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [m]);

  if (!m) return null;
  const close = () => {
    celebrate(null);
    setTimeout(() => void maybeAskForReview(), 600);
  };
  const next = MILESTONES.find((x) => x > m);

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={close}>
      <View style={styles.scrim}>
        {Array.from({ length: 36 }, (_, i) => (
          <Piece key={i} i={i} />
        ))}
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
          <View style={styles.badge}>
            <Ionicons name="ribbon" size={44} color="#7A4A00" />
            <Text style={styles.badgeNum}>{m}</Text>
          </View>
          <Text style={styles.title}>{hi ? `${m}-दिन की स्ट्रीक! 🎉` : `${m}-day streak! 🎉`}</Text>
          <Text style={styles.body}>{hi ? COPY[m]?.hi : COPY[m]?.en}</Text>
          {next ? <Text style={styles.next}>{hi ? `अगला बैज: ${next} दिन` : `Next badge: ${next} days`}</Text> : null}
          <Pressable onPress={close} style={styles.btn}>
            <Text style={styles.btnText}>{hi ? 'बढ़िया!' : 'Keep going'}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(20,10,24,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  piece: { position: 'absolute', top: 0, height: 12, borderRadius: 2 },
  card: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 30, padding: 24, alignItems: 'center' },
  badge: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#FFC857', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#FFE7A8' },
  badgeNum: { position: 'absolute', bottom: 14, fontFamily: fonts.displayBold, fontSize: 15, color: '#7A4A00' },
  title: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, marginTop: 16, textAlign: 'center' },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 8 },
  next: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#B86A00', marginTop: 12 },
  btn: { alignSelf: 'stretch', backgroundColor: colors.blushDeep, borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#fff' },
});
