import type { Anchor, Pose, Prop, View } from '@/src/features/trainerRig';

export type MoveKind = 'cardio' | 'strength' | 'yoga' | 'stretch';
export type MovePart = 'legs' | 'glutes' | 'core' | 'upper' | 'full';

export type TrainerMove = {
  id: string;
  name: string;
  nameHi: string;
  kind: MoveKind;
  part: MovePart;
  eq: 'none' | 'dumbbell';
  level: 1 | 2;
  met: number;
  /** one side at a time: the player says "switch sides" halfway */
  uni?: boolean;
  impact?: boolean;
  /** safe with sore knees / heavier bodies */
  kneeSafe?: boolean;
  warmup?: boolean;
  /** only used in warm-ups, never as a main circuit move */
  warmupOnly?: boolean;
  cooldown?: boolean;
  group: string;
  view: View;
  anchor: Anchor;
  mat?: boolean;
  prop?: Prop;
  /** seconds for one full loop of the frames */
  tempo: number;
  frames: Pose[];
  steps: string[];
  stepsHi: string[];
  tip: string;
  tipHi: string;
  /** what this does for PCOS, shown in the library */
  why?: string;
  whyHi?: string;
};

// ---- base poses ----
const STAND: Pose = { t: -90, an: [96, 94], af: [84, 86], ln: [92, 90], lf: [88, 90] };
const FSTAND: Pose = { t: -90, an: [78, 86], af: [102, 94], ln: [86, 90], lf: [94, 90] };
const HIPS: Pick<Pose, 'an' | 'af'> = { an: [128, 52], af: [124, 56] };
const PLANK: Pose = { t: -17, h: -12, an: [92, 90], af: [88, 90], ln: [163, 163, 92], lf: [165, 165, 92] };
const QUAD: Pose = { t: -5, h: -12, an: [90, 90], af: [88, 90], ln: [92, 180, 180], lf: [90, 180, 180] };
const SUPINE_BENT: Pose = { t: 180, h: 180, an: [5, 2], af: [3, 0], ln: [-48, 62, 0], lf: [-50, 60, 0] };
const TABLE: Pose = { t: 180, h: 180, an: [-90, -90], af: [-88, -88], ln: [-88, 0, -60], lf: [-92, 2, -60] };
const PRONE: Pose = { t: 0, h: -6, an: [175, 10], af: [173, 12], ln: [180, 180, 180], lf: [180, 180, 180] };

export const MOVES: TrainerMove[] = [
  // ---------------- cardio ----------------
  {
    id: 'march', name: 'March in place', nameHi: 'एक जगह मार्च', kind: 'cardio', part: 'full', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, warmup: true, group: 'march', view: 'side', anchor: 'hip', tempo: 1.3,
    frames: [
      { t: -90, an: [118, 40], af: [62, -40], ln: [18, 92], lf: [90, 90] },
      { t: -90, an: [62, -40], af: [118, 40], ln: [90, 90], lf: [18, 92] },
    ],
    steps: ['Stand tall, core lightly tight.', 'Lift one knee to hip height, swing the opposite arm.', 'Switch legs in a steady rhythm.'],
    stepsHi: ['सीधे खड़े हों, पेट हल्का कसें।', 'एक घुटना कमर तक उठाएँ, उल्टा हाथ आगे।', 'लय में पैर बदलते रहें।'],
    tip: 'Land softly, no stomping.', tipHi: 'धीरे पैर रखें, धमक नहीं।',
  },
  {
    id: 'arm-circles', name: 'Arm circles', nameHi: 'हाथ घुमाना', kind: 'cardio', part: 'upper', eq: 'none', level: 1, met: 3,
    kneeSafe: true, warmup: true, warmupOnly: true, group: 'arm-circles', view: 'side', anchor: 'feet', tempo: 2.4,
    frames: [
      { ...STAND, an: [-90, -90], af: [-86, -86] },
      { ...STAND, an: [0, 0], af: [4, 4] },
      { ...STAND, an: [90, 90], af: [94, 94] },
      { ...STAND, an: [180, 180], af: [184, 184] },
    ],
    steps: ['Stand with feet hip-width apart.', 'Swing straight arms in big slow circles.', 'Halfway, reverse the direction.'],
    stepsHi: ['पैर कमर जितने खुले रखें।', 'सीधे हाथों से बड़े, धीमे गोले बनाएँ।', 'आधे समय बाद दिशा बदलें।'],
    tip: 'Keep shoulders away from your ears.', tipHi: 'कंधे कानों से दूर रखें।',
  },
  {
    id: 'step-jacks', name: 'Step jacks', nameHi: 'स्टेप जैक्स', kind: 'cardio', part: 'full', eq: 'none', level: 1, met: 4.5,
    kneeSafe: true, warmup: true, group: 'jacks', view: 'front', anchor: 'hip', tempo: 2.2,
    frames: [
      FSTAND,
      { t: -90, an: [-40, -70], af: [-140, -110], ln: [64, 74], lf: [94, 90] },
      FSTAND,
      { t: -90, an: [-40, -70], af: [-140, -110], ln: [86, 90], lf: [116, 106] },
    ],
    steps: ['Stand tall, arms by your sides.', 'Step one foot out while both arms sweep overhead.', 'Step back in, then go to the other side.'],
    stepsHi: ['सीधे खड़े हों, हाथ बगल में।', 'एक पैर बाहर रखें, दोनों हाथ ऊपर।', 'वापस आएँ, फिर दूसरी तरफ।'],
    tip: 'No-jump version of jumping jacks, kind to knees.', tipHi: 'बिना कूदे जंपिंग जैक, घुटनों के लिए आसान।',
    why: 'Raises heart rate without impact, good for insulin sensitivity.', whyHi: 'बिना झटके दिल की धड़कन बढ़ाता है, इंसुलिन के लिए अच्छा।',
  },
  {
    id: 'jumping-jacks', name: 'Jumping jacks', nameHi: 'जंपिंग जैक्स', kind: 'cardio', part: 'full', eq: 'none', level: 1, met: 7,
    impact: true, group: 'jacks', view: 'front', anchor: 'feet', tempo: 0.9,
    frames: [FSTAND, { t: -90, an: [-40, -70], af: [-140, -110], ln: [64, 70], lf: [116, 110] }],
    steps: ['Stand with feet together.', 'Jump feet wide while arms go overhead.', 'Jump back to start and keep a rhythm.'],
    stepsHi: ['पैर साथ रखकर खड़े हों।', 'कूदकर पैर फैलाएँ, हाथ ऊपर।', 'वापस आएँ और लय बनाए रखें।'],
    tip: 'Land on the balls of your feet.', tipHi: 'पंजों के बल नरमी से उतरें।',
  },
  {
    id: 'high-knees', name: 'High knees', nameHi: 'हाई नीज़', kind: 'cardio', part: 'full', eq: 'none', level: 2, met: 8,
    impact: true, group: 'high-knees', view: 'side', anchor: 'hip', tempo: 0.7,
    frames: [
      { t: -88, an: [122, 32], af: [58, -55], ln: [-12, 85], lf: [92, 90] },
      { t: -88, an: [58, -55], af: [122, 32], ln: [92, 90], lf: [-12, 85] },
    ],
    steps: ['Stand tall with arms bent.', 'Drive one knee up to hip height, pump the arms.', 'Switch quickly, staying on the balls of your feet.'],
    stepsHi: ['सीधे खड़े हों, कोहनी मोड़ें।', 'घुटना कमर तक ऊपर, हाथ चलाएँ।', 'तेज़ी से पैर बदलें, पंजों पर रहें।'],
    tip: 'Slow it to a march if you need a breather.', tipHi: 'साँस फूले तो मार्च पर आ जाएँ।',
  },
  {
    id: 'butt-kicks', name: 'Butt kicks', nameHi: 'बट किक्स', kind: 'cardio', part: 'legs', eq: 'none', level: 1, met: 7,
    impact: true, group: 'butt-kicks', view: 'side', anchor: 'hip', tempo: 0.8,
    frames: [
      { t: -86, an: [122, 32], af: [58, -55], ln: [100, -128, -150], lf: [90, 90] },
      { t: -86, an: [58, -55], af: [122, 32], ln: [90, 90], lf: [100, -128, -150] },
    ],
    steps: ['Jog on the spot.', 'Kick each heel up toward your glutes.', 'Keep your knees pointing down.'],
    stepsHi: ['एक जगह हल्की दौड़।', 'एड़ी को पीछे कूल्हों की ओर उछालें।', 'घुटने नीचे की ओर रखें।'],
    tip: 'Stay light and quick.', tipHi: 'हल्के और तेज़ रहें।',
  },
  {
    id: 'punches', name: 'Standing punches', nameHi: 'खड़े होकर पंच', kind: 'cardio', part: 'upper', eq: 'none', level: 1, met: 4.5,
    kneeSafe: true, warmup: true, group: 'punches', view: 'side', anchor: 'feet', tempo: 0.8,
    frames: [
      { t: -84, an: [0, 0], af: [112, -48], ln: [80, 95], lf: [100, 88] },
      { t: -84, an: [112, -48], af: [2, 0], ln: [80, 95], lf: [100, 88] },
    ],
    steps: ['Soft knees, fists by your chin.', 'Punch one arm forward, then pull it back.', 'Alternate fast while bracing your core.'],
    stepsHi: ['घुटने हल्के मुड़े, मुट्ठी ठुड्डी के पास।', 'एक हाथ से आगे पंच करें, वापस लाएँ।', 'तेज़ी से बदलें, पेट कसा रहे।'],
    tip: 'Great stress release on tough days.', tipHi: 'मुश्किल दिन पर तनाव निकालने के लिए बढ़िया।',
  },
  {
    id: 'squat-reach', name: 'Squat to reach', nameHi: 'स्क्वाट और ऊपर पहुँच', kind: 'cardio', part: 'full', eq: 'none', level: 1, met: 5,
    kneeSafe: true, warmup: true, group: 'squat-reach', view: 'side', anchor: 'feet', tempo: 2.2,
    frames: [
      { t: -55, h: -50, an: [12, 6], af: [14, 8], ln: [18, 112], lf: [20, 110] },
      { t: -92, h: -100, an: [-96, -96], af: [-90, -90], ln: [92, 90, 40], lf: [88, 90, 40] },
    ],
    steps: ['Sit back into a squat, arms forward.', 'Stand up and reach both arms to the sky.', 'Rise onto your toes at the top.'],
    stepsHi: ['पीछे बैठें, हाथ आगे।', 'उठें और दोनों हाथ आसमान की ओर।', 'ऊपर पंजों पर उठें।'],
    tip: 'Breathe out as you reach.', tipHi: 'ऊपर जाते समय साँस छोड़ें।',
  },
  {
    id: 'knee-to-elbow', name: 'Standing knee to elbow', nameHi: 'खड़े होकर घुटना-कोहनी', kind: 'cardio', part: 'core', eq: 'none', level: 1, met: 4.5,
    kneeSafe: true, uni: true, group: 'knee-to-elbow', view: 'side', anchor: 'footF', tempo: 1.4,
    frames: [
      { t: -92, h: -95, an: [-100, -96], af: [-94, -92], ln: [92, 90], lf: [88, 90] },
      { t: -66, h: -60, an: [74, -105], af: [70, -100], ln: [-8, 82], lf: [88, 90] },
    ],
    steps: ['Stand tall, arms overhead.', 'Pull one knee up as elbows come down to meet it.', 'Reach back up. Switch sides halfway.'],
    stepsHi: ['सीधे खड़े हों, हाथ ऊपर।', 'घुटना ऊपर, कोहनी नीचे लाकर मिलाएँ।', 'वापस ऊपर। आधे समय पर साइड बदलें।'],
    tip: 'Squeeze your belly as you crunch.', tipHi: 'क्रंच करते समय पेट कसें।',
  },
  {
    id: 'mountain-climbers', name: 'Mountain climbers', nameHi: 'माउंटेन क्लाइंबर', kind: 'cardio', part: 'core', eq: 'none', level: 2, met: 8,
    impact: true, group: 'mountain-climbers', view: 'side', anchor: 'hands', mat: true, tempo: 0.8,
    frames: [
      { ...PLANK, ln: [42, 158, 175], lf: [165, 165, 92] },
      { ...PLANK, ln: [163, 163, 92], lf: [44, 156, 175] },
    ],
    steps: ['Start in a high plank, hands under shoulders.', 'Drive one knee toward your chest.', 'Switch legs quickly, hips stay low.'],
    stepsHi: ['हाई प्लैंक में आएँ, हाथ कंधों के नीचे।', 'एक घुटना छाती की ओर लाएँ।', 'तेज़ी से बदलें, कूल्हे नीचे रहें।'],
    tip: 'Slow it down to make it easier.', tipHi: 'आसान करने के लिए धीमा करें।',
  },

  // ---------------- legs & glutes ----------------
  {
    id: 'squat', name: 'Bodyweight squat', nameHi: 'स्क्वाट', kind: 'strength', part: 'legs', eq: 'none', level: 1, met: 5,
    kneeSafe: true, group: 'squat', view: 'side', anchor: 'feet', tempo: 2.6,
    frames: [
      { ...STAND, an: [6, 2], af: [9, 5] },
      { t: -50, h: -45, an: [6, 2], af: [9, 5], ln: [14, 110], lf: [16, 108] },
    ],
    steps: ['Feet shoulder-width, arms forward.', 'Push hips back and bend knees like sitting on a chair.', 'Press through your heels to stand.'],
    stepsHi: ['पैर कंधों जितने खुले, हाथ आगे।', 'कूल्हे पीछे, जैसे कुर्सी पर बैठ रहे हों।', 'एड़ियों से ज़ोर देकर उठें।'],
    tip: 'Only go as low as feels good. Knees follow your toes.', tipHi: 'जितना आराम से हो उतना नीचे। घुटने पंजों की दिशा में।',
    why: 'Big leg muscles soak up blood sugar. The No.1 move for insulin resistance.', whyHi: 'पैरों की बड़ी मांसपेशियाँ ब्लड शुगर सोखती हैं। इंसुलिन रेज़िस्टेंस के लिए सबसे ज़रूरी।',
  },
  {
    id: 'sumo-squat', name: 'Sumo squat', nameHi: 'सूमो स्क्वाट', kind: 'strength', part: 'glutes', eq: 'none', level: 1, met: 5,
    group: 'squat', view: 'front', anchor: 'feet', tempo: 2.6,
    frames: [
      { t: -90, an: [100, -160], af: [80, -20], ln: [70, 84], lf: [110, 96] },
      { t: -90, an: [100, -160], af: [80, -20], ln: [32, 88], lf: [148, 92] },
    ],
    steps: ['Stand wide, toes turned out, hands together.', 'Bend knees out over toes and sink down.', 'Squeeze glutes to rise.'],
    stepsHi: ['पैर चौड़े, पंजे बाहर, हाथ जोड़ें।', 'घुटने पंजों की दिशा में मोड़कर नीचे जाएँ।', 'कूल्हे कसकर ऊपर आएँ।'],
    tip: 'Keep your chest lifted.', tipHi: 'छाती ऊपर रखें।',
  },
  {
    id: 'reverse-lunge', name: 'Reverse lunge', nameHi: 'रिवर्स लंज', kind: 'strength', part: 'legs', eq: 'none', level: 1, met: 5,
    uni: true, group: 'lunge', view: 'side', anchor: 'footN', tempo: 2.6,
    frames: [
      { ...STAND, ...HIPS },
      { t: -88, ...HIPS, ln: [8, 92], lf: [116, 175, 95] },
    ],
    steps: ['Stand tall, hands on hips.', 'Step one foot back and lower the back knee toward the floor.', 'Push through the front heel to return. Switch sides halfway.'],
    stepsHi: ['सीधे खड़े हों, हाथ कमर पर।', 'एक पैर पीछे, पिछला घुटना ज़मीन की ओर।', 'आगे की एड़ी से वापस आएँ। आधे समय पर साइड बदलें।'],
    tip: 'Hold a wall or chair for balance.', tipHi: 'संतुलन के लिए दीवार या कुर्सी पकड़ें।',
  },
  {
    id: 'glute-bridge', name: 'Glute bridge', nameHi: 'ग्लूट ब्रिज', kind: 'strength', part: 'glutes', eq: 'none', level: 1, met: 4,
    kneeSafe: true, group: 'bridge', view: 'side', anchor: 'neck', mat: true, tempo: 2.6,
    frames: [SUPINE_BENT, { t: 152, h: 175, an: [3, 0], af: [1, -2], ln: [-14, 75, 0], lf: [-16, 73, 0] }],
    steps: ['Lie on your back, knees bent, feet flat.', 'Squeeze your glutes and lift hips to a straight line.', 'Pause, then lower slowly.'],
    stepsHi: ['पीठ के बल लेटें, घुटने मोड़ें, पैर ज़मीन पर।', 'कूल्हे कसकर ऊपर उठाएँ, सीधी लाइन बने।', 'रुकें, फिर धीरे नीचे।'],
    tip: 'Push through your heels, not your toes.', tipHi: 'एड़ियों से ज़ोर दें, पंजों से नहीं।',
    why: 'Strong glutes support your back and burn more glucose at rest.', whyHi: 'मज़बूत ग्लूट्स कमर को सहारा देते हैं और आराम में भी ग्लूकोज़ जलाते हैं।',
  },
  {
    id: 'donkey-kicks', name: 'Donkey kicks', nameHi: 'डंकी किक्स', kind: 'strength', part: 'glutes', eq: 'none', level: 1, met: 4,
    kneeSafe: true, uni: true, group: 'donkey-kicks', view: 'side', anchor: 'hands', mat: true, tempo: 2,
    frames: [QUAD, { ...QUAD, ln: [178, -96, -150] }],
    steps: ['On hands and knees, back flat.', 'Keeping the knee bent, lift one foot toward the ceiling.', 'Lower with control. Switch sides halfway.'],
    stepsHi: ['हाथों और घुटनों पर, पीठ सीधी।', 'घुटना मोड़े हुए, एक पैर छत की ओर उठाएँ।', 'धीरे नीचे। आधे समय पर साइड बदलें।'],
    tip: 'Don’t arch your lower back.', tipHi: 'कमर को नीचे न झुकाएँ।',
  },
  {
    id: 'side-leg-raise', name: 'Side-lying leg raise', nameHi: 'करवट लेकर पैर उठाना', kind: 'strength', part: 'glutes', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, uni: true, group: 'abduction', view: 'front', anchor: 'hip', mat: true, tempo: 2,
    frames: [
      { t: 180, h: 186, an: [20, 70], af: [196, -60], ln: [4, 2], lf: [0, 0] },
      { t: 180, h: 186, an: [20, 70], af: [196, -60], ln: [-32, -32], lf: [0, 0] },
    ],
    steps: ['Lie on your side, head resting on your arm.', 'Lift the top leg up, toes facing forward.', 'Lower slowly. Switch sides halfway.'],
    stepsHi: ['करवट लेकर लेटें, सिर हाथ पर।', 'ऊपर वाला पैर उठाएँ, पंजे आगे।', 'धीरे नीचे। आधे समय पर साइड बदलें।'],
    tip: 'Small and slow beats high and swinging.', tipHi: 'छोटा और धीमा, ऊँचा और झटकेदार से बेहतर।',
  },
  {
    id: 'calf-raise', name: 'Calf raises', nameHi: 'काफ रेज़', kind: 'strength', part: 'legs', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, group: 'calf', view: 'side', anchor: 'feet', tempo: 1.8,
    frames: [{ ...STAND, ...HIPS, ln: [92, 90, 0], lf: [88, 90, 0] }, { ...STAND, ...HIPS, ln: [92, 90, 52], lf: [88, 90, 52] }],
    steps: ['Stand tall, hands on hips or a wall.', 'Rise up onto your toes.', 'Lower your heels slowly.'],
    stepsHi: ['सीधे खड़े हों, हाथ कमर या दीवार पर।', 'पंजों पर ऊपर उठें।', 'एड़ियाँ धीरे नीचे लाएँ।'],
    tip: 'Pause one second at the top.', tipHi: 'ऊपर एक सेकंड रुकें।',
  },
  {
    id: 'good-morning', name: 'Good morning', nameHi: 'गुड मॉर्निंग', kind: 'strength', part: 'glutes', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, group: 'hinge', view: 'side', anchor: 'feet', tempo: 2.6,
    frames: [
      { t: -90, an: [70, -122], af: [74, -126], ln: [92, 90], lf: [88, 90] },
      { t: -20, h: -14, an: [140, -52], af: [144, -56], ln: [98, 84], lf: [94, 84] },
    ],
    steps: ['Stand with soft knees, arms crossed on chest.', 'Hinge at the hips, sending them back with a flat back.', 'Squeeze glutes to stand tall.'],
    stepsHi: ['घुटने हल्के मुड़े, हाथ छाती पर।', 'कूल्हे पीछे भेजते हुए आगे झुकें, पीठ सीधी।', 'कूल्हे कसकर सीधे खड़े हों।'],
    tip: 'Feel it in the back of your thighs.', tipHi: 'जांघों के पीछे खिंचाव महसूस करें।',
  },

  // ---------------- core ----------------
  {
    id: 'plank', name: 'Forearm plank', nameHi: 'फोरआर्म प्लैंक', kind: 'strength', part: 'core', eq: 'none', level: 1, met: 3.8,
    kneeSafe: true, group: 'plank', view: 'side', anchor: 'hands', mat: true, tempo: 4,
    frames: [
      { t: -8, h: -4, an: [90, 0], af: [88, 2], ln: [172, 172, 92], lf: [174, 174, 92] },
      { t: -9, h: -6, b: 1, an: [90, 0], af: [88, 2], ln: [171, 171, 92], lf: [173, 173, 92] },
    ],
    steps: ['Elbows under shoulders, forearms on the mat.', 'Lift your body into one straight line.', 'Breathe steadily and hold.'],
    stepsHi: ['कोहनी कंधों के नीचे, बाँहें मैट पर।', 'शरीर को एक सीधी लाइन में उठाएँ।', 'आराम से साँस लेते हुए रुकें।'],
    tip: 'Drop to your knees anytime.', tipHi: 'कभी भी घुटनों पर आ सकती हैं।',
  },
  {
    id: 'dead-bug', name: 'Dead bug', nameHi: 'डेड बग', kind: 'strength', part: 'core', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, group: 'dead-bug', view: 'side', anchor: 'hip', mat: true, tempo: 3,
    frames: [
      TABLE,
      { ...TABLE, an: [-168, -172], lf: [-14, -10, -70] },
      TABLE,
      { ...TABLE, af: [-166, -170], ln: [-12, -8, -70] },
    ],
    steps: ['Lie on your back, arms up, knees over hips.', 'Lower one arm overhead and the opposite leg out.', 'Return and switch sides, back pressed down.'],
    stepsHi: ['पीठ के बल, हाथ ऊपर, घुटने कूल्हों के ऊपर।', 'एक हाथ पीछे, उल्टा पैर आगे सीधा।', 'वापस आएँ और बदलें, कमर ज़मीन पर।'],
    tip: 'Go slow. Lower back stays glued to the mat.', tipHi: 'धीरे करें। कमर मैट से चिपकी रहे।',
  },
  {
    id: 'crunch', name: 'Crunch', nameHi: 'क्रंच', kind: 'strength', part: 'core', eq: 'none', level: 1, met: 3.8,
    kneeSafe: true, group: 'crunch', view: 'side', anchor: 'hip', mat: true, tempo: 2.2,
    frames: [SUPINE_BENT, { ...SUPINE_BENT, t: -154, h: -140, an: [-22, -16], af: [-20, -14] }],
    steps: ['Lie back, knees bent, arms long.', 'Curl your head and shoulders up, reaching to your knees.', 'Lower slowly.'],
    stepsHi: ['पीठ के बल, घुटने मुड़े, हाथ सीधे।', 'सिर और कंधे ऊपर उठाकर घुटनों की ओर।', 'धीरे नीचे।'],
    tip: 'Look at the ceiling, not your knees.', tipHi: 'घुटनों की बजाय छत की ओर देखें।',
  },
  {
    id: 'leg-raise', name: 'Lying leg raise', nameHi: 'लेटकर पैर उठाना', kind: 'strength', part: 'core', eq: 'none', level: 2, met: 3.8,
    kneeSafe: true, group: 'leg-raise', view: 'side', anchor: 'hip', mat: true, tempo: 2.8,
    frames: [
      { t: 180, h: 180, an: [5, 2], af: [3, 0], ln: [-4, -3, -70], lf: [-2, -1, -70] },
      { t: 180, h: 180, an: [5, 2], af: [3, 0], ln: [-88, -88, 0], lf: [-86, -86, 0] },
    ],
    steps: ['Lie flat, hands by your sides.', 'Keep legs straight and lift them up.', 'Lower slowly without touching the floor.'],
    stepsHi: ['सीधे लेटें, हाथ बगल में।', 'पैर सीधे रखकर ऊपर उठाएँ।', 'धीरे नीचे, ज़मीन छुए बिना।'],
    tip: 'Bend your knees to make it easier.', tipHi: 'आसान करने के लिए घुटने मोड़ें।',
  },
  {
    id: 'bicycle', name: 'Bicycle crunch', nameHi: 'साइकिल क्रंच', kind: 'strength', part: 'core', eq: 'none', level: 2, met: 4.5,
    kneeSafe: true, group: 'crunch', view: 'side', anchor: 'hip', mat: true, tempo: 1.6,
    frames: [
      { t: -156, h: -140, an: [-50, -150], af: [-46, -146], ln: [-72, 16, -60], lf: [-12, -10, -70] },
      { t: -156, h: -140, an: [-50, -150], af: [-46, -146], ln: [-12, -10, -70], lf: [-72, 16, -60] },
    ],
    steps: ['Lie back, hands behind your head, shoulders lifted.', 'Bring one knee in as the other leg extends.', 'Pedal slowly, twisting toward the bent knee.'],
    stepsHi: ['पीठ के बल, हाथ सिर के पीछे, कंधे उठे।', 'एक घुटना अंदर, दूसरा पैर सीधा।', 'धीरे साइकिल चलाएँ, मुड़े घुटने की ओर घूमें।'],
    tip: 'Don’t pull on your neck.', tipHi: 'गर्दन को न खींचें।',
  },
  {
    id: 'toe-taps', name: 'Toe taps', nameHi: 'टो टैप्स', kind: 'strength', part: 'core', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, group: 'toe-taps', view: 'side', anchor: 'hip', mat: true, tempo: 2.4,
    frames: [
      { ...TABLE, an: [5, 2], af: [3, 0] },
      { ...TABLE, an: [5, 2], af: [3, 0], ln: [-38, 52, 0] },
      { ...TABLE, an: [5, 2], af: [3, 0] },
      { ...TABLE, an: [5, 2], af: [3, 0], lf: [-40, 50, 0] },
    ],
    steps: ['Lie back, knees bent over hips.', 'Lower one foot to tap the floor.', 'Bring it back up and switch.'],
    stepsHi: ['पीठ के बल, घुटने कूल्हों के ऊपर।', 'एक पैर नीचे लाकर ज़मीन छुएँ।', 'वापस ऊपर और बदलें।'],
    tip: 'Keep your back flat on the mat.', tipHi: 'पीठ मैट पर सपाट रखें।',
  },
  {
    id: 'flutter-kicks', name: 'Flutter kicks', nameHi: 'फ्लटर किक्स', kind: 'strength', part: 'core', eq: 'none', level: 2, met: 4,
    kneeSafe: true, group: 'leg-raise', view: 'side', anchor: 'hip', mat: true, tempo: 0.8,
    frames: [
      { t: 180, h: 180, an: [5, 2], af: [3, 0], ln: [-26, -26, -60], lf: [-10, -10, -70] },
      { t: 180, h: 180, an: [5, 2], af: [3, 0], ln: [-10, -10, -70], lf: [-26, -26, -60] },
    ],
    steps: ['Lie back, legs straight and lifted a little.', 'Kick legs up and down in small fast moves.', 'Keep your lower back down.'],
    stepsHi: ['पीठ के बल, पैर सीधे और थोड़े ऊपर।', 'पैर छोटे, तेज़ ऊपर-नीचे चलाएँ।', 'कमर नीचे रखें।'],
    tip: 'Hands under your hips help.', tipHi: 'हाथ कूल्हों के नीचे रखने से मदद मिलती है।',
  },
  {
    id: 'bird-dog', name: 'Bird dog', nameHi: 'बर्ड डॉग', kind: 'strength', part: 'core', eq: 'none', level: 1, met: 3,
    kneeSafe: true, group: 'bird-dog', view: 'side', anchor: 'knees', mat: true, tempo: 4,
    frames: [
      QUAD,
      { ...QUAD, an: [-6, -6], lf: [176, 176, 180] },
      QUAD,
      { ...QUAD, af: [-8, -8], ln: [178, 178, 180] },
    ],
    steps: ['On hands and knees, back flat.', 'Reach one arm forward and the opposite leg back.', 'Return and switch sides.'],
    stepsHi: ['हाथों और घुटनों पर, पीठ सीधी।', 'एक हाथ आगे, उल्टा पैर पीछे सीधा।', 'वापस आएँ और बदलें।'],
    tip: 'Imagine a cup of chai on your back.', tipHi: 'सोचें पीठ पर चाय का कप रखा है।',
  },
  {
    id: 'side-plank', name: 'Side plank', nameHi: 'साइड प्लैंक', kind: 'strength', part: 'core', eq: 'none', level: 2, met: 3.8,
    uni: true, group: 'side-plank', view: 'front', anchor: 'hands', mat: true, tempo: 4,
    frames: [
      { t: -157, h: -160, an: [-90, -90], af: [90, 90], ln: [23, 23, 23], lf: [23, 23, 23] },
      { t: -159, h: -162, an: [-96, -96], af: [90, 90], ln: [22, 22, 22], lf: [22, 22, 22] },
    ],
    steps: ['Lie on your side, hand under shoulder.', 'Lift hips into a straight line, top arm up.', 'Hold, then switch sides halfway.'],
    stepsHi: ['करवट लेकर, हाथ कंधे के नीचे।', 'कूल्हे उठाकर सीधी लाइन, ऊपर वाला हाथ ऊपर।', 'रुकें, आधे समय पर साइड बदलें।'],
    tip: 'Rest the bottom knee down to make it easier.', tipHi: 'नीचे का घुटना ज़मीन पर रखकर आसान करें।',
  },
  {
    id: 'oblique-crunch', name: 'Standing side crunch', nameHi: 'खड़े होकर साइड क्रंच', kind: 'strength', part: 'core', eq: 'none', level: 1, met: 4,
    kneeSafe: true, uni: true, group: 'oblique', view: 'front', anchor: 'footF', tempo: 1.6,
    frames: [
      { t: -90, an: [-28, -150], af: [-152, -30], ln: [86, 90], lf: [94, 90] },
      { t: -68, an: [-8, -128], af: [-132, -8], ln: [8, 96], lf: [94, 90] },
    ],
    steps: ['Stand tall, hands behind your head.', 'Lift one knee out to the side as your elbow comes down to it.', 'Return. Switch sides halfway.'],
    stepsHi: ['सीधे खड़े हों, हाथ सिर के पीछे।', 'एक घुटना साइड से उठाएँ, कोहनी उस तक लाएँ।', 'वापस। आधे समय पर साइड बदलें।'],
    tip: 'Squeeze your waist, not your neck.', tipHi: 'कमर कसें, गर्दन नहीं।',
  },

  // ---------------- upper body ----------------
  {
    id: 'wall-push-up', name: 'Wall push-up', nameHi: 'दीवार पुश-अप', kind: 'strength', part: 'upper', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, group: 'push-up', view: 'side', anchor: 'hands', prop: 'wall', tempo: 2.4,
    frames: [
      { t: -68, h: -68, an: [-12, -12], af: [-10, -10], ln: [112, 112, 0], lf: [110, 110, 0] },
      { t: -54, h: -54, an: [70, -40], af: [72, -38], ln: [126, 126, 0], lf: [124, 124, 0] },
    ],
    steps: ['Stand an arm’s length from a wall, palms on it at chest height.', 'Bend elbows and bring your chest toward the wall.', 'Push back to straight arms.'],
    stepsHi: ['दीवार से एक हाथ की दूरी पर, हथेलियाँ छाती की ऊँचाई पर।', 'कोहनी मोड़कर छाती दीवार की ओर।', 'वापस हाथ सीधे करें।'],
    tip: 'Step further back to make it harder.', tipHi: 'कठिन करने के लिए और पीछे खड़े हों।',
  },
  {
    id: 'knee-push-up', name: 'Knee push-up', nameHi: 'घुटनों पर पुश-अप', kind: 'strength', part: 'upper', eq: 'none', level: 1, met: 3.8,
    group: 'push-up', view: 'side', anchor: 'hands', mat: true, tempo: 2.4,
    frames: [
      { t: -32, h: -26, an: [92, 90], af: [88, 90], ln: [148, 190, 190], lf: [150, 190, 190] },
      { t: -10, h: -6, an: [150, 52], af: [148, 54], ln: [170, 192, 192], lf: [172, 192, 192] },
    ],
    steps: ['Hands under shoulders, knees on the mat.', 'Lower your chest toward the floor, body straight.', 'Press back up.'],
    stepsHi: ['हाथ कंधों के नीचे, घुटने मैट पर।', 'शरीर सीधा रखकर छाती नीचे लाएँ।', 'वापस ऊपर धकेलें।'],
    tip: 'Elbows point back, not out.', tipHi: 'कोहनी पीछे की ओर, बाहर नहीं।',
  },
  {
    id: 'push-up', name: 'Push-up', nameHi: 'पुश-अप', kind: 'strength', part: 'upper', eq: 'none', level: 2, met: 4.5,
    kneeSafe: true, group: 'push-up', view: 'side', anchor: 'hands', mat: true, tempo: 2.4,
    frames: [PLANK, { t: -5, h: -2, an: [150, 52], af: [148, 54], ln: [175, 175, 92], lf: [177, 177, 92] }],
    steps: ['High plank, hands under shoulders.', 'Lower your whole body as one line.', 'Press back up.'],
    stepsHi: ['हाई प्लैंक, हाथ कंधों के नीचे।', 'पूरा शरीर एक लाइन में नीचे लाएँ।', 'वापस ऊपर।'],
    tip: 'Switch to knees when form slips.', tipHi: 'फॉर्म बिगड़े तो घुटनों पर आएँ।',
  },
  {
    id: 'superman', name: 'Superman', nameHi: 'सुपरमैन', kind: 'strength', part: 'upper', eq: 'none', level: 1, met: 3.5,
    kneeSafe: true, group: 'superman', view: 'side', anchor: 'hip', mat: true, tempo: 2.6,
    frames: [
      { t: 0, h: -4, an: [0, 0], af: [2, 2], ln: [180, 180, 180], lf: [180, 180, 180] },
      { t: -14, h: -24, b: -3, an: [-16, -16], af: [-14, -14], ln: [-170, -170, -170], lf: [-172, -172, -172] },
    ],
    steps: ['Lie face down, arms stretched forward.', 'Lift arms, chest and legs a little off the floor.', 'Hold a second, then lower.'],
    stepsHi: ['पेट के बल लेटें, हाथ आगे।', 'हाथ, छाती और पैर थोड़ा ऊपर उठाएँ।', 'एक सेकंड रुकें, फिर नीचे।'],
    tip: 'Look at the floor to keep your neck long.', tipHi: 'गर्दन सीधी रखने के लिए नीचे देखें।',
  },

  // ---------------- dumbbells ----------------
  {
    id: 'db-curl', name: 'Dumbbell curl', nameHi: 'डम्बल कर्ल', kind: 'strength', part: 'upper', eq: 'dumbbell', level: 1, met: 3.5,
    kneeSafe: true, group: 'curl', view: 'side', anchor: 'feet', prop: 'dumbbells', tempo: 2.2,
    frames: [{ ...STAND, an: [92, 92], af: [88, 90] }, { ...STAND, an: [92, -80], af: [88, -76] }],
    steps: ['Stand tall, dumbbells by your sides.', 'Curl them up, elbows fixed at your waist.', 'Lower slowly.'],
    stepsHi: ['सीधे खड़े हों, डम्बल बगल में।', 'कोहनी कमर पर टिकाकर ऊपर मोड़ें।', 'धीरे नीचे।'],
    tip: 'Water bottles work too.', tipHi: 'पानी की बोतलें भी चलेंगी।',
  },
  {
    id: 'db-press', name: 'Shoulder press', nameHi: 'शोल्डर प्रेस', kind: 'strength', part: 'upper', eq: 'dumbbell', level: 1, met: 4,
    kneeSafe: true, group: 'press', view: 'front', anchor: 'feet', prop: 'dumbbells', tempo: 2.4,
    frames: [
      { t: -90, an: [8, -88], af: [172, -92], ln: [86, 90], lf: [94, 90] },
      { t: -90, an: [-72, -84], af: [-108, -96], ln: [86, 90], lf: [94, 90] },
    ],
    steps: ['Dumbbells at shoulder height, elbows out.', 'Press them overhead.', 'Lower back to shoulders.'],
    stepsHi: ['डम्बल कंधों पर, कोहनी बाहर।', 'सिर के ऊपर दबाएँ।', 'वापस कंधों पर।'],
    tip: 'Don’t arch your back.', tipHi: 'कमर न मोड़ें।',
  },
  {
    id: 'db-row', name: 'Bent-over row', nameHi: 'बेंट-ओवर रो', kind: 'strength', part: 'upper', eq: 'dumbbell', level: 1, met: 4,
    kneeSafe: true, group: 'row', view: 'side', anchor: 'feet', prop: 'dumbbells', tempo: 2.4,
    frames: [
      { t: -28, h: -20, an: [90, 90], af: [88, 90], ln: [100, 84], lf: [96, 84] },
      { t: -28, h: -20, an: [176, 98], af: [174, 96], ln: [100, 84], lf: [96, 84] },
    ],
    steps: ['Hinge forward with a flat back, arms hanging.', 'Pull the dumbbells to your waist.', 'Lower slowly.'],
    stepsHi: ['पीठ सीधी रखकर आगे झुकें, हाथ लटके।', 'डम्बल कमर तक खींचें।', 'धीरे नीचे।'],
    tip: 'Squeeze your shoulder blades together.', tipHi: 'कंधों के पीछे की हड्डियाँ पास लाएँ।',
  },
  {
    id: 'db-lateral', name: 'Lateral raise', nameHi: 'लैटरल रेज़', kind: 'strength', part: 'upper', eq: 'dumbbell', level: 1, met: 3.5,
    kneeSafe: true, group: 'lateral', view: 'front', anchor: 'feet', prop: 'dumbbells', tempo: 2.4,
    frames: [{ t: -90, an: [80, 86], af: [100, 94], ln: [86, 90], lf: [94, 90] }, { t: -90, an: [2, 6], af: [178, 174], ln: [86, 90], lf: [94, 90] }],
    steps: ['Stand with dumbbells by your sides.', 'Raise arms out to shoulder height.', 'Lower with control.'],
    stepsHi: ['डम्बल बगल में लेकर खड़े हों।', 'हाथ बाहर कंधों तक उठाएँ।', 'धीरे नीचे।'],
    tip: 'Light weight, slow tempo.', tipHi: 'हल्का वज़न, धीमी गति।',
  },
  {
    id: 'db-goblet-squat', name: 'Goblet squat', nameHi: 'गॉब्लेट स्क्वाट', kind: 'strength', part: 'legs', eq: 'dumbbell', level: 1, met: 5.5,
    group: 'squat', view: 'side', anchor: 'feet', prop: 'dumbbells', tempo: 2.6,
    frames: [
      { ...STAND, an: [72, -118], af: [70, -116] },
      { t: -52, h: -46, an: [110, -80], af: [108, -78], ln: [14, 110], lf: [16, 108] },
    ],
    steps: ['Hold a dumbbell at your chest.', 'Sit down between your knees.', 'Drive up through your heels.'],
    stepsHi: ['डम्बल छाती पर पकड़ें।', 'घुटनों के बीच नीचे बैठें।', 'एड़ियों से ज़ोर देकर उठें।'],
    tip: 'Elbows brush the inside of your knees.', tipHi: 'कोहनी घुटनों के अंदर छुए।',
  },
  {
    id: 'db-deadlift', name: 'Dumbbell deadlift', nameHi: 'डम्बल डेडलिफ्ट', kind: 'strength', part: 'glutes', eq: 'dumbbell', level: 1, met: 5,
    kneeSafe: true, group: 'hinge', view: 'side', anchor: 'feet', prop: 'dumbbells', tempo: 2.8,
    frames: [{ ...STAND, an: [92, 92], af: [88, 90] }, { t: -14, h: -8, an: [92, 92], af: [88, 90], ln: [102, 84], lf: [98, 84] }],
    steps: ['Dumbbells in front of thighs.', 'Push hips back and slide them down your legs.', 'Squeeze glutes to stand.'],
    stepsHi: ['डम्बल जांघों के सामने।', 'कूल्हे पीछे, डम्बल पैरों के साथ नीचे।', 'कूल्हे कसकर सीधे हों।'],
    tip: 'Back flat, never rounded.', tipHi: 'पीठ सीधी, कभी गोल नहीं।',
  },

  // ---------------- yoga ----------------
  {
    id: 'tadasana', name: 'Mountain breath (Tadasana)', nameHi: 'ताड़ासन श्वास', kind: 'yoga', part: 'full', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, warmup: true, group: 'tadasana', view: 'front', anchor: 'feet', tempo: 8,
    frames: [FSTAND, { t: -90, h: -90, an: [-80, -84], af: [-100, -96], ln: [86, 90], lf: [94, 90] }],
    steps: ['Stand tall, feet together.', 'Inhale, sweep arms overhead.', 'Exhale, lower them slowly.'],
    stepsHi: ['पैर साथ, सीधे खड़े हों।', 'साँस लेते हुए हाथ ऊपर।', 'साँस छोड़ते हुए धीरे नीचे।'],
    tip: 'Four counts in, four counts out.', tipHi: 'चार गिनती साँस अंदर, चार बाहर।',
  },
  {
    id: 'tree', name: 'Tree pose (Vrikshasana)', nameHi: 'वृक्षासन', kind: 'yoga', part: 'legs', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, uni: true, group: 'tree', view: 'front', anchor: 'footF', tempo: 6,
    frames: [
      { t: -90, an: [-98, -102], af: [-82, -78], ln: [40, 162, 120], lf: [92, 90] },
      { t: -90, an: [-96, -100], af: [-84, -80], ln: [40, 162, 120], lf: [92, 90] },
    ],
    steps: ['Stand on one leg, place the other foot on your inner calf or thigh.', 'Bring palms together overhead.', 'Fix your gaze and breathe. Switch halfway.'],
    stepsHi: ['एक पैर पर खड़े हों, दूसरा पैर अंदर की पिंडली या जांघ पर।', 'हथेलियाँ सिर के ऊपर जोड़ें।', 'एक बिंदु देखें और साँस लें। आधे पर बदलें।'],
    tip: 'Never place your foot on the knee.', tipHi: 'पैर घुटने पर कभी न रखें।',
  },
  {
    id: 'warrior-2', name: 'Warrior II (Virabhadrasana)', nameHi: 'वीरभद्रासन 2', kind: 'yoga', part: 'legs', eq: 'none', level: 1, met: 3,
    uni: true, group: 'warrior', view: 'front', anchor: 'feet', tempo: 6,
    frames: [
      { t: -90, an: [0, 0], af: [180, 180], ln: [35, 88], lf: [128, 128] },
      { t: -90, an: [-2, -2], af: [182, 182], ln: [33, 88], lf: [128, 128] },
    ],
    steps: ['Step feet wide, front knee bent over the ankle.', 'Stretch arms out at shoulder height.', 'Gaze over the front hand. Switch halfway.'],
    stepsHi: ['पैर चौड़े, आगे का घुटना टखने के ऊपर।', 'हाथ कंधों की ऊँचाई पर फैलाएँ।', 'आगे के हाथ की ओर देखें। आधे पर बदलें।'],
    tip: 'Sink lower to make it stronger.', tipHi: 'ज़्यादा ताकत के लिए और नीचे आएँ।',
  },
  {
    id: 'warrior-1', name: 'Warrior I', nameHi: 'वीरभद्रासन 1', kind: 'yoga', part: 'legs', eq: 'none', level: 1, met: 3,
    uni: true, group: 'warrior', view: 'side', anchor: 'feet', tempo: 6,
    frames: [
      { t: -88, h: -96, an: [-96, -94], af: [-90, -90], ln: [15, 88], lf: [140, 140, 170] },
      { t: -90, h: -98, an: [-98, -96], af: [-92, -92], ln: [17, 88], lf: [140, 140, 170] },
    ],
    steps: ['Step one foot back, front knee bent.', 'Square your hips forward, arms overhead.', 'Breathe deeply. Switch halfway.'],
    stepsHi: ['एक पैर पीछे, आगे का घुटना मुड़ा।', 'कूल्हे सामने, हाथ ऊपर।', 'गहरी साँस। आधे पर बदलें।'],
    tip: 'Shorten your stance if it feels wobbly.', tipHi: 'डगमगाए तो पैरों की दूरी कम करें।',
  },
  {
    id: 'triangle', name: 'Triangle (Trikonasana)', nameHi: 'त्रिकोणासन', kind: 'yoga', part: 'core', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, uni: true, group: 'triangle', view: 'front', anchor: 'feet', tempo: 6,
    frames: [
      { t: -18, h: -24, an: [97, 97], af: [-86, -86], ln: [60, 60], lf: [120, 120] },
      { t: -20, h: -26, an: [98, 98], af: [-88, -88], ln: [60, 60], lf: [120, 120] },
    ],
    steps: ['Legs wide and straight.', 'Reach sideways, bring one hand to your shin.', 'Lift the other arm up. Switch halfway.'],
    stepsHi: ['पैर चौड़े और सीधे।', 'साइड में झुककर एक हाथ पिंडली पर।', 'दूसरा हाथ ऊपर। आधे पर बदलें।'],
    tip: 'Hand on the shin, never the knee.', tipHi: 'हाथ पिंडली पर, घुटने पर नहीं।',
  },
  {
    id: 'chair', name: 'Chair pose (Utkatasana)', nameHi: 'उत्कटासन', kind: 'yoga', part: 'legs', eq: 'none', level: 1, met: 3.5,
    group: 'chair', view: 'side', anchor: 'feet', tempo: 5,
    frames: [
      { t: -60, h: -66, an: [-62, -62], af: [-60, -60], ln: [35, 115], lf: [37, 113] },
      { t: -62, h: -68, an: [-66, -66], af: [-64, -64], ln: [33, 115], lf: [35, 113] },
    ],
    steps: ['Feet together, bend knees as if sitting back.', 'Raise arms alongside your ears.', 'Hold and breathe.'],
    stepsHi: ['पैर साथ, घुटने मोड़कर पीछे बैठें।', 'हाथ कानों के साथ ऊपर।', 'रुकें और साँस लें।'],
    tip: 'Weight in your heels.', tipHi: 'वज़न एड़ियों पर।',
  },
  {
    id: 'goddess', name: 'Goddess pose', nameHi: 'देवी आसन', kind: 'yoga', part: 'glutes', eq: 'none', level: 1, met: 3,
    group: 'goddess', view: 'front', anchor: 'feet', tempo: 5,
    frames: [
      { t: -90, an: [0, -90], af: [180, -90], ln: [28, 86], lf: [152, 94] },
      { t: -90, an: [-4, -92], af: [184, -88], ln: [24, 86], lf: [156, 94] },
    ],
    steps: ['Stand wide, toes out.', 'Bend knees deep, arms in a cactus shape.', 'Hold and breathe into your hips.'],
    stepsHi: ['पैर चौड़े, पंजे बाहर।', 'घुटने मोड़ें, हाथ कैक्टस आकार में।', 'रुकें, कूल्हों में साँस भरें।'],
    tip: 'Opens the hips and pelvis.', tipHi: 'कूल्हे और पेल्विस खोलता है।',
  },
  {
    id: 'cat-cow', name: 'Cat-cow (Marjaryasana)', nameHi: 'मार्जरी आसन', kind: 'yoga', part: 'core', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, warmup: true, cooldown: true, group: 'cat-cow', view: 'side', anchor: 'knees', mat: true, tempo: 6,
    frames: [{ ...QUAD, b: 12, h: 62 }, { ...QUAD, b: -9, h: -38 }],
    steps: ['On hands and knees.', 'Exhale, round your back and tuck your chin.', 'Inhale, drop your belly and lift your chest.'],
    stepsHi: ['हाथों और घुटनों पर।', 'साँस छोड़ें, पीठ गोल, ठुड्डी अंदर।', 'साँस लें, पेट नीचे, छाती ऊपर।'],
    tip: 'Let your breath set the pace.', tipHi: 'साँस के साथ गति रखें।',
    why: 'Eases period cramps and lower-back tightness.', whyHi: 'पीरियड ऐंठन और कमर की जकड़न में राहत।',
  },
  {
    id: 'childs-pose', name: 'Child’s pose (Balasana)', nameHi: 'बालासन', kind: 'stretch', part: 'full', eq: 'none', level: 1, met: 2,
    cooldown: true, group: 'childs-pose', view: 'side', anchor: 'knees', mat: true, tempo: 7,
    frames: [
      { t: 14, h: 32, b: 8, an: [8, 2], af: [6, 0], ln: [20, 182, 180], lf: [22, 182, 180] },
      { t: 11, h: 28, b: 9, an: [6, 0], af: [4, -2], ln: [20, 182, 180], lf: [22, 182, 180] },
    ],
    steps: ['Kneel and sit back on your heels.', 'Fold forward, forehead to the mat.', 'Arms long, breathe into your back.'],
    stepsHi: ['घुटनों के बल बैठें, एड़ियों पर।', 'आगे झुकें, माथा मैट पर।', 'हाथ आगे, पीठ में साँस भरें।'],
    tip: 'Knees wide if your belly feels squashed.', tipHi: 'पेट दबे तो घुटने चौड़े करें।',
  },
  {
    id: 'cobra', name: 'Cobra (Bhujangasana)', nameHi: 'भुजंगासन', kind: 'yoga', part: 'upper', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, cooldown: true, group: 'cobra', view: 'side', anchor: 'hip', mat: true, tempo: 5,
    frames: [PRONE, { t: -42, h: -62, b: -8, an: [128, 60], af: [126, 62], ln: [180, 180, 180], lf: [180, 180, 180] }],
    steps: ['Lie face down, hands under shoulders.', 'Press gently to lift your chest.', 'Hips stay down, shoulders relaxed.'],
    stepsHi: ['पेट के बल, हाथ कंधों के नीचे।', 'हल्का दबाकर छाती ऊपर।', 'कूल्हे नीचे, कंधे ढीले।'],
    tip: 'Keep elbows soft.', tipHi: 'कोहनी हल्की मुड़ी रखें।',
    why: 'Opens the chest and stretches the belly, often used for cycle health.', whyHi: 'छाती खोलता और पेट खींचता है, पीरियड स्वास्थ्य में उपयोगी।',
  },
  {
    id: 'bridge-pose', name: 'Bridge (Setu Bandhasana)', nameHi: 'सेतु बंधासन', kind: 'yoga', part: 'glutes', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, group: 'bridge', view: 'side', anchor: 'neck', mat: true, tempo: 6,
    frames: [
      { t: 152, h: 175, an: [3, 0], af: [1, -2], ln: [-14, 75, 0], lf: [-16, 73, 0] },
      { t: 150, h: 175, an: [3, 0], af: [1, -2], ln: [-12, 76, 0], lf: [-14, 74, 0] },
    ],
    steps: ['Lie back, knees bent, feet hip-width.', 'Lift your hips and hold.', 'Breathe slowly, then roll down.'],
    stepsHi: ['पीठ के बल, घुटने मुड़े।', 'कूल्हे उठाकर रुकें।', 'धीरे साँस लें, फिर नीचे आएँ।'],
    tip: 'Opens the pelvis and calms the mind.', tipHi: 'पेल्विस खोलता है और मन शांत करता है।',
    why: 'Supports pelvic blood flow and relaxation.', whyHi: 'पेल्विक रक्त प्रवाह और आराम में सहायक।',
  },
  {
    id: 'butterfly', name: 'Butterfly (Baddha Konasana)', nameHi: 'तितली आसन', kind: 'yoga', part: 'glutes', eq: 'none', level: 1, met: 2.3,
    kneeSafe: true, cooldown: true, group: 'butterfly', view: 'front', anchor: 'hip', mat: true, tempo: 1.6,
    frames: [
      { t: -90, an: [100, 100], af: [80, 80], ln: [6, 172, 172], lf: [174, 8, 8] },
      { t: -90, an: [100, 100], af: [80, 80], ln: [-14, 164, 164], lf: [194, 16, 16] },
    ],
    steps: ['Sit tall, soles of the feet together.', 'Hold your feet and gently flap your knees.', 'Keep your spine long.'],
    stepsHi: ['सीधे बैठें, तलवे आपस में मिलाएँ।', 'पैर पकड़कर घुटने तितली की तरह हिलाएँ।', 'रीढ़ सीधी रखें।'],
    tip: 'A traditional favourite for PCOS and period comfort.', tipHi: 'PCOS और पीरियड आराम के लिए पारंपरिक पसंद।',
    why: 'Opens the hips and pelvic area.', whyHi: 'कूल्हे और पेल्विक हिस्से को खोलता है।',
  },
  {
    id: 'seated-fold', name: 'Seated forward fold', nameHi: 'पश्चिमोत्तानासन', kind: 'stretch', part: 'legs', eq: 'none', level: 1, met: 2.3,
    kneeSafe: true, cooldown: true, group: 'fold', view: 'side', anchor: 'hip', mat: true, tempo: 6,
    frames: [
      { t: -82, h: -90, an: [-86, -86], af: [-82, -82], ln: [0, 0, -75], lf: [2, 1, -80] },
      { t: -22, h: -6, b: 8, an: [6, 4], af: [8, 6], ln: [0, 0, -75], lf: [2, 1, -80] },
    ],
    steps: ['Sit with legs straight out.', 'Inhale, reach up tall.', 'Exhale, fold forward toward your feet.'],
    stepsHi: ['पैर सीधे सामने रखकर बैठें।', 'साँस लेते हुए ऊपर खिंचें।', 'साँस छोड़ते हुए पैरों की ओर झुकें।'],
    tip: 'Bend your knees, it’s fine.', tipHi: 'घुटने मोड़ सकती हैं, कोई बात नहीं।',
  },
  {
    id: 'legs-up', name: 'Legs up (Viparita Karani)', nameHi: 'विपरीत करणी', kind: 'yoga', part: 'legs', eq: 'none', level: 1, met: 2,
    kneeSafe: true, cooldown: true, group: 'legs-up', view: 'side', anchor: 'hip', mat: true, tempo: 8,
    frames: [
      { t: 180, h: 180, an: [175, 178], af: [173, 176], ln: [-90, -90, 0], lf: [-88, -88, 0] },
      { t: 180, h: 180, an: [172, 175], af: [170, 173], ln: [-88, -88, 0], lf: [-86, -86, 0] },
    ],
    steps: ['Lie on your back, legs straight up (use a wall if you like).', 'Arms relaxed by your head.', 'Breathe slowly and let your legs rest.'],
    stepsHi: ['पीठ के बल, पैर सीधे ऊपर (दीवार का सहारा लें)।', 'हाथ सिर के पास ढीले।', 'धीरे साँस लें, पैर आराम करें।'],
    tip: 'Skip during heavy period days.', tipHi: 'भारी पीरियड के दिनों में न करें।',
  },
  {
    id: 'malasana', name: 'Garland squat (Malasana)', nameHi: 'मालासन', kind: 'yoga', part: 'glutes', eq: 'none', level: 1, met: 2.5,
    group: 'malasana', view: 'side', anchor: 'feet', tempo: 6,
    frames: [
      { t: -78, h: -84, an: [40, -150], af: [42, -148], ln: [-5, 118], lf: [-3, 116] },
      { t: -80, h: -86, an: [38, -152], af: [40, -150], ln: [-6, 118], lf: [-4, 116] },
    ],
    steps: ['Feet wide, squat all the way down.', 'Palms together, elbows press knees open.', 'Chest lifted, breathe.'],
    stepsHi: ['पैर चौड़े, पूरा नीचे बैठें।', 'हथेलियाँ जोड़ें, कोहनी से घुटने खोलें।', 'छाती ऊपर, साँस लें।'],
    tip: 'Sit on a low stool if heels lift.', tipHi: 'एड़ियाँ उठें तो छोटे पीढ़े पर बैठें।',
  },
  {
    id: 'low-lunge', name: 'Low lunge (Anjaneyasana)', nameHi: 'अंजनेयासन', kind: 'yoga', part: 'legs', eq: 'none', level: 1, met: 2.5,
    uni: true, cooldown: true, group: 'lunge-stretch', view: 'side', anchor: 'footN', mat: true, tempo: 6,
    frames: [
      { t: -90, h: -96, an: [-96, -96], af: [-92, -92], ln: [-2, 92], lf: [120, 180, 180] },
      { t: -92, h: -100, b: -3, an: [-100, -100], af: [-96, -96], ln: [0, 92], lf: [118, 180, 180] },
    ],
    steps: ['Step one foot forward, back knee on the mat.', 'Sink hips forward, arms overhead.', 'Breathe into the front of the back hip. Switch halfway.'],
    stepsHi: ['एक पैर आगे, पिछला घुटना मैट पर।', 'कूल्हे आगे, हाथ ऊपर।', 'पिछले कूल्हे के आगे खिंचाव। आधे पर बदलें।'],
    tip: 'Fold a towel under the back knee.', tipHi: 'पिछले घुटने के नीचे तौलिया रखें।',
  },
  {
    id: 'down-dog', name: 'Downward dog', nameHi: 'अधोमुख श्वानासन', kind: 'yoga', part: 'full', eq: 'none', level: 1, met: 2.8,
    kneeSafe: true, group: 'down-dog', view: 'side', anchor: 'hands', mat: true, tempo: 6,
    frames: [
      { t: 45, h: 52, an: [45, 45], af: [43, 43], ln: [125, 125, 0], lf: [123, 123, 0] },
      { t: 47, h: 54, an: [47, 47], af: [45, 45], ln: [122, 122, 0], lf: [120, 120, 0] },
    ],
    steps: ['From hands and knees, lift your hips high.', 'Press the floor away, heels reaching down.', 'Relax your neck.'],
    stepsHi: ['हाथों-घुटनों से कूल्हे ऊपर उठाएँ।', 'ज़मीन को दबाएँ, एड़ियाँ नीचे की ओर।', 'गर्दन ढीली रखें।'],
    tip: 'Bend your knees to lengthen your back.', tipHi: 'पीठ लंबी रखने के लिए घुटने मोड़ें।',
  },
  {
    id: 'forward-fold', name: 'Standing forward fold', nameHi: 'उत्तानासन', kind: 'stretch', part: 'legs', eq: 'none', level: 1, met: 2.3,
    kneeSafe: true, cooldown: true, group: 'fold', view: 'side', anchor: 'feet', tempo: 6,
    frames: [
      { t: 52, h: 80, b: 7, an: [92, 94], af: [90, 92], ln: [98, 90], lf: [96, 90] },
      { t: 6, h: 16, an: [90, 90], af: [88, 88], ln: [98, 90], lf: [96, 90] },
    ],
    steps: ['Stand, soft knees.', 'Fold forward from the hips, head heavy.', 'Inhale to a flat back, exhale to fold again.'],
    stepsHi: ['खड़े हों, घुटने हल्के मुड़े।', 'कूल्हों से आगे झुकें, सिर ढीला।', 'साँस लेकर पीठ सीधी, छोड़कर फिर झुकें।'],
    tip: 'Rise up slowly to avoid dizziness.', tipHi: 'चक्कर से बचने के लिए धीरे उठें।',
  },
  {
    id: 'side-bend', name: 'Standing side bend', nameHi: 'खड़े होकर साइड बेंड', kind: 'stretch', part: 'core', eq: 'none', level: 1, met: 2.5,
    kneeSafe: true, warmup: true, cooldown: true, group: 'side-bend', view: 'front', anchor: 'feet', tempo: 5,
    frames: [
      { t: -74, h: -70, an: [-66, -60], af: [-88, -78], ln: [86, 90], lf: [94, 90] },
      { t: -106, h: -110, an: [-92, -102], af: [-114, -120], ln: [86, 90], lf: [94, 90] },
    ],
    steps: ['Stand tall, arms overhead.', 'Lean gently to one side.', 'Return and lean to the other side.'],
    stepsHi: ['सीधे खड़े हों, हाथ ऊपर।', 'धीरे एक तरफ झुकें।', 'वापस आकर दूसरी तरफ।'],
    tip: 'Lengthen up before you lean.', tipHi: 'झुकने से पहले ऊपर खिंचें।',
  },
  {
    id: 'knees-to-chest', name: 'Knees to chest (Apanasana)', nameHi: 'अपानासन', kind: 'stretch', part: 'glutes', eq: 'none', level: 1, met: 2,
    kneeSafe: true, cooldown: true, group: 'knees-chest', view: 'side', anchor: 'hip', mat: true, tempo: 4,
    frames: [
      { t: 180, h: 180, an: [-40, -10], af: [-38, -8], ln: [-128, -12, -100], lf: [-126, -10, -100] },
      { t: 180, h: 180, an: [-52, -20], af: [-50, -18], ln: [-112, 0, -90], lf: [-110, 2, -90] },
    ],
    steps: ['Lie on your back.', 'Hug both knees toward your chest.', 'Rock gently side to side.'],
    stepsHi: ['पीठ के बल लेटें।', 'दोनों घुटने छाती की ओर गले लगाएँ।', 'धीरे दाएँ-बाएँ झूलें।'],
    tip: 'Helps with bloating and gas.', tipHi: 'पेट फूलने और गैस में मदद करता है।',
    why: 'Gentle relief for bloating, a common PCOS complaint.', whyHi: 'पेट फूलने में हल्की राहत, PCOS में आम शिकायत।',
  },
  {
    id: 'hamstring-stretch', name: 'Lying hamstring stretch', nameHi: 'लेटकर हैमस्ट्रिंग स्ट्रेच', kind: 'stretch', part: 'legs', eq: 'none', level: 1, met: 2,
    kneeSafe: true, uni: true, cooldown: true, group: 'hamstring', view: 'side', anchor: 'hip', mat: true, tempo: 6,
    frames: [
      { t: 180, h: 180, an: [-48, -70], af: [-46, -68], ln: [-84, -84, 0], lf: [-2, -1, -70] },
      { t: 180, h: 180, an: [-52, -74], af: [-50, -72], ln: [-90, -90, 0], lf: [-2, -1, -70] },
    ],
    steps: ['Lie on your back.', 'Lift one straight leg and hold behind the thigh.', 'Breathe and relax into it. Switch halfway.'],
    stepsHi: ['पीठ के बल लेटें।', 'एक पैर सीधा उठाएँ, जांघ के पीछे पकड़ें।', 'साँस लें और ढीला छोड़ें। आधे पर बदलें।'],
    tip: 'Use a dupatta around your foot.', tipHi: 'पैर पर दुपट्टा लपेटकर पकड़ें।',
  },
  {
    id: 'quad-stretch', name: 'Standing quad stretch', nameHi: 'खड़े होकर जांघ स्ट्रेच', kind: 'stretch', part: 'legs', eq: 'none', level: 1, met: 2.3,
    uni: true, cooldown: true, group: 'quad', view: 'side', anchor: 'footF', tempo: 6,
    frames: [
      { t: -90, an: [104, 112], af: [-6, -6], ln: [96, -106, -40], lf: [88, 90] },
      { t: -90, an: [106, 114], af: [-8, -8], ln: [98, -104, -40], lf: [88, 90] },
    ],
    steps: ['Stand tall, hold a wall if needed.', 'Bend one knee and hold your ankle behind you.', 'Knees together, hips forward. Switch halfway.'],
    stepsHi: ['सीधे खड़े हों, ज़रूरत हो तो दीवार पकड़ें।', 'एक घुटना मोड़कर पीछे टखना पकड़ें।', 'घुटने साथ, कूल्हे आगे। आधे पर बदलें।'],
    tip: 'Squeeze the glute of the bent leg.', tipHi: 'मुड़े पैर का कूल्हा कसें।',
  },
  {
    id: 'chest-opener', name: 'Chest opener', nameHi: 'छाती खोलना', kind: 'stretch', part: 'upper', eq: 'none', level: 1, met: 2.3,
    kneeSafe: true, cooldown: true, group: 'chest-opener', view: 'side', anchor: 'feet', tempo: 5,
    frames: [
      { t: -92, h: -98, b: -3, an: [124, 120], af: [122, 118], ln: [92, 90], lf: [88, 90] },
      { t: -94, h: -104, b: -6, an: [140, 140], af: [138, 138], ln: [92, 90], lf: [88, 90] },
    ],
    steps: ['Stand tall, clasp hands behind your back.', 'Lift your chest and draw shoulders back.', 'Hold and breathe.'],
    stepsHi: ['सीधे खड़े हों, हाथ पीछे बाँधें।', 'छाती ऊपर, कंधे पीछे।', 'रुकें और साँस लें।'],
    tip: 'Undoes hours of phone and laptop slouch.', tipHi: 'फ़ोन-लैपटॉप से झुके कंधों को ठीक करता है।',
  },
  {
    id: 'bow', name: 'Bow pose (Dhanurasana)', nameHi: 'धनुरासन', kind: 'yoga', part: 'upper', eq: 'none', level: 2, met: 2.8,
    kneeSafe: true, group: 'bow', view: 'side', anchor: 'hip', mat: true, tempo: 5,
    frames: [
      { t: -38, h: -55, b: -8, an: [-171, -171], af: [-169, -169], ln: [-165, -45, -60], lf: [-163, -43, -60] },
      { t: -40, h: -58, b: -9, an: [-172, -172], af: [-170, -170], ln: [-166, -46, -60], lf: [-164, -44, -60] },
    ],
    steps: ['Lie face down, bend knees.', 'Hold your ankles.', 'Kick feet into hands to lift chest and thighs.'],
    stepsHi: ['पेट के बल, घुटने मोड़ें।', 'टखने पकड़ें।', 'पैरों को हाथों में धकेलकर छाती और जांघें उठाएँ।'],
    tip: 'Skip during your period.', tipHi: 'पीरियड के दौरान न करें।',
  },
  {
    id: 'deep-breathing', name: 'Belly breathing (Sukhasana)', nameHi: 'सुखासन में गहरी साँस', kind: 'yoga', part: 'full', eq: 'none', level: 1, met: 1.5,
    kneeSafe: true, cooldown: true, group: 'breath', view: 'front', anchor: 'hip', mat: true, tempo: 8,
    frames: [
      { t: -90, h: -90, an: [72, 42], af: [108, 138], ln: [10, 172, 172], lf: [170, 8, 8] },
      { t: -90, h: -92, b: -2, an: [66, 36], af: [114, 144], ln: [10, 172, 172], lf: [170, 8, 8] },
    ],
    steps: ['Sit cross-legged, hands on your knees.', 'Breathe in for 4, belly rises.', 'Breathe out for 6, belly softens.'],
    stepsHi: ['पालथी मारकर बैठें, हाथ घुटनों पर।', '4 गिनती साँस अंदर, पेट फूले।', '6 गिनती साँस बाहर, पेट ढीला।'],
    tip: 'Longer exhales calm stress hormones.', tipHi: 'लंबी साँस छोड़ने से तनाव हॉर्मोन शांत होते हैं।',
    why: 'Lowers cortisol, which can worsen PCOS symptoms.', whyHi: 'कॉर्टिसोल घटाता है, जो PCOS लक्षण बढ़ा सकता है।',
  },
];

export const MOVE_BY_ID: Record<string, TrainerMove> = Object.fromEntries(MOVES.map((m) => [m.id, m]));
