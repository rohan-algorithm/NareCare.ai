// Deploy: supabase functions deploy delete-account (uses the built-in SUPABASE_SERVICE_ROLE_KEY)
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data, error } = await asUser.auth.getUser(jwt);
  if (error || !data.user) return json({ error: 'unauthorized' }, 401);
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  // All user tables reference auth.users with ON DELETE CASCADE.
  const del = await admin.auth.admin.deleteUser(data.user.id);
  if (del.error) return json({ error: del.error.message }, 500);
  return json({ deleted: true });
});
