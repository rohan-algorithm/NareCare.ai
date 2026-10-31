import { ComponentRef, ReactNode, RefObject } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '@/src/theme/tokens';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  variant?: 'default' | 'immersive' | 'dark';
  scrollRef?: RefObject<ComponentRef<typeof ScrollView> | null>;
};

export function Screen({
  children,
  scroll,
  style,
  edges = ['top', 'left', 'right'],
  variant = 'default',
  scrollRef,
}: Props) {
  const gradient =
    variant === 'dark'
      ? (['#2A1A28', '#2A3D38', '#1A2320'] as const)
      : variant === 'immersive'
        ? (['#FFE4DE', '#FFF8F6', '#F3EDEB'] as const)
        : (['#FFE8E2', '#FFF8F6', '#F5F0EE'] as const);

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.content, style]}
      showsVerticalScrollIndicator={false}
      bounces
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, style]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...gradient]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.blobCoral} />
      <View style={styles.blobMoss} />
      <SafeAreaView style={styles.safe} edges={edges}>
        {body}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 8,
    paddingTop: spacing.sm,
  },
  blobCoral: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -100,
    right: -80,
    borderRadius: 100,
    backgroundColor: 'rgba(255,122,106,0.07)',
  },
  blobMoss: {
    position: 'absolute',
    width: 160,
    height: 160,
    bottom: 160,
    left: -70,
    borderRadius: 80,
    backgroundColor: 'rgba(42,61,56,0.04)',
  },
});
