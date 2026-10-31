import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Ionicons, type IconName } from '@/src/ui/Icon';
import { colors, fonts } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { billingConfigured, loadPlans, purchasePlan, type Plan } from '@/src/features/billing';
import { PRO_HEADLINE } from '@/src/features/pro';

const BENEFITS: { icon: IconName; en: string; hi: string }[] = [
  { icon: 'fitness', en: 'Full workouts & 4 adaptive programs', hi: 'पूरे वर्कआउट और 4 एडैप्टिव प्रोग्राम' },
  { icon: 'sparkles', en: 'Unlimited AI coach that acts for you', hi: 'अनलिमिटेड AI कोच जो आपके लिए काम करे' },
  { icon: 'restaurant', en: '7-day meal plan for your taste', hi: 'आपके स्वाद का 7-दिन खाना प्लान' },
  { icon: 'document-text', en: 'Doctor PDF, plate & lab scans', hi: 'डॉक्टर PDF, थाली और लैब स्कैन' },
];

/** The Go Pro sheet. Mounted once in the root layout; any screen opens it with `openPro(reason)`. */
export function ProSheetHost() {
  const router = useRouter();
  const reason = useAppStore((s) => s.proSheet);
  const close = useAppStore((s) => s.closePro);
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const startTrial = useAppStore((s) => s.startTrial);
  const applyEntitlement = useAppStore((s) => s.applyEntitlement);
  const [annual, setAnnual] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!reason || !billingConfigured || annual) return;
    loadPlans()
      .then((p) => setAnnual(p.find((x) => x.id === 'annual') ?? p[0] ?? null))
      .catch(() => undefined);
  }, [reason, annual]);

  if (!reason) return null;
  const [title, sub] = PRO_HEADLINE[reason][hi ? 'hi' : 'en'];
  const price = annual?.price ?? '₹999';
  const trial = billingConfigured ? Boolean(annual?.hasFreeTrial) : true;

  const buy = async () => {
    if (!billingConfigured) {
      if (__DEV__) {
        startTrial('annual');
        close();
        return;
      }
      close();
      router.push('/paywall');
      return;
    }
    if (!annual) {
      close();
      router.push('/paywall');
      return;
    }
    setBusy(true);
    try {
      const ent = await purchasePlan(annual);
      if (ent) {
        applyEntitlement(ent);
        if (ent.active) close();
      }
    } catch (e: any) {
      Alert.alert(hi ? 'भुगतान नहीं हुआ' : 'Payment didn’t go through', e?.message ?? '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.scrim}>
        <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.card}>
          <LinearGradient colors={['#FF8A7A', '#E24B5A', '#7A2E6B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.head}>
            <View style={styles.orb} />
            <Pressable onPress={close} hitSlop={12} style={styles.x} accessibilityLabel={hi ? 'बंद करें' : 'Close'}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
            <View style={styles.badge}>
              <Ionicons name="ribbon" size={34} color="#7A4A00" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{sub}</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {trial ? (hi ? '7 दिन मुफ़्त · फिर ₹83/महीना' : '7 days free · then ₹83/month') : hi ? `${price}/साल · ₹83/महीना` : `${price}/year · ₹83/month`}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {BENEFITS.map((b) => (
              <View key={b.en} style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name={b.icon} size={17} color="#FFB3A8" />
                </View>
                <Text style={styles.rowText}>{hi ? b.hi : b.en}</Text>
                <Ionicons name="checkmark-circle" size={22} color="#3DDC97" />
              </View>
            ))}

            <Pressable onPress={buy} disabled={busy} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
              <LinearGradient colors={['#FF7A6A', '#E24B5A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaFill}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaText}>{trial ? (hi ? '7 दिन मुफ़्त शुरू करें' : 'Start 7-day free trial') : hi ? `${price} में अनलॉक करें` : `Unlock for ${price}`}</Text>
                )}
              </LinearGradient>
            </Pressable>
            <Text style={styles.fine}>{hi ? 'Google Play से · UPI चलेगा · कभी भी रद्द करें' : 'Via Google Play · UPI accepted · cancel anytime'}</Text>
            <View style={styles.links}>
              <Pressable
                hitSlop={8}
                onPress={() => {
                  close();
                  router.push('/paywall');
                }}
              >
                <Text style={styles.link}>{hi ? 'सारे प्लान देखें' : 'See all plans'}</Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={close}>
                <Text style={styles.later}>{hi ? 'बाद में' : 'Maybe later'}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const PLUM = '#2A1631';

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(20,10,24,0.62)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: { width: '100%', maxWidth: 420, borderRadius: 30, overflow: 'hidden', backgroundColor: PLUM },
  head: { alignItems: 'center', paddingTop: 26, paddingBottom: 20, paddingHorizontal: 22, overflow: 'hidden' },
  orb: { position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -80, top: -90, backgroundColor: 'rgba(255,255,255,0.12)' },
  x: { position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFC857',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  title: { fontFamily: fonts.displayBold, fontSize: 24, lineHeight: 30, color: '#fff', textAlign: 'center', marginTop: 12, letterSpacing: -0.4 },
  sub: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 6 },
  pill: { marginTop: 14, backgroundColor: '#FFC857', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#4A2C00' },
  body: { padding: 18, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 12 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,122,106,0.16)', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
  cta: { marginTop: 6, borderRadius: 999, overflow: 'hidden' },
  ctaFill: { paddingVertical: 17, alignItems: 'center' },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 17, color: '#fff' },
  fine: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginTop: 2 },
  link: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.blush },
  later: { fontFamily: fonts.bodyMedium, fontSize: 14, color: 'rgba(255,255,255,0.6)' },
});
