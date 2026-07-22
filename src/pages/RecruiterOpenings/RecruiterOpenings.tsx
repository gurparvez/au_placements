import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Briefcase, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/context/hooks';
import openingsApi, {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type Opening,
  type OpeningPayload,
  type University,
  ROUND_RESULTS,
  type Applicant,
  type RoundResult,
} from '@/api/openings';
import type { Skill } from '@/api/skills';
import SkillPicker from '@/components/SkillPicker';
import { SelectField, DateField } from '@/components/ui/select-field';
import departmentsApi, { type Department } from '@/api/departments';
import { avatarColor, initials } from '@/utils/avatar';

const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';

const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

/* --------------------------- applicants modal --------------------------- */

/** Colour cue per pipeline stage, so a long list scans at a glance. */
const ROUND_TONE: Record<RoundResult, string> = {
  pending: 'var(--text-subtle)',
  cleared: '#22c55e',
  failed: 'var(--danger)',
  absent: '#f59e0b',
};

const STATUS_TONE: Record<string, string> = {
  applied: 'var(--text-muted)',
  reviewed: '#06b6d4',
  shortlisted: '#f59e0b',
  interviewed: '#a855f7',
  offered: '#22c55e',
  accepted: '#22c55e',
  rejected: 'var(--danger)',
};

function ApplicantsModal({ opening, onClose }: { opening: Opening; onClose: () => void }) {
  const [rows, setRows] = useState<Applicant[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    const prev = rows;
    // Optimistic: reflect the choice immediately, roll back if the call fails.
    setRows((r) => r?.map((x) => (x._id === applicationId ? { ...x, status } : x)) ?? r);
    setSavingId(applicationId);
    try {
      await openingsApi.setApplicantStatus(opening._id, applicationId, status);
      toast.success(`Marked ${status}. The student has been notified.`);
    } catch (err) {
      setRows(prev ?? null);
      toast.error(extractError(err, 'Could not update the application.'));
    } finally {
      setSavingId(null);
    }
  };

  const updateRound = async (a: Applicant, order: number, result: RoundResult) => {
    const prev = rows;
    setRows((r) => r?.map((x) => x._id !== a._id ? x : {
      ...x, rounds: (x.rounds ?? []).map((rd) => rd.order === order ? { ...rd, result } : rd),
    }) ?? r);
    try {
      const updated = await openingsApi.setRoundResult(opening._id, a._id, order, result);
      // The server also moves the flat status (a failed round ends the application).
      setRows((r) => r?.map((x) => x._id === a._id ? { ...x, status: updated.status, rounds: updated.rounds, current_round: updated.current_round } : x) ?? r);
    } catch (err) {
      setRows(prev ?? null);
      toast.error(extractError(err, 'Could not record the round result.'));
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { const r = await openingsApi.applicants(opening._id); if (!cancelled) setRows(r); }
      catch { if (!cancelled) setRows([]); }
    })();
    return () => { cancelled = true; };
  }, [opening._id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div role="dialog" aria-modal="true" aria-label={`Applicants for ${opening.title}`} style={{ position: 'relative', width: 'min(680px,100%)', maxHeight: '85vh', overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 className="font-display" style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Applicants</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{opening.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ width: 32, height: 32, borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .18s ease' }}><X size={15} /></button>
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
              <div key={a._id} style={{ padding: '11px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span aria-hidden style={{ width: 38, height: 38, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, background: avatarColor(`${a.student?.firstName ?? ''} ${a.student?.lastName ?? ''}`) }}>{initials(a.student?.firstName, a.student?.lastName) || '?'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {a.student ? (
                    <Link to={`/profiles/${a.student._id}`} onClick={onClose} style={{ fontWeight: 650, fontSize: 14, textTransform: 'capitalize', color: 'var(--text)', textDecoration: 'none' }}>{`${a.student.firstName ?? ''} ${a.student.lastName ?? ''}`.trim() || 'Student'}</Link>
                  ) : <span style={{ fontWeight: 650, fontSize: 14, color: 'var(--text-muted)' }}>Unknown</span>}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.student?.auid ? `AUID ${a.student.auid}` : ''}{a.student?.university ? `${a.student?.auid ? ' · ' : ''}${a.student.university.replace(' University', '')}` : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{fmt(a.appliedAt)}</span>
                  <select
                    value={a.status}
                    disabled={savingId === a._id}
                    onChange={(e) => updateStatus(a._id, e.target.value as ApplicationStatus)}
                    aria-label="Application status"
                    style={{
                      padding: '5px 8px', borderRadius: 'var(--r-ctl)', fontSize: 12, fontWeight: 600,
                      textTransform: 'capitalize', cursor: 'pointer',
                      border: `1px solid color-mix(in srgb, ${STATUS_TONE[a.status] ?? 'var(--text-muted)'} 34%, transparent)`,
                      background: `color-mix(in srgb, ${STATUS_TONE[a.status] ?? 'var(--text-muted)'} 12%, transparent)`,
                      color: STATUS_TONE[a.status] ?? 'var(--text-muted)',
                      opacity: savingId === a._id ? 0.6 : 1,
                    }}
                  >
                    {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {!!a.rounds?.length && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 9, paddingLeft: 50 }}>
                  {a.rounds.map((rd) => (
                    <label
                      key={rd.order}
                      title={rd.notes || rd.name}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 4px 3px 9px',
                        borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid color-mix(in srgb, ${ROUND_TONE[rd.result]} 32%, transparent)`,
                        background: `color-mix(in srgb, ${ROUND_TONE[rd.result]} 11%, transparent)`,
                        color: ROUND_TONE[rd.result],
                      }}
                    >
                      {rd.order}. {rd.name}
                      <select
                        value={rd.result}
                        onChange={(e) => updateRound(a, rd.order, e.target.value as RoundResult)}
                        aria-label={`${rd.name} result`}
                        style={{
                          border: 'none', background: 'transparent', color: 'inherit',
                          fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                        }}
                      >
                        {ROUND_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              )}
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
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background .18s ease' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)', transition: 'background .18s ease' };
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
  min_cgpa: string; max_backlogs: string; eligible_departments: string;
  eligible_batches: string; allow_placed: boolean;
  tier: 'regular' | 'core' | 'dream'; ctc_lpa: string;
  rounds: string[];
}

/** Default selection pipeline, mirroring DEFAULT_ROUNDS on the server. */
const DEFAULT_ROUNDS = ['Pre-placement talk', 'Aptitude test', 'Technical interview', 'HR interview'];

const emptyForm: FormState = {
  company: '',
  title: '', description: '', type: 'internship', work_mode: '', location: '', skills: [],
  eligible_universities: [], min_experience: '', stipend_or_salary: '', apply_url: '', apply_by: '',
  min_cgpa: '', max_backlogs: '', eligible_departments: '', eligible_batches: '', allow_placed: false,
  tier: 'regular', ctc_lpa: '', rounds: DEFAULT_ROUNDS,
};

/** Comma/newline separated text → trimmed list. */
const parseList = (v: string) => v.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

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
          min_cgpa: editing.min_cgpa != null ? String(editing.min_cgpa) : '',
          max_backlogs: editing.max_backlogs != null ? String(editing.max_backlogs) : '',
          eligible_departments: (editing.eligible_departments ?? []).join(', '),
          eligible_batches: (editing.eligible_batches ?? []).join(', '),
          allow_placed: !!editing.allow_placed,
          tier: editing.tier ?? 'regular',
          ctc_lpa: editing.ctc_lpa != null ? String(editing.ctc_lpa) : '',
          rounds: (editing.rounds ?? []).length ? editing.rounds!.map((r) => r.name) : DEFAULT_ROUNDS,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const initialSkills: Skill[] = editing?.skills || [];

  // Official department list — eligibility only matches exact names, so this
  // must come from the same source students pick from, never free text.
  useEffect(() => {
    departmentsApi.list().then(setDepartments).catch(() => { /* selector stays empty */ });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selectedDepts = form.eligible_departments.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  const toggleDept = (name: string) =>
    setForm((f) => {
      const cur = f.eligible_departments.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
      const next = cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name];
      return { ...f, eligible_departments: next.join(', ') };
    });

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

        min_cgpa: form.min_cgpa ? Number(form.min_cgpa) : undefined,
        max_backlogs: form.max_backlogs ? Number(form.max_backlogs) : undefined,
        eligible_departments: parseList(form.eligible_departments),
        eligible_batches: parseList(form.eligible_batches).map(Number).filter((n) => !Number.isNaN(n)),
        allow_placed: form.allow_placed,
        tier: form.tier,
        ctc_lpa: form.ctc_lpa ? Number(form.ctc_lpa) : undefined,
        rounds: form.rounds.filter((r) => r.trim()).map((name, i) => ({ name: name.trim(), order: i + 1 })),
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
      <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit opening' : 'Post an opening'} style={{ ...card, position: 'relative', width: 'min(620px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 className="font-display" style={{ margin: 0, fontSize: 19, fontWeight: 500 }}>{isEdit ? 'Edit opening' : 'Post an opening'}</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{isEdit ? 'Update the details students see.' : 'Share an internship or job.'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          {requireCompany && (
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Company</label><input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name" style={input} /></div>
          )}
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Title</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Frontend Developer Intern" style={input} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Description</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} style={{ ...input, resize: 'vertical' }} /></div>
          <div>
            <label style={label}>Type</label>
            <SelectField aria-label="Type" value={form.type} onChange={(v) => set('type', v as any)}
              options={[{ value: 'internship', label: 'Internship' }, { value: 'job', label: 'Job' }]} />
          </div>
          <div>
            <label style={label}>Work mode</label>
            <SelectField aria-label="Work mode" value={form.work_mode} onChange={(v) => set('work_mode', v as any)}
              options={[{ value: '', label: '—' }, { value: 'onsite', label: 'Onsite' }, { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }]} />
          </div>
          <div><label style={label}>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} style={input} /></div>
          <div><label style={label}>Stipend / Salary</label><input value={form.stipend_or_salary} onChange={(e) => set('stipend_or_salary', e.target.value)} placeholder="e.g. ₹20,000/mo" style={input} /></div>
          <div><label style={label}>Min experience (months)</label><input type="number" min={0} value={form.min_experience} onChange={(e) => set('min_experience', e.target.value)} style={input} /></div>
          <div><label style={label}>Apply by</label><DateField value={form.apply_by} onChange={(v) => set('apply_by', v)} aria-label="Apply by" /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Apply URL</label><input value={form.apply_url} onChange={(e) => set('apply_url', e.target.value)} placeholder="https://…" style={input} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <SkillPicker label="Required skills" selected={form.skills} setSelected={(s) => set('skills', s)} initialData={initialSkills} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 6, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <h3 className="font-display" style={{ margin: '0 0 3px', fontSize: 13.5, fontWeight: 500 }}>Eligibility criteria</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              Enforced server-side. Students see which criterion failed.
            </p>
          </div>
          <div><label style={label}>Minimum CGPA</label><input type="number" min={0} max={10} step="0.1" value={form.min_cgpa} onChange={(e) => set('min_cgpa', e.target.value)} placeholder="e.g. 7.0" style={input} /></div>
          <div><label style={label}>Max active backlogs</label><input type="number" min={0} value={form.max_backlogs} onChange={(e) => set('max_backlogs', e.target.value)} placeholder="e.g. 0" style={input} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Eligible departments <span style={{ fontWeight: 400 }}>(none selected = open to all)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {departments.length === 0 ? (
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Loading departments…</span>
              ) : (
                departments.map((d) => {
                  const on = selectedDepts.includes(d.name);
                  return (
                    <button
                      key={d._id}
                      type="button"
                      onClick={() => toggleDept(d.name)}
                      style={{
                        padding: '6px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${on ? 'var(--primary)' : 'var(--border)'}`,
                        background: on ? 'var(--primary-soft)' : 'transparent',
                        color: on ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    >
                      {d.code || d.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div><label style={label}>Eligible batches</label><input value={form.eligible_batches} onChange={(e) => set('eligible_batches', e.target.value)} placeholder="e.g. 2027, 2028" style={input} /></div>
          <div>
            <label style={label}>Package tier</label>
            <SelectField aria-label="Package tier" value={form.tier} onChange={(v) => set('tier', v as FormState['tier'])}
              options={[{ value: 'regular', label: 'Regular' }, { value: 'core', label: 'Core' }, { value: 'dream', label: 'Dream' }]} />
          </div>
          <div><label style={label}>Package (LPA)</label><input type="number" min={0} step="0.5" value={form.ctc_lpa} onChange={(e) => set('ctc_lpa', e.target.value)} placeholder="e.g. 12" style={input} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13, paddingBottom: 10 }}>
              <input type="checkbox" checked={form.allow_placed} onChange={(e) => set('allow_placed', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              Open to already-placed students
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 6, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <label style={label}>Selection rounds</label>
            <p style={{ margin: '0 0 9px', fontSize: 12, color: 'var(--text-muted)' }}>
              Recorded per applicant.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.rounds.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 22, flex: 'none', fontSize: 12, color: 'var(--text-subtle)', fontWeight: 600 }}>{i + 1}.</span>
                  <input
                    value={r}
                    onChange={(e) => set('rounds', form.rounds.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder="Round name"
                    style={input}
                  />
                  <button type="button" onClick={() => set('rounds', form.rounds.filter((_, j) => j !== i))}
                    aria-label="Remove round" {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ ...btnGhost, padding: 8, flex: 'none' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {form.rounds.length < 10 && (
                <button type="button" onClick={() => set('rounds', [...form.rounds, ''])} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ ...btnGhost, alignSelf: 'flex-start' }}>
                  <Plus size={14} /> Add round
                </button>
              )}
            </div>
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
          <button onClick={onClose} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Post opening'}</button>
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

  if (!initialized) return <section style={{ padding: '60px clamp(20px,10vw,112px)', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!canManage) return <section style={{ padding: '60px clamp(20px,10vw,112px)', color: 'var(--text-muted)' }}>Redirecting…</section>;

  const openCount = openings.filter((o) => o.status === 'open').length;
  const summary = openings.length === 0
    ? 'Post and manage internships & jobs.'
    : `${openings.length} opening${openings.length === 1 ? '' : 's'} · ${openCount} open`;

  return (
    <section style={{ padding: '40px clamp(20px,10vw,112px) 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="brass-rule" style={{ marginBottom: 14 }} />
          <span className="ledger-label" style={{ color: 'var(--brass)' }}>Recruiter tools</span>
          <h1 className="font-display" style={{ margin: '10px 0 0', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, letterSpacing: '-.02em' }}>My openings</h1>
          <p style={{ textAlign: 'left', margin: '10px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>{summary}</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}><Plus size={16} /> Post opening</button>
      </div>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>Loading…</p>
        ) : openings.length === 0 ? (
          <div style={{ ...card, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={24} /></span>
            <div style={{ fontWeight: 650, fontSize: 15.5 }}>No openings yet</div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 340 }}>Post your first internship or job.</p>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, marginTop: 6 }}><Plus size={16} /> Post opening</button>
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
                <button onClick={() => setApplicantsFor(o)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Users size={15} /> Applicants{typeof o.application_count === 'number' ? ` (${o.application_count})` : ''}
                </button>
                <button onClick={() => toggleStatus(o)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>{o.status === 'open' ? 'Close' : 'Reopen'}</button>
                <button onClick={() => { setEditing(o); setModalOpen(true); }} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ ...btnGhost, padding: 8 }} aria-label="Edit"><Pencil size={15} /></button>
                <button onClick={() => remove(o)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ ...btnGhost, padding: 8, color: 'var(--danger)', borderColor: 'var(--danger)' }} aria-label="Delete"><Trash2 size={15} /></button>
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
