import type { IconName } from '@/src/ui/Icon';

export type PlateItem = {
  id: string;
  en: string;
  hi: string;
  icon: IconName;
  kind: 'veg' | 'protein' | 'whole' | 'refined' | 'fried' | 'sweet' | 'starchy';
};

export const PLATE_ITEMS: PlateItem[] = [
  { id: 'sabzi', en: 'Sabzi', hi: 'सब्ज़ी', icon: 'leaf', kind: 'veg' },
  { id: 'salad', en: 'Salad / raw veg', hi: 'सलाद', icon: 'nutrition', kind: 'veg' },
  { id: 'dal', en: 'Dal / sambar', hi: 'दाल / सांभर', icon: 'water', kind: 'protein' },
  { id: 'rajma', en: 'Rajma / chole', hi: 'राजमा / छोले', icon: 'ellipse', kind: 'protein' },
  { id: 'paneer', en: 'Paneer / tofu', hi: 'पनीर / टोफू', icon: 'cube', kind: 'protein' },
  { id: 'egg', en: 'Eggs', hi: 'अंडे', icon: 'egg', kind: 'protein' },
  { id: 'meat', en: 'Chicken / fish', hi: 'चिकन / मछली', icon: 'fish', kind: 'protein' },
  { id: 'curd', en: 'Curd / raita', hi: 'दही / रायता', icon: 'cafe', kind: 'protein' },
  { id: 'sprouts', en: 'Sprouts', hi: 'अंकुरित', icon: 'flower', kind: 'protein' },
  { id: 'roti', en: 'Roti (atta)', hi: 'रोटी', icon: 'disc', kind: 'whole' },
  { id: 'millet', en: 'Millet roti / brown rice', hi: 'मिलेट रोटी / ब्राउन राइस', icon: 'disc-outline', kind: 'whole' },
  { id: 'rice', en: 'White rice', hi: 'सफ़ेद चावल', icon: 'restaurant', kind: 'refined' },
  { id: 'maida', en: 'Naan / bread / pasta', hi: 'नान / ब्रेड / पास्ता', icon: 'pizza', kind: 'refined' },
  { id: 'potato', en: 'Potato-heavy', hi: 'आलू ज़्यादा', icon: 'egg-outline', kind: 'starchy' },
  { id: 'fried', en: 'Fried (puri, pakora, samosa)', hi: 'तला (पूरी, पकौड़ा, समोसा)', icon: 'flame', kind: 'fried' },
  { id: 'sweet', en: 'Sweet / sugary drink', hi: 'मीठा / शुगर ड्रिंक', icon: 'ice-cream', kind: 'sweet' },
];

export type PlateResult = {
  score: number;
  good: { en: string; hi: string }[];
  fix: { en: string; hi: string } | null;
};

export function scorePlate(ids: string[]): PlateResult {
  const items = PLATE_ITEMS.filter((p) => ids.includes(p.id));
  const count = (k: PlateItem['kind']) => items.filter((i) => i.kind === k).length;
  const veg = count('veg');
  const protein = count('protein');
  const whole = count('whole');
  const refined = count('refined');
  const fried = count('fried');
  const sweet = count('sweet');
  const starchy = count('starchy');

  let score = 4;
  if (veg) score += 2;
  if (veg >= 2) score += 1;
  if (protein) score += 2;
  if (protein >= 2) score += 1;
  if (whole && !refined) score += 1;
  if (refined) score -= veg ? 1 : 2;
  if (fried) score -= 2;
  if (sweet) score -= 2;
  if (starchy) score -= 1;
  score = Math.max(1, Math.min(10, score));

  const good: PlateResult['good'] = [];
  if (veg) good.push({ en: 'Veg for fibre', hi: 'फाइबर के लिए सब्ज़ी' });
  if (protein) good.push({ en: 'Protein to steady sugar', hi: 'शुगर स्थिर रखने को प्रोटीन' });
  if (whole && !refined) good.push({ en: 'Whole grains', hi: 'साबुत अनाज' });

  let fix: PlateResult['fix'] = null;
  if (!veg) fix = { en: 'Add a bowl of sabzi or salad, and eat it first.', hi: 'एक कटोरी सब्ज़ी या सलाद जोड़ें, और पहले वही खाएँ।' };
  else if (!protein) fix = { en: 'Add protein: dal, curd, paneer, eggs or sprouts.', hi: 'प्रोटीन जोड़ें: दाल, दही, पनीर, अंडे या अंकुरित।' };
  else if (fried) fix = { en: 'Swap the fried item for roasted, tandoori or a tawa version.', hi: 'तले की जगह भुना, तंदूरी या तवा वाला लें।' };
  else if (sweet) fix = { en: 'Keep the sweet small and have it right after the meal, not alone.', hi: 'मीठा थोड़ा लें और खाने के तुरंत बाद, अकेले नहीं।' };
  else if (refined) fix = { en: 'Make it half rice or 1 naan, with extra dal and sabzi.', hi: 'आधा चावल या 1 नान, साथ में ज़्यादा दाल-सब्ज़ी।' };
  else if (starchy) fix = { en: 'Pair the aloo with dal or curd and a salad.', hi: 'आलू के साथ दाल या दही और सलाद लें।' };

  return { score, good, fix };
}
