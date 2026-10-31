import * as Localization from 'expo-localization';

import { useAppStore } from '@/src/store/useAppStore';

/** Her language before and after signup: profile, then the welcome-screen pick, then the phone. */
export function useLang(): 'en' | 'hi' {
  const profileLang = useAppStore((s) => s.profile?.language);
  const draftLang = useAppStore((s) => s.setupDraft.language);
  return profileLang ?? draftLang ?? ((Localization.getLocales()[0]?.languageCode ?? 'en') === 'hi' ? 'hi' : 'en');
}
