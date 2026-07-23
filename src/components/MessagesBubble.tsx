import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X } from 'lucide-react';
import messagesApi from '@/api/messages';
import { getSocket } from '@/lib/socket';

// Loaded only when the popup first opens — keeps the messages code out of the main bundle.
const MessagesPanel = lazy(() => import('@/pages/Messages/MessagesPage').then((m) => ({ default: m.MessagesPanel })));

/* Messages popup — the icon toggles a large modal with the full two-pane
   inbox + thread UI. Portaled to <body>: the header's backdrop-filter would
   otherwise trap position:fixed descendants. */
const MessagesBubble: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  // Move focus into the dialog when it opens (keyboard/screen-reader entry point).
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const refresh = useCallback(async () => {
    try {
      const list = await messagesApi.listConversations();
      setUnread(list.reduce((n, c) => n + (c.unread || 0), 0));
    } catch { /* ignore */ }
  }, []);

  // Badge stays fresh: 30s poll as fallback, socket bump the instant a message lands.
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    const s = getSocket();
    s.on('message:new', refresh);
    return () => { clearInterval(t); s.off('message:new', refresh); };
  }, [refresh]);

  // Esc closes; opening a thread marks reads server-side, so refresh the badge on close.
  useEffect(() => {
    if (!open) { refresh(); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, refresh]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Messages"
        aria-expanded={open}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          // open = filled with the accent so the active state is unmistakable
          color: open ? 'var(--on-primary)' : 'var(--text-muted)',
          background: open ? 'var(--primary)' : 'var(--surface-2)',
          border: open ? '1px solid var(--primary)' : '1px solid var(--border)',
          transition: 'background .18s ease, color .18s ease, border-color .18s ease',
        }}
      >
        <MessageCircle size={17} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 999, background: 'var(--danger)', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Messages"
            style={{ position: 'relative', width: 'min(1080px, 96vw)', height: 'min(82vh, 720px)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--surface)' }}
          >
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>}>
              <MessagesPanel modal onNavigateAway={() => setOpen(false)} />
            </Suspense>
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label="Close messages"
              style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
            >
              <X size={17} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MessagesBubble;
