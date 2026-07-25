import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import notificationsApi, { type AppNotification } from '@/api/notifications';
import { getSocket } from '@/lib/socket';

const fullName = (u?: { firstName?: string; lastName?: string }) =>
  u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : 'Someone';

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

/* fixedPanel: used inside the drawer, where the narrow panel would clip — the
   list drops in a fixed position over the page instead. */
const NotificationsBell: React.FC<{ fixedPanel?: boolean }> = ({ fixedPanel }) => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 66, right: 12 });

  const refreshCount = useCallback(async () => {
    try { setUnread(await notificationsApi.unreadCount()); } catch { /* ignore */ }
  }, []);

  // Real-time: bump the badge the instant a notification arrives.
  // The 30s poll stays as a fallback in case the socket is disconnected.
  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 30000);
    const s = getSocket();
    const onNew = () => {
      refreshCount();
      if (open) notificationsApi.list().then(({ items }) => setItems(items)).catch(() => {});
    };
    s.on('notification:new', onNew);
    return () => { clearInterval(t); s.off('notification:new', onNew); };
  }, [refreshCount, open]);

  // Close on outside click — the panel is portaled to <body>, so check it too.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    if (next && !fixedPanel && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: Math.round(r.bottom + 8), right: Math.max(8, Math.round(window.innerWidth - r.right)) });
    }
    setOpen(next);
    if (next) {
      try {
        const { items } = await notificationsApi.list();
        setItems(items);
        if (unread > 0) { await notificationsApi.markRead(); setUnread(0); }
      } catch { /* ignore */ }
    }
  };

  const go = (n: AppNotification) => {
    setOpen(false);
    if (n.type === 'message' && n.entity) navigate(`/messages?c=${n.entity.id}`);
    else if (n.type === 'recruiter_approved' || n.type === 'application') navigate('/recruiter/openings');
    else if (n.type === 'connection_request' || n.type === 'connection_accepted') navigate('/network');
    else if (n.type === 'follow') navigate(n.entity ? `/profiles/${n.entity.id}` : '/companies');
    else navigate('/feed');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="Notifications"
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          // open = filled with the accent so the active state is unmistakable
          color: open ? 'var(--on-primary)' : 'var(--text)',
          background: open ? 'var(--primary)' : 'var(--surface)',
          transition: 'background .18s ease, color .18s ease',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'var(--surface)'; }}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 999, background: 'var(--danger)', color: '#fff', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && createPortal(
        <div ref={panelRef} style={{
          position: 'fixed', top: fixedPanel ? 66 : pos.top, right: fixedPanel ? 12 : pos.right,
          width: 'min(340px, calc(100vw - 24px))', maxHeight: 420, overflow: 'auto', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)', zIndex: 400,
        }}>
          <div style={{ padding: '12px 14px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--border)' }}>Notifications</div>
          {items.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14.5 }}>No notifications yet.</div>
          ) : (
            items.map((n) => (
              <button key={n._id} onClick={() => go(n)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', border: 'none', borderBottom: '1px solid var(--border)', background: n.read ? 'none' : 'var(--primary-soft)', cursor: 'pointer', fontSize: 14.5, color: 'var(--text)' }}>
                <span style={{ fontWeight: 650, textTransform: 'capitalize' }}>{fullName(n.actor)}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{n.text}</span>
                <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationsBell;
