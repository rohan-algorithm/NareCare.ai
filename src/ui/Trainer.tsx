import { memo, useEffect, useMemo, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { MOVE_BY_ID } from '@/src/content/trainerMoves';
import { draw, fitTransform, place, poseAt, rigFit, VIEW_H, VIEW_W, type Rig, type Shape } from '@/src/features/trainerRig';

const FPS = 30;

function render(shapes: Shape[]) {
  return shapes.map((s, i) => {
    switch (s.k) {
      case 'line':
        return <Line key={i} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" />;
      case 'circle':
        return <Circle key={i} cx={s.p.x} cy={s.p.y} r={s.r} fill={s.c} />;
      case 'ellipse':
        return <Ellipse key={i} cx={s.p.x} cy={s.p.y} rx={s.rx} ry={s.ry} fill={s.c} />;
      case 'rect':
        return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} fill={s.c} />;
      case 'path':
        return s.fill ? (
          <Path key={i} d={s.d} fill={s.c} stroke={s.c} strokeWidth={s.w ?? 0} strokeLinejoin="round" />
        ) : (
          <Path key={i} d={s.d} fill="none" stroke={s.c} strokeWidth={s.w ?? 1} strokeLinecap="round" />
        );
    }
  });
}

/** Box around the figure (mat and shadow excluded), so still thumbnails fill their card. */
function tightBox(shapes: Shape[], pad = 8): string {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const grow = (x: number, y: number, r: number) => {
    x0 = Math.min(x0, x - r);
    y0 = Math.min(y0, y - r);
    x1 = Math.max(x1, x + r);
    y1 = Math.max(y1, y + r);
  };
  for (const s of shapes) {
    if (s.k === 'line') {
      grow(s.a.x, s.a.y, s.w / 2);
      grow(s.b.x, s.b.y, s.w / 2);
    } else if (s.k === 'circle') grow(s.p.x, s.p.y, s.r);
  }
  const w = x1 - x0 + pad * 2;
  const h = y1 - y0 + pad * 2;
  // keep thumbnails from zooming in too far on compact poses
  const side = Math.max(w, h, 120);
  return `${x0 - pad - (side - w) / 2} ${y0 - pad - (side - h) / 2} ${side} ${side}`;
}

/**
 * The NariCare trainer demonstrating a move. Animates in a loop unless `still`;
 * `still` shows the move's key position, which is what list thumbnails use.
 */
export const Trainer = memo(function Trainer({
  moveId,
  style,
  paused,
  still,
  speed = 1,
}: {
  moveId: string;
  style?: ViewStyle;
  paused?: boolean;
  still?: boolean;
  speed?: number;
}) {
  const move = MOVE_BY_ID[moveId];
  const rig = useMemo<Rig | null>(
    () => (move ? { view: move.view, anchor: move.anchor, frames: move.frames, mat: move.mat, prop: move.prop } : null),
    [move],
  );
  const fit = useMemo(() => (rig ? rigFit(rig) : null), [rig]);
  const stillU = move && move.frames.length === 2 ? 0.5 : 0.25;
  const [u, setU] = useState(still ? stillU : 0);

  useEffect(() => {
    if (still || paused || !move) return;
    const period = (move.tempo * 1000) / speed;
    let raf = 0;
    let last = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now - u * period;
      if (now - last >= 1000 / FPS) {
        last = now;
        setU(((now - start) % period) / period);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // resuming continues from the current phase, so `u` is read only on (re)start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still, paused, move, speed]);

  if (!rig || !fit) return <View style={style} />;
  const shapes = draw(rig, place(rig, poseAt(rig, still ? stillU : u), fit.dx));
  return (
    <View style={style} accessibilityRole="image" accessibilityLabel={move?.name}>
      {still ? (
        <Svg width="100%" height="100%" viewBox={tightBox(shapes)}>
          {render(shapes)}
        </Svg>
      ) : (
        <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          <G transform={fitTransform(fit)}>{render(shapes)}</G>
        </Svg>
      )}
    </View>
  );
});
