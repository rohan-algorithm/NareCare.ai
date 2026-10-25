export type ReminderKey =
  | 'morning_protein'
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
};

export const DEFAULT_REMINDERS: ReminderPref[] = [
  {
    key: 'morning_protein',
    title: 'Protein breakfast',
    titleHi: 'प्रोटीन नाश्ता',
    body: 'Start with eggs / paneer / dahi before carbs.',
    bodyHi: 'कार्ब से पहले अंडे / पनीर / दही।',
    hour: 8,
    minute: 0,
    enabled: true,
    href: '/diet',
    kind: 'meal',
  },
  {
    key: 'water',
    title: 'Water check',
    titleHi: 'पानी चेक',
    body: '2 glasses now — insulin loves hydration.',
    bodyHi: 'अभी 2 गिलास — इंसुलिन हाइड्रेशन पसंद करता है।',
    hour: 11,
    minute: 0,
    enabled: true,
    href: '/home',
    kind: 'water',
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
