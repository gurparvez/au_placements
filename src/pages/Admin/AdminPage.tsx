import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Shield, RefreshCw, Users, Building2, UserCheck, LayoutDashboard, Award, Settings, GraduationCap, Layers } from 'lucide-react';
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
  borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px',
  borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)',
  fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };

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
      <div style={{ ...card, position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{isEdit ? 'Edit user' : 'Create user'}</h2>
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
            <select value={form.university} onChange={(e) => set('university', e.target.value as University)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Gender <span style={{ fontWeight: 400 }}>(for NIRF reporting)</span></label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value as FormState['gender'])} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Not recorded</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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
          <button onClick={submit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
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
      <div style={{ ...card, position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Academic record</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
          {user.firstName} (AUID {user.auid}). Leave a field blank to keep its current value.
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
          <button onClick={submit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
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
    return <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Loading…</section>;
  }
  if (!isAdmin) {
    return <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Redirecting…</section>;
  }

  return (
    // The dashboard has far more to show than the CRUD tables — give it room.
    <section style={{ maxWidth: tab === 'dashboard' || tab === 'policy' || tab === 'reference' ? 1320 : 1100, margin: '0 auto', padding: '40px 24px 80px', transition: 'max-width .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <Shield size={22} />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Admin</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Placement analytics, user management, and recruiter approvals.
          </p>
        </div>
        {tab === 'users' && <button onClick={openCreate} style={btnPrimary}><Plus size={16} /> New user</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, margin: '20px 0 4px', borderBottom: '1px solid var(--border)' }}>
        {([['dashboard', LayoutDashboard], ['placements', Award], ['policy', Settings], ['reference', Layers], ['users', Users], ['recruiters', Building2], ['approvals', UserCheck]] as const).map(([t, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, textTransform: 'capitalize',
              color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            <Icon size={16} /> {t}
            {t === 'approvals' && !!pendingCount && (
              <span style={{
                minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'color-mix(in srgb, orange 18%, transparent)', color: 'orange',
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

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
        <button type="submit" style={btnGhost}>Search</button>
        <button type="button" onClick={load} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
      </form>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-subtle)', background: 'var(--surface-2)' }}>
                {['AUID', 'Name', 'Email', 'University', 'Roles', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Users size={26} style={{ opacity: 0.5 }} />
                    <span>{q ? 'No users match your search.' : 'No users yet.'}</span>
                  </div>
                </td></tr>
              ) : (
                rows.map((u) => (
                  <tr key={u._id} style={{ borderTop: '1px solid var(--border)', transition: 'background .15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{u.auid}</td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <Avatar first={u.firstName} last={u.lastName} />
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{`${u.firstName} ${u.lastName ?? ''}`.trim()}</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{u.university}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {u.roles.map((r) => (
                          <span key={r} style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize',
                            background: r === 'admin' ? 'var(--primary-soft)' : 'var(--surface-2)',
                            color: r === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}>{r}</span>
                        ))}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {u.roles.includes('student') && (
                        <button onClick={() => setRecordFor(u)} aria-label="Edit academic record"
                          title="Academic record (CGPA, backlogs, readiness)"
                          style={{ ...btnGhost, padding: 8, marginRight: 6 }}>
                          <GraduationCap size={15} />
                        </button>
                      )}
                      <button onClick={() => openEdit(u)} aria-label="Edit user" style={{ ...btnGhost, padding: 8, marginRight: 6 }}><Pencil size={15} /></button>
                      <button onClick={() => remove(u)} aria-label="Delete user"
                        style={{ ...btnGhost, padding: 8, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        disabled={u._id === user?._id}
                        title={u._id === user?._id ? 'You cannot delete yourself' : 'Delete user'}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
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

      {modalOpen && <UserFormModal editing={editing} onClose={() => setModalOpen(false)} onSaved={load} />}
      {recordFor && <RecordModal user={recordFor} onClose={() => setRecordFor(null)} onSaved={load} />}
      </>
      )}
    </section>
  );
};

export default AdminPage;
