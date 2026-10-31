import { coachReply, type ChatMessage } from '@/src/features/aiCoach';
import { localIntents, runTools, type ToolCall } from '@/src/features/agentTools';
import { localLabReply, safetyReply, type AiContext } from '@/src/features/aiContext';
import { callEdge } from '@/src/lib/identity';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import type { UserProfile } from '@/src/types';

export const aiIsLive = isSupabaseConfigured;

const LAB_Q = /lab|report|lh|fsh|insulin|testosterone|tsh|thyroid|vitamin|hba1c|रिपोर्ट|लैब/i;

export type CoachAction = { text: string; href?: string; ok: boolean };
export type CoachTurn = { text: string; actions: CoachAction[] };

type EdgeReply = {
  text?: string;
  toolCalls?: ToolCall[];
  assistant?: unknown[];
};

/**
 * One coach turn. With the backend live this is an agent loop: the model asks
 * for tools, the app runs them on-device and sends the results back, up to a
 * few rounds. Offline, common direct requests still get acted on.
 */
export async function askCoach(
  text: string,
  profile: UserProfile | null,
  history: ChatMessage[],
  ctx: AiContext,
): Promise<CoachTurn> {
  const hi = profile?.language === 'hi';
  const safe = safetyReply(text, hi);
  if (safe) return { text: safe, actions: [] };
  const actions: CoachAction[] = [];

  if (aiIsLive) {
    try {
      const messages = [...history.slice(-10), { role: 'user', text }].map((m) => ({ role: m.role, content: m.text }));
      const who = profile && {
        name: profile.name,
        phenotype: profile.phenotype,
        livingContext: profile.livingContext,
        language: profile.language,
      };
      let pending: { assistant: unknown[]; results: { id: string; content: string; isError: boolean }[] } | null = null;
      for (let round = 0; round < 4; round++) {
        const data: EdgeReply = await callEdge<EdgeReply>('coach', { messages, profile: who, context: ctx, pending });
        if (data.toolCalls?.length && data.assistant) {
          const ran = runTools(data.toolCalls);
          ran.forEach((r) => actions.push({ text: r.label, href: r.out.href, ok: r.out.ok }));
          pending = { assistant: data.assistant, results: ran.map((r) => r.result) };
          continue;
        }
        if (data.text?.trim()) return { text: data.text, actions };
        break;
      }
      if (actions.length) return { text: hi ? 'हो गया।' : 'Done.', actions };
    } catch {
      // fall through to the on-device coach
    }
  }

  await new Promise((r) => setTimeout(r, 500));
  const calls = localIntents(text);
  if (calls.length) {
    const ran = runTools(calls);
    ran.forEach((r) => actions.push({ text: r.label, href: r.out.href, ok: r.out.ok }));
    const okCount = ran.filter((r) => r.out.ok).length;
    return {
      text: okCount ? (hi ? 'हो गया! मैंने आपके लिए यह किया:' : 'Done! Here’s what I changed for you:') : hi ? 'यह मैं अभी नहीं कर पाई।' : 'I couldn’t do that just now.',
      actions,
    };
  }
  if (LAB_Q.test(text)) {
    const lab = localLabReply(ctx, hi);
    if (lab) return { text: lab, actions };
  }
  return { text: coachReply(text, profile), actions };
}
