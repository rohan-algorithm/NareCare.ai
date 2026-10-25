import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { ListRow } from '@/src/ui/ListRow';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Label, Muted } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { phenotypeLabel } from '@/src/features/phenotype';
import { useAppStore } from '@/src/store/useAppStore';

type Link = {
  href: string;
  en: [string, string];
  hi: [string, string];
};

/** Core care — always visible */
const CARE_CORE: Link[] = [
  {
    href: '/ai',
    en: ['AI Coach', 'Food, cycle, labs, cravings'],
    hi: ['AI कोच', 'भोजन, साइकल, लैब, क्रेविंग'],
  },
  {
    href: '/council',
    en: ['Expert Council', 'Today’s advice from the care team'],
    hi: ['एक्सपर्ट काउंसिल', 'आज की देखभाल सलाह'],
  },
];

/** Clinical extras — progressive disclosure */
const CARE_MORE: Link[] = [
  {
    href: '/labs',
    en: ['Lab decoder', 'Report analysis + doctor Qs'],
    hi: ['लैब डिकोडर', 'रिपोर्ट + डॉक्टर सवाल'],
  },
  {
    href: '/doctor-kit',
    en: ['Doctor visit kit', 'One page for your gynae'],
    hi: ['डॉक्टर किट', 'गाइनी के लिए एक पेज'],
  },
  {
    href: '/cycle-calm',
    en: ['Cycle calm', 'Irregular cycles without false promises'],
    hi: ['साइकल शांति', 'अनियमित साइकल · नकली वादे नहीं'],
  },
];

const SETTINGS: Link[] = [
  {
    href: '/reminders',
    en: ['Alarms & reminders', 'Daily schedule'],
    hi: ['अलार्म और रिमाइंडर', 'रोज़ का शेड्यूल'],
  },
  {
    href: '/grocery',
    en: ['Grocery list', 'From this week’s plate'],
    hi: ['किराना लिस्ट', 'इस हफ़्ते की प्लेट से'],
  },
  {
    href: '/weekly',
    en: ['Weekly review', 'What’s working'],
    hi: ['साप्ताहिक समीक्षा', 'क्या काम कर रहा'],
  },
  {
    href: '/meds',
    en: ['Meds & supplements', 'Adherence only · no dosing'],
    hi: ['दवाई और सप्लीमेंट', 'केवल पालन'],
  },
  {
    href: '/privacy',
    en: ['Privacy & trust', 'How we handle your data'],
    hi: ['प्राइवेसी', 'डेटा कैसे संभाला जाता है'],
  },
];

function LinkList({
  links,
  hi,
  onOpen,
}: {
  links: Link[];
  hi: boolean;
  onOpen: (href: string) => void;
}) {
  return (
    <View style={styles.linkBlock}>
      {links.map((l) => {
        const [title, subtitle] = hi ? l.hi : l.en;
        return (
          <ListRow key={l.href} title={title} subtitle={subtitle} onPress={() => onOpen(l.href)} />
        );
      })}
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const subscription = useAppStore((s) => s.subscription);
  const streakDays = useAppStore((s) => s.streakDays);
  const exerciseLogs = useAppStore((s) => s.exerciseLogs);
  const signOut = useAppStore((s) => s.signOut);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [showClinical, setShowClinical] = useState(false);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const open = (href: string) => router.push(href as any);

  return (
    <Screen scroll>
      <ScreenHeader
        door={hi ? 'आप' : 'You'}
        title={profile?.name ?? (hi ? 'आपकी जगह' : 'Your space')}
        subtitle={`${phenotypeLabel(profile?.phenotype ?? 'mixed')} · ${profile?.city ?? 'India'}`}
      />

      <Card tone="solid" style={{ marginTop: spacing.lg }}>
        <Label>Language · भाषा</Label>
        <View style={styles.langRow}>
          <Pressable
            onPress={() => setLanguage('en')}
            style={[styles.langBtn, lang === 'en' && styles.langOn]}
          >
            <Text style={[styles.langText, lang === 'en' && styles.langTextOn]}>English</Text>
          </Pressable>
          <Pressable
            onPress={() => setLanguage('hi')}
            style={[styles.langBtn, lang === 'hi' && styles.langOn]}
          >
            <Text style={[styles.langText, lang === 'hi' && styles.langTextOn]}>हिन्दी</Text>
          </Pressable>
        </View>
      </Card>

      <View style={styles.subLine}>
        <Text style={styles.subValue}>
          {subscription.status === 'trial'
            ? hi
              ? '7-दिन ट्रायल'
              : '7-day trial'
            : subscription.status ?? '—'}
        </Text>
        <Muted>
          {streakDays} {hi ? 'दिन स्ट्रीक' : 'd streak'} · {exerciseLogs.length}{' '}
          {hi ? 'वर्कआउट' : 'workouts'}
        </Muted>
      </View>

      <Label style={{ marginTop: spacing.xl }}>{hi ? 'देखभाल' : 'Care'}</Label>
      <LinkList links={CARE_CORE} hi={hi} onOpen={open} />

      <Pressable onPress={() => setShowClinical((v) => !v)} style={styles.moreToggle}>
        <Text style={styles.moreText}>
          {showClinical
            ? hi
              ? 'क्लिनिकल टूल्स छुपाएँ'
              : 'Hide clinical tools'
            : hi
              ? 'क्लिनिकल टूल्स →'
              : 'Clinical tools →'}
        </Text>
      </Pressable>
      {showClinical && <LinkList links={CARE_MORE} hi={hi} onOpen={open} />}

      <Label style={{ marginTop: spacing.xl }}>{hi ? 'सेटिंग्स' : 'Settings'}</Label>
      <LinkList links={SETTINGS} hi={hi} onOpen={open} />

      <Button
        label={hi ? 'साइन आउट' : 'Sign out'}
        variant="secondary"
        onPress={() => {
          signOut();
          router.replace('/login');
        }}
        style={{ marginTop: spacing.xl }}
      />
      <Muted style={{ marginTop: spacing.md, textAlign: 'center' }}>
        {hi
          ? 'केवल शैक्षिक साथी। निदान या इलाज नहीं।'
          : 'Educational companion only. Not a diagnosis or treatment.'}
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkBlock: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  subLine: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  subValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  moreToggle: { marginTop: spacing.md, marginBottom: spacing.xs },
  moreText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  langRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  langBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.mist,
  },
  langOn: { backgroundColor: colors.blushDeep },
  langText: { fontFamily: fonts.bodyBold, color: colors.ink },
  langTextOn: { color: colors.white },
});
