import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, RefreshCw, Award, Download, X } from 'lucide-react';
import analyticsApi, {
  type PlacementPayload,
  type PlacementRow,
  type PlacementStatus,
  type PlacementType,
} from '@/api/analytics';
import studentApi, { type UserSearchResult } from '@/api/students';
import { Reveal } from '@/components/motion';
import { SelectField, DateField } from '@/components/ui/select-field';

/* ------------------------------ styles ------------------------------ */

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
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

const TYPES: PlacementType[] = ['job', 'internship', 'ppo'];
const STATUSES: PlacementStatus[] = ['offered', 'accepted', 'joined', 'completed', 'declined'];

/** Colour cue per lifecycle stage — declined must read as "does not count". */
const STATUS_TONE: Record<PlacementStatus, string> = {
  offered: '#f59e0b',
  accepted: '#22c55e',
  joined: '#22c55e',
  completed: '#06b6d4',
  declined: 'var(--danger)',
};

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

const fullName = (u: { firstName: string; lastName?: string } | null) =>
  u ? `${u.firstName} ${u.lastName ?? ''}`.trim() : '—';

/* --------------------------- student picker --------------------------- */

const StudentPicker: React.FC<{
  value: UserSearchResult | null;
  onChange: (u: UserSearchResult | null) => void;
}> = ({ value, onChange }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (value) return;
    const term = q.trim();
    if (term.length < 2) { setResults([]); return; }

    const id = ++reqId.current;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await studentApi.searchStudents(term);
        if (id === reqId.current) { setResults(res); setOpen(true); }
      } catch {
        if (id === reqId.current) setResults([]);
      } finally {
        if (id === reqId.current) setSearching(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [q, value]);

  if (value) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        borderRadius: 'var(--r-ctl)', border: '1px solid var(--primary)', background: 'var(--primary-soft)',
      }}>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, textTransform: 'capitalize', minWidth: 0 }}>
          {fullName(value)}
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none' }}>
            {value.auid ? ` · AUID ${value.auid}` : ''}
          </span>
        </span>
        <button type="button" onClick={() => { onChange(null); setQ(''); }} style={{ ...btnGhost, padding: 6 }} aria-label="Clear student">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Search student by name or AUID"
        style={{ ...inputStyle, paddingLeft: 34 }}
      />
      {open && (results.length > 0 || searching) && (
        <div style={{
          ...card, position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          maxHeight: 220, overflowY: 'auto', boxShadow: 'var(--shadow)', padding: 4,
        }}>
          {searching && !results.length ? (
            <div style={{ padding: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>Searching…</div>
          ) : (
            results.map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => { onChange(r); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px',
                  border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8,
                  fontSize: 13, color: 'var(--text)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{fullName(r)}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.auid ? ` · ${r.auid}` : ''}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ modal ------------------------------ */

type FormState = {
  company: string; role: string; type: PlacementType; status: PlacementStatus;
  source: 'campus' | 'off_campus'; location: string; ctc_lpa: string; stipend: string;
  offer_date: string; start_date: string;
};

const emptyForm: FormState = {
  company: '', role: '', type: 'job', status: 'accepted', source: 'campus',
  location: '', ctc_lpa: '', stipend: '', offer_date: '', start_date: '',
};

const asDate = (v?: string) => (v ? v.slice(0, 10) : '');

function PlacementModal({
  editing, onClose, onSaved,
}: {
  editing: PlacementRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [student, setStudent] = useState<UserSearchResult | null>(
    editing?.student
      ? {
          _id: editing.student._id,
          firstName: editing.student.firstName,
          lastName: editing.student.lastName,
          auid: editing.student.auid,
        }
      : null
  );
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          company: editing.company, role: editing.role, type: editing.type, status: editing.status,
          source: editing.source ?? 'campus', location: editing.location ?? '',
          ctc_lpa: editing.ctc_lpa != null ? String(editing.ctc_lpa) : '',
          stipend: editing.stipend != null ? String(editing.stipend) : '',
          offer_date: asDate(editing.offer_date), start_date: asDate(editing.start_date),
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

  const isInternship = form.type === 'internship';

  const submit = async () => {
    if (!isEdit && !student) return toast.error('Select a student.');
    if (!form.company.trim()) return toast.error('Company is required.');
    if (!form.role.trim()) return toast.error('Role is required.');

    setSaving(true);
    try {
      const payload: Partial<PlacementPayload> = {
        company: form.company.trim(),
        role: form.role.trim(),
        type: form.type,
        status: form.status,
        source: form.source,
        location: form.location.trim() || undefined,
        // Package fields are mutually exclusive by type — never send both.
        ctc_lpa: !isInternship && form.ctc_lpa ? Number(form.ctc_lpa) : undefined,
        stipend: isInternship && form.stipend ? Number(form.stipend) : undefined,
        offer_date: form.offer_date || undefined,
        start_date: form.start_date || undefined,
      };

      if (isEdit && editing) {
        await analyticsApi.updatePlacement(editing._id, payload);
        toast.success('Placement updated.');
      } else {
        await analyticsApi.createPlacement({ ...payload, student: student!._id } as PlacementPayload);
        toast.success('Placement recorded.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractError(err, 'Failed to save placement.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
      <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit placement' : 'Record placement'} style={{ ...card, position: 'relative', width: 'min(580px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: 'var(--shadow)' }}>
        <div className="brass-rule" style={{ marginBottom: 12 }} />
        <h2 className="font-display" style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: '-.01em' }}>{isEdit ? 'Edit placement' : 'Record placement'}</h2>
        <p style={{ margin: '6px 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
          Only <strong>accepted</strong>, <strong>joined</strong>, and <strong>completed</strong> count towards statistics.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Student</label>
            {isEdit ? (
              <input value={fullName(student)} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
            ) : (
              <StudentPicker value={student} onChange={setStudent} />
            )}
          </div>

          <div>
            <label style={labelStyle}>Company</label>
            <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="e.g. Infosys" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Software Engineer" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Type</label>
            <SelectField aria-label="Type" value={form.type} onChange={(v) => set('type', v as PlacementType)}
              options={TYPES.map((t) => ({ value: t, label: t === 'ppo' ? 'PPO' : t.charAt(0).toUpperCase() + t.slice(1) }))} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <SelectField aria-label="Status" value={form.status} onChange={(v) => set('status', v as PlacementStatus)}
              options={STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
          </div>

          <div>
            <label style={labelStyle}>{isInternship ? 'Stipend (₹ / month)' : 'Package (LPA)'}</label>
            {isInternship ? (
              <input type="number" min={0} value={form.stipend} onChange={(e) => set('stipend', e.target.value)} placeholder="e.g. 40000" style={inputStyle} />
            ) : (
              <input type="number" min={0} step="0.1" value={form.ctc_lpa} onChange={(e) => set('ctc_lpa', e.target.value)} placeholder="e.g. 12.5" style={inputStyle} />
            )}
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Bengaluru" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Offer date</label>
            <DateField value={form.offer_date} onChange={(v) => set('offer_date', v)} aria-label="Offer date" />
          </div>
          <div>
            <label style={labelStyle}>Start / joining date</label>
            <DateField value={form.start_date} onChange={(v) => set('start_date', v)} aria-label="Start / joining date" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Source</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['campus', 'off_campus'] as const).map((s) => (
                <button key={s} type="button" onClick={() => set('source', s)}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 'var(--r-ctl)', cursor: 'pointer',
                    border: `1px solid ${form.source === s ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.source === s ? 'var(--primary-soft)' : 'transparent',
                    color: form.source === s ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: 13,
                  }}>
                  {s === 'campus' ? 'On campus' : 'Off campus'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Record placement'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ panel ------------------------------ */

const th: React.CSSProperties = {
  padding: '12px 14px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase',
  letterSpacing: '.04em', whiteSpace: 'nowrap', textAlign: 'left',
};
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13.5, whiteSpace: 'nowrap' };

const PlacementsPanel: React.FC = () => {
  const [rows, setRows] = useState<PlacementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlacementRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.listPlacements({
        page, limit: 20,
        q: q.trim() || undefined,
        type: type || undefined,
        status: status || undefined,
      });
      setRows(res.data);
      setTotal(res.pagination.total);
      setPages(res.pagination.pages);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load placements.'));
    } finally {
      setLoading(false);
    }
  }, [page, q, type, status]);

  useEffect(() => { load(); }, [load]);

  const remove = async (r: PlacementRow) => {
    if (!window.confirm(`Delete the ${r.type} record at ${r.company} for ${fullName(r.student)}?`)) return;
    try {
      await analyticsApi.deletePlacement(r._id);
      toast.success('Placement deleted.');
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete placement.'));
    }
  };

  const exportCsv = () => {
    if (!rows.length) return toast.error('Nothing to export.');
    const data = rows.map((r) => ({
      student: fullName(r.student),
      auid: r.student?.auid ?? '',
      university: r.student?.university ?? '',
      company: r.company,
      role: r.role,
      type: r.type,
      status: r.status,
      ctc_lpa: r.ctc_lpa ?? '',
      stipend: r.stipend ?? '',
      location: r.location ?? '',
      offer_date: r.offer_date ? r.offer_date.slice(0, 10) : '',
    }));
    const headers = Object.keys(data[0]);
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(','), ...data.map((d) => headers.map((h) => escape((d as any)[h])).join(','))].join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `placements-page-${page}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const body = useMemo(() => rows, [rows]);

  return (
    <div style={{ marginTop: 18 }}>
      {/* Section header — serif title + record count; primary action sits top-right */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-.01em' }}>Placement records</h2>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            <span className="data">{total.toLocaleString()}</span> record{total === 1 ? '' : 's'} on file
          </p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}><Plus size={16} /> Record placement</button>
      </div>

      {/* Toolbar — search, filters, and export */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by company"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <SelectField aria-label="Filter by type" value={type} onChange={(v) => { setType(v); setPage(1); }}
          options={[{ value: '', label: 'All types' }, ...TYPES.map((t) => ({ value: t, label: t === 'ppo' ? 'PPO' : t.charAt(0).toUpperCase() + t.slice(1) }))]}
          style={{ width: 150 }} />
        <SelectField aria-label="Filter by status" value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          style={{ width: 160 }} />
        <button onClick={load} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
        <button onClick={exportCsv} style={btnGhost}><Download size={15} /> CSV</button>
      </div>

      <Reveal>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ color: 'var(--text-subtle)', background: 'var(--surface-2)' }}>
                {['Student', 'Company', 'Role', 'Type', 'Package', 'Status', ''].map((h, i) => <th key={i} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : body.length === 0 ? (
                <tr><td colSpan={7}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Award size={26} style={{ opacity: 0.5 }} />
                    <span>{q || type || status ? 'No placements match these filters.' : 'No placements recorded yet.'}</span>
                  </div>
                </td></tr>
              ) : (
                body.map((r) => {
                  const pkg = r.ctc_lpa ? `${r.ctc_lpa} LPA` : r.stipend ? `₹${r.stipend.toLocaleString('en-IN')}/mo` : '—';
                  const quietBtn: React.CSSProperties = {
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 8, border: 'none', background: 'none',
                    color: 'var(--text-subtle)', cursor: 'pointer', padding: 0,
                    transition: 'color .14s ease, background .14s ease',
                  };
                  return (
                    <tr
                      key={r._id}
                      title={`${fullName(r.student)} — ${r.company}, ${r.role} · ${pkg} · ${r.status}`}
                      style={{ borderTop: '1px solid var(--border)', transition: 'background .15s ease', cursor: 'default' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...td, fontWeight: 600, textTransform: 'capitalize' }}>
                        {fullName(r.student)}
                        {r.student?.auid && (
                          <span className="data" style={{ display: 'block', fontSize: 11.5, fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none' }}>
                            AUID {r.student.auid}
                          </span>
                        )}
                      </td>
                      <td style={td}>{r.company}</td>
                      <td style={{ ...td, color: 'var(--text-muted)' }}>{r.role}</td>
                      <td style={td}>
                        <span className="data" style={{ fontSize: 10.5, fontWeight: 650, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                          {r.type}
                        </span>
                      </td>
                      <td className="data" style={td}>{pkg}</td>
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize', color: STATUS_TONE[r.status] }}>
                          <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_TONE[r.status] }} />
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => { setEditing(r); setModalOpen(true); }}
                          aria-label="Edit placement" title="Edit"
                          style={{ ...quietBtn, marginRight: 2 }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'none'; }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => remove(r)}
                          aria-label="Delete placement" title="Delete"
                          style={quietBtn}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-soft)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'none'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </Reveal>

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span className="data" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {pages} · {total.toLocaleString()} records</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ ...btnGhost, opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} style={{ ...btnGhost, opacity: page >= pages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}

      {modalOpen && <PlacementModal editing={editing} onClose={() => setModalOpen(false)} onSaved={load} />}
    </div>
  );
};

export default PlacementsPanel;
