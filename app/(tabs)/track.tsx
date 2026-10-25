import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { Button } from '@/src/ui/Button';
import { Chip } from '@/src/ui/Chip';
import { Card } from '@/src/ui/Card';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { buildInsights, predictNextPeriod } from '@/src/features/insights';
import type { BleedPattern, PeriodStatus } from '@/src/types';

const SYMPTOM_OPTS = [
  { id: 'bloating', en: 'Bloating', hi: 'ब्लोटरिंग' },
  { id: 'cramps', en: 'Cramps', hi: 'ऐंठन' },
  { id: 'acne', en: 'Acne', hi: 'मुंहासे' },
  { id: 'mood_swing', en: 'Mood', hi: 'मूड' },
  { id: 'headache', en: 'Headache', hi: 'सिरदर्द' },
  { id: 'fatigue', en: 'Fatigue', hi: 'थकान' },
  { id: 'hair_fall', en: 'Hair fall', hi: 'बाल झड़ना' },
  { id: 'cravings', en: 'Cravings', hi: 'क्रेविंग' },
];

const BLEED: { id: BleedPattern; en: string; hi: string }[] = [
  { id: 'light', en: 'Light', hi: 'हल्का' },
  { id: 'moderate', en: 'Moderate', hi: 'मध्यम' },
  { id: 'heavy', en: 'Heavy', hi: 'भारी' },
  { id: 'clots', en: 'Clots', hi: 'क्लॉट्स' },
  { id: 'none', en: 'N/A', hi: 'नहीं' },
];

export default function Track() {
  const router = useRouter();
  const logs = useAppStore((s) => s.symptomLogs);
  const profile = useAppStore((s) => s.profile);
  const upsert = useAppStore((s) => s.upsertSymptomLog);
  const today = format(new Date(), 'yyyy-MM-dd');
  const existing = logs.find((l) => l.logDate === today);
  const lang = profile?.language ?? 'en';
  const insights = buildInsights(logs, lang);
  const prediction = predictNextPeriod(logs);

  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>(existing?.periodStatus ?? 'none');
  const [bleedPattern, setBleedPattern] = useState<BleedPattern>(existing?.bleedPattern ?? 'none');
  const [selected, setSelected] = useState<Record<string, number>>(existing?.symptoms ?? {});
  const [mood, setMood] = useState(existing?.mood ?? 3);
  const [energyCrash, setEnergyCrash] = useState(existing?.energyCrash ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saved, setSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const marked = useMemo(() => {
    const m: Record<string, any> = {};
    for (const log of logs) {
      const isPeriod = log.periodStatus !== 'none';
      m[log.logDate] = {
        marked: true,
        dotColor: isPeriod ? colors.rose : colors.tealMid,
      };
    }
    m[today] = { ...(m[today] ?? {}), selected: true, selectedColor: colors.blushDeep };
    return m;
  }, [logs, today]);

  const toggleSymptom = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 3;
      return next;
    });
  };

  const save = () => {
    upsert({
      logDate: today,
      periodStatus,
      bleedPattern: periodStatus === 'none' ? 'none' : bleedPattern,
      symptoms: selected,
      mood,
      energyCrash,
      notes,
    });
    setSaved(true);
  };

  const hi = lang === 'hi';

  return (
    <Screen scroll>
      <ScreenHeader
        door={hi ? 'ट्रैक' : 'Track'}
        title={hi ? 'आज शरीर कैसा है?' : 'How’s your body today?'}
        subtitle={hi ? 'पीरियड + 1–2 लक्षण · दो मिनट।' : 'Period + 1–2 symptoms · two minutes.'}
      />

      {logs.length >= 2 && (
        <View style={{ marginTop: spacing.lg }}>
          <Label>{hi ? 'संभावित विंडो' : 'Likely window'}</Label>
          <Title style={{ marginTop: 6, fontSize: 17 }}>
            {hi ? prediction.labelHi : prediction.label}
          </Title>
          <Muted style={{ marginTop: 4 }}>
            {hi ? 'PCOS में अनुमान विनम्र रहता है।' : 'PCOS predictions stay humble — never certain.'}
          </Muted>
        </View>
      )}

      <Label style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        {lang === 'hi' ? 'पीरियड' : 'Period'}
      </Label>
      <View style={styles.wrap}>
        {(
          [
            ['started', 'Started', 'शुरू'],
            ['flowing', 'Flowing', 'चल रहा'],
            ['spotting', 'Spotting', 'स्पॉटिंग'],
            ['none', 'None', 'नहीं'],
          ] as [PeriodStatus, string, string][]
        ).map(([id, en, hi]) => (
          <Chip
            key={id}
            label={lang === 'hi' ? hi : en}
            selected={periodStatus === id}
            tone="rose"
            onPress={() => setPeriodStatus(id)}
          />
        ))}
      </View>

      {periodStatus !== 'none' && (
        <>
          <Label style={{ marginVertical: spacing.sm }}>
            {lang === 'hi' ? 'ब्लीडिंग पैटर्न' : 'Bleeding pattern'}
          </Label>
          <View style={styles.wrap}>
            {BLEED.filter((b) => b.id !== 'none').map((b) => (
              <Chip
                key={b.id}
                label={lang === 'hi' ? b.hi : b.en}
                selected={bleedPattern === b.id}
                tone="rose"
                onPress={() => setBleedPattern(b.id)}
              />
            ))}
          </View>
        </>
      )}

      <Label style={{ marginVertical: spacing.sm }}>
        {lang === 'hi' ? 'लक्षण' : 'Symptoms'}
      </Label>
      <View style={styles.wrap}>
        {SYMPTOM_OPTS.map((s) => (
          <Chip
            key={s.id}
            label={hi ? s.hi : s.en}
            selected={!!selected[s.id]}
            onPress={() => toggleSymptom(s.id)}
          />
        ))}
      </View>

      <Label style={{ marginTop: spacing.md }}>
        {lang === 'hi' ? `मूड · ${mood}/5` : `Mood · ${mood}/5`}
      </Label>
      <View style={[styles.wrap, { marginTop: spacing.sm }]}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Chip key={n} label={String(n)} selected={mood === n} tone="gold" onPress={() => setMood(n)} />
        ))}
      </View>

      <Card tone="solid" style={{ marginVertical: spacing.md, padding: 0 }}>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={lang === 'hi' ? 'नोट्स (वैकल्पिक)' : 'Notes (optional)'}
          placeholderTextColor={colors.muted}
          style={styles.notes}
          multiline
        />
      </Card>

      <Button
        label={
          saved
            ? lang === 'hi'
              ? 'आज सेव हो गया'
              : 'Saved for today'
            : lang === 'hi'
              ? 'आज का लॉग सेव करें'
              : 'Save today’s log'
        }
        onPress={save}
        style={{ marginTop: spacing.md }}
      />
      {saved && (
        <Pressable onPress={() => router.push('/ai')} style={{ marginTop: spacing.md }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: colors.blushDeep, fontSize: 14 }}>
            {hi ? 'आज के लक्षणों पर AI से पूछें →' : 'Ask AI about today’s symptoms →'}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => setShowMore((v) => !v)}
        style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}
      >
        <Text style={{ fontFamily: fonts.bodyBold, color: colors.muted, fontSize: 13 }}>
          {showMore
            ? hi
              ? 'और छुपाएँ'
              : 'Hide more'
            : hi
              ? 'और →'
              : 'More →'}
        </Text>
      </Pressable>

      {showMore && (
        <>
          <Label style={{ marginBottom: spacing.sm }}>
            {hi ? 'इंसुलिन संकेत' : 'Insulin signal'}
          </Label>
          <Chip
            label={
              hi
                ? energyCrash
                  ? '✓ खाने के बाद झपकी / क्रैश'
                  : 'खाने के बाद झपकी / क्रैश?'
                : energyCrash
                  ? '✓ Post-meal crash today'
                  : 'Post-meal energy crash?'
            }
            selected={energyCrash}
            tone="gold"
            onPress={() => setEnergyCrash((v) => !v)}
          />
          <Card tone="solid" style={{ padding: spacing.sm, marginTop: spacing.md }}>
            <Calendar
              markedDates={marked}
              theme={{
                backgroundColor: colors.white,
                calendarBackground: colors.white,
                todayTextColor: colors.rose,
                selectedDayBackgroundColor: colors.blushDeep,
                arrowColor: colors.blushDeep,
                monthTextColor: colors.ink,
                textDayFontFamily: fonts.body,
                textMonthFontFamily: fonts.bodyBold,
                textDayHeaderFontFamily: fonts.bodyMedium,
              }}
            />
          </Card>
          {insights.slice(0, 2).map((ins) => (
            <View key={ins.id} style={{ marginTop: spacing.md }}>
              <Title style={{ fontSize: 16 }}>{hi ? ins.titleHi : ins.title}</Title>
              <Muted style={{ marginTop: 4 }}>{hi ? ins.detailHi : ins.detail}</Muted>
            </View>
          ))}
          <Pressable onPress={() => router.push('/cycle-calm')} style={{ marginTop: spacing.lg }}>
            <Text style={{ fontFamily: fonts.bodyBold, color: colors.blushDeep, fontSize: 14 }}>
              {hi ? 'अनियमित साइकल? शांत स्पष्टता →' : 'Irregular cycle? Calm clarity →'}
            </Text>
          </Pressable>
        </>
      )}

      <Disclaimer lang={lang} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  notes: {
    minHeight: 88,
    padding: spacing.md,
    fontFamily: fonts.body,
    color: colors.ink,
    textAlignVertical: 'top',
    fontSize: 15,
  },
});
