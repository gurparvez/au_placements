import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Check, X, RefreshCw, Search, Building2 } from 'lucide-react';
import adminApi, {
  type RecruiterRow,
  type Pagination,
  type AdminCreateRecruiterPayload,
  type CompanySize,
} from '@/api/admin';
import { avatarColor, initials } from '@/utils/avatar';

const Avatar: React.FC<{ first?: string; last?: string }> = ({ first, last }) => (
  <span aria-hidden style={{
    width: 32, height: 32, borderRadius: '50%', flex: 'none', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12,
    background: avatarColor(`${first ?? ''} ${last ?? ''}`),
  }}>{initials(first, last) || '?'}</span>
);

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)',
  border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--r-ctl)',
  background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-ctl)',
  background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };
const SIZES: CompanySize[] = ['1-10', '11-50', '51-200', '201-500', '500+'];
const STATUSES = ['pending', 'active', 'rejected', 'suspended'] as const;

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d: any = err.response?.data;
    if (Array.isArray(d?.errors) && d.errors.length) return d.errors.map((e: any) => e.message).join(', ');
    if (d?.message) return d.message;
  }
  return fallback;
}

const statusChip = (s?: string): React.CSSProperties => {
  const map: Record<string, [string, string]> = {
    active: ['var(--primary-soft)', 'var(--primary)'],
    pending: ['color-mix(in srgb, orange 18%, transparent)', 'orange'],
    rejected: ['var(--danger-soft)', 'var(--danger)'],
    suspended: ['var(--surface-2)', 'var(--text-muted)'],
  };
  const [bg, color] = map[s ?? ''] ?? ['var(--surface-2)', 'var(--text-muted)'];
  return { padding: '2px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize', background: bg, color, border: '1px solid var(--border)' };
};

/* --------------------------- create recruiter modal --------------------------- */

function CreateRecruiterModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AdminCreateRecruiterPayload>({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    company: '', designation: '', company_website: '', industry: '', company_size: undefined, location: '', linkedin_url: '', about: '',
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminCreateRecruiterPayload>(k: K, v: AdminCreateRecruiterPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.firstName.trim()) return toast.error('First name is required.');
    if (!form.email.trim()) return toast.error('Email is required.');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters.');
    if (!form.company.trim()) return toast.error('Company name is required.');
    setSaving(true);
    try {
      await adminApi.createRecruiter({
        ...form,
        lastName: form.lastName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        designation: form.designation?.trim() || undefined,
        company_website: form.company_website?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        company_size: form.company_size || undefined,
        location: form.location?.trim() || undefined,
        linkedin_url: form.linkedin_url?.trim() || undefined,
        about: form.about?.trim() || undefined,
      });
      toast.success('Recruiter created (active).');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractError(err, 'Failed to create recruiter.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div style={{ ...card, position: 'relative', width: 'min(600px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Create recruiter</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>Created already-approved (active). They log in with email + password.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>First name</label><input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Last name</label><input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Password</label><input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min 8 chars" style={inputStyle} /></div>
          <div><label style={labelStyle}>Designation</label><input value={form.designation} onChange={(e) => set('designation', e.target.value)} style={inputStyle} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Company</label><input value={form.company} onChange={(e) => set('company', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Website</label><input value={form.company_website} onChange={(e) => set('company_website', e.target.value)} placeholder="https://…" style={inputStyle} /></div>
          <div><label style={labelStyle}>Industry</label><input value={form.industry} onChange={(e) => set('industry', e.target.value)} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Company size</label>
            <select value={form.company_size ?? ''} onChange={(e) => set('company_size', (e.target.value || undefined) as any)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} style={inputStyle} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Create recruiter'}</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- panel ------------------------------- */

const RecruitersPanel: React.FC<{ onChanged?: () => void }> = ({ onChanged }) => {
  const [rows, setRows] = useState<RecruiterRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('pending');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listRecruiters({ page, limit: 20, status: status || undefined, q: q.trim() || undefined });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load recruiters.'));
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => { load(); }, [load]);

  const approve = async (r: RecruiterRow) => {
    if (!r.recruiter) return;
    setActing(r.recruiter._id);
    try {
      await adminApi.approveRecruiter(r.recruiter._id);
      toast.success(`${r.user.firstName} approved.`);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(extractError(err, 'Failed to approve.'));
    } finally { setActing(null); }
  };

  const reject = async (r: RecruiterRow) => {
    if (!r.recruiter) return;
    const reason = window.prompt(`Reject ${r.user.firstName}? Optional reason:`) ?? undefined;
    setActing(r.recruiter._id);
    try {
      await adminApi.rejectRecruiter(r.recruiter._id, reason || undefined);
      toast.success(`${r.user.firstName} rejected.`);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(extractError(err, 'Failed to reject.'));
    } finally { setActing(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '0 0 16px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} placeholder="Search by name or email" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
        <button onClick={() => setModalOpen(true)} style={btnPrimary}><Plus size={16} /> New recruiter</button>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-subtle)', background: 'var(--surface-2)' }}>
                {['Name', 'Email', 'Company', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Building2 size={26} style={{ opacity: 0.5 }} />
                    <span>{status ? `No ${status} recruiters.` : 'No recruiters found.'}</span>
                  </div>
                </td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.user._id} style={{ borderTop: '1px solid var(--border)', transition: 'background .15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <Avatar first={r.user.firstName} last={r.user.lastName} />
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{`${r.user.firstName} ${r.user.lastName ?? ''}`.trim()}</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{r.user.email || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>{r.recruiter?.company || '—'}</td>
                    <td style={{ padding: '12px 14px' }}><span style={statusChip(r.user.status)}>{r.user.status}</span></td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {r.user.status !== 'active' && (
                        <button onClick={() => approve(r)} disabled={acting === r.recruiter?._id} style={{ ...btnGhost, color: 'var(--primary)', borderColor: 'var(--primary)', marginRight: 6 }}>
                          <Check size={14} /> Approve
                        </button>
                      )}
                      {r.user.status !== 'rejected' && (
                        <button onClick={() => reject(r)} disabled={acting === r.recruiter?._id} style={{ ...btnGhost, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          <X size={14} /> Reject
                        </button>
                      )}
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
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.totalPages} · {pagination.total} recruiters</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ ...btnGhost, opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} style={{ ...btnGhost, opacity: page >= pagination.totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}

      {modalOpen && <CreateRecruiterModal onClose={() => setModalOpen(false)} onSaved={load} />}
    </div>
  );
};

export default RecruitersPanel;
