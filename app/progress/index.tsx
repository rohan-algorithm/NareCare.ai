import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { LineChart } from '@/src/ui/LineChart';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { cycleLengths } from '@/src/features/insights';
import { localDate } from '@/src/features/mealPlan';

type Tab = 'body' | 'skin' | 'mind' | 'cycle';

const short = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const SKIN_SCALES: { key: 'facialHair' | 'hairFall' | 'acne'; en: string; hi: string; levels: [string, string][] }[] = [
  {
    key: 'facialHair',
    en: 'Unwanted facial / body hair',
    hi: 'चेहरे / शरीर पर अनचाहे बाल',
    levels: [['None', 'नहीं'], ['A little', 'थोड़े'], ['Noticeable', 'दिखते हैं'], ['A lot', 'काफ़ी'], ['Very heavy', 'बहुत ज़्यादा']],
  },
  {
    key: 'hairFall',
    en: 'Hair fall / thinning',
    hi: 'बाल झड़ना / पतले होना',
    levels: [['Normal', 'सामान्य'], ['Slightly more', 'थोड़ा ज़्यादा'], ['Clearly more', 'साफ़ ज़्यादा'], ['Visible thinning', 'पतलापन दिखता'], ['Severe', 'बहुत ज़्यादा']],
  },
  {
    key: 'acne',
    en: 'Acne',
    hi: 'मुंहासे',
    levels: [['Clear', 'साफ़'], ['A few', 'कुछ'], ['Some', 'काफ़ी'], ['Many', 'बहुत'], ['Painful / cystic', 'दर्द वाले']],
  },
];

const FREQ: [string, string][] = [
  ['Not at all', 'बिल्कुल नहीं'],
  ['Several days', 'कुछ दिन'],
  ['More than half the days', 'आधे से ज़्यादा दिन'],
  ['Nearly every day', 'लगभग हर दिन'],
];
const MIND_QS: { en: string; hi: string; group: 'phq' | 'gad' }[] = [
  { en: 'Little interest or pleasure in doing things', hi: 'कामों में कम रुचि या खुशी', group: 'phq' },
  { en: 'Feeling down, depressed or hopeless', hi: 'उदास, निराश या नाउम्मीद महसूस करना', group: 'phq' },
  { en: 'Feeling nervous, anxious or on edge', hi: 'घबराहट, बेचैनी या तनाव महसूस करना', group: 'gad' },
  { en: 'Not being able to stop or control worrying', hi: 'चिंता को रोक या काबू न कर पाना', group: 'gad' },
];

export default function Progress() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'body');
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const tabs: [Tab, string, string][] = [
    ['body', 'Body', 'शरीर'],
    ['skin', 'Skin & hair', 'त्वचा-बाल'],
    ['mind', 'Mind', 'मन'],
    ['cycle', 'Cycles', 'पीरियड'],
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: hi ? 'प्रोग्रेस प्रूफ़' : 'Progress proof', headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface }, headerShadowVisible: false }} />
      <Screen scroll>
        <View style={styles.tabs}>
          {tabs.map(([id, en, h]) => (
            <Pressable key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabOn]}>
              <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{hi ? h : en}</Text>
            </Pressable>
          ))}
        </View>
        {tab === 'body' && <BodyTab hi={hi} />}
        {tab === 'skin' && <SkinTab hi={hi} />}
        {tab === 'mind' && <MindTab hi={hi} />}
        {tab === 'cycle' && <CycleTab hi={hi} onWeekly={() => router.push('/weekly')} />}
        <Disclaimer lang={hi ? 'hi' : 'en'} />
      </Screen>
    </>
  );
}

function BodyTab({ hi }: { hi: boolean }) {
  const profile = useAppStore((s) => s.profile);
  const logs = useAppStore((s) => s.bodyLogs);
  const logBody = useAppStore((s) => s.logBody);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const weights = logs.filter((l) => l.weightKg).map((l) => ({ label: short(l.date), value: l.weightKg as number }));
  const waists = logs.filter((l) => l.waistCm).map((l) => ({ label: short(l.date), value: l.waistCm as number }));
  const startW = weights[0]?.value ?? profile?.weightKg;
  const curW = weights[weights.length - 1]?.value ?? profile?.weightKg;
  const goal = startW ? Math.round(startW * 0.95 * 10) / 10 : undefined;
  const lost = startW && curW ? Math.round((startW - curW) * 10) / 10 : 0;
  const curWaist = waists[waists.length - 1]?.value;
  const whtr = curWaist && profile?.heightCm ? Math.round((curWaist / profile.heightCm) * 100) / 100 : null;
  const bmi = curW && profile?.heightCm ? Math.round((curW / (profile.heightCm / 100) ** 2) * 10) / 10 : null;

  const save = () => {
    const w = parseFloat(weight.replace(',', '.'));
    const c = parseFloat(waist.replace(',', '.'));
    const okW = Number.isFinite(w) && w >= 30 && w <= 200;
    const okC = Number.isFinite(c) && c >= 40 && c <= 200;
    if (!okW && !okC) {
      Alert.alert(hi ? 'सही वैल्यू डालें' : 'Enter a valid value', hi ? 'वज़न किलो में, कमर सेमी में।' : 'Weight in kg, waist in cm.');
      return;
    }
    const today = localDate();
    const prev = logs.find((l) => l.date === today);
    logBody({ date: today, weightKg: okW ? w : prev?.weightKg, waistCm: okC ? c : prev?.waistCm });
    setWeight('');
    setWaist('');
  };

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View style={styles.statsRow}>
        <Stat value={curW ? `${curW} kg` : '—'} label={hi ? 'अभी वज़न' : 'Current weight'} />
        <Stat value={lost > 0 ? `−${lost} kg` : lost < 0 ? `+${-lost} kg` : '0 kg'} label={hi ? 'शुरुआत से' : 'Since start'} good={lost > 0} />
        <Stat value={whtr ? String(whtr) : '—'} label={hi ? 'कमर/कद अनुपात' : 'Waist/height'} good={!!whtr && whtr < 0.5} />
      </View>

      {goal && curW ? (
        <View style={[styles.card, { backgroundColor: curW <= goal ? '#E2F4EC' : '#FFF5E6' }]}>
          <Text style={styles.cardTitle}>
            {curW <= goal
              ? hi ? '🎉 5% लक्ष्य पूरा!' : '🎉 You reached your 5% goal!'
              : hi ? `5% लक्ष्य: ${goal} किलो (${Math.round((curW - goal) * 10) / 10} किलो बाकी)` : `5% goal: ${goal} kg (${Math.round((curW - goal) * 10) / 10} kg to go)`}
          </Text>
          <Text style={styles.cardBody}>
            {hi
              ? '5% वज़न कम होने से पीरियड, ओव्यूलेशन और इंसुलिन बेहतर हो सकते हैं। हफ्ते में 0.25–0.5 किलो स्वस्थ रफ़्तार है।'
              : 'Losing 5% can improve cycles, ovulation and insulin. 0.25–0.5 kg a week is a healthy pace.'}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'वज़न (किलो)' : 'Weight (kg)'}</Text>
        <LineChart points={weights} target={goal} targetLabel="5%" unit="kg" emptyText={hi ? 'चार्ट के लिए 2 बार वज़न लॉग करें।' : 'Log your weight twice to see your trend.'} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'कमर (सेमी)' : 'Waist (cm)'}</Text>
        <LineChart points={waists} color={colors.forest} unit="cm" emptyText={hi ? 'कमर अक्सर वज़न से पहले घटती है। हर हफ्ते नापें।' : 'Waist often shrinks before the scale moves. Measure weekly.'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'आज लॉग करें' : 'Log today'}</Text>
        <View style={styles.inputs}>
          <Field value={weight} onChange={setWeight} placeholder={hi ? 'वज़न' : 'Weight'} unit="kg" />
          <Field value={waist} onChange={setWaist} placeholder={hi ? 'कमर' : 'Waist'} unit="cm" />
        </View>
        <Text style={styles.hint}>
          {hi ? 'हफ्ते में एक बार, सुबह, खाली पेट। कमर नाभि पर नापें।' : 'Once a week, morning, before eating. Measure the waist at your belly button.'}
        </Text>
        <Button label={hi ? 'सेव करें' : 'Save'} onPress={save} style={{ marginTop: spacing.sm }} />
        {bmi ? (
          <Text style={styles.hint}>
            BMI {bmi} · {hi ? 'भारतीयों के लिए 23 से ऊपर ज़्यादा माना जाता है।' : 'For Indians, above 23 is considered overweight.'}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

function SkinTab({ hi }: { hi: boolean }) {
  const logs = useAppStore((s) => s.skinLogs);
  const logSkin = useAppStore((s) => s.logSkin);
  const month = localDate().slice(0, 7);
  const thisMonth = logs.find((l) => l.date === month);
  const [vals, setVals] = useState({ facialHair: thisMonth?.facialHair ?? -1, hairFall: thisMonth?.hairFall ?? -1, acne: thisMonth?.acne ?? -1 });
  const complete = vals.facialHair >= 0 && vals.hairFall >= 0 && vals.acne >= 0;
  const first = logs[0];
  const last = logs[logs.length - 1];
  const points = logs.map((l) => ({ label: l.date, value: l.facialHair + l.hairFall + l.acne }));

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      {first && last && first !== last ? (
        <View style={[styles.card, { backgroundColor: '#EEE9FF' }]}>
          <Text style={styles.cardTitle}>{hi ? `${first.date} से अब तक` : `Since ${first.date}`}</Text>
          {SKIN_SCALES.map((sc) => {
            const a = first[sc.key];
            const b = last[sc.key];
            return (
              <Text key={sc.key} style={styles.cardBody}>
                {hi ? sc.hi : sc.en}: {a} → {b} {b < a ? '✅' : b > a ? '⚠️' : '•'}
              </Text>
            );
          })}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'कुल स्कोर (कम = बेहतर)' : 'Total score (lower is better)'}</Text>
        <LineChart points={points} color="#7C5CFF" emptyText={hi ? 'हर महीने चेक-इन करें; एंड्रोजन वाले बदलाव 3–6 महीने में दिखते हैं।' : 'Check in monthly; androgen changes show over 3–6 months.'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'इस महीने का चेक-इन' : 'This month’s check-in'}</Text>
        {SKIN_SCALES.map((sc) => (
          <View key={sc.key} style={{ marginTop: spacing.sm }}>
            <Text style={styles.qText}>{hi ? sc.hi : sc.en}</Text>
            <View style={styles.wrap}>
              {sc.levels.map(([en, h], i) => (
                <Pressable key={en} onPress={() => setVals((v) => ({ ...v, [sc.key]: i }))} style={[styles.pill, vals[sc.key] === i && styles.pillOn]}>
                  <Text style={[styles.pillText, vals[sc.key] === i && styles.pillTextOn]}>{hi ? h : en}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <Button
          label={thisMonth ? (hi ? 'अपडेट करें' : 'Update') : hi ? 'सेव करें' : 'Save check-in'}
          disabled={!complete}
          onPress={() => logSkin({ date: month, ...vals })}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Animated.View>
  );
}

function MindTab({ hi }: { hi: boolean }) {
  const checks = useAppStore((s) => s.mindChecks);
  const logMind = useAppStore((s) => s.logMind);
  const [ans, setAns] = useState<number[]>([-1, -1, -1, -1]);
  const done = ans.every((a) => a >= 0);
  const phq = ans[0] + ans[1];
  const gad = ans[2] + ans[3];
  const latest = checks[checks.length - 1];
  const flagged = latest && (latest.phq2 >= 3 || latest.gad2 >= 3);

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      {latest ? (
        <View style={[styles.card, { backgroundColor: flagged ? '#FFF0EE' : '#E2F4EC' }]}>
          <Text style={styles.cardTitle}>
            {flagged
              ? hi ? 'आपके जवाब बताते हैं कि मदद लेना ठीक रहेगा' : 'Your answers suggest talking to someone would help'
              : hi ? 'आपका मूड ठीक दिख रहा है' : 'Your mood check looks steady'}
          </Text>
          <Text style={styles.cardBody}>
            {flagged
              ? hi
                ? 'PCOS में यह आम है और इलाज से बेहतर होता है। डॉक्टर या काउंसलर से बात करें, या Tele-MANAS पर मुफ़्त बात करें।'
                : 'This is common with PCOS and it gets better with support. Talk to a doctor or counsellor, or call Tele-MANAS for free.'
              : hi
                ? 'हर महीने दोबारा जाँचें। नींद और हलचल मूड को स्थिर रखते हैं।'
                : 'Check again next month. Sleep and movement keep mood steady.'}
          </Text>
          {flagged ? (
            <Pressable onPress={() => void Linking.openURL('tel:14416')} style={styles.callBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.callText}>{hi ? 'Tele-MANAS 14416 पर कॉल करें' : 'Call Tele-MANAS 14416'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'पिछले 2 हफ्तों में, कितनी बार…' : 'Over the last 2 weeks, how often have you had…'}</Text>
        {MIND_QS.map((q, qi) => (
          <View key={q.en} style={{ marginTop: spacing.sm }}>
            <Text style={styles.qText}>{hi ? q.hi : q.en}</Text>
            <View style={styles.wrap}>
              {FREQ.map(([en, h], i) => (
                <Pressable key={en} onPress={() => setAns((a) => a.map((v, k) => (k === qi ? i : v)))} style={[styles.pill, ans[qi] === i && styles.pillOn]}>
                  <Text style={[styles.pillText, ans[qi] === i && styles.pillTextOn]}>{hi ? h : en}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <Button
          label={hi ? 'चेक-इन सेव करें' : 'Save check-in'}
          disabled={!done}
          onPress={() => {
            logMind({ date: localDate(), phq2: phq, gad2: gad });
            setAns([-1, -1, -1, -1]);
          }}
          style={{ marginTop: spacing.md }}
        />
        <Text style={styles.hint}>
          {hi ? 'PHQ-2 और GAD-2 पर आधारित। यह निदान नहीं है।' : 'Based on the PHQ-2 and GAD-2 screening questions. Not a diagnosis.'}
        </Text>
      </View>

      {checks.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{hi ? 'इतिहास' : 'History'}</Text>
          {checks.slice(-6).reverse().map((c) => (
            <Text key={c.date} style={styles.cardBody}>
              {short(c.date)} · {hi ? 'मूड' : 'Mood'} {c.phq2}/6 · {hi ? 'चिंता' : 'Anxiety'} {c.gad2}/6
            </Text>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

function CycleTab({ hi, onWeekly }: { hi: boolean; onWeekly: () => void }) {
  const logs = useAppStore((s) => s.symptomLogs);
  const cycles = useMemo(() => cycleLengths(logs), [logs]);
  const points = cycles.map((c) => ({ label: short(c.start), value: c.days }));
  const regular = cycles.filter((c) => c.days >= 21 && c.days <= 35).length;
  const avg = cycles.length ? Math.round(cycles.reduce((a, c) => a + c.days, 0) / cycles.length) : null;

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View style={styles.statsRow}>
        <Stat value={avg ? `${avg} d` : '—'} label={hi ? 'औसत चक्र' : 'Average cycle'} />
        <Stat value={cycles.length ? `${regular}/${cycles.length}` : '—'} label={hi ? '21–35 दिन वाले' : 'Within 21–35 days'} good={cycles.length > 0 && regular === cycles.length} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hi ? 'चक्र की लंबाई (दिन)' : 'Cycle length (days)'}</Text>
        <LineChart points={points} target={35} targetLabel={hi ? 'सीमा' : 'upper normal'} color={colors.rose} emptyText={hi ? 'Track में 3 पीरियड शुरुआत लॉग करें।' : 'Log 3 period start dates in Track to see your cycle trend.'} />
      </View>
      <Pressable onPress={onWeekly} style={styles.linkRow}>
        <Text style={styles.linkText}>{hi ? 'साप्ताहिक रिव्यू और AI सारांश' : 'Weekly review & AI summary'}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </Animated.View>
  );
}

function Stat({ value, label, good }: { value: string; label: string; good?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, good && { color: colors.good }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Field({ value, onChange, placeholder, unit }: { value: string; onChange: (v: string) => void; placeholder: string; unit: string }) {
  return (
    <View style={styles.field}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType="decimal-pad" style={styles.input} />
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const CARD = { backgroundColor: '#fff', borderRadius: 22, padding: spacing.md, ...shadowCard, shadowOpacity: 0.06, elevation: 2 } as const;

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.mist, borderRadius: 999, padding: 4, marginTop: spacing.sm },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  tabOn: { backgroundColor: '#fff', ...shadowCard, shadowOpacity: 0.08, elevation: 2 },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.muted },
  tabTextOn: { fontFamily: fonts.bodyBold, color: colors.ink },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  stat: { ...CARD, flex: 1, padding: 12 },
  statValue: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.ink },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted, marginTop: 2 },
  card: { ...CARD, marginTop: spacing.sm },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 8 },
  cardBody: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.ink, marginTop: 2 },
  inputs: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.mist, borderRadius: 14, paddingHorizontal: 12 },
  input: { flex: 1, height: 48, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  unit: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 8 },
  qText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginBottom: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.mist },
  pillOn: { backgroundColor: colors.forest },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.ink },
  pillTextOn: { color: '#fff', fontFamily: fonts.bodyBold },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.blushDeep, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginTop: 10 },
  callText: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: '#fff' },
  linkRow: { ...CARD, flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  linkText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
