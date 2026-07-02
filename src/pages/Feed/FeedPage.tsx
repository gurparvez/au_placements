import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ImagePlus, X } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import postsApi, { type Post, type MentionUser } from '@/api/posts';
import PostCard from './PostCard';
import MentionTextarea from './MentionTextarea';

const fullName = (u: { firstName?: string; lastName?: string }) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

const FeedPage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    setImages((prev) => [...prev, ...picked].slice(0, 4));
  };
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const load = useCallback(async (p: number, replace: boolean) => {
    setLoading(true);
    try {
      const res = await postsApi.feed({ page: p, limit: 10 });
      setTotalPages(res.pagination.totalPages);
      setPosts((prev) => (replace ? res.data : [...prev, ...res.data]));
    } catch {
      toast.error('Could not load the feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, true); }, [load]);

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

  const reloadFirst = () => { setPage(1); load(1, true); };
  const removeFromList = (id: string) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <section style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '0 0 18px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>Feed</h1>
        {user && (
          <button onClick={() => setComposerOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' }}>
            <Plus size={16} /> Add post
          </button>
        )}
      </div>

      {!user && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link> to post, react, and comment.
        </div>
      )}

      {composerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px' }}>
          <div onClick={() => !posting && setComposerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
          <div style={{ position: 'relative', width: 'min(560px,100%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Create a post</h2>
              <button onClick={() => setComposerOpen(false)} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer' }}>✕</button>
            </div>
            <MentionTextarea value={content} onChange={setContent} mentions={mentions} onMentionsChange={setMentions} placeholder="Share an update, achievement, or link… use @ to mention people" rows={5} />

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
              <button onClick={submit} disabled={posting || (!content.trim() && images.length === 0)} style={{ padding: '9px 22px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', opacity: posting || (!content.trim() && images.length === 0) ? 0.6 : 1 }}>
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {posts.map((p) => (
          <PostCard key={p._id} post={p} currentUser={user} onDeleted={removeFromList} onShared={reloadFirst} />
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No posts yet. Be the first to share something.</div>
      )}

      {page < totalPages && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button onClick={() => { const next = page + 1; setPage(next); load(next, false); }} disabled={loading} style={{ padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
};

export default FeedPage;
