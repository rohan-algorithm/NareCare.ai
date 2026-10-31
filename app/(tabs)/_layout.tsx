import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, gradients } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { Ionicons, type IconName } from '@/src/ui/Icon';

const ICONS: Record<string, [IconName, IconName]> = {
  home: ['home-outline', 'home'],
  diet: ['restaurant-outline', 'restaurant'],
  move: ['fitness-outline', 'fitness'],
  track: ['calendar-outline', 'calendar'],
  profile: ['person-circle-outline', 'person-circle'],
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const [off, on] = ICONS[name];
  return (
    <View style={[styles.iconWrap, focused && styles.iconOn]}>
      <Ionicons name={focused ? on : off} size={22} color={focused ? colors.blushDeep : colors.muted} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const lang = useAppStore((s) => s.profile?.language ?? 'en');
  const labels =
    lang === 'hi'
      ? { home: 'होम', diet: 'खाएँ', coach: 'AI', move: 'एक्सरसाइज़', track: 'ट्रैक', profile: 'मैं' }
      : { home: 'Home', diet: 'Eat', coach: 'AI', move: 'Exercise', track: 'Track', profile: 'Me' };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blushDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          height: 68 + Math.max(insets.bottom, 8),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          shadowColor: '#3A1F2B',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.1,
          shadowRadius: 18,
          elevation: 18,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: labels.home, tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="diet"
        options={{ title: labels.diet, tabBarIcon: ({ focused }) => <TabIcon name="diet" focused={focused} /> }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: labels.coach,
          tabBarIcon: () => (
            <LinearGradient colors={[...gradients.ai]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ai}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="move"
        options={{ title: labels.move, tabBarIcon: ({ focused }) => <TabIcon name="move" focused={focused} /> }}
      />
      <Tabs.Screen
        name="track"
        options={{ title: labels.track, tabBarIcon: ({ focused }) => <TabIcon name="track" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: labels.profile, tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 40, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  iconOn: { backgroundColor: colors.blushSoft },
  ai: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
