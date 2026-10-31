import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { Card } from '@/src/ui/Card';
import { Body, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, shadow, spacing } from '@/src/theme/tokens';
import { COUNCIL, ROLE_LABEL, type CouncilMember } from '@/src/content/council';
import { FAMILY_SCRIPTS } from '@/src/content/familyScripts';
import { buildTodayBoard } from '@/src/features/todayBoard';
import { getCycleDay, getCyclePhase } from '@/src/features/cycle';
import { useAppStore } from '@/src/store/useAppStore';

type Tab = 'today' | 'team' | 'scripts';

const TABS: { id: Tab; en: string; hi: string }[] = [
  { id: 'today', en: 'Today', hi: 'आज' },
  { id: 'team', en: 'Team', hi: 'टीम' },
  { id: 'scripts', en: 'Scripts', hi: 'जवाब' },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function toneBg(tone: CouncilMember['avatarTone']) {
  if (tone === 'blush') return colors.blushSoft;
  if (tone === 'amber') return colors.amberSoft;
  if (tone === 'mist') return colors.mist;
  return colors.mistDeep;
}

function toneFg(tone: CouncilMember['avatarTone']) {
  if (tone === 'blush') return colors.blushDeep;
  if (tone === 'amber') return colors.amber;
  return colors.forest;
}

export default function CouncilScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('today');
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.symptomLogs);
  const done = useAppStore((s) => s.councilTodayDone);
  const toggleCouncilAsk = useAppStore((s) => s.toggleCouncilAsk);
  const resetCouncilIfNeeded = useAppStore((s) => s.resetCouncilIfNeeded);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';

  useEffect(() => {
    resetCouncilIfNeeded();
  }, [resetCouncilIfNeeded]);

  const cycleDay = getCycleDay(logs);
  const phase = getCyclePhase(cycleDay, logs);
  const todayAsks = useMemo(
    () =>
      buildTodayBoard({
        phase,
        phenotype: profile?.phenotype ?? 'mixed',
        livingContext: profile?.livingContext ?? 'family_kitchen',
      }),
    [phase, profile?.phenotype, profile?.livingContext],
  );
  const doneCount = todayAsks.filter((a) => done[a.id]).length;

  return (
    <Screen scroll>
      <ScreenHeader
        door={hi ? 'देखभाल' : 'Care'}
        title={hi ? 'केयर गाइड' : 'Care guide'}
        subtitle={
          hi
            ? `${doneCount}/${todayAsks.length} आज · साइकल + phenotype`
            : `${doneCount}/${todayAsks.length} today · cycle + phenotype`
        }
      />

      <Muted style={{ marginTop: spacing.sm, marginBottom: spacing.sm }}>
        {hi
          ? 'NariCare टीम ने 2023 अंतरराष्ट्रीय PCOS गाइडलाइन से लिखा। यह आपके डॉक्टर की सलाह की जगह नहीं है।'
          : 'Written by the NariCare team from the 2023 International PCOS Guideline. Not a substitute for your own doctor.'}
      </Muted>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tab, tab === t.id && styles.tabOn]}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextOn]}>
              {hi ? t.hi : t.en}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'today' && (
        <View>
          {todayAsks.map((ask, i) => {
            const member = COUNCIL.find((m) => m.id === ask.memberId)!;
            const isDone = !!done[ask.id];
            return (
              <Animated.View key={ask.id} entering={FadeInDown.delay(40 * i).duration(360)}>
                <Pressable
                  onPress={() => {
                    toggleCouncilAsk(ask.id);
                    if (ask.href && ask.href !== '/home') router.push(ask.href as any);
                  }}
                  style={[styles.askRow, isDone && styles.askDone]}
                >
                  <View style={[styles.avatar, { backgroundColor: toneBg(member.avatarTone) }]}>
                    <Text style={[styles.avatarText, { color: toneFg(member.avatarTone) }]}>
                      {initials(member.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.askFrom}>
                      {hi ? member.nameHi : member.name} ·{' '}
                      {ROLE_LABEL[ask.role][hi ? 'hi' : 'en']}
                    </Text>
                    <Title style={{ marginTop: 2 }}>{hi ? ask.titleHi : ask.title}</Title>
                    <Muted style={{ marginTop: 4 }}>{hi ? ask.detailHi : ask.detail}</Muted>
                  </View>
                  <View style={[styles.check, isDone && styles.checkOn]}>
                    <Text style={{ color: isDone ? colors.white : colors.muted }}>
                      {isDone ? '✓' : ''}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      {tab === 'team' &&
        COUNCIL.map((m, i) => (
          <Animated.View key={m.id} entering={FadeInDown.delay(40 * i).duration(360)}>
            <Card tone="solid" style={{ marginBottom: spacing.sm }}>
              <View style={styles.memberTop}>
                <View style={[styles.avatarLg, { backgroundColor: toneBg(m.avatarTone) }]}>
                  <Text style={[styles.avatarTextLg, { color: toneFg(m.avatarTone) }]}>
                    {initials(m.name)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Title>{hi ? m.nameHi : m.name}</Title>
                  <Muted style={{ marginTop: 2 }}>{hi ? m.titleHi : m.title}</Muted>
                  <Text style={styles.city}>
                    {m.credentials}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

      {tab === 'scripts' &&
        FAMILY_SCRIPTS.map((s, i) => (
          <Animated.View key={s.id} entering={FadeInDown.delay(40 * i).duration(360)}>
            <Card tone="gold" style={{ marginBottom: spacing.sm }}>
              <Label>{hi ? 'जब वे कहें' : 'When they say'}</Label>
              <Title style={{ marginTop: 6 }}>“{hi ? s.triggerHi : s.trigger}”</Title>
              <Label style={{ marginTop: spacing.md }}>{hi ? 'आप कह सकते हो' : 'You can say'}</Label>
              <Body style={{ marginTop: 6 }}>{hi ? s.replyHi : s.reply}</Body>
            </Card>
          </Animated.View>
        ))}

      <Muted style={{ marginTop: spacing.lg, textAlign: 'center' }}>
        {hi
          ? 'शैक्षिक परिषद · चिकित्सा सलाह का विकल्प नहीं'
          : 'Educational council · Not a substitute for medical advice'}
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  tabOn: { backgroundColor: colors.blushDeep },
  tabText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  tabTextOn: { color: colors.white },
  askRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  askDone: { backgroundColor: colors.mist },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bodyBold, fontSize: 12 },
  avatarLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextLg: { fontFamily: fonts.bodyBold, fontSize: 15 },
  askFrom: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.tealMid,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  memberTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  city: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 17,
  },
});
