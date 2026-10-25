import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { BrandMark } from '@/src/ui/BrandMark';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { phenotypeLabel } from '@/src/features/phenotype';
import type { PlanType } from '@/src/types';

export default function Paywall() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const startTrial = useAppStore((s) => s.startTrial);
  const [plan, setPlan] = useState<PlanType>('annual');
  const hi = profile?.language === 'hi';
  const pheno = phenotypeLabel(profile?.phenotype ?? 'mixed', hi ? 'hi' : 'en');

  const start = () => {
    startTrial(plan);
    router.replace('/home');
  };

  return (
    <Screen scroll variant="immersive">
      <Animated.View entering={FadeInDown.duration(400)}>
        <BrandMark size={40} showWordmark />
        <Label style={{ marginTop: spacing.md }}>
          {hi ? 'आपका प्लान तैयार' : 'Your plan is ready'}
        </Label>
        <Display style={{ marginTop: 6 }}>
          {profile?.name
            ? hi
              ? `${profile.name},\nजब आप तैयार हों`
              : `${profile.name},\nyou are ready`
            : hi
              ? 'जब आप\nतैयार हों'
              : 'Ready when\nyou are'}
        </Display>
        <Body style={{ marginTop: spacing.md, color: colors.muted }}>
          {hi
            ? `खाएँ · मूव · ट्रैक · पूछें — ${pheno}`
            : `Eat · Move · Track · Ask — ${pheno}`}
        </Body>
      </Animated.View>

      <Card tone="gold" style={{ marginTop: spacing.xl }}>
        <Text style={styles.teaser}>
          {hi
            ? 'मूंग चीला · मिलेट खिचड़ी · बटरफ्लाई योग'
            : 'Moong Cheela · Millet Khichdi · Butterfly Yoga'}
        </Text>
        <View style={styles.lock}>
          <Text style={styles.lockText}>
            {hi ? '7-दिन मुफ़्त ट्रायल से अनलॉक' : 'Unlock with 7-day free trial'}
          </Text>
        </View>
      </Card>

      <Pressable onPress={() => setPlan('annual')} style={{ marginTop: spacing.lg }}>
        <Card tone={plan === 'annual' ? 'dark' : 'solid'}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {hi ? 'बेस्ट वैल्यू · 44% बचत' : 'Best value · Save 44%'}
            </Text>
          </View>
          <Text style={[styles.price, plan === 'annual' && { color: colors.white }]}>
            ₹999 / {hi ? 'वर्ष' : 'year'}
          </Text>
          <Muted style={plan === 'annual' ? { color: 'rgba(255,255,255,0.65)' } : undefined}>
            ₹83 / {hi ? 'महीना · सुझाया गया' : 'month · Recommended'}
          </Muted>
        </Card>
      </Pressable>

      <Pressable onPress={() => setPlan('monthly')} style={{ marginTop: spacing.md }}>
        <Card tone={plan === 'monthly' ? 'dark' : 'solid'}>
          <Text style={[styles.price, plan === 'monthly' && { color: colors.white }]}>
            ₹149 / {hi ? 'महीना' : 'month'}
          </Text>
          <Muted style={plan === 'monthly' ? { color: 'rgba(255,255,255,0.65)' } : undefined}>
            {hi ? 'लचीला · कभी भी रद्द' : 'Flexible · Cancel anytime'}
          </Muted>
        </Card>
      </Pressable>

      <Button
        label={hi ? '7-दिन मुफ़्त ट्रायल शुरू' : 'Start 7-day free trial'}
        onPress={start}
        style={{ marginTop: spacing.xl }}
      />
      <Muted style={{ textAlign: 'center', marginTop: spacing.md }}>
        {hi ? 'UPI पहले · Razorpay · कभी भी रद्द' : 'UPI-first via Razorpay · Cancel anytime'}
      </Muted>

      <View style={styles.trust}>
        <Trust text={hi ? 'खाएँ · मूव · ट्रैक · पूछें — रोज़' : 'Eat · Move · Track · Ask — daily'} />
        <Trust text={hi ? 'ज़रूरत पर Soft day' : 'Soft day when you need rest'} />
        <Trust text={hi ? 'एक्सपर्ट काउंसिल + AI कोच' : 'Expert Council + AI coach'} />
        <Trust text={hi ? 'साप्ताहिक Progress Pulse' : 'Weekly Progress Pulse'} />
      </View>
      <Muted style={{ textAlign: 'center', marginTop: spacing.lg }}>
        {hi
          ? 'केवल शैक्षिक साथी। निदान या इलाज नहीं।'
          : 'Educational companion only. Not a diagnosis or treatment.'}
      </Muted>
    </Screen>
  );
}

function Trust({ text }: { text: string }) {
  return (
    <View style={styles.trustRow}>
      <View style={styles.trustDot} />
      <Title style={{ fontSize: 14 }}>{text}</Title>
    </View>
  );
}

const styles = StyleSheet.create({
  teaser: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.amber,
    lineHeight: 26,
  },
  lock: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  lockText: { fontFamily: fonts.bodyBold, color: colors.forest, fontSize: 12 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amber,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink },
  price: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  trust: { marginTop: spacing.xl, gap: 12 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blushDeep,
  },
});
