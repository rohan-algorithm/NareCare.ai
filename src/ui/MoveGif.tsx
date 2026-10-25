import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { colors, fonts, radii } from '@/src/theme/tokens';
import { gifForMove } from '@/src/content/moveGifs';
import type { MoveGifKey, MoveStep } from '@/src/types';

type Props = {
  moveName?: string;
  move?: Pick<MoveStep, 'name' | 'gif'>;
  gif?: MoveGifKey;
  style?: ViewStyle;
  compact?: boolean;
};

export function MoveGif({ moveName, move, gif, style, compact }: Props) {
  const source = move
    ? gifForMove(move)
    : gif
      ? gifForMove({ name: moveName ?? '', gif })
      : gifForMove({ name: moveName ?? 'yoga' });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const label = move?.name ?? moveName ?? 'Move';

  useEffect(() => {
    setLoading(true);
    setFailed(false);
  }, [label, gif, move?.gif]);

  return (
    <View style={[styles.wrap, compact && styles.compact, style]}>
      {failed ? (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>{compact ? 'GIF' : 'Demo'}</Text>
          <Text style={styles.fallbackName} numberOfLines={2}>
            {label}
          </Text>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.coral} />
            </View>
          )}
          <Image
            source={source as number}
            style={styles.img}
            contentFit="contain"
            recyclingKey={label}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#0F1A17',
    borderRadius: radii.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { aspectRatio: 1, borderRadius: radii.md, backgroundColor: '#FFF8F6' },
  img: { width: '100%', height: '100%' },
  loader: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  fallback: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blushSoft,
    padding: 16,
  },
  fallbackTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.blushDeep,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fallbackName: {
    marginTop: 8,
    fontFamily: fonts.displayBold,
    color: colors.ink,
    fontSize: 16,
    textAlign: 'center',
  },
});
