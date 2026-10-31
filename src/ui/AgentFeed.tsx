import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { planAutopilot, runAutopilot } from '@/src/features/autopilot';
import { localDate } from '@/src/features/mealPlan';
import { useIsPro } from '@/src/features/pro';

/** "Nari autopilot": what the AI changed in her plan today, or a Pro teaser for free users. */
export function AgentFeed() {
  const router = useRouter();
  const pro = useIsPro();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const log = useAppStore((s) => s.agentLog);
  const logs = useAppStore((s) => s.symptomLogs);
  const openPro = useAppStore((s) => s.openPro);

  useEffect(() => {
    if (pro) runAutopilot();
  }, [pro, logs]);

  const today = localDate();
  const todays = log.filter((a) => localDate(new Date(a.at)) === today).slice(0, 4);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const preview = useMemo(() => (pro ? [] : planAutopilot()), [pro, logs]);

  if (!pro) {
    return (
      <Pressable onPress={() => openPro('generic')} style={styles.wrap}>
        <LinearGradient colors={['#2A1631', '#4A2346']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.head}>
            <Ionicons name="sparkles" size={16} color="#FFC857" />
            <Text style={styles.kicker}>{hi ? 'नारी ऑटोपायलट' : 'Nari autopilot'}</Text>
            <View style={styles.pro}>
              <Ionicons name="lock-closed" size={10} color="#7A4A00" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.title}>
            {preview.length
              ? hi
                ? `आज आपके प्लान में ${preview.length} बदलाव तैयार हैं`
                : `${preview.length} change${preview.length > 1 ? 's' : ''} ready for your plan today`
              : hi
                ? 'AI जो रोज़ आपका खाना और वर्कआउट आपके लॉग के हिसाब से बदले'
                : 'AI that adjusts your meals and workouts every day from your logs'}
          </Text>
          {preview.slice(0, 2).map((c) => (
            <View key={c.key} style={styles.row}>
              <Ionicons name="lock-closed" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={[styles.rowText, styles.blur]} numberOfLines={1}>
                {hi ? c.textHi : c.text}
              </Text>
            </View>
          ))}
          <Text style={styles.cta}>{hi ? 'Pro में अनलॉक करें →' : 'Unlock with Pro →'}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#2A1631', '#4A2346']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.head}>
          <Ionicons name="sparkles" size={16} color="#FFC857" />
          <Text style={styles.kicker}>{hi ? 'नारी ऑटोपायलट · आज' : 'Nari autopilot · today'}</Text>
        </View>
        {todays.length ? (
          todays.map((a) => (
            <Pressable key={a.id} disabled={!a.href} onPress={() => a.href && router.push(a.href as any)} style={styles.row}>
              <Ionicons name="checkmark-circle" size={16} color="#3DDC97" />
              <Text style={styles.rowText}>{hi ? a.textHi : a.text}</Text>
              {a.href ? <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" /> : null}
            </Pressable>
          ))
        ) : (
          <Text style={styles.title}>{hi ? 'आज सब ठीक है। कुछ बदलना हो तो बस कहें।' : 'All on track today. Tell me if you want anything changed.'}</Text>
        )}
        <Pressable onPress={() => router.push('/coach' as any)}>
          <Text style={styles.cta}>{hi ? 'नारी से कहें: “डिनर बदल दो”, “7 बजे याद दिलाना” →' : 'Ask Nari: “swap my dinner”, “remind me at 7” →'}</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  card: { borderRadius: 22, padding: 16, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' },
  pro: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFC857', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  proText: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#7A4A00' },
  title: { fontFamily: fonts.bodyBold, fontSize: 15.5, lineHeight: 21, color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9 },
  rowText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: '#fff' },
  blur: { opacity: 0.45 },
  cta: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.blush, marginTop: 2 },
});
