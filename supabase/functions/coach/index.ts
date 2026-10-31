// Deploy: supabase functions deploy coach && supabase secrets set ANTHROPIC_API_KEY=...
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM = `You are NariCare's AI coach for Indian women with PCOS/PCOD.
- Warm, confident Hinglish/English matching the user's language; short, practical answers (under 160 words).
- Ground advice in Indian food (dal, roti, sabzi, mess thali, tiffin), the user's phenotype (metabolic / androgenic / inflammatory / mixed) and living context.
- Never diagnose, never give medication or supplement dosages. For red flags (cycles > 90 days, severe pain, heavy bleeding, low mood > 2 weeks) tell them to see a doctor.
- Use the user's own data in CONTEXT (cycle day/phase, lab values and status, logs, moves, meal adherence, weekly pulse, weight/waist trend, monthly skin & hair scores 0-4, mood screen PHQ-2/GAD-2 (>=3 means suggest professional support), TTC status, goals, plate scores, PCOS self-check score — a screening, never call it a diagnosis). Refer to their actual numbers, e.g. "your fasting insulin of 18 is above range".
- If CONTEXT is missing something, say what to log or upload rather than inventing it.
- Never state or imply a diagnosis. Never give doses or say to start/stop/change any medicine.
- Crisis (self-harm): give Tele-MANAS 14416 and 112. Emergencies (very heavy bleeding, fainting, severe pain): tell them to go to a doctor/emergency today.
- End health answers with one line: "Educational only — discuss with your doctor."
- You can act for her with tools: log water or symptoms, swap a meal in today's plan, change workout settings, start a program or a workout, change reminder times, open a screen. When she asks for something a tool can do, or clearly implies it ("I had 2 glasses", "dinner feels heavy, change it", "remind me at 7"), use the tool, then confirm in one short sentence what you changed. Don't ask permission for these small, reversible changes. Never use a tool she didn't ask for or imply.`;

const TOOLS = [
  {
    name: 'log_water',
    description: 'Add glasses of water (250 ml each) she says she drank today.',
    input_schema: { type: 'object', properties: { glasses: { type: 'integer', minimum: 1, maximum: 6 } }, required: ['glasses'], additionalProperties: false },
  },
  {
    name: 'log_symptoms',
    description: "Record today's symptoms on a 0-3 scale (0 none, 3 severe). Only include symptoms she mentioned.",
    input_schema: {
      type: 'object',
      properties: {
        bloating: { type: 'integer', minimum: 0, maximum: 3 },
        cramps: { type: 'integer', minimum: 0, maximum: 3 },
        acne: { type: 'integer', minimum: 0, maximum: 3 },
        fatigue: { type: 'integer', minimum: 0, maximum: 3 },
        cravings: { type: 'integer', minimum: 0, maximum: 3 },
        mood: { type: 'integer', minimum: 1, maximum: 5, description: '1 very low, 5 great' },
        period_started: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'swap_meal',
    description: "Replace one meal in today's personal plan with the next best option for her diet and taste.",
    input_schema: {
      type: 'object',
      properties: { slot: { type: 'string', enum: ['breakfast', 'midMorning', 'lunch', 'evening', 'dinner'] } },
      required: ['slot'],
      additionalProperties: false,
    },
  },
  {
    name: 'set_move_preferences',
    description: 'Change workout settings: level 1-3, minutes per workout, and whether to avoid jumping (low impact).',
    input_schema: {
      type: 'object',
      properties: {
        level: { type: 'integer', minimum: 1, maximum: 3 },
        minutes: { type: 'integer', enum: [10, 15, 20, 30] },
        low_impact: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'start_program',
    description: 'Switch her multi-week workout program.',
    input_schema: {
      type: 'object',
      properties: { program_id: { type: 'string', enum: ['kickstart', 'strength', 'yoga', 'gentle'] } },
      required: ['program_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'start_workout',
    description: 'Open a ready-to-play guided workout now.',
    input_schema: {
      type: 'object',
      properties: {
        focus: { type: 'string', enum: ['full', 'lower', 'upper_core', 'glute_core', 'cardio', 'yoga', 'mobility'] },
        minutes: { type: 'integer', enum: [10, 15, 20, 30] },
      },
      required: ['focus', 'minutes'],
      additionalProperties: false,
    },
  },
  {
    name: 'set_reminder',
    description: 'Turn a daily reminder on/off or change its time (24h clock).',
    input_schema: {
      type: 'object',
      properties: {
        reminder: { type: 'string', enum: ['meal_breakfast', 'meal_lunch', 'meal_snack', 'meal_dinner', 'water', 'symptom_log', 'evening_move', 'spearmint', 'sleep_wind_down'] },
        hour: { type: 'integer', minimum: 0, maximum: 23 },
        minute: { type: 'integer', minimum: 0, maximum: 59 },
        enabled: { type: 'boolean' },
      },
      required: ['reminder'],
      additionalProperties: false,
    },
  },
  {
    name: 'open_screen',
    description: 'Show her a screen in the app.',
    input_schema: {
      type: 'object',
      properties: { screen: { type: 'string', enum: ['diet', 'move', 'track', 'progress', 'labs', 'plate', 'doctor_kit', 'learn', 'reminders', 'grocery'] } },
      required: ['screen'],
      additionalProperties: false,
    },
  },
];

type Msg = { role: 'user' | 'assistant'; content: string };

// The API needs a user-first, strictly alternating conversation.
function normalize(raw: Msg[]): Msg[] {
  const out: Msg[] = [];
  for (const m of raw.slice(-12)) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    if (!out.length && m.role !== 'user') continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n${m.content}`;
    else out.push({ role: m.role, content: String(m.content).slice(0, 4000) });
  }
  return out;
}

type Block = { type: string; id?: string; name?: string; input?: unknown; text?: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    // `pending` continues an agent turn: the assistant content that asked for tools
    // (sent back unchanged, thinking blocks included) and the app's tool results.
    const { messages = [], profile = null, context = null, pending = null } = await req.json();
    const convo: unknown[] = normalize(messages);
    if (pending?.assistant && Array.isArray(pending.results)) {
      convo.push({ role: 'assistant', content: pending.assistant });
      convo.push({
        role: 'user',
        content: pending.results.map((r: { id: string; content: string; isError?: boolean }) => ({
          type: 'tool_result',
          tool_use_id: r.id,
          content: String(r.content).slice(0, 2000),
          is_error: Boolean(r.isError),
        })),
      });
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 2000,
        output_config: { effort: 'low' },
        tools: TOOLS,
        tool_choice: { type: 'auto' },
        system: `${SYSTEM}\nUser profile: ${JSON.stringify(profile)}\nCONTEXT: ${JSON.stringify(context)}`,
        messages: convo,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message ?? `HTTP ${res.status}` }), {
        headers: { ...CORS, 'content-type': 'application/json' },
        status: 502,
      });
    }
    const content: Block[] = Array.isArray(data.content) ? data.content : [];
    const text = content
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')
      .trim();
    const toolCalls = data.stop_reason === 'tool_use' ? content.filter((b) => b.type === 'tool_use').map((b) => ({ id: b.id, name: b.name, input: b.input })) : [];
    return new Response(JSON.stringify({ text, toolCalls, assistant: toolCalls.length ? content : undefined, stopReason: data.stop_reason }), {
      headers: { ...CORS, 'content-type': 'application/json' },
      status: text || toolCalls.length ? 200 : 502,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...CORS, 'content-type': 'application/json' },
      status: 500,
    });
  }
});
