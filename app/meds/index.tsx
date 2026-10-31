import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

/** Adherence log only, never dosing advice. */
export default function MedsLog() {
  const profile = useAppStore((s) => s.profile);
  const supplements = useAppStore((s) => s.supplements);
  const toggleSupplement = useAppStore((s) => s.toggleSupplement);
  const addCustomMed = useAppStore((s) => s.addCustomMed);
  const lang = profile?.language ?? 'en';
  const [custom, setCustom] = useState('');

  const add = () => {
    const name = custom.trim();
    if (!name) return;
    addCustomMed(name);
    setCustom('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'दवा / सप्लीमेंट' : 'Meds & supplements',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{lang === 'hi' ? 'सुरक्षित लॉग' : 'Safe log'}</Label>
          <Display style={{ marginTop: 6 }}>
            {lang === 'hi' ? 'सिर्फ़ पालन\nट्रैक करें' : 'Track adherence\nonly'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {lang === 'hi'
              ? 'खुराक शुरू/बंद करने की सलाह कभी नहीं। डॉक्टर की योजना पर टिक करें।'
              : 'Never start/stop Rx from this app. Tick what your doctor already prescribed.'}
          </Body>
        </Animated.View>

        <Card tone="rose" style={{ marginTop: spacing.lg }}>
          <Title style={{ fontSize: 15 }}>
            {lang === 'hi' ? '⚠ खुराक सलाह नहीं' : '⚠ No dosing advice'}
          </Title>
          <Muted style={{ marginTop: 6 }}>
            {lang === 'hi'
              ? 'यह स्क्रीन याद दिलाने के लिए है — उपचार बदलने के लिए नहीं।'
              : 'This screen is for remembering — not changing treatment.'}
          </Muted>
        </Card>

        <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          {lang === 'hi' ? 'आज लिया?' : 'Taken today?'}
        </Label>
        {Object.keys(supplements.items).length === 0 ? (
          <Muted>
            {lang === 'hi'
              ? 'अभी कुछ नहीं जोड़ा। सिर्फ़ वही जोड़ें जो डॉक्टर ने बताया है, जैसे Metformin, विटामिन D या इनोसिटॉल।'
              : 'Nothing added yet. Add only what your doctor advised, like Metformin, vitamin D or inositol.'}
          </Muted>
        ) : null}
        {Object.keys(supplements.items).map((item, i) => {
          const on = !!supplements.items[item];
          return (
            <Animated.View key={item} entering={FadeInDown.delay(30 * i).duration(300)}>
              <Pressable
                onPress={() => toggleSupplement(item)}
                style={[styles.row, on && styles.rowOn]}
              >
                <View style={[styles.box, on && styles.boxOn]}>
                  <Text style={styles.check}>{on ? '✓' : ''}</Text>
                </View>
                <Title style={{ flex: 1, fontSize: 16 }}>{item}</Title>
              </Pressable>
            </Animated.View>
          );
        })}

        <Card tone="solid" style={{ marginTop: spacing.lg, padding: 0 }}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder={
              lang === 'hi' ? 'कस्टम नाम जोड़ें (जैसे Metformin)' : 'Add custom name (e.g. Metformin)'
            }
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </Card>
        <Button
          label={lang === 'hi' ? 'सूची में जोड़ें' : 'Add to today’s list'}
          variant="secondary"
          onPress={add}
          style={{ marginTop: spacing.md }}
        />
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
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  check: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 13 },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
});
