import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { EXAM_KIT } from '@/src/content/examKit';
import { useAppStore } from '@/src/store/useAppStore';

export default function ExamKit() {
  const profile = useAppStore((s) => s.profile);
  const lang = profile?.language ?? 'en';
  const [packed, setPacked] = useState<Record<string, boolean>>({});

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'परीक्षा किट' : 'Exam kit',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{lang === 'hi' ? 'हॉस्टल · परीक्षा' : 'Hostel · exam week'}</Label>
          <Display style={{ marginTop: 6 }}>
            {lang === 'hi' ? EXAM_KIT.titleHi : EXAM_KIT.title}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {lang === 'hi'
              ? 'स्ट्रेस + छूटे खाने से साइकल बिगड़ता है। पहले पैक करें, फिर पढ़ें।'
              : 'Stress + skipped meals wreck cycles. Pack first, then study.'}
          </Body>
        </Animated.View>

        <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          {lang === 'hi' ? 'बैग में रखें' : 'Pack list'}
        </Label>
        {EXAM_KIT.pack.map((item, i) => {
          const key = item.en;
          const on = !!packed[key];
          return (
            <Animated.View key={key} entering={FadeInDown.delay(30 * i).duration(320)}>
              <Pressable
                onPress={() => setPacked((p) => ({ ...p, [key]: !p[key] }))}
                style={[styles.row, on && styles.rowOn]}
              >
                <View style={[styles.box, on && styles.boxOn]}>
                  <Text style={styles.check}>{on ? '✓' : ''}</Text>
                </View>
                <Title style={{ flex: 1, fontSize: 15 }}>
                  {lang === 'hi' ? item.hi : item.en}
                </Title>
              </Pressable>
            </Animated.View>
          );
        })}

        <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          {lang === 'hi' ? 'नियम' : 'Rules'}
        </Label>
        {EXAM_KIT.rules.map((r) => (
          <Muted key={r.en} style={{ marginBottom: spacing.sm }}>
            · {lang === 'hi' ? r.hi : r.en}
          </Muted>
        ))}
        <Disclaimer lang={lang} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowOn: { backgroundColor: colors.mist },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  check: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
});
