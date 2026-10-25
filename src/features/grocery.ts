import { MEALS, NORTH_INDIAN_WEEK, resolveMealForContext } from '@/src/content/meals';
import type { LivingContext } from '@/src/types';

const INGREDIENT_MAP: Record<string, string[]> = {
  moong_cheela: ['Moong dal', 'Pudina', 'Green chilli', 'Jeera'],
  besan_cheela: ['Besan', 'Onion', 'Tomato', 'Coriander'],
  sprout_chaat: ['Mixed sprouts', 'Lemon', 'Cucumber', 'Onion'],
  egg_bhurji: ['Eggs', 'Onion', 'Tomato', 'Multigrain roti'],
  paneer_bhurji: ['Paneer', 'Capsicum', 'Onion', 'Spices'],
  curd_bowl: ['Dahi', 'Roasted chana', 'Cucumber'],
  buttermilk: ['Chaas / buttermilk', 'Jeera', 'Mint'],
  methi_paratha: ['Methi leaves / dried methi', 'Atta (multigrain)', 'Dahi'],
  brown_rice_dal: ['Brown rice', 'Lauki', 'Toor/moong dal', 'Salad greens'],
  millet_khichdi: ['Jowar / millets', 'Moong dal', 'Ghee', 'Jeera'],
  rajma_salad: ['Rajma (cooked)', 'Onion', 'Tomato', 'Lemon'],
  grilled_paneer: ['Paneer', 'Bell peppers', 'Yogurt marinade'],
  veg_pulao_light: ['Rice (half portion)', 'Mixed veg', 'Raita ingredients'],
  palak_soup: ['Palak', 'Garlic', 'Roasted seeds'],
  fish_curry_light: ['Fish', 'Kokum/tamarind', 'Millets'],
  evening_makhana: ['Makhana', 'Spearmint tea'],
};

const PCOS_STAPLES = [
  'Flaxseeds',
  'Cinnamon',
  'Methi seeds',
  'Spearmint / pudina',
  'Turmeric',
  'Ginger',
  'Seasonal leafy greens',
];

export function buildGroceryList(livingContext: LivingContext, days = 7): {
  produce: string[];
  pantry: string[];
  staples: string[];
  tips: string[];
} {
  const set = new Set<string>();
  for (let i = 0; i < Math.min(days, NORTH_INDIAN_WEEK.length); i++) {
    const plan = NORTH_INDIAN_WEEK[i];
    for (const slot of ['breakfast', 'midMorning', 'lunch', 'evening', 'dinner'] as const) {
      const meal = resolveMealForContext(plan[slot], livingContext);
      for (const ing of INGREDIENT_MAP[meal.id] ?? []) set.add(ing);
    }
  }

  const all = [...set];
  const produceKeys = /leaves|pudina|mint|cucumber|onion|tomato|capsicum|pepper|salad|lauki|palak|methi|ginger|lemon|veg|sprout/i;
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
  return Object.keys(MEALS).length;
}
