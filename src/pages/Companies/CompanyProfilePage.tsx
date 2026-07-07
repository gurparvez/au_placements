import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Users, UserPlus, Check, Globe, Linkedin, Building2, Briefcase, Pencil, ArrowUpRight } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import companiesApi, { type CompanyProfile } from '@/api/companies';
import openingsApi, { type Opening } from '@/api/openings';
import recruiterApi from '@/api/recruiter';
import ProfilePosts from '@/components/ProfilePosts';
import { avatarColor } from '@/utils/avatar';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const editInput: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none' };
const editLabel: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 };
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';
const metaPill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' };

function EditCompanyModal({ initial, onClose, onSaved }: { initial: CompanyProfile; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    company: initial.company ?? '', designation: initial.designation ?? '', industry: initial.industry ?? '',
    company_size: initial.company_size ?? '', location: initial.location ?? '', company_website: initial.website ?? '',
    linkedin_url: initial.linkedin_url ?? '', about: initial.about ?? '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

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
      <div style={{ position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Edit company profile</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>This is what students and other users see.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={editLabel}>Company name</label><input value={f.company} onChange={(e) => set('company', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Industry</label><input value={f.industry} onChange={(e) => set('industry', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Company size</label>
            <select value={f.company_size} onChange={(e) => set('company_size', e.target.value)} style={{ ...editInput, cursor: 'pointer' }}>
              <option value="">Select</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={editLabel}>Location</label><input value={f.location} onChange={(e) => set('location', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Your designation</label><input value={f.designation} onChange={(e) => set('designation', e.target.value)} style={editInput} /></div>
          <div><label style={editLabel}>Website</label><input value={f.company_website} onChange={(e) => set('company_website', e.target.value)} placeholder="https://…" style={editInput} /></div>
          <div><label style={editLabel}>LinkedIn</label><input value={f.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/…" style={editInput} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={editLabel}>Company logo</label><input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} style={{ ...editInput, padding: 8 }} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={editLabel}>About</label><textarea value={f.about} onChange={(e) => set('about', e.target.value)} rows={4} style={{ ...editInput, resize: 'vertical' }} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save changes'}</button>
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

  if (loading) return <section style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Loading…</section>;
  if (notFound || !c) return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <Building2 size={30} style={{ opacity: 0.5 }} />
      <p style={{ marginTop: 10 }}>This company profile isn’t available.</p>
      <button onClick={() => navigate('/companies')} style={{ marginTop: 16, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Browse companies</button>
    </section>
  );

  const followerText = `${c.followers ?? 0} follower${(c.followers ?? 0) === 1 ? '' : 's'}`;

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 80px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13.5, cursor: 'pointer', padding: '4px 0', marginBottom: 14 }}>
        <ArrowLeft size={15} /> Back
      </button>

      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Cover band */}
        <div style={{ height: 92, background: `linear-gradient(120deg, ${avatarColor(c.company)}, color-mix(in srgb, ${avatarColor(c.company)} 55%, #000))` }} />

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
              <button onClick={() => setEditOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)' }}>
                <Pencil size={15} /> Edit profile
              </button>
            ) : (
              <button onClick={toggleFollow} disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: busy ? 0.7 : 1,
                  border: c.is_following ? '1px solid var(--border-strong)' : 'none',
                  background: c.is_following ? 'var(--surface)' : 'var(--primary)',
                  color: c.is_following ? 'var(--text)' : '#fff' }}>
                {c.is_following ? <><Check size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
              </button>
            )}
          </div>

          <h1 style={{ margin: '14px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>{c.company}</h1>
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

      {c.about && (
        <div style={{ ...card, padding: 22, marginTop: 16 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 15.5, fontWeight: 650 }}>About</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{c.about}</p>
        </div>
      )}

      {/* Open positions */}
      {openings.length > 0 && (
        <div style={{ ...card, padding: 22, marginTop: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 15.5, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={17} /> Open positions <span style={{ color: 'var(--text-subtle)', fontWeight: 500 }}>{openings.length}</span></h2>
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
      )}

      {/* Posts by this company */}
      <div style={{ ...card, padding: 22, marginTop: 16 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15.5, fontWeight: 650 }}>Posts</h2>
        <ProfilePosts userId={c.companyUserId} />
      </div>

      {editOpen && <EditCompanyModal initial={c} onClose={() => setEditOpen(false)} onSaved={load} />}
    </section>
  );
};

export default CompanyProfilePage;
