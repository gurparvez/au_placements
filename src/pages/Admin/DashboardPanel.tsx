import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  RefreshCw, Users, Building2, Briefcase, GraduationCap, TrendingUp, Download,
  Award, Clock, IndianRupee, FileText, MapPin, SlidersHorizontal, X, AlertTriangle,
  LayoutGrid, Layers, GitBranch, Target, Lock,
} from 'lucide-react';
import analyticsApi, {
  type DashboardData,
  type DashboardFilters,
  type FilterOptions,
  type UnplacedStudent,
} from '@/api/analytics';
import {
  AreaChart, BarChart, BarList, BoxPlot, DonutChart, FunnelChart, Gauge,
  GroupedBarChart, Heatmap, MultiLineChart, PieChart, RateChart, StackedBar, colorAt,
} from '@/components/charts';

/* ------------------------------ styles ------------------------------ */

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px',
  borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)',
  fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };
const selectStyle: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)',
  background: 'var(--bg-2)', color: 'var(--text)', fontSize: 13, outline: 'none',
  cursor: 'pointer', minWidth: 0,
};
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16,
};

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

/* ------------------------------ primitives ------------------------------ */

const Panel: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ title, subtitle, action, children, wide }) => (
  <div style={{ ...card, padding: 18, minWidth: 0, gridColumn: wide ? '1 / -1' : undefined }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>{title}</h3>
        {subtitle && <p style={{ ...muted, margin: '3px 0 0' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: string;
}> = ({ icon: Icon, label, value, hint, tone = 'var(--primary)' }) => (
  <div style={{ ...card, padding: 16, display: 'flex', gap: 13, alignItems: 'flex-start', minWidth: 0 }}>
    <span style={{
      width: 38, height: 38, flex: 'none', borderRadius: 10, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone,
    }}>
      <Icon size={19} />
    </span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.15 }}>{value}</div>
      <div style={{ ...muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 3 }}>{hint}</div>}
    </div>
  </div>
);

const th: React.CSSProperties = {
  padding: '9px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '.04em', whiteSpace: 'nowrap', textAlign: 'left', color: 'var(--text-subtle)',
};
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 12.5, whiteSpace: 'nowrap' };

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div style={{ overflowX: 'auto', margin: '0 -18px -18px', borderTop: '1px solid var(--border)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
      <thead>
        <tr style={{ background: 'var(--surface-2)' }}>{headers.map((h, i) => <th key={i} style={th}>{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Note: React.FC<{ children: React.ReactNode; tone?: string; icon?: React.ElementType }> = ({
  children, tone = 'orange', icon: Icon = AlertTriangle,
}) => (
  <div style={{
    ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 11,
    borderColor: `color-mix(in srgb, ${tone} 40%, var(--border))`,
    background: `color-mix(in srgb, ${tone} 7%, var(--surface))`,
  }}>
    <Icon size={18} style={{ color: tone, flex: 'none' }} />
    <span style={{ fontSize: 12.5 }}>{children}</span>
  </div>
);

/* ------------------------------ CSV export ------------------------------ */

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return toast.error('Nothing to export.');
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/* ------------------------------ filter bar ------------------------------ */

const FilterBar: React.FC<{
  filters: DashboardFilters;
  options: FilterOptions | null;
  onChange: (next: DashboardFilters) => void;
}> = ({ filters, options, onChange }) => {
  const set = (k: keyof DashboardFilters, v: string) => onChange({ ...filters, [k]: v || undefined });
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{ ...card, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
        <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 13, fontWeight: 650, flex: 1 }}>Filters</span>
        {activeCount > 0 && (
          <button onClick={() => onChange({})} style={{ ...btnGhost, padding: '5px 10px', fontSize: 12 }}>
            <X size={13} /> Clear {activeCount}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
        <select value={filters.university ?? ''} onChange={(e) => set('university', e.target.value)} style={selectStyle} aria-label="University">
          <option value="">All universities</option>
          {options?.universities.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={filters.department ?? ''} onChange={(e) => set('department', e.target.value)} style={selectStyle} aria-label="Department">
          <option value="">All departments</option>
          {options?.departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={String(filters.batch_year ?? '')} onChange={(e) => set('batch_year', e.target.value)} style={selectStyle} aria-label="Batch">
          <option value="">All batches</option>
          {options?.batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}
        </select>
        <select value={filters.course ?? ''} onChange={(e) => set('course', e.target.value)} style={selectStyle} aria-label="Course">
          <option value="">All courses</option>
          {options?.courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.count})</option>)}
        </select>
        <select value={filters.type ?? ''} onChange={(e) => set('type', e.target.value)} style={selectStyle} aria-label="Placement type">
          <option value="">All placement types</option>
          {options?.types.map((t) => <option key={t} value={t}>{t === 'ppo' ? 'PPO' : t}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="date" value={filters.from ?? ''} onChange={(e) => set('from', e.target.value)}
            style={{ ...selectStyle, flex: 1 }} aria-label="From" title="Offers from" />
          <span style={{ ...muted, flex: 'none' }}>→</span>
          <input type="date" value={filters.to ?? ''} onChange={(e) => set('to', e.target.value)}
            style={{ ...selectStyle, flex: 1 }} aria-label="To" title="Offers until" />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ panel ------------------------------ */

type Section = 'overview' | 'cohort' | 'pipeline' | 'companies' | 'students';

const SECTIONS: [Section, string, React.ElementType][] = [
  ['overview', 'Overview', LayoutGrid],
  ['cohort', 'Cohort', Layers],
  ['pipeline', 'Pipeline & offers', GitBranch],
  ['companies', 'Companies', Building2],
  ['students', 'Student progress', Target],
];

const DashboardPanel: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [unplaced, setUnplaced] = useState<UnplacedStudent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await analyticsApi.dashboard(filters));
    } catch (err) {
      toast.error(extractError(err, 'Failed to load dashboard.'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    analyticsApi.filterOptions().then(setOptions).catch(() => { /* dropdowns degrade to "All" */ });
  }, []);

  // Any open drilldown is stale once filters change.
  useEffect(() => { setUnplaced(null); }, [filters]);

  const loadUnplaced = useCallback(async () => {
    try {
      setUnplaced(await analyticsApi.unplaced(filters));
    } catch (err) {
      toast.error(extractError(err, 'Failed to load student list.'));
    }
  }, [filters]);

  // The student-progress view is built entirely from the at-risk list.
  useEffect(() => {
    if (section === 'students' && !unplaced) loadUnplaced();
  }, [section, unplaced, loadUnplaced]);

  const o = data?.overview;

  const roundDropoff = useMemo(() => {
    if (!data) return [];
    const byRound = new Map<string, { name: string; order: number; cleared: number; failed: number; pending: number }>();
    for (const r of data.applications.round_dropoff) {
      const e = byRound.get(r.name) ?? { name: r.name, order: r.order, cleared: 0, failed: 0, pending: 0 };
      if (r.result === 'cleared') e.cleared += r.count;
      else if (r.result === 'failed' || r.result === 'absent') e.failed += r.count;
      else e.pending += r.count;
      byRound.set(r.name, e);
    }
    return [...byRound.values()].sort((a, b) => a.order - b.order);
  }, [data]);

  if (loading && !data) {
    return <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--text-muted)', marginTop: 18 }}>Loading dashboard…</div>;
  }
  if (!data || !o) {
    return <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--text-muted)', marginTop: 18 }}>No data available.</div>;
  }

  const fy = data.final_year;
  const rd = data.readiness;

  return (
    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
      <FilterBar filters={filters} options={options} onChange={setFilters} />

      {/* section tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        {SECTIONS.map(([s, label, Icon]) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px',
              border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13.5,
              color: section === s ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${section === s ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
        <span style={{ ...muted, marginLeft: 'auto', alignSelf: 'center', paddingBottom: 8 }}>
          Updated {new Date(data.generated_at).toLocaleTimeString()}
        </span>
        <button onClick={load} style={{ ...btnGhost, alignSelf: 'center', marginBottom: 8 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ============================= OVERVIEW ============================= */}
      {section === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(212px,1fr))', gap: 12 }}>
            <StatCard icon={Users} label="Seeking placement" value={o.seeking_placement}
              hint={`${o.opted_out} opted out of ${o.profiles_completed} profiles`} />
            <StatCard icon={Award} label="Students placed" value={o.students_placed} tone="#22c55e"
              hint={`${o.placement_rate}% of those seeking`} />
            <StatCard icon={IndianRupee} label="Median package"
              value={o.median_ctc_lpa !== null ? `${o.median_ctc_lpa} LPA` : '—'} tone="#22c55e"
              hint={o.avg_ctc_lpa !== null ? `Mean ${o.avg_ctc_lpa} · high ${o.highest_ctc_lpa}` : 'No packages recorded'} />
            <StatCard icon={Clock} label="Currently interning" value={o.students_interning} tone="#f59e0b"
              hint={o.median_stipend ? `Median ₹${o.median_stipend.toLocaleString('en-IN')}/mo` : undefined} />
            <StatCard icon={FileText} label="Applications" value={o.total_applications} tone="#a855f7"
              hint={`${data.applications.shortlisted} shortlisted`} />
            <StatCard icon={Briefcase} label="Open positions" value={o.openings_open} tone="#06b6d4"
              hint={`${o.openings_closed} closed`} />
            <StatCard icon={Building2} label="Active recruiters" value={o.recruiters_active} tone="#ec4899"
              hint={o.recruiters_pending ? `${o.recruiters_pending} awaiting approval` : undefined} />
            <StatCard icon={Lock} label="Offer policy"
              value={data.policy.one_offer_lock ? 'Locked' : 'Open'} tone="#4f7cff"
              hint={data.policy.one_offer_lock
                ? data.policy.allow_upgrade_to_higher_tier ? `Upgrades above ${data.policy.dream_ctc_threshold} LPA` : 'One offer only'
                : 'Students may hold multiple offers'} />
          </div>

          <Note tone="var(--primary)" icon={Target}>
            Placement rate is <strong>{o.placement_rate}%</strong> against the {o.seeking_placement} students
            actually seeking placement. Against all {o.total_students} enrolled it would read{' '}
            <strong>{o.placement_rate_all}%</strong> — the first figure is the one to report.
          </Note>

          <div style={{ ...card, padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Final year — batch of {fy.batch}</h3>
            <p style={{ ...muted, margin: '0 0 16px' }}>
              {fy.enrolled} enrolled · {fy.opted_out} not seeking placement · {fy.total} in the pool.
            </p>
            {fy.total === 0 ? (
              <p style={{ ...muted, padding: '20px 0', textAlign: 'center' }}>
                No students in the {fy.batch} batch yet — set "batch year" on student profiles.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20, alignItems: 'center' }}>
                <Gauge value={fy.rate} label="placed" sublabel={`${fy.placed} placed · ${fy.remaining} remaining of ${fy.total}`} />
                <div>
                  <span style={{ ...muted, display: 'block', marginBottom: 10, fontWeight: 600 }}>Outcome composition</span>
                  <PieChart data={data.distribution.outcome_composition} emptyLabel="No intent recorded." size={132} />
                </div>
                <div>
                  <span style={{ ...muted, display: 'block', marginBottom: 10, fontWeight: 600 }}>Placed vs remaining by department</span>
                  <StackedBar
                    data={fy.by_department.map((d) => ({
                      key: d.key,
                      parts: [
                        { label: 'Placed', value: d.placed, color: '#22c55e' },
                        { label: 'Remaining', value: d.remaining, color: 'var(--text-subtle)' },
                      ],
                    }))}
                    emptyLabel="No departments set."
                  />
                </div>
              </div>
            )}
          </div>

          <div style={grid2}>
            <Panel title="Season pacing" subtitle="Cumulative offers by month — this session against previous ones.">
              <MultiLineChart
                labels={data.trends.pacing.months}
                series={data.trends.pacing.series.map((s) => ({ label: s.label, values: s.values }))}
                emptyLabel="Needs offer dates across at least one full session."
              />
            </Panel>

            <Panel title="Year on year" subtitle="Placement rate and median package by graduating batch.">
              {data.trends.yoy.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No batch data yet.</p>
              ) : (
                <Table headers={['Batch', 'Seeking', 'Placed', 'Rate', 'Median CTC']}>
                  {data.trends.yoy.map((y) => (
                    <tr key={y.batch} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ ...td, fontWeight: 700 }}>{y.batch}</td>
                      <td style={td}>{y.total}</td>
                      <td style={{ ...td, color: '#22c55e', fontWeight: 600 }}>{y.placed}</td>
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 48, height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                            <span style={{ display: 'block', width: `${y.rate}%`, height: '100%', background: '#22c55e' }} />
                          </span>
                          {y.rate}%
                        </span>
                      </td>
                      <td style={td}>{y.median_ctc !== null ? `${y.median_ctc} LPA` : '—'}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>
          </div>

          <Panel title="Placement rate — department × batch" subtitle="Darker is better. The pale cells are where to intervene." wide>
            <Heatmap
              departments={data.placements.heatmap.departments}
              batches={data.placements.heatmap.batches}
              cells={data.placements.heatmap.cells}
              emptyLabel="Needs department and batch year on student profiles."
            />
          </Panel>
        </>
      )}

      {/* ============================== COHORT ============================== */}
      {section === 'cohort' && (
        <>
          <Panel title="Placement by department" subtitle="Students seeking placement, placed against the pool." wide>
            <GroupedBarChart
              data={data.placements.by_department.map((d) => ({ key: d.key, placed: d.placed, unplaced: d.unplaced }))}
              series={[
                { key: 'placed', label: 'Placed', color: '#22c55e' },
                { key: 'unplaced', label: 'Not placed', color: 'var(--text-subtle)' },
              ]}
              emptyLabel="No departments set on student profiles yet."
            />
          </Panel>

          <div style={grid2}>
            <Panel title="By university" subtitle="Where students are enrolled.">
              <PieChart data={data.distribution.by_university} emptyLabel="No students yet." />
            </Panel>
            <Panel title="Outcome composition" subtitle="What the batch is actually doing.">
              <DonutChart data={data.distribution.outcome_composition} emptyLabel="No intent recorded." centerLabel="students" />
            </Panel>
            <Panel title="By department" subtitle="Student headcount per department.">
              <BarChart data={data.distribution.by_department} colorize emptyLabel="No departments set yet." />
            </Panel>
            <Panel title="By course" subtitle="Student headcount per programme.">
              <PieChart data={data.distribution.by_course} emptyLabel="No courses set yet." />
            </Panel>
            <Panel title="By batch" subtitle="Expected graduation year.">
              <BarChart data={data.distribution.by_batch} emptyLabel="No batch years set yet." />
            </Panel>
            <Panel title="CGPA distribution" subtitle="Academic spread across the cohort.">
              <BarChart data={data.distribution.by_cgpa} colorize emptyLabel="No CGPA recorded yet." />
            </Panel>
            <Panel title="By gender" subtitle="Required for NIRF / NBA reporting.">
              <DonutChart data={data.distribution.by_gender} emptyLabel="Gender not recorded on user accounts." centerLabel="students" />
            </Panel>
            <Panel title="Looking for" subtitle="What students are seeking.">
              <DonutChart data={data.distribution.by_looking_for} emptyLabel="No preferences set yet." centerLabel="students" />
            </Panel>
          </div>

          <Panel title="Does CGPA predict placement?" subtitle="Placement rate per CGPA band — informs where to target training." wide>
            <RateChart data={data.placements.cgpa_vs_placement} emptyLabel="Needs CGPA on student profiles and recorded placements." />
          </Panel>
        </>
      )}

      {/* ============================= PIPELINE ============================= */}
      {section === 'pipeline' && (
        <>
          <div style={grid2}>
            <Panel title="Hiring pipeline" subtitle="Applications by stage, with conversion from applied.">
              <FunnelChart data={data.applications.funnel} emptyLabel="No applications yet." />
            </Panel>

            <Panel title="Round-wise attrition" subtitle="Where candidates actually fail — this sets the training budget.">
              {roundDropoff.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>
                  No round data yet. Define rounds on an opening and record outcomes from the applicants list.
                </p>
              ) : (
                <StackedBar
                  data={roundDropoff.map((r) => ({
                    key: r.name,
                    parts: [
                      { label: 'Cleared', value: r.cleared, color: '#22c55e' },
                      { label: 'Failed / absent', value: r.failed, color: 'var(--danger)' },
                      { label: 'Pending', value: r.pending, color: 'var(--text-subtle)' },
                    ],
                  }))}
                  emptyLabel="No round data."
                />
              )}
            </Panel>

            <Panel title="Application volume" subtitle="Last 12 months.">
              <AreaChart data={data.applications.trend} emptyLabel="Needs at least two months of applications." />
            </Panel>

            <Panel title="Offers over time" subtitle="Confirmed placements per month.">
              <AreaChart data={data.placements.trend} color="#22c55e" emptyLabel="Needs at least two months of placements." />
            </Panel>
          </div>

          <Panel title="Salary distribution" subtitle="Median is the number to report — the mean is dragged up by outliers." wide>
            <BoxPlot stats={data.placements.ctc_box} emptyLabel="No packages recorded yet." unit="LPA" />
          </Panel>

          <div style={grid2}>
            <Panel title="Salary bands" subtitle="How offers cluster by package (LPA).">
              <BarChart data={data.placements.ctc_bands} colorize emptyLabel="No packages recorded yet." />
            </Panel>

            <Panel title="Internship stipends" subtitle="Monthly stipend distribution.">
              <BoxPlot stats={data.placements.stipend_box} emptyLabel="No stipends recorded yet." unit="₹/mo" color="#f59e0b" />
            </Panel>

            <Panel title="Offers per student" subtitle="Multiple offers held by one student are offers the tail didn't get.">
              <BarChart data={data.placements.offers_per_student} colorize emptyLabel="No placements recorded yet." />
            </Panel>

            <Panel title="Applications per student" subtitle="Students applying to fewer than 3 drives are the at-risk group.">
              <BarChart data={data.applications.per_student} emptyLabel="No applications yet." />
            </Panel>
          </div>

          <Panel title="Placement type" subtitle="Confirmed outcomes by kind.">
            <DonutChart data={data.placements.by_type} emptyLabel="No placements recorded yet." centerLabel="placements" />
          </Panel>
        </>
      )}

      {/* ============================ COMPANIES ============================ */}
      {section === 'companies' && (
        <>
          <div style={grid2}>
            <Panel title="Outreach funnel" subtitle={`Session ${data.session} — where company engagement leaks.`}>
              <FunnelChart data={data.companies.invitation_funnel} emptyLabel="No companies tracked this session yet." />
              {data.companies.declined > 0 && (
                <p style={{ ...muted, marginTop: 10 }}>{data.companies.declined} declined outright.</p>
              )}
            </Panel>

            <Panel title="Repeat vs new recruiters" subtitle="Losing repeat recruiters is an early warning.">
              {data.companies.churn.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No outreach history yet.</p>
              ) : (
                <StackedBar
                  data={data.companies.churn.map((c) => ({
                    key: `${c.session}-${String((c.session + 1) % 100).padStart(2, '0')}`,
                    parts: [
                      { label: 'Repeat', value: c.repeat, color: '#22c55e' },
                      { label: 'New', value: c.fresh, color: '#4f7cff' },
                    ],
                  }))}
                  emptyLabel="No outreach history."
                />
              )}
            </Panel>

            <Panel title="Sector diversification" subtitle="Heavy concentration in one sector is a fragility risk.">
              <PieChart data={data.placements.sectors} emptyLabel="No sector recorded on placements yet." />
            </Panel>

            <Panel title="Offer locations" subtitle="Where students are being placed.">
              <BarList data={data.placements.locations} max={10} colorize emptyLabel="No locations recorded yet." />
            </Panel>
          </div>

          <div style={grid2}>
            <Panel title="Top recruiters" subtitle="Companies by hires made.">
              {data.placements.top_companies.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No placements recorded yet.</p>
              ) : (
                <Table headers={['Company', 'Hires', 'Avg CTC', 'Max CTC']}>
                  {data.placements.top_companies.map((c) => (
                    <tr key={c.key} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ ...td, fontWeight: 600 }}>{c.key}</td>
                      <td style={td}>{c.count}</td>
                      <td style={td}>{c.avg_ctc ? `${c.avg_ctc.toFixed(1)} LPA` : '—'}</td>
                      <td style={td}>{c.max_ctc ? `${c.max_ctc} LPA` : '—'}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>

            <Panel title="Internship destinations" subtitle="Where students started internships.">
              {data.placements.internship_destinations.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No internships recorded yet.</p>
              ) : (
                <Table headers={['Company', 'Location', 'Students']}>
                  {data.placements.internship_destinations.map((d, i) => (
                    <tr key={`${d.company}-${i}`} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ ...td, fontWeight: 600 }}>{d.company}</td>
                      <td style={{ ...td, color: 'var(--text-muted)' }}>
                        {d.location ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={12} /> {d.location}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={td}>{d.count}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>
          </div>

          <Panel
            title="Recent placements"
            subtitle="Latest confirmed offers."
            action={data.placements.recent.length > 0 ? (
              <button onClick={() => downloadCsv('recent-placements.csv', data.placements.recent as unknown as Record<string, unknown>[])} style={btnGhost}>
                <Download size={14} /> CSV
              </button>
            ) : undefined}
          >
            {data.placements.recent.length === 0 ? (
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No placements recorded yet.</p>
            ) : (
              <Table headers={['Student', 'Company', 'Role', 'Type', 'Package', 'Location']}>
                {data.placements.recent.map((p) => (
                  <tr key={p._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ ...td, fontWeight: 600, textTransform: 'capitalize' }}>{p.student_name || '—'}</td>
                    <td style={td}>{p.company}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{p.role}</td>
                    <td style={td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                      }}>{p.type}</span>
                    </td>
                    <td style={td}>{p.ctc_lpa ? `${p.ctc_lpa} LPA` : p.stipend ? `₹${p.stipend.toLocaleString('en-IN')}/mo` : '—'}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{p.location || '—'}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Panel>
        </>
      )}

      {/* ============================= STUDENTS ============================= */}
      {section === 'students' && (
        <>
          {rd && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(212px,1fr))', gap: 12 }}>
              <StatCard icon={Target} label="Avg aptitude score" value={rd.avg_aptitude ?? '—'} tone="#4f7cff"
                hint={`${rd.with_aptitude} of ${rd.total} tested`} />
              <StatCard icon={Users} label="Avg mock interview" value={rd.avg_mock_score ?? '—'} tone="#a855f7"
                hint={`${rd.mock_attended} attended at least one`} />
              <StatCard icon={TrendingUp} label="Training attendance" value={rd.avg_attendance !== null ? `${rd.avg_attendance}%` : '—'} tone="#f59e0b" />
              <StatCard icon={FileText} label="Resumes verified" value={rd.resume_verified} tone="#22c55e"
                hint={`of ${rd.total} profiles`} />
            </div>
          )}

          <Panel title="Skill gap" subtitle="Skills demanded by open roles against what students actually list — sets the training curriculum." wide>
            {data.distribution.skill_gap.length === 0 ? (
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>
                No open roles list required skills yet.
              </p>
            ) : (
              <GroupedBarChart
                data={data.distribution.skill_gap.map((s) => ({ key: s.key, demand: s.demand, supply: s.supply }))}
                series={[
                  { key: 'demand', label: 'Demanded by roles', color: '#ef4444' },
                  { key: 'supply', label: 'Students with skill', color: '#22c55e' },
                ]}
                emptyLabel="No skill data."
              />
            )}
          </Panel>

          <Panel
            title={`At-risk students — batch of ${fy.batch}`}
            subtitle="Unplaced and seeking, ordered by risk: few applications, backlogs, low CGPA, no prep."
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={loadUnplaced} style={btnGhost}><RefreshCw size={14} /> Reload</button>
                {unplaced && unplaced.length > 0 && (
                  <button onClick={() => downloadCsv(`at-risk-batch-${fy.batch}.csv`, unplaced as unknown as Record<string, unknown>[])} style={btnGhost}>
                    <Download size={14} /> CSV
                  </button>
                )}
              </div>
            }
            wide
          >
            {!unplaced ? (
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>Loading…</p>
            ) : unplaced.length === 0 ? (
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>Everyone seeking placement in this batch is placed.</p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                  {(['high', 'medium', 'low'] as const).map((band) => {
                    const n = unplaced.filter((s) => s.risk_band === band).length;
                    const tone = band === 'high' ? 'var(--danger)' : band === 'medium' ? '#f59e0b' : 'var(--text-muted)';
                    return (
                      <span key={band} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999,
                        fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize',
                        background: `color-mix(in srgb, ${tone} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${tone} 30%, transparent)`, color: tone,
                      }}>
                        {n} {band} risk
                      </span>
                    );
                  })}
                </div>

                <Table headers={['Risk', 'AUID', 'Name', 'Department', 'CGPA', 'Backlogs', 'Applied', 'Aptitude', 'Mocks', 'Email']}>
                  {unplaced.map((s) => {
                    const tone = s.risk_band === 'high' ? 'var(--danger)' : s.risk_band === 'medium' ? '#f59e0b' : 'var(--text-muted)';
                    return (
                      <tr key={s._id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={td}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone,
                            border: `1px solid color-mix(in srgb, ${tone} 32%, transparent)`,
                          }}>{s.risk_band}</span>
                        </td>
                        <td style={{ ...td, color: 'var(--text-muted)' }}>{s.auid ?? '—'}</td>
                        <td style={{ ...td, fontWeight: 600, textTransform: 'capitalize' }}>{s.name}</td>
                        <td style={td}>{s.department ?? '—'}</td>
                        <td style={td}>{s.cgpa ?? '—'}</td>
                        <td style={{ ...td, color: s.backlogs > 0 ? 'var(--danger)' : undefined }}>{s.backlogs}</td>
                        <td style={{ ...td, color: s.applications === 0 ? 'var(--danger)' : undefined, fontWeight: s.applications === 0 ? 700 : 400 }}>
                          {s.applications}
                        </td>
                        <td style={td}>{s.aptitude_score ?? '—'}</td>
                        <td style={td}>{s.mock_interviews}</td>
                        <td style={{ ...td, color: 'var(--text-muted)' }}>{s.email ?? '—'}</td>
                      </tr>
                    );
                  })}
                </Table>
              </>
            )}
          </Panel>

          <Panel title="Top skills held" subtitle="Most common skills across student profiles.">
            {data.distribution.top_skills.length === 0 ? (
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No skills added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.distribution.top_skills.map((s, i) => (
                  <span key={s.key} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px',
                    borderRadius: 999, fontSize: 12.5, fontWeight: 550,
                    background: `color-mix(in srgb, ${colorAt(i)} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${colorAt(i)} 30%, transparent)`,
                  }}>
                    {s.key}<span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>{s.count}</span>
                  </span>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {o.profiles_missing > 0 && (
        <Note icon={GraduationCap}>
          <strong>{o.profiles_missing}</strong> registered student{o.profiles_missing === 1 ? ' has' : 's have'} not
          created a profile yet — they are excluded from every breakdown above.
        </Note>
      )}
    </div>
  );
};

export default DashboardPanel;
