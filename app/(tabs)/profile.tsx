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
import { useIsPro } from '@/src/features/pro';
import { logStreak } from '@/src/features/streak';
import { Ionicons } from '@/src/ui/Icon';

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
    en: ['Care guide', 'Daily tips from the PCOS guideline'],
    hi: ['केयर गाइड', 'PCOS गाइडलाइन से रोज़ की टिप्स'],
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
  const logs = useAppStore((s) => s.symptomLogs);
  const streakDays = logStreak(logs).current;
  const exerciseLogs = useAppStore((s) => s.exerciseLogs);
  const signOut = useAppStore((s) => s.signOut);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const openPro = useAppStore((s) => s.openPro);
  const startTrial = useAppStore((s) => s.startTrial);
  const applyEntitlement = useAppStore((s) => s.applyEntitlement);
  const pro = useIsPro();
  const pcosCheck = useAppStore((s) => s.pcosCheck);
  const [showClinical, setShowClinical] = useState(false);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';
  const open = (href: string) => router.push(href as any);

  return (
    <Screen scroll>
      <ScreenHeader
        door={hi ? 'आप' : 'You'}
        title={profile?.name ?? (hi ? 'आपकी जगह' : 'Your space')}
        subtitle={`${phenotypeLabel(profile?.phenotype ?? 'mixed', hi ? 'hi' : 'en')} · ${profile?.city ?? (hi ? 'भारत' : 'India')}`}
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

      <Pressable onPress={() => (pro ? undefined : openPro('generic'))} style={[styles.proCard, pro && styles.proCardOn]}>
        <View style={styles.proBadge}>
          <Ionicons name="ribbon" size={20} color="#7A4A00" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.proTitle}>
            {pro ? (subscription.status === 'trial' ? (hi ? 'Pro · फ्री ट्रायल' : 'Pro · free trial') : 'NariCare Pro') : hi ? 'Pro लें' : 'Go Pro'}
          </Text>
          <Muted>
            {pro
              ? `${streakDays} ${hi ? 'दिन स्ट्रीक' : 'day streak'} · ${exerciseLogs.length} ${hi ? 'वर्कआउट' : 'workouts'}`
              : hi
                ? 'पूरे वर्कआउट, AI कोच, 7-दिन खाना प्लान'
                : 'Full workouts, AI coach, 7-day meal plan'}
          </Muted>
        </View>
        {!pro ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
      </Pressable>
      <Pressable onPress={() => router.push('/pcos-check' as any)} style={styles.checkCard}>
        <View style={[styles.proBadge, { backgroundColor: '#FCE4F0' }]}>
          <Ionicons name="pulse" size={20} color="#B4236B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.proTitle}>{hi ? 'PCOS जाँच स्कोर' : 'PCOS check score'}</Text>
          <Muted>
            {pcosCheck
              ? hi
                ? `${pcosCheck.score}/100 · ${new Date(pcosCheck.date).toLocaleDateString()}`
                : `${pcosCheck.score}/100 · taken ${new Date(pcosCheck.date).toLocaleDateString()}`
              : hi
                ? '10 सवाल, 2 मिनट'
                : '10 questions, 2 minutes'}
          </Muted>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      {__DEV__ ? (
        <Pressable
          onPress={() => (pro ? applyEntitlement({ active: false, plan: null, isTrial: false, expiresAt: null }) : startTrial('annual'))}
          style={{ alignSelf: 'center', marginTop: 8 }}
        >
          <Text style={styles.moreText}>{pro ? 'Dev: switch to free' : 'Dev: switch to Pro trial'}</Text>
        </Pressable>
      ) : null}

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
  proCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: spacing.md, padding: 14, borderRadius: 20, backgroundColor: '#FFF4D6', borderWidth: 1, borderColor: '#F5D88A' },
  proCardOn: { backgroundColor: '#fff', borderColor: colors.line },
  proBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFC857', alignItems: 'center', justifyContent: 'center' },
  checkCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  proTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  linkBlock: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
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
