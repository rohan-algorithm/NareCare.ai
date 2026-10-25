import { StyleSheet, Text, TextProps } from 'react-native';

import { colors, fonts } from '@/src/theme/tokens';

function merge(base: object, extra?: TextProps['style']) {
  return StyleSheet.flatten([base, extra]);
}

export function BrandTitle(props: TextProps) {
  return <Text {...props} style={merge(styles.brand, props.style)} />;
}

export function Display(props: TextProps) {
  return <Text {...props} style={merge(styles.display, props.style)} />;
}

export function Headline(props: TextProps) {
  return <Text {...props} style={merge(styles.headline, props.style)} />;
}

export function Title(props: TextProps) {
  return <Text {...props} style={merge(styles.title, props.style)} />;
}

export function Body(props: TextProps) {
  return <Text {...props} style={merge(styles.body, props.style)} />;
}

export function Muted(props: TextProps) {
  return <Text {...props} style={merge(styles.muted, props.style)} />;
}

export function Label(props: TextProps) {
  return <Text {...props} style={merge(styles.label, props.style)} />;
}

const styles = StyleSheet.create({
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    letterSpacing: -1.4,
    color: colors.forest,
  },
  display: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1.1,
    color: colors.ink,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.forest,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: -0.25,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
});
