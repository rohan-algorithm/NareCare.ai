import { useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Card } from '@/src/ui/Card';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { buildGroceryList } from '@/src/features/grocery';
import { livingContextLabel } from '@/src/content/meals';

export default function Grocery() {
  const profile = useAppStore((s) => s.profile);
  const lang = profile?.language ?? 'en';
  const ctx = profile?.livingContext ?? 'family_kitchen';
  const mealSwaps = useAppStore((s) => s.mealSwaps);
  const list = useMemo(() => buildGroceryList(profile, mealSwaps, 7), [profile, mealSwaps]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (item: string) => setChecked((c) => ({ ...c, [item]: !c[item] }));
  const allItems = [...list.produce, ...list.pantry, ...list.staples];
  const done = allItems.filter((i) => checked[i]).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'किराना सूची' : 'Grocery list',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{livingContextLabel(ctx, lang === 'hi' ? 'hi' : 'en')}</Label>
          <Display style={{ marginTop: 6 }}>
            {lang === 'hi' ? 'इस हफ़्ते का\nकिराना' : "This week's\ngrocery"}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {lang === 'hi'
              ? 'आपके meal plan + living context से बनाई गई सूची।'
              : 'Built from your meal plan + living context — PCOS staples included.'}
          </Body>
          <Muted style={{ marginTop: 8 }}>
            {done}/{allItems.length} {lang === 'hi' ? 'टिक' : 'ticked'}
          </Muted>
        </Animated.View>

        {list.tips[0] ? (
          <Muted style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>{list.tips[0]}</Muted>
        ) : null}

        <Section
          title={lang === 'hi' ? 'सब्ज़ी / फ्रेश' : 'Produce'}
          items={list.produce}
          checked={checked}
          onToggle={toggle}
        />
        <Section
          title={lang === 'hi' ? 'पैंट्री' : 'Pantry'}
          items={list.pantry}
          checked={checked}
          onToggle={toggle}
        />
        <Section
          title={lang === 'hi' ? 'PCOS स्टेपल्स' : 'PCOS staples'}
          items={list.staples}
          checked={checked}
          onToggle={toggle}
        />
      </Screen>
    </>
  );
}

function Section({
  title,
  items,
  checked,
  onToggle,
}: {
  title: string;
  items: string[];
  checked: Record<string, boolean>;
  onToggle: (item: string) => void;
}) {
  if (!items.length) return null;
  return (
    <Card tone="solid" style={{ marginTop: spacing.lg }}>
      <Title>{title}</Title>
      {items.map((item) => {
        const on = !!checked[item];
        return (
          <Pressable key={item} onPress={() => onToggle(item)} style={styles.row}>
            <View style={[styles.box, on && styles.boxOn]}>
              <Text style={styles.check}>{on ? '✓' : ''}</Text>
            </View>
            <Muted
              style={{
                flex: 1,
                color: on ? colors.muted : colors.ink,
                fontSize: 15,
                textDecorationLine: on ? 'line-through' : 'none',
              }}
            >
              {item}
            </Muted>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  tip: { fontFamily: fonts.bodyMedium, color: colors.amber, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mist,
  },
  boxOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  check: { color: colors.white, fontSize: 12, fontFamily: fonts.bodyBold },
});
