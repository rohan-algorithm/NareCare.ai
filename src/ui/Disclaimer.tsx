import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { t } from '@/src/i18n/copy';
import type { Language } from '@/src/types';

export function Disclaimer({ lang = 'en' }: { lang?: Language }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{t('educational', lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(11,42,44,0.04)',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
  },
});
