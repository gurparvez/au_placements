const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Accepts ISO dates or "YYYY-MM" and returns e.g. "Jun 2026". */
export const fmtMonth = (d?: string): string => {
  if (!d) return '';
  const date = new Date(d);
  if (!isNaN(date.getTime())) return `${M[date.getMonth()]} ${date.getFullYear()}`;
  const [y, m] = String(d).split('-');
  return m ? `${M[+m - 1]} ${y}` : String(d);
};

export const yearOf = (d?: string): string => {
  if (!d) return '';
  const date = new Date(d);
  if (!isNaN(date.getTime())) return String(date.getFullYear());
  return String(d).split('-')[0];
};

export const rangeYears = (a?: string, b?: string, ongoing?: boolean): string =>
  `${yearOf(a) || '—'} – ${ongoing ? 'Present' : b ? yearOf(b) : 'Present'}`;

export const availLabel = (lf?: { from_date?: string; to_date?: string }): string =>
  !lf?.from_date
    ? ''
    : lf.to_date
      ? `${fmtMonth(lf.from_date)} – ${fmtMonth(lf.to_date)}`
      : `${fmtMonth(lf.from_date)} onwards`;
