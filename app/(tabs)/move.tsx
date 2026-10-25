import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/src/ui/Screen';
import { ScreenHeader } from '@/src/ui/ScreenHeader';
import { Button } from '@/src/ui/Button';
import { Disclaimer } from '@/src/ui/Disclaimer';
import { MoveGif } from '@/src/ui/MoveGif';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, shadow, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { getCycleDay, getCyclePhase, phaseCopy } from '@/src/features/cycle';
import {
  formatMoveDuration,
  getExercise,
  sessionMoveCount,
  todaysExercises,
} from '@/src/content/exercises';
import {
  buildWeekPlan,
  moveActiveCount,
  moveStreakDays,
  weekPlanTitle,
} from '@/src/features/moveStreak';
import { speakCoach, speakSimple, stopCoachVoice } from '@/src/features/moveCoach';
import type { Exercise, MoveStep } from '@/src/types';

type Mode = 'hub' | 'week' | 'preview' | 'ready' | 'work' | 'rest' | 'done';

const READY_SEC = 5;

function fmtClock(total: number) {
  const s = Math.max(0, total);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

async function buzz(kind: 'light' | 'medium' | 'success' = 'light') {
  try {
    if (kind === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'medium') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* Expo Go / web */
  }
}

export default function Move() {
  const { start } = useLocalSearchParams<{ start?: string }>();
  const insets = useSafeAreaInsets();
  const logs = useAppStore((s) => s.symptomLogs);
  const exerciseLogs = useAppStore((s) => s.exerciseLogs);
  const completeExercise = useAppStore((s) => s.completeExercise);
  const markScheduleDone = useAppStore((s) => s.markScheduleDone);
  const habitDoneToday = useAppStore((s) => s.habitDoneToday);
  const toggleHabit = useAppStore((s) => s.toggleHabit);
  const profile = useAppStore((s) => s.profile);
  const lang = profile?.language ?? 'en';
  const hi = lang === 'hi';

  const cycleDay = getCycleDay(logs);
  const phase = getCyclePhase(cycleDay);
  const phaseInfo = phaseCopy(phase, lang);
  const todays = useMemo(() => todaysExercises(phase), [phase]);
  const calm = getExercise('calm_breathe')!;
  const streak = useMemo(() => moveStreakDays(exerciseLogs, 14), [exerciseLogs]);
  const week = useMemo(() => buildWeekPlan(exerciseLogs), [exerciseLogs]);
  const active14 = moveActiveCount(exerciseLogs, 14);

  const [session, setSession] = useState<Exercise>(todays[0]);
  const [mode, setMode] = useState<Mode>('hub');
  const [showStreak, setShowStreak] = useState(false);
  const [showAlts, setShowAlts] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0);
  const [readyLeft, setReadyLeft] = useState(READY_SEC);
  const [workLeft, setWorkLeft] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [skippedKind, setSkippedKind] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const finishing = useRef(false);

  const moves = session.moves;
  const current: MoveStep | undefined = moves[moveIndex];
  const nextMove: MoveStep | undefined = moves[moveIndex + 1];
  const completedMoves =
    mode === 'rest' || mode === 'done' ? Math.min(moves.length, moveIndex + 1) : moveIndex;
  const progressPct = Math.round((completedMoves / Math.max(1, moves.length)) * 100);
  const doneToday = exerciseLogs.filter((e) => e.date === new Date().toISOString().slice(0, 10));
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const goalsDone =
    Number(doneToday.some((l) => l.exerciseId !== 'calm_breathe')) +
    Number(doneToday.some((l) => l.exerciseId === 'calm_breathe'));

  useEffect(() => {
    if (start === '1' && todays[0]) {
      setSession(todays[0]);
      setMode('preview');
    }
  }, [start, todays]);

  useEffect(() => {
    if (mode === 'hub' || mode === 'preview' || mode === 'week' || mode === 'done' || paused) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [mode, paused]);

  const beginWork = useCallback(() => {
    if (!current) return;
    setPaused(false);
    if (current.kind === 'timed') setWorkLeft(current.seconds ?? 30);
    setMode('work');
    void buzz('medium');
  }, [current]);

  // Coach voice when a move becomes ready
  useEffect(() => {
    if (mode !== 'ready' || !current || !voiceOn) return;
    void speakCoach(current, lang, { announceReady: true });
    return () => stopCoachVoice();
  }, [mode, moveIndex, voiceOn, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === 'done' && voiceOn) {
      void speakSimple(hi ? 'सेशन पूरा। बहुत अच्छा।' : 'Session complete. Well done.', lang);
    }
    if (mode === 'hub' || mode === 'preview' || mode === 'week') stopCoachVoice();
  }, [mode, voiceOn, hi, lang]);

  const finishSession = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    stopCoachVoice();
    setMode('done');
    setPaused(false);
    const mins = Math.max(1, Math.round(elapsedSec / 60) || session.durationMin);
    completeExercise(session.id, mins);
    markScheduleDone('evening_move');
    if (!habitDoneToday.move) toggleHabit('move');
    void buzz('success');
    setTimeout(() => {
      finishing.current = false;
    }, 500);
  }, [elapsedSec, session, completeExercise, markScheduleDone, toggleHabit, habitDoneToday.move]);

  const goNextMove = useCallback(() => {
    if (moveIndex >= moves.length - 1) {
      finishSession();
      return;
    }
    setMoveIndex((i) => i + 1);
    setReadyLeft(READY_SEC);
    setMode('ready');
    void buzz('light');
  }, [moveIndex, moves.length, finishSession]);

  const afterMove = useCallback(() => {
    const rest = current?.restAfterSec ?? 0;
    if (rest > 0 && moveIndex < moves.length - 1) {
      setRestLeft(rest);
      setMode('rest');
      void buzz('light');
    } else {
      goNextMove();
    }
  }, [current, moveIndex, moves.length, goNextMove]);

  useEffect(() => {
    if (mode !== 'ready' || paused) return;
    if (readyLeft <= 0) {
      beginWork();
      return;
    }
    if (readyLeft === READY_SEC) void buzz('light');
    const id = setTimeout(() => setReadyLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [mode, readyLeft, paused, beginWork]);

  useEffect(() => {
    if (mode !== 'work' || paused || !current || current.kind !== 'timed') return;
    if (workLeft <= 0) {
      afterMove();
      return;
    }
    const id = setTimeout(() => setWorkLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [mode, workLeft, paused, current, afterMove]);

  useEffect(() => {
    if (mode !== 'rest' || paused) return;
    if (restLeft <= 0) {
      goNextMove();
      return;
    }
    const id = setTimeout(() => setRestLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [mode, restLeft, paused, goNextMove]);

  const startSession = (ex: Exercise) => {
    finishing.current = false;
    setSession(ex);
    setMoveIndex(0);
    setElapsedSec(0);
    setSkippedKind(null);
    setPaused(false);
    setReadyLeft(READY_SEC);
    setMode('ready');
    void buzz('medium');
  };

  const openPreview = (ex: Exercise) => {
    setSession(ex);
    setMoveIndex(0);
    setMode('preview');
  };

  const restartSession = () => {
    setMoveIndex(0);
    setElapsedSec(0);
    setPaused(false);
    setReadyLeft(READY_SEC);
    setMode('ready');
    void buzz('medium');
  };

  const softSkip = (reason: 'cramps' | 'exhausted' | 'not_today') => {
    stopCoachVoice();
    const label =
      reason === 'cramps'
        ? hi
          ? 'ऐंठन'
          : 'Cramps'
        : reason === 'exhausted'
          ? hi
            ? 'थकान'
            : 'Tired'
          : hi
            ? 'आज नहीं'
            : 'Not today';
    setMode('hub');
    setSkippedKind(label);
    setPaused(false);
  };

  // ——— HUB ———
  if (mode === 'hub') {
    return (
      <Screen scroll>
        <ScreenHeader
          door={`${hi ? 'मूव' : 'Move'} · ${weekday}${start === '1' ? (hi ? ' · अलार्म' : ' · alarm') : ''}`}
          title={hi ? 'आज का मूव' : 'Today’s Move'}
          subtitle={
            hi
              ? `साइकल-सिंक · ${phaseInfo.title}`
              : `Cycle-synced · ${phaseInfo.title}`
          }
        />

        <Pressable onPress={() => setShowStreak((v) => !v)} style={styles.streakToggle}>
          <Text style={styles.linkMuted}>
            {showStreak
              ? hi
                ? 'स्ट्रीक छुपाएँ'
                : 'Hide streak'
              : hi
                ? `स्ट्रीक ${active14}/14 →`
                : `Streak ${active14}/14 →`}
          </Text>
        </Pressable>
        {showStreak && (
          <View style={styles.streakCard}>
            <View style={styles.streakGrid}>
              {streak.map((d) => (
                <View key={d.date} style={styles.streakCell}>
                  <Text style={styles.streakLabel}>{d.label}</Text>
                  <View
                    style={[
                      styles.streakDot,
                      d.active && styles.streakDotOn,
                      d.isToday && styles.streakDotToday,
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.goalHead}>
          <Label>{hi ? 'आज का लक्ष्य' : "TODAY'S GOAL"}</Label>
          <Muted>
            {goalsDone}/2 {hi ? 'पूरे' : 'done'}
          </Muted>
        </View>

        <Pressable onPress={() => openPreview(todays[0])} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {(hi
                  ? todays[0].difficulty === 'Beginner'
                    ? 'बिगिनर'
                    : todays[0].difficulty === 'Intermediate'
                      ? 'इंटरमीडिएट'
                      : 'एडवांस्ड'
                  : todays[0].difficulty
                ).toUpperCase()}
              </Text>
            </View>
            <View style={styles.badgeGold}>
              <Text style={styles.badgeGoldText}>{hi ? 'आज' : 'TODAY'}</Text>
            </View>
            <Text style={styles.kcal}>+{todays[0].kcalEst}</Text>
          </View>
          <Title style={{ color: colors.white, marginTop: spacing.md, fontSize: 22 }}>
            {hi ? `दिन ${week.find((w) => w.isToday)?.dayIndex ?? 1} · ${todays[0].nameHi}` : `Day ${week.find((w) => w.isToday)?.dayIndex ?? 1} · ${todays[0].name}`}
          </Title>
          <Muted style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
            {hi ? todays[0].whyHi : todays[0].why}
          </Muted>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>{todays[0].durationMin} min</Text>
            <Text style={styles.heroDot}>·</Text>
            <Text style={styles.heroMetaText}>
              {sessionMoveCount(todays[0])} {hi ? 'मूव्स' : 'moves'}
            </Text>
            <Text style={styles.heroDot}>·</Text>
            <Text style={styles.heroMetaText}>~{todays[0].kcalEst} kcal</Text>
          </View>
          <View style={styles.startPill}>
            <Text style={styles.startPillText}>{hi ? 'शुरू' : 'Start'}</Text>
          </View>
        </Pressable>

        {/* Mindfulness goal */}
        <Pressable onPress={() => openPreview(calm)} style={styles.mindCard}>
          <View style={{ flex: 1 }}>
            <Label style={{ color: colors.tealMid }}>{hi ? 'माइंडफुलनेस' : 'MINDFULNESS'}</Label>
            <Title style={{ marginTop: 4, fontSize: 17 }}>{hi ? calm.nameHi : calm.name}</Title>
            <Muted style={{ marginTop: 4 }}>
              {calm.durationMin} min · {hi ? calm.focusHi : calm.focus} · +{calm.kcalEst}
            </Muted>
          </View>
          <Text style={styles.altStart}>{hi ? 'शुरू' : 'Start'}</Text>
        </Pressable>

        <Pressable onPress={() => setMode('week')} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>
            {hi ? '7-दिन प्लान देखें →' : 'See 7-day plan →'}
          </Text>
        </Pressable>

        {todays.length > 1 && (
          <Pressable onPress={() => setShowAlts((v) => !v)} style={{ marginTop: spacing.md }}>
            <Text style={styles.linkMuted}>
              {showAlts
                ? hi
                  ? 'और विकल्प छुपाएँ'
                  : 'Hide other options'
                : hi
                  ? 'और विकल्प →'
                  : 'Other options →'}
            </Text>
          </Pressable>
        )}
        {showAlts &&
          todays.slice(1).map((ex) => {
            const done = doneToday.some((l) => l.exerciseId === ex.id);
            return (
              <Pressable key={ex.id} onPress={() => openPreview(ex)} style={styles.altRow}>
                <View style={{ flex: 1 }}>
                  <Title style={{ fontSize: 16 }}>{hi ? ex.nameHi : ex.name}</Title>
                  <Muted style={{ marginTop: 2 }}>
                    {ex.durationMin} min · {sessionMoveCount(ex)} {hi ? 'मूव्स' : 'moves'}
                    {done ? (hi ? ' · पूरा ✓' : ' · Done ✓') : ''}
                  </Muted>
                </View>
                <Text style={styles.altStart}>{hi ? 'खोलें' : 'Open'}</Text>
              </Pressable>
            );
          })}

        {skippedKind && (
          <View style={styles.kindNote}>
            <Muted>
              {hi
                ? `स्किप · ${skippedKind}. Calm आज़माएँ — ऐप न छोड़ें।`
                : `Skipped · ${skippedKind}. Try Calm — don’t quit the app.`}
            </Muted>
            <Pressable onPress={() => openPreview(calm)} style={{ marginTop: 8 }}>
              <Text style={styles.link}>{hi ? 'Calm शुरू →' : 'Start Calm →'}</Text>
            </Pressable>
          </View>
        )}

        {doneToday.length > 0 && (
          <Muted style={{ marginTop: spacing.md }}>
            {hi ? 'आज पूरा' : 'Done today'}:{' '}
            {doneToday.map((l) => l.exerciseId.replaceAll('_', ' ')).join(' · ')}
          </Muted>
        )}
        <Disclaimer lang={lang} />
      </Screen>
    );
  }

  // ——— 7-DAY WEEK PLAN ———
  if (mode === 'week') {
    const doneDays = week.filter((d) => d.done).length;
    return (
      <Screen scroll>
        <Pressable onPress={() => setMode('hub')} hitSlop={12}>
          <Text style={styles.back}>{hi ? '← वापस' : '← Back'}</Text>
        </Pressable>
        <Display style={{ marginTop: spacing.sm }}>{hi ? 'इस हफ़्ते' : 'This week'}</Display>
        <Muted style={{ marginTop: 6 }}>
          {doneDays}/7 {hi ? 'दिन पूरे · साइकल के हिसाब से' : 'days done · cycle-aware'}
        </Muted>
        <View style={styles.progressBlock}>
          <View style={styles.progressHead}>
            <Label>{hi ? 'हफ़्ते की प्रगति' : 'Overall progress'}</Label>
            <Text style={styles.pct}>{Math.round((doneDays / 7) * 100)}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.max(3, (doneDays / 7) * 100)}%` }]} />
          </View>
        </View>
        {week.map((d) => {
          const ex = d.exerciseId ? getExercise(d.exerciseId) : null;
          return (
            <Pressable
              key={d.dayIndex}
              onPress={() => {
                if (ex) openPreview(ex);
              }}
              style={[styles.weekRow, d.isToday && styles.weekRowToday, d.done && styles.weekRowDone]}
            >
              <View style={{ flex: 1 }}>
                <Label>
                  {hi ? `दिन ${d.dayIndex}` : `Day ${d.dayIndex}`} · {hi ? d.labelHi : d.labelEn}
                  {d.isToday ? (hi ? ' · आज' : ' · today') : ''}
                </Label>
                <Title style={{ fontSize: 16, marginTop: 4 }}>{weekPlanTitle(d, lang)}</Title>
                {ex && (
                  <Muted style={{ marginTop: 2 }}>
                    {ex.durationMin} min · {sessionMoveCount(ex)} {hi ? 'मूव्स' : 'moves'}
                  </Muted>
                )}
              </View>
              {d.done ? (
                <Text style={styles.doneCheck}>✓</Text>
              ) : d.isToday && ex ? (
                <Text style={styles.altStart}>{hi ? 'शुरू' : 'Start'}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </Screen>
    );
  }

  // ——— PREVIEW ———
  if (mode === 'preview') {
    return (
      <Screen scroll>
        <Pressable onPress={() => setMode('hub')} hitSlop={12}>
          <Text style={styles.back}>{hi ? '← वापस' : '← Back'}</Text>
        </Pressable>
        <Display style={{ marginTop: spacing.sm }}>
          {hi ? session.nameHi : session.name}
        </Display>
        <Muted style={{ marginTop: 8 }}>
          {session.durationMin} min · {moves.length} {hi ? 'मूव्स' : 'moves'} · ~{session.kcalEst}{' '}
          kcal
        </Muted>
        <Muted style={{ marginTop: 6, marginBottom: spacing.md }}>
          {hi ? session.whyHi : session.why}
        </Muted>
        <Pressable
          onPress={() => {
            setVoiceOn((v) => {
              const next = !v;
              if (!next) stopCoachVoice();
              return next;
            });
          }}
          style={styles.voiceRow}
        >
          <Text style={styles.voiceLabel}>
            {voiceOn
              ? hi
                ? 'आवाज़ कोच ऑन · टैप = बंद'
                : 'Voice coach ON · tap to mute'
              : hi
                ? 'आवाज़ कोच ऑफ · टैप = चालू'
                : 'Voice coach OFF · tap to enable'}
          </Text>
        </Pressable>
        {moves.map((m, i) => (
          <View key={`${m.name}-${i}`} style={styles.moveRow}>
            <View style={styles.thumbWrap}>
              <MoveGif move={m} compact style={styles.thumb} />
              <View style={styles.moveNumOverlay}>
                <Text style={styles.moveNumText}>{i + 1}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Title style={{ fontSize: 16 }}>{hi ? m.nameHi : m.name}</Title>
              <Muted style={{ marginTop: 2 }} numberOfLines={1}>
                {formatMoveDuration(m, lang)}
              </Muted>
            </View>
          </View>
        ))}
        <Button
          label={hi ? 'शुरू करें' : 'Start session'}
          onPress={() => startSession(session)}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          label={hi ? 'दया से छोड़ें' : 'Skip kindly'}
          variant="ghost"
          onPress={() => softSkip('not_today')}
        />
      </Screen>
    );
  }

  // ——— DONE ———
  if (mode === 'done') {
    return (
      <Screen scroll>
        <Animated.View entering={FadeIn.duration(450)} style={styles.doneCard}>
          <Label style={{ color: 'rgba(255,255,255,0.55)' }}>
            {hi ? 'सेशन पूरा' : 'Session complete'}
          </Label>
          <Display style={{ color: colors.white, marginTop: 8 }}>
            {hi ? 'शानदार' : 'You showed up'}
          </Display>
          <Muted style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
            {hi
              ? `${session.nameHi} · ${fmtClock(elapsedSec)} · ~${session.kcalEst} kcal`
              : `${session.name} · ${fmtClock(elapsedSec)} · ~${session.kcalEst} kcal`}
          </Muted>
          <Muted style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>
            {hi ? `स्ट्रीक अपडेट · ${active14 + (doneToday.length ? 0 : 1)}/14` : `Streak updated · keep going`}
          </Muted>
          <Button
            label={hi ? 'होम मूव' : 'Back to Move'}
            variant="gold"
            onPress={() => setMode('hub')}
            style={{ marginTop: spacing.xl }}
          />
        </Animated.View>
        <Disclaimer lang={lang} />
      </Screen>
    );
  }

  // ——— PLAYER ———
  const playerTitle =
    mode === 'rest'
      ? hi
        ? 'आराम'
        : 'Rest'
      : hi
        ? current?.nameHi
        : current?.name;

  const bigNumber =
    mode === 'ready'
      ? String(readyLeft)
      : mode === 'rest'
        ? fmtClock(restLeft)
        : current?.kind === 'reps'
          ? `×${current.reps}`
          : fmtClock(workLeft);

  const coachLine =
    mode === 'rest'
      ? nextMove
        ? hi
          ? nextMove.coachHi
          : nextMove.coachEn
        : ''
      : hi
        ? current?.coachHi
        : current?.coachEn;

  const primaryLabel =
    mode === 'work' && current?.kind === 'reps'
      ? hi
        ? 'रेप्स पूरे'
        : 'Mark done'
      : mode === 'rest'
        ? hi
          ? 'अगला मूव'
          : 'Next move'
        : mode === 'ready'
          ? hi
            ? 'अभी शुरू'
            : 'Start now'
          : paused
            ? hi
              ? 'जारी'
              : 'Resume'
            : hi
              ? 'पॉज़'
              : 'Pause';

  const onPrimary = () => {
    if (mode === 'work' && current?.kind === 'reps') afterMove();
    else if (mode === 'rest') goNextMove();
    else if (mode === 'ready') beginWork();
    else setPaused((p) => !p);
  };

  return (
    <View
      style={[
        styles.playerRoot,
        {
          paddingTop: Math.max(insets.top, spacing.sm),
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      <View style={styles.playerTop}>
        <Pressable
          onPress={() => {
            stopCoachVoice();
            setMode('preview');
            setPaused(false);
          }}
          style={styles.topChip}
        >
          <Text style={styles.topChipText}>{hi ? 'बंद' : 'Close'}</Text>
        </Pressable>
        <Text style={styles.playerDay} numberOfLines={1}>
          {moveIndex + 1}/{moves.length}
        </Text>
        <Pressable
          onPress={() => {
            setVoiceOn((v) => {
              const next = !v;
              if (!next) stopCoachVoice();
              else if (current) void speakCoach(current, lang);
              return next;
            });
          }}
          style={[styles.topChip, voiceOn && styles.topChipOn]}
        >
          <Text style={[styles.topChipText, voiceOn && styles.topChipTextOn]}>
            {voiceOn ? (hi ? 'आवाज़' : 'Audio') : hi ? 'म्यूट' : 'Muted'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.progressBlockPlayer}>
        <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.15)', flex: 1 }]}>
          <View style={[styles.barFillLight, { width: `${Math.max(4, progressPct)}%` }]} />
        </View>
        <Text style={styles.pctLight}>{progressPct}%</Text>
      </View>

      <Animated.View key={`${mode}-${moveIndex}`} entering={FadeIn.duration(280)} style={styles.stage}>
        {(mode === 'ready' || mode === 'work') && current && (
          <MoveGif move={current} style={styles.playerGif} />
        )}
        {mode === 'rest' && nextMove && <MoveGif move={nextMove} style={styles.playerGif} />}
        <Text style={styles.stageLabel}>
          {mode === 'ready'
            ? hi
              ? 'रेडी'
              : 'READY'
            : mode === 'rest'
              ? hi
                ? 'अगला'
                : 'NEXT'
              : `${completedMoves}/${moves.length}`}
        </Text>
        <Text style={styles.stageName}>{playerTitle}</Text>
        <Text style={styles.stageTimer}>{bigNumber}</Text>
        {!!coachLine && (
          <Text style={styles.coachLine} numberOfLines={3}>
            {coachLine}
          </Text>
        )}
        {paused && <Text style={styles.pausedTag}>{hi ? 'रुका हुआ' : 'Paused'}</Text>}
      </Animated.View>

      <View style={styles.dock}>
        <View style={styles.dockRow}>
          <Pressable
            onPress={() => {
              if (moveIndex <= 0) return;
              stopCoachVoice();
              setMoveIndex((i) => i - 1);
              setReadyLeft(READY_SEC);
              setMode('ready');
            }}
            style={[styles.dockSide, moveIndex === 0 && { opacity: 0.35 }]}
          >
            <Text style={styles.dockSideText}>{hi ? 'पिछला' : 'Prev'}</Text>
          </Pressable>

          <Pressable onPress={onPrimary} style={styles.dockPrimary}>
            <Text style={styles.dockPrimaryText}>{primaryLabel}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              stopCoachVoice();
              if (mode === 'ready') beginWork();
              else if (mode === 'rest') goNextMove();
              else afterMove();
            }}
            style={styles.dockSide}
          >
            <Text style={styles.dockSideText}>
              {mode === 'ready' ? (hi ? 'स्किप' : 'Skip') : hi ? 'आगे' : 'Skip'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.dockSoft}>
          <Pressable
            onPress={() => {
              stopCoachVoice();
              softSkip('cramps');
            }}
            style={styles.dockSoftBtn}
          >
            <Text style={styles.dockSoftText}>{hi ? 'ऐंठन' : 'Cramps'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              stopCoachVoice();
              softSkip('exhausted');
            }}
            style={styles.dockSoftBtn}
          >
            <Text style={styles.dockSoftText}>{hi ? 'थकान' : 'Tired'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (current && voiceOn) void speakCoach(current, lang);
            }}
            style={styles.dockSoftBtn}
          >
            <Text style={styles.dockSoftText}>{hi ? 'दोहराएँ' : 'Replay'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  streakToggle: { marginBottom: spacing.sm },
  linkMuted: { fontFamily: fonts.bodyMedium, color: colors.muted, fontSize: 13 },
  kindNote: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  streakCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadow.soft,
  },
  streakHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  streakCell: { width: '13%', alignItems: 'center', marginBottom: 4 },
  streakLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.muted, marginBottom: 4 },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.mist,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  streakDotOn: { backgroundColor: colors.tealMid },
  streakDotToday: { borderColor: colors.forest, borderWidth: 2 },
  legend: { flexDirection: 'row', gap: 16, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  goalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hero: {
    backgroundColor: colors.forest,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.soft,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.blush, letterSpacing: 0.6 },
  badgeGold: {
    backgroundColor: colors.amber,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeGoldText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink, letterSpacing: 0.6 },
  kcal: { marginLeft: 'auto', fontFamily: fonts.bodyBold, color: colors.blush, fontSize: 14 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: 6, flexWrap: 'wrap' },
  heroMetaText: { fontFamily: fonts.bodyMedium, color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  heroDot: { color: 'rgba(255,255,255,0.35)' },
  startPill: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: colors.blush,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  startPillText: { fontFamily: fonts.bodyBold, color: colors.forest, fontSize: 15 },
  mindCard: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mist,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  link: { fontFamily: fonts.bodyBold, color: colors.blushDeep, fontSize: 15 },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  altStart: { fontFamily: fonts.bodyBold, color: colors.tealMid, fontSize: 14 },
  back: { fontFamily: fonts.bodyBold, color: colors.tealMid, fontSize: 15 },
  weekRow: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.soft,
  },
  weekRowToday: { borderWidth: 2, borderColor: colors.forest },
  weekRowDone: { opacity: 0.85 },
  doneCheck: { fontFamily: fonts.bodyBold, color: colors.good, fontSize: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md, marginBottom: spacing.md },
  chip: {
    backgroundColor: colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  chipText: { fontFamily: fonts.bodyMedium, color: colors.forest, fontSize: 13 },
  progressBlock: { marginVertical: spacing.md },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pct: { fontFamily: fonts.bodyBold, color: colors.forest, fontSize: 14 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mistDeep,
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: { height: 8, backgroundColor: colors.forest, borderRadius: 4 },
  barFillLight: { height: 6, backgroundColor: colors.blush, borderRadius: 3 },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  thumbWrap: { width: 72, height: 72, borderRadius: radii.sm, overflow: 'hidden' },
  thumb: { width: 72, height: 72, aspectRatio: 1, borderRadius: radii.sm },
  moveNumOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveNumText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 11 },
  moveDur: { fontFamily: fonts.bodyBold, color: colors.amber, fontSize: 14, paddingTop: 4 },
  voiceRow: {
    marginBottom: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.mist,
    alignSelf: 'flex-start',
  },
  voiceLabel: { fontFamily: fonts.bodyMedium, color: colors.forest, fontSize: 13 },
  playerGif: {
    width: '78%',
    maxWidth: 280,
    aspectRatio: 1,
    marginBottom: spacing.sm,
    borderRadius: radii.xl,
  },
  footerActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.sm },
  doneCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.forest,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  playerRoot: {
    flex: 1,
    backgroundColor: colors.forest,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  playerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  playerBack: { fontFamily: fonts.bodyBold, color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  playerDay: {
    fontFamily: fonts.bodyBold,
    color: colors.white,
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  progressBlockPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.md,
  },
  pctLight: { fontFamily: fonts.bodyBold, color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stageLabel: {
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  stageName: {
    fontFamily: fonts.displayBold,
    color: colors.white,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  stageTimer: {
    fontFamily: fonts.displayBold,
    color: colors.blush,
    fontSize: 52,
    letterSpacing: -1.5,
    marginTop: spacing.sm,
  },
  coachLine: {
    marginTop: spacing.sm,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  pausedTag: {
    marginTop: spacing.sm,
    fontFamily: fonts.bodyBold,
    color: colors.amber,
    fontSize: 13,
  },
  topChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  topChipOn: { backgroundColor: colors.blush },
  topChipText: { fontFamily: fonts.bodyBold, color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  topChipTextOn: { color: colors.forest },
  dock: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 28,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dockRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dockSide: {
    minWidth: 76,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  dockSideText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 13 },
  dockPrimary: {
    flex: 1,
    paddingVertical: 17,
    borderRadius: 18,
    backgroundColor: colors.amber,
    alignItems: 'center',
  },
  dockPrimaryText: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16, letterSpacing: 0.2 },
  dockSoft: { flexDirection: 'row', gap: 8 },
  dockSoftBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  dockSoftText: {
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
  },
});
