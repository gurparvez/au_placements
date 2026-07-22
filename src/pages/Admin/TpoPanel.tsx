import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Trash2, Search, RefreshCw, Lock, Building2, Save } from 'lucide-react';
import { Reveal } from '@/components/motion';
import analyticsApi, {
  INVITATION_STAGES,
  type InvitationRow,
  type InvitationStage,
  type PlacementPolicy,
} from '@/api/analytics';
import { SelectField } from '@/components/ui/select-field';

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
  borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
  transition: 'background .18s ease',
};
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});
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
      display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', textAlign: 'left',
      padding: '8px 11px', borderRadius: 'var(--r-ctl)', cursor: 'pointer',
      border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
      background: checked ? 'var(--primary-soft)' : 'transparent',
      transition: 'border-color .15s ease, background .15s ease',
    }}
  >
    <span style={{
      width: 32, height: 18, borderRadius: 999, flex: 'none', marginTop: 1,
      background: checked ? 'var(--primary)' : 'var(--surface-2)',
      border: '1px solid var(--border)', position: 'relative', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: 1.5, left: checked ? 15 : 2, width: 13, height: 13, borderRadius: '50%',
        background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      }} />
    </span>
    <span style={{ minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{label}</span>
      {hint && <span style={{ display: 'block', ...muted, fontSize: 11.5, marginTop: 1, lineHeight: 1.4 }}>{hint}</span>}
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
    <div style={{ ...card, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
        <span style={{
          width: 28, height: 28, flex: 'none', borderRadius: 8, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--brass-soft)', color: 'var(--brass)',
        }}>
          <Lock size={14} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-display" style={{ margin: 0, fontSize: 14.5, fontWeight: 500, letterSpacing: '-.01em' }}>Placement policy</h3>
          <p style={{ ...muted, margin: '1px 0 0', fontSize: 11.5, lineHeight: 1.4 }}>
            Offer rules applied to every drive.
          </p>
        </div>
        <button onClick={save} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')}
          style={{ ...btnPrimary, opacity: saving ? 0.7 : 1, padding: '7px 14px', fontSize: 13, flex: 'none', alignSelf: 'flex-start', minWidth: 138, justifyContent: 'center' }}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save policy'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 9 }}>
        <Toggle
          checked={policy.one_offer_lock}
          onChange={(v) => set('one_offer_lock', v)}
          label="One-offer lock"
          hint="Accepted students exit further drives."
        />
        <Toggle
          checked={policy.allow_upgrade_to_higher_tier}
          onChange={(v) => set('allow_upgrade_to_higher_tier', v)}
          label="Allow upgrades to a higher tier"
          hint="Regular-offer holders may still try core and dream."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10, marginTop: 11 }}>
        <div>
          <label style={{ ...labelStyle, fontSize: 12, marginBottom: 4 }}>Dream tier threshold (LPA)</label>
          <input type="number" min={0} step="0.5" value={policy.dream_ctc_threshold}
            onChange={(e) => set('dream_ctc_threshold', Number(e.target.value))} style={{ ...inputStyle, padding: '7px 10px' }}
            title="This and above counts as dream." />
          <p style={{ ...muted, marginTop: 3, fontSize: 11 }}>This and above counts as dream.</p>
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: 12, marginBottom: 4 }}>Max offers per student</label>
          <input type="number" min={0} value={policy.max_offers_per_student}
            onChange={(e) => set('max_offers_per_student', Number(e.target.value))} style={{ ...inputStyle, padding: '7px 10px' }}
            title="0 means unlimited." />
          <p style={{ ...muted, marginTop: 3, fontSize: 11 }}>0 means unlimited.</p>
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: 12, marginBottom: 4 }}>Default minimum CGPA</label>
          <input type="number" min={0} max={10} step="0.1" value={policy.default_min_cgpa ?? 0}
            onChange={(e) => set('default_min_cgpa', Number(e.target.value))} style={{ ...inputStyle, padding: '7px 10px' }}
            title="Applied when an opening sets none." />
          <p style={{ ...muted, marginTop: 3, fontSize: 11 }}>Applied when an opening sets none.</p>
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: 12, marginBottom: 4 }}>Default max backlogs</label>
          <input type="number" min={0} value={policy.default_max_backlogs ?? 99}
            onChange={(e) => set('default_max_backlogs', Number(e.target.value))} style={{ ...inputStyle, padding: '7px 10px' }} />
        </div>
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

  const years = Array.from({ length: 6 }, (_, i) => currentSession() - 4 + i);

  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          width: 34, height: 34, flex: 'none', borderRadius: 9, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', background: 'var(--brass-soft)', color: 'var(--brass)',
        }}>
          <Building2 size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h3 className="font-display" style={{ margin: 0, fontSize: 15, fontWeight: 500, letterSpacing: '-.01em' }}>Company outreach</h3>
          <p style={{ ...muted, margin: '3px 0 0' }}>
            Invitations, replies, and visits per session.
          </p>
        </div>
        <button onClick={() => setAdding((a) => !a)} {...hoverBg('var(--primary-hover)', 'var(--primary)')}
          style={{ ...btnPrimary, padding: '7px 14px', fontSize: 13, flex: 'none', alignSelf: 'flex-start', minWidth: 138, justifyContent: 'center' }}>
          <Plus size={14} /> Add company
        </button>
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
            <button onClick={add} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}>Add</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <SelectField aria-label="Session" value={String(session)} onChange={(v) => setSession(v === '' ? '' : Number(v))}
          options={[{ value: '', label: 'All sessions' }, ...years.map((y) => ({ value: String(y), label: `${y}-${String((y + 1) % 100).padStart(2, '0')}` }))]}
          style={{ width: 160 }} />
        <button onClick={load} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', ...muted }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{
          padding: 36, textAlign: 'center', ...muted,
          border: '1px dashed var(--border)', borderRadius: 'var(--r-ctl)',
        }}>
          No companies tracked yet.
        </div>
      ) : (
        /* Locked to 3 per row; stacks on small screens */
        <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {rows.map((r) => (
            <div
              key={r._id}
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
              {/* header — washed in the stage tone, with a small stage indicator top-right */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 11, padding: '14px 17px',
                background: `color-mix(in srgb, ${STAGE_TONE[r.stage]} 17%, transparent)`,
                borderBottom: '1px solid var(--border)', transition: 'background .25s ease',
              }}>
                <span className="font-display" aria-hidden style={{
                  width: 38, height: 38, flex: 'none', borderRadius: 10, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 550,
                  background: 'var(--bg-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                }}>
                  {r.company.charAt(0).toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14.5, fontWeight: 650, lineHeight: 1.35 }}>
                    {r.company}
                  </span>
                  <span className="data" style={{ display: 'block', ...muted, fontSize: 12, marginTop: 2, lineHeight: 1.45 }}>
                    {r.sector || 'Sector not set'} · {r.session}-{String((r.session + 1) % 100).padStart(2, '0')}
                  </span>
                </div>
                <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span title={`Stage: ${r.stage}`} style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_TONE[r.stage], boxShadow: `0 0 0 3px color-mix(in srgb, ${STAGE_TONE[r.stage]} 22%, transparent)` }} />
                  <span style={{
                    padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    color: r.is_repeat ? '#22c55e' : 'var(--text-muted)',
                  }}>
                    {r.is_repeat ? 'Repeat' : 'New'}
                  </span>
                </span>
              </div>

              {/* stage + hires */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 17px 0' }}>
                <div style={{ flex: 1, minWidth: 0, maxWidth: 158 }}>
                  <SelectField
                    aria-label={`Outreach stage for ${r.company}`}
                    value={r.stage}
                    onChange={(v) => setStage(r, v as InvitationStage)}
                    options={INVITATION_STAGES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    style={{ padding: '5px 10px', fontSize: 12.5, borderRadius: 8 }}
                  />
                </div>
                <span className="data" style={{ marginLeft: 'auto', flex: 'none', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text)', fontSize: 15 }}>{r.hires ?? 0}</strong> hire{(r.hires ?? 0) === 1 ? '' : 's'}
                </span>
              </div>

              {/* contact + remove */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 17px 14px' }}>
                <span style={{ ...muted, fontSize: 12, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                  {[r.contact_name, r.contact_email].filter(Boolean).join(' · ') || 'No contact recorded'}
                </span>
                <button
                  onClick={() => remove(r)}
                  aria-label={`Remove ${r.company}`}
                  title="Remove from outreach"
                  style={{
                    marginLeft: 'auto', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: 7, border: 'none', background: 'none',
                    color: 'var(--text-subtle)', cursor: 'pointer', transition: 'color .15s ease, background .15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-soft)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'none'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ panel ------------------------------ */

const TpoPanel: React.FC = () => (
  <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Reveal><PolicySection /></Reveal>
    <Reveal delay={0.06}><InvitationsSection /></Reveal>
  </div>
);

export default TpoPanel;
