import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen } from '@/src/ui/Screen';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, gradients, shadowCard, spacing } from '@/src/theme/tokens';
import { FREE, useIsPro } from '@/src/features/pro';
import { useAppStore } from '@/src/store/useAppStore';
import { LESSONS, WEEK_THEMES, nextLesson, programWeek } from '@/src/content/academy';

export default function Learn() {
  const router = useRouter();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const goals = useAppStore((s) => s.profile?.goals ?? []);
  const done = useAppStore((s) => s.lessonsDone);
  const pro = useIsPro();
  const programStart = useAppStore((s) => s.programStart);
  const ensureProgramStart = useAppStore((s) => s.ensureProgramStart);
  useEffect(() => ensureProgramStart(), [ensureProgramStart]);

  const week = programWeek(programStart);
  const next = nextLesson(week, done, goals);
  const pct = Math.round((done.length / LESSONS.length) * 100);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: hi ? 'PCOS अकादमी' : 'PCOS Academy', headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface }, headerShadowVisible: false }} />
      <Screen scroll>
        <LinearGradient colors={[...gradients.forest]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.kicker}>{hi ? `हफ्ता ${week} / 8` : `Week ${week} of 8`}</Text>
          <Text style={styles.heroTitle}>{hi ? WEEK_THEMES[week - 1].hi : WEEK_THEMES[week - 1].en}</Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.heroSub}>
            {hi ? `${done.length}/${LESSONS.length} पाठ पूरे · हर पाठ 2 मिनट` : `${done.length}/${LESSONS.length} lessons done · 2 minutes each`}
          </Text>
          {next ? (
            <Pressable onPress={() => router.push(`/learn/${next.id}` as any)} style={styles.cta}>
              <Text style={styles.ctaText}>{hi ? `अगला: ${next.title.hi}` : `Next: ${next.title.en}`}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.forest} />
            </Pressable>
          ) : null}
        </LinearGradient>

        {WEEK_THEMES.map((theme, wi) => {
          const w = wi + 1;
          const locked = w > Math.min(8, week + 1);
          return (
            <View key={w} style={[styles.week, locked && { opacity: 0.55 }]}>
              <Text style={styles.weekTitle}>
                {hi ? `हफ्ता ${w}` : `Week ${w}`} · {hi ? theme.hi : theme.en}
              </Text>
              {LESSONS.filter((l) => l.week === w).map((l) => {
                const isDone = done.includes(l.id);
                const proLocked = !pro && LESSONS.indexOf(l) >= FREE.lessons;
                return (
                  <Pressable key={l.id} disabled={locked} onPress={() => router.push(`/learn/${l.id}` as any)} style={styles.lesson}>
                    <Ionicons
                      name={isDone ? 'checkmark-circle' : locked || proLocked ? 'lock-closed-outline' : 'play-circle-outline'}
                      size={22}
                      color={isDone ? colors.good : locked ? colors.muted : colors.blushDeep}
                    />
                    <Text style={[styles.lessonText, isDone && { color: colors.muted }]}>{hi ? l.title.hi : l.title.en}</Text>
                    <Text style={styles.min}>2 min</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <Text style={styles.foot}>
          {hi
            ? 'अंतरराष्ट्रीय PCOS गाइडलाइन (2023) पर आधारित। शैक्षिक जानकारी, इलाज नहीं।'
            : 'Based on the 2023 International PCOS Guideline. Educational, not medical advice.'}
        </Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 26, padding: spacing.lg, gap: 8, marginTop: spacing.sm },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: '#fff', letterSpacing: -0.4 },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', marginTop: 4 },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#9FE0C4' },
  heroSub: { fontFamily: fonts.body, fontSize: 12.5, color: 'rgba(255,255,255,0.8)' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginTop: 6, maxWidth: '100%' },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.forest, flexShrink: 1 },
  week: { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, marginTop: spacing.sm, ...shadowCard, shadowOpacity: 0.05, elevation: 1 },
  weekTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted, marginBottom: 6 },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  lessonText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.ink },
  min: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  foot: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
});
