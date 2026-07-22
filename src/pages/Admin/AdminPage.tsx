import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, RefreshCw, Users, Building2, UserCheck, LayoutDashboard, Award, Settings, GraduationCap, Layers } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import adminApi, {
  type AdminUser,
  type CreateUserPayload,
  type Pagination,
  type Role,
  type University,
} from '@/api/admin';
import RecruitersPanel from './RecruitersPanel';
import DashboardPanel from './DashboardPanel';
import PlacementsPanel from './PlacementsPanel';
import TpoPanel from './TpoPanel';
import ReferencePanel from './ReferencePanel';
import analyticsApi from '@/api/analytics';
import { avatarColor, initials } from '@/utils/avatar';
import { motion, AnimatePresence } from 'motion/react';
import { Reveal } from '@/components/motion';
import { SelectField } from '@/components/ui/select-field';

/* ------------------------------ helpers ------------------------------ */

const UNIVERSITIES: University[] = ['Akal University', 'Eternal University'];

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length) {
      return data.errors.map((e: any) => e.message || e.field).join(', ');
    }
    if (data?.message) return data.message;
  }
  return fallback;
}

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)',
  border: '1px solid var(--border-strong)', background: 'var(--bg-2)',
  color: 'var(--text)', fontSize: 14, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px',
  borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
  transition: 'background .18s ease',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px',
  borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)',
  fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
  transition: 'background .18s ease',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

const Avatar: React.FC<{ first?: string; last?: string }> = ({ first, last }) => (
  <span aria-hidden style={{
    width: 32, height: 32, borderRadius: '50%', flex: 'none', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12,
    background: avatarColor(`${first ?? ''} ${last ?? ''}`),
  }}>{initials(first, last) || '?'}</span>
);

/* --------------------------- user form modal --------------------------- */

type FormState = {
  auid: string; password: string; firstName: string; lastName: string;
  email: string; phone: string; university: University; gender: '' | 'male' | 'female' | 'other'; roles: Role[];
};

const emptyForm: FormState = {
  auid: '', password: '', firstName: '', lastName: '',
  email: '', phone: '', university: 'Akal University', gender: '', roles: ['student'],
};

function UserFormModal({
  editing, onClose, onSaved,
}: {
  editing: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          auid: editing.auid ?? '', password: '', firstName: editing.firstName,
          lastName: editing.lastName ?? '', email: editing.email ?? '',
          phone: editing.phone ?? '', university: editing.university ?? 'Akal University',
          gender: (editing.gender ?? '') as FormState['gender'],
          roles: editing.roles?.length ? editing.roles : ['student'],
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleRole = (role: Role) =>
    setForm((f) => {
      const has = f.roles.includes(role);
      const roles = has ? f.roles.filter((r) => r !== role) : [...f.roles, role];
      return { ...f, roles: roles.length ? roles : f.roles };
    });

  const submit = async () => {
    if (!isEdit && !/^\d{5,15}$/.test(form.auid.trim())) return toast.error('AUID must be 5–15 digits.');
    if (!isEdit && form.password.length < 8) return toast.error('Password must be at least 8 characters.');
    if (isEdit && form.password && form.password.length < 8) return toast.error('Password must be at least 8 characters.');
    if (!form.firstName.trim()) return toast.error('First name is required.');

    setSaving(true);
    try {
      if (isEdit && editing) {
        const payload: Record<string, any> = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          university: form.university,
          gender: form.gender || undefined,
          roles: form.roles,
        };
        if (form.password) payload.password = form.password;
        await adminApi.updateUser(editing._id, payload);
        toast.success('User updated.');
      } else {
        const payload: CreateUserPayload = {
          auid: form.auid.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          university: form.university,
          gender: form.gender || undefined,
          roles: form.roles,
        };
        await adminApi.createUser(payload);
        toast.success('User created.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractError(err, isEdit ? 'Failed to update user.' : 'Failed to create user.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit user' : 'Create user'} style={{ ...card, position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 className="font-display" style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: '-.01em' }}>{isEdit ? 'Edit user' : 'Create user'}</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
          {isEdit ? `Updating ${editing?.firstName} (AUID ${editing?.auid}).` : 'Create a student or admin account.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>AUID / Roll No.</label>
            <input value={form.auid} disabled={isEdit} onChange={(e) => set('auid', e.target.value)}
              placeholder="5–15 digit university ID"
              style={{ ...inputStyle, opacity: isEdit ? 0.6 : 1, cursor: isEdit ? 'not-allowed' : 'text' }} />
          </div>
          <div>
            <label style={labelStyle}>First name</label>
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last name</label>
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>University</label>
            <SelectField aria-label="University" value={form.university} onChange={(v) => set('university', v as University)}
              options={UNIVERSITIES.map((u) => ({ value: u, label: u }))} />
          </div>
          <div>
            <label style={labelStyle}>Gender <span style={{ fontWeight: 400 }}>(for NIRF reporting)</span></label>
            <SelectField aria-label="Gender" value={form.gender} onChange={(v) => set('gender', v as FormState['gender'])}
              options={[
                { value: '', label: 'Not recorded' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]} />
          </div>
          <div>
            <label style={labelStyle}>{isEdit ? 'New password' : 'Password'}</label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder={isEdit ? 'Leave blank to keep' : 'Min 8 characters'} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Roles</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['student', 'admin'] as Role[]).map((role) => (
                <button key={role} type="button" onClick={() => toggleRole(role)}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 'var(--r-ctl)', cursor: 'pointer',
                    border: `1px solid ${form.roles.includes(role) ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.roles.includes(role) ? 'var(--primary-soft)' : 'transparent',
                    color: form.roles.includes(role) ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
                  }}>
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- academic record modal ----------------------- */

/**
 * TPO-owned fields. Students cannot edit these — CGPA and backlogs drive every
 * eligibility check, and readiness scores are the only leading indicators the
 * dashboard has.
 */
function RecordModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    cgpa: '', backlogs: '', department: '', batch_year: '',
    aptitude_score: '', mock_interviews: '', mock_interview_score: '', training_attendance: '',
    resume_verified: false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async () => {
    const payload: Record<string, unknown> = {};
    // Only send fields the TPO actually filled in — blanks must not wipe data.
    for (const [k, v] of Object.entries(form)) {
      if (typeof v === 'boolean') { payload[k] = v; continue; }
      if (v !== '') payload[k] = k === 'department' ? v : Number(v);
    }
    setSaving(true);
    try {
      await analyticsApi.updateStudentRecord(user._id, payload);
      toast.success('Academic record updated.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractError(err, 'Failed to update record.'));
    } finally {
      setSaving(false);
    }
  };

  const num = (k: keyof typeof form, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="number" value={form[k] as string} onChange={(e) => set(k, e.target.value)} style={inputStyle} {...extra} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div role="dialog" aria-modal="true" aria-label="Academic record" style={{ ...card, position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 className="font-display" style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: '-.01em' }}>Academic record</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
          {user.firstName} (AUID {user.auid}). Blank fields keep current values.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Department</label>
            <input value={form.department} onChange={(e) => set('department', e.target.value)} style={inputStyle} />
          </div>
          {num('batch_year', 'Batch year', { min: 1990, max: 2100 })}
          {num('cgpa', 'CGPA (verified)', { min: 0, max: 10, step: '0.01' })}
          {num('backlogs', 'Active backlogs', { min: 0 })}
          {num('aptitude_score', 'Aptitude score (0–100)', { min: 0, max: 100 })}
          {num('mock_interviews', 'Mock interviews attended', { min: 0 })}
          {num('mock_interview_score', 'Mock score (0–10)', { min: 0, max: 10, step: '0.1' })}
          {num('training_attendance', 'Training attendance %', { min: 0, max: 100 })}
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13.5 }}>
              <input type="checkbox" checked={form.resume_verified} onChange={(e) => set('resume_verified', e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }} />
              Resume verified
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save record'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);

  const isAdmin = !!user?.roles?.includes('admin');

  const [tab, setTab] = useState<'dashboard' | 'placements' | 'policy' | 'reference' | 'users' | 'recruiters' | 'approvals'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [recordFor, setRecordFor] = useState<AdminUser | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const res = await adminApi.listRecruiters({ page: 1, limit: 1, status: 'pending' });
      setPendingCount(res.pagination.total);
    } catch { /* non-critical badge */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ page, limit: 20, q: q.trim() || undefined });
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  // Redirect out if the visitor is not an admin (after auth resolves).
  useEffect(() => {
    if (!initialized) return;
    if (!user) navigate('/login', { replace: true });
    else if (!isAdmin) navigate('/profiles', { replace: true });
  }, [initialized, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  useEffect(() => {
    if (isAdmin) loadPending();
  }, [isAdmin, loadPending]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (u: AdminUser) => { setEditing(u); setModalOpen(true); };

  const remove = async (u: AdminUser) => {
    if (!window.confirm(`Delete ${u.firstName} (AUID ${u.auid})? This also removes their student profile.`)) return;
    try {
      await adminApi.deleteUser(u._id);
      toast.success('User deleted.');
      // If we just emptied the last page, step back one.
      if (users.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete user.'));
    }
  };

  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const rows = useMemo(() => users, [users]);

  if (!initialized) {
    return <section style={{ padding: '60px clamp(20px,10vw,112px)', color: 'var(--text-muted)' }}>Loading…</section>;
  }
  if (!isAdmin) {
    return <section style={{ padding: '60px clamp(20px,10vw,112px)', color: 'var(--text-muted)' }}>Redirecting…</section>;
  }

  return (
    // The dashboard has far more to show than the CRUD tables — give it room.
    <section style={{ padding: '40px clamp(20px,10vw,112px) 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="brass-rule" style={{ marginBottom: 12 }} />
          <span className="ledger-label" style={{ color: 'var(--brass)' }}>Placement office</span>
          <h1 className="font-display" style={{ margin: '8px 0 0', fontSize: 'clamp(24px,3vw,30px)', fontWeight: 500, letterSpacing: '-.02em' }}>Admin</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Placement analytics, user management, and recruiter approvals.
          </p>
        </div>
        {tab === 'users' && <button onClick={openCreate} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}><Plus size={16} /> New user</button>}
      </div>

      {/* Tabs — one segmented card; the active pill slides between tabs (shared layoutId) */}
      <div style={{
        display: 'flex', gap: 4, margin: '20px 0 4px', padding: 6, flexWrap: 'wrap',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-sm)',
      }}>
        {([['dashboard', LayoutDashboard], ['placements', Award], ['policy', Settings], ['reference', Layers], ['users', Users], ['recruiters', Building2], ['approvals', UserCheck]] as const).map(([t, Icon]) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-2)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
              style={{
                position: 'relative', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 8px', border: 'none', cursor: 'pointer', minWidth: 110,
                background: 'transparent', borderRadius: 'var(--r-ctl)',
                fontWeight: active ? 700 : 600, fontSize: 13.5, textTransform: 'capitalize',
                whiteSpace: 'nowrap', color: active ? 'var(--pri-ink)' : 'var(--text-muted)',
                transition: 'color .18s ease, background .18s ease',
              }}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab"
                  aria-hidden
                  style={{ position: 'absolute', inset: 0, background: 'var(--pri-soft)', borderRadius: 'var(--r-ctl)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Icon size={16} /> {t}
                {t === 'approvals' && !!pendingCount && (
                  <span className="data" style={{
                    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'color-mix(in srgb, orange 18%, transparent)', color: 'orange',
                  }}>{pendingCount}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab panels — calm crossfade between top tabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'dashboard' ? (
            <DashboardPanel />
          ) : tab === 'placements' ? (
            <PlacementsPanel />
          ) : tab === 'policy' ? (
            <TpoPanel />
          ) : tab === 'reference' ? (
            <ReferencePanel />
          ) : tab === 'recruiters' ? (
            <div style={{ marginTop: 18 }}><RecruitersPanel mode="active" onChanged={loadPending} /></div>
          ) : tab === 'approvals' ? (
            <div style={{ marginTop: 18 }}><RecruitersPanel mode="approvals" onChanged={loadPending} /></div>
          ) : (
            <>
              <form onSubmit={submitSearch} style={{ display: 'flex', gap: 10, margin: '22px 0 16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by AUID, name, or email"
                    style={{ ...inputStyle, paddingLeft: 36 }} />
                </div>
                <button type="submit" {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>Search</button>
                <button type="button" onClick={load} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
              </form>

              <Reveal>
                {loading ? (
                  <div style={{ ...card, padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
                ) : rows.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px',
                    color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--r-card)',
                  }}>
                    <Users size={26} style={{ opacity: 0.5 }} />
                    <span>{q ? 'No users match your search.' : 'No users yet.'}</span>
                  </div>
                ) : (
                  <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
                    {rows.map((u) => {
                      const isAdminUser = u.roles.includes('admin');
                      const tone = isAdminUser ? 'var(--primary)' : 'var(--text-subtle)';
                      const isSelf = u._id === user?._id;
                      const quietBtn: React.CSSProperties = {
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: 8, border: 'none', background: 'none',
                        color: 'var(--text-subtle)', cursor: 'pointer', padding: 0, flex: 'none',
                        transition: 'color .14s ease, background .14s ease',
                      };
                      const quietHover = (color: string, bg: string) => ({
                        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = color; e.currentTarget.style.background = bg; },
                        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'none'; },
                      });
                      return (
                        <div
                          key={u._id}
                          style={{
                            minWidth: 0, overflow: 'hidden',
                            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)',
                            transition: 'border-color .18s ease, transform .18s ease, box-shadow .18s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-strong)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* identity band — tinted by role */}
                          <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 11, padding: '14px 16px',
                            background: `color-mix(in srgb, ${tone} 17%, transparent)`,
                            borderBottom: '1px solid var(--border)',
                          }}>
                            <Avatar first={u.firstName} last={u.lastName} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 650, textTransform: 'capitalize', lineHeight: 1.35 }}>
                                {`${u.firstName} ${u.lastName ?? ''}`.trim()}
                              </span>
                              <span className="data" style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.45 }}>
                                AUID {u.auid} · {u.university}
                              </span>
                            </div>
                            <span style={{ flex: 'none', display: 'inline-flex', gap: 6 }}>
                              {u.roles.map((r) => (
                                <span key={r} style={{
                                  padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                                  color: r === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                                }}>{r}</span>
                              ))}
                            </span>
                          </div>

                          {/* email + actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px 12px' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflowWrap: 'anywhere', minWidth: 0 }}>
                              {u.email || 'No email recorded'}
                            </span>
                            <span style={{ marginLeft: 'auto', flex: 'none', display: 'inline-flex', gap: 2 }}>
                              {u.roles.includes('student') && (
                                <button onClick={() => setRecordFor(u)} aria-label="Edit academic record"
                                  title="Academic record (CGPA, backlogs, readiness)"
                                  style={quietBtn} {...quietHover('var(--text)', 'var(--surface-2)')}>
                                  <GraduationCap size={15} />
                                </button>
                              )}
                              <button onClick={() => openEdit(u)} aria-label="Edit user" title="Edit user"
                                style={quietBtn} {...quietHover('var(--text)', 'var(--surface-2)')}>
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => remove(u)} aria-label="Delete user"
                                disabled={isSelf}
                                title={isSelf ? 'You cannot delete yourself' : 'Delete user'}
                                style={{ ...quietBtn, opacity: isSelf ? 0.35 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                                {...(isSelf ? {} : quietHover('var(--danger)', 'var(--danger-soft)'))}>
                                <Trash2 size={14} />
                              </button>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Reveal>

              {pagination && pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span className="data" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} users
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                      style={{ ...btnGhost, opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
                    <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                      style={{ ...btnGhost, opacity: page >= pagination.totalPages ? 0.5 : 1 }}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {modalOpen && <UserFormModal editing={editing} onClose={() => setModalOpen(false)} onSaved={load} />}
      {recordFor && <RecordModal user={recordFor} onClose={() => setRecordFor(null)} onSaved={load} />}
    </section>
  );
};

export default AdminPage;
