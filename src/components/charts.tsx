import React, { useId, useState } from 'react';

/**
 * Dependency-free SVG chart kit.
 *
 * Every chart is pure SVG so it inherits theme variables, scales with the
 * container, and adds no bundle weight. Charts share one palette so a series
 * keeps its colour wherever it appears on the page.
 */

export const PALETTE = [
  '#4f7cff', '#22c55e', '#f59e0b', '#a855f7', '#ec4899',
  '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#14b8a6',
];
export const colorAt = (i: number) => PALETTE[i % PALETTE.length];

export interface Slice {
  key: string;
  count: number;
}

const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };

export const ChartEmpty: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '34px 12px', color: 'var(--text-subtle)', fontSize: 12.5, textAlign: 'center',
  }}>
    {label}
  </div>
);

/** Shared legend for pie/donut. */
const Legend: React.FC<{
  rows: Slice[];
  total: number;
  active: number | null;
  onHover: (i: number | null) => void;
}> = ({ rows, total, active, onHover }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 132 }}>
    {rows.map((r, i) => (
      <div
        key={r.key}
        onMouseEnter={() => onHover(i)}
        onMouseLeave={() => onHover(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5,
          padding: '3px 6px', borderRadius: 6, cursor: 'default',
          background: active === i ? 'var(--surface-2)' : 'transparent',
          transition: 'background .15s',
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 3, background: colorAt(i), flex: 'none' }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
          {r.key}
        </span>
        <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', flex: 'none' }}>
          {r.count} · {total ? Math.round((r.count / total) * 100) : 0}%
        </span>
      </div>
    ))}
  </div>
);

/* ------------------------------- Pie ------------------------------- */

/** Classic filled pie. Slices lift slightly on hover. */
export const PieChart: React.FC<{ data: Slice[]; emptyLabel: string; size?: number }> = ({
  data, emptyLabel, size = 150,
}) => {
  const [active, setActive] = useState<number | null>(null);
  const rows = data.filter((d) => d.count > 0);
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (!total) return <ChartEmpty label={emptyLabel} />;

  const R = size / 2 - 6;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;

  // A single 100% slice can't be drawn as an arc — render it as a full circle.
  const single = rows.length === 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none', overflow: 'visible' }} role="img" aria-label="Pie chart">
        {single ? (
          <circle cx={cx} cy={cy} r={R} fill={colorAt(0)} />
        ) : (
          rows.map((r, i) => {
            const frac = r.count / total;
            const sweep = frac * Math.PI * 2;
            const a0 = angle;
            const a1 = angle + sweep;
            angle = a1;

            // Nudge the slice outward along its bisector when hovered.
            const mid = (a0 + a1) / 2;
            const lift = active === i ? 5 : 0;
            const ox = Math.cos(mid) * lift;
            const oy = Math.sin(mid) * lift;

            const x0 = cx + Math.cos(a0) * R, y0 = cy + Math.sin(a0) * R;
            const x1 = cx + Math.cos(a1) * R, y1 = cy + Math.sin(a1) * R;
            const large = sweep > Math.PI ? 1 : 0;

            return (
              <path
                key={r.key}
                d={`M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`}
                fill={colorAt(i)}
                stroke="var(--surface)"
                strokeWidth={1.5}
                transform={`translate(${ox.toFixed(2)},${oy.toFixed(2)})`}
                style={{ transition: 'transform .18s ease' }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${r.key}: ${r.count} (${Math.round(frac * 100)}%)`}</title>
              </path>
            );
          })
        )}
      </svg>
      <Legend rows={rows} total={total} active={active} onHover={setActive} />
    </div>
  );
};

/* ------------------------------ Donut ------------------------------ */

/** Ring chart with a live centre readout. */
export const DonutChart: React.FC<{
  data: Slice[];
  emptyLabel: string;
  size?: number;
  centerLabel?: string;
}> = ({ data, emptyLabel, size = 150, centerLabel = 'total' }) => {
  const [active, setActive] = useState<number | null>(null);
  const rows = data.filter((d) => d.count > 0);
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (!total) return <ChartEmpty label={emptyLabel} />;

  const STROKE = size * 0.15;
  const R = size / 2 - STROKE / 2 - 3;
  const C = 2 * Math.PI * R;
  let offset = 0;

  const shown = active !== null ? rows[active] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }} role="img" aria-label="Donut chart">
        <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
          {rows.map((r, i) => {
            const dash = (r.count / total) * C;
            const seg = (
              <circle
                key={r.key}
                r={R} fill="none"
                stroke={colorAt(i)}
                strokeWidth={active === i ? STROKE + 4 : STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-width .15s ease' }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${r.key}: ${r.count}`}</title>
              </circle>
            );
            offset += dash;
            return seg;
          })}
        </g>
        <text x={size / 2} y={size / 2 - 3} textAnchor="middle" style={{ fontSize: size * 0.16, fontWeight: 700, fill: 'var(--text)' }}>
          {shown ? shown.count : total}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" style={{ fontSize: size * 0.075, fill: 'var(--text-muted)' }}>
          {shown ? shown.key : centerLabel}
        </text>
      </svg>
      <Legend rows={rows} total={total} active={active} onHover={setActive} />
    </div>
  );
};

/* --------------------------- Vertical bars --------------------------- */

/** Column chart with value labels and an axis baseline. */
export const BarChart: React.FC<{
  data: Slice[];
  emptyLabel: string;
  height?: number;
  colorize?: boolean;
}> = ({ data, emptyLabel, height = 170, colorize }) => {
  const rows = data.filter((d) => d.count > 0 || data.every((x) => x.count === 0));
  if (!data.some((d) => d.count > 0)) return <ChartEmpty label={emptyLabel} />;

  const peak = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10, height,
        minWidth: Math.max(rows.length * 46, 200), padding: '18px 0 0',
        borderBottom: '1px solid var(--border)',
      }}>
        {rows.map((r, i) => {
          const h = (r.count / peak) * 100;
          return (
            <div key={r.key} style={{ flex: 1, minWidth: 34, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }} title={`${r.key}: ${r.count}`}>
              <span style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
                {r.count}
              </span>
              <div style={{
                height: `${Math.max(h, r.count > 0 ? 3 : 0)}%`,
                borderRadius: '6px 6px 0 0',
                background: colorize
                  ? `linear-gradient(180deg, ${colorAt(i)}, color-mix(in srgb, ${colorAt(i)} 62%, transparent))`
                  : 'linear-gradient(180deg, var(--primary), color-mix(in srgb, var(--primary) 55%, transparent))',
                transition: 'height .4s ease',
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, minWidth: Math.max(rows.length * 46, 200), marginTop: 7 }}>
        {rows.map((r) => (
          <span key={r.key} style={{
            flex: 1, minWidth: 34, fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize',
          }} title={r.key}>
            {r.key}
          </span>
        ))}
      </div>
    </div>
  );
};

/* --------------------------- Grouped bars --------------------------- */

export interface GroupedRow {
  key: string;
  [series: string]: string | number;
}

/**
 * Side-by-side bars per category — e.g. placed vs unplaced per department.
 * `series` names the numeric keys to plot and their colours.
 */
export const GroupedBarChart: React.FC<{
  data: GroupedRow[];
  series: { key: string; label: string; color: string }[];
  emptyLabel: string;
  height?: number;
}> = ({ data, series, emptyLabel, height = 190 }) => {
  if (!data.length) return <ChartEmpty label={emptyLabel} />;
  const peak = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)));

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...muted }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 16, height,
          minWidth: Math.max(data.length * 68, 240), borderBottom: '1px solid var(--border)', paddingTop: 16,
        }}>
          {data.map((row) => (
            <div key={row.key} style={{ flex: 1, minWidth: 52, height: '100%', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              {series.map((s) => {
                const v = Number(row[s.key]) || 0;
                return (
                  <div key={s.key} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                    title={`${row.key} · ${s.label}: ${v}`}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, textAlign: 'center', marginBottom: 3, color: 'var(--text-muted)' }}>
                      {v || ''}
                    </span>
                    <div style={{
                      height: `${Math.max((v / peak) * 100, v > 0 ? 3 : 0)}%`,
                      borderRadius: '5px 5px 0 0', background: s.color, transition: 'height .4s ease',
                    }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, minWidth: Math.max(data.length * 68, 240), marginTop: 7 }}>
          {data.map((row) => (
            <span key={row.key} style={{
              flex: 1, minWidth: 52, fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={row.key}>
              {row.key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* --------------------------- Stacked bars --------------------------- */

/** 100%-stacked rows — good for comparing composition across categories. */
export const StackedBar: React.FC<{
  data: { key: string; parts: { label: string; value: number; color: string }[] }[];
  emptyLabel: string;
}> = ({ data, emptyLabel }) => {
  if (!data.length) return <ChartEmpty label={emptyLabel} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((row) => {
        const total = row.parts.reduce((n, p) => n + p.value, 0);
        return (
          <div key={row.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
              <span style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.key}</span>
              <span style={{ color: 'var(--text-muted)', flex: 'none' }}>{total}</span>
            </div>
            <div style={{ display: 'flex', height: 16, borderRadius: 5, overflow: 'hidden', background: 'var(--surface-2)' }}>
              {row.parts.map((p) => (
                p.value > 0 && (
                  <div
                    key={p.label}
                    style={{ width: `${(p.value / (total || 1)) * 100}%`, background: p.color, transition: 'width .4s ease' }}
                    title={`${p.label}: ${p.value}`}
                  />
                )
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* --------------------------- Horizontal bars --------------------------- */

export const BarList: React.FC<{
  data: Slice[];
  emptyLabel: string;
  max?: number;
  colorize?: boolean;
}> = ({ data, emptyLabel, max, colorize }) => {
  const rows = max ? data.slice(0, max) : data;
  if (!rows.length) return <ChartEmpty label={emptyLabel} />;
  const peak = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((n, r) => n + r.count, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {rows.map((r, i) => (
        <div key={r.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 5, fontSize: 12.5 }}>
            <span style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
              {r.key}
            </span>
            <span style={{ color: 'var(--text-muted)', flex: 'none', fontVariantNumeric: 'tabular-nums' }}>
              {r.count}
              {total > 0 && <span style={{ color: 'var(--text-subtle)' }}> · {Math.round((r.count / total) * 100)}%</span>}
            </span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{
              width: `${(r.count / peak) * 100}%`, height: '100%', borderRadius: 999,
              background: colorize ? colorAt(i) : 'var(--primary)', transition: 'width .35s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------ Area/line ------------------------------ */

/** Smooth area chart for time series. Falls back gracefully under 2 points. */
export const AreaChart: React.FC<{
  data: Slice[];
  emptyLabel: string;
  color?: string;
  height?: number;
}> = ({ data, emptyLabel, color = 'var(--primary)', height = 140 }) => {
  const gid = useId().replace(/:/g, '');
  if (data.length < 2) return <ChartEmpty label={emptyLabel} />;

  const W = 560, H = height, PAD = 8;
  const peak = Math.max(1, ...data.map((d) => d.count));
  const stepX = (W - PAD * 2) / (data.length - 1);
  const pts = data.map((d, i) => [PAD + i * stepX, H - PAD - (d.count / peak) * (H - PAD * 2 - 12)] as const);

  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD} L${pts[0][0].toFixed(1)},${H - PAD} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.34" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal guides */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
            stroke="var(--border)" strokeWidth={1} strokeDasharray="3 5" />
        ))}
        <path d={area} fill={`url(#g-${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.8} fill={color}>
            <title>{`${data[i].key}: ${data[i].count}`}</title>
          </circle>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...muted, marginTop: 2 }}>
        <span>{data[0].key}</span>
        <span>peak {peak}</span>
        <span>{data[data.length - 1].key}</span>
      </div>
    </div>
  );
};

/* ------------------------------- Gauge ------------------------------- */

/** Radial progress arc — one headline percentage. */
export const Gauge: React.FC<{
  value: number; // 0–100
  label: string;
  sublabel?: string;
  size?: number;
  color?: string;
}> = ({ value, label, sublabel, size = 168, color = '#22c55e' }) => {
  const R = size / 2 - 14;
  const C = Math.PI * R; // semicircle
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * C;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} role="img" aria-label={`${label}: ${pct}%`}>
        <g transform={`translate(${size / 2},${size / 2 - 8}) rotate(180)`}>
          <circle r={R} fill="none" stroke="var(--surface-2)" strokeWidth={13}
            strokeDasharray={`${C} ${C * 2}`} strokeLinecap="round" />
          <circle r={R} fill="none" stroke={color} strokeWidth={13}
            strokeDasharray={`${dash} ${C * 2}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray .5s ease' }} />
        </g>
        <text x={size / 2} y={size / 2 - 14} textAnchor="middle" style={{ fontSize: 27, fontWeight: 700, fill: 'var(--text)' }}>
          {pct}%
        </text>
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--text-muted)' }}>
          {label}
        </text>
      </svg>
      {sublabel && <span style={{ ...muted, marginTop: 2, textAlign: 'center' }}>{sublabel}</span>}
    </div>
  );
};

/* ------------------------------- Funnel ------------------------------- */

export const FunnelChart: React.FC<{ data: Slice[]; emptyLabel: string }> = ({ data, emptyLabel }) => {
  const rows = data.filter((d) => d.key !== 'rejected');
  const rejected = data.find((d) => d.key === 'rejected');
  if (!data.some((d) => d.count > 0)) return <ChartEmpty label={emptyLabel} />;

  const peak = Math.max(1, ...rows.map((r) => r.count));
  const first = rows[0]?.count ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 80, flex: 'none', fontSize: 12.5, fontWeight: 550, textTransform: 'capitalize' }}>{r.key}</span>
          <div style={{ flex: 1, height: 26, borderRadius: 6, background: 'var(--surface-2)', overflow: 'hidden', minWidth: 0 }}>
            <div style={{
              width: `${Math.max((r.count / peak) * 100, r.count > 0 ? 4 : 0)}%`,
              height: '100%', borderRadius: 6, transition: 'width .4s ease',
              background: `linear-gradient(90deg, ${colorAt(i)}, color-mix(in srgb, ${colorAt(i)} 55%, transparent))`,
            }} />
          </div>
          <span style={{ width: 38, flex: 'none', textAlign: 'right', fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {r.count}
          </span>
          <span style={{ width: 42, flex: 'none', textAlign: 'right', fontSize: 11, color: 'var(--text-subtle)' }}>
            {first ? `${Math.round((r.count / first) * 100)}%` : '—'}
          </span>
        </div>
      ))}
      {!!rejected?.count && (
        <div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px dashed var(--border)', ...muted }}>
          {rejected.count} rejected
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Box plot ------------------------------ */

export interface BoxStats {
  min: number; q1: number; median: number; q3: number; max: number;
  whisker_low: number; whisker_high: number; outliers: number[];
  mean: number; n: number;
}

/**
 * Five-number summary. The median matters far more than the mean for salary —
 * one outsized offer drags the average above what most students actually got,
 * and the outlier dots make that visible instead of hiding it.
 */
export const BoxPlot: React.FC<{
  stats: BoxStats | null;
  emptyLabel: string;
  unit?: string;
  color?: string;
}> = ({ stats, emptyLabel, unit = 'LPA', color = '#22c55e' }) => {
  if (!stats || !stats.n) return <ChartEmpty label={emptyLabel} />;

  const W = 520, H = 118, PAD = 34;
  const lo = Math.min(stats.whisker_low, ...(stats.outliers.length ? stats.outliers : [stats.whisker_low]));
  const hi = Math.max(stats.whisker_high, ...(stats.outliers.length ? stats.outliers : [stats.whisker_high]));
  const span = Math.max(hi - lo, 0.001);
  const x = (v: number) => PAD + ((v - lo) / span) * (W - PAD * 2);

  const yMid = 52, boxH = 34;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Distribution box plot">
          {/* whiskers */}
          <line x1={x(stats.whisker_low)} x2={x(stats.whisker_high)} y1={yMid} y2={yMid} stroke="var(--text-subtle)" strokeWidth={1.5} />
          <line x1={x(stats.whisker_low)} x2={x(stats.whisker_low)} y1={yMid - 11} y2={yMid + 11} stroke="var(--text-subtle)" strokeWidth={1.5} />
          <line x1={x(stats.whisker_high)} x2={x(stats.whisker_high)} y1={yMid - 11} y2={yMid + 11} stroke="var(--text-subtle)" strokeWidth={1.5} />

          {/* IQR box */}
          <rect
            x={x(stats.q1)} y={yMid - boxH / 2}
            width={Math.max(x(stats.q3) - x(stats.q1), 2)} height={boxH}
            rx={4}
            fill={`color-mix(in srgb, ${color} 22%, transparent)`}
            stroke={color} strokeWidth={1.5}
          />
          {/* median */}
          <line x1={x(stats.median)} x2={x(stats.median)} y1={yMid - boxH / 2} y2={yMid + boxH / 2} stroke={color} strokeWidth={3} />
          {/* mean marker */}
          <circle cx={x(stats.mean)} cy={yMid} r={3.5} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="2 2">
            <title>{`Mean ${stats.mean} ${unit}`}</title>
          </circle>

          {stats.outliers.map((o, i) => (
            <circle key={i} cx={x(o)} cy={yMid} r={3} fill="var(--danger)" fillOpacity={0.7}>
              <title>{`Outlier: ${o} ${unit}`}</title>
            </circle>
          ))}

          <text x={x(stats.median)} y={yMid - boxH / 2 - 7} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--text)' }}>
            {stats.median}
          </text>
          <text x={x(stats.whisker_low)} y={H - 8} textAnchor="start" style={{ fontSize: 10, fill: 'var(--text-muted)' }}>{stats.whisker_low}</text>
          <text x={x(stats.whisker_high)} y={H - 8} textAnchor="end" style={{ fontSize: 10, fill: 'var(--text-muted)' }}>{stats.whisker_high}</text>
        </svg>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 6, ...muted }}>
        <span><strong style={{ color: 'var(--text)' }}>Median {stats.median}</strong> {unit}</span>
        <span>P25 {stats.q1}</span>
        <span>P75 {stats.q3}</span>
        <span>Mean {stats.mean}</span>
        <span>Max {stats.max}</span>
        <span>n={stats.n}</span>
        {stats.outliers.length > 0 && (
          <span style={{ color: 'var(--danger)' }}>{stats.outliers.length} outlier{stats.outliers.length === 1 ? '' : 's'}</span>
        )}
      </div>
    </div>
  );
};

/* ------------------------------- Heatmap ------------------------------- */

export interface HeatCell {
  department: string;
  batch: number;
  total: number;
  placed: number;
  rate: number;
}

/** Department × batch placement-rate grid. Weak cells jump out immediately. */
export const Heatmap: React.FC<{
  departments: string[];
  batches: number[];
  cells: HeatCell[];
  emptyLabel: string;
}> = ({ departments, batches, cells, emptyLabel }) => {
  if (!departments.length || !batches.length) return <ChartEmpty label={emptyLabel} />;

  const lookup = new Map(cells.map((c) => [`${c.department}|${c.batch}`, c]));
  const shade = (rate: number) => `color-mix(in srgb, #22c55e ${Math.round(12 + (rate / 100) * 72)}%, transparent)`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 3, fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-subtle)', fontWeight: 600, fontSize: 11 }} />
            {batches.map((b) => (
              <th key={b} style={{ padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d}>
              <td style={{
                padding: '4px 10px 4px 0', whiteSpace: 'nowrap', fontWeight: 550,
                maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis',
              }} title={d}>
                {d}
              </td>
              {batches.map((b) => {
                const c = lookup.get(`${d}|${b}`);
                return (
                  <td
                    key={b}
                    title={c ? `${d} · ${b}: ${c.placed}/${c.total} placed (${c.rate}%)` : 'No students'}
                    style={{
                      minWidth: 54, height: 38, textAlign: 'center', borderRadius: 6,
                      background: c ? shade(c.rate) : 'var(--surface-2)',
                      color: c ? 'var(--text)' : 'var(--text-subtle)',
                      fontWeight: c ? 650 : 400, fontVariantNumeric: 'tabular-nums',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {c ? `${c.rate}%` : '—'}
                    {c && <div style={{ fontSize: 9.5, fontWeight: 400, color: 'var(--text-muted)' }}>{c.placed}/{c.total}</div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, ...muted }}>
        <span>0%</span>
        <span style={{ flex: 1, maxWidth: 160, height: 8, borderRadius: 999, background: 'linear-gradient(90deg, color-mix(in srgb,#22c55e 12%,transparent), #22c55e)' }} />
        <span>100% placed</span>
      </div>
    </div>
  );
};

/* ------------------------------ Waterfall ------------------------------ */

export interface WaterfallStep {
  key: string;
  label: string;
  count: number;
  lost: number;
}

/**
 * Cumulative eligibility funnel. Each bar is the survivors after one criterion;
 * the red segment is who that criterion just excluded — which is exactly the
 * number a TPO quotes when asking a recruiter to relax a cutoff.
 */
export const Waterfall: React.FC<{ steps: WaterfallStep[]; emptyLabel: string }> = ({ steps, emptyLabel }) => {
  if (!steps.length) return <ChartEmpty label={emptyLabel} />;
  const start = steps[0]?.count || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 168, flex: 'none', fontSize: 12, fontWeight: i === 0 ? 700 : 550,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={s.label}>
            {s.label}
          </span>
          <div style={{ flex: 1, height: 24, borderRadius: 5, background: 'var(--surface-2)', overflow: 'hidden', display: 'flex', minWidth: 0 }}>
            <div style={{
              width: `${(s.count / start) * 100}%`, height: '100%',
              background: i === 0 ? 'var(--text-subtle)' : 'var(--primary)',
              transition: 'width .4s ease',
            }} />
            {s.lost > 0 && (
              <div
                style={{ width: `${(s.lost / start) * 100}%`, height: '100%', background: 'color-mix(in srgb, var(--danger) 55%, transparent)' }}
                title={`${s.lost} excluded here`}
              />
            )}
          </div>
          <span style={{ width: 46, flex: 'none', textAlign: 'right', fontSize: 12.5, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>
            {s.count}
          </span>
          <span style={{ width: 46, flex: 'none', textAlign: 'right', fontSize: 11, color: s.lost ? 'var(--danger)' : 'var(--text-subtle)' }}>
            {s.lost ? `−${s.lost}` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ----------------------------- Multi-line ----------------------------- */

export interface LineSeries {
  label: string;
  values: number[];
}

/** Several series on one axis — season pacing vs previous years. */
export const MultiLineChart: React.FC<{
  labels: string[];
  series: LineSeries[];
  emptyLabel: string;
  height?: number;
}> = ({ labels, series, emptyLabel, height = 190 }) => {
  const usable = series.filter((s) => s.values.some((v) => v > 0));
  if (!usable.length || labels.length < 2) return <ChartEmpty label={emptyLabel} />;

  const W = 580, H = height, PAD_L = 30, PAD = 12;
  const peak = Math.max(1, ...usable.flatMap((s) => s.values));
  const stepX = (W - PAD_L - PAD) / (labels.length - 1);
  const yOf = (v: number) => H - 26 - (v / peak) * (H - 26 - PAD);

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        {usable.map((s, i) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...muted }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: colorAt(i) }} />
            {s.label}
          </span>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Comparison over time">
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD} y1={yOf(peak * t)} y2={yOf(peak * t)} stroke="var(--border)" strokeDasharray="3 5" />
              <text x={PAD_L - 5} y={yOf(peak * t) + 3} textAnchor="end" style={{ fontSize: 9.5, fill: 'var(--text-subtle)' }}>
                {Math.round(peak * t)}
              </text>
            </g>
          ))}

          {usable.map((s, i) => {
            const pts = s.values.map((v, j) => [PAD_L + j * stepX, yOf(v)] as const);
            const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
            const isLast = i === usable.length - 1;
            return (
              <g key={s.label}>
                <path d={d} fill="none" stroke={colorAt(i)} strokeWidth={isLast ? 2.6 : 1.8}
                  strokeLinejoin="round" strokeLinecap="round" strokeDasharray={isLast ? undefined : '5 4'} />
                {pts.map(([x, y], j) => (
                  <circle key={j} cx={x} cy={y} r={2.4} fill={colorAt(i)}>
                    <title>{`${s.label} · ${labels[j]}: ${s.values[j]}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}

          {labels.map((l, j) => (
            <text key={l + j} x={PAD_L + j * stepX} y={H - 8} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--text-muted)' }}>
              {l}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

/* ----------------------------- Rate chart ----------------------------- */

export interface RateRow {
  key: string;
  total: number;
  placed: number;
  rate: number;
}

/** Bars for headcount with the placement rate overlaid — does X predict placement? */
export const RateChart: React.FC<{ data: RateRow[]; emptyLabel: string; height?: number }> = ({
  data, emptyLabel, height = 180,
}) => {
  if (!data.length) return <ChartEmpty label={emptyLabel} />;
  const peak = Math.max(1, ...data.map((d) => d.total));

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap', ...muted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--primary)' }} /> Students
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: '#22c55e' }} /> Placed
        </span>
        <span>· label = placement rate</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 12, height,
          minWidth: Math.max(data.length * 62, 220), borderBottom: '1px solid var(--border)', paddingTop: 20,
        }}>
          {data.map((d) => (
            <div key={d.key} style={{ flex: 1, minWidth: 46, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
              title={`${d.key}: ${d.placed}/${d.total} placed`}>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: d.rate >= 50 ? '#22c55e' : 'var(--text-muted)' }}>
                {d.rate}%
              </span>
              <div style={{ position: 'relative', height: `${(d.total / peak) * 100}%`, minHeight: 4 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '5px 5px 0 0', background: 'color-mix(in srgb, var(--primary) 30%, transparent)' }} />
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: `${d.total ? (d.placed / d.total) * 100 : 0}%`,
                  borderRadius: '5px 5px 0 0', background: '#22c55e', transition: 'height .4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, minWidth: Math.max(data.length * 62, 220), marginTop: 7 }}>
          {data.map((d) => (
            <span key={d.key} style={{
              flex: 1, minWidth: 46, fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={d.key}>
              {d.key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
