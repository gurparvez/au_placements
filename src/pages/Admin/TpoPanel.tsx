import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Trash2, Search, RefreshCw, Lock, Building2, Save } from 'lucide-react';
import analyticsApi, {
  INVITATION_STAGES,
  type InvitationRow,
  type InvitationStage,
  type PlacementPolicy,
} from '@/api/analytics';

/* ------------------------------ styles ------------------------------ */

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--r-ctl)',
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
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)',
};
const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };

const STAGE_TONE: Record<InvitationStage, string> = {
  invited: 'var(--text-muted)',
  responded: '#06b6d4',
  declined: 'var(--danger)',
  scheduled: '#f59e0b',
  visited: '#a855f7',
  hired: '#22c55e',
};

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

/* --------------------------- policy settings --------------------------- */

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}> = ({ checked, onChange, label, hint }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left',
      padding: '12px 14px', borderRadius: 'var(--r-ctl)', cursor: 'pointer',
      border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
      background: checked ? 'var(--primary-soft)' : 'transparent',
    }}
  >
    <span style={{
      width: 38, height: 22, borderRadius: 999, flex: 'none', marginTop: 1,
      background: checked ? 'var(--primary)' : 'var(--surface-2)',
      border: '1px solid var(--border)', position: 'relative', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
        background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      }} />
    </span>
    <span style={{ minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{label}</span>
      {hint && <span style={{ display: 'block', ...muted, marginTop: 2 }}>{hint}</span>}
    </span>
  </button>
);

const PolicySection: React.FC = () => {
  const [policy, setPolicy] = useState<PlacementPolicy | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    analyticsApi.getPolicy().then(setPolicy).catch((err) => toast.error(extractError(err, 'Failed to load policy.')));
  }, []);

  const set = <K extends keyof PlacementPolicy>(k: K, v: PlacementPolicy[K]) =>
    setPolicy((p) => (p ? { ...p, [k]: v } : p));

  const save = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      setPolicy(await analyticsApi.updatePolicy(policy));
      toast.success('Placement policy updated. Eligibility is re-evaluated immediately.');
    } catch (err) {
      toast.error(extractError(err, 'Failed to save policy.'));
    } finally {
      setSaving(false);
    }
  };

  if (!policy) return <div style={{ ...card, padding: 30, textAlign: 'center', ...muted }}>Loading policy…</div>;

  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
        <span style={{
          width: 34, height: 34, flex: 'none', borderRadius: 9, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--primary-soft)', color: 'var(--primary)',
        }}>
          <Lock size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Placement policy</h3>
          <p style={{ ...muted, margin: '3px 0 0' }}>
            The offer lock is the main lever on the placement percentage — without it, strong
            students accumulate several offers while the tail of the batch goes unplaced.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <Toggle
          checked={policy.one_offer_lock}
          onChange={(v) => set('one_offer_lock', v)}
          label="One-offer lock"
          hint="Once a student accepts an offer they are removed from further drives."
        />
        <Toggle
          checked={policy.allow_upgrade_to_higher_tier}
          onChange={(v) => set('allow_upgrade_to_higher_tier', v)}
          label="Allow upgrades to a higher tier"
          hint="A student holding a regular offer may still sit for core and dream companies."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 16 }}>
        <div>
          <label style={labelStyle}>Dream tier threshold (LPA)</label>
          <input type="number" min={0} step="0.5" value={policy.dream_ctc_threshold}
            onChange={(e) => set('dream_ctc_threshold', Number(e.target.value))} style={inputStyle} />
          <p style={{ ...muted, marginTop: 4, fontSize: 11.5 }}>Openings at or above this count as dream.</p>
        </div>
        <div>
          <label style={labelStyle}>Max offers per student</label>
          <input type="number" min={0} value={policy.max_offers_per_student}
            onChange={(e) => set('max_offers_per_student', Number(e.target.value))} style={inputStyle} />
          <p style={{ ...muted, marginTop: 4, fontSize: 11.5 }}>0 means unlimited.</p>
        </div>
        <div>
          <label style={labelStyle}>Default minimum CGPA</label>
          <input type="number" min={0} max={10} step="0.1" value={policy.default_min_cgpa ?? 0}
            onChange={(e) => set('default_min_cgpa', Number(e.target.value))} style={inputStyle} />
          <p style={{ ...muted, marginTop: 4, fontSize: 11.5 }}>Applied when an opening sets none.</p>
        </div>
        <div>
          <label style={labelStyle}>Default max backlogs</label>
          <input type="number" min={0} value={policy.default_max_backlogs ?? 99}
            onChange={(e) => set('default_max_backlogs', Number(e.target.value))} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save policy'}
        </button>
      </div>
    </div>
  );
};

/* ---------------------------- invitations ---------------------------- */

const currentSession = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

const InvitationsSection: React.FC = () => {
  const [rows, setRows] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [session, setSession] = useState<number | ''>(currentSession());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company: '', sector: '', contact_name: '', contact_email: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await analyticsApi.listInvitations({
        session: session === '' ? undefined : Number(session),
        q: q.trim() || undefined,
      }));
    } catch (err) {
      toast.error(extractError(err, 'Failed to load companies.'));
    } finally {
      setLoading(false);
    }
  }, [session, q]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.company.trim()) return toast.error('Company name is required.');
    try {
      await analyticsApi.createInvitation({
        ...form,
        company: form.company.trim(),
        session: session === '' ? currentSession() : Number(session),
      });
      toast.success('Company added to outreach.');
      setForm({ company: '', sector: '', contact_name: '', contact_email: '' });
      setAdding(false);
      load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to add company.'));
    }
  };

  const setStage = async (row: InvitationRow, stage: InvitationStage) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, stage } : x)));
    try {
      await analyticsApi.updateInvitation(row._id, { stage });
    } catch (err) {
      setRows(prev);
      toast.error(extractError(err, 'Failed to update.'));
    }
  };

  const remove = async (row: InvitationRow) => {
    if (!window.confirm(`Remove ${row.company} from session ${row.session}?`)) return;
    try {
      await analyticsApi.deleteInvitation(row._id);
      toast.success('Removed.');
      load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to remove.'));
    }
  };

  const th: React.CSSProperties = {
    padding: '11px 13px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '.04em', whiteSpace: 'nowrap', textAlign: 'left', color: 'var(--text-subtle)',
  };
  const td: React.CSSProperties = { padding: '11px 13px', fontSize: 13, whiteSpace: 'nowrap' };

  const years = Array.from({ length: 6 }, (_, i) => currentSession() - 4 + i);

  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          width: 34, height: 34, flex: 'none', borderRadius: 9, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', background: 'var(--primary-soft)', color: 'var(--primary)',
        }}>
          <Building2 size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Company outreach</h3>
          <p style={{ ...muted, margin: '3px 0 0' }}>
            Track who you invited, who replied, and who actually visited. Repeat-recruiter churn
            is an early warning even while hiring numbers still look healthy.
          </p>
        </div>
        <button onClick={() => setAdding((a) => !a)} style={btnPrimary}><Plus size={16} /> Add company</button>
      </div>

      {adding && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12,
          padding: 14, marginBottom: 16, borderRadius: 'var(--r-ctl)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
        }}>
          <div>
            <label style={labelStyle}>Company</label>
            <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="e.g. Infosys" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sector</label>
            <input value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              placeholder="e.g. IT Services" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Contact name</label>
            <input value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Contact email</label>
            <input type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
            <button onClick={add} style={btnPrimary}>Add</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <select value={String(session)} onChange={(e) => setSession(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} aria-label="Session">
          <option value="">All sessions</option>
          {years.map((y) => <option key={y} value={y}>{y}-{String((y + 1) % 100).padStart(2, '0')}</option>)}
        </select>
        <button onClick={load} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div style={{ overflowX: 'auto', margin: '0 -18px -18px', borderTop: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Company', 'Sector', 'Session', 'Type', 'Stage', 'Hires', ''].map((h, i) => <th key={i} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 26, textAlign: 'center', ...muted }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 34, textAlign: 'center', ...muted }}>No companies tracked yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{r.company}</td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{r.sector || '—'}</td>
                  <td style={td}>{r.session}-{String((r.session + 1) % 100).padStart(2, '0')}</td>
                  <td style={td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      color: r.is_repeat ? '#22c55e' : 'var(--text-muted)',
                    }}>{r.is_repeat ? 'Repeat' : 'New'}</span>
                  </td>
                  <td style={td}>
                    <select
                      value={r.stage}
                      onChange={(e) => setStage(r, e.target.value as InvitationStage)}
                      aria-label="Outreach stage"
                      style={{
                        padding: '4px 8px', borderRadius: 'var(--r-ctl)', fontSize: 12, fontWeight: 600,
                        textTransform: 'capitalize', cursor: 'pointer',
                        border: `1px solid color-mix(in srgb, ${STAGE_TONE[r.stage]} 34%, transparent)`,
                        background: `color-mix(in srgb, ${STAGE_TONE[r.stage]} 12%, transparent)`,
                        color: STAGE_TONE[r.stage],
                      }}
                    >
                      {INVITATION_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={td}>{r.hires ?? 0}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button onClick={() => remove(r)} aria-label="Remove company"
                      style={{ ...btnGhost, padding: 7, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ------------------------------ panel ------------------------------ */

const TpoPanel: React.FC = () => (
  <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <PolicySection />
    <InvitationsSection />
  </div>
);

export default TpoPanel;
