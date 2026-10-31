import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, shadowCard } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { GLASS_ML, litres, waterGoal } from '@/src/features/water';

const BLUE = '#2F80ED';

export function WaterCard() {
  const glasses = useAppStore((s) => s.waterGlasses);
  const addWater = useAppStore((s) => s.addWater);
  const weight = useAppStore((s) => s.profile?.weightKg);
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const goal = waterGoal(weight);
  const left = Math.max(0, goal - glasses);

  const add = (n: number) => {
    addWater(n);
    void Haptics.impactAsync(n > 0 ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Ionicons name="water" size={20} color={BLUE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{hi ? 'पानी' : 'Water'}</Text>
          <Text style={styles.sub}>
            {left === 0
              ? hi
                ? `लक्ष्य पूरा! ${litres(glasses)} 🎉`
                : `Goal reached! ${litres(glasses)} 🎉`
              : hi
                ? `${glasses}/${goal} गिलास · ${litres(left)} बाकी`
                : `${glasses} of ${goal} glasses · ${litres(left)} to go`}
          </Text>
        </View>
        <Pressable onPress={() => add(-1)} disabled={glasses === 0} hitSlop={8} style={[styles.round, glasses === 0 && { opacity: 0.35 }]} accessibilityLabel={hi ? 'एक गिलास घटाएँ' : 'Remove a glass'}>
          <Ionicons name="remove" size={18} color={colors.ink} />
        </Pressable>
        <Pressable onPress={() => add(1)} hitSlop={8} style={[styles.round, styles.plus]} accessibilityLabel={hi ? 'एक गिलास जोड़ें' : 'Add a glass'}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>
      <View style={styles.glasses}>
        {Array.from({ length: goal }, (_, i) => {
          const full = i < glasses;
          return (
            <Pressable key={i} onPress={() => add(i + 1 - glasses || (full ? -1 : 1))} hitSlop={4} style={[styles.glass, full && styles.glassFull]}>
              {full ? (
                <Animated.View entering={ZoomIn.duration(220)}>
                  <Ionicons name="water" size={16} color="#fff" />
                </Animated.View>
              ) : (
                <Ionicons name="water-outline" size={16} color="#9DBFEF" />
              )}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.fine}>
        {hi ? `1 गिलास = ${GLASS_ML} ml · वज़न के हिसाब से लक्ष्य` : `1 glass = ${GLASS_ML} ml · goal set from your weight`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 10, backgroundColor: '#fff', borderRadius: 22, padding: 14, ...shadowCard, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E6F0FD', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  round: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  plus: { backgroundColor: BLUE },
  glasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  glass: { width: 30, height: 36, borderRadius: 9, borderWidth: 1.5, borderColor: '#CFE0FA', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F9FF' },
  glassFull: { backgroundColor: BLUE, borderColor: BLUE },
  fine: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 8 },
});
