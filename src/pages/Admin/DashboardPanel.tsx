import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'motion/react';
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
  GroupedBarChart, Heatmap, MultiLineChart, RateChart, StackedBar, colorAt,
} from '@/components/charts';
import { Reveal, Stagger, StaggerItem, MotionCard, AnimatedNumber } from '@/components/motion';
import { SelectField, DateField } from '@/components/ui/select-field';

/* ------------------------------ styles ------------------------------ */

const PANEL_PAD = 18;

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px',
  borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)',
  fontWeight: 550, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
};
const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16,
};
const grid3: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 16,
};

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

/** Decimal places to preserve a number's natural display (capped, for count-up). */
const decimalsOf = (n: number): number => {
  if (Number.isInteger(n)) return 0;
  return Math.min(2, (String(n).split('.')[1] ?? '').length);
};

/* ------------------------------ primitives ------------------------------ */

const Panel: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
  /** Tables read better pinned to the top; charts centre in leftover space. */
  align?: 'center' | 'top';
}> = ({ title, subtitle, action, children, wide, align = 'center' }) => (
  <Reveal style={{ minWidth: 0, gridColumn: wide ? '1 / -1' : undefined, height: '100%' }}>
    {/* height:100% + column flex → side-by-side panels always match heights */}
    <div style={{ ...card, padding: PANEL_PAD, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-display" style={{ margin: 0, fontSize: 15, fontWeight: 500, letterSpacing: '-.01em' }}>{title}</h3>
          {subtitle && <p style={{ ...muted, margin: '4px 0 0', lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: align === 'top' ? 'flex-start' : 'center' }}>
        {children}
      </div>
    </div>
  </Reveal>
);

/**
 * Clean, uniform stat card: a restrained tinted icon at the top, a big tabular
 * number pinned to the bottom, a muted label and an optional hint. Count-up +
 * hover-lift come from the motion primitives; every card stretches to a common
 * height so a row reads as one band.
 */
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: string;
}> = ({ icon: Icon, label, value, hint, tone = 'var(--primary)' }) => (
  <MotionCard style={{ ...card, padding: 16, height: '100%', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
    <span style={{
      width: 34, height: 34, flex: 'none', borderRadius: 10, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone,
    }}>
      <Icon size={18} />
    </span>
    <div style={{ minWidth: 0, marginTop: 'auto' }}>
      <div className="data" style={{ fontSize: 25, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.15 }}>
        {typeof value === 'number' ? <AnimatedNumber value={value} decimals={decimalsOf(value)} /> : value}
      </div>
      <div style={{ ...muted, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 4, lineHeight: 1.45 }}>{hint}</div>}
    </div>
  </MotionCard>
);

const th: React.CSSProperties = {
  padding: '9px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '.04em', whiteSpace: 'nowrap', textAlign: 'left', color: 'var(--text-subtle)',
};
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 12.5, whiteSpace: 'nowrap' };

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div style={{ overflowX: 'auto', margin: `0 -${PANEL_PAD}px -${PANEL_PAD}px`, borderTop: '1px solid var(--border)' }}>
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
  <Reveal>
    <div style={{
      ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 11,
      borderColor: `color-mix(in srgb, ${tone} 40%, var(--border))`,
      background: `color-mix(in srgb, ${tone} 7%, var(--surface))`,
    }}>
      <Icon size={18} style={{ color: tone, flex: 'none' }} />
      <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>{children}</span>
    </div>
  </Reveal>
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
  updatedAt?: string;
  onRefresh?: () => void;
}> = ({ filters, options, onChange, updatedAt, onRefresh }) => {
  const set = (k: keyof DashboardFilters, v: string) => onChange({ ...filters, [k]: v || undefined });
  const activeCount = Object.values(filters).filter(Boolean).length;

  const withAll = (all: string, xs: { value: string; label: string }[]) => [{ value: '', label: all }, ...xs];

  return (
    <div style={{ ...card, padding: '11px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="ledger-label" style={{ flex: 1 }}>Filters</span>
        {activeCount > 0 && (
          <button
            onClick={() => onChange({})}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '3px 6px', borderRadius: 6, transition: 'color .16s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={12} /> Clear {activeCount}
          </button>
        )}
        {updatedAt && (
          <span className="data" style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>
            Updated {new Date(updatedAt).toLocaleTimeString()}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            aria-label="Refresh data"
            title="Refresh"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 'var(--r-ctl)', border: '1px solid var(--border)',
              background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', flex: 'none',
              transition: 'background .16s ease, color .16s ease, transform .16s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'none'; }}
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 9 }}>
        <SelectField aria-label="University" value={filters.university ?? ''} onChange={(v) => set('university', v)}
          options={withAll('All universities', (options?.universities ?? []).map((u) => ({ value: u, label: u })))} />
        <SelectField aria-label="Department" value={filters.department ?? ''} onChange={(v) => set('department', v)}
          options={withAll('All departments', (options?.departments ?? []).map((d) => ({ value: d, label: d })))} />
        <SelectField aria-label="Batch" value={String(filters.batch_year ?? '')} onChange={(v) => set('batch_year', v)}
          options={withAll('All batches', (options?.batches ?? []).map((b) => ({ value: String(b), label: `Batch ${b}` })))} />
        <SelectField aria-label="Course" value={filters.course ?? ''} onChange={(v) => set('course', v)}
          options={withAll('All courses', (options?.courses ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.count})` })))} />
        <SelectField aria-label="Placement type" value={filters.type ?? ''} onChange={(v) => set('type', v)}
          options={withAll('All types', (options?.types ?? []).map((t) => ({ value: t, label: t === 'ppo' ? 'PPO' : t.charAt(0).toUpperCase() + t.slice(1) })))} />
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', gridColumn: 'span 2', minWidth: 0 }}>
          <DateField aria-label="From" title="Offers from" value={filters.from ?? ''} onChange={(v) => set('from', v)} />
          <span style={{ color: 'var(--text-subtle)', flex: 'none', fontSize: 12 }}>→</span>
          <DateField aria-label="To" title="Offers until" value={filters.to ?? ''} onChange={(v) => set('to', v)} />
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
      <FilterBar filters={filters} options={options} onChange={setFilters} updatedAt={data.generated_at} onRefresh={load} />

      {/* section sub-tabs — spread equally across the bar, sliding brass indicator */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        {SECTIONS.map(([s, label, Icon]) => {
          const active = section === s;
          return (
            <button
              key={s}
              onClick={() => setSection(s)}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              style={{
                position: 'relative', flex: 1, minWidth: 130, display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', gap: 7, padding: '11px 8px', border: 'none', cursor: 'pointer',
                background: active ? 'var(--surface-2)' : 'transparent', borderRadius: '9px 9px 0 0',
                fontWeight: active ? 650 : 550, fontSize: 13.5, marginBottom: -1,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                transition: 'color .18s ease, background .18s ease',
              }}
            >
              <Icon size={16} /> {label}
              {active && (
                <motion.span
                  layoutId="admin-subtab"
                  style={{ position: 'absolute', left: 12, right: 12, bottom: -1, height: 2, borderRadius: 2, background: 'var(--brass)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ============================= OVERVIEW ============================= */}
      {section === 'overview' && (
        <>
          <Stagger className="kp-statgrid">
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={Users} label="Seeking placement" value={o.seeking_placement}
                hint={`${o.opted_out} opted out of ${o.profiles_completed} profiles`} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={Award} label="Students placed" value={o.students_placed} tone="#22c55e"
                hint={`${o.placement_rate}% of those seeking`} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={IndianRupee} label="Median package"
                value={o.median_ctc_lpa !== null
                  ? <AnimatedNumber value={o.median_ctc_lpa} decimals={decimalsOf(o.median_ctc_lpa)} suffix=" LPA" />
                  : '—'} tone="#22c55e"
                hint={o.avg_ctc_lpa !== null ? `Mean ${o.avg_ctc_lpa} · high ${o.highest_ctc_lpa}` : 'No packages recorded'} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={Clock} label="Currently interning" value={o.students_interning} tone="#f59e0b"
                hint={o.median_stipend ? `Median ₹${o.median_stipend.toLocaleString('en-IN')}/mo` : undefined} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={FileText} label="Applications" value={o.total_applications} tone="#a855f7"
                hint={`${data.applications.shortlisted} shortlisted`} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={Briefcase} label="Open positions" value={o.openings_open} tone="#06b6d4"
                hint={`${o.openings_closed} closed`} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={Building2} label="Active recruiters" value={o.recruiters_active} tone="#ec4899"
                hint={o.recruiters_pending ? `${o.recruiters_pending} awaiting approval` : undefined} />
            </StaggerItem>
            <StaggerItem style={{ height: '100%' }}>
              <StatCard icon={Lock} label="Offer policy"
                value={data.policy.one_offer_lock ? 'Locked' : 'Open'} tone="var(--brass)"
                hint={data.policy.one_offer_lock
                  ? data.policy.allow_upgrade_to_higher_tier ? `Upgrades above ${data.policy.dream_ctc_threshold} LPA` : 'One offer only'
                  : 'Students may hold multiple offers'} />
            </StaggerItem>
          </Stagger>

          <Note tone="var(--primary)" icon={Target}>
            Placement rate: <strong>{o.placement_rate}%</strong> of {o.seeking_placement} seeking,{' '}
            <strong>{o.placement_rate_all}%</strong> of all {o.total_students} enrolled. Report the first.
          </Note>

          <Reveal style={{ minWidth: 0 }}>
            <div style={{ ...card, padding: PANEL_PAD }}>
              <h3 className="font-display" style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 500, letterSpacing: '-.01em' }}>Final year — batch of {fy.batch}</h3>
              <p style={{ ...muted, margin: '0 0 16px' }}>
                {fy.enrolled} enrolled · {fy.opted_out} not seeking placement · {fy.total} in the pool.
              </p>
              {fy.total === 0 ? (
                <p style={{ ...muted, padding: '20px 0', textAlign: 'center' }}>
                  No {fy.batch} students yet — set batch year on profiles.
                </p>
              ) : (
                <div className="kp-ledger" style={{ gridTemplateColumns: '1fr 1.15fr 1.35fr', alignItems: 'stretch' }}>
                  <div style={{ paddingRight: 22, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                    <span className="ledger-label" style={{ display: 'block' }}>Placement rate</span>
                    <div title={`${fy.placed} of ${fy.total} seeking placed (${fy.rate}%) — batch of ${fy.batch}`} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Gauge value={fy.rate} label="placed" size={172} />
                    </div>
                    {/* Mini graph: how this batch compares to the others */}
                    {data.trends.yoy.length > 1 && (
                      <div>
                        <span style={{ ...muted, fontSize: 11.5, fontWeight: 600, display: 'block', marginBottom: 7 }}>Rate by batch</span>
                        {data.trends.yoy.map((y) => {
                          const current = y.batch === fy.batch;
                          return (
                            <div
                              key={y.batch}
                              title={`Batch ${y.batch}: ${y.placed} of ${y.total} placed (${y.rate}%)`}
                              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 4px', borderRadius: 5, transition: 'background .15s ease' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span className="data" style={{ width: 34, flex: 'none', fontSize: 11.5, fontWeight: current ? 700 : 500, color: current ? 'var(--text)' : 'var(--text-muted)' }}>
                                {y.batch}
                              </span>
                              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                                <div className="kp-grow-x" style={{ width: `${y.rate}%`, height: '100%', borderRadius: 999, background: current ? '#22c55e' : 'color-mix(in srgb, #22c55e 42%, transparent)' }} />
                              </div>
                              <span className="data" style={{ width: 44, flex: 'none', textAlign: 'right', fontSize: 11.5, fontWeight: current ? 650 : 400, color: current ? 'var(--text)' : 'var(--text-muted)' }}>
                                {y.rate}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Supporting figures — enrolled/not-seeking already live in the header line */}
                    <div>
                      {[
                        { k: 'Placed', v: fy.placed, c: '#22c55e' },
                        { k: 'Remaining', v: fy.remaining, c: 'var(--text-subtle)' },
                      ].map((r) => (
                        <div
                          key={r.k}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7.5px 6px', borderTop: '1px solid var(--border)', fontSize: 12.5, borderRadius: 5, transition: 'background .15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                            {r.c && <span style={{ width: 8, height: 8, borderRadius: 2, background: r.c }} />}
                            {r.k}
                          </span>
                          <span className="data" style={{ fontWeight: 600 }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ paddingLeft: 22, paddingRight: 22, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                    <span className="ledger-label" style={{ display: 'block' }}>Outcome mix</span>
                    <DonutChart data={data.distribution.outcome_composition} emptyLabel="No intent recorded." size={196} stacked centerLabel="students" />
                    <div>
                      <span style={{ ...muted, fontSize: 11.5, fontWeight: 600, display: 'block', marginBottom: 7 }}>
                        Of the {o.seeking_placement} seeking placement
                      </span>
                      <StackedBar
                        showLegend={false}
                        data={[{
                          key: `${o.placement_rate}% placed`,
                          parts: [
                            { label: 'Placed', value: o.students_placed, color: '#22c55e' },
                            { label: 'Still seeking', value: Math.max(o.seeking_placement - o.students_placed, 0), color: 'var(--text-subtle)' },
                          ],
                        }]}
                        emptyLabel="No students seeking placement."
                      />
                    </div>
                  </div>
                  <div style={{ paddingLeft: 22, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span className="ledger-label" style={{ display: 'block', marginBottom: 16 }}>Placed vs remaining · department</span>
                    <StackedBar
                      fill
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
          </Reveal>

          <div style={grid2}>
            <Panel title="Season pacing" subtitle="Cumulative offers by month, per session.">
              <MultiLineChart
                labels={data.trends.pacing.months}
                series={data.trends.pacing.series.map((s) => ({ label: s.label, values: s.values }))}
                emptyLabel="Needs a full session of offer dates."
              />
            </Panel>

            <Panel title="Year on year" subtitle="Rate and median package by batch.">
              {data.trends.yoy.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No batch data yet.</p>
              ) : (
                <Table headers={['Batch', 'Seeking', 'Placed', 'Rate', 'Median CTC']}>
                  {data.trends.yoy.map((y) => (
                    <tr
                      key={y.batch}
                      title={`Batch ${y.batch}: ${y.placed} of ${y.total} placed (${y.rate}%)${y.median_ctc !== null ? ` · median ${y.median_ctc} LPA` : ''}`}
                      style={{ borderTop: '1px solid var(--border)', transition: 'background .15s ease', cursor: 'default' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...td, fontWeight: 700 }} className="data">{y.batch}</td>
                      <td style={td} className="data">{y.total}</td>
                      <td style={{ ...td, color: '#22c55e', fontWeight: 600 }} className="data">{y.placed}</td>
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 48, height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                            <span style={{ display: 'block', width: `${y.rate}%`, height: '100%', background: '#22c55e' }} />
                          </span>
                          <span className="data">{y.rate}%</span>
                        </span>
                      </td>
                      <td style={td} className="data">{y.median_ctc !== null ? `${y.median_ctc} LPA` : '—'}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>
          </div>

          <Panel title="Placement rate — department × batch" subtitle="Darker is better." wide>
            <Heatmap
              departments={data.placements.heatmap.departments}
              batches={data.placements.heatmap.batches}
              cells={data.placements.heatmap.cells}
              emptyLabel="Needs department and batch year on profiles."
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
              emptyLabel="No departments set yet."
            />
          </Panel>

          {/* Round charts share a row; column charts share a row — equal heights per band. */}
          <div style={grid3}>
            <Panel title="By university" subtitle="Where students are enrolled.">
              <DonutChart data={data.distribution.by_university} size={128} centerLabel="students" emptyLabel="No students yet." />
            </Panel>
            <Panel title="By gender" subtitle="Required for NIRF / NBA reporting.">
              <DonutChart data={data.distribution.by_gender} size={128} emptyLabel="Gender not recorded on user accounts." centerLabel="students" />
            </Panel>
            <Panel title="Looking for" subtitle="What students are seeking.">
              <DonutChart data={data.distribution.by_looking_for} size={128} emptyLabel="No preferences set yet." centerLabel="students" />
            </Panel>
          </div>

          <div style={grid2}>
            <Panel title="Outcome composition" subtitle="What the batch is doing.">
              <DonutChart data={data.distribution.outcome_composition} emptyLabel="No intent recorded." centerLabel="students" />
            </Panel>
            <Panel title="By course" subtitle="Student headcount per programme.">
              <DonutChart data={data.distribution.by_course} size={158} centerLabel="students" emptyLabel="No courses set yet." />
            </Panel>
          </div>

          <div style={grid2}>
            <Panel title="By department" subtitle="Student headcount per department.">
              <BarChart data={data.distribution.by_department} colorize emptyLabel="No departments set yet." />
            </Panel>
            <Panel title="By batch" subtitle="Expected graduation year.">
              <BarChart data={data.distribution.by_batch} emptyLabel="No batch years set yet." />
            </Panel>
          </div>

          <div style={grid2}>
            <Panel title="CGPA distribution" subtitle="Academic spread across the cohort.">
              <BarChart data={data.distribution.by_cgpa} colorize emptyLabel="No CGPA recorded yet." />
            </Panel>
            <Panel title="Does CGPA predict placement?" subtitle="Placement rate per CGPA band.">
              <RateChart data={data.placements.cgpa_vs_placement} emptyLabel="Needs CGPA and recorded placements." />
            </Panel>
          </div>
        </>
      )}

      {/* ============================= PIPELINE ============================= */}
      {section === 'pipeline' && (
        <>
          <div data-kp-split style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Hiring pipeline" subtitle="How applications travel from applied to accepted.">
              <FunnelChart data={data.applications.funnel} emptyLabel="No applications yet." />
            </Panel>

            <Panel title="Round-wise attrition" subtitle="Each round split into cleared, failed, and awaiting result.">
              {roundDropoff.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>
                  No round data yet — define rounds on an opening.
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
          </div>

          <div data-kp-split style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Application volume" subtitle="Applications students submitted each month.">
              <AreaChart data={data.applications.trend} emptyLabel="Needs at least two months of applications." />
            </Panel>

            <Panel title="Offers over time" subtitle="Placements confirmed each month.">
              <AreaChart data={data.placements.trend} color="#22c55e" emptyLabel="Needs at least two months of placements." />
            </Panel>
          </div>

          {/* Money band: the two distributions + outcome kind share a row */}
          <div style={grid3}>
            <Panel title="Salary distribution" subtitle="What students actually get paid.">
              <BoxPlot stats={data.placements.ctc_box} emptyLabel="No packages recorded yet." unit="LPA" />
            </Panel>
            <Panel title="Internship stipends" subtitle="Same view for monthly stipends.">
              <BoxPlot stats={data.placements.stipend_box} emptyLabel="No stipends recorded yet." unit="₹/mo" color="#f59e0b" />
            </Panel>
            <Panel title="Placement type" subtitle="Jobs, internships, and pre-placement offers.">
              <DonutChart data={data.placements.by_type.map((s) => (s.key === 'ppo' ? { ...s, key: 'PPO' } : s))} size={128} emptyLabel="No placements recorded yet." centerLabel="placements" />
            </Panel>
          </div>

          {/* Column-chart band */}
          <div style={grid3}>
            <Panel title="Salary bands" subtitle="How offers cluster by package (LPA).">
              <BarChart data={data.placements.ctc_bands} colorize emptyLabel="No packages recorded yet." />
            </Panel>
            <Panel title="Offers per student" subtitle="Offers concentrated per student.">
              <BarChart data={data.placements.offers_per_student} colorize emptyLabel="No placements recorded yet." />
            </Panel>
            <Panel title="Applications per student" subtitle="Fewer than 3 applications = at risk.">
              <BarChart data={data.applications.per_student} emptyLabel="No applications yet." />
            </Panel>
          </div>
        </>
      )}

      {/* ============================ COMPANIES ============================ */}
      {section === 'companies' && (
        <>
          <div data-kp-split style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Outreach funnel" subtitle={`Session ${data.session} — where engagement leaks.`}>
              <FunnelChart data={data.companies.invitation_funnel} emptyLabel="No companies tracked this session yet." />
              {data.companies.declined > 0 && (
                <p style={{ ...muted, marginTop: 10 }}>{data.companies.declined} declined outright.</p>
              )}
            </Panel>

            <Panel title="Repeat vs new recruiters" subtitle="Losing repeat recruiters is a warning.">
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
                  fill
                />
              )}
            </Panel>
          </div>

          <div data-kp-split style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Sector diversification" subtitle="One-sector concentration is a risk.">
              <DonutChart data={data.placements.sectors} size={224} stacked centerLabel="placements" emptyLabel="No sector recorded on placements yet." />
            </Panel>

            <Panel title="Offer locations" subtitle="Where students are being placed.">
              <BarList data={data.placements.locations} max={10} colorize emptyLabel="No locations recorded yet." />
            </Panel>
          </div>

          <div style={grid2}>
            <Panel title="Top recruiters" subtitle="Companies by hires made." align="top">
              {data.placements.top_companies.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No placements recorded yet.</p>
              ) : (
                <Table headers={['Company', 'Hires', 'Avg CTC', 'Max CTC']}>
                  {data.placements.top_companies.map((c) => (
                    <tr
                      key={c.key}
                      title={`${c.key}: ${c.count} hires${c.avg_ctc ? ` · average ${c.avg_ctc.toFixed(1)} LPA` : ''}${c.max_ctc ? ` · best ${c.max_ctc} LPA` : ''}`}
                      style={{ borderTop: '1px solid var(--border)', transition: 'background .15s ease', cursor: 'default' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...td, fontWeight: 600 }}>{c.key}</td>
                      <td style={td} className="data">{c.count}</td>
                      <td style={td} className="data">{c.avg_ctc ? `${c.avg_ctc.toFixed(1)} LPA` : '—'}</td>
                      <td style={td} className="data">{c.max_ctc ? `${c.max_ctc} LPA` : '—'}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>

            <Panel title="Internship destinations" subtitle="Where students started internships." align="top">
              {data.placements.internship_destinations.length === 0 ? (
                <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>No internships recorded yet.</p>
              ) : (
                <>
                <Table headers={['Company', 'Location', 'Students']}>
                  {data.placements.internship_destinations.map((d, i) => (
                    <tr
                      key={`${d.company}-${i}`}
                      title={`${d.count} student${d.count === 1 ? '' : 's'} interning at ${d.company}${d.location ? ` in ${d.location}` : ''}`}
                      style={{ borderTop: '1px solid var(--border)', transition: 'background .15s ease', cursor: 'default' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...td, fontWeight: 600 }}>{d.company}</td>
                      <td style={{ ...td, color: 'var(--text-muted)' }}>
                        {d.location ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={12} /> {d.location}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={td} className="data">{d.count}</td>
                    </tr>
                  ))}
                </Table>
                {/* One quiet roll-up line anchors the panel bottom */}
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px dashed var(--border)', display: 'flex', flexWrap: 'wrap', gap: '5px 18px', ...muted, fontSize: 12 }}>
                  {(() => {
                    const byCity = new Map<string, number>();
                    data.placements.internship_destinations.forEach((d) => {
                      const city = d.location || 'Not specified';
                      byCity.set(city, (byCity.get(city) ?? 0) + d.count);
                    });
                    return [...byCity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, n]) => (
                      <span key={city}>
                        <strong className="data" style={{ color: 'var(--text)' }}>{n}</strong> in {city}
                      </span>
                    ));
                  })()}
                </div>
                </>
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
                  <tr
                    key={p._id}
                    style={{ borderTop: '1px solid var(--border)', transition: 'background .15s ease', cursor: 'default' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...td, fontWeight: 600, textTransform: 'capitalize' }}>{p.student_name || '—'}</td>
                    <td style={td}>{p.company}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{p.role}</td>
                    <td style={td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                      }}>{p.type}</span>
                    </td>
                    <td style={td} className="data">{p.ctc_lpa ? `${p.ctc_lpa} LPA` : p.stipend ? `₹${p.stipend.toLocaleString('en-IN')}/mo` : '—'}</td>
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
            <Stagger className="kp-statgrid">
              <StaggerItem style={{ height: '100%' }}>
                <StatCard icon={Target} label="Avg aptitude score" value={rd.avg_aptitude ?? '—'} tone="#4f7cff"
                  hint={`${rd.with_aptitude} of ${rd.total} tested`} />
              </StaggerItem>
              <StaggerItem style={{ height: '100%' }}>
                <StatCard icon={Users} label="Avg mock interview" value={rd.avg_mock_score ?? '—'} tone="#a855f7"
                  hint={`${rd.mock_attended} attended at least one`} />
              </StaggerItem>
              <StaggerItem style={{ height: '100%' }}>
                <StatCard icon={TrendingUp} label="Training attendance"
                  value={rd.avg_attendance !== null
                    ? <AnimatedNumber value={rd.avg_attendance} decimals={decimalsOf(rd.avg_attendance)} suffix="%" />
                    : '—'} tone="#f59e0b" />
              </StaggerItem>
              <StaggerItem style={{ height: '100%' }}>
                <StatCard icon={FileText} label="Resumes verified" value={rd.resume_verified} tone="#22c55e"
                  hint={`of ${rd.total} profiles`} />
              </StaggerItem>
            </Stagger>
          )}

          <Panel title="Skill gap" subtitle="Skills open roles ask for — and how many students actually list them." wide>
            {data.distribution.skill_gap.length === 0 ? (
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>
                No open roles list required skills yet.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', ...muted, fontSize: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} /> No student lists it — train here
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> Students have it
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: '2px 28px' }}>
                  {[...data.distribution.skill_gap]
                    .sort((a, b) => ((a.supply === 0 ? 0 : 1) - (b.supply === 0 ? 0 : 1)) || b.demand - a.demand)
                    .map((s) => {
                      const missing = s.supply === 0;
                      return (
                        <div
                          key={s.key}
                          title={`${s.demand} open role${s.demand === 1 ? '' : 's'} ask for ${s.key}; ${s.supply} student${s.supply === 1 ? '' : 's'} list it.`}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 9px', borderRadius: 7, borderBottom: '1px solid var(--border)', transition: 'background .14s ease', cursor: 'default' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', background: missing ? 'var(--danger)' : '#22c55e' }} />
                          <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 13, overflowWrap: 'anywhere' }}>{s.key}</span>
                          <span className="data" style={{ flex: 'none', fontSize: 12, color: 'var(--text-muted)' }}>
                            {s.demand} role{s.demand === 1 ? '' : 's'}
                          </span>
                          <span className="data" style={{ flex: 'none', minWidth: 88, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: missing ? 'var(--danger)' : '#22c55e' }}>
                            {missing ? 'no students' : `${s.supply} student${s.supply === 1 ? '' : 's'}`}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </Panel>

          <Panel
            title={`At-risk students — batch of ${fy.batch}`}
            subtitle="Unplaced and seeking, ordered by risk."
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
              <p style={{ ...muted, padding: '24px 0', textAlign: 'center' }}>Everyone seeking in this batch is placed.</p>
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
                        <span className="data">{n}</span> {band} risk
                      </span>
                    );
                  })}
                </div>

                <Table headers={['Risk', 'AUID', 'Name', 'Department', 'CGPA', 'Backlogs', 'Applied', 'Aptitude', 'Mocks', 'Email']}>
                  {unplaced.map((s) => {
                    const tone = s.risk_band === 'high' ? 'var(--danger)' : s.risk_band === 'medium' ? '#f59e0b' : 'var(--text-muted)';
                    return (
                      <tr
                        key={s._id}
                        title={`${s.name}: CGPA ${s.cgpa ?? '—'} · ${s.backlogs} backlog${s.backlogs === 1 ? '' : 's'} · ${s.applications} application${s.applications === 1 ? '' : 's'} · ${s.mock_interviews} mock${s.mock_interviews === 1 ? '' : 's'}`}
                        style={{ borderTop: '1px solid var(--border)', transition: 'background .15s ease', cursor: 'default' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={td}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone,
                            border: `1px solid color-mix(in srgb, ${tone} 32%, transparent)`,
                          }}>{s.risk_band}</span>
                        </td>
                        <td style={{ ...td, color: 'var(--text-muted)' }} className="data">{s.auid ?? '—'}</td>
                        <td style={{ ...td, fontWeight: 600, textTransform: 'capitalize' }}>{s.name}</td>
                        <td style={td}>{s.department ?? '—'}</td>
                        <td style={td} className="data">{s.cgpa ?? '—'}</td>
                        <td style={{ ...td, color: s.backlogs > 0 ? 'var(--danger)' : undefined }} className="data">{s.backlogs}</td>
                        <td style={{ ...td, color: s.applications === 0 ? 'var(--danger)' : undefined, fontWeight: s.applications === 0 ? 700 : 400 }} className="data">
                          {s.applications}
                        </td>
                        <td style={td} className="data">{s.aptitude_score ?? '—'}</td>
                        <td style={td} className="data">{s.mock_interviews}</td>
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
                  <span
                    key={s.key}
                    title={`${s.count} students list ${s.key}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px',
                      borderRadius: 999, fontSize: 12.5, fontWeight: 550, cursor: 'default',
                      background: `color-mix(in srgb, ${colorAt(i)} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${colorAt(i)} 30%, transparent)`,
                      transition: 'transform .15s ease, background .15s ease, box-shadow .15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.background = `color-mix(in srgb, ${colorAt(i)} 20%, transparent)`;
                      e.currentTarget.style.boxShadow = 'var(--shadow)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.background = `color-mix(in srgb, ${colorAt(i)} 12%, transparent)`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {s.key}<span className="data" style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>{s.count}</span>
                  </span>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {o.profiles_missing > 0 && (
        <Note icon={GraduationCap}>
          <strong>{o.profiles_missing}</strong> student{o.profiles_missing === 1 ? '' : 's'} without a profile — excluded from breakdowns.
        </Note>
      )}
    </div>
  );
};

export default DashboardPanel;
