import { PROGRAM_BY_ID } from '@/src/content/programs';
import type { Slot } from '@/src/content/mealLibrary';
import { localDate, nextSwap, planForDate, prefsFrom } from '@/src/features/mealPlan';
import { FOCUS_TITLE, type Focus } from '@/src/features/workoutEngine';
import { formatAlarmTime } from '@/src/features/reminderDefaults';
import { useAppStore } from '@/src/store/useAppStore';

export type ToolCall = { id: string; name: string; input: Record<string, unknown> };
export type ToolOutcome = { ok: boolean; text: string; textHi: string; href?: string };

const SLOT_NAME: Record<Slot, [string, string]> = {
  breakfast: ['breakfast', 'नाश्ता'],
  midMorning: ['mid-morning snack', 'सुबह का स्नैक'],
  lunch: ['lunch', 'लंच'],
  evening: ['evening snack', 'शाम का स्नैक'],
  dinner: ['dinner', 'डिनर'],
};

const SCREENS: Record<string, string> = {
  diet: '/diet',
  move: '/move',
  track: '/track',
  progress: '/progress',
  labs: '/labs',
  plate: '/plate',
  doctor_kit: '/doctor-kit',
  learn: '/learn',
  reminders: '/reminders',
  grocery: '/grocery',
};

const int = (v: unknown, lo: number, hi: number): number | undefined => {
  const n = typeof v === 'number' ? Math.round(v) : typeof v === 'string' ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : undefined;
};

/** Runs one coach tool on-device. Inputs come from the model, so every field is re-validated here. */
export function runTool(name: string, input: Record<string, unknown>): ToolOutcome {
  const s = useAppStore.getState();
  const today = localDate();
  switch (name) {
    case 'log_water': {
      const g = int(input.glasses, 1, 6) ?? 1;
      s.addWater(g);
      const now = useAppStore.getState().waterGlasses;
      return { ok: true, text: `Logged ${g} glass${g > 1 ? 'es' : ''} of water (${now} today)`, textHi: `${g} गिलास पानी जोड़ा (आज ${now})` };
    }
    case 'log_symptoms': {
      const prev = s.symptomLogs.find((l) => l.logDate === today);
      const symptoms = { ...(prev?.symptoms ?? {}) };
      for (const k of ['bloating', 'cramps', 'acne', 'fatigue', 'cravings']) {
        const v = int(input[k], 0, 3);
        if (v !== undefined) symptoms[k] = v;
      }
      const mood = int(input.mood, 1, 5) ?? prev?.mood ?? 3;
      const started = input.period_started === true;
      s.upsertSymptomLog({
        ...(prev ?? {}),
        logDate: today,
        periodStatus: started ? 'started' : (prev?.periodStatus ?? 'none'),
        symptoms,
        mood,
      });
      return { ok: true, text: 'Saved today’s log', textHi: 'आज का लॉग सेव किया', href: '/track' };
    }
    case 'swap_meal': {
      const slot = input.slot as Slot;
      if (!SLOT_NAME[slot]) return { ok: false, text: 'Unknown meal', textHi: 'अज्ञात खाना' };
      const prefs = prefsFrom(s.profile);
      const plan = planForDate(prefs, today, s.profile?.name ?? 'naricare', s.mealSwaps);
      const used = Object.values(plan).flatMap((m) => (m ? [m.id] : []));
      const next = nextSwap(slot, prefs, plan[slot]?.id, used);
      if (!next) return { ok: false, text: 'No other option fits your diet for that meal', textHi: 'इस खाने के लिए और विकल्प नहीं' };
      s.swapMeal(today, slot, next.id);
      return {
        ok: true,
        text: `Swapped ${SLOT_NAME[slot][0]} to ${next.name}`,
        textHi: `${SLOT_NAME[slot][1]} बदलकर ${next.nameHi}`,
        href: '/diet',
      };
    }
    case 'set_move_preferences': {
      const patch: Partial<typeof s.moveSettings> = {};
      const level = int(input.level, 1, 3);
      if (level) patch.level = level as 1 | 2 | 3;
      const min = int(input.minutes, 10, 30);
      if (min) patch.minutes = [10, 15, 20, 30].reduce((a, b) => (Math.abs(b - min) < Math.abs(a - min) ? b : a));
      if (typeof input.low_impact === 'boolean') patch.lowImpact = input.low_impact;
      if (!Object.keys(patch).length) return { ok: false, text: 'Nothing to change', textHi: 'कुछ बदलना नहीं' };
      s.setMoveSettings(patch);
      const m = { ...s.moveSettings, ...patch };
      return {
        ok: true,
        text: `Workouts set to level ${m.level}, ${m.minutes} min${m.lowImpact ? ', no jumping' : ''}`,
        textHi: `वर्कआउट: लेवल ${m.level}, ${m.minutes} मिनट${m.lowImpact ? ', बिना कूदे' : ''}`,
        href: '/move',
      };
    }
    case 'start_program': {
      const p = PROGRAM_BY_ID[String(input.program_id)];
      if (!p) return { ok: false, text: 'Unknown program', textHi: 'अज्ञात प्रोग्राम' };
      s.startProgram(p.id);
      return { ok: true, text: `Started ${p.title.en}`, textHi: `${p.title.hi} शुरू किया`, href: '/move' };
    }
    case 'start_workout': {
      const focus = (Object.keys(FOCUS_TITLE).includes(String(input.focus)) ? input.focus : 'full') as Focus;
      const min = int(input.minutes, 10, 30) ?? 15;
      const q = new URLSearchParams({ focus, min: String(min), seed: `${today}|coach`, week: '1', low: s.moveSettings.lowImpact ? '1' : '0' });
      return {
        ok: true,
        text: `${FOCUS_TITLE[focus].en} · ${min} min is ready`,
        textHi: `${FOCUS_TITLE[focus].hi} · ${min} मिनट तैयार`,
        href: `/workout?${q.toString()}`,
      };
    }
    case 'set_reminder': {
      const key = String(input.reminder);
      const r = s.reminders.find((x) => x.key === key);
      if (!r) return { ok: false, text: 'Unknown reminder', textHi: 'अज्ञात रिमाइंडर' };
      const hour = int(input.hour, 0, 23) ?? r.hour;
      const minute = int(input.minute, 0, 59) ?? (input.hour !== undefined ? 0 : r.minute);
      const enabled = typeof input.enabled === 'boolean' ? input.enabled : true;
      s.setReminders(s.reminders.map((x) => (x.key === key ? { ...x, hour, minute, enabled } : x)));
      if (!s.alarmsArmed) s.setAlarmsArmed(true);
      return enabled
        ? { ok: true, text: `${r.title} reminder at ${formatAlarmTime(hour, minute)}`, textHi: `${r.titleHi} रिमाइंडर ${formatAlarmTime(hour, minute)} पर`, href: '/reminders' }
        : { ok: true, text: `${r.title} reminder off`, textHi: `${r.titleHi} रिमाइंडर बंद`, href: '/reminders' };
    }
    case 'open_screen': {
      const href = SCREENS[String(input.screen)];
      if (!href) return { ok: false, text: 'Unknown screen', textHi: 'अज्ञात स्क्रीन' };
      return { ok: true, text: 'Opening it for you', textHi: 'खोल रही हूँ', href };
    }
    default:
      return { ok: false, text: `Unknown tool ${name}`, textHi: 'अज्ञात काम' };
  }
}

/** Runs the calls, records them in the agent log, and returns results for the model. */
export function runTools(calls: ToolCall[]) {
  const hi = useAppStore.getState().profile?.language === 'hi';
  return calls.map((c) => {
    let out: ToolOutcome;
    try {
      out = runTool(c.name, c.input ?? {});
    } catch (e: any) {
      out = { ok: false, text: e?.message ?? 'Failed', textHi: 'नहीं हो पाया' };
    }
    if (out.ok && c.name !== 'open_screen' && c.name !== 'start_workout') {
      useAppStore.getState().logAgent({ text: out.text, textHi: out.textHi, href: out.href });
    }
    return { id: c.id, out, result: { id: c.id, content: out.text, isError: !out.ok }, label: hi ? out.textHi : out.text };
  });
}

/**
 * On-device stand-in for the model's tool choice when the AI backend isn't
 * reachable: catches the most common direct requests.
 */
export function localIntents(text: string): ToolCall[] {
  const t = text.toLowerCase();
  const calls: ToolCall[] = [];
  const id = () => `local-${calls.length}`;
  const water = t.match(/(\d+)\s*(glass|glasses|gilas|गिलास)/);
  if (water && /(drank|had|pi|piya|पी|पिया|log|add)/.test(t)) calls.push({ id: id(), name: 'log_water', input: { glasses: Number(water[1]) } });
  const slot = (['breakfast', 'lunch', 'dinner'] as const).find((x) => t.includes(x)) ?? (t.includes('snack') ? 'evening' : t.includes('नाश्ता') ? 'breakfast' : t.includes('डिनर') ? 'dinner' : null);
  if (slot && /(swap|change|replace|badal|बदल|don.?t like|heavy|bored)/.test(t)) calls.push({ id: id(), name: 'swap_meal', input: { slot } });
  if (/(no jump|knee|घुटन)/.test(t) && /(workout|exercise|move|वर्कआउट)/.test(t)) calls.push({ id: id(), name: 'set_move_preferences', input: { low_impact: true } });
  const shortWorkout = t.match(/(\d{2})\s*(min|minute|मिनट)/);
  if (/(start|let'?s|chalo|शुरू)/.test(t) && /(workout|yoga|exercise|योग|वर्कआउट)/.test(t)) {
    calls.push({ id: id(), name: 'start_workout', input: { focus: /yoga|योग/.test(t) ? 'yoga' : 'full', minutes: shortWorkout ? Number(shortWorkout[1]) : 15 } });
  }
  return calls;
}
