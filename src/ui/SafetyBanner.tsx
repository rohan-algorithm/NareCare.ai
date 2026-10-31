import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts } from '@/src/theme/tokens';
import type { CycleStatus } from '@/src/features/cycle';
import { localDate } from '@/src/features/mealPlan';
import type { SymptomLog } from '@/src/types';

/** Red flags the doctors on the council asked to surface, most urgent first. */
export function SafetyBanner({ cycle, logs, hi }: { cycle: CycleStatus; logs: SymptomLog[]; hi: boolean }) {
  const router = useRouter();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const recent = [localDate(), localDate(y)];
  const heavy = logs.some((l) => recent.includes(l.logDate) && (l.bleedPattern === 'heavy' || l.bleedPattern === 'clots'));

  let tone: 'red' | 'amber';
  let title: string;
  let body: string;
  let cta: { label: string; href: string } | null = null;

  if (heavy) {
    tone = 'red';
    title = hi ? 'भारी ब्लीडिंग लॉग हुई' : 'Heavy bleeding logged';
    body = hi
      ? 'अगर हर घंटे पैड भीग रहा है, बड़े थक्के हैं, या चक्कर/कमज़ोरी है, तो आज ही डॉक्टर को दिखाएँ।'
      : 'If you soak a pad every hour, pass large clots, or feel dizzy or weak, see a doctor today.';
  } else if (cycle.overdue) {
    tone = 'red';
    title = hi ? `${cycle.day} दिन से पीरियड नहीं` : `No period for ${cycle.day} days`;
    body = hi
      ? 'PCOS गाइडलाइन कहती है 3 महीने से ज़्यादा पीरियड न आएँ तो गाइनी से मिलें: डॉक्टर गर्भाशय की परत को सुरक्षित रखने का तरीका बताएँगी। अगर गर्भ संभव है तो पहले टेस्ट करें।'
      : 'The PCOS guideline says to see a gynaecologist after 3 months without a period, so they can protect the womb lining. If pregnancy is possible, take a test first.';
    cta = { label: hi ? 'डॉक्टर किट तैयार करें' : 'Prepare doctor kit', href: '/doctor-kit' };
  } else if (cycle.late) {
    tone = 'amber';
    title = hi ? `दिन ${cycle.day}: सामान्य से देर` : `Day ${cycle.day}: later than usual`;
    body = hi
      ? 'PCOS और तनाव में पीरियड अक्सर देर से आते हैं। अगर गर्भ संभव है, तो घर पर टेस्ट करना ठीक रहेगा।'
      : 'PCOS and stress often delay periods. If pregnancy is possible, a home test is worth doing.';
  } else {
    return null;
  }

  const fg = tone === 'red' ? colors.danger : '#9A6A12';
  return (
    <View style={[styles.box, tone === 'red' ? styles.red : styles.amber]}>
      <Ionicons name={tone === 'red' ? 'alert-circle' : 'information-circle'} size={22} color={fg} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: fg }]}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {cta ? (
          <Pressable onPress={() => router.push(cta.href as any)} hitSlop={6}>
            <Text style={[styles.cta, { color: fg }]}>{cta.label} →</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, borderRadius: 18, padding: 14, marginTop: 12, borderWidth: 1 },
  red: { backgroundColor: '#FFF0F0', borderColor: '#F7C6C6' },
  amber: { backgroundColor: colors.amberSoft, borderColor: '#F3DCA6' },
  title: { fontFamily: fonts.bodyBold, fontSize: 14.5 },
  body: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.ink, marginTop: 3 },
  cta: { fontFamily: fonts.bodyBold, fontSize: 13.5, marginTop: 6 },
});
