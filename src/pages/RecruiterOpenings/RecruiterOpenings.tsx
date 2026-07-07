import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Briefcase, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/context/hooks';
import openingsApi, { type Opening, type OpeningPayload, type University, type Applicant } from '@/api/openings';
import type { Skill } from '@/api/skills';
import SkillPicker from '@/components/SkillPicker';
import { avatarColor, initials } from '@/utils/avatar';

const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';

/* --------------------------- applicants modal --------------------------- */

function ApplicantsModal({ opening, onClose }: { opening: Opening; onClose: () => void }) {
  const [rows, setRows] = useState<Applicant[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { const r = await openingsApi.applicants(opening._id); if (!cancelled) setRows(r); }
      catch { if (!cancelled) setRows([]); }
    })();
    return () => { cancelled = true; };
  }, [opening._id]);

  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div style={{ position: 'relative', width: 'min(520px,100%)', maxHeight: '85vh', overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Applicants</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{opening.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>

        <div style={{ marginTop: 14 }}>
          {rows === null ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, padding: '20px 0', textAlign: 'center' }}>Loading…</p>
          ) : rows.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px 0', color: 'var(--text-muted)' }}>
              <Users size={24} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: 13.5 }}>No applicants yet.</span>
            </div>
          ) : (
            rows.map((a) => (
              <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--border)' }}>
                <span aria-hidden style={{ width: 38, height: 38, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, background: avatarColor(`${a.student?.firstName ?? ''} ${a.student?.lastName ?? ''}`) }}>{initials(a.student?.firstName, a.student?.lastName) || '?'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {a.student ? (
                    <Link to={`/profiles/${a.student._id}`} onClick={onClose} style={{ fontWeight: 650, fontSize: 14, textTransform: 'capitalize', color: 'var(--text)', textDecoration: 'none' }}>{`${a.student.firstName ?? ''} ${a.student.lastName ?? ''}`.trim() || 'Student'}</Link>
                  ) : <span style={{ fontWeight: 650, fontSize: 14, color: 'var(--text-muted)' }}>Unknown</span>}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.student?.auid ? `AUID ${a.student.auid}` : ''}{a.student?.university ? `${a.student?.auid ? ' · ' : ''}${a.student.university.replace(' University', '')}` : ''}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)', flex: 'none' }}>{fmt(a.appliedAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const input: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)',
  border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
};
const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)' };
const UNIS: University[] = ['Akal University', 'Eternal University'];

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d: any = err.response?.data;
    if (Array.isArray(d?.errors) && d.errors.length) return d.errors.map((e: any) => e.message).join(', ');
    if (d?.message) return d.message;
  }
  return fallback;
}

const toInputDate = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

interface FormState {
  company: string;
  title: string; description: string; type: 'internship' | 'job'; work_mode: '' | 'onsite' | 'remote' | 'hybrid';
  location: string; skills: string[]; eligible_universities: University[]; min_experience: string;
  stipend_or_salary: string; apply_url: string; apply_by: string;
}

const emptyForm: FormState = {
  company: '',
  title: '', description: '', type: 'internship', work_mode: '', location: '', skills: [],
  eligible_universities: [], min_experience: '', stipend_or_salary: '', apply_url: '', apply_by: '',
};

/* --------------------------- form modal --------------------------- */

function OpeningModal({ editing, requireCompany, onClose, onSaved }: { editing: Opening | null; requireCompany: boolean; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editing;
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          company: editing.company ?? '',
          title: editing.title, description: editing.description, type: editing.type,
          work_mode: editing.work_mode ?? '', location: editing.location ?? '',
          skills: (editing.skills || []).map((s) => s._id),
          eligible_universities: editing.eligible_universities || [],
          min_experience: editing.min_experience != null ? String(editing.min_experience) : '',
          stipend_or_salary: editing.stipend_or_salary ?? '', apply_url: editing.apply_url ?? '',
          apply_by: toInputDate(editing.apply_by),
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const initialSkills: Skill[] = editing?.skills || [];

  const toggleUni = (u: University) =>
    setForm((f) => ({ ...f, eligible_universities: f.eligible_universities.includes(u) ? f.eligible_universities.filter((x) => x !== u) : [...f.eligible_universities, u] }));

  const submit = async () => {
    if (requireCompany && !form.company.trim()) return toast.error('Company name is required.');
    if (!form.title.trim()) return toast.error('Title is required.');
    if (!form.description.trim()) return toast.error('Description is required.');
    setSaving(true);
    try {
      const payload: OpeningPayload = {
        company: requireCompany ? form.company.trim() : undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        work_mode: form.work_mode || undefined,
        location: form.location.trim() || undefined,
        skills: form.skills,
        eligible_universities: form.eligible_universities,
        min_experience: form.min_experience ? Number(form.min_experience) : undefined,
        stipend_or_salary: form.stipend_or_salary.trim() || undefined,
        apply_url: form.apply_url.trim() || undefined,
        apply_by: form.apply_by || undefined,
      };
      if (isEdit && editing) {
        await openingsApi.update(editing._id, payload);
        toast.success('Opening updated.');
      } else {
        await openingsApi.create(payload);
        toast.success('Opening posted.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractError(err, 'Failed to save opening.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div style={{ ...card, position: 'relative', width: 'min(620px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{isEdit ? 'Edit opening' : 'Post an opening'}</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{isEdit ? 'Update the details students see.' : 'Share an internship or job with eligible students.'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          {requireCompany && (
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Company</label><input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name" style={input} /></div>
          )}
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Title</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Frontend Developer Intern" style={input} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Description</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} style={{ ...input, resize: 'vertical' }} /></div>
          <div>
            <label style={label}>Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value as any)} style={{ ...input, cursor: 'pointer' }}>
              <option value="internship">Internship</option>
              <option value="job">Job</option>
            </select>
          </div>
          <div>
            <label style={label}>Work mode</label>
            <select value={form.work_mode} onChange={(e) => set('work_mode', e.target.value as any)} style={{ ...input, cursor: 'pointer' }}>
              <option value="">—</option>
              <option value="onsite">Onsite</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div><label style={label}>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} style={input} /></div>
          <div><label style={label}>Stipend / Salary</label><input value={form.stipend_or_salary} onChange={(e) => set('stipend_or_salary', e.target.value)} placeholder="e.g. ₹20,000/mo" style={input} /></div>
          <div><label style={label}>Min experience (months)</label><input type="number" min={0} value={form.min_experience} onChange={(e) => set('min_experience', e.target.value)} style={input} /></div>
          <div><label style={label}>Apply by</label><input type="date" value={form.apply_by} onChange={(e) => set('apply_by', e.target.value)} style={input} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Apply URL</label><input value={form.apply_url} onChange={(e) => set('apply_url', e.target.value)} placeholder="https://…" style={input} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <SkillPicker label="Required skills" selected={form.skills} setSelected={(s) => set('skills', s)} initialData={initialSkills} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Eligible universities</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {UNIS.map((u) => (
                <button key={u} type="button" onClick={() => toggleUni(u)}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 'var(--r-ctl)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    border: `1px solid ${form.eligible_universities.includes(u) ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.eligible_universities.includes(u) ? 'var(--primary-soft)' : 'transparent',
                    color: form.eligible_universities.includes(u) ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Post opening'}</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- page --------------------------- */

const RecruiterOpenings: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);
  const isRecruiter = !!user?.roles?.includes('recruiter') && user?.status === 'active';
  const isAdmin = !!user?.roles?.includes('admin');
  const canManage = isRecruiter || isAdmin;
  // Admins have no company profile, so they type the company name on each opening.
  const requireCompany = isAdmin && !isRecruiter;

  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Opening | null>(null);
  const [applicantsFor, setApplicantsFor] = useState<Opening | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await openingsApi.listMine({ limit: 100 });
      setOpenings(res.data);
    } catch {
      toast.error('Failed to load your openings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user) navigate('/login', { replace: true });
    else if (!canManage) navigate('/', { replace: true });
  }, [initialized, user, canManage, navigate]);

  useEffect(() => { if (canManage) load(); }, [canManage, load]);

  const toggleStatus = async (o: Opening) => {
    try {
      await openingsApi.setStatus(o._id, o.status === 'open' ? 'closed' : 'open');
      toast.success(o.status === 'open' ? 'Opening closed.' : 'Opening reopened.');
      load();
    } catch (err) { toast.error(extractError(err, 'Failed to update status.')); }
  };

  const remove = async (o: Opening) => {
    if (!window.confirm(`Delete "${o.title}"? This cannot be undone.`)) return;
    try {
      await openingsApi.remove(o._id);
      toast.success('Opening deleted.');
      load();
    } catch (err) { toast.error(extractError(err, 'Failed to delete.')); }
  };

  if (!initialized) return <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!canManage) return <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Redirecting…</section>;

  const openCount = openings.filter((o) => o.status === 'open').length;
  const summary = openings.length === 0
    ? 'Post and manage internships & jobs.'
    : `${openings.length} opening${openings.length === 1 ? '' : 's'} · ${openCount} open`;

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)' }}><Briefcase size={22} /></span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>My openings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>{summary}</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} style={btnPrimary}><Plus size={16} /> Post opening</button>
      </div>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>Loading…</p>
        ) : openings.length === 0 ? (
          <div style={{ ...card, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={24} /></span>
            <div style={{ fontWeight: 650, fontSize: 15.5 }}>No openings yet</div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 340 }}>Post your first internship or job to start reaching Akal &amp; Eternal students.</p>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} style={{ ...btnPrimary, marginTop: 6 }}><Plus size={16} /> Post opening</button>
          </div>
        ) : (
          openings.map((o) => (
            <div key={o._id}
              style={{ ...card, padding: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', transition: 'border-color .15s, background .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 30%, var(--border))'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', gap: 13, minWidth: 0 }}>
                <span aria-hidden style={{ width: 44, height: 44, borderRadius: 11, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', background: avatarColor(o.company) }}>{companyInitials(o.company)}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{o.title}</h3>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 999, textTransform: 'capitalize', background: o.status === 'open' ? 'var(--primary-soft)' : 'var(--surface-2)', color: o.status === 'open' ? 'var(--primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>{o.status}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{o.type === 'job' ? 'Job' : 'Internship'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{o.company}{o.location ? ` · ${o.location}` : ''}{o.skills?.length ? ` · ${o.skills.length} skill${o.skills.length === 1 ? '' : 's'}` : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setApplicantsFor(o)} style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Users size={15} /> Applicants{typeof o.application_count === 'number' ? ` (${o.application_count})` : ''}
                </button>
                <button onClick={() => toggleStatus(o)} style={btnGhost}>{o.status === 'open' ? 'Close' : 'Reopen'}</button>
                <button onClick={() => { setEditing(o); setModalOpen(true); }} style={{ ...btnGhost, padding: 8 }} aria-label="Edit"><Pencil size={15} /></button>
                <button onClick={() => remove(o)} style={{ ...btnGhost, padding: 8, color: 'var(--danger)', borderColor: 'var(--danger)' }} aria-label="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && <OpeningModal editing={editing} requireCompany={requireCompany} onClose={() => setModalOpen(false)} onSaved={load} />}
      {applicantsFor && <ApplicantsModal opening={applicantsFor} onClose={() => setApplicantsFor(null)} />}
    </section>
  );
};

export default RecruiterOpenings;
