import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@/src/ui/Icon';
import { postViolation, reportContent, type ReportReason } from '@/src/features/moderation';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Chip } from '@/src/ui/Chip';
import { Card } from '@/src/ui/Card';
import { Button } from '@/src/ui/Button';
import { EmptyState } from '@/src/ui/EmptyState';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, radii, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { useCommunity } from '@/src/features/communityApi';

export default function Community() {
  const { live, posts, loading, error, refresh, create, upvote, comment } = useCommunity();
  const hiddenPostIds = useAppStore((s) => s.hiddenPostIds);
  const hidePost = useAppStore((s) => s.hidePost);
  const lang = useAppStore((s) => s.profile?.language ?? 'en');
  const hi = lang === 'hi';

  const [cat, setCat] = useState('all');
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [newCat, setNewCat] = useState<'diet_tips' | 'success_stories' | 'questions' | 'emotional_support'>('questions');
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = posts.filter((p) => !hiddenPostIds.includes(p.id));
  const filtered = cat === 'all' ? visible : visible.filter((p) => p.category === cat);

  const sendReport = (id: string, text: string, reason: ReportReason) => {
    void reportContent('post', id, text, reason);
    hidePost(id);
    Alert.alert(hi ? 'धन्यवाद' : 'Thank you', hi ? 'यह पोस्ट आपके लिए छिपा दी गई और मॉडरेटर को भेज दी गई।' : 'The post is hidden for you and sent to our moderators.');
  };

  const postMenu = (id: string, text: string) => {
    Alert.alert(hi ? 'इस पोस्ट के साथ' : 'This post', undefined, [
      {
        text: hi ? 'रिपोर्ट करें' : 'Report',
        onPress: () =>
          Alert.alert(hi ? 'क्या गलत है?' : 'What’s wrong?', undefined, [
            { text: hi ? 'नुकसानदेह सेहत सलाह' : 'Harmful health advice', onPress: () => sendReport(id, text, 'harmful_health') },
            { text: hi ? 'अपमान / नफ़रत' : 'Harassment or hate', onPress: () => sendReport(id, text, 'harassment') },
            { text: hi ? 'स्पैम / बिक्री' : 'Spam or selling', onPress: () => sendReport(id, text, 'spam') },
          ]),
      },
      { text: hi ? 'मेरे लिए छिपाएँ' : 'Hide for me', onPress: () => hidePost(id) },
      { text: hi ? 'रद्द' : 'Cancel', style: 'cancel' },
    ]);
  };

  const catLabel = (id: string) => {
    const map: Record<string, [string, string]> = {
      diet_tips: ['Diet', 'डाइट'],
      success_stories: ['Wins', 'जीत'],
      questions: ['Ask', 'पूछें'],
      emotional_support: ['Support', 'सपोर्ट'],
    };
    const pair = map[id];
    return pair ? (hi ? pair[1] : pair[0]) : id.replace('_', ' ');
  };

  const publish = () => {
    if (!title.trim() || !body.trim()) return;
    const v = postViolation(`${title} ${body}`);
    if (v) {
      Alert.alert(
        hi ? 'यह पोस्ट नहीं हो सकता' : 'Can’t post this',
        v === 'phone'
          ? hi ? 'अपनी सुरक्षा के लिए फ़ोन नंबर शेयर न करें।' : 'For your safety, don’t share phone numbers.'
          : hi ? 'लिंक की अनुमति नहीं है।' : 'Links aren’t allowed in the community.',
      );
      return;
    }
    create({ category: newCat, title: title.trim(), body: body.trim(), isAnonymous: anonymous })
      ?.then(() => {
        setTitle('');
        setBody('');
        setComposing(false);
      })
      .catch(() => Alert.alert(hi ? 'पोस्ट नहीं हुआ' : 'Couldn’t post', hi ? 'इंटरनेट जाँचें और फिर कोशिश करें।' : 'Check your internet and try again.'));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: hi ? 'कम्युनिटी' : 'Community',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{hi ? 'प्राइवेसी पहले' : 'Privacy first'}</Label>
          <Display style={{ marginTop: 6 }}>
            {hi ? 'आप यहाँ\nअकेली नहीं' : 'You’re not\nalone here'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {hi
              ? 'डिफ़ॉल्ट अनाम। रिपोर्ट → मानव मॉड। भारत-केंद्रित विषय स्वागत हैं।'
              : 'Anonymous-by-default. Flag → human mod. India-specific topics welcome.'}
          </Body>
        </Animated.View>

        <Button
          label={
            composing
              ? hi
                ? 'बंद करें'
                : 'Close composer'
              : hi
                ? 'पोस्ट लिखें'
                : 'Write a post'
          }
          variant={composing ? 'secondary' : 'primary'}
          onPress={() => setComposing((v) => !v)}
          style={{ marginTop: spacing.lg }}
        />

        {composing && (
          <Card tone="solid" style={{ marginTop: spacing.md }}>
            <Label>{hi ? 'श्रेणी' : 'Category'}</Label>
            <View style={[styles.wrap, { marginTop: 8 }]}>
              {(
                [
                  ['diet_tips', hi ? 'डाइट' : 'Diet'],
                  ['success_stories', hi ? 'जीत' : 'Wins'],
                  ['questions', hi ? 'पूछें' : 'Ask'],
                  ['emotional_support', hi ? 'सपोर्ट' : 'Support'],
                ] as const
              ).map(([id, label]) => (
                <Chip key={id} label={label} selected={newCat === id} tone="rose" onPress={() => setNewCat(id)} />
              ))}
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={hi ? 'शीर्षक' : 'Title'}
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={hi ? 'अपनी कहानी या सवाल लिखें…' : 'Share your story or question…'}
              placeholderTextColor={colors.muted}
              style={[styles.input, { minHeight: 90, marginTop: 8 }]}
              multiline
            />
            <Pressable onPress={() => setAnonymous((a) => !a)} style={styles.anonRow}>
              <View style={[styles.check, anonymous && styles.checkOn]}>
                <Text style={{ color: anonymous ? colors.white : colors.muted }}>{anonymous ? '✓' : ''}</Text>
              </View>
              <Muted>{hi ? 'अनाम पोस्ट' : 'Post anonymously'}</Muted>
            </Pressable>
            <Muted style={{ marginTop: spacing.sm, fontSize: 12 }}>
              {hi
                ? 'नियम: दया रखें, दवा की खुराक न बताएँ, कुछ न बेचें, फ़ोन नंबर/लिंक नहीं। उल्लंघन हटाए जाते हैं।'
                : 'Rules: be kind, no medicine doses, no selling, no phone numbers or links. Violations are removed.'}
            </Muted>
            <Button
              label={hi ? 'पब्लिश' : 'Publish'}
              onPress={publish}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        <View style={[styles.wrap, { marginTop: spacing.lg }]}>
          {(hi
            ? [
                ['all', 'सब'],
                ['diet_tips', 'डाइट'],
                ['success_stories', 'जीत'],
                ['questions', 'पूछें'],
                ['emotional_support', 'सपोर्ट'],
              ]
            : [
                ['all', 'All'],
                ['diet_tips', 'Diet'],
                ['success_stories', 'Wins'],
                ['questions', 'Ask'],
                ['emotional_support', 'Support'],
              ]
          ).map(([id, label]) => (
            <Chip key={id} label={label} selected={cat === id} tone="rose" onPress={() => setCat(id)} />
          ))}
        </View>

        {!live ? (
          <Card tone="rose" style={{ marginTop: spacing.lg }}>
            <Muted>
              {hi
                ? 'कम्युनिटी सर्वर अभी जुड़ा नहीं है। आपकी पोस्ट सिर्फ़ इस फ़ोन पर सेव होंगी।'
                : 'The community server isn’t connected yet. Your posts are saved on this phone only.'}
            </Muted>
          </Card>
        ) : error ? (
          <Pressable onPress={() => void refresh()} style={{ marginTop: spacing.lg }}>
            <Muted>{hi ? 'पोस्ट लोड नहीं हुईं। फिर कोशिश करने के लिए टैप करें।' : 'Couldn’t load posts. Tap to try again.'}</Muted>
          </Pressable>
        ) : loading && !posts.length ? (
          <Muted style={{ marginTop: spacing.lg }}>{hi ? 'लोड हो रहा है…' : 'Loading…'}</Muted>
        ) : null}

        {!loading && filtered.length === 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <EmptyState
              title={hi ? 'इस लेन में अभी पोस्ट नहीं' : 'No posts in this lane yet'}
              body={
                hi
                  ? 'पहले बनें — अनाम डिफ़ॉल्ट ऑन है।'
                  : 'Be the first — anonymous is on by default.'
              }
              cta={hi ? 'पोस्ट लिखें' : 'Write a post'}
              onPress={() => setComposing(true)}
            />
          </View>
        )}

        {filtered.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(40 * i).duration(350)}>
            <Card tone="solid" style={{ marginTop: spacing.md }}>
              <Pressable onPress={() => postMenu(p.id, `${p.title}\n${p.body}`)} hitSlop={12} style={styles.more}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.muted} />
              </Pressable>
              <Muted>
                {p.isAnonymous
                  ? hi
                    ? 'अनाम'
                    : 'Anonymous'
                  : hi
                    ? 'सदस्य'
                    : 'Member'}{' '}
                · {catLabel(p.category)}
              </Muted>
              <Title style={{ marginTop: 8, fontSize: 18 }}>{p.title}</Title>
              <Body style={{ marginTop: 8 }}>{p.body}</Body>
              <View style={styles.actions}>
                <Pressable onPress={() => void upvote(p)}>
                  <Text style={[styles.up, p.upvotedByMe && { color: colors.amber }]}>
                    ▲ {p.upvotes}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setOpenId(openId === p.id ? null : p.id)}>
                  <Text style={styles.commentBtn}>
                    {hi
                      ? `${p.comments.length} कमेंट · ${openId === p.id ? 'छुपाएँ' : 'जवाब'}`
                      : `${p.comments.length} comments · ${openId === p.id ? 'Hide' : 'Reply'}`}
                  </Text>
                </Pressable>
              </View>
              {openId === p.id && (
                <View style={{ marginTop: spacing.md }}>
                  {p.comments.map((c) => (
                    <View key={c.id} style={styles.comment}>
                      <Muted>
                        {c.isAnonymous
                          ? hi
                            ? 'अनाम'
                            : 'Anonymous'
                          : hi
                            ? 'सदस्य'
                            : 'Member'}
                      </Muted>
                      <Text style={styles.commentBody}>{c.body}</Text>
                    </View>
                  ))}
                  <TextInput
                    value={commentDraft[p.id] ?? ''}
                    onChangeText={(t) => setCommentDraft((d) => ({ ...d, [p.id]: t }))}
                    placeholder={hi ? 'कमेंट लिखें…' : 'Write a comment…'}
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                  />
                  <Button
                    label={hi ? 'कमेंट' : 'Comment'}
                    variant="secondary"
                    onPress={() => {
                      const t = (commentDraft[p.id] ?? '').trim();
                      if (!t) return;
                      if (postViolation(t)) {
                        Alert.alert(hi ? 'यह कमेंट नहीं हो सकता' : 'Can’t post this', hi ? 'फ़ोन नंबर या लिंक की अनुमति नहीं है।' : 'Phone numbers and links aren’t allowed.');
                        return;
                      }
                      void Promise.resolve(comment(p.id, t, true)).then(() => setCommentDraft((d) => ({ ...d, [p.id]: '' })));
                    }}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}
            </Card>
          </Animated.View>
        ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  more: { position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    marginTop: spacing.sm,
    backgroundColor: colors.mist,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 15,
  },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.blushDeep, borderColor: colors.blushDeep },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  up: { fontFamily: fonts.bodyBold, color: colors.tealMid, fontSize: 14 },
  commentBtn: { fontFamily: fonts.bodyMedium, color: colors.muted, fontSize: 13 },
  comment: {
    backgroundColor: colors.mist,
    borderRadius: radii.sm,
    padding: 10,
    marginBottom: 8,
  },
  commentBody: { fontFamily: fonts.body, color: colors.ink, marginTop: 2, lineHeight: 20 },
});
