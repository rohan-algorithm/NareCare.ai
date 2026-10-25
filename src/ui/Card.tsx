import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radii, shadow, spacing } from '@/src/theme/tokens';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  tone?: 'glass' | 'solid' | 'dark' | 'gold' | 'rose' | 'mist';
  padded?: boolean;
};

export function Card({ children, style, tone = 'glass', padded = true }: Props) {
  return (
    <View
      style={StyleSheet.flatten([
        styles.base,
        padded && styles.padded,
        tone === 'glass' && styles.glass,
        tone === 'solid' && styles.solid,
        tone === 'dark' && styles.dark,
        tone === 'gold' && styles.gold,
        tone === 'rose' && styles.rose,
        tone === 'mist' && styles.mist,
        style,
      ])}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  padded: { padding: spacing.lg },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  solid: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  dark: {
    backgroundColor: colors.forest,
    ...shadow.soft,
  },
  gold: {
    backgroundColor: colors.amberSoft,
  },
  rose: {
    backgroundColor: colors.blushSoft,
  },
  mist: {
    backgroundColor: colors.mist,
  },
});
