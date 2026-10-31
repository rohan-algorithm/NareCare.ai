import { addDays, format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { logStreak, MILESTONES } from '@/src/features/streak';
import { Ionicons } from '@/src/ui/Icon';
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
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [logY, setLogY] = useState(0);

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
    <Screen scroll scrollRef={scrollRef}>
      <ScreenHeader
        door={hi ? 'ट्रैक' : 'Track'}
        title={hi ? 'आपका साइकल' : 'Your cycle'}
        subtitle={hi ? 'किसी भी दिन पर टैप करके लॉग करें।' : 'Tap any day to log it.'}
      />

      <StreakCard
        logs={logs}
        hi={hi}
        onLogToday={() => {
          setDate(today);
          scrollRef.current?.scrollTo({ y: Math.max(0, logY - 12), animated: true });
        }}
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

      <View onLayout={(e) => setLogY(e.nativeEvent.layout.y)} />
      <DayLog key={date} date={date} dayLabel={dayLabel} existing={logs.find((l) => l.logDate === date)} hi={hi} isToday={date === today} />

      <MonthSummary logs={logs} hi={hi} />

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

const WEEK_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEK_HI = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];

function StreakCard({ logs, hi, onLogToday }: { logs: SymptomLog[]; hi: boolean; onLogToday: () => void }) {
  const s = useMemo(() => logStreak(logs), [logs]);
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= s.current) ?? 0;
  const pct = s.next ? (s.current - prevMilestone) / (s.next - prevMilestone) : 1;
  const message = s.loggedToday
    ? s.next
      ? hi
        ? `${s.next}-दिन बैज में ${s.next - s.current} दिन बाकी`
        : `${s.next - s.current} more day${s.next - s.current > 1 ? 's' : ''} to your ${s.next}-day badge`
      : hi
        ? 'आपने सारे बैज जीत लिए!'
        : 'You’ve earned every badge!'
    : s.current > 0
      ? hi
        ? `आज लॉग करें, वरना ${s.current}-दिन की स्ट्रीक टूट जाएगी`
        : `Log today to keep your ${s.current}-day streak`
      : hi
        ? 'आज लॉग करके नई स्ट्रीक शुरू करें'
        : 'Log today to start a streak';

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakTop}>
        <View style={styles.flame}>
          <Ionicons name="flame" size={26} color={s.current > 0 ? '#E8801A' : '#D9CFC9'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.streakNum}>
            {s.current} {hi ? 'दिन की स्ट्रीक' : 'day streak'}
          </Text>
          <Text style={styles.streakSub}>
            {hi ? `सबसे लंबी ${s.best} · कुल ${s.total} दिन लॉग` : `Best ${s.best} · ${s.total} ${s.total === 1 ? 'day' : 'days'} logged`}
          </Text>
        </View>
        {!s.loggedToday ? (
          <Pressable onPress={onLogToday} style={styles.logNow}>
            <Text style={styles.logNowText}>{hi ? 'अभी लॉग' : 'Log now'}</Text>
          </Pressable>
        ) : (
          <Ionicons name="checkmark-circle" size={26} color={colors.good} />
        )}
      </View>

      <View style={styles.weekRow}>
        {s.week.map((w, i) => (
          <View key={i} style={styles.weekCol}>
            <View style={[styles.weekDot, w === 'done' && styles.weekDone, w === 'today' && styles.weekToday, w === 'missed' && styles.weekMissed]}>
              {w === 'done' ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
            </View>
            <Text style={styles.weekLabel}>{(hi ? WEEK_HI : WEEK_EN)[i]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.badgeBar}>
        <View style={[styles.badgeFill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>
      <Text style={styles.streakMsg}>{message}</Text>
      <View style={styles.badges}>
        {MILESTONES.map((m) => {
          const got = s.earned.includes(m);
          return (
            <View key={m} style={[styles.badge, got && styles.badgeGot]}>
              <Ionicons name={got ? 'ribbon' : 'ribbon-outline'} size={13} color={got ? '#7A4A00' : '#C9BFBA'} />
              <Text style={[styles.badgeText, got && { color: '#7A4A00' }]}>{m}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const SYMPTOM_NAME: Record<string, [string, string]> = Object.fromEntries(SYMPTOM_OPTS.map((s) => [s.id, [s.en, s.hi]]));

/** This calendar month at a glance: the pattern she'd tell her doctor. */
function MonthSummary({ logs, hi }: { logs: SymptomLog[]; hi: boolean }) {
  const month = format(new Date(), 'yyyy-MM');
  const mine = logs.filter((l) => l.logDate.startsWith(month));
  if (!mine.length) return null;
  const counts: Record<string, number> = {};
  for (const l of mine) for (const [k, v] of Object.entries(l.symptoms)) if (v > 0 && SYMPTOM_NAME[k]) counts[k] = (counts[k] ?? 0) + 1;
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const max = Math.max(1, ...top.map(([, n]) => n));
  const bleed = mine.filter((l) => l.periodStatus === 'started' || l.periodStatus === 'flowing').length;
  const mood = mine.reduce((a, l) => a + l.mood, 0) / mine.length;

  return (
    <View style={styles.monthCard}>
      <Text style={styles.monthTitle}>{hi ? `${format(new Date(), 'MMMM')} एक नज़र में` : `${format(new Date(), 'MMMM')} at a glance`}</Text>
      <View style={styles.monthStats}>
        <MonthStat value={`${mine.length}`} label={hi ? 'दिन लॉग' : 'days logged'} />
        <MonthStat value={`${bleed}`} label={hi ? 'पीरियड दिन' : 'period days'} />
        <MonthStat value={['😣', '🙁', '😐', '🙂', '😄'][Math.max(0, Math.min(4, Math.round(mood) - 1))]} label={hi ? 'औसत मूड' : 'avg mood'} />
      </View>
      {top.length ? (
        <View style={{ gap: 8, marginTop: 12 }}>
          {top.map(([k, n]) => (
            <View key={k} style={styles.barRow}>
              <Text style={styles.barLabel}>{SYMPTOM_NAME[k][hi ? 1 : 0]}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(n / max) * 100}%` }]} />
              </View>
              <Text style={styles.barNum}>{hi ? `${n} दिन` : `${n}d`}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.sumBody}>{hi ? 'इस महीने कोई लक्षण लॉग नहीं।' : 'No symptoms logged this month.'}</Text>
      )}
    </View>
  );
}

function MonthStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.monthStat}>
      <Text style={styles.monthValue}>{value}</Text>
      <Text style={styles.monthLabel}>{label}</Text>
    </View>
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
    // Earned a streak badge with this log? Celebrate it once.
    const st = useAppStore.getState();
    const cur = logStreak(st.symptomLogs).current;
    if (MILESTONES.includes(cur) && !st.celebrated.includes(cur)) st.celebrate(cur);
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
  streakCard: { marginTop: spacing.md, backgroundColor: '#fff', borderRadius: 22, padding: 16, ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flame: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF1E0', alignItems: 'center', justifyContent: 'center' },
  streakNum: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.ink },
  streakSub: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  logNow: { backgroundColor: colors.blushDeep, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  logNowText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  weekCol: { alignItems: 'center', gap: 4 },
  weekDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colors.mistDeep, alignItems: 'center', justifyContent: 'center' },
  weekDone: { backgroundColor: '#E8801A', borderColor: '#E8801A' },
  weekToday: { borderColor: '#E8801A', borderStyle: 'dashed' },
  weekMissed: { backgroundColor: colors.mist, borderColor: colors.mist },
  weekLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted },
  badgeBar: { height: 6, borderRadius: 3, backgroundColor: '#FFF1E0', marginTop: 14, overflow: 'hidden' },
  badgeFill: { height: 6, borderRadius: 3, backgroundColor: '#E8801A' },
  streakMsg: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink, marginTop: 8 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 10 },
  badge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 999, paddingVertical: 5, backgroundColor: colors.mist },
  badgeGot: { backgroundColor: '#FFC857' },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: '#B5AAA4' },
  monthCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: 22, padding: 16, ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  monthTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink },
  monthStats: { flexDirection: 'row', gap: 8, marginTop: 12 },
  monthStat: { flex: 1, backgroundColor: colors.mist, borderRadius: 14, paddingVertical: 10, alignItems: 'center' },
  monthValue: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.ink },
  monthLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted, marginTop: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 96, fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.mist, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: RED },
  barNum: { width: 34, textAlign: 'right', fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted },
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
