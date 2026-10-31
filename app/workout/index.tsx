import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Trainer } from '@/src/ui/Trainer';
import { Ionicons } from '@/src/ui/Icon';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { MOVE_BY_ID, type TrainerMove } from '@/src/content/trainerMoves';
import { FREE, useIsPro } from '@/src/features/pro';
import { boostFor } from '@/src/content/programs';
import { buildWorkout, easierAlternative, kcalFor, type Focus, type Step } from '@/src/features/workoutEngine';
import { speakSimple, stopCoachVoice } from '@/src/features/moveCoach';
import { openMoveDemo } from '@/src/features/videoDemo';
import { localDate } from '@/src/features/mealPlan';

type Phase = 'intro' | 'ready' | 'work' | 'rest' | 'locked' | 'done';

const BLOCK_LABEL = {
  warmup: ['Warm-up', 'वॉर्म-अप'],
  main: ['Workout', 'वर्कआउट'],
  cooldown: ['Cool-down', 'कूल-डाउन'],
} as const;

function Ring({ value, size = 200, color }: { value: number; size?: number; color: string }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

export default function WorkoutPlayer() {
  useKeepAwake();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ focus: Focus; min: string; seed: string; week?: string; low?: string; program?: string; session?: string; gentle?: string }>();
  const settings = useAppStore((s) => s.moveSettings);
  const weightKg = useAppStore((s) => s.profile?.weightKg);
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const recordWorkout = useAppStore((s) => s.recordWorkout);
  const rateWorkout = useAppStore((s) => s.rateWorkout);
  const openPro = useAppStore((s) => s.openPro);
  const pro = useIsPro();
  const nm = (e?: TrainerMove) => (e ? (hi ? e.nameHi : e.name) : '');

  const workout = useMemo(
    () =>
      buildWorkout(
        params.focus ?? 'full',
        { ...settings, minutes: Number(params.min ?? settings.minutes), lowImpact: params.low === '1' || settings.lowImpact, periodSafe: params.gentle === '1' },
        params.seed ?? localDate(),
        boostFor(Number(params.week ?? 1)),
        weightKg,
      ),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [steps, setSteps] = useState<Step[]>(workout.steps);
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(10);
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState(true);
  const [showHow, setShowHow] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [rated, setRated] = useState(false);
  const [mainDone, setMainDone] = useState(0);
  const recorded = useRef(false);

  const step = steps[idx];
  const ex = step ? MOVE_BY_ID[step.exId] : undefined;
  const next = steps[idx + 1];
  const nextEx = next ? MOVE_BY_ID[next.exId] : undefined;
  const say = (en: string, hiText?: string) => {
    if (voice) void speakSimple(hi && hiText ? hiText : en, hi ? 'hi' : 'en', en);
  };

  const goWork = (i: number) => {
    const s = steps[i];
    const e = MOVE_BY_ID[s.exId];
    setIdx(i);
    setLeft(s.work);
    setPhase('work');
    setShowHow(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    say(`${e.name}. ${s.work} seconds.${e.uni ? ' Switch sides halfway.' : ''}`, `${e.nameHi}. ${s.work} सेकंड।${e.uni ? ' बीच में तरफ़ बदलें।' : ''}`);
  };

  const finish = () => {
    stopCoachVoice();
    setPhase('done');
    say('Workout complete. Amazing work.', 'वर्कआउट पूरा। शानदार!');
  };

  const afterWork = () => {
    setCompleted((c) => c + 1);
    if (idx >= steps.length - 1) return finish();
    const mains = step.block === 'main' ? mainDone + 1 : mainDone;
    setMainDone(mains);
    // Free plan: warm-up plus the first few exercises, then the Go Pro sheet.
    if (!pro && step.block === 'main' && mains >= FREE.exercisesPerWorkout) {
      stopCoachVoice();
      setPhase('locked');
      openPro('workout');
      return;
    }
    if (step.rest > 0) {
      setPhase('rest');
      setLeft(step.rest);
      say(`Rest. Next: ${MOVE_BY_ID[steps[idx + 1].exId].name}.`, `आराम। अगला: ${MOVE_BY_ID[steps[idx + 1].exId].nameHi}।`);
    } else goWork(idx + 1);
  };

  const tickRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    tickRef.current = () => {
      setElapsed((e) => e + 1);
      const nl = left - 1;
      if (phase !== 'work' && nl >= 1 && nl <= 3) {
        void Haptics.selectionAsync().catch(() => undefined);
        say(String(nl));
      }
      const half = step ? Math.floor(step.work / 2) : -1;
      if (phase === 'work' && ex?.uni && step && nl === half) say('Switch sides.', 'तरफ़ बदलें।');
      else if (phase === 'work' && step && (ex?.kind === 'yoga' || ex?.kind === 'stretch') && nl > 4 && (step.work - nl) % 5 === 0) {
        // Slow breathing through holds: in for 5, out for 5.
        const inhale = ((step.work - nl) / 5) % 2 === 1;
        say(inhale ? 'Breathe in.' : 'Breathe out.', inhale ? 'साँस लें।' : 'साँस छोड़ें।');
      }
      if (nl > 0) {
        setLeft(nl);
        return;
      }
      if (phase === 'ready') goWork(idx);
      else if (phase === 'work') afterWork();
      else if (phase === 'rest') goWork(idx + 1);
    };
  });

  useEffect(() => {
    if (paused || phase === 'intro' || phase === 'done' || phase === 'locked') return;
    const id = setInterval(() => tickRef.current(), 1000);
    return () => clearInterval(id);
  }, [paused, phase]);

  useEffect(() => () => stopCoachVoice(), []);


  useEffect(() => {
    if (phase !== 'done' || recorded.current) return;
    recorded.current = true;
    const ratio = completed / Math.max(1, steps.length);
    if (ratio < 0.3 && completed < 5) return;
    recordWorkout({
      date: localDate(),
      key: workout.key,
      title: workout.title.en,
      focus: workout.focus,
      minutes: Math.max(1, Math.round(elapsed / 60)),
      kcal: Math.round(kcalFor(steps.slice(0, completed), weightKg)),
      programId: params.program,
      sessionKey: ratio >= 0.6 ? params.session : undefined,
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (phase === 'intro' || phase === 'done') return router.back();
    if (phase === 'locked') return finish();
    setPaused(true);
    Alert.alert(hi ? 'वर्कआउट छोड़ें?' : 'End workout?', hi ? 'अब तक का काम सेव होगा।' : 'What you’ve done so far will be saved.', [
      { text: hi ? 'जारी रखें' : 'Keep going', onPress: () => setPaused(false) },
      { text: hi ? 'खत्म करें' : 'End', style: 'destructive', onPress: finish },
    ]);
  };

  const makeEasier = () => {
    if (!ex) return;
    const alt = easierAlternative(ex.id, settings, steps.map((s) => s.exId));
    if (!alt) {
      Alert.alert(hi ? 'आसान विकल्प नहीं मिला' : 'No easier option', hi ? 'धीरे करें या आराम लें, ठीक है।' : 'Slow down or rest; that’s okay.');
      return;
    }
    setSteps((cur) => cur.map((s) => (s.exId === ex.id ? { ...s, exId: alt.id } : s)));
    say(`Switched to ${alt.name}.`, `${alt.nameHi} पर बदला।`);
  };

  const totalSecs = steps.reduce((a, s) => a + s.work + s.rest, 0);
  const doneSecs = steps.slice(0, idx).reduce((a, s) => a + s.work + s.rest, 0) + (phase === 'work' && step ? step.work - left : 0);
  const blockLabel = step ? (step.block === 'main' && step.round ? `${hi ? 'राउंड' : 'Round'} ${step.round}/${step.rounds}` : BLOCK_LABEL[step.block][hi ? 1 : 0]) : '';

  if (phase === 'intro') {
    const uniq = steps.filter((s, i) => steps.findIndex((x) => x.exId === s.exId) === i);
    return (
      <View style={[styles.introRoot, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.topBar}>
          <Pressable onPress={close} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 }}>
          <Text style={styles.introTitle}>{hi ? workout.title.hi : workout.title.en}</Text>
          <View style={styles.metaRow}>
            <Meta icon="time-outline" text={`${Math.round(totalSecs / 60)} min`} />
            <Meta icon="flame-outline" text={`~${workout.kcal} kcal`} />
            <Meta icon="barbell-outline" text={`${uniq.length} ${hi ? 'मूव' : 'moves'}`} />
            <Meta icon="speedometer-outline" text={`${hi ? 'लेवल' : 'Level'} ${settings.level}`} />
          </View>
          {(['warmup', 'main', 'cooldown'] as const).map((b) => {
            const items = uniq.filter((s) => s.block === b);
            if (!items.length) return null;
            const rounds = steps.find((s) => s.block === b)?.rounds;
            return (
              <View key={b} style={{ marginTop: spacing.md }}>
                <Text style={styles.blockTitle}>
                  {BLOCK_LABEL[b][hi ? 1 : 0]}
                  {b === 'main' && rounds ? ` · ${rounds} ${hi ? 'राउंड' : 'rounds'}` : ''}
                </Text>
                {items.map((s, i) => {
                  const e = MOVE_BY_ID[s.exId];
                  const locked = !pro && b !== 'warmup' && (b === 'cooldown' || i >= FREE.exercisesPerWorkout);
                  return (
                    <View key={s.exId} style={styles.introRow}>
                      <Trainer moveId={s.exId} still style={styles.introThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.introName}>{nm(e)}</Text>
                        <Text style={styles.introSub}>
                          {s.work}s{e.uni ? (hi ? ' · दोनों तरफ़' : ' · both sides') : ''}
                          {e.eq !== 'none' ? (hi ? ' · डम्बल' : ' · dumbbells') : ''}
                        </Text>
                      </View>
                      {locked ? (
                        <View style={styles.proTag}>
                          <Ionicons name="lock-closed" size={11} color="#7A4A00" />
                          <Text style={styles.proTagText}>PRO</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            );
          })}
          {!pro ? (
            <Pressable onPress={() => openPro('workout')} style={styles.freeNote}>
              <Ionicons name="gift-outline" size={18} color={colors.blushDeep} />
              <Text style={styles.freeNoteText}>
                {hi
                  ? `फ्री: वॉर्म-अप + पहली ${FREE.exercisesPerWorkout} एक्सरसाइज़। पूरा वर्कआउट Pro में।`
                  : `Free: warm-up + first ${FREE.exercisesPerWorkout} exercises. Pro unlocks the full workout.`}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
        <View style={[styles.startBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            onPress={() => {
              setPhase('ready');
              setLeft(10);
              say(`Get ready. First: ${MOVE_BY_ID[steps[0].exId].name}.`, `तैयार हो जाइए। पहला: ${MOVE_BY_ID[steps[0].exId].nameHi}।`);
            }}
            style={styles.startBtn}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startText}>{hi ? 'वर्कआउट शुरू करें' : 'Start workout'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'locked') {
    const remaining = steps.length - idx - 1;
    return (
      <View style={[styles.doneRoot, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.lockStage}>
          {nextEx ? <Trainer moveId={nextEx.id} style={{ flex: 1 }} /> : null}
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color="#7A4A00" />
            <Text style={styles.lockBadgeText}>{hi ? 'अगला: ' : 'Next: '}{nm(nextEx)}</Text>
          </View>
        </View>
        <Text style={styles.doneTitle}>{hi ? 'बहुत बढ़िया! 🎉' : 'Great start! 🎉'}</Text>
        <Text style={styles.lockSub}>
          {hi
            ? `आपने ${completed} मूव पूरे किए। इस वर्कआउट में ${remaining} और मूव बाकी हैं, कूल-डाउन के साथ।`
            : `You’ve done ${completed} moves. ${remaining} more moves and your cool-down are waiting in this workout.`}
        </Text>
        <Pressable onPress={() => (pro ? goWork(idx + 1) : openPro('workout'))} style={[styles.doneBtn, { marginTop: spacing.xl }]}>
          <Text style={styles.doneBtnText}>
            {pro ? (hi ? 'वर्कआउट जारी रखें' : 'Continue workout') : hi ? 'पूरा वर्कआउट अनलॉक करें' : 'Unlock the full workout'}
          </Text>
        </Pressable>
        <Pressable onPress={finish} hitSlop={8} style={{ marginTop: 16 }}>
          <Text style={styles.lockLater}>{hi ? 'यहीं खत्म करें और सेव करें' : 'End here and save'}</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'done') {
    const mins = Math.max(1, Math.round(elapsed / 60));
    const kcal = Math.round(kcalFor(steps.slice(0, completed), weightKg));
    return (
      <View style={[styles.doneRoot, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="trophy" size={56} color="#FFC857" />
        <Text style={styles.doneTitle}>{hi ? 'वर्कआउट पूरा!' : 'Workout complete!'}</Text>
        <View style={styles.doneStats}>
          <DoneStat value={`${mins}`} label={hi ? 'मिनट' : 'minutes'} />
          <DoneStat value={`${kcal}`} label="kcal" />
          <DoneStat value={`${completed}`} label={hi ? 'मूव' : 'moves'} />
        </View>
        <Text style={styles.doneQ}>{rated ? (hi ? 'धन्यवाद! अगला वर्कआउट उसी हिसाब से बदलेगा।' : 'Thanks! Your next workouts will adjust.') : hi ? 'कैसा लगा?' : 'How did it feel?'}</Text>
        {!rated && (
          <View style={styles.rateRow}>
            {(
              [
                ['easy', hi ? 'आसान' : 'Too easy', 'happy-outline'],
                ['right', hi ? 'बिल्कुल सही' : 'Just right', 'thumbs-up-outline'],
                ['hard', hi ? 'मुश्किल' : 'Too hard', 'sad-outline'],
              ] as const
            ).map(([r, label, icon]) => (
              <Pressable
                key={r}
                onPress={() => {
                  rateWorkout(r);
                  setRated(true);
                }}
                style={styles.rateBtn}
              >
                <Ionicons name={icon} size={24} color="#fff" />
                <Text style={styles.rateText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>{hi ? 'हो गया' : 'Done'}</Text>
        </Pressable>
      </View>
    );
  }

  const isRest = phase === 'rest' || phase === 'ready';
  const shownEx = phase === 'rest' ? nextEx : ex;
  const ringTotal = phase === 'work' ? step.work : phase === 'rest' ? step.rest : 10;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.playerTop}>
        <Pressable onPress={close} hitSlop={10}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.blockLabel}>{blockLabel}</Text>
        <Pressable onPress={() => setVoice((v) => (stopCoachVoice(), !v))} hitSlop={10}>
          <Ionicons name={voice ? 'volume-high' : 'volume-mute'} size={24} color="#fff" />
        </Pressable>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, (doneSecs / totalSecs) * 100)}%` }]} />
      </View>

      <View style={styles.stage}>
        {shownEx ? <Trainer moveId={shownEx.id} paused={paused} speed={phase === 'work' ? 1 : 0.6} style={styles.anim} /> : null}
        {isRest ? (
          <View style={styles.restBadge}>
            <Text style={styles.restBadgeText}>{phase === 'ready' ? (hi ? 'तैयार हो जाइए' : 'GET READY') : hi ? 'आराम · अगला' : 'REST · NEXT UP'}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.exName} numberOfLines={2}>
        {nm(shownEx)}
      </Text>
      {shownEx?.uni && phase === 'work' ? <Text style={styles.cue}>{hi ? 'बीच में तरफ़ बदलें' : 'Switch sides halfway'}</Text> : null}

      <View style={styles.timerWrap}>
        <Ring value={left / ringTotal} color={isRest ? '#9FE0C4' : colors.blush} />
        <Text style={styles.timer}>{left}</Text>
        <Text style={styles.timerSub}>{isRest ? (hi ? 'सेकंड' : 'sec') : hi ? 'सेकंड बाकी' : 'sec left'}</Text>
      </View>

      {showHow && shownEx ? (
        <ScrollView style={styles.howBox}>
          {(hi ? shownEx.stepsHi : shownEx.steps).map((s, i) => (
            <Text key={i} style={styles.howText}>
              {i + 1}. {s}
            </Text>
          ))}
          <Text style={styles.howTip}>💡 {hi ? shownEx.tipHi : shownEx.tip}</Text>
        </ScrollView>
      ) : null}

      <View style={styles.tools}>
        <Tool icon="information-circle-outline" label={hi ? 'कैसे करें' : 'How to'} onPress={() => setShowHow((v) => !v)} />
        <Tool icon="trending-down-outline" label={hi ? 'आसान करें' : 'Easier'} onPress={makeEasier} />
        <Tool
          icon="logo-youtube"
          label={hi ? 'वीडियो' : 'Video'}
          onPress={() => {
            setPaused(true);
            if (shownEx) void openMoveDemo(shownEx.name, hi ? 'hi' : 'en');
          }}
        />
        {phase === 'rest' ? <Tool icon="add-circle-outline" label="+10s" onPress={() => setLeft((l) => l + 10)} /> : null}
      </View>

      <View style={styles.dock}>
        <Pressable
          onPress={() => {
            stopCoachVoice();
            if (idx > 0) goWork(idx - 1);
          }}
          style={[styles.sideBtn, idx === 0 && { opacity: 0.3 }]}
        >
          <Ionicons name="play-skip-back" size={24} color="#fff" />
        </Pressable>
        <Pressable onPress={() => setPaused((p) => !p)} style={styles.mainBtn}>
          <Ionicons name={paused ? 'play' : 'pause'} size={32} color={colors.ink} />
        </Pressable>
        <Pressable
          onPress={() => {
            stopCoachVoice();
            if (phase === 'work') afterWork();
            else goWork(phase === 'rest' ? idx + 1 : idx);
          }}
          style={styles.sideBtn}
        >
          <Ionicons name="play-skip-forward" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function Meta({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={colors.blushDeep} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Tool({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tool}>
      <Ionicons name={icon} size={22} color="#fff" />
      <Text style={styles.toolText}>{label}</Text>
    </Pressable>
  );
}

function DoneStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.doneValue}>{value}</Text>
      <Text style={styles.doneLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  introRoot: { flex: 1, backgroundColor: colors.surface },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  introTitle: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.ink, letterSpacing: -0.6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.blushSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  metaText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.blushDeep },
  blockTitle: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 6 },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 18, padding: 8, marginBottom: 8 },
  introThumb: { width: 76, height: 64, borderRadius: 14, backgroundColor: '#FFF3F0', overflow: 'hidden' },
  proTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFC857', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  proTagText: { fontFamily: fonts.bodyBold, fontSize: 10.5, color: '#7A4A00', letterSpacing: 0.4 },
  freeNote: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.blushSoft, borderRadius: 16, padding: 12, marginTop: spacing.md },
  freeNoteText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18, color: colors.ink },
  lockStage: { alignSelf: 'stretch', height: 230, borderRadius: 26, backgroundColor: '#FFF3F0', overflow: 'hidden', opacity: 0.92 },
  lockBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFC857', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  lockBadgeText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: '#4A2C00' },
  lockSub: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 10 },
  lockLater: { fontFamily: fonts.bodyMedium, fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  introName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  introSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  startBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: 12, backgroundColor: 'rgba(255,248,246,0.96)' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.blushDeep, borderRadius: 999, paddingVertical: 17 },
  startText: { fontFamily: fonts.bodyBold, fontSize: 17, color: '#fff' },
  root: { flex: 1, backgroundColor: '#15201D', paddingHorizontal: spacing.lg },
  playerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockLabel: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: colors.blush },
  stage: { marginTop: 14, borderRadius: 26, overflow: 'hidden', flex: 1, maxHeight: 330, backgroundColor: '#FFF3F0' },
  anim: { flex: 1 },
  restBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#15201D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  restBadgeText: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, color: '#9FE0C4' },
  exName: { fontFamily: fonts.displayBold, fontSize: 26, color: '#fff', textAlign: 'center', marginTop: 14, letterSpacing: -0.4 },
  cue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: '#FFC857', textAlign: 'center', marginTop: 4 },
  timerWrap: { width: 200, height: 200, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 10, transform: [{ scale: 0.8 }] },
  timer: { fontFamily: fonts.displayBold, fontSize: 64, color: '#fff', letterSpacing: -2 },
  timerSub: { fontFamily: fonts.bodyMedium, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: -6 },
  howBox: { maxHeight: 120, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 },
  howText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
  howTip: { fontFamily: fonts.bodyMedium, fontSize: 13, color: '#9FE0C4', marginTop: 6 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 8 },
  tool: { alignItems: 'center', gap: 2 },
  toolText: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: 'rgba(255,255,255,0.75)' },
  dock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: 14 },
  sideBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  mainBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  doneRoot: { flex: 1, backgroundColor: '#15201D', alignItems: 'center', paddingHorizontal: spacing.lg },
  doneTitle: { fontFamily: fonts.displayBold, fontSize: 30, color: '#fff', marginTop: 12 },
  doneStats: { flexDirection: 'row', marginTop: spacing.xl, alignSelf: 'stretch' },
  doneValue: { fontFamily: fonts.displayBold, fontSize: 34, color: '#fff' },
  doneLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  doneQ: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#fff', marginTop: spacing.xl, textAlign: 'center' },
  rateRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  rateBtn: { flex: 1, alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, paddingVertical: 14 },
  rateText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: '#fff' },
  doneBtn: { marginTop: 'auto', alignSelf: 'stretch', backgroundColor: colors.blushDeep, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#fff' },
});
