import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

const ICONS: Record<string, string> = {
  home: '⌂',
  diet: '◇',
  move: '✧',
  track: '◎',
  profile: '◌',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconOn]}>
      <Text style={[styles.icon, focused && styles.iconTextOn]}>{ICONS[name]}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const lang = useAppStore((s) => s.profile?.language ?? 'en');
  const labels =
    lang === 'hi'
      ? { home: 'होम', diet: 'खाएँ', move: 'मूव', track: 'ट्रैक', profile: 'आप' }
      : { home: 'Home', diet: 'Eat', move: 'Move', track: 'Track', profile: 'You' };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blushDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.bodyBold,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFBFA',
          borderTopWidth: 1,
          borderTopColor: colors.line,
          height: 66 + Math.max(insets.bottom, 8),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: labels.home,
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: labels.diet,
          tabBarIcon: ({ focused }) => <TabIcon name="diet" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="move"
        options={{
          title: labels.move,
          tabBarIcon: ({ focused }) => <TabIcon name="move" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: labels.track,
          tabBarIcon: ({ focused }) => <TabIcon name="track" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: labels.profile,
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 42,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  iconOn: { backgroundColor: colors.blushSoft },
  icon: { fontSize: 18, color: colors.muted, opacity: 0.45 },
  iconTextOn: { color: colors.blushDeep, opacity: 1 },
});
