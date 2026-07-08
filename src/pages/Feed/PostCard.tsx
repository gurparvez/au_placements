import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageSquare, Repeat2, Trash2, CornerDownRight, Archive, ArchiveRestore } from 'lucide-react';
import postsApi, { type Post, type Comment, type MentionUser, type ReactionType, type PostAuthor } from '@/api/posts';
import type { UserData } from '@/api/auth';
import { avatarColor, initials } from '@/utils/avatar';
import { REACTION_META, REACTION_ORDER } from './reactions';
import { renderRichText } from './richText';
import MentionTextarea from './MentionTextarea';

const fullName = (u?: { firstName?: string; lastName?: string } | null) => `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
const timeLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const Avatar: React.FC<{ u?: { firstName?: string; lastName?: string } | null; size?: number }> = ({ u, size = 42 }) => {
  const name = fullName(u);
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: size / 2.6, color: '#fff', background: avatarColor(name) }}>
      {initials(u?.firstName, u?.lastName) || 'U'}
    </span>
  );
};

// Links to a profile when the author is a student (public profiles exist for students).
const ProfileLink: React.FC<{ u?: PostAuthor | null; style?: React.CSSProperties; children: React.ReactNode }> = ({ u, style, children }) => {
  if (u && u.roles?.includes('student')) {
    return (
      <Link
        to={`/profiles/${u._id}`}
        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', ...style }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        {children}
      </Link>
    );
  }
  return <span style={style}>{children}</span>;
};

const roleChip = (roles?: string[]) =>
  roles?.includes('recruiter') ? (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Recruiter</span>
  ) : null;

interface Props {
  post: Post;
  currentUser: UserData | null;
  onDeleted: (id: string) => void;
  onShared: () => void;
}

const PostCard: React.FC<Props> = ({ post, currentUser, onDeleted, onShared }) => {
  const [p, setP] = useState<Post>(post);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentMentions, setCommentMentions] = useState<MentionUser[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareQuote, setShareQuote] = useState('');
  const [busy, setBusy] = useState(false);

  const canManage = !!currentUser && (currentUser._id === p.author?._id || currentUser.roles?.includes('admin'));
  const requireAuth = () => {
    if (!currentUser) { toast.error('Sign in to interact with posts.'); return false; }
    return true;
  };

  const react = async (type: ReactionType) => {
    if (!requireAuth()) return;
    setShowReactions(false);
    try {
      const r = await postsApi.react(p._id, type);
      setP((prev) => ({ ...prev, my_reaction: r.my_reaction, reaction_count: r.reaction_count }));
    } catch { toast.error('Could not react.'); }
  };

  const loadComments = async () => {
    try { setComments(await postsApi.listComments(p._id)); } catch { toast.error('Could not load comments.'); }
  };
  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) loadComments();
  };

  const submitComment = async () => {
    if (!requireAuth() || !commentText.trim()) return;
    setBusy(true);
    try {
      const mentionIds = commentMentions.filter((m) => commentText.includes(`@${fullName(m)}`)).map((m) => m._id);
      await postsApi.addComment(p._id, { content: commentText.trim(), parent: replyTo || undefined, mentions: mentionIds });
      setCommentText(''); setCommentMentions([]); setReplyTo(null);
      setP((prev) => ({ ...prev, comment_count: prev.comment_count + 1 }));
      await loadComments();
    } catch { toast.error('Could not add comment.'); }
    finally { setBusy(false); }
  };

  const removeComment = async (c: Comment) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await postsApi.deleteComment(c._id);
      await loadComments();
      // count is recomputed on next feed load; adjust optimistically
      setP((prev) => ({ ...prev, comment_count: Math.max(0, prev.comment_count - 1) }));
    } catch { toast.error('Could not delete comment.'); }
  };

  const reactComment = async (c: Comment, type: ReactionType) => {
    if (!requireAuth()) return;
    try {
      const r = await postsApi.reactComment(c._id, type);
      setComments((prev) => prev?.map((x) => (x._id === c._id ? { ...x, my_reaction: r.my_reaction, reaction_count: r.reaction_count } : x)) ?? prev);
    } catch { toast.error('Could not react.'); }
  };

  const del = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await postsApi.remove(p._id); toast.success('Post deleted.'); onDeleted(p._id); }
    catch { toast.error('Could not delete post.'); }
  };

  const toggleArchive = async () => {
    try {
      const up = await postsApi.archive(p._id, !p.archived);
      setP((prev) => ({ ...prev, archived: up.archived }));
      toast.success(up.archived ? 'Post archived — hidden from the feed.' : 'Post restored.');
    } catch { toast.error('Could not update the post.'); }
  };

  const doShare = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    try { await postsApi.share(p._id, shareQuote.trim() || undefined); toast.success('Reposted.'); setShareOpen(false); setShareQuote(''); onShared(); }
    catch { toast.error('Could not repost.'); }
    finally { setBusy(false); }
  };

  const myReactionMeta = p.my_reaction ? REACTION_META[p.my_reaction] : null;

  const parents = comments?.filter((c) => !c.parent) ?? [];
  const repliesOf = (id: string) => comments?.filter((c) => c.parent === id) ?? [];

  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 };

  return (
    <article style={card}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ProfileLink u={p.author}><Avatar u={p.author} /></ProfileLink>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ProfileLink u={p.author} style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--text)' }}>{fullName(p.author) || 'User'}</ProfileLink>
            {roleChip(p.author.roles)}
            {p.archived && <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Archived</span>}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>{timeLabel(p.createdAt)}</div>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={toggleArchive} aria-label={p.archived ? 'Restore post' : 'Archive post'} title={p.archived ? 'Restore' : 'Archive'} style={{ padding: 7, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {p.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
            </button>
            <button onClick={del} aria-label="Delete post" style={{ padding: 7, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--danger)', cursor: 'pointer' }}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* content */}
      {p.content && <p style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{renderRichText(p.content, p.mentions)}</p>}

      {/* media */}
      {p.media?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: p.media.length === 1 ? '1fr' : '1fr 1fr', gap: 4, marginTop: 12, borderRadius: 12, overflow: 'hidden' }}>
          {p.media.map((m, i) => (
            <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', lineHeight: 0 }}>
              <img src={m.url} alt="" loading="lazy" style={{ width: '100%', maxHeight: p.media.length === 1 ? 440 : 240, objectFit: 'cover', display: 'block' }} />
            </a>
          ))}
        </div>
      )}

      {/* shared/repost embed */}
      {p.shared_post && (
        <div style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProfileLink u={p.shared_post.author}><Avatar u={p.shared_post.author} size={30} /></ProfileLink>
            <ProfileLink u={p.shared_post.author} style={{ fontWeight: 650, fontSize: 13.5, textTransform: 'capitalize', color: 'var(--text)' }}>{fullName(p.shared_post.author) || 'User'}</ProfileLink>
            <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>· {timeLabel(p.shared_post.createdAt)}</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{renderRichText(p.shared_post.content, p.shared_post.mentions)}</p>
        </div>
      )}

      {/* links */}
      {p.links?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          {p.links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>{l.title || l.url}</a>
          ))}
        </div>
      )}

      {/* counts */}
      {(p.reaction_count > 0 || p.comment_count > 0 || p.share_count > 0) && (
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>
          {p.reaction_count > 0 && <span>{p.reaction_count} reaction{p.reaction_count === 1 ? '' : 's'}</span>}
          {p.comment_count > 0 && <span>{p.comment_count} comment{p.comment_count === 1 ? '' : 's'}</span>}
          {p.share_count > 0 && <span>{p.share_count} share{p.share_count === 1 ? '' : 's'}</span>}
        </div>
      )}

      {/* action bar */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flex: 1 }} onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
          <button onClick={() => react(p.my_reaction || 'like')} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13.5, color: myReactionMeta ? 'var(--primary)' : 'var(--text-muted)' }}>
            <span>{myReactionMeta ? myReactionMeta.emoji : '👍'}</span> {myReactionMeta ? myReactionMeta.label : 'React'}
          </button>
          {showReactions && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, display: 'flex', gap: 4, padding: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, boxShadow: 'var(--shadow)', zIndex: 20 }}>
              {REACTION_ORDER.map((t) => (
                <button key={t} title={REACTION_META[t].label} onClick={() => react(t)} style={{ fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>{REACTION_META[t].emoji}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={toggleComments} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13.5, color: 'var(--text-muted)' }}>
          <MessageSquare size={16} /> Comment
        </button>
        <button onClick={() => (requireAuth() && setShareOpen(true))} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13.5, color: 'var(--text-muted)' }}>
          <Repeat2 size={16} /> Share
        </button>
      </div>

      {/* comments */}
      {showComments && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {currentUser && (
            <div style={{ marginBottom: 12 }}>
              {replyTo && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Replying… <button onClick={() => setReplyTo(null)} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>cancel</button></div>}
              <MentionTextarea value={commentText} onChange={setCommentText} mentions={commentMentions} onMentionsChange={setCommentMentions} placeholder="Add a comment… use @ to mention" rows={2} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button onClick={submitComment} disabled={busy || !commentText.trim()} style={{ padding: '7px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none', opacity: busy || !commentText.trim() ? 0.6 : 1 }}>Comment</button>
              </div>
            </div>
          )}
          {comments === null ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>
          ) : parents.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No comments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {parents.map((c) => (
                <div key={c._id}>
                  <CommentRow c={c} currentUser={currentUser} canModerate={canManage} onReact={reactComment} onReply={() => setReplyTo(c._id)} onDelete={() => removeComment(c)} />
                  {repliesOf(c._id).map((r) => (
                    <div key={r._id} style={{ marginLeft: 40, marginTop: 8 }}>
                      <CommentRow c={r} currentUser={currentUser} canModerate={canManage} onReact={reactComment} onDelete={() => removeComment(r)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* share modal */}
      {shareOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setShareOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
          <div style={{ ...card, position: 'relative', width: 'min(520px,100%)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700 }}>Repost</h3>
            <textarea value={shareQuote} onChange={(e) => setShareQuote(e.target.value)} rows={3} placeholder="Add a thought (optional)…" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button onClick={() => setShareOpen(false)} style={{ padding: '9px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={doShare} disabled={busy} style={{ padding: '9px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', border: 'none', opacity: busy ? 0.7 : 1 }}>Repost</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

/* --------------------------- comment row --------------------------- */

const CommentRow: React.FC<{
  c: Comment; currentUser: UserData | null;
  canModerate?: boolean; // post owner can delete any comment on their post
  onReact: (c: Comment, t: ReactionType) => void;
  onReply?: () => void;
  onDelete: () => void;
}> = ({ c, currentUser, canModerate, onReact, onReply, onDelete }) => {
  const isAuthorOrAdmin = !!currentUser && (currentUser._id === c.author?._id || currentUser.roles?.includes('admin'));
  const canDelete = isAuthorOrAdmin || !!canModerate;
  const liked = !!c.my_reaction;
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <ProfileLink u={c.author}><Avatar u={c.author} size={32} /></ProfileLink>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProfileLink u={c.author} style={{ fontWeight: 650, fontSize: 13, textTransform: 'capitalize', color: 'var(--text)' }}>{fullName(c.author) || 'User'}</ProfileLink>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap', marginTop: 2 }}>{renderRichText(c.content, c.mentions)}</div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 4, paddingLeft: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <button onClick={() => onReact(c, 'like')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: liked ? 'var(--primary)' : 'var(--text-muted)' }}>Like{c.reaction_count > 0 ? ` (${c.reaction_count})` : ''}</button>
          {onReply && <button onClick={onReply} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><CornerDownRight size={12} /> Reply</button>}
          {canDelete && <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>Delete</button>}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
