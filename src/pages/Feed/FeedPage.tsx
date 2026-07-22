import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ImagePlus, X } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import postsApi, { type Post, type MentionUser } from '@/api/posts';
import PostCard from './PostCard';
import MentionTextarea from './MentionTextarea';
import { Reveal } from '@/components/motion';
import { motion, AnimatePresence } from 'motion/react';
import { avatarColor, initials } from '@/utils/avatar';
import { ThumbsUp, MessageCircle, Repeat2, Maximize2 } from 'lucide-react';

const fullName = (u: { firstName?: string; lastName?: string }) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

/* Compact, uniform preview tile — click to expand into the full post. */
const FeedTile: React.FC<{ post: Post; onOpen: () => void }> = ({ post, onOpen }) => {
  const author = post.author ?? {};
  const name = fullName(author) || 'User';
  const isRecruiter = author.roles?.includes('recruiter');
  const media = post.media ?? [];
  const firstImage = media.find((m) => m.type === 'image');
  return (
    <motion.div
      layoutId={`post-${post._id}`}
      role="button"
      tabIndex={0}
      aria-label={`Open post by ${name}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        boxShadow: 'var(--shadow)', cursor: 'pointer', minWidth: 0,
      }}
    >
      {/* author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span aria-hidden style={{
          width: 40, height: 40, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13,
          background: avatarColor(name),
        }}>
          {initials(author.firstName, author.lastName) || 'U'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <span style={{ fontWeight: 650, fontSize: 14, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
            {isRecruiter && (
              <span style={{ flex: 'none', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Recruiter</span>
            )}
          </div>
          <span className="data" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <Maximize2 size={13} aria-hidden style={{ flex: 'none', color: 'var(--text-subtle)' }} />
      </div>

      {/* content — clamped so every tile stays compact */}
      {post.content && (
        <p style={{
          margin: 0, fontSize: 14, lineHeight: 1.55, textAlign: 'left', overflowWrap: 'anywhere',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.content}
        </p>
      )}

      {/* first image as a fixed-height preview */}
      {firstImage && (
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={firstImage.thumbnail || firstImage.url} alt="" loading="lazy" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
          {media.length > 1 && (
            <span className="data" style={{ position: 'absolute', right: 8, bottom: 8, padding: '2px 9px', borderRadius: 999, background: 'rgba(6,8,12,.62)', color: '#fff', fontSize: 11.5, fontWeight: 600 }}>
              +{media.length - 1}
            </span>
          )}
        </div>
      )}

      {/* counts — pinned to the bottom so every tile ends on the same rail */}
      <div className="data" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 16, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ThumbsUp size={13} /> {post.reaction_count ?? 0}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MessageCircle size={13} /> {post.comment_count ?? 0}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Repeat2 size={14} /> {post.share_count ?? 0}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Open</span>
      </div>
    </motion.div>
  );
};

const FeedPage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [expanded, setExpanded] = useState<Post | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Escape collapses the expanded post.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    setImages((prev) => [...prev, ...picked].slice(0, 4));
  };
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const load = useCallback(async (cur: string | null, replace: boolean) => {
    setLoading(true);
    try {
      const res = await postsApi.feed({ cursor: cur ?? undefined, limit: 10 });
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
      setPosts((prev) => (replace ? res.data : [...prev, ...res.data]));
    } catch {
      toast.error('Could not load the feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(null, true); }, [load]);

  // Close the composer on Escape (keyboard users).
  useEffect(() => {
    if (!composerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !posting) setComposerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [composerOpen, posting]);

  const submit = async () => {
    if (!content.trim() && images.length === 0) return;
    setPosting(true);
    try {
      const mentionIds = mentions.filter((m) => content.includes(`@${fullName(m)}`)).map((m) => m._id);
      const post = await postsApi.create({ content: content.trim(), mentions: mentionIds, images });
      setPosts((prev) => [post, ...prev]);
      setContent(''); setMentions([]); setImages([]); setComposerOpen(false);
      toast.success('Posted.');
    } catch {
      toast.error('Could not post.');
    } finally {
      setPosting(false);
    }
  };

  const reloadFirst = () => { load(null, true); };
  const removeFromList = (id: string) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <section style={{ padding: '32px clamp(20px,10vw,112px) 80px' }}>
      <Reveal>
      <div style={{ margin: '0 0 20px' }}>
        <div className="brass-rule" style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <span className="ledger-label" style={{ color: 'var(--brass)' }}>Campus community</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 500, letterSpacing: '-.02em', margin: '6px 0 0' }}>Feed</h1>
          </div>
          {user && (
            <button onClick={() => setComposerOpen(true)} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background .18s ease' }}>
              <Plus size={16} /> Add post
            </button>
          )}
        </div>
      </div>
      </Reveal>

      {!user && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link> to post, react, and comment.
        </div>
      )}

      {composerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
            onClick={() => !posting && setComposerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Create a post"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', width: 'min(560px,100%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Create a post</h2>
              <button onClick={() => setComposerOpen(false)} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer' }}>✕</button>
            </div>
            <MentionTextarea value={content} onChange={setContent} mentions={mentions} onMentionsChange={setMentions} placeholder="Share an update… @ to mention people" rows={5} />

            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8, marginTop: 10 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={URL.createObjectURL(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removeImage(i)} aria-label="Remove image" style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <button onClick={() => fileRef.current?.click()} disabled={images.length >= 4} title={images.length >= 4 ? 'Up to 4 images' : 'Add photos'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: images.length >= 4 ? 'not-allowed' : 'pointer', opacity: images.length >= 4 ? 0.6 : 1 }}>
                <ImagePlus size={16} /> Photo
              </button>
              <button onClick={submit} disabled={posting || (!content.trim() && images.length === 0)} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ padding: '9px 22px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background .18s ease', opacity: posting || (!content.trim() && images.length === 0) ? 0.6 : 1 }}>
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Uniform tile grid — equal blocks per row; a tile expands into the full post on click. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16, alignItems: 'stretch' }}>
        {posts.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-4% 0px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.08 }}
            style={{ minWidth: 0 }}
          >
            <FeedTile post={p} onOpen={() => setExpanded(p)} />
          </motion.div>
        ))}
      </div>

      {/* Expanded post — the tile morphs into a centered full card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(6,8,12,.6)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: '72px 16px 32px', overflowY: 'auto',
            }}
          >
            <motion.div
              layoutId={`post-${expanded._id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ width: 'min(640px,100%)', borderRadius: 16 }}
            >
              <PostCard
                post={expanded}
                currentUser={user}
                onDeleted={(id) => { removeFromList(id); setExpanded(null); }}
                onShared={() => { reloadFirst(); setExpanded(null); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {posts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No posts yet. Be the first.</div>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button onClick={() => load(cursor, false)} disabled={loading} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', transition: 'background .18s ease' }}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
};

export default FeedPage;
