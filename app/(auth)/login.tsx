import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { BrandMark } from '@/src/ui/BrandMark';
import { Button } from '@/src/ui/Button';
import { Body, Display, Label, Muted } from '@/src/ui/Typography';
import { colors, spacing } from '@/src/theme/tokens';
import { useLang } from '@/src/i18n/useLang';
import { useAppStore } from '@/src/store/useAppStore';

export default function Login() {
  const router = useRouter();
  const signInDemo = useAppStore((s) => s.signInDemo);
  const skipSignupDemo = useAppStore((s) => s.skipSignupDemo);
  const profile = useAppStore((s) => s.profile);
  const hi = useLang() === 'hi';

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
        <Display>{hi ? 'फिर से स्वागत है' : 'Welcome back'}</Display>
        <Body style={{ marginTop: spacing.md, color: colors.muted, maxWidth: 320 }}>
          {hi
            ? 'आपका प्लान इसी फ़ोन पर सुरक्षित है। Pro खरीदा है तो Google Play से अपने-आप वापस आ जाएगा।'
            : 'Your plan is kept on this phone. If you bought Pro, it comes back automatically from Google Play.'}
        </Body>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(450)} style={{ marginTop: spacing.xl }}>
        <Button label={hi ? 'जारी रखें' : 'Continue'} onPress={continueIn} />
        {__DEV__ ? <Button label="Dev: demo profile" variant="ghost" onPress={skipSignup} style={{ marginTop: spacing.sm }} /> : null}
      </Animated.View>
    </Screen>
  );
}
