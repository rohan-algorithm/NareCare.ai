import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/src/theme/tokens';

type Props = {
  points: { label: string; value: number }[];
  target?: number;
  targetLabel?: string;
  color?: string;
  height?: number;
  unit?: string;
  emptyText: string;
};

export function LineChart({ points, target, targetLabel, color = colors.blushDeep, height = 170, unit = '', emptyText }: Props) {
  const [width, setWidth] = useState(0);
  if (points.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }
  const pad = { l: 8, r: 8, t: 16, b: 22 };
  const values = points.map((p) => p.value).concat(target != null ? [target] : []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = Math.max(1, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / (points.length - 1)) * innerW;
  const y = (v: number) => pad.t + (1 - (v - min) / span) * innerH;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {target != null && (
            <>
              <Line x1={pad.l} x2={width - pad.r} y1={y(target)} y2={y(target)} stroke={colors.good} strokeDasharray="6 5" strokeWidth={1.5} />
              <SvgText x={width - pad.r} y={y(target) - 5} fontSize={10} fill={colors.good} textAnchor="end">
                {targetLabel ?? ''} {target}
                {unit}
              </SvgText>
            </>
          )}
          <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <Circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? color : '#fff'} stroke={color} strokeWidth={2} />
          ))}
          <SvgText x={pad.l} y={height - 6} fontSize={10} fill={colors.muted}>
            {points[0].label}
          </SvgText>
          <SvgText x={width - pad.r} y={height - 6} fontSize={10} fill={colors.muted} textAnchor="end">
            {last.label}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.mist, paddingHorizontal: 20 },
  emptyText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, textAlign: 'center' },
});
