import * as Speech from 'expo-speech';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { sendCoachMessage } from '@/src/features/coachAgent';
import { useAppStore } from '@/src/store/useAppStore';
import { LESSON_BY_ID, LESSONS, WEEK_THEMES } from '@/src/content/academy';

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSON_BY_ID[id ?? ''];
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const done = useAppStore((s) => s.lessonsDone);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => void Speech.stop(), []);

  if (!lesson) return null;
  const lang = hi ? 'hi' : 'en';
  const paras = lesson.body[lang];
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const following = LESSONS[idx + 1];
  const isDone = done.includes(lesson.id);

  const listen = () => {
    if (speaking) {
      void Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(`${lesson.title[lang]}. ${paras.join(' ')}`, {
      language: hi ? 'hi-IN' : 'en-IN',
      rate: 0.92,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const finish = () => {
    completeLesson(lesson.id);
    if (following) router.replace(`/learn/${following.id}` as any);
    else router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: hi ? `हफ्ता ${lesson.week}` : `Week ${lesson.week}`, headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface }, headerShadowVisible: false }} />
      <Screen scroll>
        <Text style={styles.kicker}>{hi ? WEEK_THEMES[lesson.week - 1].hi : WEEK_THEMES[lesson.week - 1].en}</Text>
        <Text style={styles.title}>{lesson.title[lang]}</Text>
        <Pressable onPress={listen} style={styles.listen}>
          <Ionicons name={speaking ? 'stop-circle' : 'volume-high'} size={18} color={colors.blushDeep} />
          <Text style={styles.listenText}>{speaking ? (hi ? 'रोकें' : 'Stop') : hi ? 'सुनें' : 'Listen'}</Text>
        </Pressable>
        {paras.map((p, i) => (
          <Animated.Text key={i} entering={FadeInDown.delay(60 * i).duration(320)} style={styles.para}>
            {p}
          </Animated.Text>
        ))}
        <View style={styles.try}>
          <Text style={styles.tryKicker}>{hi ? 'आज आज़माएँ' : 'Try today'}</Text>
          <Text style={styles.tryText}>{lesson.tryToday[lang]}</Text>
          {lesson.href ? (
            <Pressable onPress={() => router.push(lesson.href as any)} style={styles.tryBtn}>
              <Text style={styles.tryBtnText}>{hi ? 'खोलें' : 'Open'}</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.forest} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            void sendCoachMessage(hi ? `"${lesson.title.hi}" के बारे में मेरे लिए समझाएँ` : `Explain "${lesson.title.en}" for my situation`);
            router.push('/coach' as any);
          }}
          style={styles.ask}
        >
          <Ionicons name="sparkles" size={16} color="#7C5CFF" />
          <Text style={styles.askText}>{hi ? 'AI कोच से अपने बारे में पूछें' : 'Ask the AI coach how this applies to you'}</Text>
        </Pressable>
        <Button
          label={isDone ? (following ? (hi ? 'अगला पाठ' : 'Next lesson') : hi ? 'वापस' : 'Back') : hi ? 'पूरा किया ✓' : 'Mark as done ✓'}
          onPress={finish}
          style={{ marginTop: spacing.lg }}
        />
        <Text style={styles.foot}>{hi ? 'शैक्षिक जानकारी, इलाज नहीं। दवा के लिए डॉक्टर से पूछें।' : 'Educational, not medical advice. Ask your doctor about medicines.'}</Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.blushDeep, marginTop: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 34, color: colors.ink, letterSpacing: -0.6, marginTop: 6 },
  listen: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 10, backgroundColor: colors.blushSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  listenText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.blushDeep },
  para: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.ink, marginTop: spacing.md },
  try: { backgroundColor: '#E2F4EC', borderRadius: 20, padding: spacing.md, marginTop: spacing.lg, gap: 6 },
  tryKicker: { fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.forest },
  tryText: { fontFamily: fonts.bodyBold, fontSize: 15.5, lineHeight: 22, color: colors.ink },
  tryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginTop: 4 },
  tryBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.forest },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginTop: spacing.sm, ...shadowCard, shadowOpacity: 0.05, elevation: 1 },
  askText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  foot: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, textAlign: 'center', marginTop: spacing.md },
});
