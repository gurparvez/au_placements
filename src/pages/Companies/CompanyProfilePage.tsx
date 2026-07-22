import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Users, UserPlus, Check, Globe, Linkedin, Building2, Briefcase, Pencil, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import companiesApi, { type CompanyProfile } from '@/api/companies';
import openingsApi, { type Opening } from '@/api/openings';
import recruiterApi from '@/api/recruiter';
import ProfilePosts from '@/components/ProfilePosts';
import { avatarColor } from '@/utils/avatar';
import { Reveal } from '@/components/motion';
import { SelectField } from '@/components/ui/select-field';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const editInput: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none' };
const editLabel: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 };
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';
const metaPill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' };
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

function EditCompanyModal({ initial, onClose, onSaved }: { initial: CompanyProfile; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    company: initial.company ?? '', designation: initial.designation ?? '', industry: initial.industry ?? '',
    company_size: initial.company_size ?? '', location: initial.location ?? '', company_website: initial.website ?? '',
    linkedin_url: initial.linkedin_url ?? '', about: initial.about ?? '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    if (!f.company.trim()) return toast.error('Company name is required.');
    setSaving(true);
    try {
      await recruiterApi.updateMe({ ...f, logo });
      toast.success('Company profile updated.');
      onSaved(); onClose();
    } catch { toast.error('Could not update your profile.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div role="dialog" aria-modal="true" aria-label="Edit company profile" style={{ position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Edit company profile</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>What students and other users see.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={editLabel}>Company name</label><input value={f.company} onChange={(e) => set('company', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Industry</label><input value={f.industry} onChange={(e) => set('industry', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Company size</label>
            <SelectField aria-label="Company size" value={f.company_size} onChange={(v) => set('company_size', v)}
              options={[{ value: '', label: 'Select' }, ...SIZES.map((s) => ({ value: s, label: s }))]} />
          </div>
          <div><label style={editLabel}>Location</label><input value={f.location} onChange={(e) => set('location', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Your designation</label><input value={f.designation} onChange={(e) => set('designation', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Website</label><input value={f.company_website} onChange={(e) => set('company_website', e.target.value)} placeholder="https://…" style={editInput} /></div>
          <div><label style={editLabel}>LinkedIn</label><input value={f.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/…" style={editInput} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={editLabel}>Company logo</label><input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} style={{ ...editInput, padding: 8 }} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={editLabel}>About</label><textarea value={f.about} onChange={(e) => set('about', e.target.value)} rows={4} style={{ ...editInput, resize: 'vertical' }} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer', transition: 'background .18s ease' }}>Cancel</button>
          <button onClick={save} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.7 : 1, transition: 'background .18s ease' }}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

const CompanyProfilePage: React.FC = () => {
  const { companyUserId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [c, setC] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = !!user && String(user._id) === String(companyUserId);

  const load = useCallback(async () => {
    setLoading(true); setNotFound(false);
    try {
      setC(await companiesApi.get(companyUserId));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [companyUserId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await openingsApi.list({ recruiter: companyUserId, limit: 20 });
        if (!cancelled) setOpenings(res.data);
      } catch { /* openings are secondary */ }
    })();
    return () => { cancelled = true; };
  }, [companyUserId]);

  const toggleFollow = async () => {
    if (!user) { toast.error('Sign in to follow companies.'); navigate('/login'); return; }
    if (!c) return;
    setBusy(true);
    try {
      const res = c.is_following ? await companiesApi.unfollow(c.companyUserId) : await companiesApi.follow(c.companyUserId);
      setC({ ...c, is_following: res.following, followers: res.followers });
    } catch { toast.error('Could not update follow.'); }
    finally { setBusy(false); }
  };

  if (loading) return <section style={{ padding: '60px clamp(20px,10vw,112px)', color: 'var(--text-muted)' }}>Loading…</section>;
  if (notFound || !c) return (
    <section style={{ padding: '60px clamp(20px,10vw,112px)', textAlign: 'center', color: 'var(--text-muted)' }}>
      <Building2 size={30} style={{ opacity: 0.5 }} />
      <p style={{ marginTop: 10 }}>This company profile isn’t available.</p>
      <button onClick={() => navigate('/companies')} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ marginTop: 16, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background .18s ease' }}>Browse companies</button>
    </section>
  );

  const followerText = `${c.followers ?? 0} follower${(c.followers ?? 0) === 1 ? '' : 's'}`;

  return (
    <section style={{ padding: '24px clamp(20px,10vw,112px) 80px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13.5, cursor: 'pointer', padding: '4px 0', marginBottom: 14 }}>
        <ArrowLeft size={15} /> Back
      </button>

      <Reveal>
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Cover band — editorial register masthead */}
        <div style={{ height: 92, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, var(--surface-2), var(--surface-3))', borderBottom: '2px solid var(--brass)' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 140% at 8% 0%, color-mix(in srgb, var(--brass) 14%, transparent), transparent 62%)' }} />
          <span className="ledger-label" style={{ position: 'absolute', top: 14, left: 22 }}>The Akal &amp; Eternal Register</span>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: -34 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, minWidth: 0 }}>
              {c.logo ? (
                <img src={c.logo} alt={c.company} style={{ width: 84, height: 84, borderRadius: 18, objectFit: 'cover', border: '3px solid var(--surface)', background: 'var(--surface)' }} />
              ) : (
                <span aria-hidden style={{ width: 84, height: 84, borderRadius: 18, border: '3px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28, background: avatarColor(c.company) }}>{companyInitials(c.company)}</span>
              )}
            </div>
            {isOwner ? (
              <button onClick={() => setEditOpen(true)} {...hoverBg('var(--surface-2)', 'var(--surface)')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', transition: 'background .18s ease' }}>
                <Pencil size={15} /> Edit profile
              </button>
            ) : (
              <button onClick={toggleFollow} disabled={busy}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.is_following ? 'var(--surface-2)' : 'var(--primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = c.is_following ? 'var(--surface)' : 'var(--primary)')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: busy ? 0.7 : 1, transition: 'background .18s ease',
                  border: c.is_following ? '1px solid var(--border-strong)' : 'none',
                  background: c.is_following ? 'var(--surface)' : 'var(--primary)',
                  color: c.is_following ? 'var(--text)' : '#fff' }}>
                {c.is_following ? <><Check size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '14px 0 0' }}>
            <h1 className="font-display" style={{ margin: 0, fontSize: 'clamp(26px,3.6vw,34px)', fontWeight: 500, letterSpacing: '-.02em' }}>{c.company}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--brass)', border: '1px solid var(--brass-line)' }}><BadgeCheck size={13} /> Recruiting partner</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
            {c.industry && <span style={metaPill}><Briefcase size={14} /> {c.industry}</span>}
            {c.location && <span style={metaPill}><MapPin size={14} /> {c.location}</span>}
            {c.company_size && <span style={metaPill}><Users size={14} /> {c.company_size} employees</span>}
            <span style={metaPill}><Users size={14} /> {followerText}</span>
          </div>

          {(c.website || c.linkedin_url) && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 13, fontWeight: 550, textDecoration: 'none' }}><Globe size={14} /> Website</a>}
              {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 13, fontWeight: 550, textDecoration: 'none' }}><Linkedin size={14} /> LinkedIn</a>}
            </div>
          )}
        </div>
      </div>
      </Reveal>

      {c.about && (
        <Reveal delay={0.05} style={{ marginTop: 16 }}>
        <div style={{ ...card, padding: 22 }}>
          <h2 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, letterSpacing: '-.01em' }}>About</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{c.about}</p>
        </div>
        </Reveal>
      )}

      {/* Open positions */}
      {openings.length > 0 && (
        <Reveal delay={0.1} style={{ marginTop: 16 }}>
        <div style={{ ...card, padding: 22 }}>
          <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, letterSpacing: '-.01em', display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={17} style={{ color: 'var(--brass)' }} /> Open positions <span className="data" style={{ color: 'var(--text-subtle)', fontWeight: 500 }}>{openings.length}</span></h2>
          {openings.map((o) => (
            <Link key={o._id} to="/openings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{o.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{o.type === 'job' ? 'Job' : 'Internship'}{o.location ? ` · ${o.location}` : ''}{o.work_mode ? ` · ${o.work_mode}` : ''}</div>
              </div>
              <ArrowUpRight size={16} style={{ color: 'var(--text-subtle)', flex: 'none' }} />
            </Link>
          ))}
        </div>
        </Reveal>
      )}

      {/* Posts by this company */}
      <Reveal delay={0.15} style={{ marginTop: 16 }}>
      <div style={{ ...card, padding: 22 }}>
        <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, letterSpacing: '-.01em' }}>Posts</h2>
        <ProfilePosts userId={c.companyUserId} />
      </div>
      </Reveal>

      {editOpen && <EditCompanyModal initial={c} onClose={() => setEditOpen(false)} onSaved={load} />}
    </section>
  );
};

export default CompanyProfilePage;
