import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/* Token-styled replacement for window.confirm — one host, promise-based API.
   Usage: if (!(await confirmDialog({ title: 'Delete this post?', danger: true }))) return; */

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** destructive actions get the red confirm button */
  danger?: boolean;
}

type Pending = { opts: ConfirmOptions; resolve: (ok: boolean) => void };

let opener: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  // Host not mounted (tests, early calls) — fall back to the native dialog.
  if (!opener) return Promise.resolve(window.confirm(opts.message ? `${opts.title}\n\n${opts.message}` : opts.title));
  return opener(opts);
}

export const ConfirmHost: React.FC = () => {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    opener = (opts) => new Promise<boolean>((resolve) => setPending({ opts, resolve }));
    return () => { opener = null; };
  }, []);

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  // Esc cancels; initial focus lands on the safe (cancel) button.
  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const o = pending?.opts;

  return (
    <AnimatePresence>
      {o && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={() => close(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={o.title}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{
              position: 'relative', width: 'min(420px, 100%)', padding: '22px 22px 18px',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow)',
            }}
          >
            <div className="brass-rule" style={{ marginBottom: 12, background: o.danger ? 'var(--danger)' : undefined }} />
            <h2 className="font-display" style={{ fontSize: 18.5, fontWeight: 500, letterSpacing: '-.015em', margin: 0, lineHeight: 1.3 }}>{o.title}</h2>
            {o.message && (
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '9px 0 0', lineHeight: 1.55, textAlign: 'left' }}>{o.message}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                ref={cancelRef}
                onClick={() => close(false)}
                style={{ padding: '9px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: 13.5, border: '1px solid var(--border)', cursor: 'pointer', transition: 'background .15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              >
                {o.cancelLabel ?? 'Cancel'}
              </button>
              <button
                onClick={() => close(true)}
                style={{
                  padding: '9px 16px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 13.5, border: 'none', cursor: 'pointer', transition: 'filter .15s ease',
                  background: o.danger ? 'var(--danger)' : 'var(--primary)', color: o.danger ? '#fff' : 'var(--on-primary)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
              >
                {o.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
