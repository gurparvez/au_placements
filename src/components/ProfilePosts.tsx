import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Repeat2, Newspaper } from 'lucide-react';
import postsApi, { type Post } from '@/api/posts';

const timeLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const PostRow: React.FC<{ p: Post }> = ({ p }) => (
  <article style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
    {p.content && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{p.content}</p>}
    {p.media?.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: p.media.length === 1 ? '1fr' : '1fr 1fr', gap: 6, marginTop: p.content ? 10 : 0 }}>
        {p.media.slice(0, 4).map((m, i) => (
          <img key={i} src={m.url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
        ))}
      </div>
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>
      <span>{timeLabel(p.createdAt)}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Heart size={13} /> {p.reaction_count}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MessageCircle size={13} /> {p.comment_count}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Repeat2 size={13} /> {p.share_count}</span>
      {p.archived && <span style={{ fontStyle: 'italic' }}>Archived</span>}
    </div>
  </article>
);

/** Compact, read-only list of a user's posts for their profile page. */
const ProfilePosts: React.FC<{ userId: string; limit?: number }> = ({ userId, limit = 5 }) => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await postsApi.listByUser(userId, { limit });
        if (!cancelled) { setPosts(res.data); setTotal(res.pagination.total); }
      } catch {
        if (!cancelled) setPosts([]);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, limit]);

  if (posts === null) return <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Loading posts…</p>;
  if (posts.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '24px 0', color: 'var(--text-muted)' }}>
      <Newspaper size={22} style={{ opacity: 0.5 }} />
      <span style={{ fontSize: 13.5 }}>No posts yet.</span>
    </div>
  );

  return (
    <div>
      {posts.map((p) => <PostRow key={p._id} p={p} />)}
      {total > posts.length && <p style={{ fontSize: 12.5, color: 'var(--text-subtle)', margin: '12px 0 0' }}>Showing {posts.length} of {total} posts.</p>}
    </div>
  );
};

export default ProfilePosts;
