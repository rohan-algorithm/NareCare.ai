import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { tonightPlate } from '@/src/content/patientProblems';
import { CANTEEN_SWAPS } from '@/src/content/canteenSwaps';
import { livingContextLabel } from '@/src/content/meals';
import { useAppStore } from '@/src/store/useAppStore';

export default function Tonight() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const markMeal = useAppStore((s) => s.markMeal);
  const lang = profile?.language ?? 'en';
  const ctx = profile?.livingContext ?? 'family_kitchen';
  const plate = tonightPlate(ctx, lang);
  const showCanteen = ctx === 'hostel_mess' || ctx === 'eating_out';

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'रात की प्लेट' : 'Tonight’s plate',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{livingContextLabel(ctx, lang === 'hi' ? 'hi' : 'en')}</Label>
          <Display style={{ marginTop: 6 }}>
            {lang === 'hi' ? 'आज रात\nक्या खाऊँ?' : 'What do I\neat tonight?'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {lang === 'hi'
              ? 'एक साफ़ जवाब — परफेक्ट डाइट नहीं, असली रसोई।'
              : 'One clear answer — not a perfect diet, your real kitchen.'}
          </Body>
        </Animated.View>

        <Card tone="dark" style={{ marginTop: spacing.lg }}>
          <Label style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'hi' ? 'आपकी प्लेट' : 'Your plate'}
          </Label>
          <Text style={styles.plate}>{plate.title}</Text>
          {plate.steps.map((s, i) => (
            <View key={s} style={styles.stepRow}>
              <Text style={styles.num}>{i + 1}</Text>
              <Title style={{ color: colors.white, flex: 1, fontSize: 15 }}>{s}</Title>
            </View>
          ))}
        </Card>

        <Button
          label={lang === 'hi' ? 'खा लिया · लॉग करें' : 'I ate this · log it'}
          onPress={() => {
            markMeal(`tonight-${new Date().getDate()}`, 'ate');
            router.back();
          }}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          label={lang === 'hi' ? 'आज का पूरा डाइट देखें' : 'See full day diet'}
          variant="secondary"
          onPress={() => router.push('/diet')}
          style={{ marginTop: spacing.sm }}
        />

        {showCanteen && (
          <>
            <Label style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
              {lang === 'hi' ? 'अगर क्रेविंग जीत गई' : 'If cravings win anyway'}
            </Label>
            {CANTEEN_SWAPS.slice(0, 3).map((s) => (
              <View key={s.craving} style={styles.swapRow}>
                <Title style={{ fontSize: 15 }}>{lang === 'hi' ? s.cravingHi : s.craving}</Title>
                <Muted style={{ marginTop: 4 }}>→ {lang === 'hi' ? s.swapHi : s.swap}</Muted>
              </View>
            ))}
          </>
        )}
        <Disclaimer lang={lang} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  plate: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.white,
    marginTop: 10,
    marginBottom: spacing.lg,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    textAlign: 'center',
    lineHeight: 28,
    color: colors.white,
    fontFamily: fonts.bodyBold,
    overflow: 'hidden',
  },
  swapRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
});
