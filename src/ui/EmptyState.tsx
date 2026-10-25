import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/ui/Button';
import { Body, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';

type Props = {
  title: string;
  body: string;
  cta?: string;
  onPress?: () => void;
};

export function EmptyState({ title, body, cta, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.mark}>
        <Text style={styles.markText}>◇</Text>
      </View>
      <Title style={{ textAlign: 'center', marginTop: spacing.md }}>{title}</Title>
      <Body style={{ textAlign: 'center', color: colors.muted, marginTop: spacing.sm }}>{body}</Body>
      {cta && onPress ? (
        <Button label={cta} onPress={onPress} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.blushDeep },
});
