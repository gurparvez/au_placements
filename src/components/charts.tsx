import React, { useEffect, useId, useState } from 'react';

/**
 * Dependency-free SVG chart kit — register edition.
 *
 * Design rules (shared by every chart):
 *  · thin marks with 4px rounded data-ends anchored to the baseline
 *  · a 2px surface gap between adjacent fills (stack segments, pie slices)
 *  · recessive dashed grids, muted tabular figures, selective direct labels
 *  · a legend whenever ≥ 2 series are on screen
 *  · staggered entrance motion (transform/opacity only; reduced-motion safe
 *    via the global prefers-reduced-motion kill switch)
 *
 * The categorical palette is validated (lightness band, chroma floor, CVD
 * adjacent-pair separation, contrast) against both light and dark surfaces —
 * order is fixed; a series keeps its colour wherever it appears.
 */

export const PALETTE = [
  '#2563eb', // blue
  '#d97706', // amber
  '#0d9488', // teal
  '#a855f7', // purple
  '#16a34a', // green
  '#ec4899', // pink
  '#0891b2', // cyan
  '#ef4444', // red
];
export const colorAt = (i: number) => PALETTE[i % PALETTE.length];

export interface Slice {
  key: string;
  count: number;
}

const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 12.5 };
const num: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
/** Floating hover readout shared by the time-series charts. */
const tip: React.CSSProperties = {
  position: 'absolute', zIndex: 5, pointerEvents: 'none',
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9,
  boxShadow: 'var(--shadow)', padding: '7px 10px', fontSize: 12, whiteSpace: 'nowrap',
};
const EASE_DELAY = (i: number, step = 40) => ({ animationDelay: `${i * step}ms` });

export const ChartEmpty: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '36px 14px', color: 'var(--text-subtle)', fontSize: 12.5, textAlign: 'center',
    border: '1px dashed var(--border)', borderRadius: 10,
    background: 'color-mix(in srgb, var(--surface-2) 40%, transparent)',
  }}>
    {label}
  </div>
);

/** Small square swatch used by every legend. */
const Swatch: React.FC<{ color: string; line?: boolean }> = ({ color, line }) => (
  <span style={{
    width: line ? 14 : 8, height: line ? 3 : 8, borderRadius: 2,
    background: color, flex: 'none',
  }} />
);

/** Shared legend for pie/donut. */
const Legend: React.FC<{
  rows: Slice[];
  total: number;
  active: number | null;
  onHover: (i: number | null) => void;
}> = ({ rows, total, active, onHover }) => (
  <div className="kp-chart-fade" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 132 }}>
    {rows.map((r, i) => (
      <div
        key={r.key}
        onMouseEnter={() => onHover(i)}
        onMouseLeave={() => onHover(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5,
          padding: '3px 7px', borderRadius: 6, cursor: 'default',
          background: active === i ? 'var(--surface-2)' : 'transparent',
          opacity: active === null || active === i ? 1 : 0.45,
          transition: 'background .15s ease, opacity .15s ease',
        }}
      >
        <Swatch color={colorAt(i)} />
        <span style={{ flex: 1, minWidth: 0, textTransform: 'capitalize', lineHeight: 1.35, overflowWrap: 'anywhere' }}>
          {r.key}
        </span>
        <span style={{ color: 'var(--text-muted)', ...num, flex: 'none' }}>
          {r.count} · {total ? Math.round((r.count / total) * 100) : 0}%
        </span>
      </div>
    ))}
  </div>
);

/* ------------------------------- Pie ------------------------------- */

/** Filled pie with 2px surface gaps. Slices lift on hover; legend dims siblings.
 *  Long tails fold into "Other" so the ring and legend stay readable. */
export const PieChart: React.FC<{ data: Slice[]; emptyLabel: string; size?: number; maxSlices?: number; stacked?: boolean }> = ({
  data, emptyLabel, size = 150, maxSlices = 9, stacked,
}) => {
  const [active, setActive] = useState<number | null>(null);
  const raw = data.filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const rows = raw.length > maxSlices
    ? [...raw.slice(0, maxSlices - 1), { key: `Other (${raw.length - maxSlices + 1})`, count: raw.slice(maxSlices - 1).reduce((n, r) => n + r.count, 0) }]
    : raw;
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (!total) return <ChartEmpty label={emptyLabel} />;

  const R = size / 2 - 6;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;

  // A single 100% slice can't be drawn as an arc — render it as a full circle.
  const single = rows.length === 1;

  return (
    <div style={stacked
      ? { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }
      : { display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg
        className="kp-chart-pop"
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ flex: 'none', overflow: 'visible' }} role="img" aria-label="Pie chart"
      >
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
                strokeWidth={2}
                transform={`translate(${ox.toFixed(2)},${oy.toFixed(2)})`}
                style={{
                  transition: 'transform .18s ease, opacity .18s ease',
                  opacity: active === null || active === i ? 1 : 0.35,
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${r.key}: ${r.count} (${Math.round(frac * 100)}%)`}</title>
              </path>
            );
          })
        )}
      </svg>
      <div style={stacked ? { width: '100%' } : { flex: 1, minWidth: 132, display: 'flex' }}>
        <Legend rows={rows} total={total} active={active} onHover={setActive} />
      </div>
    </div>
  );
};

/* ------------------------------ Donut ------------------------------ */

/** Thin ring with 2px segment gaps and a live centre readout. `stacked` puts the legend below.
 *  Long tails fold into "Other" so the ring and legend stay readable. */
export const DonutChart: React.FC<{
  data: Slice[];
  emptyLabel: string;
  size?: number;
  centerLabel?: string;
  stacked?: boolean;
  maxSlices?: number;
}> = ({ data, emptyLabel, size = 150, centerLabel = 'total', stacked, maxSlices = 9 }) => {
  const [active, setActive] = useState<number | null>(null);
  const raw = data.filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const rows = raw.length > maxSlices
    ? [...raw.slice(0, maxSlices - 1), { key: `Other (${raw.length - maxSlices + 1})`, count: raw.slice(maxSlices - 1).reduce((n, r) => n + r.count, 0) }]
    : raw;
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (!total) return <ChartEmpty label={emptyLabel} />;

  const STROKE = size * 0.105;
  const R = size / 2 - STROKE / 2 - 4;
  const C = 2 * Math.PI * R;
  const GAP = rows.length > 1 ? 2.5 : 0; // px of arc between segments
  let offset = 0;

  const shown = active !== null ? rows[active] : null;

  return (
    <div style={stacked
      ? { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }
      : { display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg className="kp-chart-pop" width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }} role="img" aria-label="Donut chart">
        <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
          {rows.map((r, i) => {
            const dash = (r.count / total) * C;
            const seg = (
              <circle
                key={r.key}
                r={R} fill="none"
                stroke={colorAt(i)}
                strokeWidth={active === i ? STROKE + 4 : STROKE}
                strokeDasharray={`${Math.max(dash - GAP, 0.6)} ${C - dash + GAP}`}
                strokeDashoffset={-offset}
                style={{
                  transition: 'stroke-width .15s ease, opacity .15s ease',
                  opacity: active === null || active === i ? 1 : 0.35,
                }}
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
        <text x={size / 2} y={size / 2 - 2} textAnchor="middle"
          style={{ fontSize: size * 0.18, fontWeight: 550, fill: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', ...num }}>
          {shown ? shown.count : total}
        </text>
        <text x={size / 2} y={size / 2 + size * 0.105} textAnchor="middle" style={{ fontSize: size * 0.068, fill: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {shown ? shown.key : centerLabel}
        </text>
      </svg>
      <div style={stacked ? { width: '100%' } : { flex: 1, minWidth: 132, display: 'flex' }}>
        <Legend rows={rows} total={total} active={active} onHover={setActive} />
      </div>
    </div>
  );
};

/* --------------------------- Vertical bars --------------------------- */

/** Column chart — thin rounded columns, staggered grow-in, muted value labels. */
export const BarChart: React.FC<{
  data: Slice[];
  emptyLabel: string;
  height?: number;
  colorize?: boolean;
}> = ({ data, emptyLabel, height = 170, colorize }) => {
  const [hover, setHover] = useState<number | null>(null);
  const rows = data.filter((d) => d.count > 0 || data.every((x) => x.count === 0));
  if (!data.some((d) => d.count > 0)) return <ChartEmpty label={emptyLabel} />;

  const peak = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((n, r) => n + r.count, 0);
  // Fewer categories → thicker columns, so short charts still fill their panel.
  const colMax = rows.length <= 3 ? 150 : rows.length <= 5 ? 118 : rows.length <= 8 ? 92 : 58;
  const barMax = rows.length <= 3 ? 104 : rows.length <= 5 ? 80 : rows.length <= 8 ? 58 : 38;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height,
        minWidth: Math.max(rows.length * 38, 180), padding: '18px 0 0',
        borderBottom: '1px solid var(--border)',
      }}>
        {rows.map((r, i) => {
          const h = (r.count / peak) * 100;
          const edge = i === 0 ? { left: 0 } : i === rows.length - 1 ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' };
          return (
            <div key={r.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ position: 'relative', flex: 1, minWidth: 28, maxWidth: colMax, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              {hover === i && (
                <div style={{ ...tip, top: 0, ...edge }}>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>{r.key}</div>
                  <div style={{ color: 'var(--text-muted)', ...num }}>
                    <strong style={{ color: 'var(--text)' }}>{r.count}</strong>{total > 0 && <> · {Math.round((r.count / total) * 100)}%</>}
                  </div>
                </div>
              )}
              <span className="kp-chart-fade" style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', marginBottom: 4, color: 'var(--text-muted)', ...num, animationDelay: '.3s' }}>
                {r.count}
              </span>
              <div
                className="kp-bar kp-grow-y"
                style={{
                  height: `${Math.max(h, r.count > 0 ? 3 : 0)}%`,
                  borderRadius: '4px 4px 0 0',
                  margin: '0 auto', width: '100%', maxWidth: barMax,
                  background: colorize ? colorAt(i) : 'var(--primary)',
                  ...EASE_DELAY(i, 35),
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, minWidth: Math.max(rows.length * 38, 180), marginTop: 7 }}>
        {rows.map((r) => (
          <span key={r.key} style={{
            flex: 1, minWidth: 28, maxWidth: colMax, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center',
            lineHeight: 1.25, textTransform: 'capitalize', overflowWrap: 'anywhere', alignSelf: 'flex-start',
          }}>
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
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <ChartEmpty label={emptyLabel} />;
  const peak = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)));
  const groupMax = data.length <= 4 ? 170 : data.length <= 7 ? 124 : 96;

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...muted }}>
            <Swatch color={s.color} />
            {s.label}
          </span>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 16, height,
          minWidth: Math.max(data.length * 68, 240), borderBottom: '1px solid var(--border)', paddingTop: 16,
        }}>
          {data.map((row, gi) => {
            const edge = gi === 0 ? { left: 0 } : gi === data.length - 1 ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' };
            return (
              <div key={row.key}
                onMouseEnter={() => setHover(gi)} onMouseLeave={() => setHover(null)}
                style={{ position: 'relative', flex: 1, minWidth: 52, maxWidth: groupMax, height: '100%', display: 'flex', alignItems: 'flex-end', gap: 3, margin: '0 auto' }}>
                {hover === gi && (
                  <div style={{ ...tip, top: 0, ...edge }}>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>{row.key}</div>
                    {series.map((s) => (
                      <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginTop: 2 }}>
                        <Swatch color={s.color} />
                        <span style={{ flex: 1, paddingRight: 10 }}>{s.label}</span>
                        <span style={{ color: 'var(--text)', fontWeight: 600, ...num }}>{Number(row[s.key]) || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
                {series.map((s) => {
                  const v = Number(row[s.key]) || 0;
                  return (
                    <div key={s.key} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <span className="kp-chart-fade" style={{ fontSize: 10.5, fontWeight: 600, textAlign: 'center', marginBottom: 3, color: 'var(--text-muted)', ...num, animationDelay: '.3s' }}>
                        {v || ''}
                      </span>
                      <div
                        className="kp-bar kp-grow-y"
                        style={{
                          height: `${Math.max((v / peak) * 100, v > 0 ? 3 : 0)}%`,
                          borderRadius: '4px 4px 0 0', background: s.color,
                          ...EASE_DELAY(gi, 40),
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, minWidth: Math.max(data.length * 68, 240), marginTop: 7 }}>
          {data.map((row) => (
            <span key={row.key} style={{
              flex: 1, minWidth: 52, maxWidth: groupMax, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center',
              lineHeight: 1.25, overflowWrap: 'anywhere', alignSelf: 'flex-start',
            }}>
              {row.key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* --------------------------- Stacked bars --------------------------- */

/** 100%-stacked rows with 2px segment gaps and a proper legend. */
export const StackedBar: React.FC<{
  data: { key: string; parts: { label: string; value: number; color: string }[] }[];
  emptyLabel: string;
  showLegend?: boolean;
  /** Stretch to the parent's height, spreading rows evenly (parent must be a column flexbox). */
  fill?: boolean;
}> = ({ data, emptyLabel, showLegend = true, fill }) => {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <ChartEmpty label={emptyLabel} />;
  const legend = data[0]?.parts ?? [];
  // Muted "remainder" colours make poor ink — fall back to the muted text token.
  const inkOf = (c: string) => (c.startsWith('var(--text') ? 'var(--text-muted)' : c);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, ...(fill ? { flex: 1, justifyContent: 'space-between' } : {}) }}>
      {showLegend && legend.length > 1 && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 1 }}>
          {legend.map((p) => (
            <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...muted, fontSize: 12 }}>
              <Swatch color={p.color} />
              {p.label}
            </span>
          ))}
        </div>
      )}
      {data.map((row, ri) => {
        const total = row.parts.reduce((n, p) => n + p.value, 0);
        const active = hover === ri;
        return (
          <div key={row.key} onMouseEnter={() => setHover(ri)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4, fontSize: 12.5 }}>
              <span style={{ fontWeight: active ? 650 : 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.key}</span>
              {active ? (
                <span style={{ flex: 'none', display: 'inline-flex', gap: 9, ...num }}>
                  {row.parts.map((p) => (
                    <span key={p.label} style={{ color: inkOf(p.color), fontWeight: 600, fontSize: 12 }}>
                      {p.value} {p.label.toLowerCase()}
                    </span>
                  ))}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', flex: 'none', ...num }}>{total}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 2, height: 11, filter: active ? 'brightness(1.15)' : 'none', transition: 'filter .15s ease' }}>
              {row.parts.map((p) => (
                p.value > 0 && (
                  <div
                    key={p.label}
                    className="kp-grow-x"
                    style={{
                      width: `${(p.value / (total || 1)) * 100}%`, background: p.color,
                      borderRadius: 3, ...EASE_DELAY(ri, 45),
                    }}
                    title={`${p.label}: ${p.value} of ${total} (${total ? Math.round((p.value / total) * 100) : 0}%)`}
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
            <span style={{ color: 'var(--text-muted)', flex: 'none', ...num }}>
              {r.count}
              {total > 0 && <span style={{ color: 'var(--text-subtle)' }}> · {Math.round((r.count / total) * 100)}%</span>}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div
              className="kp-grow-x"
              style={{
                width: `${(r.count / peak) * 100}%`, height: '100%', borderRadius: 999,
                background: colorize ? colorAt(i) : 'var(--primary)', ...EASE_DELAY(i, 40),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------ Area/line ------------------------------ */

/** Area chart for time series: 2px line draw-in, soft fill, small point markers. */
export const AreaChart: React.FC<{
  data: Slice[];
  emptyLabel: string;
  color?: string;
  height?: number;
}> = ({ data, emptyLabel, color = 'var(--primary)', height = 140 }) => {
  const gid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);
  if (data.length < 2) return <ChartEmpty label={emptyLabel} />;

  const W = 560, H = height, PAD = 8;
  const peak = Math.max(1, ...data.map((d) => d.count));
  const stepX = (W - PAD * 2) / (data.length - 1);
  const pts = data.map((d, i) => [PAD + i * stepX, H - PAD - (d.count / peak) * (H - PAD * 2 - 12)] as const);

  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD} L${pts[0][0].toFixed(1)},${H - PAD} Z`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const idx = Math.round((x - PAD) / stepX);
    setHover(idx >= 0 && idx < data.length ? idx : null);
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" aria-label="Trend chart"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.26" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* horizontal guides */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
              stroke="var(--border)" strokeWidth={1} strokeDasharray="3 5" />
          ))}
          <path className="kp-chart-fade" style={{ animationDelay: '.4s' }} d={area} fill={`url(#g-${gid})`} />
          <path className="kp-draw" d={line} pathLength={1} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null && (
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD} y2={H - PAD} stroke="var(--text-subtle)" strokeWidth={1} strokeDasharray="2 3" />
          )}
          <g className="kp-chart-fade" style={{ animationDelay: '.5s' }}>
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={hover === i ? 4.2 : 2.6} fill={color}
                stroke="var(--surface)" strokeWidth={hover === i ? 2 : 0} />
            ))}
          </g>
        </svg>
        {hover !== null && (
          <div style={{
            ...tip, top: 6, left: `${(pts[hover][0] / W) * 100}%`,
            transform: hover / (data.length - 1) > 0.72 ? 'translateX(calc(-100% - 10px))' : hover / (data.length - 1) < 0.14 ? 'translateX(10px)' : 'translateX(-50%)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 3, textTransform: 'capitalize' }}>{data[hover].key}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
              <Swatch color={color} /> <span style={{ color: 'var(--text)', fontWeight: 600, ...num }}>{data[hover].count}</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...muted, marginTop: 2 }}>
        <span>{data[0].key}</span>
        <span>peak {peak}</span>
        <span>{data[data.length - 1].key}</span>
      </div>
    </div>
  );
};

/* ------------------------------- Gauge ------------------------------- */

/** Radial progress arc — one headline percentage, sweeping in on mount. */
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
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const dash = on ? (pct / 100) * C : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} role="img" aria-label={`${label}: ${pct}%`}>
        <g transform={`translate(${size / 2},${size / 2 - 8}) rotate(180)`}>
          <circle r={R} fill="none" stroke="var(--surface-2)" strokeWidth={11}
            strokeDasharray={`${C} ${C * 2}`} strokeLinecap="round" />
          <circle r={R} fill="none" stroke={color} strokeWidth={11}
            strokeDasharray={`${dash} ${C * 2}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray .9s cubic-bezier(.16,1,.3,1)' }} />
        </g>
        <text x={size / 2} y={size / 2 - 14} textAnchor="middle" style={{ fontSize: 27, fontWeight: 650, fill: 'var(--text)', ...num }}>
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
  const [hover, setHover] = useState<number | null>(null);
  const rows = data.filter((d) => d.key !== 'rejected');
  const rejected = data.find((d) => d.key === 'rejected');
  if (!data.some((d) => d.count > 0)) return <ChartEmpty label={emptyLabel} />;

  const peak = Math.max(1, ...rows.map((r) => r.count));
  const first = rows[0]?.count ?? 0;
  // Only a true funnel (each stage ≤ the one before) gets a conversion column —
  // otherwise "700% of invited" reads as broken to a normal person.
  const isFunnel = first > 0 && rows.every((r, i) => i === 0 || r.count <= rows[i - 1].count);
  // Few stages → thicker bars, and rows spread to fill the panel height.
  const barH = rows.length <= 6 ? 30 : 22;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, justifyContent: 'space-between' }}>
      {rows.map((r, i) => (
        <div
          key={r.key}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          title={isFunnel
            ? `${r.count} of ${first} ${rows[0].key} reached “${r.key}” (${Math.round((r.count / first) * 100)}%)`
            : `${r.key}: ${r.count}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '4px 7px', borderRadius: 7,
            background: hover === i ? 'var(--surface-2)' : 'transparent', transition: 'background .14s ease',
          }}
        >
          <span style={{ width: 80, flex: 'none', fontSize: 12.5, fontWeight: hover === i ? 650 : 550, textTransform: 'capitalize' }}>{r.key}</span>
          <div style={{ flex: 1, height: barH, borderRadius: 5, background: 'var(--surface-2)', minWidth: 0 }}>
            <div
              className="kp-bar kp-grow-x"
              style={{
                width: `${Math.max((r.count / peak) * 100, r.count > 0 ? 4 : 0)}%`,
                height: '100%', borderRadius: 5, background: colorAt(i), ...EASE_DELAY(i, 50),
                filter: hover === i ? 'brightness(1.12)' : 'none',
              }}
            />
          </div>
          <span style={{ width: 38, flex: 'none', textAlign: 'right', fontSize: 12.5, fontWeight: 600, ...num }}>
            {r.count}
          </span>
          {isFunnel && (
            <span style={{ width: 42, flex: 'none', textAlign: 'right', fontSize: 11, color: 'var(--text-subtle)', ...num }}>
              {`${Math.round((r.count / first) * 100)}%`}
            </span>
          )}
        </div>
      ))}
      {(isFunnel || !!rejected?.count) && (
        <div style={{ marginTop: 6, paddingTop: 9, borderTop: '1px dashed var(--border)', fontSize: 11, color: 'var(--text-subtle)' }}>
          {isFunnel && <>% = share of “{rows[0]?.key}” that reached each stage</>}
          {isFunnel && !!rejected?.count && ' · '}
          {!!rejected?.count && <span style={{ color: 'var(--danger)' }}>{rejected.count} rejected</span>}
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

  // Scale to the usual range only — the handful of extreme values would
  // otherwise squash the readable part into a corner. They get a sentence instead.
  const lo = stats.whisker_low;
  const hi = Math.max(stats.whisker_high, lo + 0.001);
  const x = (v: number) => `${Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100))}%`;

  return (
    <div className="kp-chart-fade">
      <div style={{ position: 'relative', height: 78, margin: '4px 6px 0' }}>
        {/* typical value, called out above its marker */}
        <span className="data" style={{ position: 'absolute', top: 0, left: x(stats.median), transform: 'translateX(-50%)', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {stats.median} {unit}
        </span>
        <span style={{ position: 'absolute', top: 17, left: x(stats.median), transform: 'translateX(-50%)', fontSize: 9.5, color: 'var(--text-subtle)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
          typical
        </span>

        {/* full usual range */}
        <div style={{ position: 'absolute', top: 44, left: 0, right: 0, height: 2, background: 'var(--surface-3)', borderRadius: 2 }} />
        {/* the middle half — where most values sit */}
        <div
          className="kp-grow-x"
          title={`Middle half: ${stats.q1}–${stats.q3} ${unit}`}
          style={{
            position: 'absolute', top: 36, left: x(stats.q1), width: `calc(${x(stats.q3)} - ${x(stats.q1)})`,
            height: 18, borderRadius: 9,
            background: `color-mix(in srgb, ${color} 26%, transparent)`,
            border: `1.5px solid ${color}`,
          }}
        />
        {/* typical marker */}
        <div title={`Typical: ${stats.median} ${unit}`} style={{ position: 'absolute', top: 32, left: x(stats.median), width: 3, height: 26, transform: 'translateX(-50%)', borderRadius: 2, background: color }} />

        {/* range end labels */}
        <span className="data" style={{ position: 'absolute', bottom: 0, left: 0, fontSize: 10.5, color: 'var(--text-muted)' }}>{stats.whisker_low}</span>
        <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--text-subtle)' }}>usual range</span>
        <span className="data" style={{ position: 'absolute', bottom: 0, right: 0, fontSize: 10.5, color: 'var(--text-muted)' }}>{stats.whisker_high}</span>
      </div>

      {/* One plain sentence carries the whole story. */}
      <p style={{ ...muted, margin: '12px 0 0', lineHeight: 1.6, textAlign: 'left' }}>
        Half of the {stats.n} recorded sit between{' '}
        <strong className="data" style={{ color: 'var(--text)' }}>{stats.q1}</strong> and{' '}
        <strong className="data" style={{ color: 'var(--text)' }}>{stats.q3} {unit}</strong> — the typical one is{' '}
        <strong className="data" style={{ color: 'var(--text)' }}>{stats.median} {unit}</strong> (average {stats.mean}).
        {stats.outliers.length > 0 && (
          <> {stats.outliers.length} {stats.outliers.length === 1 ? 'was' : 'were'} unusually high, up to <span className="data">{stats.max} {unit}</span>.</>
        )}
      </p>
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

/** Department × batch placement-rate grid — stretches to fill its panel. */
export const Heatmap: React.FC<{
  departments: string[];
  batches: number[];
  cells: HeatCell[];
  emptyLabel: string;
}> = ({ departments, batches, cells, emptyLabel }) => {
  if (!departments.length || !batches.length) return <ChartEmpty label={emptyLabel} />;

  const lookup = new Map(cells.map((c) => [`${c.department}|${c.batch}`, c]));
  // Single-hue sequential ramp, capped so the ink stays readable on both themes.
  const shade = (rate: number) => `color-mix(in srgb, #22c55e ${Math.round(10 + (rate / 100) * 62)}%, transparent)`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 3, fontSize: 12, minWidth: batches.length * 64 + 150 }}>
        <colgroup>
          <col style={{ width: 176 }} />
          {batches.map((b) => <col key={b} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-subtle)', fontWeight: 600, fontSize: 11 }} />
            {batches.map((b) => (
              <th key={b} className="data" style={{ padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((d, di) => (
            <tr key={d}>
              <td style={{
                padding: '4px 10px 4px 0', whiteSpace: 'nowrap', fontWeight: 550,
                overflow: 'hidden', textOverflow: 'ellipsis',
              }} title={d}>
                {d}
              </td>
              {batches.map((b, bi) => {
                const c = lookup.get(`${d}|${b}`);
                return (
                  <td
                    key={b}
                    className="kp-heatcell kp-chart-fade"
                    title={c ? `${d} · ${b}: ${c.placed}/${c.total} placed (${c.rate}%)` : 'No students'}
                    style={{
                      height: 42, textAlign: 'center', borderRadius: 6,
                      background: c ? shade(c.rate) : 'color-mix(in srgb, var(--surface-2) 55%, transparent)',
                      color: c ? 'var(--text)' : 'var(--text-subtle)',
                      fontWeight: c ? 650 : 400, ...num,
                      animationDelay: `${(di * batches.length + bi) * 14}ms`,
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
        <span style={{ flex: 1, maxWidth: 160, height: 8, borderRadius: 999, background: 'linear-gradient(90deg, color-mix(in srgb,#22c55e 10%,transparent), color-mix(in srgb,#22c55e 72%,transparent))' }} />
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
          <div className="kp-grow-x" style={{ flex: 1, height: 22, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden', display: 'flex', minWidth: 0, ...EASE_DELAY(i, 40) }}>
            <div style={{
              width: `${(s.count / start) * 100}%`, height: '100%',
              background: i === 0 ? 'var(--text-subtle)' : 'var(--primary)',
            }} />
            {s.lost > 0 && (
              <div
                style={{ width: `${(s.lost / start) * 100}%`, height: '100%', background: 'color-mix(in srgb, var(--danger) 55%, transparent)', marginLeft: 2, borderRadius: 2 }}
                title={`${s.lost} excluded here`}
              />
            )}
          </div>
          <span style={{ width: 46, flex: 'none', textAlign: 'right', fontSize: 12.5, fontWeight: 650, ...num }}>
            {s.count}
          </span>
          <span style={{ width: 46, flex: 'none', textAlign: 'right', fontSize: 11, color: s.lost ? 'var(--danger)' : 'var(--text-subtle)', ...num }}>
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

/** Several series on one axis — the current season draws in solid, history stays dashed. */
export const MultiLineChart: React.FC<{
  labels: string[];
  series: LineSeries[];
  emptyLabel: string;
  height?: number;
}> = ({ labels, series, emptyLabel, height = 200 }) => {
  const [hover, setHover] = useState<number | null>(null);
  const usable = series.filter((s) => s.values.some((v) => v > 0));
  if (!usable.length || labels.length < 2) return <ChartEmpty label={emptyLabel} />;

  const W = 580, H = height, PAD_L = 30, PAD = 12;
  const peak = Math.max(1, ...usable.flatMap((s) => s.values));
  const stepX = (W - PAD_L - PAD) / (labels.length - 1);
  const yOf = (v: number) => H - 26 - (v / peak) * (H - 26 - PAD);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const idx = Math.round((x - PAD_L) / stepX);
    setHover(idx >= 0 && idx < labels.length ? idx : null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        {usable.map((s, i) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...muted }}>
            <Swatch color={colorAt(i)} line />
            {s.label}
          </span>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Comparison over time"
            onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            {[0, 0.5, 1].map((t) => (
              <g key={t}>
                <line x1={PAD_L} x2={W - PAD} y1={yOf(peak * t)} y2={yOf(peak * t)} stroke="var(--border)" strokeDasharray="3 5" />
                <text x={PAD_L - 5} y={yOf(peak * t) + 3} textAnchor="end" style={{ fontSize: 9.5, fill: 'var(--text-subtle)', ...num }}>
                  {Math.round(peak * t)}
                </text>
              </g>
            ))}

            {hover !== null && (
              <line x1={PAD_L + hover * stepX} x2={PAD_L + hover * stepX} y1={PAD} y2={H - 26}
                stroke="var(--text-subtle)" strokeWidth={1} strokeDasharray="2 3" />
            )}

            {usable.map((s, i) => {
              const pts = s.values.map((v, j) => [PAD_L + j * stepX, yOf(v)] as const);
              const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
              const isLast = i === usable.length - 1;
              return (
                <g key={s.label}>
                  {isLast ? (
                    <path className="kp-draw" d={d} pathLength={1} fill="none" stroke={colorAt(i)} strokeWidth={2.4}
                      strokeLinejoin="round" strokeLinecap="round" />
                  ) : (
                    <path className="kp-chart-fade" style={{ animationDelay: `${i * 120}ms` }} d={d} fill="none" stroke={colorAt(i)} strokeWidth={1.7}
                      strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 4" />
                  )}
                  <g className="kp-chart-fade" style={{ animationDelay: '.45s' }}>
                    {pts.map(([x, y], j) => (
                      <circle key={j} cx={x} cy={y} r={hover === j ? 4 : 2.3} fill={colorAt(i)}
                        stroke="var(--surface)" strokeWidth={hover === j ? 1.5 : 0} />
                    ))}
                  </g>
                </g>
              );
            })}

            {labels.map((l, j) => (
              <text key={l + j} x={PAD_L + j * stepX} y={H - 8} textAnchor="middle"
                style={{ fontSize: 9.5, fill: hover === j ? 'var(--text)' : 'var(--text-muted)', fontWeight: hover === j ? 650 : 400 }}>
                {l}
              </text>
            ))}
          </svg>
          {hover !== null && (
            <div style={{
              ...tip, top: 4, left: `${((PAD_L + hover * stepX) / W) * 100}%`,
              transform: hover / (labels.length - 1) > 0.72 ? 'translateX(calc(-100% - 10px))' : hover / (labels.length - 1) < 0.14 ? 'translateX(10px)' : 'translateX(-50%)',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{labels[hover]}</div>
              {usable.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginTop: 2 }}>
                  <Swatch color={colorAt(i)} />
                  <span style={{ flex: 1, paddingRight: 10 }}>{s.label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, ...num }}>{s.values[hover]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <ChartEmpty label={emptyLabel} />;
  const peak = Math.max(1, ...data.map((d) => d.total));
  const rateColMax = data.length <= 4 ? 140 : data.length <= 6 ? 108 : 64;

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap', ...muted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Swatch color="color-mix(in srgb, var(--primary) 30%, transparent)" /> Students
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Swatch color="#22c55e" /> Placed
        </span>
        <span>· label = placement rate</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, height,
          minWidth: Math.max(data.length * 62, 220), borderBottom: '1px solid var(--border)', paddingTop: 20,
        }}>
          {data.map((d, i) => (
            <div key={d.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ position: 'relative', flex: 1, minWidth: 46, maxWidth: rateColMax, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {hover === i && (
                <div style={{ ...tip, top: 0, ...(i === 0 ? { left: 0 } : i === data.length - 1 ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' }) }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.key}</div>
                  <div style={{ color: 'var(--text-muted)', ...num }}>
                    <strong style={{ color: 'var(--text)' }}>{d.placed}</strong> of {d.total} placed · {d.rate}%
                  </div>
                </div>
              )}
              <span className="kp-chart-fade" style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: d.rate >= 50 ? '#22c55e' : 'var(--text-muted)', ...num, animationDelay: '.35s' }}>
                {d.rate}%
              </span>
              <div className="kp-grow-y" style={{ position: 'relative', height: `${(d.total / peak) * 100}%`, minHeight: 4, ...EASE_DELAY(i, 35) }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '4px 4px 0 0', background: 'color-mix(in srgb, var(--primary) 28%, transparent)' }} />
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: `${d.total ? (d.placed / d.total) * 100 : 0}%`,
                  borderRadius: d.placed === d.total ? '4px 4px 0 0' : 0, background: '#22c55e',
                }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, minWidth: Math.max(data.length * 62, 220), marginTop: 7 }}>
          {data.map((d) => (
            <span key={d.key} style={{
              flex: 1, minWidth: 46, maxWidth: rateColMax, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center',
              lineHeight: 1.25, overflowWrap: 'anywhere', alignSelf: 'flex-start',
            }}>
              {d.key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
