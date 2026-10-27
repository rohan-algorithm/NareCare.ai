import { Linking } from 'react-native';

const YT = 'https://www.youtube.com/results?search_query=';

const POSE_QUERIES: [RegExp, string][] = [
  [/butterfly/i, 'Baddha Konasana butterfly pose'],
  [/child/i, 'Balasana child pose'],
  [/cat-cow|cat cow/i, 'cat cow pose Marjaryasana Bitilasana'],
  [/garland/i, 'Malasana garland pose'],
  [/legs up/i, 'Viparita Karani legs up the wall pose'],
  [/savasana|body scan/i, 'Savasana relaxation'],
  [/bridge/i, 'Setu Bandhasana bridge pose'],
  [/seated twist/i, 'Ardha Matsyendrasana seated twist'],
  [/box breath|breath|calm/i, 'box breathing pranayama'],
  [/wall push/i, 'wall push ups'],
  [/neck roll/i, 'neck rolls stretch'],
  [/shoulder/i, 'shoulder opener stretch'],
  [/march/i, 'march in place low impact'],
  [/high knee/i, 'low impact high knees'],
  [/step|side tap|side knee/i, 'low impact step touch cardio'],
];

function query(name: string): string {
  const hit = POSE_QUERIES.find(([re]) => re.test(name));
  return hit ? hit[1] : name.replace(/·.*$/, '').trim();
}

function open(q: string) {
  return Linking.openURL(`${YT}${encodeURIComponent(q)}`);
}

export function openMoveDemo(name: string, lang: 'en' | 'hi') {
  const base = query(name);
  return open(lang === 'hi' ? `${base} कैसे करें हिंदी` : `${base} tutorial for women beginners`);
}

export function openRoutineVideo(name: string, minutes: number, lang: 'en' | 'hi') {
  const base = `${minutes} minute ${query(name)} PCOS`;
  return open(lang === 'hi' ? `${base} योगा हिंदी` : `${base} for beginners`);
}

export function openRecipeVideo(dish: string, lang: 'en' | 'hi') {
  return open(lang === 'hi' ? `${dish} recipe in hindi` : `${dish} recipe`);
}
