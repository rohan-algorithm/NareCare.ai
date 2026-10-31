import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, fonts, radii, spacing } from '@/src/theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'gold' | 'rose';
  style?: ViewStyle;
};

export function Chip({ label, selected, onPress, tone = 'default', style }: Props) {
  const selectedBg =
    tone === 'gold' ? colors.amberSoft : tone === 'rose' ? colors.blushSoft : colors.mist;
  const selectedColor =
    tone === 'gold' ? colors.amber : tone === 'rose' ? colors.blushDeep : colors.forest;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, style, selected && { backgroundColor: selectedBg, borderColor: selectedColor }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.text,
          selected && { color: selectedColor, fontFamily: fonts.bodyBold },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
  },
});
