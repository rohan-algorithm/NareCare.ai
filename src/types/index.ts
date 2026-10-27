export type DiagnosisStatus = 'diagnosed' | 'suspect' | 'unsure';
export type DietPreference = 'vegetarian' | 'non_veg' | 'eggetarian' | 'vegan' | 'jain';
export type CuisinePreference =
  | 'north_indian'
  | 'south_indian'
  | 'bengali'
  | 'gujarati'
  | 'pan_indian';
export type LivingContext = 'family_kitchen' | 'hostel_mess' | 'tiffin' | 'eating_out';
export type Phenotype = 'metabolic' | 'androgenic' | 'inflammatory' | 'mixed';
export type CyclePhase = 'follicular' | 'ovulation' | 'luteal' | 'unknown';
export type PeriodStatus = 'started' | 'flowing' | 'spotting' | 'none';
export type BleedPattern = 'light' | 'moderate' | 'heavy' | 'clots' | 'none';
export type Language = 'en' | 'hi';
export type PlanType = 'monthly' | 'quarterly' | 'annual';
export type SubStatus = 'active' | 'cancelled' | 'expired' | 'trial' | null;

export type UserProfile = {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  city: string;
  diagnosisStatus: DiagnosisStatus;
  symptoms: string[];
  dietPreference: DietPreference;
  allergies: string[];
  dislikes?: string[];
  cuisinePreference: CuisinePreference;
  livingContext: LivingContext;
  goals: string[];
  language: Language;
  phenotype: Phenotype;
};

export type Subscription = {
  planType: PlanType;
  status: SubStatus;
  trialEndsAt: string | null;
  startedAt?: string | null;
};

export type SymptomLog = {
  id: string;
  logDate: string;
  periodStatus: PeriodStatus;
  bleedPattern?: BleedPattern;
  symptoms: Record<string, number>;
  weightKg?: number;
  mood: number;
  energyCrash?: boolean;
  notes?: string;
};

export type Meal = {
  id: string;
  name: string;
  nameHi: string;
  calories: number;
  proteinG: number;
  fiberG: number;
  pcosBenefit: string;
  livingContexts: LivingContext[];
  alternatives: string[];
};

export type DayPlan = {
  day: number;
  breakfast: string;
  midMorning: string;
  lunch: string;
  evening: string;
  dinner: string;
};

/** Local female-character demo key (assets/gifs/girl). */
export type MoveGifKey =
  | 'high_knees'
  | 'squat'
  | 'jump'
  | 'situp'
  | 'pushup'
  | 'walk'
  | 'stretch'
  | 'strength'
  | 'core'
  | 'side'
  | 'warmup'
  | 'cardio'
  | 'yoga'
  | 'yoga_sit'
  | 'breathing'
  | 'deep_breath'
  | 'meditation'
  | 'arms';

/** One move inside a session — timed countdown or reps (inspired by interval workout apps). */
export type MoveStep = {
  name: string;
  nameHi: string;
  cue: string;
  cueHi: string;
  /** Spoken + on-screen coach line */
  coachEn: string;
  coachHi: string;
  gif: MoveGifKey;
  kind: 'timed' | 'reps';
  seconds?: number;
  reps?: number;
  /** Rest after this move before the next (0 = none). */
  restAfterSec?: number;
};

export type Exercise = {
  id: string;
  name: string;
  nameHi: string;
  durationMin: number;
  difficulty: 'Beginner' | 'Intermediate';
  phase: CyclePhase | 'any';
  /** Legacy plain steps — prefer `moves` for the player. */
  steps: string[];
  moves: MoveStep[];
  focus: string;
  focusHi: string;
  why: string;
  whyHi: string;
  kcalEst: number;
};
