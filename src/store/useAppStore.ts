import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { format } from 'date-fns';

import { derivePhenotype } from '@/src/features/phenotype';
import { type ChatMessage } from '@/src/features/aiCoach';
import { askCoach } from '@/src/features/aiClient';
import { buildAiContext } from '@/src/features/aiContext';
import type { Entitlement } from '@/src/features/billing';
import { analyzeLabValues, type LabAnalysis } from '@/src/features/labAi';
import { DEFAULT_REMINDERS, type ReminderPref } from '@/src/features/reminderDefaults';
import type {
  LivingContext,
  PlanType,
  Subscription,
  SymptomLog,
  UserProfile,
} from '@/src/types';

const memoryStore: Record<string, string> = {};

const safeStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return memoryStore[name] ?? null;
    }
  },
  setItem: async (name, value) => {
    memoryStore[name] = value;
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      /* fallback */
    }
  },
  removeItem: async (name) => {
    delete memoryStore[name];
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      /* fallback */
    }
  },
};

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  date: string;
  durationMin: number;
  completed: boolean;
};

export type BodyLog = { date: string; weightKg?: number; waistCm?: number };
export type SkinLog = { date: string; facialHair: number; hairFall: number; acne: number };
export type MindCheck = { date: string; phq2: number; gad2: number };
export type LhTest = { date: string; result: 'neg' | 'pos' };
export type PlateScan = { date: string; score: number; label: string };
export type TtcState = { on: boolean; since: string | null; lhTests: LhTest[] };

export type CommunityPost = {
  id: string;
  category: 'diet_tips' | 'success_stories' | 'questions' | 'emotional_support';
  title: string;
  body: string;
  isAnonymous: boolean;
  upvotes: number;
  upvotedByMe: boolean;
  comments: { id: string; body: string; isAnonymous: boolean; createdAt: string }[];
  createdAt: string;
};

export type SupplementLog = {
  date: string;
  items: Record<string, boolean>;
};

type SetupDraft = Partial<UserProfile> & { step: number };

type AppState = {
  hydrated: boolean;
  hasSeenWelcome: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  setupDraft: SetupDraft;
  subscription: Subscription;
  symptomLogs: SymptomLog[];
  habitDoneToday: { focus: boolean; move: boolean };
  habitDate: string;
  mealMarks: Record<string, 'ate' | 'swapped' | 'skipped'>;
  waterGlasses: number;
  waterDate: string;
  exerciseLogs: ExerciseLog[];
  chat: ChatMessage[];
  labAnalyses: LabAnalysis[];
  reminders: ReminderPref[];
  posts: CommunityPost[];
  supplements: SupplementLog;
  streakDays: number;
  councilTodayDate: string;
  councilTodayDone: Record<string, boolean>;
  badDayMode: boolean;
  hasSeenGuide: boolean;
  scheduleDoneDate: string;
  scheduleDone: Record<string, boolean>;
  alarmsArmed: boolean;

  setHydrated: (v: boolean) => void;
  completeWelcome: () => void;
  completeGuide: () => void;
  signInDemo: () => void;
  /** One-tap demo: skip welcome/auth/setup/paywall into Home. */
  skipSignupDemo: () => void;
  signOut: () => void;
  updateSetupDraft: (patch: Partial<UserProfile> & { step?: number }) => void;
  finishSetup: () => void;
  startTrial: (plan: PlanType) => void;
  applyEntitlement: (e: Entitlement) => void;
  freeDecodeUsed: boolean;
  doctorKitExports: number;
  noteDoctorKitExport: () => void;
  upsertSymptomLog: (log: Omit<SymptomLog, 'id'> & { id?: string }) => void;
  toggleHabit: (key: 'focus' | 'move') => void;
  markMeal: (mealKey: string, status: 'ate' | 'swapped' | 'skipped') => void;
  mealSwaps: Record<string, string>;
  bodyLogs: BodyLog[];
  logBody: (entry: BodyLog) => void;
  skinLogs: SkinLog[];
  logSkin: (entry: SkinLog) => void;
  mindChecks: MindCheck[];
  logMind: (entry: MindCheck) => void;
  lessonsDone: string[];
  lastLessonDate: string | null;
  completeLesson: (id: string) => void;
  programStart: string | null;
  ensureProgramStart: () => void;
  ttc: TtcState;
  setTtc: (patch: Partial<TtcState>) => void;
  logLh: (test: LhTest) => void;
  plateScans: PlateScan[];
  addPlateScan: (scan: PlateScan) => void;
  hiddenPostIds: string[];
  hidePost: (id: string) => void;
  reportedIds: string[];
  markReported: (id: string) => void;
  swapMeal: (date: string, slot: string, mealId: string) => void;
  updateFoodPrefs: (patch: Partial<Pick<UserProfile, 'dietPreference' | 'cuisinePreference' | 'allergies' | 'dislikes' | 'livingContext'>>) => void;
  setLivingContext: (ctx: LivingContext) => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  addWater: () => void;
  resetWaterIfNeeded: () => void;
  resetHabitsIfNeeded: () => void;
  completeExercise: (exerciseId: string, durationMin: number) => void;
  chatBusy: boolean;
  sendChat: (text: string) => Promise<void>;
  clearChat: () => void;
  saveLabAnalysis: (values: Record<string, number>) => LabAnalysis;
  setReminderEnabled: (key: string, enabled: boolean) => void;
  setReminders: (prefs: ReminderPref[]) => void;
  addPost: (p: Omit<CommunityPost, 'id' | 'upvotes' | 'upvotedByMe' | 'comments' | 'createdAt'>) => void;
  toggleUpvote: (postId: string) => void;
  addComment: (postId: string, body: string, isAnonymous: boolean) => void;
  toggleSupplement: (item: string) => void;
  addCustomMed: (name: string) => void;
  resetCouncilIfNeeded: () => void;
  toggleCouncilAsk: (askId: string) => void;
  setBadDayMode: (on: boolean) => void;
  resetScheduleIfNeeded: () => void;
  markScheduleDone: (key: string) => void;
  setAlarmsArmed: (on: boolean) => void;
};

const emptyDraft: SetupDraft = { step: 0, symptoms: [], allergies: [], goals: [] };
const today = () => format(new Date(), 'yyyy-MM-dd');

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    category: 'diet_tips',
    title: 'Mess food hacks that actually helped',
    body: 'Half rice, double sabzi, curd always. Spearmint tea evening. Week 3 acne quieter.',
    isAnonymous: true,
    upvotes: 42,
    upvotedByMe: false,
    comments: [
      {
        id: 'c1',
        body: 'Same! I add roasted chana from the canteen.',
        isAnonymous: true,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    category: 'emotional_support',
    title: 'Family keeps saying “bas thoda weight kam karo”',
    body: 'Sharing because it feels heavy. Anonymous for a reason.',
    isAnonymous: true,
    upvotes: 87,
    upvotedByMe: false,
    comments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    category: 'success_stories',
    title: 'Cycles from 45 → 32 days in 4 months',
    body: 'North Indian low-GI + luteal yoga. Doctor Visit Kit helped my gynae visit.',
    isAnonymous: false,
    upvotes: 120,
    upvotedByMe: false,
    comments: [],
    createdAt: new Date().toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      hasSeenWelcome: false,
      isAuthenticated: false,
      profile: null,
      setupDraft: emptyDraft,
      subscription: { planType: 'annual', status: null, trialEndsAt: null },
      symptomLogs: [],
      habitDoneToday: { focus: false, move: false },
      habitDate: today(),
      mealMarks: {},
      waterGlasses: 0,
      waterDate: today(),
      exerciseLogs: [],
      chat: [
        {
          id: 'welcome',
          role: 'assistant',
          text: 'Namaste! I’m your NariCare AI coach — diet, cravings, cycle, labs, exercise, mood. Ask me anything.',
          createdAt: new Date().toISOString(),
        },
      ],
      labAnalyses: [],
      reminders: DEFAULT_REMINDERS,
      posts: SEED_POSTS,
      supplements: {
        date: today(),
        items: { 'Inositol': false, 'Vitamin D': false, 'Omega-3': false, 'Spearmint tea': false },
      },
      streakDays: 0,
      councilTodayDate: today(),
      councilTodayDone: {},
      badDayMode: false,
      hasSeenGuide: false,
      scheduleDoneDate: today(),
      scheduleDone: {},
      alarmsArmed: false,

      setHydrated: (v) => set({ hydrated: v }),
      completeWelcome: () => set({ hasSeenWelcome: true }),
      completeGuide: () => set({ hasSeenGuide: true }),
      signInDemo: () => set({ isAuthenticated: true }),
      skipSignupDemo: () => {
        const d0 = today();
        const dayAgo = (n: number) => {
          const d = new Date();
          d.setDate(d.getDate() - n);
          return format(d, 'yyyy-MM-dd');
        };
        set({
          hasSeenWelcome: true,
          isAuthenticated: true,
          profile: {
            name: 'Ananya',
            age: 26,
            heightCm: 162,
            weightKg: 64,
            city: 'Bengaluru',
            diagnosisStatus: 'diagnosed',
            symptoms: ['irregular_periods', 'acne', 'weight_gain', 'fatigue'],
            dietPreference: 'vegetarian',
            allergies: [],
            cuisinePreference: 'north_indian',
            livingContext: 'family_kitchen',
            goals: ['manage_symptoms', 'lose_weight'],
            language: 'en',
            phenotype: 'metabolic',
          },
          subscription: {
            planType: 'annual',
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          habitDoneToday: { focus: false, move: false },
          streakDays: 4,
          symptomLogs: [
            {
              id: dayAgo(3),
              logDate: dayAgo(3),
              periodStatus: 'none',
              bleedPattern: 'none',
              symptoms: { acne: 3, bloating: 2, fatigue: 3, cravings: 2 },
              mood: 3,
              energyCrash: true,
            },
            {
              id: dayAgo(2),
              logDate: dayAgo(2),
              periodStatus: 'none',
              bleedPattern: 'none',
              symptoms: { acne: 2, bloating: 2, fatigue: 2, cravings: 1 },
              mood: 3,
              energyCrash: false,
            },
            {
              id: dayAgo(1),
              logDate: dayAgo(1),
              periodStatus: 'spotting',
              bleedPattern: 'light',
              symptoms: { acne: 2, bloating: 1, fatigue: 2, cravings: 1 },
              mood: 4,
              energyCrash: false,
            },
            {
              id: d0,
              logDate: d0,
              periodStatus: 'none',
              bleedPattern: 'none',
              symptoms: { acne: 1, bloating: 1, fatigue: 1 },
              mood: 4,
              energyCrash: false,
            },
          ],
        });
      },
      signOut: () =>
        set({
          isAuthenticated: false,
          profile: null,
          setupDraft: emptyDraft,
          subscription: { planType: 'annual', status: null, trialEndsAt: null },
          habitDoneToday: { focus: false, move: false },
        }),
      updateSetupDraft: (patch) => set({ setupDraft: { ...get().setupDraft, ...patch } }),
      finishSetup: () => {
        const d = get().setupDraft;
        const symptoms = d.symptoms ?? [];
        set({
          profile: {
            name: d.name ?? 'Friend',
            age: d.age ?? 25,
            heightCm: d.heightCm ?? 160,
            weightKg: d.weightKg ?? 60,
            city: d.city ?? 'India',
            diagnosisStatus: d.diagnosisStatus ?? 'suspect',
            symptoms,
            dietPreference: d.dietPreference ?? 'vegetarian',
            allergies: d.allergies ?? [],
            cuisinePreference: d.cuisinePreference ?? 'north_indian',
            livingContext: d.livingContext ?? 'family_kitchen',
            goals: d.goals ?? ['manage_symptoms'],
            language: d.language ?? 'en',
            phenotype: derivePhenotype(symptoms),
          },
          setupDraft: { ...emptyDraft, step: 0 },
        });
      },
      startTrial: (plan) =>
        set({
          subscription: {
            planType: plan,
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            startedAt: new Date().toISOString(),
          },
        }),
      applyEntitlement: (e) => {
        const prev = get().subscription;
        if (!e.active) {
          const wasPaying = prev.status === 'active' || prev.status === 'trial';
          set({ subscription: { ...prev, status: wasPaying ? 'expired' : prev.status, trialEndsAt: null } });
          return;
        }
        set({
          subscription: {
            planType: e.plan ?? prev.planType,
            status: e.isTrial ? 'trial' : 'active',
            trialEndsAt: e.isTrial ? e.expiresAt : null,
            startedAt: prev.startedAt ?? new Date().toISOString(),
          },
        });
      },
      freeDecodeUsed: false,
      doctorKitExports: 0,
      noteDoctorKitExport: () => set({ doctorKitExports: get().doctorKitExports + 1 }),
      upsertSymptomLog: (log) => {
        const id = log.id ?? `${log.logDate}`;
        const next = get().symptomLogs.filter((l) => l.logDate !== log.logDate);
        next.push({ ...log, id });
        const streak = Math.min(30, (get().streakDays || 0) + 1);
        set({ symptomLogs: next, streakDays: streak });
      },
      toggleHabit: (key) => {
        get().resetHabitsIfNeeded();
        set({
          habitDate: today(),
          habitDoneToday: { ...get().habitDoneToday, [key]: !get().habitDoneToday[key] },
        });
      },
      markMeal: (mealKey, status) =>
        set({ mealMarks: { ...get().mealMarks, [mealKey]: status } }),
      mealSwaps: {},
      bodyLogs: [],
      logBody: (entry) =>
        set({ bodyLogs: [...get().bodyLogs.filter((x) => x.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)).slice(-400) }),
      skinLogs: [],
      logSkin: (entry) =>
        set({ skinLogs: [...get().skinLogs.filter((x) => x.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)).slice(-400) }),
      mindChecks: [],
      logMind: (entry) =>
        set({ mindChecks: [...get().mindChecks.filter((x) => x.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)).slice(-400) }),
      lessonsDone: [],
      lastLessonDate: null,
      completeLesson: (id) => set({ lessonsDone: [...new Set([...get().lessonsDone, id])], lastLessonDate: today() }),
      programStart: null,
      ensureProgramStart: () => {
        if (!get().programStart) set({ programStart: new Date().toISOString() });
      },
      ttc: { on: false, since: null, lhTests: [] },
      setTtc: (patch) => set({ ttc: { ...get().ttc, ...patch } }),
      logLh: (test) =>
        set({ ttc: { ...get().ttc, lhTests: [...get().ttc.lhTests.filter((t) => t.date !== test.date), test].slice(-120) } }),
      plateScans: [],
      addPlateScan: (scan) => set({ plateScans: [...get().plateScans, scan].slice(-200) }),
      hiddenPostIds: [],
      hidePost: (id) => set({ hiddenPostIds: [...new Set([...get().hiddenPostIds, id])] }),
      reportedIds: [],
      markReported: (id) => set({ reportedIds: [...new Set([...get().reportedIds, id])].slice(-200) }),
      swapMeal: (date, slot, mealId) => {
        const cutoff = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
        const kept = Object.fromEntries(Object.entries(get().mealSwaps).filter(([k]) => k.slice(0, 10) >= cutoff));
        set({ mealSwaps: { ...kept, [`${date}|${slot}`]: mealId } });
      },
      updateFoodPrefs: (patch) => {
        const profile = get().profile;
        if (!profile) return;
        set({ profile: { ...profile, ...patch }, mealSwaps: {} });
      },
      setLivingContext: (ctx) => {
        const profile = get().profile;
        if (!profile) return;
        set({ profile: { ...profile, livingContext: ctx } });
      },
      setLanguage: (lang) => {
        const profile = get().profile;
        if (!profile) return;
        set({ profile: { ...profile, language: lang } });
      },
      resetWaterIfNeeded: () => {
        const d = today();
        if (get().waterDate !== d) set({ waterGlasses: 0, waterDate: d });
      },
      resetHabitsIfNeeded: () => {
        const d = today();
        if (get().habitDate !== d) {
          set({ habitDate: d, habitDoneToday: { focus: false, move: false }, badDayMode: false });
        }
      },
      addWater: () => {
        get().resetWaterIfNeeded();
        set({ waterGlasses: Math.min(12, get().waterGlasses + 1), waterDate: today() });
      },
      completeExercise: (exerciseId, durationMin) => {
        const log: ExerciseLog = {
          id: `${Date.now()}`,
          exerciseId,
          date: today(),
          durationMin,
          completed: true,
        };
        set({
          exerciseLogs: [log, ...get().exerciseLogs].slice(0, 60),
          habitDoneToday: { ...get().habitDoneToday, move: true },
          streakDays: Math.min(30, (get().streakDays || 0) + 1),
        });
      },
      chatBusy: false,
      sendChat: async (text) => {
        if (get().chatBusy) return;
        const history = get().chat;
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}`,
          role: 'user',
          text,
          createdAt: new Date().toISOString(),
        };
        set({ chat: [...history, userMsg], chatBusy: true });
        const replyText = await askCoach(text, get().profile, history, buildAiContext(get()));
        const reply: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          createdAt: new Date().toISOString(),
        };
        set({ chat: [...get().chat, reply], chatBusy: false });
      },
      clearChat: () =>
        set({
          chat: [
            {
              id: 'welcome',
              role: 'assistant',
              text: 'Chat cleared. Ask me about diet, labs, cycle, or cravings.',
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      saveLabAnalysis: (values) => {
        const analysis = analyzeLabValues(values, get().profile?.phenotype);
        set({ labAnalyses: [analysis, ...get().labAnalyses].slice(0, 20), freeDecodeUsed: true });
        return analysis;
      },
      setReminderEnabled: (key, enabled) =>
        set({
          reminders: get().reminders.map((r) => (r.key === key ? { ...r, enabled } : r)),
        }),
      setReminders: (prefs) => set({ reminders: prefs }),
      addPost: (p) => {
        const post: CommunityPost = {
          ...p,
          id: `p-${Date.now()}`,
          upvotes: 0,
          upvotedByMe: false,
          comments: [],
          createdAt: new Date().toISOString(),
        };
        set({ posts: [post, ...get().posts] });
      },
      toggleUpvote: (postId) =>
        set({
          posts: get().posts.map((p) => {
            if (p.id !== postId) return p;
            const upvotedByMe = !p.upvotedByMe;
            return {
              ...p,
              upvotedByMe,
              upvotes: Math.max(0, p.upvotes + (upvotedByMe ? 1 : -1)),
            };
          }),
        }),
      addComment: (postId, body, isAnonymous) =>
        set({
          posts: get().posts.map((p) =>
            p.id !== postId
              ? p
              : {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: `c-${Date.now()}`,
                      body,
                      isAnonymous,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
          ),
        }),
      toggleSupplement: (item) => {
        const d = today();
        let supplements = get().supplements;
        if (supplements.date !== d) {
          supplements = {
            date: d,
            items: { 'Inositol': false, 'Vitamin D': false, 'Omega-3': false, 'Spearmint tea': false },
          };
        }
        set({
          supplements: {
            ...supplements,
            items: { ...supplements.items, [item]: !supplements.items[item] },
          },
        });
      },
      addCustomMed: (name) => {
        const d = today();
        let supplements = get().supplements;
        if (supplements.date !== d) {
          supplements = {
            date: d,
            items: { 'Inositol': false, 'Vitamin D': false, 'Omega-3': false, 'Spearmint tea': false },
          };
        }
        if (supplements.items[name] !== undefined) return;
        set({
          supplements: {
            ...supplements,
            date: d,
            items: { ...supplements.items, [name]: false },
          },
        });
      },
      resetCouncilIfNeeded: () => {
        const d = today();
        if (get().councilTodayDate !== d) set({ councilTodayDate: d, councilTodayDone: {} });
      },
      toggleCouncilAsk: (askId) => {
        get().resetCouncilIfNeeded();
        const done = get().councilTodayDone;
        set({
          councilTodayDate: today(),
          councilTodayDone: { ...done, [askId]: !done[askId] },
        });
      },
      setBadDayMode: (on) => set({ badDayMode: on }),
      resetScheduleIfNeeded: () => {
        const d = today();
        if (get().scheduleDoneDate !== d) set({ scheduleDoneDate: d, scheduleDone: {} });
      },
      markScheduleDone: (key) => {
        get().resetScheduleIfNeeded();
        set({
          scheduleDoneDate: today(),
          scheduleDone: { ...get().scheduleDone, [key]: true },
        });
      },
      setAlarmsArmed: (on) => set({ alarmsArmed: on }),
    }),
    {
      name: 'naricare-store-v3',
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHydrated(true);
        // Soft day must never stick across launches
        state.setBadDayMode(false);
        // Ensure new reminder fields (href/kind) exist after upgrades
        const merged = DEFAULT_REMINDERS.map((d) => {
          const prev = state.reminders?.find((r) => r.key === d.key);
          // Keep user toggles/times; always refresh bilingual copy + href/kind from defaults
          return prev
            ? {
                ...d,
                enabled: prev.enabled,
                hour: prev.hour,
                minute: prev.minute,
              }
            : d;
        });
        state.setReminders(merged);
      },
      partialize: (s) => ({
        hasSeenWelcome: s.hasSeenWelcome,
        hasSeenGuide: s.hasSeenGuide,
        isAuthenticated: s.isAuthenticated,
        profile: s.profile,
        subscription: s.subscription,
        symptomLogs: s.symptomLogs,
        mealMarks: s.mealMarks,
        habitDoneToday: s.habitDoneToday,
        habitDate: s.habitDate,
        waterGlasses: s.waterGlasses,
        waterDate: s.waterDate,
        exerciseLogs: s.exerciseLogs,
        chat: s.chat.slice(-40),
        labAnalyses: s.labAnalyses,
        reminders: s.reminders,
        posts: s.posts,
        supplements: s.supplements,
        streakDays: s.streakDays,
        councilTodayDate: s.councilTodayDate,
        councilTodayDone: s.councilTodayDone,
        // badDayMode is session-only — never persist (stuck Soft day blocked Full home)
        scheduleDoneDate: s.scheduleDoneDate,
        scheduleDone: s.scheduleDone,
        alarmsArmed: s.alarmsArmed,
        freeDecodeUsed: s.freeDecodeUsed,
        mealSwaps: s.mealSwaps,
        bodyLogs: s.bodyLogs,
        skinLogs: s.skinLogs,
        mindChecks: s.mindChecks,
        lessonsDone: s.lessonsDone,
        lastLessonDate: s.lastLessonDate,
        programStart: s.programStart,
        ttc: s.ttc,
        plateScans: s.plateScans,
        hiddenPostIds: s.hiddenPostIds,
        reportedIds: s.reportedIds,
        doctorKitExports: s.doctorKitExports,
      }),
    }
  )
);

export function isSubscriptionActive(sub: Subscription): boolean {
  if (sub.status === 'active') return true;
  if (sub.status === 'trial' && sub.trialEndsAt) {
    return new Date(sub.trialEndsAt) > new Date();
  }
  return false;
}
