import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

const POINTS = [
  {
    en: [
      'Your health data stays on-device in demo',
      'Zustand + AsyncStorage for the Expo Go demo. Production Supabase RLS keeps rows user-scoped.',
    ],
    hi: [
      'डेमो में स्वास्थ्य डेटा डिवाइस पर रहता है',
      'Expo Go डेमो में Zustand + AsyncStorage। प्रोडक्शन में Supabase RLS यूज़र-स्कोप्ड रखेगा।',
    ],
  },
  {
    en: [
      'Community is anonymous by default',
      'Posts don’t require a public name. Flag → human moderation path in production.',
    ],
    hi: [
      'कम्युनिटी डिफ़ॉल्ट अनाम',
      'पोस्ट के लिए सार्वजनिक नाम ज़रूरी नहीं। रिपोर्ट → प्रोडक्शन में मानव मॉडरेशन।',
    ],
  },
  {
    en: [
      'No medical claims',
      'NariCare is an educational companion. Labs, meds, and tips never replace your doctor.',
    ],
    hi: [
      'कोई मेडिकल दावा नहीं',
      'NariCare शैक्षिक साथी है। लैब, दवा और टिप्स डॉक्टर की जगह नहीं लेते।',
    ],
  },
  {
    en: [
      'Payments via Razorpay (when live)',
      'UPI-first. We never store full card numbers in the app.',
    ],
    hi: [
      'पेमेंट Razorpay से (लाइव होने पर)',
      'UPI पहले। ऐप में पूरा कार्ड नंबर कभी स्टोर नहीं।',
    ],
  },
  {
    en: [
      'Exercise demos · attribution',
      'Move GIFs: IconScout Digital License + LottieFiles Simple License (female fitness demos). Bundled on-device — no photo of you is uploaded. See assets/gifs/girl/SOURCES.md.',
    ],
    hi: [
      'एक्सरसाइज़ डेमो · एट्रिब्यूशन',
      'मूव GIF: IconScout Digital License + LottieFiles Simple License (महिला फिटनेस डेमो)। डिवाइस पर बंडल — आपकी फ़ोटो अपलोड नहीं। SOURCES.md देखें।',
    ],
  },
];

export default function Privacy() {
  const lang = useAppStore((s) => s.profile?.language ?? 'en');
  const hi = lang === 'hi';
  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'प्राइवेसी' : 'Privacy',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{hi ? 'भरोसा' : 'Trust'}</Label>
          <Display style={{ marginTop: 6 }}>
            {hi ? 'आपका डेटा,\nआपका नियंत्रण' : 'Your data,\nyour control'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {hi
              ? 'भारतीय महिलाओं के लिए — पीरियड, फर्टिलिटी और पारिवारिक दबाव पर प्राइवेसी ज़रूरी है।'
              : 'Built for Indian women who need privacy around periods, fertility, and family pressure.'}
          </Body>
        </Animated.View>
        {POINTS.map((p) => {
          const [t, d] = hi ? p.hi : p.en;
          return (
            <Card key={p.en[0]} tone="solid" style={{ marginTop: spacing.md }}>
              <Title>{t}</Title>
              <Muted style={{ marginTop: 6 }}>{d}</Muted>
            </Card>
          );
        })}
      </Screen>
    </>
  );
}
