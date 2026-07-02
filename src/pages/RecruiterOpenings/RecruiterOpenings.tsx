import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import openingsApi, { type Opening, type OpeningPayload, type University } from '@/api/openings';
import type { Skill } from '@/api/skills';
import SkillPicker from '@/components/SkillPicker';

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
  title: string; description: string; type: 'internship' | 'job'; work_mode: '' | 'onsite' | 'remote' | 'hybrid';
  location: string; skills: string[]; eligible_universities: University[]; min_experience: string;
  stipend_or_salary: string; apply_url: string; apply_by: string;
}

const emptyForm: FormState = {
  title: '', description: '', type: 'internship', work_mode: '', location: '', skills: [],
  eligible_universities: [], min_experience: '', stipend_or_salary: '', apply_url: '', apply_by: '',
};

/* --------------------------- form modal --------------------------- */

function OpeningModal({ editing, onClose, onSaved }: { editing: Opening | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editing;
  const [form, setForm] = useState<FormState>(
    editing
      ? {
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
    if (!form.title.trim()) return toast.error('Title is required.');
    if (!form.description.trim()) return toast.error('Description is required.');
    setSaving(true);
    try {
      const payload: OpeningPayload = {
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
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

  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Opening | null>(null);

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
    else if (!isRecruiter) navigate('/', { replace: true });
  }, [initialized, user, isRecruiter, navigate]);

  useEffect(() => { if (isRecruiter) load(); }, [isRecruiter, load]);

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
  if (!isRecruiter) return <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Redirecting…</section>;

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)' }}><Briefcase size={22} /></span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>My openings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>Post and manage internships &amp; jobs.</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} style={btnPrimary}><Plus size={16} /> Post opening</button>
      </div>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>Loading…</p>
        ) : openings.length === 0 ? (
          <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>You haven't posted any openings yet.</div>
        ) : (
          openings.map((o) => (
            <div key={o._id} style={{ ...card, padding: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{o.title}</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 999, textTransform: 'capitalize', background: o.status === 'open' ? 'var(--primary-soft)' : 'var(--surface-2)', color: o.status === 'open' ? 'var(--primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>{o.status}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{o.type === 'job' ? 'Job' : 'Internship'}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{o.company}{o.location ? ` · ${o.location}` : ''}{o.skills?.length ? ` · ${o.skills.length} skill${o.skills.length === 1 ? '' : 's'}` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => toggleStatus(o)} style={btnGhost}>{o.status === 'open' ? 'Close' : 'Reopen'}</button>
                <button onClick={() => { setEditing(o); setModalOpen(true); }} style={{ ...btnGhost, padding: 8 }} aria-label="Edit"><Pencil size={15} /></button>
                <button onClick={() => remove(o)} style={{ ...btnGhost, padding: 8, color: 'var(--danger)', borderColor: 'var(--danger)' }} aria-label="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && <OpeningModal editing={editing} onClose={() => setModalOpen(false)} onSaved={load} />}
    </section>
  );
};

export default RecruiterOpenings;
