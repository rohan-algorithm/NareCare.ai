// Deploy: supabase functions deploy lab-ocr  (uses ANTHROPIC_API_KEY secret)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT = `You read Indian lab reports (SRL, Thyrocare, Dr Lal PathLabs, Metropolis, hospital labs).
Extract only these markers if present, converting to the listed unit:
- lh (mIU/mL), fsh (mIU/mL)
- total_testosterone (ng/dL; if nmol/L multiply by 28.84)
- fasting_insulin (µIU/mL)
- hba1c (%)
- tsh (mIU/L, same as µIU/mL)
- vit_d (25-OH Vitamin D, ng/mL; if nmol/L divide by 2.496)
Return ONLY JSON: {"values": {"<key>": number, ...}, "lab": string|null, "reportDate": "YYYY-MM-DD"|null, "readable": boolean}.
Omit markers you cannot read with confidence. Never guess. If the image is not a lab report, return {"values": {}, "readable": false}.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });
  try {
    const { image, mimeType = 'image/jpeg' } = await req.json();
    if (typeof image !== 'string' || image.length > 8_000_000) return json({ error: 'bad-image' }, 400);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    });
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json({ values: {}, readable: false });
    const parsed = JSON.parse(match[0]);
    const values: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed.values ?? {})) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) values[k] = n;
    }
    return json({ values, lab: parsed.lab ?? null, reportDate: parsed.reportDate ?? null, readable: parsed.readable !== false });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
