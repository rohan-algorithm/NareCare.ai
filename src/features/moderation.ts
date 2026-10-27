import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { getUserId } from '@/src/lib/identity';

export type ReportKind = 'post' | 'comment' | 'ai';
export type ReportReason = 'harmful_health' | 'harassment' | 'spam' | 'other';

/** Sends a report to the moderation queue when the backend is configured. */
export async function reportContent(kind: ReportKind, targetId: string, content: string, reason: ReportReason): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await getUserId();
    await supabase.from('content_reports').insert({ kind, target_id: targetId, content: content.slice(0, 4000), reason });
  } catch {
    // reports are best-effort; the item is still hidden locally
  }
}

const PHONE = /(\+?91[\s-]?)?[6-9]\d{9}\b/;
const LINK = /(https?:\/\/|www\.|\.com\b|\.in\b|t\.me\/|wa\.me\/)/i;

/** Blocks contact details and links, the common spam/scam vectors in health communities. */
export function postViolation(text: string): 'phone' | 'link' | null {
  if (PHONE.test(text)) return 'phone';
  if (LINK.test(text)) return 'link';
  return null;
}
