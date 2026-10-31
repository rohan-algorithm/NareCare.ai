import { askCoach } from '@/src/features/aiClient';
import { buildAiContext } from '@/src/features/aiContext';
import { coachMessagesLeft } from '@/src/features/pro';
import { useAppStore } from '@/src/store/useAppStore';

/** Sends a chat message; free users get a few a day, then the Go Pro sheet. */
export async function sendCoachMessage(text: string): Promise<void> {
  const s = useAppStore.getState();
  if (s.chatBusy) return;
  if (coachMessagesLeft() <= 0) {
    s.openPro('coach');
    return;
  }
  const history = s.chat;
  s.appendChat({ id: `u-${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() });
  s.setChatBusy(true);
  s.noteCoachUse();
  try {
    const turn = await askCoach(text, s.profile, history, buildAiContext(useAppStore.getState()));
    useAppStore.getState().appendChat({
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: turn.text,
      actions: turn.actions.length ? turn.actions : undefined,
      createdAt: new Date().toISOString(),
    });
  } finally {
    useAppStore.getState().setChatBusy(false);
  }
}
