import { useAppStore } from '@/src/store/useAppStore';

const DAY = 864e5;

/**
 * Asks for a Play Store rating right after a happy moment, following Google's
 * guidance: never from a button, never in the first days, at most every 4 months.
 */
export async function maybeAskForReview(): Promise<void> {
  const s = useAppStore.getState();
  const now = Date.now();
  if (s.firstOpenAt && now - new Date(s.firstOpenAt).getTime() < 3 * DAY) return;
  if (s.reviewAskedAt && now - new Date(s.reviewAskedAt).getTime() < 120 * DAY) return;
  try {
    const StoreReview = await import('expo-store-review');
    if (!(await StoreReview.isAvailableAsync())) return;
    s.markReviewAsked();
    await StoreReview.requestReview();
  } catch {
    // no native module (Expo Go / web) or the store refused: nothing to do
  }
}
