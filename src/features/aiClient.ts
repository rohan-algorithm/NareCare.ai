import { coachReply, type ChatMessage } from '@/src/features/aiCoach';
import { localLabReply, safetyReply, type AiContext } from '@/src/features/aiContext';
import { callEdge } from '@/src/lib/identity';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import type { UserProfile } from '@/src/types';

export const aiIsLive = isSupabaseConfigured;

const LAB_Q = /lab|report|lh|fsh|insulin|testosterone|tsh|thyroid|vitamin|hba1c|रिपोर्ट|लैब/i;

export async function askCoach(
  text: string,
  profile: UserProfile | null,
  history: ChatMessage[],
  ctx: AiContext,
): Promise<string> {
  const hi = profile?.language === 'hi';
  const safe = safetyReply(text, hi);
  if (safe) return safe;

  if (aiIsLive) {
    try {
      const data = await callEdge<{ text?: string }>('coach', {
        messages: [...history.slice(-10), { role: 'user', text }].map((m) => ({ role: m.role, content: m.text })),
        profile: profile && {
          name: profile.name,
          phenotype: profile.phenotype,
          livingContext: profile.livingContext,
          language: profile.language,
        },
        context: ctx,
      });
      if (data.text?.trim()) return data.text;
    } catch {
      // fall through to the on-device coach
    }
  }
  await new Promise((r) => setTimeout(r, 500));
  if (LAB_Q.test(text)) {
    const lab = localLabReply(ctx, hi);
    if (lab) return lab;
  }
  return coachReply(text, profile);
}
