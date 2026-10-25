import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts, radii, spacing } from '@/src/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', style, disabled }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const labelColor =
    variant === 'secondary' || variant === 'ghost'
      ? colors.blushDeep
      : variant === 'gold'
        ? colors.ink
        : colors.white;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPress();
      }}
      style={[
        styles.base,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'gold' && styles.gold,
        disabled && { opacity: 0.45 },
        anim,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={['#FF8A7A', '#E24B5A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.fill}>
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gold: {
    backgroundColor: colors.amber,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
