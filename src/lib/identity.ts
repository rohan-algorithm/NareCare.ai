import * as SecureStore from 'expo-secure-store';

import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

const LOCAL_KEY = 'naricare_uid';

export async function getUserId(): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) return data.session.user.id;
      const { data: anon, error } = await supabase.auth.signInAnonymously();
      if (!error && anon.user) return anon.user.id;
    } catch {
      // offline: fall back to a stable local id
    }
  }
  let id = await SecureStore.getItemAsync(LOCAL_KEY);
  if (!id) {
    id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await SecureStore.setItemAsync(LOCAL_KEY, id);
  }
  return id;
}

export async function callEdge<T>(fn: string, body: unknown, timeoutMs = 30000): Promise<T> {
  if (!isSupabaseConfigured) throw new Error('not-configured');
  await getUserId();
  const { data } = await supabase.auth.getSession();
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/${fn}`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: anon,
        Authorization: `Bearer ${data.session?.access_token ?? anon}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`edge-${fn}-${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
