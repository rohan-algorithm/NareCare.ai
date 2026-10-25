import * as Speech from 'expo-speech';

import type { MoveStep } from '@/src/types';

let speaking = false;

export function stopCoachVoice() {
  try {
    Speech.stop();
  } catch {
    /* ignore */
  }
  speaking = false;
}

export async function speakCoach(
  move: MoveStep,
  lang: 'en' | 'hi',
  opts?: { announceReady?: boolean },
) {
  stopCoachVoice();
  const name = lang === 'hi' ? move.nameHi : move.name;
  const coach = lang === 'hi' ? move.coachHi : move.coachEn;
  const ready =
    lang === 'hi'
      ? opts?.announceReady
        ? `तैयार। अगला मूव: ${name}। `
        : ''
      : opts?.announceReady
        ? `Ready. Next: ${name}. `
        : '';
  const how =
    move.kind === 'reps'
      ? lang === 'hi'
        ? `${move.reps} रेप्स। `
        : `${move.reps} reps. `
      : lang === 'hi'
        ? `${move.seconds} सेकंड। `
        : `${move.seconds} seconds. `;

  const text = `${ready}${name}. ${how}${coach}`;
  speaking = true;
  return new Promise<void>((resolve) => {
    try {
      Speech.speak(text, {
        language: lang === 'hi' ? 'hi-IN' : 'en-IN',
        rate: lang === 'hi' ? 0.92 : 0.95,
        pitch: 1.02,
        onDone: () => {
          speaking = false;
          resolve();
        },
        onStopped: () => {
          speaking = false;
          resolve();
        },
        onError: () => {
          speaking = false;
          resolve();
        },
      });
    } catch {
      speaking = false;
      resolve();
    }
  });
}

export function isCoachSpeaking() {
  return speaking;
}

export async function speakSimple(text: string, lang: 'en' | 'hi') {
  stopCoachVoice();
  return new Promise<void>((resolve) => {
    try {
      Speech.speak(text, {
        language: lang === 'hi' ? 'hi-IN' : 'en-IN',
        rate: 0.95,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    } catch {
      resolve();
    }
  });
}
