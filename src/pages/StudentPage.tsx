import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import { skillsApi } from '@/api/skills';
import StudentCard from '@/components/StudentCard';
import { studentToCardVM } from '@/utils/cardVM';
import { FILTER_SKILLS } from '@/utils/skills';

const PAGE = 9;
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
  padding: '10px 14px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)',
  background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
  textAlign: 'center', textAlignLast: 'center',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)',
  background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
};
const monthOf = (d?: string) => (d ? String(d).slice(0, 7) : '');

const StudentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allStudents, loading } = useAppSelector((s) => s.student);

  const [backendSkills, setBackendSkills] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [university, setUniversity] = useState('Any');
  const [opportunity, setOpportunity] = useState('Any');
  const [field, setField] = useState('Any');
  const [exp, setExp] = useState('Any');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [skillQuery, setSkillQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (!allStudents) dispatch(fetchAllStudents());
  }, [dispatch, allStudents]);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      try {
        const res = await skillsApi.getAllSkills({ signal: c.signal });
        setBackendSkills((res.skills ?? []).map((s) => s.displayName || s.name).filter(Boolean));
      } catch {
        /* ignore */
      }
    })();
    return () => c.abort();
  }, []);

  const allSkills = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    [...FILTER_SKILLS, ...backendSkills].forEach((s) => {
      const k = s.toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(s); }
    });
    return out;
  }, [backendSkills]);

  const fields = useMemo(() => {
    const set = new Set<string>();
    (allStudents ?? []).forEach((s: any) => s.preferred_field && set.add(s.preferred_field));
    return ['Any', ...Array.from(set)];
  }, [allStudents]);

  const monthOpts = useMemo(() => {
    const out: { v: string; l: string }[] = [];
    const now = new Date();
    for (let i = -6; i <= 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      out.push({ v: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, l: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    const list = allStudents ?? [];
    const qq = q.trim().toLowerCase();
    return list.filter((s: any) => {
      const sn: string[] = Array.isArray(s.skills) ? s.skills.map((x: any) => x?.displayName || x?.name || '').filter(Boolean) : [];
      if (qq) {
        const hay = [s.user?.firstName, s.user?.lastName, s.headline, s.preferred_field, sn.join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(qq) < 0) return false;
      }
      if (skills.length) {
        const low = sn.map((x) => x.toLowerCase());
        if (!skills.every((k) => low.indexOf(k.toLowerCase()) >= 0)) return false;
      }
      if (university !== 'Any' && s.user?.university !== university) return false;
      if (opportunity !== 'Any') {
        const t = opportunity.toLowerCase() === 'internship' ? 'internship' : 'job';
        if ((s.looking_for || {}).type !== t) return false;
      }
      if (field !== 'Any' && s.preferred_field !== field) return false;
      if (exp !== 'Any') {
        const e = s.total_experience || 0;
        const ok = exp === '0-6' ? e < 6 : exp === '6-12' ? e >= 6 && e < 12 : exp === '12-24' ? e >= 12 && e < 24 : e >= 24;
        if (!ok) return false;
      }
      if (from || to) {
        const lf = s.looking_for || {};
        const af = monthOf(lf.from_date);
        const at = monthOf(lf.to_date) || '9999-12';
        if (from && at < from) return false;
        if (to && af > to) return false;
      }
      return true;
    });
  }, [allStudents, q, skills, university, opportunity, field, exp, from, to]);

  useEffect(() => setVisible(PAGE), [q, skills, university, opportunity, field, exp, from, to]);

  const toggleSkill = (sk: string) => setSkills((p) => (p.indexOf(sk) >= 0 ? p.filter((x) => x !== sk) : p.concat([sk])));
  const clearAll = () => {
    setQ(''); setSkills([]); setUniversity('Any'); setOpportunity('Any'); setField('Any'); setExp('Any'); setFrom(''); setTo(''); setSkillQuery('');
  };

  const cards = filtered.slice(0, visible).map(studentToCardVM);
  const total = (allStudents ?? []).length;
  const skillRows = allSkills.filter((s) => s.toLowerCase().indexOf(skillQuery.toLowerCase()) >= 0);

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

  return (
    <section style={{ width: '100%', padding: `36px ${PADX} 80px` }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,38px)', letterSpacing: '-.02em', fontWeight: 700, margin: 0 }}>Browse students</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'left' }}>
            <strong style={{ color: 'var(--text)', fontWeight: 650 }}>{filtered.length}</strong> of {total} students match your filters
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button data-kp-show="mobile" onClick={() => setSheet(true)} style={{ display: 'none', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 550, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>Skills filter</button>
          <button onClick={clearAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text-muted)', fontWeight: 550, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>Clear all filters</button>
        </div>
      </div>

      {/* Filters — all on one line, vertically centered */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span aria-hidden style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', fontSize: 15 }}>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, headline, skill, field…" aria-label="Search students" style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <select value={university} onChange={(e) => setUniversity(e.target.value)} aria-label="University" style={selectStyle}>
          {UNIVERSITIES.map((u) => <option key={u} value={u}>{u === 'Any' ? 'University' : u}</option>)}
        </select>
        <select value={opportunity} onChange={(e) => setOpportunity(e.target.value)} aria-label="Opportunity" style={selectStyle}>
          {OPPORTUNITIES.map((o) => <option key={o} value={o}>{o === 'Any' ? 'Opportunity' : o}</option>)}
        </select>
        <select value={field} onChange={(e) => setField(e.target.value)} aria-label="Preferred field" style={{ ...selectStyle, maxWidth: 200 }}>
          {fields.map((f) => <option key={f} value={f}>{f === 'Any' ? 'Field' : f}</option>)}
        </select>
        <select value={exp} onChange={(e) => setExp(e.target.value)} aria-label="Experience" style={selectStyle}>
          {EXP_RANGES.map((er) => <option key={er.v} value={er.v}>{er.l}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>Available</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Available from" style={{ ...selectStyle, padding: '11px 12px', fontSize: 13.5 }}>
            <option value="">Any month</option>
            {monthOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <span aria-hidden style={{ color: 'var(--text-subtle)' }}>→</span>
          <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Available until" style={{ ...selectStyle, padding: '11px 12px', fontSize: 13.5 }}>
            <option value="">Any month</option>
            {monthOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
      </div>

      {/* Body: skill sidebar + results */}
      <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: '264px 1fr', gap: 26, marginTop: 26, alignItems: 'start' }}>
        <aside data-kp-show="desktop" style={{ position: 'sticky', top: 96, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 650, fontSize: 15 }}>Filter by skill</span>
            {skills.length > 0 && <button onClick={() => setSkills([])} style={{ fontSize: 12.5, color: 'var(--primary)', cursor: 'pointer', fontWeight: 550, background: 'none', border: 'none' }}>Clear</button>}
          </div>
          <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} placeholder="Search skills…" aria-label="Search skills" style={{ ...inputStyle, padding: '9px 12px', fontSize: 13.5, marginBottom: 12 }} />
          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {skills.map((name) => (
                <button key={name} onClick={() => toggleSkill(name)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 550, padding: '4px 9px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid var(--primary-soft-border)', cursor: 'pointer' }}>
                  {name} <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 360, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1, margin: '0 -6px' }}>
            <SkillList />
          </div>
        </aside>

        <div>
          {loading && !allStudents ? (
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
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-card)' }}>
              <div aria-hidden style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto', color: 'var(--text-subtle)' }}>⌕</div>
              <h3 style={{ fontSize: 19, fontWeight: 650, margin: '18px 0 0' }}>No students found</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>Try changing or clearing your filters.</p>
              <button onClick={clearAll} style={{ marginTop: 18, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' }}>Clear all filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                {cards.map((vm) => <StudentCard key={vm.id} vm={vm} />)}
              </div>
              {filtered.length > visible && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                  <button onClick={() => setVisible((v) => v + PAGE)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, cursor: 'pointer' }}>Load more students</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 310 }}>
          <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.5)', animation: 'kpFade .15s ease' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '80vh', background: 'var(--bg-2)', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderTop: '1px solid var(--border)', padding: 18, display: 'flex', flexDirection: 'column', animation: 'kpPop .2s ease' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 650, fontSize: 16 }}>Filter by skill</span>
              {skills.length > 0 && <button onClick={() => setSkills([])} style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 550, background: 'none', border: 'none' }}>Clear</button>}
            </div>
            <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} placeholder="Search skills…" style={{ ...inputStyle, background: 'var(--surface)', marginBottom: 12 }} />
            <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <SkillList box={18} font={14} />
            </div>
            <button onClick={() => setSheet(false)} style={{ marginTop: 14, padding: 13, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none' }}>Show {filtered.length} results</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentsPage;
