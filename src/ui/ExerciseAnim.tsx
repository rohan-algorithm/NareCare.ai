import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { CATALOG_BY_ID } from '@/src/content/workoutCatalog';

/** Alternates start and peak illustrations so the move reads as motion. */
export function ExerciseAnim({ exId, style, paused }: { exId: string; style?: ViewStyle; paused?: boolean }) {
  const ex = CATALOG_BY_ID[exId];
  const [i, setI] = useState(0);
  const frames = ex?.frames ?? [];
  useEffect(() => {
    if (frames.length < 2 || paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % frames.length), 1000);
    return () => clearInterval(id);
  }, [frames.length, paused]);
  return (
    <View style={[styles.wrap, style]}>
      {frames.map((f, idx) => (
        <Image key={idx} source={f as number} style={[StyleSheet.absoluteFill, { opacity: idx === i % Math.max(1, frames.length) ? 1 : 0 }]} contentFit="contain" transition={200} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#E3F0FB', overflow: 'hidden' },
});
