import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import notificationsApi, { type AppNotification } from '@/api/notifications';

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

const NotificationsBell: React.FC = () => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try { setUnread(await notificationsApi.unreadCount()); } catch { /* ignore */ }
  }, []);

  // Poll unread count every 30s.
  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 30000);
    return () => clearInterval(t);
  }, [refreshCount]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
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
        onClick={toggle}
        aria-label="Notifications"
        style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 999, background: 'var(--danger)', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 340, maxHeight: 420, overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)', zIndex: 300 }}>
          <div style={{ padding: '12px 14px', fontWeight: 700, fontSize: 14, borderBottom: '1px solid var(--border)' }}>Notifications</div>
          {items.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>No notifications yet.</div>
          ) : (
            items.map((n) => (
              <button key={n._id} onClick={() => go(n)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', border: 'none', borderBottom: '1px solid var(--border)', background: n.read ? 'none' : 'var(--primary-soft)', cursor: 'pointer', fontSize: 13.5, color: 'var(--text)' }}>
                <span style={{ fontWeight: 650, textTransform: 'capitalize' }}>{fullName(n.actor)}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{n.text}</span>
                <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
