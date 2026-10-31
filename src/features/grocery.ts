import { localDate, planForDate, prefsFrom, SLOTS, weekDates } from '@/src/features/mealPlan';
import { MEAL_LIBRARY } from '@/src/content/mealLibrary';
import type { UserProfile } from '@/src/types';

const PCOS_STAPLES = [
  'Flaxseeds',
  'Cinnamon',
  'Methi seeds',
  'Spearmint / pudina',
  'Turmeric',
  'Ginger',
  'Seasonal leafy greens',
];

export function buildGroceryList(profile: UserProfile | null, swaps: Record<string, string>, days = 7): {
  produce: string[];
  pantry: string[];
  staples: string[];
  tips: string[];
} {
  const prefs = prefsFrom(profile);
  const livingContext = prefs.context;
  const set = new Set<string>();
  for (const date of weekDates(localDate(), days)) {
    const plan = planForDate(prefs, date, profile?.name ?? 'naricare', swaps);
    for (const slot of SLOTS) for (const ing of plan[slot]?.ingredients ?? []) set.add(ing);
  }

  // "Sprouts" is covered by "Mixed sprouts", "Lauki" by "Zucchini/lauki".
  const all = [...set].filter((x) => ![...set].some((y) => y !== x && y.toLowerCase().includes(x.toLowerCase())));
  const produceKeys =
    /leaves|pudina|mint|cucumber|onion|tomato|capsicum|pepper|salad|lauki|palak|spinach|methi|ginger|garlic|lemon|veg|sprout|bhindi|okra|beans|zucchini|gourd|brinjal|baingan|cabbage|cauliflower|gobi|carrot|beet|peas|mushroom|coriander|fruit|banana|apple|guava|papaya|berries/i;
  const produce = all.filter((i) => produceKeys.test(i)).sort();
  const pantry = all.filter((i) => !produceKeys.test(i)).sort();

  const tips: string[] = [];
  if (livingContext === 'hostel_mess') {
    tips.push('Keep roasted chana + curd cups in room for mess days.');
    tips.push('Ask mess for double sabzi / half rice when you can.');
  } else if (livingContext === 'tiffin') {
    tips.push('Pack cheela/paratha + salad for office dabba mornings.');
  } else if (livingContext === 'eating_out') {
    tips.push('Default order: grilled paneer / dal + salad, skip naan + sugary drinks.');
  } else {
    tips.push('Batch-soak moong + cook millets on Sunday for weekday speed.');
  }

  return { produce, pantry, staples: PCOS_STAPLES, tips };
}

export function mealCount(): number {
  return MEAL_LIBRARY.length;
}
