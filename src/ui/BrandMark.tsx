import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fonts } from '@/src/theme/tokens';

type Props = {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
  style?: ViewStyle;
};

/** NariCare lotus-heart mark + optional wordmark. */
export function BrandMark({
  size = 40,
  showWordmark = false,
  wordmarkColor = colors.forest,
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        accessibilityLabel="NariCare"
      />
      {showWordmark ? (
        <Text style={[styles.word, { color: wordmarkColor, fontSize: Math.max(16, size * 0.42) }]}>
          NariCare
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: {
    fontFamily: fonts.displayBold,
    letterSpacing: -0.4,
  },
});
