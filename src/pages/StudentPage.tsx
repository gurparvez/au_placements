import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown, SlidersHorizontal, Users } from 'lucide-react';
import studentApi from '@/api/students';
import { skillsApi } from '@/api/skills';
import StudentCard from '@/components/StudentCard';
import { studentToCardVM } from '@/utils/cardVM';
import { FILTER_SKILLS } from '@/utils/skills';

const PAGE = 12;
const PADX = 'clamp(20px,3vw,48px)';
const UNIVERSITIES = ['Any', 'Akal University', 'Eternal University'];
const OPPORTUNITIES = ['Any', 'Internship', 'Job'];
const EXP_RANGES = [
  { v: 'Any', l: 'Experience' },
  { v: '0-6', l: '0–6 months' },
  { v: '6-12', l: '6–12 months' },
  { v: '12-24', l: '12–24 months' },
  { v: '24+', l: '24+ months' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const selectStyle: React.CSSProperties = {
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none',
  padding: '10px 34px 10px 14px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)',
  background: 'var(--surface-2)', color: 'var(--text)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
};

const FilterSelect: React.FC<{
  value: string; onChange: (v: string) => void; label: string; full?: boolean; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ value, onChange, label, full, style, children }) => (
  <div style={{ position: 'relative', display: full ? 'flex' : 'inline-flex', width: full ? '100%' : undefined }}>
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} style={{ ...selectStyle, ...(full ? { width: '100%', background: 'var(--bg-2)' } : {}), ...style }}>
      {children}
    </select>
    <ChevronDown size={15} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-subtle)' }} />
  </div>
);
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)',
  background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
};
const Labeled: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const StudentsPage: React.FC = () => {
  // ---- filters ----
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [university, setUniversity] = useState('Any');
  const [opportunity, setOpportunity] = useState('Any');
  const [field, setField] = useState('Any');
  const [exp, setExp] = useState('Any');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [skillQuery, setSkillQuery] = useState('');
  const [sheet, setSheet] = useState(false);

  // ---- results (server-side) ----
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const reqId = useRef(0);

  // ---- filter option data ----
  const [backendSkills, setBackendSkills] = useState<string[]>([]);
  const [fieldOpts, setFieldOpts] = useState<string[]>([]);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      try {
        const res = await skillsApi.getAllSkills({ signal: c.signal });
        setBackendSkills((res.skills ?? []).map((s) => s.displayName || s.name).filter(Boolean));
      } catch { /* ignore */ }
    })();
    studentApi.filterMeta().then((m) => setFieldOpts(m.fields || [])).catch(() => {});
    return () => c.abort();
  }, []);

  const buildParams = () => ({
    q: q.trim() || undefined,
    skills: skills.length ? skills.join(',') : undefined,
    university: university !== 'Any' ? university : undefined,
    opportunity: opportunity === 'Internship' ? 'internship' : opportunity === 'Job' ? 'job' : undefined,
    field: field !== 'Any' ? field : undefined,
    exp: exp !== 'Any' ? exp : undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const runFetch = async (pageNum: number, replace: boolean) => {
    const id = ++reqId.current;
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const res = await studentApi.browse({ ...buildParams(), page: pageNum, limit: PAGE });
      if (id !== reqId.current) return; // a newer request superseded this one
      setTotal(res.pagination.total);
      setResults((prev) => (replace ? res.students : [...prev, ...res.students]));
      setPage(pageNum);
    } catch {
      if (id === reqId.current && replace) { setResults([]); setTotal(0); }
    } finally {
      if (id === reqId.current) { setLoading(false); setLoadingMore(false); }
    }
  };

  // Debounced re-fetch (page 1) whenever any filter changes.
  useEffect(() => {
    const t = setTimeout(() => runFetch(1, true), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, skills, university, opportunity, field, exp, from, to]);

  // ---- derived option lists ----
  const allSkills = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    [...FILTER_SKILLS, ...backendSkills].forEach((s) => {
      const k = s.toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(s); }
    });
    return out;
  }, [backendSkills]);
  const fields = useMemo(() => ['Any', ...fieldOpts], [fieldOpts]);

  const monthOpts = useMemo(() => {
    const out: { v: string; l: string }[] = [];
    const now = new Date();
    for (let i = -6; i <= 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      out.push({ v: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, l: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }
    return out;
  }, []);

  const toggleSkill = (sk: string) => setSkills((p) => (p.indexOf(sk) >= 0 ? p.filter((x) => x !== sk) : p.concat([sk])));
  const clearAll = () => {
    setQ(''); setSkills([]); setUniversity('Any'); setOpportunity('Any'); setField('Any'); setExp('Any'); setFrom(''); setTo(''); setSkillQuery('');
  };

  const cards = results.map(studentToCardVM);
  const skillRows = allSkills.filter((s) => s.toLowerCase().indexOf(skillQuery.toLowerCase()) >= 0);
  const anyActive = !!(q || skills.length || university !== 'Any' || opportunity !== 'Any' || field !== 'Any' || exp !== 'Any' || from || to);
  const hasMore = results.length < total;

  const SkillList = ({ box = 16, font = 13.5 }: { box?: number; font?: number }) => (
    <>
      {skillRows.map((name) => {
        const sel = skills.indexOf(name) >= 0;
        return (
          <button key={name} onClick={() => toggleSkill(name)} aria-pressed={sel} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', color: 'var(--text)', background: sel ? 'var(--primary-soft)' : 'transparent', border: 'none' }}>
            <span aria-hidden style={{ width: box, height: box, borderRadius: 5, border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border-strong)'}`, background: sel ? 'var(--primary)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flex: 'none' }}>{sel ? '✓' : ''}</span>
            <span style={{ fontSize: font }}>{name}</span>
          </button>
        );
      })}
      {skillRows.length === 0 && <div style={{ padding: '14px 10px', fontSize: 13, color: 'var(--text-subtle)' }}>No skills found.</div>}
    </>
  );

  // All filter controls, shared by the desktop rail and the mobile sheet.
  const renderFilters = () => (
    <>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, headline, field…" aria-label="Search students" style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      <Labeled label="University">
        <FilterSelect full value={university} onChange={setUniversity} label="University">
          {UNIVERSITIES.map((u) => <option key={u} value={u}>{u === 'Any' ? 'Any university' : u}</option>)}
        </FilterSelect>
      </Labeled>
      <Labeled label="Looking for">
        <FilterSelect full value={opportunity} onChange={setOpportunity} label="Opportunity">
          {OPPORTUNITIES.map((o) => <option key={o} value={o}>{o === 'Any' ? 'Any opportunity' : o}</option>)}
        </FilterSelect>
      </Labeled>
      <Labeled label="Preferred field">
        <FilterSelect full value={field} onChange={setField} label="Preferred field">
          {fields.map((f) => <option key={f} value={f}>{f === 'Any' ? 'Any field' : f}</option>)}
        </FilterSelect>
      </Labeled>
      <Labeled label="Experience">
        <FilterSelect full value={exp} onChange={setExp} label="Experience">
          {EXP_RANGES.map((er) => <option key={er.v} value={er.v}>{er.v === 'Any' ? 'Any experience' : er.l}</option>)}
        </FilterSelect>
      </Labeled>
      <Labeled label="Availability">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilterSelect full value={from} onChange={setFrom} label="Available from" style={{ fontSize: 13 }}>
            <option value="">From</option>
            {monthOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </FilterSelect>
          <span aria-hidden style={{ color: 'var(--text-subtle)' }}>→</span>
          <FilterSelect full value={to} onChange={setTo} label="Available until" style={{ fontSize: 13 }}>
            <option value="">Until</option>
            {monthOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </FilterSelect>
        </div>
      </Labeled>

      <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0 14px' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 650, fontSize: 13.5 }}>Skills</span>
        {skills.length > 0 && <button onClick={() => setSkills([])} style={{ fontSize: 12.5, color: 'var(--primary)', cursor: 'pointer', fontWeight: 550, background: 'none', border: 'none' }}>Clear</button>}
      </div>
      <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} placeholder="Search skills…" aria-label="Search skills" style={{ ...inputStyle, padding: '9px 12px', fontSize: 13.5, marginBottom: 10 }} />
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {skills.map((name) => (
            <button key={name} onClick={() => toggleSkill(name)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 550, padding: '4px 9px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid var(--primary-soft-border)', cursor: 'pointer' }}>
              {name} <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}
      <div style={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1, margin: '0 -6px' }}>
        <SkillList />
      </div>
    </>
  );

  return (
    <section style={{ width: '100%', padding: `36px ${PADX} 80px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span aria-hidden style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Users size={24} />
        </span>
        <div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,32px)', letterSpacing: '-.02em', fontWeight: 700, margin: 0 }}>Explore students</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '5px 0 0' }}>Discover talent across Akal &amp; Eternal University.</p>
        </div>
      </div>

      {/* Layout: filter rail + results */}
      <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 26, marginTop: 26, alignItems: 'start' }}>
        <aside data-kp-show="desktop" style={{ position: 'sticky', top: 84, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: 18, boxShadow: 'var(--shadow)', maxHeight: 'calc(100vh - 104px)', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 7 }}><SlidersHorizontal size={16} /> Filters</span>
            {anyActive && <button onClick={clearAll} style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
          </div>
          {renderFilters()}
        </aside>

        <div>
          {/* Results toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
              {loading ? 'Searching…' : <><strong style={{ color: 'var(--text)', fontWeight: 650 }}>{total}</strong> {total === 1 ? 'student' : 'students'}</>}
            </p>
            <button data-kp-show="mobile" onClick={() => setSheet(true)} style={{ display: 'none', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 550, fontSize: 14, cursor: 'pointer' }}><SlidersHorizontal size={15} /> Filters{anyActive ? ' •' : ''}</button>
          </div>

          {loading && results.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: 18 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span data-kp-sk="true" style={{ width: 46, height: 46, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <span data-kp-sk="true" style={{ display: 'block', height: 14, width: '60%', marginBottom: 8 }} />
                      <span data-kp-sk="true" style={{ display: 'block', height: 11, width: '85%' }} />
                    </div>
                  </div>
                  <span data-kp-sk="true" style={{ display: 'block', height: 11, width: '100%', marginTop: 18 }} />
                  <span data-kp-sk="true" style={{ display: 'block', height: 11, width: '70%', marginTop: 10 }} />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-card)' }}>
              <div aria-hidden style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto', color: 'var(--text-subtle)' }}>⌕</div>
              <h3 style={{ fontSize: 19, fontWeight: 650, margin: '18px 0 0' }}>No students found</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>Try changing or clearing your filters.</p>
              {anyActive && <button onClick={clearAll} style={{ marginTop: 18, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' }}>Clear all filters</button>}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18, opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
                {cards.map((vm) => <StudentCard key={vm.id} vm={vm} />)}
              </div>
              {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                  <button onClick={() => runFetch(page + 1, false)} disabled={loadingMore} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', opacity: loadingMore ? 0.7 : 1 }}>
                    {loadingMore ? 'Loading…' : `Load more (${total - results.length} more)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet — all filters */}
      {sheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 310 }}>
          <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.5)', animation: 'kpFade .15s ease' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '86vh', background: 'var(--bg-2)', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderTop: '1px solid var(--border)', padding: 18, display: 'flex', flexDirection: 'column', animation: 'kpPop .2s ease' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 14px', flex: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flex: 'none' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Filters</span>
              {anyActive && <button onClick={clearAll} style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none' }}>Clear all</button>}
            </div>
            <div style={{ overflow: 'auto', flex: 1, margin: '0 -2px', padding: '0 2px' }}>
              {renderFilters()}
            </div>
            <button onClick={() => setSheet(false)} style={{ marginTop: 14, padding: 13, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none', flex: 'none' }}>Show {total} results</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentsPage;
