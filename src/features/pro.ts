import { localDate } from '@/src/features/mealPlan';
import { isSubscriptionActive, useAppStore, type ProReason } from '@/src/store/useAppStore';

/** What a free user gets before the Go Pro sheet. */
export const FREE = {
  exercisesPerWorkout: 3,
  coachMessagesPerDay: 3,
  lessons: 3,
  plateScans: 1,
  dietDays: 1,
} as const;

export function useIsPro(): boolean {
  return useAppStore((s) => isSubscriptionActive(s.subscription));
}

export function isPro(): boolean {
  return isSubscriptionActive(useAppStore.getState().subscription);
}

/** Runs `fn` for Pro users; otherwise opens the Go Pro sheet. */
export function requirePro(reason: ProReason, fn?: () => void): boolean {
  if (isPro()) {
    fn?.();
    return true;
  }
  useAppStore.getState().openPro(reason);
  return false;
}

export function coachMessagesLeft(): number {
  const s = useAppStore.getState();
  if (isSubscriptionActive(s.subscription)) return Infinity;
  const used = s.coachUsage.date === localDate() ? s.coachUsage.count : 0;
  return Math.max(0, FREE.coachMessagesPerDay - used);
}

export const PRO_HEADLINE: Record<ProReason, { en: [string, string]; hi: [string, string] }> = {
  workout: {
    en: ['You did your 3 free exercises 🎉', 'Finish this workout, and every workout, with Pro.'],
    hi: ['आपने 3 फ्री एक्सरसाइज़ पूरी कीं 🎉', 'पूरा वर्कआउट और हर प्रोग्राम Pro में।'],
  },
  program: {
    en: ['Unlock every program', 'Kickstart, Strength, Yoga and Knee-friendly plans that adapt to you.'],
    hi: ['सारे प्रोग्राम अनलॉक करें', 'किकस्टार्ट, स्ट्रेंथ, योग और घुटनों के लिए आसान प्लान।'],
  },
  coach: {
    en: ['Today’s 3 free AI chats are used', 'Pro gives you an AI coach that also acts for you, all day.'],
    hi: ['आज की 3 फ्री AI बातचीत हो गई', 'Pro में AI कोच पूरे दिन, जो आपके लिए काम भी करता है।'],
  },
  lesson: {
    en: ['Unlock all 24 Academy lessons', 'The full 8-week PCOS course, in Hindi and English.'],
    hi: ['सभी 24 अकादमी पाठ अनलॉक करें', 'पूरा 8-हफ्ते का PCOS कोर्स, हिंदी और अंग्रेज़ी में।'],
  },
  plate: {
    en: ['Scan every meal', 'Unlimited PCOS scores for any plate, with better swaps.'],
    hi: ['हर खाना स्कैन करें', 'किसी भी थाली का PCOS स्कोर, बेहतर विकल्पों के साथ।'],
  },
  diet: {
    en: ['Plan your whole week', 'A 7-day menu for your taste, with swaps and a grocery list.'],
    hi: ['पूरे हफ्ते का प्लान', 'आपके स्वाद का 7-दिन मेन्यू, बदलाव और राशन सूची के साथ।'],
  },
  doctor_kit: {
    en: ['Walk into your doctor visit prepared', 'A clean PDF of your cycles, symptoms and labs.'],
    hi: ['डॉक्टर के पास तैयार होकर जाएँ', 'आपके पीरियड, लक्षण और लैब की साफ़ PDF।'],
  },
  generic: {
    en: ['Unlock everything', 'One plan for periods, weight, skin and mood.'],
    hi: ['सब कुछ अनलॉक करें', 'पीरियड, वज़न, त्वचा और मूड के लिए एक प्लान।'],
  },
};
