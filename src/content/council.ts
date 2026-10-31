import type { CyclePhase, LivingContext, Phenotype } from '@/src/types';

export type CouncilRole =
  | 'endocrinologist'
  | 'gynaecologist'
  | 'peer'
  | 'yoga'
  | 'dietitian';

export type CouncilMember = {
  id: string;
  name: string;
  nameHi: string;
  role: CouncilRole;
  title: string;
  titleHi: string;
  city: string;
  credentials: string;
  avatarTone: 'teal' | 'blush' | 'amber' | 'mist';
  /** Honest review of NariCare as built today */
  review: string;
  reviewHi: string;
  rating: number;
  /** Features they want next */
  featureAsks: { id: string; title: string; titleHi: string; why: string; whyHi: string }[];
  /** Rotating “today” micro-asks keyed loosely by phase / context */
  todayTemplates: {
    id: string;
    title: string;
    titleHi: string;
    detail: string;
    detailHi: string;
    href?: string;
    when?: {
      phases?: CyclePhase[];
      phenotypes?: Phenotype[];
      livingContexts?: LivingContext[];
    };
  }[];
};

export const COUNCIL: CouncilMember[] = [
  {
    id: 'dr_meera',
    name: 'Metabolic health',
    nameHi: 'मेटाबॉलिक हेल्थ',
    role: 'endocrinologist',
    title: 'Insulin, weight & blood sugar',
    titleHi: 'इंसुलिन, वज़न और ब्लड शुगर',
    city: '',
    credentials: 'From the 2023 International PCOS Guideline',
    avatarTone: 'teal',
    review:
      'Strong start: phenotype + Progress Pulse are what clinic patients actually need. Lab AI must stay educational — never auto-dose metformin. I’d ship fasting glucose / HOMA prompts next, and a “ask your doctor” checklist before every lab tip.',
    reviewHi:
      'अच्छी शुरुआत: phenotype और Progress Pulse क्लिनिक में काम आते हैं। Lab AI शिक्षा तक रहे — दवा की खुराक कभी न सुझाए। अगला: fasting glucose / HOMA प्रॉम्प्ट और हर टिप के साथ डॉक्टर से पूछें चेकलिस्ट।',
    rating: 4.6,
    featureAsks: [
      {
        id: 'insulin_checkin',
        title: 'Insulin-resistance check-in (weekly)',
        titleHi: 'इंसुलिन रेज़िस्टेंस साप्ताहिक चेक-इन',
        why: 'Energy crashes + post-meal sleepiness are early signals patients ignore.',
        whyHi: 'ऊर्जा गिरना और खाने के बाद नींद — मरीज़ अक्सर नज़रअंदाज़ करते हैं।',
      },
      {
        id: 'med_reminder_safe',
        title: 'Safe med/supplement log (no dosing advice)',
        titleHi: 'दवा/सप्लीमेंट लॉग (खुराक सलाह बिना)',
        why: 'Track adherence only — never recommend starting/stopping Rx.',
        whyHi: 'केवल पालन ट्रैक करें — दवा शुरू/बंद करने की सलाह कभी न दें।',
      },
    ],
    todayTemplates: [
      {
        id: 'meera_protein',
        title: 'Protein at breakfast first',
        titleHi: 'नाश्ते में पहले प्रोटीन',
        detail: 'Eggs / paneer / dahi before carbs. Blunts the mid-morning crash.',
        detailHi: 'अंडे / पनीर / दही पहले। दोपहर से पहले थकान कम होती है।',
        href: '/diet',
        when: { phenotypes: ['metabolic', 'mixed'] },
      },
      {
        id: 'meera_walk',
        title: '10-min walk after biggest meal',
        titleHi: 'सबसे बड़े खाने के बाद 10 मिनट वॉक',
        detail: 'Glucose disposal without a gym. Do it after lunch or dinner today.',
        detailHi: 'जिम के बिना शुगर कंट्रोल। आज लंच या डिनर के बाद करें।',
        href: '/move',
      },
    ],
  },
  {
    id: 'dr_ananya',
    name: 'Cycles & gynaecology',
    nameHi: 'साइकल और गायनी',
    role: 'gynaecologist',
    title: 'Periods, bleeding & doctor visits',
    titleHi: 'पीरियड, ब्लीडिंग और डॉक्टर विज़िट',
    city: '',
    credentials: 'From the 2023 International PCOS Guideline',
    avatarTone: 'blush',
    review:
      'Doctor Visit Kit is the right product instinct. Prediction copy must stay humble for PCOS — “likely window”, never certainty. Add bleeding pattern tags (heavy / clots / spotting days) and a pre-consult question pack.',
    reviewHi:
      'Doctor Visit Kit सही दिशा है। PCOS में प्रेडिक्शन विनम्र रहे — “संभावित विंडो”, पक्का वादा नहीं। ब्लीडिंग पैटर्न टैग और विज़िट से पहले सवाल पैक जोड़ें।',
    rating: 4.5,
    featureAsks: [
      {
        id: 'bleed_tags',
        title: 'Bleeding pattern tags',
        titleHi: 'ब्लीडिंग पैटर्न टैग',
        why: 'Heavy flow + clots change workup; apps that only say “period yes/no” waste consults.',
        whyHi: 'भारी फ्लो और क्लॉट्स जाँच बदलते हैं; सिर्फ पीरियड हाँ/ना से विज़िट बेकार।',
      },
      {
        id: 'consult_pack',
        title: '5 questions for your gynae',
        titleHi: 'गायनी से पूछने वाले 5 सवाल',
        why: 'Patients freeze in the chair. Pre-written questions raise visit quality.',
        whyHi: 'मरीज़ कुर्सी पर चुप हो जाते हैं। पहले से सवाल विज़िट बेहतर बनाते हैं।',
      },
    ],
    todayTemplates: [
      {
        id: 'ananya_log',
        title: 'Log period/symptoms (2 min)',
        titleHi: 'पीरियड/लक्षण लॉग (2 मिनट)',
        detail: 'Today’s truth > perfect memory later. Spotting counts.',
        detailHi: 'आज का सच बाद की याद से बेहतर। स्पॉटिंग भी गिने।',
        href: '/track',
      },
      {
        id: 'ananya_kit',
        title: 'Glance Doctor Kit before next visit',
        titleHi: 'अगली विज़िट से पहले Doctor Kit देखें',
        detail: 'Even a 30-second skim trains you what doctors need.',
        detailHi: '30 सेकंड की झलक भी सिखाती है डॉक्टर को क्या चाहिए।',
        href: '/doctor-kit',
      },
    ],
  },
  {
    id: 'priya_peer',
    name: 'Everyday life with PCOS',
    nameHi: 'PCOS के साथ रोज़ की ज़िंदगी',
    role: 'peer',
    title: 'Mood, family & bad days',
    titleHi: 'मूड, परिवार और मुश्किल दिन',
    city: '',
    credentials: 'Common experiences women with PCOS describe',
    avatarTone: 'amber',
    review:
      'Finally an app that doesn’t shame roti. I want a “bad day” mode — when I’m bloated and angry, don’t show a perfect plate. Also: family-pressure scripts for when relatives comment on weight.',
    reviewHi:
      'आख़िर ऐसी ऐप जो रोटी पर शर्म न दिलाए। “खराब दिन” मोड चाहिए — जब सूजन और गुस्सा हो, परफेक्ट प्लेट न दिखाओ। रिश्तेदारों के वजन वाले कमेंट्स के जवाब भी।',
    rating: 4.8,
    featureAsks: [
      {
        id: 'bad_day',
        title: 'Bad-day mode',
        titleHi: 'खराब-दिन मोड',
        why: 'On flare days I need one tiny win, not five cards yelling at me.',
        whyHi: 'फ्लेयर दिन पर एक छोटी जीत चाहिए, पाँच कार्ड नहीं जो डाँटें।',
      },
      {
        id: 'family_script',
        title: 'Family pressure reply scripts',
        titleHi: 'पारिवारिक दबाव के जवाब',
        why: '"Bas thoda weight kam karo" hits harder than any missed workout.',
        whyHi: '"Bas thoda weight kam karo" hits harder than a missed workout.',
      },
    ],
    todayTemplates: [
      {
        id: 'priya_water',
        title: '3 glasses before 2pm',
        titleHi: 'दोपहर 2 बजे तक 3 गिलास पानी',
        detail: 'I always forget until headache. Front-load water today.',
        detailHi: 'सिरदर्द तक भूल जाती हूँ। आज पानी पहले पिएँ।',
      },
      {
        id: 'priya_mood',
        title: 'Mood check — no judgment',
        titleHi: 'मूड चेक — बिना जजमेंट',
        detail: 'Tap mood on Track. Patterns beat “I feel crazy” stories.',
        detailHi: 'Track पर मूड टैप करें। पैटर्न “मैं पागल हूँ” वाली कहानी से बेहतर।',
        href: '/track',
      },
    ],
  },
  {
    id: 'kavya_peer',
    name: 'Students & hostel life',
    nameHi: 'स्टूडेंट और हॉस्टल लाइफ़',
    role: 'peer',
    title: 'Mess food, exams & irregular cycles',
    titleHi: 'मेस खाना, परीक्षा और अनियमित साइकल',
    city: '',
    credentials: 'Common experiences women with PCOS describe',
    avatarTone: 'mist',
    review:
      'Hostel mess mode is why I stayed. Need: late-night canteen swaps, period-kit packing list for exams, and anonymous “is this normal?” queue posts with doctor soft-replies.',
    reviewHi:
      'हॉस्टल मेस मोड की वजह से रुकी। चाहिए: रात की कैंटीन स्वैप, परीक्षा के लिए पीरियड किट लिस्ट, और डॉक्टर की नरम जवाब वाली अनाम पोस्ट।',
    rating: 4.7,
    featureAsks: [
      {
        id: 'canteen_swaps',
        title: 'Late-night canteen swap cards',
        titleHi: 'रात की कैंटीन स्वैप कार्ड',
        why: 'Maggi at 1am happens. Give me the least-bad choice, not a lecture.',
        whyHi: 'रात 1 बजे मैगी होती है। सबसे कम नुकसान वाला विकल्प दो, लेक्चर नहीं।',
      },
      {
        id: 'exam_kit',
        title: 'Exam-week survival kit',
        titleHi: 'परीक्षा हफ़्ते की किट',
        why: 'Stress + skipped meals wreck my cycle every semester.',
        whyHi: 'स्ट्रेस और छूटे खाने से हर सेमेस्टर साइकल बिगड़ता है।',
      },
    ],
    todayTemplates: [
      {
        id: 'kavya_mess',
        title: 'Mess plate rule: half sabzi',
        titleHi: 'मेस नियम: आधी प्लेट सब्ज़ी',
        detail: 'Whatever dal-rice is — push veggies up. Curd if available.',
        detailHi: 'दाल-चावल जो भी हो — सब्ज़ी बढ़ाएँ। दही मिले तो लें।',
        href: '/diet',
        when: { livingContexts: ['hostel_mess', 'tiffin'] },
      },
      {
        id: 'kavya_sleep',
        title: 'Phone down 20 min earlier',
        titleHi: 'फ़ोन 20 मिनट पहले बंद',
        detail: 'Sleep debt = worse cravings tomorrow. Tiny boundary tonight.',
        detailHi: 'नींद की कमी = कल ज़्यादा क्रेविंग। आज छोटी सीमा।',
      },
    ],
  },
  {
    id: 'anjali_yoga',
    name: 'Yoga & movement',
    nameHi: 'योग और मूवमेंट',
    role: 'yoga',
    title: 'Restorative yoga & strength',
    titleHi: 'रिस्टोरेटिव योग और स्ट्रेंथ',
    city: '',
    credentials: 'From guideline advice on physical activity',
    avatarTone: 'teal',
    review:
      'Cycle-synced Move is correct. Add: pelvic floor cues, “skip with kindness” when cramps >6/10, and 5-min desk stretches for office/hostel. Never push power yoga in late luteal for everyone.',
    reviewHi:
      'साइकल-सिंक Move सही है। जोड़ें: पेल्विक फ्लोर, ऐंठन >6/10 पर दया से स्किप, और डेस्क स्ट्रेच। लेट ल्यूटियल में सबको पावर योग न थोपें।',
    rating: 4.7,
    featureAsks: [
      {
        id: 'desk_flow',
        title: '5-min desk / hostel flow',
        titleHi: '5 मिनट डेस्क/हॉस्टल फ्लो',
        why: 'Women won’t roll a mat between lectures. Micro-mobility still counts.',
        whyHi: 'लेक्चर के बीच मैट नहीं बिछाएँगी। छोटी मूवमेंट भी गिनी जाए।',
      },
      {
        id: 'pain_skip',
        title: 'Pain-aware skip button',
        titleHi: 'दर्द के हिसाब से स्किप',
        why: 'Logging a skip with reason beats guilt-quitting the whole app.',
        whyHi: 'कारण के साथ स्किप लॉग करना पूरे ऐप छोड़ने से बेहतर।',
      },
    ],
    todayTemplates: [
      {
        id: 'anjali_breath',
        title: '3 minutes belly breathing',
        titleHi: '3 मिनट पेट की साँस',
        detail: 'Inhale 4, exhale 6. Lowers cortisol spike before meals.',
        detailHi: '4 साँस अंदर, 6 बाहर। खाने से पहले तनाव कम।',
        href: '/move',
        when: { phases: ['luteal', 'unknown'] },
      },
      {
        id: 'anjali_flow',
        title: 'Do today’s Move session',
        titleHi: 'आज का Move सेशन करें',
        detail: '10–15 min is enough. Consistency > intensity for PCOS.',
        detailHi: '10–15 मिनट काफ़ी। PCOS में निरंतरता तीव्रता से ज़्यादा।',
        href: '/move',
        when: { phases: ['follicular', 'ovulation'] },
      },
    ],
  },
  {
    id: 'sneha_diet',
    name: 'Indian PCOS nutrition',
    nameHi: 'भारतीय PCOS पोषण',
    role: 'dietitian',
    title: 'Indian plates, protein & fibre',
    titleHi: 'भारतीय थाली, प्रोटीन और फाइबर',
    city: '',
    credentials: 'From guideline advice on healthy eating',
    avatarTone: 'amber',
    review:
      'Living-context diet is the moat. Next: festival / wedding week plans, iron-rich vegetarian swaps for heavy bleeders, and a “protein ladder” for pure veg households without whey shame.',
    reviewHi:
      'लिविंग-कॉन्टेक्स्ट डाइट असली ताकत है। अगला: त्योहार/शादी हफ़्ता, भारी ब्लीड पर आयरन स्वैप, और बिना व्हे शर्म के वेज प्रोटीन लैडर।',
    rating: 4.9,
    featureAsks: [
      {
        id: 'festival_week',
        title: 'Festival & wedding week plans',
        titleHi: 'त्योहार व शादी हफ़्ते की योजना',
        why: 'One mithai-heavy week shouldn’t nuke three months of adherence.',
        whyHi: 'एक मिठाई वाला हफ़्ता तीन महीने की मेहनत न मिटाए।',
      },
      {
        id: 'protein_ladder',
        title: 'Veg protein ladder',
        titleHi: 'वेज प्रोटीन सीढ़ी',
        why: 'Dahi → paneer → sprouts → besan → millets — sequenced, not random.',
        whyHi: 'दही → पनीर → स्प्राउट्स → बेसन → मिलेट — क्रम से, अँधाधुंध नहीं।',
      },
    ],
    todayTemplates: [
      {
        id: 'sneha_fiber',
        title: 'Add one fiber bump',
        titleHi: 'एक फाइबर बढ़ाएँ',
        detail: 'Salad / roasted chana / methi in dal. Pair with protein.',
        detailHi: 'सलाद / भुना चना / दाल में मेथी। प्रोटीन के साथ।',
        href: '/diet',
      },
      {
        id: 'sneha_grocery',
        title: 'Tick 3 staples on grocery list',
        titleHi: 'किराना लिस्ट पर 3 स्टेपल टिक',
        detail: 'Dahi, greens, millets or eggs — stock beats willpower.',
        detailHi: 'दही, साग, मिलेट या अंडे — स्टॉक इच्छाशक्ति से बेहतर।',
        href: '/grocery',
      },
    ],
  },
];

/** Topic tags. These cards are guideline-based tips, not quotes from named professionals. */
export const ROLE_LABEL: Record<CouncilRole, { en: string; hi: string }> = {
  endocrinologist: { en: 'Guideline tip', hi: 'गाइडलाइन टिप' },
  gynaecologist: { en: 'Guideline tip', hi: 'गाइडलाइन टिप' },
  peer: { en: 'Real-life tip', hi: 'रोज़ की टिप' },
  yoga: { en: 'Movement tip', hi: 'मूवमेंट टिप' },
  dietitian: { en: 'Nutrition tip', hi: 'पोषण टिप' },
};
