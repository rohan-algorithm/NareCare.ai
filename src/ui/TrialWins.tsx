import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { Ionicons } from '@/src/ui/Icon';

const DAY = 864e5;

export function TrialWins() {
  const router = useRouter();
  const sub = useAppStore((s) => s.subscription);
  const logs = useAppStore((s) => s.symptomLogs);
  const moves = useAppStore((s) => s.exerciseLogs);
  const labs = useAppStore((s) => s.labAnalyses);
  const chat = useAppStore((s) => s.chat);
  const kits = useAppStore((s) => s.doctorKitExports);
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const [now] = useState(() => Date.now());

  if (sub.status !== 'trial' || !sub.trialEndsAt) return null;
  const end = new Date(sub.trialEndsAt).getTime();
  const start = sub.startedAt ? new Date(sub.startedAt).getTime() : end - 7 * DAY;
  const day = Math.min(7, Math.max(1, Math.floor((now - start) / DAY) + 1));
  const left = Math.max(0, Math.ceil((end - now) / DAY));

  const wins = [
    { done: logs.length >= 1, en: 'Log your first day', hi: 'पहला दिन लॉग करें', href: '/track' },
    { done: moves.some((m) => m.completed), en: 'Finish one 15-min move', hi: 'एक 15-मिनट मूव पूरा करें', href: '/move?start=1' },
    { done: labs.length >= 1, en: 'Decode a lab report', hi: 'एक लैब रिपोर्ट डिकोड करें', href: '/labs' },
    { done: chat.some((m) => m.role === 'user'), en: 'Ask the AI coach one question', hi: 'AI कोच से एक सवाल पूछें', href: '/coach' },
    { done: logs.length >= 3, en: 'Log 3 days (unlocks your first insight)', hi: '3 दिन लॉग करें (पहली इनसाइट)', href: '/track' },
    { done: kits >= 1, en: 'Create your doctor PDF', hi: 'डॉक्टर PDF बनाएँ', href: '/doctor-kit' },
  ];
  const done = wins.filter((w) => w.done).length;
  const next = wins.find((w) => !w.done);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.kicker}>
          {hi ? `ट्रायल दिन ${day}/7` : `Trial day ${day} of 7`}
          {left <= 2 ? (hi ? ` · ${left} दिन बाकी` : ` · ${left} day${left === 1 ? '' : 's'} left`) : ''}
        </Text>
        <Text style={styles.count}>{done}/{wins.length}</Text>
      </View>
      <Text style={styles.title}>
        {done >= 4
          ? hi ? 'आपकी नींव तैयार है' : 'Your foundation is built'
          : hi ? 'पहले हफ्ते की जीतें' : 'Your first-week wins'}
      </Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${(done / wins.length) * 100}%` }]} />
      </View>
      {wins.map((w) => (
        <Pressable key={w.en} onPress={() => router.push(w.href as any)} disabled={w.done} style={styles.row}>
          <Ionicons
            name={w.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={w.done ? colors.good : w === next ? colors.blushDeep : colors.lineStrong}
          />
          <Text style={[styles.rowText, w.done && styles.rowDone, w === next && styles.rowNext]}>{hi ? w.hi : w.en}</Text>
          {w === next ? <Ionicons name="arrow-forward" size={16} color={colors.blushDeep} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, marginTop: spacing.md, ...shadowCard, shadowOpacity: 0.07, elevation: 3 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.blushDeep },
  count: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.ink },
  title: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink, marginTop: 4, letterSpacing: -0.3 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.blushSoft, marginTop: 10, marginBottom: 6, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.blushDeep },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  rowText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  rowDone: { color: colors.muted, textDecorationLine: 'line-through' },
  rowNext: { fontFamily: fonts.bodyBold },
});
