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
import { Reveal } from '@/components/motion';
import { SelectField } from '@/components/ui/select-field';

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
  background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
  transition: 'background .18s ease',
};
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-ctl)',
  background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' };
const SIZES: CompanySize[] = ['1-10', '11-50', '51-200', '201-500', '500+'];

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d: any = err.response?.data;
    if (Array.isArray(d?.errors) && d.errors.length) return d.errors.map((e: any) => e.message).join(', ');
    if (d?.message) return d.message;
  }
  return fallback;
}

/** Status ink per lifecycle state — used for the card wash and the dot chip. */
const STATUS_INK: Record<string, string> = {
  active: 'var(--primary)',
  pending: '#f59e0b',
  rejected: 'var(--danger)',
  suspended: 'var(--text-subtle)',
};

/* --------------------------- create recruiter modal --------------------------- */

function CreateRecruiterModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AdminCreateRecruiterPayload>({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    company: '', designation: '', company_website: '', industry: '', company_size: undefined, location: '', linkedin_url: '', about: '',
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminCreateRecruiterPayload>(k: K, v: AdminCreateRecruiterPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
      <div role="dialog" aria-modal="true" aria-label="Create recruiter" style={{ ...card, position: 'relative', width: 'min(600px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <div className="brass-rule" style={{ marginBottom: 12 }} />
        <h2 className="font-display" style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: '-.01em' }}>Create recruiter</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>Created active. Logs in with email + password.</p>

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
            <SelectField aria-label="Company size" value={form.company_size ?? ''} onChange={(v) => set('company_size', (v || undefined) as any)}
              options={[{ value: '', label: 'Select' }, ...SIZES.map((s) => ({ value: s, label: s }))]} />
          </div>
          <div><label style={labelStyle}>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} style={inputStyle} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Create recruiter'}</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- panel ------------------------------- */

const RecruitersPanel: React.FC<{ mode?: 'active' | 'approvals'; onChanged?: () => void }> = ({ mode = 'active', onChanged }) => {
  // Each tab is locked to a status: the roster shows active recruiters,
  // Approvals shows pending requests awaiting review.
  const status = mode === 'approvals' ? 'pending' : 'active';
  const isApprovals = mode === 'approvals';

  const [rows, setRows] = useState<RecruiterRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listRecruiters({ page, limit: 20, status, q: q.trim() || undefined });
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
      {/* Section header — mode-aware serif title + count; primary action sits top-right */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-.01em' }}>
            {isApprovals ? 'Approval requests' : 'Recruiter roster'}
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            {pagination != null && <><span className="data">{pagination.total.toLocaleString()}</span> · </>}
            {isApprovals ? 'Requests awaiting review' : 'Approved recruiters with portal access'}
          </p>
        </div>
        {!isApprovals && <button onClick={() => setModalOpen(true)} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}><Plus size={16} /> New recruiter</button>}
      </div>

      {/* Toolbar — search + refresh */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '0 0 16px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} placeholder="Search by name or email" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <button onClick={load} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      <Reveal>
        {loading ? (
          <div style={{ ...card, padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px',
            color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 14,
          }}>
            <Building2 size={26} style={{ opacity: 0.5 }} />
            <span>{isApprovals ? 'No pending requests.' : 'No active recruiters yet.'}</span>
          </div>
        ) : (
          <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
            {rows.map((r) => {
              const tone = STATUS_INK[r.user.status ?? ''] ?? 'var(--text-subtle)';
              const busy = acting === r.recruiter?._id;
              return (
                <div
                  key={r.user._id}
                  style={{
                    minWidth: 0, overflow: 'hidden',
                    background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14,
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
                  {/* identity band — tinted by status */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11, padding: '14px 16px',
                    background: `color-mix(in srgb, ${tone} 15%, transparent)`,
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <Avatar first={r.user.firstName} last={r.user.lastName} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 650, textTransform: 'capitalize', lineHeight: 1.35 }}>
                        {`${r.user.firstName} ${r.user.lastName ?? ''}`.trim()}
                      </span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.45 }}>
                        {r.recruiter?.company || 'No company recorded'}
                      </span>
                    </div>
                    {/* quiet dot status — no filled chip */}
                    <span style={{
                      flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 2,
                      fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize', color: tone,
                    }}>
                      <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: tone }} />
                      {r.user.status}
                    </span>
                  </div>

                  {/* email + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px 12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflowWrap: 'anywhere', minWidth: 0, flex: 1 }}>
                      {r.user.email || 'No email recorded'}
                    </span>
                    {isApprovals && (
                      <span style={{ flex: 'none', display: 'inline-flex', gap: 7 }}>
                        <button onClick={() => approve(r)} disabled={busy}
                          {...hoverBg('var(--primary-hover)', 'var(--primary)')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 13px',
                            borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'var(--on-primary)',
                            fontWeight: 600, fontSize: 12.5, cursor: 'pointer', opacity: busy ? 0.6 : 1,
                            transition: 'background .16s ease',
                          }}>
                          <Check size={13} /> Approve
                        </button>
                        <button onClick={() => reject(r)} disabled={busy}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                            borderRadius: 8, border: '1px solid var(--border)', background: 'none',
                            color: 'var(--text-muted)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
                            opacity: busy ? 0.6 : 1, transition: 'color .15s ease, border-color .15s ease, background .15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-soft)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'none'; }}>
                          <X size={13} /> Reject
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Reveal>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span className="data" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} recruiters</span>
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
