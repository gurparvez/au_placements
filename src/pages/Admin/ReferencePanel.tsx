import { confirmDialog } from '@/components/confirm';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, RefreshCw, Layers, GraduationCap, Tags, Check, X, EyeOff, Eye } from 'lucide-react';
import { Reveal } from '@/components/motion';
import departmentsApi, { type Department } from '@/api/departments';
import coursesApi, { type Course } from '@/api/courses';
import skillsApi, { type Skill } from '@/api/skills';

/* ------------------------------ styles ------------------------------ */

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', borderRadius: 'var(--r-ctl)',
  border: '1px solid var(--border-strong)', background: 'var(--bg-2)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px',
  borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none',
  transition: 'background .18s ease',
};
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px',
  borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)',
  fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };

/** Tiny round icon button used inside chips. */
const chipBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 22, height: 22, borderRadius: 999, border: 'none', background: 'none',
  color: 'var(--text-subtle)', cursor: 'pointer', padding: 0,
  transition: 'color .13s ease, background .13s ease',
};
const chipBtnHover = (color: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = color; e.currentTarget.style.background = 'var(--surface-3)'; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'none'; },
});

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length) return data.errors.map((e: any) => e.message || e.field).join(', ');
    if (data?.message) return data.message;
  }
  return fallback;
}

/* --------------------------- generic chip catalogue --------------------------- */

interface RefItem {
  _id: string;
  label: string;
  sub?: string;
  inactive?: boolean;
}

/**
 * One managed reference catalogue rendered as a wrapping chip cloud — every
 * entry visible at once, no internal scrolling. Edit/deactivate/delete actions
 * live inside each chip and reveal on hover (or keyboard focus).
 */
function ManagedList({
  title, icon: Icon, items, loading, addFields, onReload,
  onCreate, onRename, onDelete, onToggleActive,
}: {
  title: string;
  icon: React.ElementType;
  items: RefItem[];
  loading: boolean;
  addFields: { name: string; extra?: string };
  onReload: () => void;
  onCreate: (name: string, extra?: string) => Promise<void>;
  onRename: (id: string, name: string, extra?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleActive?: (item: RefItem) => Promise<void>;
}) {
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExtra, setNewExtra] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((i) => i.label.toLowerCase().includes(t) || i.sub?.toLowerCase().includes(t)) : items;
  }, [items, q]);

  const submitNew = async () => {
    if (!newName.trim()) return toast.error('Name is required.');
    setBusy(true);
    try {
      await onCreate(newName.trim(), newExtra.trim() || undefined);
      setNewName(''); setNewExtra(''); setAdding(false);
    } catch (err) {
      toast.error(extractError(err, 'Failed to add.'));
    } finally { setBusy(false); }
  };

  const submitEdit = async (id: string) => {
    if (!editName.trim()) return toast.error('Name is required.');
    setBusy(true);
    try {
      await onRename(id, editName.trim());
      setEditId(null);
    } catch (err) {
      toast.error(extractError(err, 'Failed to rename.'));
    } finally { setBusy(false); }
  };

  const remove = async (item: RefItem) => {
    if (!(await confirmDialog({ title: `Delete "${item.label}"?`, message: 'This cannot be undone.', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await onDelete(item._id);
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete.'));
    }
  };

  return (
    <div style={{ ...card, padding: '15px 17px' }}>
      {/* single compact header row: identity · search · refresh · add */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          width: 28, height: 28, flex: 'none', borderRadius: 8, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', background: 'var(--brass-soft)', color: 'var(--brass)',
        }}>
          <Icon size={14} />
        </span>
        <h3 className="font-display" style={{ margin: 0, fontSize: 14.5, fontWeight: 500, letterSpacing: '-.01em', flex: 'none' }}>
          {title} <span className="data" style={{ ...muted, fontWeight: 500 }}>· {items.length}</span>
        </h3>
        <div style={{ position: 'relative', marginLeft: 'auto', width: 200, minWidth: 140 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…"
            style={{ ...inputStyle, padding: '6px 10px 6px 29px', fontSize: 12.5 }} />
        </div>
        <button onClick={onReload} aria-label={`Refresh ${title.toLowerCase()}`} title="Refresh"
          style={{ ...btnGhost, width: 30, height: 30, padding: 0, justifyContent: 'center', flex: 'none' }}>
          <RefreshCw size={13} />
        </button>
        <button onClick={() => setAdding((a) => !a)} {...hoverBg('var(--primary-hover)', 'var(--primary)')}
          style={{ ...btnPrimary, flex: 'none' }}>
          <Plus size={13} /> Add
        </button>
      </div>

      {adding && (
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', padding: 10, marginBottom: 12,
          borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)',
        }}>
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNew()}
            placeholder={addFields.name} style={{ ...inputStyle, flex: 2, minWidth: 160 }} />
          {addFields.extra && (
            <input value={newExtra} onChange={(e) => setNewExtra(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              placeholder={addFields.extra} style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
          )}
          <button onClick={submitNew} disabled={busy} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}>{busy ? 'Adding…' : 'Add'}</button>
          <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
        </div>
      )}

      {loading ? (
        <p style={{ ...muted, margin: 0, padding: '14px 0' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ ...muted, margin: 0, padding: '14px 0' }}>{q ? 'No matches.' : 'Nothing yet — add the first entry.'}</p>
      ) : (
        /* chip cloud — every pill hugs its own text on a single line */
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {filtered.map((item) => (
            <div key={item._id} className="kp-chip" style={{ opacity: item.inactive ? 0.55 : 1 }}>
              {editId === item._id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(item._id); if (e.key === 'Escape') setEditId(null); }}
                    style={{ ...inputStyle, width: 170, padding: '3px 9px', fontSize: 12.5, borderRadius: 999 }} />
                  <button onClick={() => submitEdit(item._id)} disabled={busy} style={{ ...chipBtn, color: '#22c55e' }} aria-label="Save"><Check size={13} /></button>
                  <button onClick={() => setEditId(null)} style={chipBtn} aria-label="Cancel"><X size={13} /></button>
                </span>
              ) : (
                <>
                  <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 0, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="data" style={{ flex: 'none', fontSize: 10.5, fontWeight: 650, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                      {item.sub}
                    </span>
                  )}
                  {item.inactive && <span style={{ fontSize: 10.5, fontStyle: 'italic', color: 'var(--text-subtle)' }}>inactive</span>}
                  <span className="kp-chip-actions">
                    {onToggleActive && (
                      <button onClick={() => onToggleActive(item)} style={chipBtn} {...chipBtnHover('var(--text)')}
                        title={item.inactive ? 'Reactivate' : 'Deactivate'}
                        aria-label={`${item.inactive ? 'Reactivate' : 'Deactivate'} ${item.label}`}>
                        {item.inactive ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    )}
                    <button onClick={() => { setEditId(item._id); setEditName(item.label); }} style={chipBtn} {...chipBtnHover('var(--text)')}
                      aria-label={`Rename ${item.label}`} title="Rename">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => remove(item)} style={chipBtn} {...chipBtnHover('var(--danger)')}
                      aria-label={`Delete ${item.label}`} title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ panel ------------------------------ */

const ReferencePanel: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState({ dept: true, course: true, skill: true });

  const loadDepts = useCallback(async () => {
    setLoading((l) => ({ ...l, dept: true }));
    try { setDepartments(await departmentsApi.list(true)); }
    catch (err) { toast.error(extractError(err, 'Failed to load departments.')); }
    finally { setLoading((l) => ({ ...l, dept: false })); }
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading((l) => ({ ...l, course: true }));
    try { setCourses(await coursesApi.listCourses(100)); }
    catch (err) { toast.error(extractError(err, 'Failed to load courses.')); }
    finally { setLoading((l) => ({ ...l, course: false })); }
  }, []);

  const loadSkills = useCallback(async () => {
    setLoading((l) => ({ ...l, skill: true }));
    try { setSkills((await skillsApi.getAllSkills()).skills as Skill[]); }
    catch (err) { toast.error(extractError(err, 'Failed to load skills.')); }
    finally { setLoading((l) => ({ ...l, skill: false })); }
  }, []);

  useEffect(() => { loadDepts(); loadCourses(); loadSkills(); }, [loadDepts, loadCourses, loadSkills]);

  return (
    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Reveal>
        <div style={{
          ...card, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
          background: 'color-mix(in srgb, var(--primary) 5%, var(--surface))',
        }}>
          <Layers size={15} style={{ color: 'var(--primary)', flex: 'none' }} />
          <span style={{ fontSize: 12.5 }}>
            Official lists everyone picks from — renames update existing records.
          </span>
        </div>
      </Reveal>

      <Reveal>
        <ManagedList
          title="Departments"
          icon={Layers}
          loading={loading.dept}
          items={departments.map((d) => ({ _id: d._id, label: d.name, sub: d.code, inactive: !d.active }))}
          addFields={{ name: 'Department name', extra: 'Code (e.g. CSE)' }}
          onReload={loadDepts}
          onCreate={async (name, code) => { await departmentsApi.create(name, code); toast.success('Department added.'); loadDepts(); }}
          onRename={async (id, name) => { await departmentsApi.update(id, { name }); toast.success('Department renamed. Students updated.'); loadDepts(); }}
          onDelete={async (id) => { await departmentsApi.remove(id); toast.success('Department removed.'); loadDepts(); }}
          onToggleActive={async (item) => {
            await departmentsApi.update(item._id, { active: !!item.inactive });
            toast.success(item.inactive ? 'Reactivated.' : 'Deactivated.');
            loadDepts();
          }}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <ManagedList
          title="Courses"
          icon={GraduationCap}
          loading={loading.course}
          items={courses.map((c) => ({ _id: c._id, label: c.name, sub: c.category?.toUpperCase() }))}
          addFields={{ name: 'Course name (e.g. B.Tech CSE)', extra: 'ug / pg / diploma' }}
          onReload={loadCourses}
          onCreate={async (name, category) => { await coursesApi.createCourse(name, category || 'ug'); toast.success('Course added.'); loadCourses(); }}
          onRename={async (id, name) => { await coursesApi.updateCourse(id, { name }); toast.success('Course renamed.'); loadCourses(); }}
          onDelete={async (id) => { await coursesApi.deleteCourse(id); toast.success('Course removed.'); loadCourses(); }}
        />
      </Reveal>

      <Reveal delay={0.1}>
        <ManagedList
          title="Skills"
          icon={Tags}
          loading={loading.skill}
          items={skills.map((s) => ({ _id: s._id, label: s.displayName || s.name }))}
          addFields={{ name: 'Skill name (e.g. Kubernetes)' }}
          onReload={loadSkills}
          onCreate={async (name) => { await skillsApi.addSkill(name); toast.success('Skill added.'); loadSkills(); }}
          onRename={async (id, name) => { await skillsApi.updateSkill(id, name); toast.success('Skill renamed.'); loadSkills(); }}
          onDelete={async (id) => { await skillsApi.deleteSkill(id); toast.success('Skill removed.'); loadSkills(); }}
        />
      </Reveal>
    </div>
  );
};

export default ReferencePanel;
