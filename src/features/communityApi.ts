import { useCallback, useEffect, useState } from 'react';

import { getUserId } from '@/src/lib/identity';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { useAppStore, type CommunityPost } from '@/src/store/useAppStore';

type Row = {
  id: string;
  category: CommunityPost['category'];
  title: string;
  body: string;
  is_anonymous: boolean;
  created_at: string;
  community_comments: { id: string; body: string; is_anonymous: boolean; created_at: string }[];
  post_upvotes: { user_id: string }[];
};

function toPost(r: Row, me: string): CommunityPost {
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    body: r.body,
    isAnonymous: r.is_anonymous,
    upvotes: r.post_upvotes.length,
    upvotedByMe: r.post_upvotes.some((u) => u.user_id === me),
    comments: [...r.community_comments]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({ id: c.id, body: c.body, isAnonymous: c.is_anonymous, createdAt: c.created_at })),
    createdAt: r.created_at,
  };
}

/**
 * Real, shared community when the backend is configured. Without it, posts stay
 * on this phone and the screen says so: no sample posts pretending to be people.
 */
export function useCommunity() {
  const local = useAppStore((s) => s.posts);
  const addLocal = useAppStore((s) => s.addPost);
  const upvoteLocal = useAppStore((s) => s.toggleUpvote);
  const commentLocal = useAppStore((s) => s.addComment);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const me = await getUserId();
      const { data, error: e } = await supabase
        .from('community_posts')
        .select('id, category, title, body, is_anonymous, created_at, community_comments(id, body, is_anonymous, created_at), post_upvotes(user_id)')
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .limit(60);
      if (e) throw e;
      setPosts(((data ?? []) as Row[]).map((r) => toPost(r, me)));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = async (p: Pick<CommunityPost, 'category' | 'title' | 'body' | 'isAnonymous'>) => {
    if (!isSupabaseConfigured) return addLocal(p);
    const me = await getUserId();
    const { error: e } = await supabase.from('community_posts').insert({ user_id: me, category: p.category, title: p.title, body: p.body, is_anonymous: p.isAnonymous });
    if (e) throw e;
    await refresh();
  };

  const upvote = async (post: CommunityPost) => {
    if (!isSupabaseConfigured) return upvoteLocal(post.id);
    const me = await getUserId();
    setPosts((cur) => cur.map((x) => (x.id === post.id ? { ...x, upvotedByMe: !x.upvotedByMe, upvotes: x.upvotes + (x.upvotedByMe ? -1 : 1) } : x)));
    const q = post.upvotedByMe
      ? supabase.from('post_upvotes').delete().eq('user_id', me).eq('post_id', post.id)
      : supabase.from('post_upvotes').insert({ user_id: me, post_id: post.id });
    const { error: e } = await q;
    if (e) void refresh();
  };

  const comment = async (postId: string, body: string, isAnonymous: boolean) => {
    if (!isSupabaseConfigured) return commentLocal(postId, body, isAnonymous);
    const me = await getUserId();
    const { error: e } = await supabase.from('community_comments').insert({ post_id: postId, user_id: me, body, is_anonymous: isAnonymous });
    if (e) throw e;
    await refresh();
  };

  return { live: isSupabaseConfigured, posts: isSupabaseConfigured ? posts : local, loading, error, refresh, create, upvote, comment };
}
