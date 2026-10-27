import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Chip } from '@/src/ui/Chip';
import { Body, Headline, Muted } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { derivePhenotype, phenotypeLabel } from '@/src/features/phenotype';
import type {
  CuisinePreference,
  DiagnosisStatus,
  DietPreference,
  Language,
  LivingContext,
} from '@/src/types';

const SYMPTOMS = [
  { id: 'irregular_periods', en: 'Irregular periods', hi: 'अनियमित पीरियड' },
  { id: 'weight_gain', en: 'Weight gain', hi: 'वजन बढ़ना' },
  { id: 'acne', en: 'Acne', hi: 'मुंहासे' },
  { id: 'hair_fall', en: 'Hair fall', hi: 'बाल झड़ना' },
  { id: 'facial_hair', en: 'Facial hair', hi: 'चेहरे पर बाल' },
  { id: 'mood_swings', en: 'Mood swings', hi: 'मूड स्विंग' },
  { id: 'fatigue', en: 'Fatigue', hi: 'थकान' },
  { id: 'bloating', en: 'Bloating', hi: 'ब्लोटरिंग' },
  { id: 'cravings', en: 'Cravings', hi: 'क्रेविंग' },
];

const GOALS = [
  { id: 'lose_weight', en: 'Lose weight', hi: 'वजन कम' },
  { id: 'regulate_periods', en: 'Regulate periods', hi: 'पीरियड नियमित' },
  { id: 'fertility', en: 'Improve fertility', hi: 'फर्टिलिटी' },
  { id: 'skin_hair', en: 'Clear skin & less facial hair', hi: 'साफ़ त्वचा, कम अनचाहे बाल' },
  { id: 'manage_symptoms', en: 'Manage mood & symptoms', hi: 'मूड और लक्षण मैनेज' },
  { id: 'wellness', en: 'General wellness', hi: 'समग्र स्वास्थ्य' },
];

export default function Setup() {
  const router = useRouter();
  const draft = useAppStore((s) => s.setupDraft);
  const update = useAppStore((s) => s.updateSetupDraft);
  const finishSetup = useAppStore((s) => s.finishSetup);
  const step = draft.step ?? 0;
  const hi = (draft.language ?? 'en') === 'hi';

  const toggle = (field: 'symptoms' | 'allergies' | 'goals', id: string) => {
    const list = draft[field] ?? [];
    update({
      [field]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    });
  };

  const canContinue = () => {
    if (step === 0) return Boolean((draft.name ?? '').trim()) && (draft.age ?? 0) >= 18;
    if (step === 1) return (draft.symptoms?.length ?? 0) > 0;
    if (step === 2) return Boolean(draft.livingContext) && Boolean(draft.dietPreference);
    if (step === 3) return (draft.goals?.length ?? 0) > 0;
    return true;
  };

  const next = () => {
    if (!canContinue()) return;
    if (step < 4) {
      update({ step: step + 1 });
      return;
    }
    finishSetup();
    router.replace('/paywall');
  };

  const back = () => {
    if (step > 0) update({ step: step - 1 });
  };

  return (
    <Screen scroll>
      <Muted>
        {hi ? `स्टेप ${step + 1} / 5` : `Step ${step + 1} of 5`}
      </Muted>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / 5) * 100}%` }]} />
      </View>

      {step === 0 && (
        <View>
          <Headline>{hi ? 'बेसिक्स' : 'Basics'}</Headline>
          <Body style={styles.lead}>
            {hi
              ? 'प्लान आपके शरीर के हिसाब से — जेनेरिक चार्ट नहीं।'
              : 'So your plan fits your body — not a generic chart.'}
          </Body>
          <Muted style={{ marginBottom: spacing.sm }}>Language · भाषा</Muted>
          <View style={styles.wrap}>
            {(
              [
                ['en', 'English'],
                ['hi', 'हिन्दी'],
              ] as [Language, string][]
            ).map(([id, label]) => (
              <Chip
                key={id}
                label={label}
                selected={(draft.language ?? 'en') === id}
                onPress={() => update({ language: id })}
              />
            ))}
          </View>
          <Field
            label={hi ? 'नाम' : 'Name'}
            value={draft.name ?? ''}
            onChange={(name) => update({ name })}
          />
          <Field
            label={hi ? 'उम्र' : 'Age'}
            value={draft.age ? String(draft.age) : ''}
            keyboard="numeric"
            onChange={(v) => update({ age: Number(v) || 0 })}
          />
          <Field
            label={hi ? 'ऊंचाई (cm)' : 'Height (cm)'}
            value={draft.heightCm ? String(draft.heightCm) : ''}
            keyboard="numeric"
            onChange={(v) => update({ heightCm: Number(v) || 0 })}
          />
          <Field
            label={hi ? 'वजन (kg)' : 'Weight (kg)'}
            value={draft.weightKg ? String(draft.weightKg) : ''}
            keyboard="numeric"
            onChange={(v) => update({ weightKg: Number(v) || 0 })}
          />
          <Field
            label={hi ? 'शहर' : 'City'}
            value={draft.city ?? ''}
            onChange={(city) => update({ city })}
          />
        </View>
      )}

      {step === 1 && (
        <View>
          <Headline>{hi ? 'आपकी PCOS तस्वीर' : 'Your PCOS picture'}</Headline>
          <Body style={styles.lead}>
            {hi
              ? 'लक्षण → phenotype → रोज़ का फोकस रैंडम नहीं।'
              : 'We’ll map this into a phenotype so daily focus isn’t random.'}
          </Body>
          <Muted style={{ marginBottom: spacing.sm }}>{hi ? 'निदान' : 'Diagnosis'}</Muted>
          <View style={styles.wrap}>
            {(
              [
                ['diagnosed', 'Diagnosed', 'निदान हुआ'],
                ['suspect', 'I suspect', 'संदेह है'],
                ['unsure', 'Not sure', 'पता नहीं'],
              ] as [DiagnosisStatus, string, string][]
            ).map(([id, en, hiL]) => (
              <Chip
                key={id}
                label={hi ? hiL : en}
                selected={draft.diagnosisStatus === id}
                onPress={() => update({ diagnosisStatus: id })}
              />
            ))}
          </View>
          <Muted style={{ marginVertical: spacing.sm }}>{hi ? 'लक्षण' : 'Symptoms'}</Muted>
          <View style={styles.wrap}>
            {SYMPTOMS.map((s) => (
              <Chip
                key={s.id}
                label={hi ? s.hi : s.en}
                selected={(draft.symptoms ?? []).includes(s.id)}
                onPress={() => toggle('symptoms', s.id)}
              />
            ))}
          </View>
          {(draft.symptoms?.length ?? 0) > 0 && (
            <View style={styles.phenotypeCard}>
              <Muted>{hi ? 'संभावित पैटर्न' : 'Likely pattern'}</Muted>
              <Text style={styles.phenotypeText}>
                {phenotypeLabel(derivePhenotype(draft.symptoms ?? []), hi ? 'hi' : 'en')}
              </Text>
            </View>
          )}
        </View>
      )}

      {step === 2 && (
        <View>
          <Headline>{hi ? 'आप कैसे खाती हो' : 'How you eat'}</Headline>
          <Body style={styles.lead}>
            {hi
              ? 'मेस और फैमिली किचन को नज़रअंदाज़ करने वाले प्लान फेल होते हैं।'
              : 'Living context is our edge — plans fail when they ignore mess food and family kitchens.'}
          </Body>
          <Muted style={{ marginBottom: spacing.sm }}>{hi ? 'रहने का संदर्भ' : 'Living context'}</Muted>
          <View style={styles.wrap}>
            {(
              [
                ['family_kitchen', 'Family kitchen', 'परिवार की रसोई'],
                ['hostel_mess', 'Hostel / mess', 'हॉस्टल / मेस'],
                ['tiffin', 'Tiffin / dabba', 'टिफिन / डब्बा'],
                ['eating_out', 'Eating out', 'बाहर खाना'],
              ] as [LivingContext, string, string][]
            ).map(([id, en, hiL]) => (
              <Chip
                key={id}
                label={hi ? hiL : en}
                selected={draft.livingContext === id}
                onPress={() => update({ livingContext: id })}
              />
            ))}
          </View>
          <Muted style={{ marginVertical: spacing.sm }}>{hi ? 'डाइट' : 'Diet'}</Muted>
          <View style={styles.wrap}>
            {(
              [
                ['vegetarian', 'Vegetarian', 'शाकाहारी'],
                ['eggetarian', 'Eggetarian', 'अंडाशाकाहारी'],
                ['non_veg', 'Non-veg', 'मांसाहारी'],
                ['vegan', 'Vegan', 'वीगन'],
                ['jain', 'Jain', 'जैन'],
              ] as [DietPreference, string, string][]
            ).map(([id, en, hiL]) => (
              <Chip
                key={id}
                label={hi ? hiL : en}
                selected={draft.dietPreference === id}
                onPress={() => update({ dietPreference: id })}
              />
            ))}
          </View>
          <Muted style={{ marginVertical: spacing.sm }}>{hi ? 'खान-पान' : 'Cuisine'}</Muted>
          <View style={styles.wrap}>
            {(
              [
                ['north_indian', 'North Indian', 'उत्तर भारतीय'],
                ['south_indian', 'South Indian', 'दक्षिण भारतीय'],
                ['bengali', 'Bengali', 'बंगाली'],
                ['gujarati', 'Gujarati', 'गुजराती'],
                ['pan_indian', 'Pan-Indian', 'पैन-इंडियन'],
              ] as [CuisinePreference, string, string][]
            ).map(([id, en, hiL]) => (
              <Chip
                key={id}
                label={hi ? hiL : en}
                selected={draft.cuisinePreference === id}
                onPress={() => update({ cuisinePreference: id })}
              />
            ))}
          </View>
          <Muted style={{ marginVertical: spacing.sm }}>{hi ? 'एलर्जी' : 'Allergies'}</Muted>
          <View style={styles.wrap}>
            {(
              [
                ['Gluten', 'ग्लूटेन'],
                ['Dairy', 'डेयरी'],
                ['Nuts', 'नट्स'],
                ['Soy', 'सोया'],
              ] as [string, string][]
            ).map(([en, hiL]) => (
              <Chip
                key={en}
                label={hi ? hiL : en}
                selected={(draft.allergies ?? []).includes(en)}
                onPress={() => toggle('allergies', en)}
              />
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Headline>{hi ? 'आपके लक्ष्य' : 'Your goals'}</Headline>
          <Body style={styles.lead}>
            {hi
              ? 'रोज़ सिर्फ़ दो काम — ओवरलोड से प्लान मरते हैं।'
              : 'We’ll keep daily actions to two — overwhelm is why plans die.'}
          </Body>
          <View style={styles.wrap}>
            {GOALS.map((g) => (
              <Chip
                key={g.id}
                label={hi ? g.hi : g.en}
                selected={(draft.goals ?? []).includes(g.id)}
                onPress={() => toggle('goals', g.id)}
              />
            ))}
          </View>
        </View>
      )}

      {step === 4 && (
        <View>
          <Headline>{hi ? 'आप तैयार हैं' : 'You’re set'}</Headline>
          <Body style={styles.lead}>
            {hi
              ? 'ट्रायल शुरू होने पर पर्सनलाइज़्ड प्लान अनलॉक। शैक्षिक साथी — निदान नहीं।'
              : 'Personalized plan unlocks after your trial starts. Educational companion — not a diagnosis.'}
          </Body>
          <View style={styles.summary}>
            <Row k={hi ? 'नाम' : 'Name'} v={draft.name ?? '—'} />
            <Row
              k={hi ? 'फेनोटाइप' : 'Phenotype'}
              v={phenotypeLabel(derivePhenotype(draft.symptoms ?? []), hi ? 'hi' : 'en')}
            />
            <Row
              k={hi ? 'संदर्भ' : 'Context'}
              v={draft.livingContext?.replaceAll('_', ' ') ?? 'family kitchen'}
            />
            <Row
              k={hi ? 'खान-पान' : 'Cuisine'}
              v={draft.cuisinePreference?.replaceAll('_', ' ') ?? 'north indian'}
            />
          </View>
        </View>
      )}

      {!canContinue() && (
        <Muted style={{ marginTop: spacing.md }}>
          {step === 0
            ? hi
              ? 'नाम और उम्र (18+) जोड़ें। NariCare 18+ के लिए है।'
              : 'Add your name and age to continue. NariCare is for women 18+.'
            : step === 1
              ? hi
                ? 'कम से कम एक लक्षण चुनें।'
                : 'Pick at least one symptom so we can map phenotype.'
              : step === 2
                ? hi
                  ? 'रहने का संदर्भ और डाइट चुनें।'
                  : 'Choose living context and diet preference.'
                : hi
                  ? 'कम से कम एक लक्ष्य चुनें।'
                  : 'Select at least one goal.'}
        </Muted>
      )}
      <View style={styles.actions}>
        {step > 0 && (
          <Button label={hi ? 'वापस' : 'Back'} variant="ghost" onPress={back} />
        )}
        <Button
          label={step === 4 ? (hi ? 'मेरा प्लान देखें' : 'See my plan') : hi ? 'आगे' : 'Continue'}
          onPress={next}
          disabled={!canContinue()}
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'numeric';
}) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <Muted>{label}</Muted>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard === 'numeric' ? 'numeric' : 'default'}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.row}>
      <Muted>{k}</Muted>
      <Text style={styles.rowValue}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { marginTop: spacing.sm, marginBottom: spacing.lg, color: colors.muted },
  progressTrack: {
    height: 6,
    backgroundColor: colors.lineStrong,
    borderRadius: 99,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.blushDeep },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    marginTop: 6,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  phenotypeCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.mist,
  },
  phenotypeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.teal,
    marginTop: 4,
  },
  summary: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowValue: { fontFamily: fonts.bodyMedium, color: colors.ink, textTransform: 'capitalize' },
});
