import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * SelectField — a minimal, register-styled dropdown.
 *
 * Why not a native <select>? Native popups can't be styled and the browser
 * decides which way they open. This is a drop-in replacement that is:
 *   • minimal + consistent with the rest of the site (tokens, radii, type)
 *   • always opens DOWNWARD (portal-positioned from the trigger rect, capped
 *     with an internal scroll so it never flips upward or gets clipped)
 *   • accessible (listbox semantics, full keyboard nav, typeahead, Esc/outside
 *     click to close, focus returns to the trigger)
 *   • motion-aware (subtle open/close; falls back under reduced-motion)
 */

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Extra styles merged onto the trigger button. */
  style?: React.CSSProperties;
  className?: string;
  'aria-label'?: string;
  id?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const triggerBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0,
  padding: '8px 11px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)',
  background: 'var(--bg-2)', color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
  /* `font` shorthand FIRST — the longhands after it must win */
  font: 'inherit', fontSize: 13.5, lineHeight: 1.2, fontWeight: 500,
  transition: 'border-color .16s ease, background .16s ease, box-shadow .16s ease',
};

export const SelectField: React.FC<SelectFieldProps> = ({
  value, onChange, options, placeholder = 'Select…', disabled,
  style, className, 'aria-label': ariaLabel, id,
}) => {
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; below: number; maxW: number } | null>(null);
  const typeahead = useRef<{ buf: string; t: number }>({ buf: '', t: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const measure = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({
      top: r.bottom + 6, left: r.left, width: r.width,
      below: window.innerHeight - r.bottom - 12,
      maxW: window.innerWidth - r.left - 14,
    });
  }, []);

  // Keep the menu pinned to the trigger while open (scroll / resize).
  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, measure]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || active < 0) return;
    const node = menuRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const openMenu = () => {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled));
    setOpen(true);
  };
  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) btnRef.current?.focus();
  };
  const choose = (i: number) => {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    close();
  };

  const step = (dir: 1 | -1) => {
    setActive((cur) => {
      let i = cur;
      for (let n = 0; n < options.length; n++) {
        i = (i + dir + options.length) % options.length;
        if (!options[i]?.disabled) return i;
      }
      return cur;
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); openMenu(); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); step(1); break;
      case 'ArrowUp': e.preventDefault(); step(-1); break;
      case 'Home': e.preventDefault(); setActive(options.findIndex((o) => !o.disabled)); break;
      case 'End': e.preventDefault(); { const last = [...options].reverse().findIndex((o) => !o.disabled); setActive(last < 0 ? -1 : options.length - 1 - last); } break;
      case 'Enter': case ' ': e.preventDefault(); choose(active); break;
      case 'Escape': e.preventDefault(); close(); break;
      case 'Tab': close(false); break;
      default:
        if (e.key.length === 1) {
          const now = performance.now();
          typeahead.current.buf = now - typeahead.current.t > 700 ? e.key : typeahead.current.buf + e.key;
          typeahead.current.t = now;
          const q = typeahead.current.buf.toLowerCase();
          const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(q));
          if (hit >= 0) setActive(hit);
        }
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={className}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        style={{
          ...triggerBase,
          opacity: disabled ? 0.55 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: open ? 'var(--primary)' : 'var(--border-strong)',
          boxShadow: open ? '0 0 0 3px var(--ring-soft)' : 'none',
          ...style,
        }}
        onMouseEnter={(e) => { if (!open && !disabled) e.currentTarget.style.borderColor = 'var(--text-subtle)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      >
        <span style={{
          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: selected ? 'var(--text)' : 'var(--text-subtle)',
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          style={{
            flex: 'none', color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease',
          }}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              tabIndex={-1}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: EASE }}
              style={{
                // Fit the longest label: at least as wide as the trigger, growing
                // up to the viewport edge so options are never truncated.
                position: 'fixed', top: rect.top, left: rect.left,
                width: 'max-content', minWidth: rect.width,
                maxWidth: Math.max(rect.width, Math.min(420, rect.maxW)),
                zIndex: 400, transformOrigin: 'top left',
                maxHeight: Math.max(140, Math.min(300, rect.below)),
                overflowY: 'auto', padding: 5,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 11, boxShadow: 'var(--shadow)',
              }}
            >
              {options.map((opt, i) => {
                const isSel = opt.value === value;
                const isActive = i === active;
                return (
                  <div
                    key={`${opt.value}-${i}`}
                    data-idx={i}
                    role="option"
                    aria-selected={isSel}
                    aria-disabled={opt.disabled || undefined}
                    onMouseEnter={() => !opt.disabled && setActive(i)}
                    onMouseDown={(e) => { e.preventDefault(); choose(i); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px',
                      borderRadius: 7, fontSize: 13, lineHeight: 1.3,
                      color: opt.disabled ? 'var(--text-subtle)' : 'var(--text)',
                      fontWeight: isSel ? 600 : 500,
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      background: isActive && !opt.disabled ? 'var(--surface-2)' : 'transparent',
                      transition: 'background .12s ease',
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {opt.label}
                    </span>
                    {isSel && <Check size={14} style={{ flex: 'none', color: 'var(--brass)' }} />}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

/* ----------------------------- DateField ----------------------------- */

const pad2 = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const POP_W = 264;

/**
 * DateField — fully custom, minimal calendar (the native popup can't be styled).
 * Same contract as an <input type="date">: value/onChange use "YYYY-MM-DD";
 * the trigger shows DD-MM-YYYY. Opens downward in a portal like SelectField.
 */
export const DateField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  'aria-label'?: string;
  title?: string;
  id?: string;
}> = ({ value, onChange, min, max, disabled, style, 'aria-label': ariaLabel, title, id }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number } | null>(null);

  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const todayIso = isoOf(new Date());
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  const measure = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - POP_W - 12)) });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onMove = () => measure();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openPop = () => {
    if (disabled) return;
    const base = selected ?? new Date();
    setView({ y: base.getFullYear(), m: base.getMonth() });
    setOpen(true);
  };
  const pick = (iso: string) => { onChange(iso); setOpen(false); btnRef.current?.focus(); };
  const blockedDay = (iso: string) => Boolean((min && iso < min) || (max && iso > max));
  const shiftMonth = (delta: number) => setView((v) => {
    const d = new Date(v.y, v.m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  // 6×7 grid, Monday-first, padded with the neighbouring months.
  const firstIdx = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(view.y, view.m, 1 - firstIdx + i));

  const navBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26,
    borderRadius: 7, border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer',
    transition: 'background .13s ease, color .13s ease', padding: 0, flex: 'none',
  };
  const navHover = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; },
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={title}
        onClick={() => (open ? setOpen(false) : openPop())}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0,
          padding: '8px 11px', borderRadius: 'var(--r-ctl)', textAlign: 'left',
          /* `font` shorthand FIRST — the longhands after it must win (mirrors SelectField) */
          font: 'inherit', fontSize: 13.5, lineHeight: 1.2, fontWeight: 500,
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border-strong)'}`,
          boxShadow: open ? '0 0 0 3px var(--ring-soft)' : 'none',
          background: 'var(--bg-2)', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.55 : 1,
          transition: 'border-color .16s ease, box-shadow .16s ease',
          ...style,
        }}
        onMouseEnter={(e) => { if (!open && !disabled) e.currentTarget.style.borderColor = 'var(--text-subtle)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      >
        <Calendar size={14} aria-hidden style={{ flex: 'none', color: 'var(--text-muted)' }} />
        <span className="data" style={{
          flex: 1, minWidth: 0,
          color: selected ? 'var(--text)' : 'var(--text-subtle)', whiteSpace: 'nowrap',
        }}>
          {selected ? `${pad2(selected.getDate())}-${pad2(selected.getMonth() + 1)}-${selected.getFullYear()}` : 'DD-MM-YYYY'}
        </span>
        {selected && !disabled && (
          <span
            role="button"
            aria-label="Clear date"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            style={{ display: 'inline-flex', flex: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
          >
            <X size={13} />
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={popRef}
              role="dialog"
              aria-label="Choose a date"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: EASE }}
              style={{
                position: 'fixed', top: rect.top, left: rect.left, width: POP_W, zIndex: 400,
                transformOrigin: 'top left', padding: 12,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: 'var(--shadow)',
              }}
            >
              {/* month header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 9 }}>
                <span className="font-display" style={{ flex: 1, fontSize: 14.5, fontWeight: 550, letterSpacing: '-.01em', paddingLeft: 4 }}>
                  {MONTHS[view.m]} <span className="data" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{view.y}</span>
                </span>
                <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} style={navBtn} {...navHover}><ChevronLeft size={15} /></button>
                <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} style={navBtn} {...navHover}><ChevronRight size={15} /></button>
              </div>

              {/* weekday rail */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 2 }}>
                {WEEKDAYS.map((w) => (
                  <span key={w} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 650, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '3px 0' }}>
                    {w}
                  </span>
                ))}
              </div>

              {/* day grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                {cells.map((d) => {
                  const iso = isoOf(d);
                  const inMonth = d.getMonth() === view.m;
                  const isSel = value === iso;
                  const isToday = iso === todayIso;
                  const blocked = blockedDay(iso);
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={blocked}
                      onClick={() => pick(iso)}
                      aria-label={iso}
                      className="data"
                      style={{
                        height: 30, borderRadius: 8, border: 'none', padding: 0,
                        fontSize: 12.5, fontWeight: isSel ? 650 : 500,
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        background: isSel ? 'var(--primary)' : 'transparent',
                        color: isSel ? 'var(--on-primary)' : blocked ? 'var(--text-subtle)' : inMonth ? 'var(--text)' : 'var(--text-subtle)',
                        opacity: blocked ? 0.4 : 1,
                        boxShadow: isToday && !isSel ? 'inset 0 0 0 1.5px var(--brass)' : 'none',
                        transition: 'background .12s ease',
                      }}
                      onMouseEnter={(e) => { if (!isSel && !blocked) e.currentTarget.style.background = 'var(--surface-2)'; }}
                      onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* quick actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 9, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => { onChange(''); setOpen(false); }}
                  style={{ border: 'none', background: 'none', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', transition: 'color .13s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Clear
                </button>
                <button type="button" disabled={blockedDay(todayIso)} onClick={() => pick(todayIso)}
                  style={{ border: 'none', background: 'none', fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', padding: '2px 4px', opacity: blockedDay(todayIso) ? 0.5 : 1 }}>
                  Today
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default SelectField;
