import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { aiIsLive } from '@/src/features/aiClient';
import { reportContent, type ReportReason } from '@/src/features/moderation';
import { colors, fonts, gradients, radii, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { Ionicons, type IconName } from '@/src/ui/Icon';

type Chip = { icon: IconName; label: string; prompt: string };

const CHIPS_EN: Chip[] = [
  { icon: 'restaurant', label: 'Mess food tips', prompt: 'Mess food tips?' },
  { icon: 'ice-cream', label: 'Night cravings', prompt: 'Cravings at night' },
  { icon: 'calendar', label: 'Irregular periods', prompt: 'Irregular periods' },
  { icon: 'flask', label: 'Explain my labs', prompt: 'Explain my labs' },
  { icon: 'barbell', label: 'Today’s workout', prompt: 'Best exercise today' },
  { icon: 'sparkles', label: 'Acne & hair', prompt: 'Acne & hair fall' },
  { icon: 'people', label: 'Family pressure', prompt: 'Family pressure script' },
  { icon: 'moon', label: 'Bad day', prompt: 'Bad day — what now?' },
];
const CHIPS_HI: Chip[] = [
  { icon: 'restaurant', label: 'मेस खाना', prompt: 'मेस खाना टिप्स?' },
  { icon: 'ice-cream', label: 'रात की क्रेविंग', prompt: 'रात की क्रेविंग' },
  { icon: 'calendar', label: 'अनियमित पीरियड', prompt: 'अनियमित पीरियड' },
  { icon: 'flask', label: 'लैब समझाएँ', prompt: 'लैब समझाएँ' },
  { icon: 'barbell', label: 'आज एक्सरसाइज़', prompt: 'आज बेस्ट एक्सरसाइज़' },
  { icon: 'sparkles', label: 'मुंहासे/बाल', prompt: 'मुंहासे और बाल झड़ना' },
  { icon: 'people', label: 'परिवार दबाव', prompt: 'परिवार दबाव स्क्रिप्ट' },
  { icon: 'moon', label: 'खराब दिन', prompt: 'खराब दिन — क्या करें?' },
];

export default function Coach() {
  const chat = useAppStore((s) => s.chat);
  const busy = useAppStore((s) => s.chatBusy);
  const sendChat = useAppStore((s) => s.sendChat);
  const clearChat = useAppStore((s) => s.clearChat);
  const reportedIds = useAppStore((s) => s.reportedIds);
  const markReported = useAppStore((s) => s.markReported);
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const [text, setText] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => () => void Speech.stop(), []);
  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [chat.length, busy]);

  const send = (msg?: string) => {
    const t = (msg ?? text).trim();
    if (!t || busy) return;
    setText('');
    void sendChat(t);
  };

  const listen = async (id: string, body: string) => {
    if (speakingId === id) {
      await Speech.stop();
      setSpeakingId(null);
      return;
    }
    await Speech.stop();
    setSpeakingId(id);
    Speech.speak(body, {
      language: hi ? 'hi-IN' : 'en-IN',
      onDone: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const chips = hi ? CHIPS_HI : CHIPS_EN;

  const report = (id: string, body: string) => {
    const send = (reason: ReportReason) => {
      void reportContent('ai', id, body, reason);
      markReported(id);
    };
    Alert.alert(hi ? 'इस जवाब को रिपोर्ट करें?' : 'Report this answer?', hi ? 'हम AI जवाबों की समीक्षा करके कोच सुधारते हैं।' : 'We review reported AI answers to improve the coach.', [
      { text: hi ? 'गलत / नुकसानदेह' : 'Wrong or harmful', onPress: () => send('harmful_health') },
      { text: hi ? 'अपमानजनक' : 'Offensive', onPress: () => send('harassment') },
      { text: hi ? 'रद्द' : 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <LinearGradient colors={[...gradients.ai]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Ionicons name="sparkles" size={20} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{hi ? 'नारीकेयर AI' : 'NariCare AI'}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: aiIsLive ? colors.good : colors.amber }]} />
            <Text style={styles.status}>
              {aiIsLive
                ? hi ? 'लाइव · आपके साइकल और प्लेट को जानती है' : 'Live · knows your cycle & plate'
                : hi ? 'ऑन-डिवाइस कोच' : 'On-device coach'}
            </Text>
          </View>
        </View>
        <Pressable onPress={clearChat} hitSlop={10} style={styles.clear}>
          <Ionicons name="trash-outline" size={20} color={colors.muted} />
        </Pressable>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <FlatList
          ref={listRef}
          data={chat}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.lg }}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              <Text style={styles.hello}>{hi ? 'आज क्या पूछना है?' : 'What do you need today?'}</Text>
              <Text style={styles.helloSub}>
                {hi
                  ? 'भोजन, साइकल, क्रेविंग, लैब — सादे शब्दों में। दवा की खुराक कभी नहीं।'
                  : 'Food, cycle, cravings, labs — plain language. Never dosing advice.'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
                {chips.map((c) => (
                  <Pressable key={c.label} onPress={() => send(c.prompt)} style={styles.chip}>
                    <Ionicons name={c.icon} size={15} color={colors.blushDeep} />
                    <Text style={styles.chipText}>{c.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          }
          ListFooterComponent={
            busy ? (
              <View style={[styles.bubble, styles.aiBubble, { flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={colors.blushDeep} />
                <Text style={styles.thinking}>{hi ? 'सोच रही हूँ…' : 'Thinking…'}</Text>
              </View>
            ) : undefined
          }
          renderItem={({ item }) =>
            item.role === 'user' ? (
              <LinearGradient
                colors={['#FF8A7A', '#E24B5A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bubble, styles.userBubble]}
              >
                <Text style={[styles.bubbleText, { color: '#fff' }]}>{item.text}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.bubble, styles.aiBubble]}>
                <Text style={styles.bubbleText}>{item.text}</Text>
                <View style={styles.bubbleActions}>
                <Pressable onPress={() => listen(item.id, item.text)} style={styles.listen} hitSlop={8}>
                  <Ionicons
                    name={speakingId === item.id ? 'stop-circle' : 'volume-high'}
                    size={16}
                    color={colors.blushDeep}
                  />
                  <Text style={styles.listenText}>
                    {speakingId === item.id ? (hi ? 'रोकें' : 'Stop') : hi ? 'सुनें' : 'Listen'}
                  </Text>
                </Pressable>
                {item.id !== 'welcome' ? (
                  reportedIds.includes(item.id) ? (
                    <Text style={styles.reported}>{hi ? 'रिपोर्ट किया गया' : 'Reported'}</Text>
                  ) : (
                    <Pressable onPress={() => report(item.id, item.text)} style={styles.listen} hitSlop={8}>
                      <Ionicons name="flag-outline" size={14} color={colors.muted} />
                      <Text style={[styles.listenText, { color: colors.muted }]}>{hi ? 'रिपोर्ट' : 'Report'}</Text>
                    </Pressable>
                  )
                ) : null}
                </View>
              </View>
            )
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={hi ? 'PCOS, भोजन, साइकल, लैब पूछें…' : 'Ask about PCOS, food, cycle, labs…'}
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            onSubmitEditing={() => send()}
          />
          <Pressable onPress={() => send()} disabled={busy || !text.trim()} style={{ opacity: busy || !text.trim() ? 0.45 : 1 }}>
            <LinearGradient colors={['#FF8A7A', '#E24B5A']} style={styles.send}>
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF6F3' },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadowCard,
    zIndex: 2,
  },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.ink, letterSpacing: -0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  status: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted },
  clear: { padding: 8 },
  hello: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, letterSpacing: -0.6, marginTop: spacing.sm },
  helloSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 6, maxWidth: 320 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    marginRight: 8,
    ...shadowCard,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  bubble: { maxWidth: '88%', padding: 14, borderRadius: 20, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 6, ...shadowCard, shadowOpacity: 0.06, elevation: 2 },
  bubbleText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  thinking: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
  listen: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bubbleActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  reported: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted },
  listenText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.blushDeep },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    ...shadowCard,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
