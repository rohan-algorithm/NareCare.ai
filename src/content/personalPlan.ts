import type { LivingContext, Phenotype, UserProfile } from '@/src/types';

/** Clear “what this app solves for YOU” copy — personalized dashboard spine. */
export function personalPromise(profile: UserProfile | null, lang: 'en' | 'hi') {
  const name = profile?.name ?? (lang === 'hi' ? 'दोस्त' : 'Friend');
  const ph = profile?.phenotype ?? 'mixed';
  const ctx = profile?.livingContext ?? 'family_kitchen';
  const hi = lang === 'hi';

  const problem: Record<Phenotype, { en: string; hi: string }> = {
    metabolic: {
      en: 'cravings, energy crashes, and weight that won’t budge',
      hi: 'क्रेविंग, ऊर्जा क्रैश, और वजन जो नहीं घटता',
    },
    androgenic: {
      en: 'acne, hair fall, and hormone-driven skin/hair stress',
      hi: 'मुंहासे, बाल झड़ना, और हार्मोन वाला स्किन/हेयर तनाव',
    },
    inflammatory: {
      en: 'bloating, mood swings, and inflammation flare days',
      hi: 'सूजन, मूड स्विंग, और फ्लेयर वाले दिन',
    },
    mixed: {
      en: 'irregular cycles, mixed symptoms, and plans that don’t stick',
      hi: 'अनियमित साइकल, मिले-जुले लक्षण, और प्लान जो टिकते नहीं',
    },
  };

  const place: Record<LivingContext, { en: string; hi: string }> = {
    family_kitchen: { en: 'your family kitchen', hi: 'आपकी घर की रसोई' },
    hostel_mess: { en: 'hostel / mess food', hi: 'हॉस्टल / मेस खाना' },
    tiffin: { en: 'tiffin / dabba life', hi: 'टिफ़िन / डिब्बे की ज़िंदगी' },
    eating_out: { en: 'eating out often', hi: 'बाहर खाने वाली दिनचर्या' },
  };

  return {
    headline: hi
      ? `${name}, NariCare आपके ${problem[ph].hi} के लिए है`
      : `${name}, NariCare is for your ${problem[ph].en}`,
    sub: hi
      ? `${place[ctx].hi} के हिसाब से प्लेट · साइकल-ईमानदार ट्रैकिंग · रोज़ अलार्म · AI कोच · Progress Pulse सबूत`
      : `Plates for ${place[ctx].en} · honest cycle tracking · daily alarms · AI coach · Progress Pulse proof`,
    cores: hi
      ? [
          { title: 'आज सुलझाएँ', detail: 'आपकी असली समस्या → एक साफ़ कदम' },
          { title: 'दिन का शेड्यूल', detail: 'वक्त पर अलार्म — एक्सरसाइज़ शुरू करें' },
          { title: 'AI कोच', detail: 'भोजन, क्रेविंग, साइकल, लैब — बिना जजमेंट' },
          { title: 'Progress Pulse', detail: 'हर हफ़्ते सबूत कि प्लान लग रहा है' },
        ]
      : [
          { title: 'Solve today', detail: 'Your real struggle → one clear step' },
          { title: 'Day schedule', detail: 'Alarms on time — start exercise here' },
          { title: 'AI Coach', detail: 'Food, cravings, cycle, labs — no judgment' },
          { title: 'Progress Pulse', detail: 'Weekly proof the plan is landing' },
        ],
  };
}
