// Deploy: supabase functions deploy plate-scan  (uses ANTHROPIC_API_KEY secret)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ITEM_IDS = 'sabzi, salad, dal, rajma, paneer, egg, meat, curd, sprouts, roti, millet, rice, maida, potato, fried, sweet';

const PROMPT = `You look at a photo of an Indian meal for a woman managing PCOS.
Identify what is on the plate and map it to these ids only: ${ITEM_IDS}.
- dal includes sambar; rajma includes chole/kadhi chana; meat includes chicken, fish, mutton; maida includes naan, bread, pasta, noodles, biscuits; fried includes puri, pakora, samosa, bhature; sweet includes mithai, desserts, sugary drinks.
Return ONLY JSON: {"ids": string[], "dishes": string[], "dishesHi": string[], "isFood": boolean}.
"dishes" is a short English list of what you see (max 5); "dishesHi" the same in Hindi. If the photo is not food, return {"ids": [], "dishes": [], "dishesHi": [], "isFood": false}.`;

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
        model: 'claude-haiku-5-5',
        max_tokens: 300,
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
    if (!match) return json({ ids: [], dishes: [], dishesHi: [], isFood: false });
    const parsed = JSON.parse(match[0]);
    const allowed = new Set(ITEM_IDS.split(', '));
    return json({
      ids: (parsed.ids ?? []).filter((i: string) => allowed.has(i)),
      dishes: (parsed.dishes ?? []).slice(0, 5),
      dishesHi: (parsed.dishesHi ?? []).slice(0, 5),
      isFood: parsed.isFood !== false,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
