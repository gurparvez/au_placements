import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImagePlus, X, ArrowUpRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import companiesApi, { type Company } from '@/api/companies';
import postsApi, { type Post, type MentionUser } from '@/api/posts';
import PostCard from './PostCard';
import MentionTextarea from './MentionTextarea';
import { Reveal } from '@/components/motion';
import { motion, AnimatePresence } from 'motion/react';
import { avatarColor, initials } from '@/utils/avatar';

const EASE = [0.16, 1, 0.3, 1] as const;
const fullName = (u: { firstName?: string; lastName?: string }) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

/* Soft rail card — house border, radius and shadow. */
const railCard: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9,
  boxShadow: 'var(--shadow)', overflow: 'hidden',
};
const railRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', textDecoration: 'none', color: 'var(--text)',
  transition: 'background .15s ease',
};

const FeedPage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allStudents } = useAppSelector((s) => s.student);
  const [railCompanies, setRailCompanies] = useState<Company[]>([]);

  // Feed is members-only — bounce signed-out visitors to sign in.
  useEffect(() => {
    if (initialized && !user) navigate('/login', { replace: true });
  }, [initialized, user, navigate]);

  // Side-rail data — the register's own people and partners.
  useEffect(() => {
    if (!allStudents) dispatch(fetchAllStudents());
  }, [dispatch, allStudents]);
  useEffect(() => {
    let on = true;
    companiesApi.list({ page: 1, limit: 4 }).then((r) => { if (on) setRailCompanies(r.data); }).catch(() => {});
    return () => { on = false; };
  }, []);

  const discover = (allStudents ?? []).filter((st: any) => st?.user?._id !== user?._id).slice(0, 4);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
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

  const myName = user ? fullName(user) : '';

  if (!initialized) return <section style={{ padding: '60px clamp(20px,10vw,64px)', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!user) return <section style={{ padding: '60px clamp(20px,10vw,64px)', color: 'var(--text-muted)' }}>Redirecting…</section>;

  return (
    <section style={{ padding: '20px clamp(20px,10vw,64px) 80px' }}>
      {/* LinkedIn-style three-column stage: profile rail · feed · discovery rail — fills the width */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 330px) minmax(0, 1fr) minmax(300px, 360px)', gap: 24, maxWidth: 1760, margin: '0 auto', alignItems: 'start' }}>

        {/* ---- left rail: who you are here ---- */}
        <aside data-kp-rail="true" style={{ position: 'sticky', top: 92, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {user ? (
            <div className="kp-rise" style={{ ...railCard }}>
              <div aria-hidden style={{ height: 68, background: `linear-gradient(120deg, color-mix(in srgb, ${avatarColor(myName)} 34%, var(--surface)), color-mix(in srgb, ${avatarColor(myName)} 10%, var(--surface)))` }} />
              <div style={{ padding: '0 20px 20px', marginTop: -34 }}>
                <span aria-hidden style={{
                  width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 26, background: avatarColor(myName),
                  boxShadow: '0 0 0 4px var(--surface)',
                }}>
                  {initials(user.firstName, user.lastName) || 'U'}
                </span>
                <div style={{ fontWeight: 700, fontSize: 20, textTransform: 'capitalize', marginTop: 10 }}>{myName || 'Your account'}</div>
                <div style={{ fontSize: 15, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 3 }}>
                  {(user.roles ?? []).join(' · ') || 'Member'}
                </div>
                <Link
                  to={user.roles?.includes('recruiter') ? `/companies/${user._id}` : '/profiles'}
                  {...hoverBg('var(--primary-hover)', 'var(--primary)')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, padding: '10px 14px', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 15.5, textDecoration: 'none', transition: 'background .18s ease' }}
                >
                  View profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="kp-rise" style={{ ...railCard, padding: 16, fontSize: 14.5, color: 'var(--text-muted)' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 650, textDecoration: 'none' }}>Sign in</Link> to post, react, and comment.
            </div>
          )}

          <div className="kp-rise" style={{ ...railCard, padding: '10px 0' }}>
            {[['My network', '/network'], ['Openings', '/openings'], ['Companies', '/companies']].map(([label, to]) => (
              <Link key={to} to={to} {...hoverBg('var(--surface-2)', 'transparent')} style={{ ...railRow, fontWeight: 650, fontSize: 16 }}>
                {label} <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-subtle)' }} />
              </Link>
            ))}
          </div>
        </aside>

        {/* ---- centre: the feed itself ---- */}
        <div style={{ minWidth: 0 }}>
        {/* start-a-post card — the composer's front door */}
        {user ? (
          <Reveal delay={0.05}>
            {/* the composer's front door — a living prompt with a typing caret */}
            <motion.div
              style={{
                position: 'relative', overflow: 'hidden', marginBottom: 18,
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* blurred corner accent wash, tinted to the member's avatar hue */}
              <div aria-hidden style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, color-mix(in srgb, ${avatarColor(myName)} 22%, transparent), transparent 68%)`, filter: 'blur(28px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span aria-hidden style={{
                  width: 50, height: 50, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, background: avatarColor(myName),
                  boxShadow: `0 0 0 2px var(--surface), 0 0 0 4px color-mix(in srgb, ${avatarColor(myName)} 45%, transparent)`,
                }}>
                  {initials(user.firstName, user.lastName) || 'U'}
                </span>
                <button
                  onClick={() => setComposerOpen(true)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 45%, var(--border-strong))'; e.currentTarget.style.boxShadow = '0 10px 22px -16px rgba(0,0,0,.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none'; }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 3, textAlign: 'left', padding: '14px 20px', borderRadius: 999,
                    border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text-muted)',
                    fontWeight: 600, fontSize: 15.5, cursor: 'pointer', transition: 'border-color .18s ease, box-shadow .18s ease',
                  }}
                >
                  Share an update, {(user.firstName ?? 'friend').toLowerCase()}
                  <span aria-hidden className="kp-caret" style={{ height: '1em', marginLeft: 2 }} />
                </button>
              </div>
              <div style={{ position: 'relative', display: 'flex', gap: 10, padding: '6px 18px 16px 82px' }}>
                <button
                  onClick={() => setComposerOpen(true)}
                  {...hoverBg('var(--primary-soft)', 'var(--surface-2)')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', transition: 'background .18s ease' }}
                >
                  <ImagePlus size={16} style={{ color: 'var(--primary)' }} /> Photo
                </button>
                <button
                  onClick={() => setComposerOpen(true)}
                  {...hoverBg('var(--primary-soft)', 'var(--surface-2)')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', transition: 'background .18s ease' }}
                >
                  <span style={{ color: '#d97706', fontWeight: 700, fontSize: 15 }}>@</span> Mention
                </button>
              </div>
            </motion.div>
          </Reveal>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 16, marginBottom: 18, fontSize: 16, color: 'var(--text-muted)' }}>
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
              transition={{ duration: 0.28, ease: EASE }}
              style={{ position: 'relative', width: 'min(560px,100%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Create a post</h2>
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
                <button onClick={() => fileRef.current?.click()} disabled={images.length >= 4} title={images.length >= 4 ? 'Up to 4 images' : 'Add photos'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: 15, cursor: images.length >= 4 ? 'not-allowed' : 'pointer', opacity: images.length >= 4 ? 0.6 : 1 }}>
                  <ImagePlus size={16} /> Photo
                </button>
                <button onClick={submit} disabled={posting || (!content.trim() && images.length === 0)} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ padding: '9px 22px', border: 'none', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'background .18s ease', opacity: posting || (!content.trim() && images.length === 0) ? 0.6 : 1 }}>
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* the feed — one full post per row, rising in as you scroll */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence initial={false}>
            {posts.map((p) => (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, y: 26, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-30px 0px' }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{ minWidth: 0 }}
              >
                <PostCard
                  post={p}
                  currentUser={user}
                  onDeleted={removeFromList}
                  onShared={reloadFirst}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {posts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No posts yet. Be the first.</div>
        )}

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <motion.button
              onClick={() => load(cursor, false)}
              disabled={loading}
              {...hoverBg('var(--surface-3)', 'var(--surface-2)')}
              style={{ padding: '10px 24px', border: '1px solid var(--border)', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background .18s ease' }}
            >
              {loading ? 'Loading…' : 'Load more posts'}
            </motion.button>
          </div>
        )}
        </div>

        {/* ---- right rail: discover the register ---- */}
        <aside data-kp-rail="true" style={{ position: 'sticky', top: 92, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {discover.length > 0 && (
            <div className="kp-rise" style={{ ...railCard }}>
              <div className="ledger-label" style={{ padding: '16px 18px 8px', fontSize: 13 }}>People to discover</div>
              {discover.map((st: any, i: number) => {
                const name = `${st?.user?.firstName ?? ''} ${st?.user?.lastName ?? ''}`.trim() || 'Student';
                return (
                  <Link key={st?.user?._id ?? i} to={`/profiles/${st?.user?._id}`} {...hoverBg('var(--surface-2)', 'transparent')} style={{ ...railRow, animation: `kpRise .5s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both` }}>
                    <span aria-hidden style={{ width: 46, height: 46, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, background: avatarColor(name) }}>
                      {initials(st?.user?.firstName, st?.user?.lastName) || 'S'}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 16, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                      {st?.headline && <span style={{ display: 'block', fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.headline}</span>}
                    </span>
                  </Link>
                );
              })}
              <Link to="/students" {...hoverBg('var(--surface-2)', 'var(--bg-2)')} style={{ display: 'block', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--primary)', fontWeight: 650, fontSize: 15, textDecoration: 'none', textAlign: 'center', transition: 'background .15s ease' }}>
                See the whole register
              </Link>
            </div>
          )}

          {railCompanies.length > 0 && (
            <div className="kp-rise" style={{ ...railCard }}>
              <div className="ledger-label" style={{ padding: '16px 18px 8px', fontSize: 13 }}>Companies to follow</div>
              {railCompanies.map((c, i) => (
                <Link key={c.companyUserId} to={`/companies/${c.companyUserId}`} {...hoverBg('var(--surface-2)', 'transparent')} style={{ ...railRow, animation: `kpRise .5s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both` }}>
                  <span aria-hidden style={{ width: 44, height: 44, borderRadius: 12, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, background: avatarColor(c.company) }}>
                    {c.company.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</span>
                    {c.industry && <span style={{ display: 'block', fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.industry}</span>}
                  </span>
                </Link>
              ))}
              <Link to="/companies" {...hoverBg('var(--surface-2)', 'var(--bg-2)')} style={{ display: 'block', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--primary)', fontWeight: 650, fontSize: 15, textDecoration: 'none', textAlign: 'center', transition: 'background .15s ease' }}>
                Browse all companies
              </Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};

export default FeedPage;
