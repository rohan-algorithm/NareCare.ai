import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '@/src/theme/tokens';

type Props = {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  trackColor?: string;
  progressColor?: string;
};

export function ProgressRing({
  value,
  size = 92,
  stroke = 9,
  label,
  trackColor = 'rgba(255,255,255,0.16)',
  progressColor = colors.blush,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(clamped)}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.white,
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginTop: -2,
  },
});
