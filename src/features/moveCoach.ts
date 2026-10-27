import * as Speech from 'expo-speech';

import type { MoveStep } from '@/src/types';

let speaking = false;
let voices: Speech.Voice[] | null = null;

async function loadVoices(): Promise<Speech.Voice[]> {
  if (voices) return voices;
  try {
    voices = await Speech.getAvailableVoicesAsync();
  } catch {
    voices = [];
  }
  return voices;
}

/** Best installed voice for the language; Hindi falls back to Indian English when absent. */
async function pickVoice(lang: 'en' | 'hi'): Promise<{ voice?: string; language: string; useHindi: boolean }> {
  const all = await loadVoices();
  const score = (v: Speech.Voice) =>
    (v.quality === Speech.VoiceQuality.Enhanced ? 2 : 0) + (/network/i.test(v.identifier) ? -1 : 0);
  const best = (prefix: string) =>
    all
      .filter((v) => v.language.toLowerCase().replace('_', '-').startsWith(prefix))
      .sort((a, b) => score(b) - score(a))[0];
  if (lang === 'hi') {
    const hiVoice = best('hi');
    if (hiVoice) return { voice: hiVoice.identifier, language: 'hi-IN', useHindi: true };
  }
  const en = best('en-in') ?? best('en-gb') ?? best('en');
  return { voice: en?.identifier, language: en?.language ?? 'en-IN', useHindi: false };
}

export function stopCoachVoice() {
  try {
    Speech.stop();
  } catch {
    /* ignore */
  }
  speaking = false;
}

function say(text: string, v: { voice?: string; language: string }): Promise<void> {
  speaking = true;
  return new Promise<void>((resolve) => {
    const done = () => {
      speaking = false;
      resolve();
    };
    try {
      Speech.speak(text, { voice: v.voice, language: v.language, rate: 0.9, pitch: 1.0, onDone: done, onStopped: done, onError: done });
    } catch {
      done();
    }
  });
}

/** Short cue: name, count, one form tip. The full coaching line stays on screen. */
export async function speakCoach(move: MoveStep, lang: 'en' | 'hi', opts?: { announceReady?: boolean }) {
  stopCoachVoice();
  const v = await pickVoice(lang);
  if (v.useHindi) {
    const how = move.kind === 'reps' ? `${move.reps} बार` : `${move.seconds} सेकंड`;
    return say(`${opts?.announceReady ? 'अगला: ' : ''}${move.nameHi}. ${how}. ${move.cueHi}`, v);
  }
  const how = move.kind === 'reps' ? `${move.reps} reps` : `${move.seconds} seconds`;
  return say(`${opts?.announceReady ? 'Next: ' : ''}${move.name.replace(/·.*$/, '')}. ${how}. ${move.cue}`, v);
}

export function isCoachSpeaking() {
  return speaking;
}

export async function speakSimple(text: string, lang: 'en' | 'hi', englishFallback?: string) {
  stopCoachVoice();
  const v = await pickVoice(lang);
  return say(v.useHindi || !englishFallback ? text : englishFallback, v);
}
