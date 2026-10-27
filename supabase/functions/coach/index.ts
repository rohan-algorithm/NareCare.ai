// Deploy: supabase functions deploy coach && supabase secrets set ANTHROPIC_API_KEY=...
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM = `You are NariCare's AI coach for Indian women with PCOS/PCOD.
- Warm, confident Hinglish/English matching the user's language; short, practical answers (under 160 words).
- Ground advice in Indian food (dal, roti, sabzi, mess thali, tiffin), the user's phenotype (metabolic / androgenic / inflammatory / mixed) and living context.
- Never diagnose, never give medication or supplement dosages. For red flags (cycles > 90 days, severe pain, heavy bleeding, low mood > 2 weeks) tell them to see a doctor.
- Use the user's own data in CONTEXT (cycle day/phase, lab values and status, logs, moves, meal adherence, weekly pulse). Refer to their actual numbers, e.g. "your fasting insulin of 18 is above range".
- If CONTEXT is missing something, say what to log or upload rather than inventing it.
- Never state or imply a diagnosis. Never give doses or say to start/stop/change any medicine.
- Crisis (self-harm): give Tele-MANAS 14416 and 112. Emergencies (very heavy bleeding, fainting, severe pain): tell them to go to a doctor/emergency today.
- End health answers with one line: "Educational only — discuss with your doctor."`;

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { messages = [], profile = null, context = null } = await req.json();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 500,
        system: `${SYSTEM}\nUser profile: ${JSON.stringify(profile)}\nCONTEXT: ${JSON.stringify(context)}`,
        messages: normalize(messages),
      }),
    });
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? '';
    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS, 'content-type': 'application/json' },
      status: text ? 200 : 502,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...CORS, 'content-type': 'application/json' },
      status: 500,
    });
  }
});
