/**
 * 2D rig for the NariCare trainer: an Indian woman drawn from joint angles.
 * Angles are absolute screen degrees: 0 = right, 90 = down, -90 = up.
 * Side view faces right; front view puts the figure's right side ("n") on screen-right.
 */

export type Pose = {
  /** torso, hip → shoulders */
  t: number;
  /** head, neck → crown (defaults to torso) */
  h?: number;
  /** spine bend in units: + rounds the back, − arches it */
  b?: number;
  /** near (side) / right (front) arm: upper, fore */
  an: [number, number];
  af: [number, number];
  /** legs: thigh, shin, optional foot */
  ln: [number, number, number?];
  lf: [number, number, number?];
};

export type View = 'side' | 'front';
export type Anchor = 'feet' | 'footN' | 'footF' | 'hip' | 'hands' | 'neck' | 'knees';
export type Prop = 'dumbbells' | 'wall';

export type Rig = {
  view: View;
  anchor: Anchor;
  frames: Pose[];
  mat?: boolean;
  prop?: Prop;
};

type P = { x: number; y: number };

export type Joints = {
  hip: P;
  neck: P;
  sh: P;
  head: P;
  ctrl: P;
  perp: P;
  hperp: P;
  hup: P;
  arms: { sh: P; el: P; wr: P }[]; // [near/right, far/left]
  legs: { hp: P; kn: P; an: P; toe: P }[];
};

export const VIEW_W = 240;
export const VIEW_H = 200;
export const GROUND = 186;

const L = { torso: 50, neck: 6, head: 11.5, upper: 27, fore: 25, thigh: 43, shin: 41, foot: 13 };

const f1 = (n: number) => Math.round(n * 100) / 100;
const rad = (d: number) => (d * Math.PI) / 180;
const dir = (d: number): P => ({ x: Math.cos(rad(d)), y: Math.sin(rad(d)) });
const add = (a: P, b: P, k = 1): P => ({ x: a.x + b.x * k, y: a.y + b.y * k });
/** Clockwise quarter turn: "front" of a segment pointing up is screen-right. */
const rot = (v: P): P => ({ x: -v.y, y: v.x });

export function fk(p: Pose, view: View): Joints {
  const hip = { x: 0, y: 0 };
  const up = dir(p.t);
  const perp = rot(up);
  const neck = add(hip, up, L.torso);
  const sh = add(hip, up, L.torso - 5);
  const hupv = dir(p.h ?? p.t);
  const head = add(neck, hupv, L.neck + L.head);
  const mid = add(hip, up, L.torso / 2);
  const ctrl = add(mid, perp, -(p.b ?? 0));

  const shoulderAt = (side: 1 | -1) => (view === 'front' ? add(sh, perp, 12 * side) : sh);
  const hipAt = (side: 1 | -1) => (view === 'front' ? add(hip, perp, 8 * side) : hip);

  const arm = (a: [number, number], side: 1 | -1) => {
    const s = shoulderAt(side);
    const el = add(s, dir(a[0]), L.upper);
    return { sh: s, el, wr: add(el, dir(a[1]), L.fore) };
  };
  const leg = (l: [number, number, number?], side: 1 | -1) => {
    const hp = hipAt(side);
    const kn = add(hp, dir(l[0]), L.thigh);
    const an = add(kn, dir(l[1]), L.shin);
    const footDefault = view === 'front' ? l[1] - 72 * side : l[1] - 90;
    return { hp, kn, an, toe: add(an, dir(l[2] ?? footDefault), L.foot) };
  };

  return {
    hip,
    neck,
    sh,
    head,
    ctrl,
    perp,
    hperp: rot(hupv),
    hup: hupv,
    arms: [arm(p.an, 1), arm(p.af, -1)],
    legs: [leg(p.ln, 1), leg(p.lf, -1)],
  };
}

function shortest(a: number, b: number) {
  return ((((b - a) % 360) + 540) % 360) - 180;
}
const lerpA = (a: number, b: number, k: number) => a + shortest(a, b) * k;

export function lerpPose(a: Pose, b: Pose, k: number): Pose {
  const pair = (x: [number, number], y: [number, number]): [number, number] => [lerpA(x[0], y[0], k), lerpA(x[1], y[1], k)];
  const legp = (x: Pose['ln'], y: Pose['ln']): Pose['ln'] => {
    const fx = x[2] ?? x[1] - 90;
    const fy = y[2] ?? y[1] - 90;
    return [lerpA(x[0], y[0], k), lerpA(x[1], y[1], k), x[2] == null && y[2] == null ? undefined : lerpA(fx, fy, k)];
  };
  return {
    t: lerpA(a.t, b.t, k),
    h: lerpA(a.h ?? a.t, b.h ?? b.t, k),
    b: (a.b ?? 0) + ((b.b ?? 0) - (a.b ?? 0)) * k,
    an: pair(a.an, b.an),
    af: pair(a.af, b.af),
    ln: legp(a.ln, b.ln),
    lf: legp(a.lf, b.lf),
  };
}

function anchorPoint(j: Joints, a: Anchor): P {
  const mid = (u: P, v: P) => ({ x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 });
  switch (a) {
    case 'feet':
      return mid(j.legs[0].an, j.legs[1].an);
    case 'footN':
      return j.legs[0].an;
    case 'footF':
      return j.legs[1].an;
    case 'hands':
      return mid(j.arms[0].wr, j.arms[1].wr);
    case 'neck':
      return j.neck;
    case 'knees':
      return mid(j.legs[0].kn, j.legs[1].kn);
    default:
      return j.hip;
  }
}

function extents(j: Joints): { minX: number; maxX: number; minY: number; maxY: number } {
  const pts: [P, number][] = [
    [j.hip, 13],
    [j.neck, 11],
    [j.head, L.head + 1],
    ...j.arms.flatMap((a): [P, number][] => [[a.el, 4.5], [a.wr, 5]]),
    ...j.legs.flatMap((l): [P, number][] => [[l.kn, 7], [l.an, 5], [l.toe, 3.5]]),
  ];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [p, r] of pts) {
    minX = Math.min(minX, p.x - r);
    maxX = Math.max(maxX, p.x + r);
    minY = Math.min(minY, p.y - r);
    maxY = Math.max(maxY, p.y + r);
  }
  return { minX, maxX, minY, maxY };
}

function translate(j: Joints, dx: number, dy: number): Joints {
  const m = (p: P) => ({ x: p.x + dx, y: p.y + dy });
  return {
    ...j,
    hip: m(j.hip),
    neck: m(j.neck),
    sh: m(j.sh),
    head: m(j.head),
    ctrl: m(j.ctrl),
    arms: j.arms.map((a) => ({ sh: m(a.sh), el: m(a.el), wr: m(a.wr) })),
    legs: j.legs.map((l) => ({ hp: m(l.hp), kn: m(l.kn), an: m(l.an), toe: m(l.toe) })),
  };
}

/** Pose at phase u ∈ [0,1) of a loop through all frames (ping-pong for two). */
export function poseAt(rig: Rig, u: number): Pose {
  const f = rig.frames;
  if (f.length === 1) return f[0];
  const seq = f.length === 2 ? [f[0], f[1]] : f;
  const n = seq.length;
  const x = (((u % 1) + 1) % 1) * n;
  const i = Math.floor(x);
  const k = x - i;
  const e = k * k * (3 - 2 * k);
  return lerpPose(seq[i], seq[(i + 1) % n], e);
}

export type Fit = { dx: number; s: number };

/**
 * Horizontal offset that centres the whole loop, and a scale that keeps
 * raised arms and long floor poses inside the box. Computed once per rig;
 * renderers scale about (VIEW_W / 2, GROUND).
 */
export function rigFit(rig: Rig): Fit {
  const base = anchorPoint(fk(rig.frames[0], rig.view), rig.anchor);
  let minX = Infinity;
  let maxX = -Infinity;
  let tall = 0;
  for (let s = 0; s < 24; s++) {
    const j = fk(poseAt(rig, s / 24), rig.view);
    const a = anchorPoint(j, rig.anchor);
    const e = extents(j);
    minX = Math.min(minX, e.minX + base.x - a.x);
    maxX = Math.max(maxX, e.maxX + base.x - a.x);
    tall = Math.max(tall, e.maxY - e.minY);
  }
  const s = Math.min(1, (GROUND - 8) / tall, (VIEW_W - 20) / (maxX - minX));
  return { dx: VIEW_W / 2 - (minX + maxX) / 2, s };
}

export function fitTransform(f: Fit): string {
  const cx = VIEW_W / 2;
  return `translate(${cx} ${GROUND}) scale(${f1(f.s)}) translate(${-cx} ${-GROUND})`;
}

/** Joints placed in the view box: anchor fixed in x, lowest point on the ground. */
export function place(rig: Rig, pose: Pose, offsetX: number): Joints {
  const base = anchorPoint(fk(rig.frames[0], rig.view), rig.anchor);
  const j = fk(pose, rig.view);
  const a = anchorPoint(j, rig.anchor);
  const e = extents(j);
  return translate(j, base.x - a.x + offsetX, GROUND - e.maxY);
}

// ---------- drawing ----------

export const PALETTE = {
  skin: '#C68863',
  skinFar: '#A66F50',
  hair: '#2A1A1E',
  top: '#E24B5A',
  topFar: '#B83445',
  legs: '#3A2A52',
  legsFar: '#2A1F3D',
  mat: '#F6D5CD',
  matEdge: '#EDB9AD',
  shadow: 'rgba(58,31,43,0.10)',
  bell: '#4B4560',
};

export type Shape =
  | { k: 'line'; a: P; b: P; w: number; c: string }
  | { k: 'circle'; p: P; r: number; c: string }
  | { k: 'path'; d: string; c: string; w?: number; fill?: boolean }
  | { k: 'rect'; x: number; y: number; w: number; h: number; r: number; c: string }
  | { k: 'ellipse'; p: P; rx: number; ry: number; c: string };


/** Flat list of shapes, back to front. Shared by the app and the preview tool. */
export function draw(rig: Rig, j: Joints): Shape[] {
  const out: Shape[] = [];
  const C = PALETTE;
  const xs = [j.hip.x, j.legs[0].an.x, j.legs[1].an.x];
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;

  if (rig.prop === 'wall') {
    const wx = Math.max(j.arms[0].wr.x, j.arms[1].wr.x) + 4;
    out.push({ k: 'rect', x: wx, y: 14, w: 18, h: GROUND - 10, r: 3, c: '#EADCD6' });
  }
  if (rig.mat) out.push({ k: 'rect', x: 12, y: GROUND - 1, w: VIEW_W - 24, h: 7, r: 3.5, c: C.mat });
  out.push({ k: 'ellipse', p: { x: cx, y: GROUND + 2 }, rx: rig.mat ? 70 : 46, ry: 3.5, c: C.shadow });

  const leg = (i: 0 | 1, far: boolean) => {
    const l = j.legs[i];
    const legC = far ? C.legsFar : C.legs;
    const skin = far ? C.skinFar : C.skin;
    out.push({ k: 'line', a: l.an, b: l.toe, w: 7, c: skin });
    out.push({ k: 'line', a: l.kn, b: l.an, w: 11.5, c: legC });
    out.push({ k: 'line', a: l.hp, b: l.kn, w: rig.view === 'front' ? 14 : 15.5, c: legC });
  };
  const arm = (i: 0 | 1, far: boolean) => {
    const a = j.arms[i];
    const skin = far ? C.skinFar : C.skin;
    out.push({ k: 'line', a: a.el, b: a.wr, w: 7.5, c: skin });
    out.push({ k: 'circle', p: a.wr, r: 4.6, c: skin });
    out.push({ k: 'line', a: a.sh, b: a.el, w: 8.5, c: skin });
    out.push({ k: 'circle', p: a.sh, r: 5.5, c: far && rig.view === 'side' ? C.topFar : C.top });
    if (rig.prop === 'dumbbells') {
      if (rig.view === 'front') {
        const fd = { x: a.wr.x - a.el.x, y: a.wr.y - a.el.y };
        const len = Math.hypot(fd.x, fd.y) || 1;
        const pp = { x: -fd.y / len, y: fd.x / len };
        out.push({ k: 'line', a: add(a.wr, pp, -9), b: add(a.wr, pp, 9), w: 3, c: C.bell });
        out.push({ k: 'line', a: add(a.wr, pp, -10), b: add(a.wr, pp, -6), w: 8, c: C.bell });
        out.push({ k: 'line', a: add(a.wr, pp, 6), b: add(a.wr, pp, 10), w: 8, c: C.bell });
      } else {
        out.push({ k: 'circle', p: a.wr, r: 6.5, c: C.bell });
        out.push({ k: 'circle', p: a.wr, r: 2.5, c: '#79728C' });
      }
      out.push({ k: 'circle', p: a.wr, r: 4.2, c: skin });
    }
  };
  const head = () => {
    const back = { x: -j.hperp.x, y: -j.hperp.y };
    out.push({ k: 'line', a: j.neck, b: add(j.head, j.hup, -6), w: 7.5, c: C.skin });
    if (rig.view === 'front') {
      out.push({ k: 'circle', p: add(j.head, j.hup, 11.5), r: 6.5, c: C.hair });
      out.push({ k: 'circle', p: add(j.head, j.hup, 1.5), r: 12.6, c: C.hair });
      out.push({ k: 'circle', p: add(j.head, j.hup, -1.4), r: 10.4, c: C.skin });
      const eye = (s: number) => add(add(j.head, j.hperp, 4 * s), j.hup, -1);
      out.push({ k: 'circle', p: eye(1), r: 1.3, c: C.hair });
      out.push({ k: 'circle', p: eye(-1), r: 1.3, c: C.hair });
    } else {
      out.push({ k: 'circle', p: add(add(j.head, back, 10), j.hup, 4.5), r: 6.3, c: C.hair });
      out.push({ k: 'circle', p: add(add(j.head, back, 2.6), j.hup, 1.4), r: 12.2, c: C.hair });
      out.push({ k: 'circle', p: add(add(j.head, j.hperp, 1.6), j.hup, -1.2), r: 10.2, c: C.skin });
      out.push({ k: 'circle', p: add(add(j.head, j.hperp, 7), j.hup, 0.5), r: 1.3, c: C.hair });
    }
  };
  const torso = () => {
    const up = { x: j.neck.x - j.hip.x, y: j.neck.y - j.hip.y };
    const len = Math.hypot(up.x, up.y) || 1;
    const u = { x: up.x / len, y: up.y / len };
    if (rig.view === 'front') {
      const p = j.perp;
      const at = (k: number, w: number) => add(add(j.hip, u, len * k), p, w);
      const pts = (a: P[]) => `M${a.map((q) => `${f1(q.x)} ${f1(q.y)}`).join(' L')} Z`;
      out.push({ k: 'path', d: pts([at(0.42, 10.5), at(0.42, -10.5), at(-0.06, -14), at(-0.06, 14)]), c: C.legs, w: 6, fill: true });
      out.push({ k: 'path', d: pts([at(0.9, 13), at(0.9, -13), at(0.62, -11), at(0.36, -11.5), at(0.36, 11.5), at(0.62, 11)]), c: C.top, w: 7, fill: true });
    } else {
      const d = `M${f1(j.hip.x)} ${f1(j.hip.y)} Q${f1(j.ctrl.x)} ${f1(j.ctrl.y)} ${f1(j.neck.x)} ${f1(j.neck.y)}`;
      out.push({ k: 'path', d, c: C.top, w: 24 });
      const bust = add(add(j.hip, u, len * 0.7), j.perp, 8);
      out.push({ k: 'circle', p: bust, r: 7.2, c: C.top });
      out.push({ k: 'circle', p: add(j.hip, u, 3), r: 12.4, c: C.legs });
    }
  };

  if (rig.view === 'front') {
    leg(1, true);
    leg(0, false);
    torso();
    head();
    arm(1, true);
    arm(0, false);
  } else {
    arm(1, true);
    leg(1, true);
    torso();
    leg(0, false);
    head();
    arm(0, false);
  }
  return out;
}

export function shapesToSvg(shapes: Shape[]): string {
  return shapes
    .map((s) => {
      switch (s.k) {
        case 'line':
          return `<line x1="${f1(s.a.x)}" y1="${f1(s.a.y)}" x2="${f1(s.b.x)}" y2="${f1(s.b.y)}" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"/>`;
        case 'circle':
          return `<circle cx="${f1(s.p.x)}" cy="${f1(s.p.y)}" r="${s.r}" fill="${s.c}"/>`;
        case 'ellipse':
          return `<ellipse cx="${f1(s.p.x)}" cy="${f1(s.p.y)}" rx="${s.rx}" ry="${s.ry}" fill="${s.c}"/>`;
        case 'rect':
          return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r}" fill="${s.c}"/>`;
        case 'path':
          return s.fill
            ? `<path d="${s.d}" fill="${s.c}" stroke="${s.c}" stroke-width="${s.w ?? 0}" stroke-linejoin="round"/>`
            : `<path d="${s.d}" fill="none" stroke="${s.c}" stroke-width="${s.w ?? 1}" stroke-linecap="round"/>`;
      }
    })
    .join('');
}
