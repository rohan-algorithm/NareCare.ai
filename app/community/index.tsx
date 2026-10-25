import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

export default function Community() {
  const posts = useAppStore((s) => s.posts);
  const addPost = useAppStore((s) => s.addPost);
  const toggleUpvote = useAppStore((s) => s.toggleUpvote);
  const addComment = useAppStore((s) => s.addComment);
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

  const filtered = cat === 'all' ? posts : posts.filter((p) => p.category === cat);

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
    addPost({ category: newCat, title: title.trim(), body: body.trim(), isAnonymous: anonymous });
    setTitle('');
    setBody('');
    setComposing(false);
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

        {filtered.length === 0 && (
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
                <Pressable onPress={() => toggleUpvote(p.id)}>
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
                      addComment(p.id, t, true);
                      setCommentDraft((d) => ({ ...d, [p.id]: '' }));
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
