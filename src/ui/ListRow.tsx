import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  trailing?: string;
  style?: ViewStyle;
};

/** Flo/Oura-style list row — tap target without heavy card chrome. */
export function ListRow({ title, subtitle, onPress, trailing = '→', style }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.row, style]} accessibilityRole="button">
      <View style={{ flex: 1 }}>
        <Title style={{ fontSize: 16 }}>{title}</Title>
        {subtitle ? <Muted style={{ marginTop: 3 }}>{subtitle}</Muted> : null}
      </View>
      <Text style={styles.trail}>{trailing}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  trail: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.blushDeep,
    opacity: 0.7,
  },
});
