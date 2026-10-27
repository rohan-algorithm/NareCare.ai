import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen } from '@/src/ui/Screen';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { cycleLengths, predictNextPeriod } from '@/src/features/insights';
import { localDate } from '@/src/features/mealPlan';

const SINCE: [string, string, string, number][] = [
  ['0', 'Just started', 'अभी शुरू', 0],
  ['3', '3–6 months', '3–6 महीने', 4],
  ['6', '6–12 months', '6–12 महीने', 8],
  ['12', 'Over a year', 'एक साल से ज़्यादा', 13],
];

function shift(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
const fmt = (iso: string, hi: boolean) => new Date(`${iso}T12:00:00`).toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' });

export default function Ttc() {
  const router = useRouter();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const age = useAppStore((s) => s.profile?.age ?? 25);
  const logs = useAppStore((s) => s.symptomLogs);
  const ttc = useAppStore((s) => s.ttc);
  const setTtc = useAppStore((s) => s.setTtc);
  const logLh = useAppStore((s) => s.logLh);
  const [today] = useState(() => localDate());

  const cycles = useMemo(() => cycleLengths(logs), [logs]);
  const prediction = predictNextPeriod(logs);
  const avg = prediction.avgLength;
  const irregular = !!avg && (avg > 35 || cycles.some((c) => c.days > 35 || c.days < 21));
  const ovulation = prediction.nextDate ? shift(prediction.nextDate, -14) : null;
  const windowStart = ovulation ? shift(ovulation, -5) : null;
  const windowEnd = ovulation ? shift(ovulation, 1) : null;
  const inWindow = windowStart && windowEnd ? today >= windowStart && today <= windowEnd : false;
  const todayTest = ttc.lhTests.find((t) => t.date === today);
  const lastPositive = [...ttc.lhTests].reverse().find((t) => t.result === 'pos');
  const positiveRecent = lastPositive && lastPositive.date >= shift(today, -2);

  const months = SINCE.find((s) => s[0] === ttc.since)?.[3] ?? 0;
  const seeNow = irregular || (age >= 35 ? months >= 6 : months >= 12);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: hi ? 'कंसीव करने की कोशिश' : 'Trying to conceive', headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface }, headerShadowVisible: false }} />
      <Screen scroll>
        <View style={styles.toggle}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{hi ? 'TTC मोड' : 'TTC mode'}</Text>
            <Text style={styles.small}>{hi ? 'फर्टाइल विंडो, LH टेस्ट और विशेषज्ञ सलाह।' : 'Fertile window, LH tests and specialist guidance.'}</Text>
          </View>
          <Switch value={ttc.on} onValueChange={(on) => setTtc({ on })} trackColor={{ true: colors.blushDeep, false: colors.mistDeep }} thumbColor="#fff" />
        </View>

        <LinearGradient colors={inWindow || positiveRecent ? ['#FF8A7A', '#E24B5A'] : ['#35524A', '#22332E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.kicker}>{hi ? 'आपकी फर्टाइल विंडो' : 'Your fertile window'}</Text>
          <Text style={styles.heroTitle}>
            {positiveRecent
              ? hi ? 'LH पॉज़िटिव: आज और अगले 1–2 दिन सबसे फर्टाइल' : 'LH positive: today and the next 1–2 days are most fertile'
              : windowStart && windowEnd
                ? `${fmt(windowStart, hi)} – ${fmt(windowEnd, hi)}`
                : hi ? 'अनुमान के लिए 2 पीरियड लॉग करें' : 'Log 2 period starts for an estimate'}
          </Text>
          <Text style={styles.heroBody}>
            {!avg
              ? hi
                ? 'Track में पीरियड शुरू होने की तारीख़ें लॉग करें। तब तक चक्र के ~10वें दिन से LH टेस्ट स्ट्रिप सबसे भरोसेमंद तरीका है।'
                : 'Log your period start dates in Track. Until then, LH test strips from about day 10 of your cycle are the most reliable guide.'
              : irregular
              ? hi
                ? 'आपके चक्र अनियमित हैं, इसलिए कैलेंडर अनुमान भरोसेमंद नहीं। चक्र के ~10वें दिन से LH टेस्ट स्ट्रिप इस्तेमाल करें, या डॉक्टर से फॉलिकल स्कैन के बारे में पूछें।'
                : 'Your cycles are irregular, so calendar estimates are unreliable. Use LH test strips from about day 10 of your cycle, or ask your doctor about follicle-tracking scans.'
              : hi
                ? 'विंडो में हर 1–2 दिन में संबंध सबसे अच्छी संभावना देते हैं।'
                : 'Sex every 1–2 days during the window gives the best chance.'}
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{hi ? 'आज का ओव्यूलेशन (LH) टेस्ट' : 'Today’s ovulation (LH) test'}</Text>
          <View style={styles.row}>
            {(['neg', 'pos'] as const).map((r) => (
              <Pressable key={r} onPress={() => logLh({ date: today, result: r })} style={[styles.pill, todayTest?.result === r && (r === 'pos' ? styles.pillPos : styles.pillOn)]}>
                <Text style={[styles.pillText, todayTest?.result === r && styles.pillTextOn]}>
                  {r === 'pos' ? (hi ? 'पॉज़िटिव' : 'Positive') : hi ? 'नेगेटिव' : 'Negative'}
                </Text>
              </Pressable>
            ))}
          </View>
          {ttc.lhTests.length > 0 ? (
            <View style={styles.dots}>
              {ttc.lhTests.slice(-14).map((t) => (
                <View key={t.date} style={styles.dotCol}>
                  <View style={[styles.dot, { backgroundColor: t.result === 'pos' ? colors.blushDeep : colors.mistDeep }]} />
                  <Text style={styles.dotLabel}>{t.date.slice(8)}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={styles.small}>
            {hi ? 'PCOS में LH कभी-कभी कई दिन पॉज़िटिव दिख सकता है; पैटर्न डॉक्टर को दिखाएँ।' : 'With PCOS, LH can read positive on several days; show the pattern to your doctor.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{hi ? 'कितने समय से कोशिश कर रही हैं?' : 'How long have you been trying?'}</Text>
          <View style={styles.row}>
            {SINCE.map(([id, en, h]) => (
              <Pressable key={id} onPress={() => setTtc({ since: id })} style={[styles.pill, ttc.since === id && styles.pillOn]}>
                <Text style={[styles.pillText, ttc.since === id && styles.pillTextOn]}>{hi ? h : en}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.verdict, { backgroundColor: seeNow ? '#FFF0EE' : '#E2F4EC' }]}>
            <Ionicons name={seeNow ? 'medkit' : 'checkmark-circle'} size={20} color={seeNow ? colors.blushDeep : colors.good} />
            <Text style={styles.verdictText}>
              {seeNow
                ? irregular
                  ? hi ? 'अनियमित चक्रों के साथ इंतज़ार न करें: अभी फर्टिलिटी जाँच करवाएँ।' : 'With irregular cycles, don’t wait: ask for a fertility evaluation now.'
                  : hi ? 'अब फर्टिलिटी विशेषज्ञ से मिलने का सही समय है।' : 'It’s time to see a fertility specialist.'
                : hi
                  ? `${age >= 35 ? '6' : '12'} महीने तक कोशिश करें, फिर विशेषज्ञ से मिलें। चिंता हो तो पहले भी जा सकती हैं।`
                  : `Keep trying up to ${age >= 35 ? '6' : '12'} months, then see a specialist. You can go earlier if you’re worried.`}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{hi ? 'डॉक्टर विज़िट की तैयारी' : 'Prepare for the visit'}</Text>
          {[
            [hi ? 'पीरियड की तारीख़ें (NariCare में लॉग)' : 'Period dates (logged in NariCare)', '/track'],
            [hi ? 'हाल की लैब: TSH, प्रोलैक्टिन, शुगर, AMH (अगर हो)' : 'Recent labs: TSH, prolactin, sugar, AMH if done', '/labs'],
            [hi ? 'पार्टनर का सीमन एनालिसिस' : 'Partner’s semen analysis', null],
            [hi ? 'गर्भधारण से पहले फ़ोलिक एसिड के बारे में पूछें' : 'Ask about starting folic acid before conceiving', null],
            [hi ? 'एक पेज की डॉक्टर किट PDF' : 'One-page Doctor Kit PDF', '/doctor-kit'],
          ].map(([label, href]) => (
            <Pressable key={label as string} disabled={!href} onPress={() => href && router.push(href as any)} style={styles.check}>
              <Ionicons name="ellipse-outline" size={18} color={colors.blushDeep} />
              <Text style={styles.checkText}>{label}</Text>
              {href ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null}
            </Pressable>
          ))}
        </View>
        <Disclaimer lang={hi ? 'hi' : 'en'} />
      </Screen>
    </>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  toggle: { ...CARD, flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  hero: { borderRadius: 24, padding: spacing.lg, gap: 6, marginTop: spacing.sm },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' },
  heroTitle: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 28, color: '#fff' },
  heroBody: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
  card: { ...CARD, marginTop: spacing.sm },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 8 },
  small: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.mist },
  pillOn: { backgroundColor: colors.forest },
  pillPos: { backgroundColor: colors.blushDeep },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  pillTextOn: { color: '#fff', fontFamily: fonts.bodyBold },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  dotCol: { alignItems: 'center', gap: 2 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotLabel: { fontFamily: fonts.body, fontSize: 9.5, color: colors.muted },
  verdict: { flexDirection: 'row', gap: 10, borderRadius: 14, padding: 12, marginTop: 12 },
  verdictText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 13.5, lineHeight: 19, color: colors.ink },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
});
