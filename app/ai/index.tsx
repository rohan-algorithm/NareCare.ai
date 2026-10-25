import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

const QUICK_EN = [
  'Mess food tips?',
  'Cravings at night',
  'Irregular periods',
  'Explain my labs',
  'Best exercise today',
  'Acne & hair fall',
  'Family pressure script',
  'Bad day — what now?',
];
const QUICK_HI = [
  'मेस खाना टिप्स?',
  'रात की क्रेविंग',
  'अनियमित पीरियड',
  'लैब समझाएँ',
  'आज बेस्ट एक्सरसाइज़',
  'मुंहासे और बाल झड़ना',
  'परिवार दबाव स्क्रिप्ट',
  'खराब दिन — क्या करें?',
];

export default function AiCoach() {
  const insets = useSafeAreaInsets();
  const chat = useAppStore((s) => s.chat);
  const sendChat = useAppStore((s) => s.sendChat);
  const clearChat = useAppStore((s) => s.clearChat);
  const lang = useAppStore((s) => s.profile?.language ?? 'en');
  const hi = lang === 'hi';
  const QUICK = hi ? QUICK_HI : QUICK_EN;
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = (msg?: string) => {
    const t = (msg ?? text).trim();
    if (!t) return;
    sendChat(t);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'AI कोच' : 'AI Coach',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
          headerRight: () => (
            <Pressable onPress={clearChat} style={{ paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: fonts.bodyMedium, color: colors.tealMid }}>
                {hi ? 'साफ़' : 'Clear'}
              </Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <FlatList
          ref={listRef}
          data={chat}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.md }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {hi ? 'आज क्या पूछना है?' : 'What do you need today?'}
              </Text>
              <Text style={styles.emptyBody}>
                {hi
                  ? 'भोजन, साइकल, क्रेविंग, लैब — सादे शब्दों में। दवा की खुराक कभी नहीं।'
                  : 'Food, cycle, cravings, labs — plain language. Never dosing advice.'}
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.quickWrap}>
              {QUICK.slice(0, 5).map((q) => (
                <Pressable key={q} onPress={() => send(q)} style={styles.quick}>
                  <Text style={styles.quickText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[styles.bubbleText, item.role === 'user' && { color: colors.white }]}>
                {item.text}
              </Text>
            </View>
          )}
        />
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              hi ? 'PCOS, भोजन, साइकल, लैब पूछें…' : 'Ask about PCOS, food, cycle, labs…'
            }
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <Pressable onPress={() => send()} style={styles.send}>
            <Text style={styles.sendText}>{hi ? 'भेजें' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  empty: { marginBottom: spacing.lg, paddingTop: spacing.sm },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginTop: 8,
    maxWidth: 320,
  },
  quickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  quick: {
    backgroundColor: colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  quickText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.blushDeep },
  bubble: {
    maxWidth: '88%',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.blushDeep,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.blush,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.paperDeep,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    backgroundColor: colors.blushDeep,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendText: { fontFamily: fonts.bodyBold, color: colors.white },
});
