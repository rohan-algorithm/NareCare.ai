import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Localization from 'expo-localization';

import { Screen } from '@/src/ui/Screen';
import { BrandMark } from '@/src/ui/BrandMark';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Body, Display, Label, Muted } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

export default function Login() {
  const router = useRouter();
  const signInDemo = useAppStore((s) => s.signInDemo);
  const skipSignupDemo = useAppStore((s) => s.skipSignupDemo);
  const profile = useAppStore((s) => s.profile);
  const [email, setEmail] = useState('');
  const hi =
    profile?.language === 'hi' ||
    (!profile && (Localization.getLocales()[0]?.languageCode ?? 'en') === 'hi');

  const continueIn = () => {
    signInDemo();
    router.replace(profile ? '/paywall' : '/setup');
  };

  const skipSignup = () => {
    skipSignupDemo();
    router.replace('/home');
  };

  return (
    <Screen scroll variant="immersive">
      <Animated.View entering={FadeInDown.duration(400)}>
        <BrandMark size={44} showWordmark />
        <Label style={{ marginTop: spacing.md }}>PCOS · भारत</Label>
        <Muted style={{ marginTop: 4 }}>
          {hi ? 'खाएँ · मूव · ट्रैक · पूछें' : 'Eat · Move · Track · Ask'}
        </Muted>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(450)} style={{ marginTop: spacing.xl }}>
        <Display>
          {hi ? 'वापस अपनी\nलय में' : 'Welcome back\nto your rhythm'}
        </Display>
        <Body style={{ marginTop: spacing.md, color: colors.muted, maxWidth: 320 }}>
          {hi
            ? 'एक बार साइन इन — फिर प्लेट, मूव, लक्षण और AI कोच तैयार।'
            : 'Sign in once — then plate, move, symptoms, and AI coach are ready.'}
        </Body>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(450)} style={{ marginTop: spacing.xl }}>
        <Button
          label={hi ? 'Google से जारी रखें' : 'Continue with Google'}
          onPress={continueIn}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>{hi ? 'या ईमेल OTP' : 'or email OTP'}</Text>
          <View style={styles.line} />
        </View>

        <Card tone="solid" style={{ padding: 0 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </Card>
        <Button
          label={hi ? 'OTP भेजें' : 'Send OTP'}
          variant="secondary"
          onPress={continueIn}
          style={{ marginTop: spacing.md }}
        />
      </Animated.View>

      <Card tone="rose" style={{ marginTop: spacing.xl }}>
        <Text style={styles.demoTitle}>{hi ? 'डेमो आज़माएँ' : 'Try the demo'}</Text>
        <Muted style={{ marginBottom: spacing.md }}>
          {hi
            ? 'होम पर सैंपल प्रोफ़ाइल के साथ — बिना साइनअप।'
            : 'Jump into Home with a sample profile — no signup friction.'}
        </Muted>
        <Button
          label={hi ? 'साइनअप छोड़ें · डेमो' : 'Skip signup — enter demo'}
          variant="secondary"
          onPress={skipSignup}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.lineStrong },
  or: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  demoTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 6,
  },
});
