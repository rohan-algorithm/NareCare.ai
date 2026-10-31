export type Goal = 'lose_weight' | 'regulate_periods' | 'fertility' | 'skin_hair' | 'manage_symptoms' | 'wellness';

export type Lesson = {
  id: string;
  week: number;
  goals: Goal[];
  title: { en: string; hi: string };
  body: { en: string[]; hi: string[] };
  tryToday: { en: string; hi: string };
  href?: string;
};

export const WEEK_THEMES: { en: string; hi: string }[] = [
  { en: 'Understand your PCOS', hi: 'अपना PCOS समझें' },
  { en: 'Food that fits your life', hi: 'आपकी ज़िंदगी के हिसाब से खाना' },
  { en: 'Move for your hormones', hi: 'हॉर्मोन के लिए मूव' },
  { en: 'Weight, the kind way', hi: 'वज़न, सही तरीके से' },
  { en: 'Skin, hair and confidence', hi: 'त्वचा, बाल और आत्मविश्वास' },
  { en: 'Mind and sleep', hi: 'मन और नींद' },
  { en: 'Cycles and fertility', hi: 'पीरियड और फर्टिलिटी' },
  { en: 'Your long game', hi: 'लंबी दौड़ की तैयारी' },
];

export const LESSONS: Lesson[] = [
  {
    id: 'w1-what',
    week: 1,
    goals: ['wellness', 'regulate_periods', 'manage_symptoms'],
    title: { en: 'PCOS in plain words', hi: 'PCOS सरल शब्दों में' },
    body: {
      en: [
        'PCOS is a common hormone condition. Studies in India estimate it affects up to 1 in 5 women.',
        'It usually shows up as irregular periods, extra androgens (acne, facial hair, hair thinning) or both.',
        'It is not your fault, and it is not caused by one food or one habit. Genes and insulin play a big role.',
        'The good news: daily habits are the first treatment doctors recommend, and they work best when they are small and steady.',
      ],
      hi: [
        'PCOS एक आम हॉर्मोन स्थिति है। भारत के अध्ययनों के अनुसार हर 5 में से 1 महिला तक इससे प्रभावित हो सकती है।',
        'इसमें अक्सर पीरियड अनियमित होते हैं, एंड्रोजन बढ़ते हैं (मुंहासे, चेहरे के बाल, बाल पतले होना), या दोनों।',
        'यह आपकी गलती नहीं है और किसी एक खाने या आदत से नहीं होता। जीन और इंसुलिन की बड़ी भूमिका होती है।',
        'अच्छी बात: रोज़ की आदतें डॉक्टरों का पहला इलाज हैं, और छोटी व नियमित आदतें सबसे अच्छा काम करती हैं।',
      ],
    },
    tryToday: { en: 'Log how you feel today. It starts your proof.', hi: 'आज कैसा लगा, लॉग करें। यहीं से आपका सबूत शुरू होता है।' },
    href: '/track',
  },
  {
    id: 'w1-cysts',
    week: 1,
    goals: ['wellness', 'regulate_periods'],
    title: { en: 'The “cysts” myth', hi: '“सिस्ट” का भ्रम' },
    body: {
      en: [
        'Despite the name, PCOS is not a disease of cysts. The “cysts” on scans are small follicles, eggs that did not fully mature.',
        'Doctors diagnose PCOS when 2 of 3 are present: irregular cycles, high androgens (on blood tests or as symptoms), or many follicles on ultrasound.',
        'You can have PCOS with normal-looking ovaries, and follicles alone do not mean PCOS.',
        'Surgery to “remove cysts” is not a standard PCOS treatment. Be careful of clinics that push it.',
      ],
      hi: [
        'नाम के बावजूद PCOS सिस्ट की बीमारी नहीं है। स्कैन में दिखने वाले “सिस्ट” छोटे फॉलिकल होते हैं, यानी अंडे जो पूरी तरह पके नहीं।',
        'डॉक्टर PCOS तब मानते हैं जब 3 में से 2 बातें हों: अनियमित पीरियड, ज़्यादा एंड्रोजन (टेस्ट या लक्षण में), या अल्ट्रासाउंड में कई फॉलिकल।',
        'सामान्य दिखने वाले अंडाशय के साथ भी PCOS हो सकता है, और सिर्फ़ फॉलिकल होना PCOS नहीं है।',
        '“सिस्ट निकालने” की सर्जरी PCOS का सामान्य इलाज नहीं है। जो क्लिनिक इस पर ज़ोर दें, उनसे सावधान रहें।',
      ],
    },
    tryToday: { en: 'Upload or type your last lab report to understand it.', hi: 'अपनी पिछली लैब रिपोर्ट डालें और समझें।' },
    href: '/labs',
  },
  {
    id: 'w1-insulin',
    week: 1,
    goals: ['lose_weight', 'regulate_periods', 'wellness'],
    title: { en: 'Insulin, the hidden driver', hi: 'इंसुलिन, छिपा हुआ कारण' },
    body: {
      en: [
        'Many women with PCOS have insulin resistance, including slim women. The body needs extra insulin to handle sugar.',
        'High insulin pushes the ovaries to make more androgens, which can delay ovulation and worsen acne and facial hair.',
        'That is why food order, protein, fibre and movement after meals matter more for PCOS than counting calories.',
        'Signs can include dark velvety skin on the neck, strong sugar cravings and energy crashes after meals.',
      ],
      hi: [
        'PCOS वाली कई महिलाओं में इंसुलिन रेज़िस्टेंस होता है, पतली महिलाओं में भी। शरीर को शुगर संभालने के लिए ज़्यादा इंसुलिन चाहिए होता है।',
        'ज़्यादा इंसुलिन अंडाशय से ज़्यादा एंड्रोजन बनवाता है, जिससे ओव्यूलेशन रुक सकता है और मुंहासे व चेहरे के बाल बढ़ सकते हैं।',
        'इसीलिए PCOS में कैलोरी गिनने से ज़्यादा ज़रूरी है खाने का क्रम, प्रोटीन, फाइबर और खाने के बाद टहलना।',
        'संकेत: गर्दन पर काली मखमली त्वचा, मीठे की तेज़ क्रेविंग और खाने के बाद थकान।',
      ],
    },
    tryToday: { en: 'Eat your sabzi and dal first, rice or roti last.', hi: 'पहले सब्ज़ी और दाल खाएँ, चावल या रोटी आखिर में।' },
    href: '/diet',
  },
  {
    id: 'w2-plate',
    week: 2,
    goals: ['lose_weight', 'wellness', 'regulate_periods'],
    title: { en: 'The PCOS plate', hi: 'PCOS थाली' },
    body: {
      en: [
        'No single “PCOS diet” is proven best. What matters is a pattern you can keep for years.',
        'An easy guide for any Indian meal: half the plate sabzi or salad, a quarter protein (dal, paneer, eggs, chicken, sprouts), a quarter whole grains.',
        'You don’t need quinoa or imported food. Jowar, bajra, ragi, dal and seasonal sabzi are excellent.',
        'Strict bans usually end in binges. Aim for most meals, most days.',
      ],
      hi: [
        'कोई एक “PCOS डाइट” सबसे अच्छी साबित नहीं है। ज़रूरी है ऐसा पैटर्न जो सालों चल सके।',
        'किसी भी भारतीय खाने के लिए आसान नियम: आधी थाली सब्ज़ी या सलाद, चौथाई प्रोटीन (दाल, पनीर, अंडे, चिकन, स्प्राउट्स), चौथाई साबुत अनाज।',
        'क्विनोआ या महंगे खाने की ज़रूरत नहीं। ज्वार, बाजरा, रागी, दाल और मौसमी सब्ज़ियाँ बहुत अच्छी हैं।',
        'सख़्त पाबंदियाँ अक्सर ज़्यादा खाने पर खत्म होती हैं। ज़्यादातर दिन, ज़्यादातर खाना सही रखें।',
      ],
    },
    tryToday: { en: 'Scan your lunch plate and see its PCOS score.', hi: 'दोपहर की थाली स्कैन करें और PCOS स्कोर देखें।' },
    href: '/plate',
  },
  {
    id: 'w2-breakfast',
    week: 2,
    goals: ['lose_weight', 'wellness', 'manage_symptoms'],
    title: { en: 'Protein-first breakfast', hi: 'प्रोटीन वाला नाश्ता' },
    body: {
      en: [
        'A breakfast of only poha, toast or biscuits with chai spikes blood sugar, then leaves you hungry and craving by 11 am.',
        'Adding protein steadies energy: moong cheela, besan cheela, eggs, paneer, curd or a sattu drink.',
        'Aim for roughly 15 to 20 g of protein in the morning.',
        'Hostel? Sattu with water, roasted chana or boiled eggs from the mess all count.',
      ],
      hi: [
        'सिर्फ़ पोहा, टोस्ट या बिस्कुट-चाय वाला नाश्ता शुगर बढ़ाता है, फिर 11 बजे तक भूख और क्रेविंग लगती है।',
        'प्रोटीन जोड़ने से ऊर्जा स्थिर रहती है: मूंग चीला, बेसन चीला, अंडे, पनीर, दही या सत्तू।',
        'सुबह लगभग 15 से 20 ग्राम प्रोटीन का लक्ष्य रखें।',
        'हॉस्टल में? पानी में सत्तू, भुना चना या मेस के उबले अंडे, सब चलेगा।',
      ],
    },
    tryToday: { en: 'Add one protein to tomorrow’s breakfast.', hi: 'कल के नाश्ते में एक प्रोटीन जोड़ें।' },
    href: '/diet',
  },
  {
    id: 'w2-sugar',
    week: 2,
    goals: ['lose_weight', 'manage_symptoms', 'skin_hair'],
    title: { en: 'Chai, sugar and maida: swaps, not bans', hi: 'चाय, चीनी और मैदा: बदलाव, पाबंदी नहीं' },
    body: {
      en: [
        'Three cups of sugary chai can add 6 teaspoons of sugar a day. Cutting sugar gradually by half a spoon a week is easier than quitting.',
        'Have sweets right after a meal rather than on an empty stomach; the spike is smaller.',
        'Swap maida snacks (biscuits, namkeen, bakery) for roasted chana, makhana, fruit with nuts or chaas.',
        'Festivals and weddings happen. One day doesn’t undo a week; just return to your plan at the next meal.',
      ],
      hi: [
        'मीठी चाय के तीन कप दिन में 6 चम्मच चीनी जोड़ सकते हैं। हर हफ्ते आधा चम्मच कम करना छोड़ने से आसान है।',
        'मिठाई खाली पेट की बजाय खाने के तुरंत बाद लें; शुगर कम बढ़ती है।',
        'मैदे वाले स्नैक्स (बिस्कुट, नमकीन, बेकरी) की जगह भुना चना, मखाना, फल-मेवे या छाछ लें।',
        'त्योहार और शादियाँ होती रहेंगी। एक दिन से हफ्ता खराब नहीं होता; अगले खाने से प्लान पर लौट आएँ।',
      ],
    },
    tryToday: { en: 'Use half a spoon less sugar in each chai today.', hi: 'आज हर चाय में आधा चम्मच कम चीनी डालें।' },
  },
  {
    id: 'w3-muscle',
    week: 3,
    goals: ['lose_weight', 'wellness', 'regulate_periods'],
    title: { en: 'Muscles soak up sugar', hi: 'मांसपेशियाँ शुगर सोखती हैं' },
    body: {
      en: [
        'Muscle is where most blood sugar gets used. More active muscle means less insulin needed.',
        'Guidelines suggest about 150 minutes of moderate activity a week plus muscle-strengthening on 2 days.',
        'No gym needed: squats, wall push-ups, bridges and stairs build strength at home.',
        'Any movement counts. Fifteen minutes done beats an hour planned.',
      ],
      hi: [
        'शरीर की ज़्यादातर शुगर मांसपेशियों में इस्तेमाल होती है। ज़्यादा सक्रिय मांसपेशी, कम इंसुलिन की ज़रूरत।',
        'गाइडलाइन के अनुसार हफ्ते में लगभग 150 मिनट मध्यम एक्टिविटी और 2 दिन ताकत वाली एक्सरसाइज़।',
        'जिम ज़रूरी नहीं: स्क्वाट, दीवार पुश-अप, ब्रिज और सीढ़ियाँ घर पर ताकत बढ़ाती हैं।',
        'हर हलचल गिनी जाती है। 15 मिनट किया हुआ, एक घंटे की योजना से बेहतर।',
      ],
    },
    tryToday: { en: 'Do today’s 15-minute routine.', hi: 'आज का 15-मिनट रूटीन करें।' },
    href: '/move?start=1',
  },
  {
    id: 'w3-walk',
    week: 3,
    goals: ['lose_weight', 'wellness', 'manage_symptoms'],
    title: { en: 'The 10-minute walk after meals', hi: 'खाने के बाद 10 मिनट की सैर' },
    body: {
      en: [
        'A short walk after eating helps muscles pull sugar out of the blood, flattening the after-meal spike.',
        'Even 10 minutes after lunch and dinner makes a measurable difference.',
        'Indian homes already have the habit: shatpavali, the after-dinner stroll. Bring it back.',
        'Rainy day or hostel room? March in place or climb stairs for 10 minutes.',
      ],
      hi: [
        'खाने के बाद थोड़ी सैर से मांसपेशियाँ खून से शुगर खींचती हैं और शुगर का उछाल कम होता है।',
        'दोपहर और रात के खाने के बाद सिर्फ़ 10 मिनट भी फ़र्क डालते हैं।',
        'भारतीय घरों में यह आदत पहले से है: शतपावली, रात के खाने के बाद की सैर। इसे वापस लाएँ।',
        'बारिश या हॉस्टल का कमरा? 10 मिनट जगह पर मार्च करें या सीढ़ियाँ चढ़ें।',
      ],
    },
    tryToday: { en: 'Walk 10 minutes after dinner tonight.', hi: 'आज रात खाने के बाद 10 मिनट टहलें।' },
  },
  {
    id: 'w3-energy',
    week: 3,
    goals: ['regulate_periods', 'manage_symptoms', 'wellness'],
    title: { en: 'Move with your energy, not against it', hi: 'ऊर्जा के साथ मूव करें, उसके ख़िलाफ़ नहीं' },
    body: {
      en: [
        'With PCOS, cycles are often irregular, so strict “cycle syncing” plans may not match your body.',
        'A simpler rule: on high-energy days do strength or brisk walks; on cramp or low days choose yoga, stretching or a slow walk.',
        'Rest days are part of training, not failure.',
        'The goal is a routine you still do in month six.',
      ],
      hi: [
        'PCOS में पीरियड अक्सर अनियमित होते हैं, इसलिए सख़्त “साइकल सिंकिंग” प्लान शरीर से मेल नहीं खा सकते।',
        'आसान नियम: ज़्यादा ऊर्जा वाले दिन ताकत या तेज़ सैर; ऐंठन या थकान वाले दिन योग, स्ट्रेचिंग या धीमी सैर।',
        'आराम के दिन ट्रेनिंग का हिस्सा हैं, हार नहीं।',
        'लक्ष्य ऐसा रूटीन है जो छठे महीने में भी चले।',
      ],
    },
    tryToday: { en: 'Tired today? Try the 3-minute calm breathing.', hi: 'आज थकान है? 3 मिनट की शांत साँस आज़माएँ।' },
    href: '/move?start=1',
  },
  {
    id: 'w4-harder',
    week: 4,
    goals: ['lose_weight'],
    title: { en: 'Why weight loss feels harder', hi: 'वज़न कम करना कठिन क्यों लगता है' },
    body: {
      en: [
        'It is not just willpower. Insulin resistance and hormone changes make weight gain easier and loss slower with PCOS.',
        'Crash diets backfire: they cut muscle, raise cravings and the weight returns.',
        'Slow and steady wins: about 0.25 to 0.5 kg a week is a healthy pace.',
        'If you have tried everything, talk to your doctor; medicines exist that can help alongside lifestyle.',
      ],
      hi: [
        'यह सिर्फ़ इच्छाशक्ति की बात नहीं। PCOS में इंसुलिन रेज़िस्टेंस और हॉर्मोन वज़न बढ़ाना आसान और घटाना धीमा बनाते हैं।',
        'क्रैश डाइट उल्टी पड़ती है: मांसपेशी घटती है, क्रेविंग बढ़ती है और वज़न लौट आता है।',
        'धीमे और लगातार चलना जीतता है: हफ्ते में लगभग 0.25 से 0.5 किलो स्वस्थ रफ़्तार है।',
        'अगर सब आज़मा चुकी हैं, तो डॉक्टर से बात करें; लाइफ़स्टाइल के साथ मदद करने वाली दवाएँ मौजूद हैं।',
      ],
    },
    tryToday: { en: 'Log your weight and waist to set your baseline.', hi: 'वज़न और कमर लॉग करके शुरुआत तय करें।' },
    href: '/progress',
  },
  {
    id: 'w4-five',
    week: 4,
    goals: ['lose_weight', 'regulate_periods', 'fertility'],
    title: { en: 'The 5% target', hi: '5% का लक्ष्य' },
    body: {
      en: [
        'You don’t need to reach a “perfect” weight. Losing just 5 to 10% of body weight can improve cycles, ovulation and insulin.',
        'For someone at 70 kg, that is 3.5 to 7 kg.',
        'NariCare shows your personal 5% line on your progress chart.',
        'Lean PCOS? Weight loss isn’t your goal; focus on strength, protein and sleep instead.',
      ],
      hi: [
        '“परफ़ेक्ट” वज़न ज़रूरी नहीं। शरीर का सिर्फ़ 5 से 10% वज़न कम होने से पीरियड, ओव्यूलेशन और इंसुलिन बेहतर हो सकते हैं।',
        '70 किलो वाली महिला के लिए यह 3.5 से 7 किलो है।',
        'NariCare आपके प्रोग्रेस चार्ट पर आपकी अपनी 5% रेखा दिखाता है।',
        'पतली हैं और PCOS है? वज़न घटाना लक्ष्य नहीं; ताकत, प्रोटीन और नींद पर ध्यान दें।',
      ],
    },
    tryToday: { en: 'See your 5% line on the progress chart.', hi: 'प्रोग्रेस चार्ट पर अपनी 5% रेखा देखें।' },
    href: '/progress',
  },
  {
    id: 'w4-scale',
    week: 4,
    goals: ['lose_weight'],
    title: { en: 'When the scale doesn’t move', hi: 'जब वज़न नहीं घटता' },
    body: {
      en: [
        'Weight bounces 1 to 2 kg day to day with water, salt and your cycle. Weigh once a week, same morning, same time.',
        'Your waist often shrinks before the scale moves. That is real progress in insulin.',
        'Also count wins like steadier energy, fewer cravings and better sleep.',
        'A 3-week plateau is normal. Keep going before changing the plan.',
      ],
      hi: [
        'पानी, नमक और पीरियड से वज़न रोज़ 1 से 2 किलो ऊपर-नीचे होता है। हफ्ते में एक बार, एक ही सुबह, एक ही समय तौलें।',
        'अक्सर वज़न से पहले कमर कम होती है। यह इंसुलिन में असली सुधार है।',
        'स्थिर ऊर्जा, कम क्रेविंग और बेहतर नींद जैसी जीतें भी गिनें।',
        '3 हफ्ते का ठहराव सामान्य है। प्लान बदलने से पहले जारी रखें।',
      ],
    },
    tryToday: { en: 'Measure your waist at the belly button.', hi: 'नाभि पर कमर नापें।' },
    href: '/progress',
  },
  {
    id: 'w5-hair',
    week: 5,
    goals: ['skin_hair', 'manage_symptoms'],
    title: { en: 'Facial hair: what actually works', hi: 'चेहरे के बाल: क्या सच में काम करता है' },
    body: {
      en: [
        'Extra facial and body hair comes from androgens. You’re not alone: it is one of the most common PCOS concerns in India.',
        'Threading, waxing and laser are safe ways to manage it. Laser reduces regrowth but needs several sessions.',
        'Doctors may prescribe the combined pill and sometimes anti-androgen medicines. Results take about 6 months, so be patient.',
        'Lifestyle helps too: lowering insulin lowers androgens over months. Spearmint tea has small studies behind it.',
      ],
      hi: [
        'चेहरे और शरीर पर ज़्यादा बाल एंड्रोजन से होते हैं। आप अकेली नहीं हैं: भारत में यह PCOS की सबसे आम चिंताओं में से एक है।',
        'थ्रेडिंग, वैक्सिंग और लेज़र सुरक्षित तरीके हैं। लेज़र से बाल कम उगते हैं पर कई सेशन लगते हैं।',
        'डॉक्टर कभी-कभी गर्भनिरोधक गोली और एंटी-एंड्रोजन दवा देते हैं। असर में लगभग 6 महीने लगते हैं, धैर्य रखें।',
        'लाइफ़स्टाइल भी मदद करता है: इंसुलिन घटने से महीनों में एंड्रोजन घटते हैं। पुदीना चाय पर छोटे अध्ययन हैं।',
      ],
    },
    tryToday: { en: 'Do your monthly skin & hair check-in.', hi: 'मासिक त्वचा और बाल चेक-इन करें।' },
    href: '/progress?tab=skin',
  },
  {
    id: 'w5-hairfall',
    week: 5,
    goals: ['skin_hair', 'manage_symptoms'],
    title: { en: 'Hair fall: check these first', hi: 'बाल झड़ना: पहले ये जाँचें' },
    body: {
      en: [
        'Thinning at the crown or parting can be androgen-related, but other common causes add up in Indian women.',
        'Ask your doctor about checking thyroid (TSH), iron stores (ferritin), vitamin B12 and vitamin D.',
        'Protein matters: hair is made of it. Most of us eat too little at breakfast and dinner.',
        'A dermatologist can suggest proven treatments. Be wary of costly “PCOS hair” oils with no evidence.',
      ],
      hi: [
        'सिर के ऊपर या मांग में बाल पतले होना एंड्रोजन से हो सकता है, पर भारतीय महिलाओं में दूसरे आम कारण भी जुड़ते हैं।',
        'डॉक्टर से थायरॉइड (TSH), आयरन (फेरिटिन), विटामिन B12 और विटामिन D जाँचने के बारे में पूछें।',
        'प्रोटीन ज़रूरी है: बाल प्रोटीन से बनते हैं। हम में से ज़्यादातर नाश्ते और रात में कम प्रोटीन खाते हैं।',
        'डर्मेटोलॉजिस्ट प्रमाणित इलाज बता सकते हैं। बिना सबूत के महंगे “PCOS हेयर” तेलों से सावधान रहें।',
      ],
    },
    tryToday: { en: 'Check your last report for TSH and vitamin D.', hi: 'पिछली रिपोर्ट में TSH और विटामिन D देखें।' },
    href: '/labs',
  },
  {
    id: 'w5-acne',
    week: 5,
    goals: ['skin_hair', 'manage_symptoms'],
    title: { en: 'Acne: a calm routine', hi: 'मुंहासे: एक शांत रूटीन' },
    body: {
      en: [
        'Hormonal acne often sits on the jawline and chin and flares before periods.',
        'Keep it simple: gentle face wash twice a day, a light moisturiser and daily sunscreen. Don’t pick or scrub hard.',
        'Some women notice flares with lots of milk or sugar. Track it for 3 weeks before cutting foods.',
        'Painful or scarring acne deserves a dermatologist early; scars are harder to treat than acne.',
      ],
      hi: [
        'हॉर्मोनल मुंहासे अक्सर जबड़े और ठुड्डी पर होते हैं और पीरियड से पहले बढ़ते हैं।',
        'सादा रखें: दिन में दो बार हल्का फेस वॉश, हल्का मॉइस्चराइज़र और रोज़ सनस्क्रीन। फोड़ें या रगड़ें नहीं।',
        'कुछ महिलाओं में ज़्यादा दूध या चीनी से मुंहासे बढ़ते हैं। खाना बंद करने से पहले 3 हफ्ते ट्रैक करें।',
        'दर्द वाले या दाग़ छोड़ने वाले मुंहासों के लिए जल्दी डर्मेटोलॉजिस्ट दिखाएँ; दाग़ का इलाज कठिन है।',
      ],
    },
    tryToday: { en: 'Log acne today so patterns show up.', hi: 'आज मुंहासे लॉग करें ताकि पैटर्न दिखे।' },
    href: '/track',
  },
  {
    id: 'w6-anxiety',
    week: 6,
    goals: ['manage_symptoms', 'wellness'],
    title: { en: 'PCOS and anxiety are linked', hi: 'PCOS और एंग्ज़ायटी जुड़े हैं' },
    body: {
      en: [
        'Anxiety and low mood are much more common with PCOS. It is partly hormones and partly the stress of symptoms and comments.',
        'Feeling this way is not weakness, and it deserves care just like your periods do.',
        'A 2-minute check-in each month helps you notice changes early.',
        'If you feel low most days for 2 weeks, talk to a doctor or call Tele-MANAS at 14416 (free, 24x7, Hindi and English).',
      ],
      hi: [
        'PCOS में एंग्ज़ायटी और उदासी कहीं ज़्यादा आम हैं। कुछ हॉर्मोन से, कुछ लक्षणों और तानों के तनाव से।',
        'ऐसा महसूस करना कमज़ोरी नहीं है, और इसकी देखभाल भी पीरियड जितनी ही ज़रूरी है।',
        'हर महीने 2 मिनट का चेक-इन बदलाव जल्दी पकड़ने में मदद करता है।',
        'अगर 2 हफ्ते ज़्यादातर दिन उदास लगे, तो डॉक्टर से बात करें या Tele-MANAS 14416 पर कॉल करें (मुफ़्त, 24x7, हिंदी में)।',
      ],
    },
    tryToday: { en: 'Take the 1-minute mood check-in.', hi: '1 मिनट का मूड चेक-इन करें।' },
    href: '/progress?tab=mind',
  },
  {
    id: 'w6-sleep',
    week: 6,
    goals: ['lose_weight', 'manage_symptoms', 'wellness'],
    title: { en: 'Sleep is treatment', hi: 'नींद भी इलाज है' },
    body: {
      en: [
        'One short night raises insulin resistance and cravings the next day.',
        'Aim for 7 to 9 hours. Keep the same sleep and wake time, even on weekends.',
        'Screens off 30 minutes before bed; dim lights; avoid chai after 4 pm.',
        'Loud snoring, gasping or daytime sleepiness can signal sleep apnoea, which is more common with PCOS. Mention it to your doctor.',
      ],
      hi: [
        'एक रात कम नींद से अगले दिन इंसुलिन रेज़िस्टेंस और क्रेविंग बढ़ती हैं।',
        '7 से 9 घंटे का लक्ष्य रखें। सोने-जागने का समय रोज़ एक जैसा रखें, छुट्टी पर भी।',
        'सोने से 30 मिनट पहले स्क्रीन बंद; हल्की रोशनी; शाम 4 बजे के बाद चाय नहीं।',
        'तेज़ खर्राटे, साँस अटकना या दिन में नींद आना स्लीप एपनिया का संकेत हो सकता है, जो PCOS में ज़्यादा होता है। डॉक्टर को बताएँ।',
      ],
    },
    tryToday: { en: 'Set a bedtime and keep your phone outside the bed.', hi: 'सोने का समय तय करें और फ़ोन बिस्तर से दूर रखें।' },
  },
  {
    id: 'w6-family',
    week: 6,
    goals: ['wellness', 'lose_weight', 'fertility'],
    title: { en: 'Comments, pressure and your body', hi: 'ताने, दबाव और आपका शरीर' },
    body: {
      en: [
        '“Thoda weight kam karo”, “shaadi ke baad sab theek ho jayega”: comments like these hurt and are often medically wrong.',
        'You can answer briefly and kindly: “I’m working with my doctor on PCOS. Please support me, not my weight.”',
        'Marriage does not cure PCOS, and PCOS does not mean you can’t have children.',
        'Choose one supportive person to share your plan with. Accountability doubles consistency.',
      ],
      hi: [
        '“थोड़ा वज़न कम करो”, “शादी के बाद सब ठीक हो जाएगा”: ऐसे ताने दुख देते हैं और अक्सर मेडिकली ग़लत होते हैं।',
        'छोटा और विनम्र जवाब दें: “मैं डॉक्टर के साथ PCOS पर काम कर रही हूँ। मेरा साथ दीजिए, मेरे वज़न का नहीं।”',
        'शादी से PCOS ठीक नहीं होता, और PCOS का मतलब यह नहीं कि बच्चे नहीं होंगे।',
        'अपना प्लान एक भरोसेमंद व्यक्ति के साथ शेयर करें। साथ मिलने से नियमितता बढ़ती है।',
      ],
    },
    tryToday: { en: 'Read the family reply scripts in the Care guide.', hi: 'केयर गाइड में परिवार के जवाब पढ़ें।' },
    href: '/council',
  },
  {
    id: 'w7-periods',
    week: 7,
    goals: ['regulate_periods', 'fertility'],
    title: { en: 'Missing periods: when to worry', hi: 'पीरियड न आना: कब चिंता करें' },
    body: {
      en: [
        'Cycles longer than 35 days, or fewer than 8 periods a year, are common with PCOS because ovulation skips.',
        'Going 3 months or more without a period is worth discussing with your doctor; very infrequent periods can affect the womb lining over time.',
        'Logging period start dates turns vague memories into clear data for your gynae.',
        'Many women see cycles become more regular after a few months of steady habits.',
      ],
      hi: [
        '35 दिन से लंबा चक्र, या साल में 8 से कम पीरियड, PCOS में आम हैं क्योंकि ओव्यूलेशन छूटता है।',
        '3 महीने या ज़्यादा पीरियड न आए तो डॉक्टर से ज़रूर बात करें; बहुत कम पीरियड लंबे समय में गर्भाशय की परत पर असर डाल सकते हैं।',
        'पीरियड शुरू होने की तारीख़ लॉग करने से धुंधली यादें गाइनी के लिए साफ़ डेटा बनती हैं।',
        'कुछ महीनों की नियमित आदतों के बाद कई महिलाओं के पीरियड ज़्यादा नियमित होते हैं।',
      ],
    },
    tryToday: { en: 'Log your last period start date.', hi: 'पिछले पीरियड की शुरुआत की तारीख़ लॉग करें।' },
    href: '/track',
  },
  {
    id: 'w7-fertility',
    week: 7,
    goals: ['fertility'],
    title: { en: 'Fertility with PCOS: the real facts', hi: 'PCOS के साथ फर्टिलिटी: असली तथ्य' },
    body: {
      en: [
        'PCOS is a leading cause of ovulation problems, and it is also very treatable. Many women with PCOS have children, some naturally, some with help.',
        'Lifestyle improvements, even modest weight loss when needed, can restore ovulation.',
        'If you need help, doctors have effective first-line medicines to trigger ovulation, and more options after that.',
        'Fertility is a couple’s journey: a semen analysis for the partner is part of a standard check.',
      ],
      hi: [
        'PCOS ओव्यूलेशन की समस्याओं का बड़ा कारण है, और इसका इलाज भी अच्छे से होता है। PCOS वाली कई महिलाओं के बच्चे होते हैं, कुछ के अपने-आप, कुछ के मदद से।',
        'लाइफ़स्टाइल में सुधार, ज़रूरत हो तो थोड़ा वज़न कम होना भी, ओव्यूलेशन वापस ला सकता है।',
        'मदद चाहिए तो डॉक्टरों के पास ओव्यूलेशन लाने की असरदार पहली दवाएँ हैं, और उसके बाद भी विकल्प हैं।',
        'फर्टिलिटी दोनों की यात्रा है: पार्टनर का सीमन एनालिसिस सामान्य जाँच का हिस्सा है।',
      ],
    },
    tryToday: { en: 'Open Trying to Conceive to see your window.', hi: 'ट्राइंग टू कंसीव खोलकर अपनी विंडो देखें।' },
    href: '/ttc',
  },
  {
    id: 'w7-specialist',
    week: 7,
    goals: ['fertility', 'regulate_periods'],
    title: { en: 'When to see a fertility specialist', hi: 'फर्टिलिटी विशेषज्ञ को कब दिखाएँ' },
    body: {
      en: [
        'Usual advice: see a specialist after 12 months of trying if you are under 35, or after 6 months if 35 or older.',
        'With irregular or absent periods, you don’t need to wait that long. Ask for an evaluation early.',
        'Bring your cycle history, labs and partner’s report; NariCare’s Doctor Kit puts it on one page.',
        'Avoid clinics that promise guaranteed results or push expensive packages on the first visit.',
      ],
      hi: [
        'सामान्य सलाह: 35 से कम उम्र में 12 महीने कोशिश के बाद, या 35 और ऊपर 6 महीने के बाद विशेषज्ञ दिखाएँ।',
        'पीरियड अनियमित या बंद हों तो इतना इंतज़ार ज़रूरी नहीं। जल्दी जाँच करवाएँ।',
        'साइकल हिस्ट्री, लैब और पार्टनर की रिपोर्ट ले जाएँ; NariCare की डॉक्टर किट सब एक पेज पर देती है।',
        'जो क्लिनिक पक्के नतीजों का वादा करें या पहली बार में महंगे पैकेज बेचें, उनसे बचें।',
      ],
    },
    tryToday: { en: 'Create your Doctor Kit PDF.', hi: 'अपनी डॉक्टर किट PDF बनाएँ।' },
    href: '/doctor-kit',
  },
  {
    id: 'w8-tests',
    week: 8,
    goals: ['wellness', 'lose_weight', 'regulate_periods'],
    title: { en: 'Tests to repeat every year', hi: 'हर साल दोहराने वाले टेस्ट' },
    body: {
      en: [
        'PCOS raises long-term risk of type 2 diabetes, high cholesterol and high blood pressure, even in slim women.',
        'Ask your doctor about a blood sugar test (often an oral glucose tolerance test or HbA1c), a lipid profile and a blood pressure check.',
        'How often depends on your risk; many doctors suggest every 1 to 3 years.',
        'Catching changes early means simple fixes instead of lifelong medicines.',
      ],
      hi: [
        'PCOS से टाइप 2 डायबिटीज़, ज़्यादा कोलेस्ट्रॉल और हाई BP का जोखिम लंबे समय में बढ़ता है, पतली महिलाओं में भी।',
        'डॉक्टर से ब्लड शुगर टेस्ट (अक्सर OGTT या HbA1c), लिपिड प्रोफ़ाइल और BP जाँच के बारे में पूछें।',
        'कितनी बार, यह आपके जोखिम पर निर्भर है; कई डॉक्टर 1 से 3 साल में सलाह देते हैं।',
        'जल्दी पकड़ने का मतलब है आसान सुधार, ज़िंदगी भर की दवा नहीं।',
      ],
    },
    tryToday: { en: 'Add your latest values to Lab decoder.', hi: 'लैब डिकोडर में अपनी ताज़ा वैल्यू डालें।' },
    href: '/labs',
  },
  {
    id: 'w8-ayurveda',
    week: 8,
    goals: ['wellness', 'skin_hair', 'regulate_periods'],
    title: { en: 'Ayurveda and supplements: a buyer’s guide', hi: 'आयुर्वेद और सप्लीमेंट: खरीदने से पहले' },
    body: {
      en: [
        'Most Indian women with PCOS try Ayurveda or supplements. Some have early evidence (like inositol and spearmint); most products have little.',
        'Before buying: check for an AYUSH or FSSAI licence, a full ingredient list and a real company address. Avoid “cures PCOS in 30 days” claims.',
        'Some herbal products have been found to contain heavy metals or hidden steroids. Buy from trusted sources.',
        'Never stop prescribed medicine for a supplement, and tell your doctor everything you take.',
      ],
      hi: [
        'PCOS वाली ज़्यादातर भारतीय महिलाएँ आयुर्वेद या सप्लीमेंट आज़माती हैं। कुछ पर शुरुआती सबूत हैं (जैसे इनोसिटॉल और पुदीना); ज़्यादातर पर बहुत कम।',
        'खरीदने से पहले: AYUSH या FSSAI लाइसेंस, पूरी सामग्री की सूची और असली कंपनी का पता देखें। “30 दिन में PCOS ठीक” जैसे दावों से बचें।',
        'कुछ हर्बल उत्पादों में भारी धातु या छिपे स्टेरॉयड मिले हैं। भरोसेमंद जगह से ही खरीदें।',
        'सप्लीमेंट के लिए डॉक्टर की दवा कभी न छोड़ें, और जो भी लें, डॉक्टर को बताएँ।',
      ],
    },
    tryToday: { en: 'Add what you take to your meds log.', hi: 'जो भी लेती हैं, मेड्स लॉग में जोड़ें।' },
    href: '/meds',
  },
  {
    id: 'w8-next',
    week: 8,
    goals: ['wellness', 'lose_weight', 'regulate_periods', 'fertility', 'skin_hair', 'manage_symptoms'],
    title: { en: 'Your plan after 8 weeks', hi: '8 हफ्तों के बाद आपका प्लान' },
    body: {
      en: [
        'PCOS is long term, but so are your new habits. Look back at your progress chart: what moved?',
        'Keep the 3 habits that helped most and drop what felt forced.',
        'Re-check skin, mood and labs every few months so you keep proof of what works.',
        'Take your Doctor Kit to your next appointment and plan the next 3 months together.',
      ],
      hi: [
        'PCOS लंबा चलता है, पर आपकी नई आदतें भी। अपना प्रोग्रेस चार्ट देखें: क्या बदला?',
        'जिन 3 आदतों से सबसे ज़्यादा मदद मिली उन्हें रखें, जो ज़बरदस्ती लगीं उन्हें छोड़ें।',
        'हर कुछ महीने त्वचा, मूड और लैब दोबारा जाँचें ताकि सबूत बना रहे।',
        'अगली अपॉइंटमेंट पर डॉक्टर किट ले जाएँ और अगले 3 महीने साथ में तय करें।',
      ],
    },
    tryToday: { en: 'Open your progress proof.', hi: 'अपना प्रोग्रेस प्रूफ़ खोलें।' },
    href: '/progress',
  },
];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

/** Week of the 8-week program, from the program start date. */
export function programWeek(startISO: string | null | undefined, now = new Date()): number {
  if (!startISO) return 1;
  const days = Math.floor((now.getTime() - new Date(startISO).getTime()) / 864e5);
  return Math.min(8, Math.max(1, Math.floor(days / 7) + 1));
}

/** Next unread lesson: current week first (goal matches first), then earlier unread, then the next week. */
export function nextLesson(week: number, done: string[], goals: string[]): Lesson | null {
  const unread = LESSONS.filter((l) => !done.includes(l.id) && l.week <= Math.min(8, week + 1));
  const rank = (l: Lesson) =>
    (l.week === week ? 0 : l.week < week ? 1 : 2) * 10 + (l.goals.some((g) => goals.includes(g)) ? 0 : 1);
  return unread.sort((a, b) => rank(a) - rank(b) || a.week - b.week)[0] ?? null;
}
