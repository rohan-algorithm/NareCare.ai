import { addDays, format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { Button } from '@/src/ui/Button';
import { Chip } from '@/src/ui/Chip';
import { Card } from '@/src/ui/Card';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { cycleStatus, periodStarts } from '@/src/features/cycle';
import { buildInsights, predictNextPeriod } from '@/src/features/insights';
import type { BleedPattern, PeriodStatus, SymptomLog } from '@/src/types';

const SYMPTOM_OPTS = [
  { id: 'bloating', en: 'Bloating', hi: 'पेट फूलना' },
  { id: 'cramps', en: 'Cramps', hi: 'ऐंठन' },
  { id: 'acne', en: 'Acne', hi: 'मुंहासे' },
  { id: 'mood_swing', en: 'Mood swings', hi: 'मूड बदलना' },
  { id: 'headache', en: 'Headache', hi: 'सिरदर्द' },
  { id: 'fatigue', en: 'Fatigue', hi: 'थकान' },
  { id: 'hair_fall', en: 'Hair fall', hi: 'बाल झड़ना' },
  { id: 'cravings', en: 'Cravings', hi: 'क्रेविंग' },
];

const BLEED: { id: BleedPattern; en: string; hi: string }[] = [
  { id: 'light', en: 'Light', hi: 'हल्का' },
  { id: 'moderate', en: 'Medium', hi: 'मध्यम' },
  { id: 'heavy', en: 'Heavy', hi: 'भारी' },
  { id: 'clots', en: 'Clots', hi: 'क्लॉट्स' },
];

const PERIOD: [PeriodStatus, string, string][] = [
  ['started', 'Started', 'शुरू'],
  ['flowing', 'Flowing', 'चल रहा'],
  ['spotting', 'Spotting', 'स्पॉटिंग'],
  ['none', 'None', 'नहीं'],
];

const RED = '#E24B5A';

export default function Track() {
  const router = useRouter();
  const logs = useAppStore((s) => s.symptomLogs);
  const lang = useAppStore((s) => s.profile?.language ?? 'en');
  const hi = lang === 'hi';
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [showMore, setShowMore] = useState(false);

  const status = useMemo(() => cycleStatus(logs), [logs]);
  const prediction = useMemo(() => predictNextPeriod(logs), [logs]);
  const insights = buildInsights(logs, lang);

  const marked = useMemo(() => {
    const m: Record<string, any> = {};
    const day = (bg: string, fg: string, extra: object = {}) => ({
      customStyles: { container: { backgroundColor: bg, borderRadius: 18, ...extra }, text: { color: fg, fontFamily: fonts.bodyBold } },
    });
    if (prediction.windowStart && prediction.windowEnd) {
      for (let d = parseISO(prediction.windowStart); format(d, 'yyyy-MM-dd') <= prediction.windowEnd; d = addDays(d, 1)) {
        const k = format(d, 'yyyy-MM-dd');
        if (k > today) m[k] = day('transparent', RED, { borderWidth: 1.5, borderColor: '#F4A3AC', borderStyle: 'dashed' });
      }
    }
    for (const l of logs) {
      if (l.periodStatus === 'started' || l.periodStatus === 'flowing') m[l.logDate] = day(RED, '#fff');
      else if (l.periodStatus === 'spotting') m[l.logDate] = day('#FBD3D8', RED);
      else m[l.logDate] = day('#E2F4EC', colors.teal);
    }
    const sel = m[date]?.customStyles;
    m[date] = {
      customStyles: {
        container: { ...(sel?.container ?? { backgroundColor: 'transparent', borderRadius: 18 }), borderWidth: 2, borderColor: colors.ink },
        text: sel?.text ?? { color: colors.ink, fontFamily: fonts.bodyBold },
      },
    };
    return m;
  }, [logs, prediction, date, today]);

  const starts = periodStarts(logs);
  const dayLabel = date === today ? (hi ? 'आज' : 'today') : format(parseISO(date), 'd MMM');

  return (
    <Screen scroll>
      <ScreenHeader
        door={hi ? 'ट्रैक' : 'Track'}
        title={hi ? 'आपका साइकल' : 'Your cycle'}
        subtitle={hi ? 'किसी भी दिन पर टैप करके लॉग करें।' : 'Tap any day to log it.'}
      />

      <View style={styles.summary}>
        <View style={styles.dayBubble}>
          <Text style={styles.dayNum}>{status.day ?? '–'}</Text>
          <Text style={styles.dayCap}>{hi ? 'साइकल दिन' : 'cycle day'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {status.day == null ? (
            <>
              <Text style={styles.sumTitle}>{hi ? 'पिछला पीरियड कब शुरू हुआ?' : 'When did your last period start?'}</Text>
              <Text style={styles.sumBody}>
                {hi ? 'नीचे कैलेंडर में वह दिन चुनें और “शुरू” दबाएँ।' : 'Pick that day on the calendar below and tap “Started”.'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.sumTitle}>
                {status.avg
                  ? hi
                    ? `औसत साइकल ${status.avg} दिन · ${status.regular ? 'नियमित' : 'अनियमित'}`
                    : `Average cycle ${status.avg} days · ${status.regular ? 'regular' : 'irregular'}`
                  : hi
                    ? 'औसत के लिए 2 पीरियड लॉग करें'
                    : 'Log 2 periods to see your average'}
              </Text>
              <Text style={styles.sumBody}>
                {status.avg
                  ? hi
                    ? prediction.labelHi
                    : prediction.label
                  : hi
                    ? `पिछला पीरियड ${format(parseISO(starts[starts.length - 1]), 'd MMM')} को शुरू हुआ। अगला भी लॉग करें।`
                    : `Last period started ${format(parseISO(starts[starts.length - 1]), 'd MMM')}. Log the next one too.`}
              </Text>
            </>
          )}
          {status.overdue ? (
            <Pressable onPress={() => router.push('/doctor-kit')} hitSlop={6}>
              <Text style={styles.warn}>{hi ? '90+ दिन: डॉक्टर से मिलें →' : '90+ days: time to see a doctor →'}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Card tone="solid" style={styles.calCard}>
        <Calendar
          markingType="custom"
          markedDates={marked}
          maxDate={today}
          onDayPress={(d: { dateString: string }) => setDate(d.dateString)}
          enableSwipeMonths
          theme={{
            backgroundColor: colors.white,
            calendarBackground: colors.white,
            todayTextColor: RED,
            arrowColor: colors.blushDeep,
            monthTextColor: colors.ink,
            textDayFontFamily: fonts.body,
            textMonthFontFamily: fonts.bodyBold,
            textDayHeaderFontFamily: fonts.bodyMedium,
            textDisabledColor: '#CFC8CC',
          }}
        />
        <View style={styles.legend}>
          <Legend color={RED} label={hi ? 'पीरियड' : 'Period'} />
          <Legend color="#FBD3D8" label={hi ? 'स्पॉटिंग' : 'Spotting'} />
          <Legend color="#E2F4EC" label={hi ? 'लॉग किया' : 'Logged'} />
          <Legend dashed label={hi ? 'संभावित' : 'Likely next'} />
        </View>
        {starts.length ? (
          <Text style={styles.calFoot}>
            {hi ? `${starts.length} पीरियड लॉग · PCOS में अनुमान विनम्र रहते हैं।` : `${starts.length} period${starts.length > 1 ? 's' : ''} logged · PCOS predictions stay humble.`}
          </Text>
        ) : null}
      </Card>

      <DayLog key={date} date={date} dayLabel={dayLabel} existing={logs.find((l) => l.logDate === date)} hi={hi} isToday={date === today} />

      <Pressable onPress={() => setShowMore((v) => !v)} style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        <Text style={styles.link}>{showMore ? (hi ? 'पैटर्न छुपाएँ' : 'Hide patterns') : hi ? 'मेरे पैटर्न देखें →' : 'See my patterns →'}</Text>
      </Pressable>
      {showMore && (
        <>
          {insights.slice(0, 3).map((ins) => (
            <View key={ins.id} style={{ marginTop: spacing.md }}>
              <Title style={{ fontSize: 16 }}>{hi ? ins.titleHi : ins.title}</Title>
              <Muted style={{ marginTop: 4 }}>{hi ? ins.detailHi : ins.detail}</Muted>
            </View>
          ))}
          <Pressable onPress={() => router.push('/cycle-calm')} style={{ marginTop: spacing.lg }}>
            <Text style={styles.link}>{hi ? 'अनियमित साइकल? शांत स्पष्टता →' : 'Irregular cycle? Calm clarity →'}</Text>
          </Pressable>
        </>
      )}

      <Disclaimer lang={lang} />
    </Screen>
  );
}

function Legend({ color, label, dashed }: { color?: string; label: string; dashed?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, dashed ? { borderWidth: 1.5, borderColor: '#F4A3AC', borderStyle: 'dashed' } : { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

/** The log form for one day; remounted per date so it always starts from that day's saved log. */
function DayLog({ date, dayLabel, existing, hi, isToday }: { date: string; dayLabel: string; existing?: SymptomLog; hi: boolean; isToday: boolean }) {
  const router = useRouter();
  const upsert = useAppStore((s) => s.upsertSymptomLog);
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>(existing?.periodStatus ?? 'none');
  const [bleedPattern, setBleedPattern] = useState<BleedPattern>(existing?.bleedPattern && existing.bleedPattern !== 'none' ? existing.bleedPattern : 'moderate');
  const [selected, setSelected] = useState<Record<string, number>>(existing?.symptoms ?? {});
  const [mood, setMood] = useState(existing?.mood ?? 3);
  const [energyCrash, setEnergyCrash] = useState(existing?.energyCrash ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saved, setSaved] = useState(false);

  const toggleSymptom = (id: string) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 3;
      return next;
    });

  const save = () => {
    upsert({
      logDate: date,
      periodStatus,
      bleedPattern: periodStatus === 'none' ? 'none' : bleedPattern,
      symptoms: selected,
      mood,
      energyCrash,
      notes,
    });
    setSaved(true);
  };

  return (
    <View style={styles.logCard}>
      <Text style={styles.logTitle}>{hi ? `लॉग: ${dayLabel}` : `Log for ${dayLabel}`}</Text>

      <Label style={styles.label}>{hi ? 'पीरियड' : 'Period'}</Label>
      <View style={styles.evenRow}>
        {PERIOD.map(([id, en, h]) => (
          <Chip key={id} label={hi ? h : en} selected={periodStatus === id} tone="rose" style={styles.evenChip} onPress={() => setPeriodStatus(id)} />
        ))}
      </View>

      {periodStatus !== 'none' && (
        <>
          <Label style={styles.label}>{hi ? 'फ्लो' : 'Flow'}</Label>
          <View style={styles.evenRow}>
            {BLEED.map((b) => (
              <Chip key={b.id} label={hi ? b.hi : b.en} selected={bleedPattern === b.id} tone="rose" style={styles.evenChip} onPress={() => setBleedPattern(b.id)} />
            ))}
          </View>
        </>
      )}

      <Label style={styles.label}>{hi ? 'लक्षण' : 'Symptoms'}</Label>
      <View style={styles.wrap}>
        {SYMPTOM_OPTS.map((s) => (
          <Chip key={s.id} label={hi ? s.hi : s.en} selected={!!selected[s.id]} onPress={() => toggleSymptom(s.id)} />
        ))}
        <Chip label={hi ? 'खाने के बाद थकान' : 'Post-meal crash'} selected={energyCrash} tone="gold" onPress={() => setEnergyCrash((v) => !v)} />
      </View>

      <Label style={styles.label}>{hi ? `मूड · ${mood}/5` : `Mood · ${mood}/5`}</Label>
      <View style={styles.evenRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Chip key={n} label={['😣', '🙁', '😐', '🙂', '😄'][n - 1]} selected={mood === n} tone="gold" style={styles.evenChip} onPress={() => setMood(n)} />
        ))}
      </View>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={hi ? 'नोट (वैकल्पिक)' : 'Notes (optional)'}
        placeholderTextColor={colors.muted}
        style={styles.notes}
        multiline
      />

      <Button
        label={saved ? (hi ? '✓ सेव हो गया' : '✓ Saved') : hi ? `${dayLabel} का लॉग सेव करें` : isToday ? 'Save today’s log' : `Save log for ${dayLabel}`}
        onPress={save}
        style={{ marginTop: spacing.md }}
      />
      {saved && isToday ? (
        <Pressable onPress={() => router.push('/coach' as any)} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>{hi ? 'आज के लक्षणों पर AI से पूछें →' : 'Ask AI about today’s symptoms →'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: spacing.md, backgroundColor: '#fff', borderRadius: 22, padding: 14, ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  dayBubble: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#FFE4E7', alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontFamily: fonts.displayBold, fontSize: 28, color: RED, lineHeight: 32 },
  dayCap: { fontFamily: fonts.bodyBold, fontSize: 10.5, color: RED, textTransform: 'uppercase', letterSpacing: 0.4 },
  sumTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, lineHeight: 20, color: colors.ink },
  sumBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 3 },
  warn: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.danger, marginTop: 6 },
  calCard: { marginTop: 12, padding: spacing.sm },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 8, paddingTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.muted },
  calFoot: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 4 },
  logCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: 22, padding: 16, ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  logTitle: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.ink },
  label: { marginTop: spacing.md, marginBottom: spacing.sm },
  evenRow: { flexDirection: 'row', gap: 8 },
  evenChip: { flex: 1, marginRight: 0, marginBottom: 0, paddingHorizontal: 4, alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  notes: { minHeight: 72, marginTop: spacing.md, padding: 12, borderRadius: 14, backgroundColor: colors.mist, fontFamily: fonts.body, color: colors.ink, textAlignVertical: 'top', fontSize: 15 },
  link: { fontFamily: fonts.bodyBold, color: colors.blushDeep, fontSize: 14 },
});
