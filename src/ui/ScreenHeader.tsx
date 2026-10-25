import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BrandMark } from '@/src/ui/BrandMark';
import { Body, Display, Label } from '@/src/ui/Typography';
import { colors, spacing } from '@/src/theme/tokens';

type Props = {
  door?: string;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  right?: ReactNode;
};

/** Calm header — logo quiet, title dominant (Flo/Oura hierarchy). */
export function ScreenHeader({ door, title, subtitle, showLogo = true, right }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(360)}>
      {(showLogo || right) && (
        <View style={styles.top}>
          {showLogo ? <BrandMark size={28} showWordmark /> : <View />}
          {right}
        </View>
      )}
      {door ? (
        <Label style={{ marginTop: showLogo ? spacing.lg : 0, color: colors.blushDeep }}>{door}</Label>
      ) : null}
      <Display style={{ marginTop: door ? 6 : spacing.sm, fontSize: 28, lineHeight: 34 }}>{title}</Display>
      {subtitle ? (
        <Body style={{ color: colors.muted, marginTop: 10, lineHeight: 22, maxWidth: 340 }}>
          {subtitle}
        </Body>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
