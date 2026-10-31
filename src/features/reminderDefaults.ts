export type ReminderKey =
  | 'meal_breakfast'
  | 'meal_lunch'
  | 'meal_snack'
  | 'meal_dinner'
  | 'water'
  | 'symptom_log'
  | 'evening_move'
  | 'spearmint'
  | 'sleep_wind_down';

export type ReminderPref = {
  key: ReminderKey;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  hour: number;
  minute: number;
  enabled: boolean;
  /** In-app destination when tapping the schedule row */
  href: string;
  kind: 'meal' | 'water' | 'log' | 'move' | 'ritual' | 'sleep';
  /** meal reminders: which slot of today's plan to name */
  slot?: 'breakfast' | 'midMorning' | 'lunch' | 'evening' | 'dinner';
  /** water reminders repeat every `everyHours` from `hour` until `untilHour` */
  untilHour?: number;
  everyHours?: number;
};

export const DEFAULT_REMINDERS: ReminderPref[] = [
  {
    key: 'meal_breakfast',
    title: 'Breakfast',
    titleHi: 'नाश्ता',
    body: 'Today’s protein breakfast, from your plan.',
    bodyHi: 'आज का प्रोटीन नाश्ता, आपके प्लान से।',
    hour: 8,
    minute: 30,
    enabled: true,
    href: '/diet',
    kind: 'meal',
    slot: 'breakfast',
  },
  {
    key: 'water',
    title: 'Water',
    titleHi: 'पानी',
    body: 'Every 2 hours, with how much is left today.',
    bodyHi: 'हर 2 घंटे, आज कितना बाकी है उसके साथ।',
    hour: 9,
    minute: 30,
    untilHour: 19,
    everyHours: 2,
    enabled: true,
    href: '/home',
    kind: 'water',
  },
  {
    key: 'meal_lunch',
    title: 'Lunch',
    titleHi: 'लंच',
    body: 'Your lunch for today, plate method.',
    bodyHi: 'आज का लंच, प्लेट तरीके से।',
    hour: 13,
    minute: 15,
    enabled: true,
    href: '/diet',
    kind: 'meal',
    slot: 'lunch',
  },
  {
    key: 'symptom_log',
    title: '2-min Track',
    titleHi: '2-मिनट ट्रैक',
    body: 'Log period / symptoms / mood for Progress Pulse.',
    bodyHi: 'पीरियड / लक्षण / मूड लॉग — Progress Pulse के लिए।',
    hour: 14,
    minute: 30,
    enabled: true,
    href: '/track',
    kind: 'log',
  },
  {
    key: 'meal_snack',
    title: 'Evening snack',
    titleHi: 'शाम का स्नैक',
    body: 'A smart snack before the 6 pm craving hits.',
    bodyHi: '6 बजे की क्रेविंग से पहले एक समझदार स्नैक।',
    hour: 16,
    minute: 30,
    enabled: true,
    href: '/diet',
    kind: 'meal',
    slot: 'evening',
  },
  {
    key: 'spearmint',
    title: 'Spearmint chai',
    titleHi: 'स्पीयरमिंट चाय',
    body: 'Androgen-friendly evening ritual. Skip sugar.',
    bodyHi: 'एंड्रोजन-फ्रेंडली शाम की रस्म। चीनी छोड़ें।',
    hour: 17,
    minute: 0,
    enabled: true,
    href: '/meds',
    kind: 'ritual',
  },
  {
    key: 'evening_move',
    title: 'Exercise alarm',
    titleHi: 'एक्सरसाइज़ अलार्म',
    body: 'Time to Move — 10–15 min cycle-synced. Tap Start.',
    bodyHi: 'मूव का समय — 10–15 मिनट साइकल-सिंक। Start दबाएँ।',
    hour: 18,
    minute: 30,
    enabled: true,
    href: '/move?start=1',
    kind: 'move',
  },
  {
    key: 'meal_dinner',
    title: 'Dinner',
    titleHi: 'डिनर',
    body: 'Light, early dinner from your plan.',
    bodyHi: 'हल्का, जल्दी डिनर, आपके प्लान से।',
    hour: 19,
    minute: 45,
    enabled: true,
    href: '/diet',
    kind: 'meal',
    slot: 'dinner',
  },
  {
    key: 'sleep_wind_down',
    title: 'Wind down',
    titleHi: 'आराम की तैयारी',
    body: 'Screens off soon. Hormones love sleep.',
    bodyHi: 'जल्द स्क्रीन बंद। हार्मोन नींद पसंद करते हैं।',
    hour: 22,
    minute: 0,
    enabled: true,
    href: '/flare',
    kind: 'sleep',
  },
];

export function reminderTitle(r: ReminderPref, lang: 'en' | 'hi' = 'en') {
  return lang === 'hi' ? r.titleHi : r.title;
}

export function reminderBody(r: ReminderPref, lang: 'en' | 'hi' = 'en') {
  return lang === 'hi' ? r.bodyHi : r.body;
}

export function formatAlarmTime(hour: number, minute: number) {
  const h12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export function nextUpReminder(prefs: ReminderPref[], now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const enabled = prefs
    .filter((p) => p.enabled)
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  return enabled.find((p) => p.hour * 60 + p.minute >= mins) ?? enabled[0] ?? null;
}
