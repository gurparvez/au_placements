import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, RefreshCw, Layers, GraduationCap, Tags, Check, X, EyeOff, Eye } from 'lucide-react';
import departmentsApi, { type Department } from '@/api/departments';
import coursesApi, { type Course } from '@/api/courses';
import skillsApi, { type Skill } from '@/api/skills';

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
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px',
  borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff',
  fontWeight: 600, fontSize: 13.5, cursor: 'pointer', border: 'none',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 11px',
  borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)',
  fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length) return data.errors.map((e: any) => e.message || e.field).join(', ');
    if (data?.message) return data.message;
  }
  return fallback;
}

/* --------------------------- generic list shell --------------------------- */

interface RefItem {
  _id: string;
  label: string;
  sub?: string;
  inactive?: boolean;
}

/**
 * One managed reference list. Each entity (departments, courses, skills) maps
 * its own records into RefItem and supplies create/rename/delete handlers, so
 * the table, search, inline-edit, and empty states are written once.
 */
function ManagedList({
  title, subtitle, icon: Icon, items, loading, addFields, onReload,
  onCreate, onRename, onDelete, onToggleActive,
}: {
  title: string;
  subtitle: string;
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
    if (!window.confirm(`Delete "${item.label}"? This cannot be undone.`)) return;
    try {
      await onDelete(item._id);
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete.'));
    }
  };

  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          width: 34, height: 34, flex: 'none', borderRadius: 9, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', background: 'var(--primary-soft)', color: 'var(--primary)',
        }}>
          <Icon size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{title} <span style={{ ...muted, fontWeight: 500 }}>· {items.length}</span></h3>
          <p style={{ ...muted, margin: '3px 0 0' }}>{subtitle}</p>
        </div>
        <button onClick={() => setAdding((a) => !a)} style={btnPrimary}><Plus size={15} /> Add</button>
      </div>

      {adding && (
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12, marginBottom: 14,
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
          <button onClick={submitNew} disabled={busy} style={btnPrimary}>{busy ? 'Adding…' : 'Add'}</button>
          <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <button onClick={onReload} style={btnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div style={{ maxHeight: 340, overflowY: 'auto', margin: '0 -18px -18px', borderTop: '1px solid var(--border)' }}>
        {loading ? (
          <p style={{ ...muted, padding: '26px 0', textAlign: 'center' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ ...muted, padding: '30px 0', textAlign: 'center' }}>{q ? 'No matches.' : 'Nothing yet — add the first entry.'}</p>
        ) : (
          filtered.map((item) => (
            <div key={item._id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderTop: '1px solid var(--border)',
              opacity: item.inactive ? 0.55 : 1,
            }}>
              {editId === item._id ? (
                <>
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(item._id); if (e.key === 'Escape') setEditId(null); }}
                    style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => submitEdit(item._id)} disabled={busy} style={{ ...btnGhost, padding: 8, color: '#22c55e' }} aria-label="Save"><Check size={15} /></button>
                  <button onClick={() => setEditId(null)} style={{ ...btnGhost, padding: 8 }} aria-label="Cancel"><X size={15} /></button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</span>
                    {item.sub && <span style={{ ...muted, marginLeft: 8 }}>{item.sub}</span>}
                    {item.inactive && <span style={{ ...muted, marginLeft: 8, fontStyle: 'italic' }}>inactive</span>}
                  </div>
                  {onToggleActive && (
                    <button onClick={() => onToggleActive(item)} style={{ ...btnGhost, padding: 8 }}
                      title={item.inactive ? 'Reactivate' : 'Deactivate (hide from new selections)'}
                      aria-label={item.inactive ? 'Reactivate' : 'Deactivate'}>
                      {item.inactive ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  )}
                  <button onClick={() => { setEditId(item._id); setEditName(item.label); }} style={{ ...btnGhost, padding: 8 }} aria-label="Rename"><Pencil size={14} /></button>
                  <button onClick={() => remove(item)} style={{ ...btnGhost, padding: 8, color: 'var(--danger)', borderColor: 'var(--danger)' }} aria-label="Delete"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          ))
        )}
      </div>
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
    <div style={{ marginTop: 18 }}>
      <div style={{
        ...card, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 11,
        background: 'color-mix(in srgb, var(--primary) 5%, var(--surface))',
      }}>
        <Layers size={17} style={{ color: 'var(--primary)', flex: 'none' }} />
        <span style={{ fontSize: 12.5 }}>
          These are the official lists students and recruiters pick from — no free typing. Keep the
          spellings clean; every dashboard grouping and eligibility check keys off them. Renaming a
          department automatically updates every student already in it.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16, alignItems: 'start' }}>
        <ManagedList
          title="Departments"
          subtitle="University departments."
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

        <ManagedList
          title="Courses"
          subtitle="Degree programmes."
          icon={GraduationCap}
          loading={loading.course}
          items={courses.map((c) => ({ _id: c._id, label: c.name, sub: c.category?.toUpperCase() }))}
          addFields={{ name: 'Course name (e.g. B.Tech CSE)', extra: 'ug / pg / diploma' }}
          onReload={loadCourses}
          onCreate={async (name, category) => { await coursesApi.createCourse(name, category || 'ug'); toast.success('Course added.'); loadCourses(); }}
          onRename={async (id, name) => { await coursesApi.updateCourse(id, { name }); toast.success('Course renamed.'); loadCourses(); }}
          onDelete={async (id) => { await coursesApi.deleteCourse(id); toast.success('Course removed.'); loadCourses(); }}
        />

        <ManagedList
          title="Skills"
          subtitle="The skill catalogue students choose from."
          icon={Tags}
          loading={loading.skill}
          items={skills.map((s) => ({ _id: s._id, label: s.displayName || s.name }))}
          addFields={{ name: 'Skill name (e.g. Kubernetes)' }}
          onReload={loadSkills}
          onCreate={async (name) => { await skillsApi.addSkill(name); toast.success('Skill added.'); loadSkills(); }}
          onRename={async (id, name) => { await skillsApi.updateSkill(id, name); toast.success('Skill renamed.'); loadSkills(); }}
          onDelete={async (id) => { await skillsApi.deleteSkill(id); toast.success('Skill removed.'); loadSkills(); }}
        />
      </div>
    </div>
  );
};

export default ReferencePanel;
