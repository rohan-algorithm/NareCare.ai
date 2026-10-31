import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { BrandMark } from '@/src/ui/BrandMark';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, gradients, shadowCard, spacing } from '@/src/theme/tokens';
import { useLang } from '@/src/i18n/useLang';
import { useAppStore } from '@/src/store/useAppStore';
import { phenotypeLabel } from '@/src/features/phenotype';
import {
  billingConfigured,
  loadPlans,
  purchasePlan,
  restorePurchases,
  type Plan,
} from '@/src/features/billing';
import type { PlanType } from '@/src/types';

const FALLBACK: Record<PlanType, string> = { annual: '₹999', quarterly: '₹299', monthly: '₹149' };
const PERIOD_EN: Record<PlanType, string> = { annual: 'per year', quarterly: 'every 3 months', monthly: 'per month' };
const PERIOD_HI: Record<PlanType, string> = { annual: 'प्रति वर्ष', quarterly: 'हर 3 महीने', monthly: 'प्रति माह' };

export default function Paywall() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const startTrial = useAppStore((s) => s.startTrial);
  const applyEntitlement = useAppStore((s) => s.applyEntitlement);
  const markPaywallSeen = useAppStore((s) => s.markPaywallSeen);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(billingConfigured);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<PlanType>('annual');
  const hi = useLang() === 'hi';
  const focus = phenotypeLabel(profile?.phenotype ?? 'mixed', hi ? 'hi' : 'en');

  useEffect(() => {
    markPaywallSeen();
  }, [markPaywallSeen]);

  useEffect(() => {
    if (!billingConfigured) return;
    loadPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(() => Object.fromEntries(plans.map((p) => [p.id, p])) as Partial<Record<PlanType, Plan>>, [plans]);
  const price = (id: PlanType) => byId[id]?.price ?? FALLBACK[id];
  const hasTrial = billingConfigured ? Boolean(byId[selected]?.hasFreeTrial) : true;

  const compare: [string, string, string][] = [
    [hi ? 'रोज़ का प्लान, पानी, ट्रैकिंग' : 'Daily plan, water & tracking', '✓', '✓'],
    [hi ? 'PCOS जाँच और साइकल अलर्ट' : 'PCOS check & cycle alerts', '✓', '✓'],
    [hi ? 'ट्रेनर वर्कआउट और योग' : 'Trainer workouts & yoga', hi ? '3 मूव' : '3 moves', hi ? 'पूरे + 4 प्रोग्राम' : 'Full + 4 programs'],
    [hi ? 'AI कोच' : 'AI coach', hi ? '3/दिन' : '3 a day', hi ? 'अनलिमिटेड' : 'Unlimited'],
    [hi ? 'खाना प्लान' : 'Meal plan', hi ? 'आज' : 'Today', hi ? '7 दिन + बदलाव' : '7 days + swaps'],
    [hi ? 'नारी ऑटोपायलट' : 'Nari autopilot', '✗', '✓'],
    [hi ? 'थाली और लैब स्कैन' : 'Plate & lab scans', '1', hi ? 'अनलिमिटेड' : 'Unlimited'],
    [hi ? 'डॉक्टर PDF' : 'Doctor PDF', '✗', '✓'],
  ];
  const trialSteps: [string, string, string][] = [
    ['lock-open', hi ? 'आज' : 'Today', hi ? 'सब कुछ अनलॉक। ₹0 चार्ज।' : 'Everything unlocked. You pay ₹0.'],
    ['notifications', hi ? 'दिन 5' : 'Day 5', hi ? 'हम याद दिलाएँगे कि ट्रायल खत्म होने वाला है।' : 'We remind you the trial is ending.'],
    ['card', hi ? 'दिन 7' : 'Day 7', hi ? 'प्लान शुरू। उससे पहले Play Store में कभी भी रद्द करें।' : 'Plan starts. Cancel anytime before in Play Store.'],
  ];


  const plansUi: { id: PlanType; title: string; sub: string; badge?: string }[] = [
    { id: 'annual', title: hi ? 'सालाना' : 'Yearly', sub: hi ? '₹83/महीना · सबसे ज़्यादा बचत' : '₹83/month · best value', badge: hi ? 'सबसे लोकप्रिय' : 'Most popular' },
    { id: 'quarterly', title: hi ? '3 महीने' : '3 months', sub: hi ? '₹100/महीना · स्टूडेंट पिक' : '₹100/month · student pick' },
    { id: 'monthly', title: hi ? 'मासिक' : 'Monthly', sub: hi ? 'कभी भी रद्द करें' : 'Cancel anytime' },
  ];

  const onEntitled = (active: boolean) => {
    if (active) router.replace('/home');
  };

  const subscribe = async () => {
    if (!billingConfigured) {
      if (__DEV__) {
        startTrial(selected);
        router.replace('/home');
        return;
      }
      Alert.alert(hi ? 'भुगतान उपलब्ध नहीं' : 'Payments unavailable', hi ? 'कृपया बाद में फिर कोशिश करें।' : 'Please try again later.');
      return;
    }
    const plan = byId[selected];
    if (!plan) return;
    setBusy(true);
    try {
      const ent = await purchasePlan(plan);
      if (ent) {
        applyEntitlement(ent);
        onEntitled(ent.active);
      }
    } catch (e: any) {
      Alert.alert(hi ? 'भुगतान नहीं हुआ' : 'Payment didn’t go through', e?.message ?? '');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const ent = await restorePurchases();
      applyEntitlement(ent);
      if (ent.active) onEntitled(true);
      else Alert.alert(hi ? 'कोई सब्सक्रिप्शन नहीं मिला' : 'No subscription found');
    } catch {
      Alert.alert(hi ? 'रीस्टोर नहीं हुआ' : 'Could not restore');
    } finally {
      setBusy(false);
    }
  };

  const cta = busy
    ? hi ? 'रुकिए…' : 'Please wait…'
    : !billingConfigured && __DEV__
      ? 'Dev: start local trial'
      : hasTrial
        ? hi ? '7 दिन मुफ़्त शुरू करें' : 'Start 7-day free trial'
        : hi ? `${price(selected)} में शुरू करें` : `Continue for ${price(selected)}`;

  return (
    <Screen scroll variant="immersive">
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.topRow}>
          <BrandMark size={34} showWordmark />
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
            hitSlop={12}
            style={styles.close}
            accessibilityLabel={hi ? 'बंद करें' : 'Close'}
          >
            <Ionicons name="close" size={20} color={colors.ink} />
          </Pressable>
        </View>
        <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.kicker}>{hi ? 'आपका 8-हफ्ते का प्लान तैयार' : 'Your 8-week plan is ready'}</Text>
          <Text style={styles.heroTitle}>
            {profile?.name
              ? `${profile.name}, ${hi ? 'PCOS को अपने हाथ में लें' : 'take charge of your PCOS'}`
              : hi
                ? 'PCOS को अपने हाथ में लें'
                : 'Take charge of your PCOS'}
          </Text>
          <View style={styles.focusPill}>
            <Ionicons name="pulse" size={13} color="#fff" />
            <Text style={styles.focusText}>{focus}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.table}>
        <View style={[styles.tRow, styles.tHead]}>
          <Text style={[styles.tCell, styles.tFeat]} />
          <Text style={[styles.tCell, styles.tHeadText]}>{hi ? 'फ्री' : 'Free'}</Text>
          <Text style={[styles.tCell, styles.tHeadText, { color: colors.blushDeep }]}>Pro</Text>
        </View>
        {compare.map(([feat, free, pro], i) => (
          <View key={feat} style={[styles.tRow, i % 2 === 1 && { backgroundColor: '#FFF7F5' }]}>
            <Text style={[styles.tCell, styles.tFeat]}>{feat}</Text>
            <Text style={[styles.tCell, styles.tVal]}>{free === '✗' ? '—' : free}</Text>
            <Text style={[styles.tCell, styles.tVal, styles.tPro]}>{pro}</Text>
          </View>
        ))}
      </View>

      <View style={styles.anchor}>
        <Ionicons name="pricetag" size={16} color={colors.teal} />
        <Text style={styles.anchorText}>
          {hi
            ? 'डाइटिशियन PCOS प्रोग्राम: ₹2,000+/महीना। NariCare Pro सालाना: ₹83/महीना।'
            : 'Dietitian PCOS programs: ₹2,000+ a month. NariCare Pro yearly: ₹83 a month.'}
        </Text>
      </View>

      {hasTrial ? (
        <View style={styles.timeline}>
          {trialSteps.map(([icon, when, what], i) => (
            <View key={when} style={styles.tlRow}>
              <View style={styles.tlIconCol}>
                <View style={[styles.tlIcon, i === 0 && { backgroundColor: colors.blushDeep }]}>
                  <Ionicons name={icon as any} size={15} color={i === 0 ? '#fff' : colors.blushDeep} />
                </View>
                {i < trialSteps.length - 1 ? <View style={styles.tlLine} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: 12 }}>
                <Text style={styles.tlWhen}>{when}</Text>
                <Text style={styles.tlWhat}>{what}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.blushDeep} style={{ marginTop: spacing.lg }} />
      ) : (
        <View style={{ gap: 10, marginTop: spacing.lg }}>
          {plansUi
            .filter((p) => !billingConfigured || byId[p.id])
            .map((p) => {
              const on = selected === p.id;
              return (
                <Pressable key={p.id} onPress={() => setSelected(p.id)} style={[styles.plan, on && styles.planOn]}>
                  <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? colors.blushDeep : colors.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{p.title}</Text>
                    <Text style={styles.planSub}>{p.sub}</Text>
                  </View>
                  <Text style={styles.planPrice}>{price(p.id)}</Text>
                  {p.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.badge}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
        </View>
      )}

      <Button label={cta} onPress={subscribe} disabled={busy || loading} style={{ marginTop: spacing.lg }} />
      <Pressable onPress={() => router.replace('/home')} hitSlop={8} style={{ alignSelf: 'center', marginTop: 12 }}>
        <Text style={styles.linkMuted}>{hi ? 'अभी फ्री वर्ज़न इस्तेमाल करें' : 'Continue with the free version'}</Text>
      </Pressable>
      <Text style={styles.fine}>
        {hasTrial
          ? hi
            ? 'आज ₹0। ट्रायल खत्म होने से पहले Play Store में कभी भी रद्द करें।'
            : '₹0 today. Cancel anytime in Play Store before the trial ends.'
          : hi
            ? 'Play Store में कभी भी रद्द करें।'
            : 'Cancel anytime in Play Store.'}
      </Text>
      <Text style={styles.fine}>{hi ? 'UPI, कार्ड और नेटबैंकिंग · Google Play से सुरक्षित' : 'UPI, cards & netbanking · secured by Google Play'}</Text>
      <Text style={styles.fine}>
        {hi
          ? `${hasTrial ? '7 दिन के ट्रायल के बाद ' : ''}${price(selected)} ${PERIOD_HI[selected]} अपने-आप रिन्यू होगा, जब तक आप Google Play → Subscriptions में रद्द न करें।`
          : `${hasTrial ? 'After the 7-day trial, ' : ''}${price(selected)} ${PERIOD_EN[selected]} renews automatically until you cancel in Google Play → Subscriptions.`}
      </Text>
      <Pressable onPress={() => router.push('/privacy')} hitSlop={8}>
        <Text style={[styles.fine, { textDecorationLine: 'underline' }]}>{hi ? 'प्राइवेसी और शर्तें' : 'Privacy & terms'}</Text>
      </Pressable>

      <View style={styles.links}>
        <Pressable onPress={() => router.push('/labs')} hitSlop={8}>
          <Text style={styles.link}>{hi ? 'पहले रिपोर्ट मुफ़्त डिकोड करें' : 'Decode a lab report free first'}</Text>
        </Pressable>
        {billingConfigured ? (
          <Pressable onPress={restore} hitSlop={8}>
            <Text style={styles.linkMuted}>{hi ? 'खरीदारी रीस्टोर करें' : 'Restore purchase'}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.fine, { marginTop: spacing.lg }]}>
        {hi ? 'केवल शैक्षिक साथी। निदान या इलाज नहीं।' : 'Educational companion only. Not a diagnosis or treatment.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(28,26,34,0.07)', alignItems: 'center', justifyContent: 'center' },
  hero: { marginTop: spacing.md, borderRadius: 28, padding: spacing.lg, gap: 8, ...shadowCard, shadowColor: '#E24B5A', shadowOpacity: 0.3 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 32, color: '#fff', letterSpacing: -0.6 },
  focusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginTop: 4 },
  focusText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },
  outcomes: { marginTop: spacing.lg, gap: 10 },
  table: { marginTop: spacing.lg, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  tHead: { backgroundColor: colors.blushSoft },
  tCell: { width: 86, textAlign: 'center' },
  tFeat: { flex: 1, width: undefined, textAlign: 'left', fontFamily: fonts.bodyMedium, fontSize: 13.5, color: colors.ink },
  tHeadText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted },
  tVal: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.muted },
  tPro: { fontFamily: fonts.bodyBold, color: colors.good },
  anchor: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E6F2ED', borderRadius: 14, padding: 12, marginTop: spacing.md },
  anchorText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18, color: colors.teal },
  timeline: { marginTop: spacing.lg },
  tlRow: { flexDirection: 'row', gap: 12 },
  tlIconCol: { alignItems: 'center', width: 30 },
  tlIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.blushSoft, alignItems: 'center', justifyContent: 'center' },
  tlLine: { flex: 1, width: 2, backgroundColor: colors.blushSoft, marginVertical: 2 },
  tlWhen: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  tlWhat: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 1 },
  outcome: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  outcomeText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.ink },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: 'transparent', ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  planOn: { borderColor: colors.blushDeep },
  planTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  planSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  planPrice: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.ink },
  badge: { position: 'absolute', top: -10, right: 16, backgroundColor: colors.amber, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10.5, color: colors.ink },
  fine: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  link: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.blushDeep },
  linkMuted: { fontFamily: fonts.bodyMedium, fontSize: 13.5, color: colors.muted },
});
