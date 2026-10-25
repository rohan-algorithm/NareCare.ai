import type { ImageSourcePropType } from 'react-native';

import type { MoveGifKey, MoveStep } from '@/src/types';

/**
 * Female-character exercise demos (IconScout Digital License + Lottie Simple License).
 * See assets/gifs/girl/SOURCES.md for attribution. Bundled for offline playback.
 */
export const MOVE_GIFS: Record<MoveGifKey, ImageSourcePropType> = {
  high_knees: require('../../assets/gifs/girl/high_knees.gif'),
  squat: require('../../assets/gifs/girl/squat.gif'),
  jump: require('../../assets/gifs/girl/jump.gif'),
  situp: require('../../assets/gifs/girl/situp.gif'),
  pushup: require('../../assets/gifs/girl/pushup.gif'),
  walk: require('../../assets/gifs/girl/walk.gif'),
  stretch: require('../../assets/gifs/girl/stretch.gif'),
  strength: require('../../assets/gifs/girl/strength.gif'),
  core: require('../../assets/gifs/girl/core.gif'),
  side: require('../../assets/gifs/girl/side.gif'),
  warmup: require('../../assets/gifs/girl/warmup.gif'),
  cardio: require('../../assets/gifs/girl/cardio.gif'),
  yoga: require('../../assets/gifs/girl/yoga.gif'),
  yoga_sit: require('../../assets/gifs/girl/yoga_sit.gif'),
  breathing: require('../../assets/gifs/girl/breathing.gif'),
  deep_breath: require('../../assets/gifs/girl/deep_breath.gif'),
  meditation: require('../../assets/gifs/girl/meditation.gif'),
  arms: require('../../assets/gifs/girl/arms.gif'),
};

export function gifSource(key: MoveGifKey): ImageSourcePropType {
  return MOVE_GIFS[key] ?? MOVE_GIFS.yoga;
}

/** Prefer explicit gif on the move; fall back by name keywords. */
export function gifForMove(move: Pick<MoveStep, 'name' | 'gif'> | { name: string; gif?: MoveGifKey }): ImageSourcePropType {
  if (move.gif) return gifSource(move.gif);
  return gifForMoveName(move.name);
}

export function gifForMoveName(name: string): ImageSourcePropType {
  const n = name.toLowerCase();
  if (/high.?knee/.test(n)) return MOVE_GIFS.high_knees;
  if (/squat|garland/.test(n)) return MOVE_GIFS.squat;
  if (/jack|jump|step.?jack|step-touch|step touch/.test(n)) return MOVE_GIFS.jump;
  if (/leg.?raise|sit.?up|crunch|knee.?touch|side.?knee|bridge|glute/.test(n)) return MOVE_GIFS.situp;
  if (/push.?up|wall push/.test(n)) return MOVE_GIFS.pushup;
  if (/walk|stroll|jog|brisk|cool.?down|easy stroll/.test(n)) return MOVE_GIFS.walk;
  if (/skier|side.?tap|side /.test(n)) return MOVE_GIFS.side;
  if (/march|warm.?up|neck|shoulder|desk|seated/.test(n)) return MOVE_GIFS.warmup;
  if (/cardio|rope|hiit/.test(n)) return MOVE_GIFS.cardio;
  if (/box.?breath|breath|settle/.test(n)) return MOVE_GIFS.breathing;
  if (/scan|deep.?breath/.test(n)) return MOVE_GIFS.deep_breath;
  if (/savasana|meditat|mindful|calm/.test(n)) return MOVE_GIFS.meditation;
  if (/butterfly|supta|reclined|child|yoga|legs.?up|pose|asan/.test(n)) return MOVE_GIFS.yoga_sit;
  if (/stretch|twist|hamstring|cat/.test(n)) return MOVE_GIFS.stretch;
  if (/strength|circuit|squat/.test(n)) return MOVE_GIFS.strength;
  if (/arm|shoulder opener/.test(n)) return MOVE_GIFS.arms;
  if (/core|belly/.test(n)) return MOVE_GIFS.core;
  return MOVE_GIFS.yoga;
}
