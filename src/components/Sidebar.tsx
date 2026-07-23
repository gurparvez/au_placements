import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { Home, Newspaper, GraduationCap, Briefcase, Building2, Users, Shield, Info, X, Search, Sun, Moon, MessageCircle, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { initials } from '@/utils/avatar';
import NotificationsBell from '@/components/NotificationsBell';
import { logoutUser, clearAuth } from '@/context/auth/authSlice';
import { clearStudentState } from '@/context/student/studentSlice';

interface Item {
  to: string;
  label: string;
  icon: React.ReactNode;
  show?: boolean;
  accent?: boolean;
}

const rowStyle = (active = false, accent = false): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 'var(--r-ctl)',
  textDecoration: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', width: '100%',
  textAlign: 'left', background: active ? 'var(--primary-soft)' : 'transparent',
  color: active || accent ? 'var(--primary)' : 'var(--text)',
});

const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isAdmin = !!user?.roles?.includes('admin');
  const isRecruiter = !!user?.roles?.includes('recruiter') && user?.status === 'active';
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement>(null);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Close on click outside the panel — but leave the rest of the page interactive
  // (no blocking overlay). Ignore the navbar toggle so it can still toggle.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(t) && !t.closest('[data-sidebar-toggle]')) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(clearAuth());
      dispatch(clearStudentState());
      navigate('/');
    }
  };

  // Every destination lives in the top bar on desktop; this mobile-only group
  // mirrors it for small screens where the top-bar links are hidden.
  const mobileItems: Item[] = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/feed', label: 'Feed', icon: <Newspaper size={18} /> },
    { to: '/students', label: 'Students', icon: <GraduationCap size={18} /> },
    { to: '/openings', label: 'Openings', icon: <Briefcase size={18} /> },
    { to: '/companies', label: 'Companies', icon: <Building2 size={18} /> },
    { to: '/network', label: 'My network', icon: <Users size={18} />, show: !!user },
    { to: '/about', label: 'About', icon: <Info size={18} /> },
    { to: '/search', label: 'Search', icon: <Search size={18} /> },
    { to: '/messages', label: 'Messages', icon: <MessageCircle size={18} />, show: !!user },
    { to: '/recruiter/openings', label: 'My openings', icon: <Briefcase size={18} />, show: isRecruiter || isAdmin, accent: true },
    { to: '/admin', label: 'Admin', icon: <Shield size={18} />, show: isAdmin, accent: true },
  ];

  const renderItem = (i: Item) => {
    const active = pathname === i.to;
    return (
      <Link
        key={i.to}
        to={i.to}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        style={rowStyle(active, i.accent)}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        {i.icon} {i.label}
      </Link>
    );
  };

  const hoverRow = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'var(--surface-2)'; },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'transparent'; },
  };

  // Auto-collapse shortly after the pointer leaves the panel (cancelled on re-enter).
  const leaveTimer = useRef<number | null>(null);
  const cancelLeave = () => { if (leaveTimer.current) { window.clearTimeout(leaveTimer.current); leaveTimer.current = null; } };
  useEffect(() => cancelLeave, []);

  return (
    <aside
      ref={ref}
      aria-hidden={!open}
      onMouseLeave={() => { cancelLeave(); leaveTimer.current = window.setTimeout(onClose, 350); }}
      onMouseEnter={cancelLeave}
      style={{
        /* Compact panel from the RIGHT — sized to its content, not the viewport */
        position: 'fixed', right: 10, top: 82, zIndex: 300,
        width: 'fit-content', minWidth: 224, maxWidth: 'min(80vw, 300px)',
        height: 'fit-content', maxHeight: 'calc(100vh - 96px)',
        background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: 12,
        display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', overflowX: 'visible',
        /* transform must clear entirely when open — a lingering translateX(0) makes
           this panel the containing block for the bell's position:fixed dropdown */
        transform: open ? 'none' : 'translateX(calc(100% + 14px))',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1), visibility .25s',
        boxShadow: open ? '0 12px 40px -12px rgba(0,0,0,.45)' : 'none',
        pointerEvents: open ? 'auto' : 'none',
        visibility: open ? 'visible' : 'hidden', // closed drawer leaves the tab order entirely
      }}
    >
      {/* header — identity when signed in, plus close (bell appears here only on mobile) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, padding: '0 4px' }}>
        {user ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <span aria-hidden style={{
              width: 30, height: 30, borderRadius: '50%', flex: 'none', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 600, fontSize: 12.5, color: 'var(--on-primary)', background: 'var(--primary)',
            }}>{initials(user.firstName, user.lastName) || 'U'}</span>
            <span style={{ fontWeight: 700, fontSize: 14.5, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Your account'}
            </span>
          </span>
        ) : (
          <span style={{ fontWeight: 700, fontSize: 15 }}>Menu</span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
          {user && <span data-kp-show="mobile"><NotificationsBell fixedPanel /></span>}
          <button onClick={onClose} aria-label="Close menu" style={{ width: 40, height: 40, borderRadius: 'var(--r-ctl)', cursor: 'pointer', color: 'var(--text)', border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </span>
      </div>

      {/* mobile-only: the primary nav (hidden from the top bar at this width) */}
      <div data-kp-show="mobile" style={{ flexDirection: 'column', gap: 4 }}>
        {mobileItems.filter((i) => i.show !== false).map(renderItem)}
        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
      </div>

      {/* account actions — profile, theme, and sign-out only */}
      {user && (
        <button
          onClick={() => { onClose(); navigate(user.roles?.includes('recruiter') ? `/companies/${user._id}` : '/profiles'); }}
          tabIndex={open ? 0 : -1} style={rowStyle()} {...hoverRow}
        >
          <UserIcon size={18} /> {user.roles?.includes('recruiter') ? 'Company profile' : 'View profile'}
        </button>
      )}

      <button onClick={() => setTheme(isDark ? 'light' : 'dark')} tabIndex={open ? 0 : -1} style={rowStyle()} {...hoverRow}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />} {isDark ? 'Light mode' : 'Dark mode'}
      </button>

      {user && (
        <button onClick={handleLogout} tabIndex={open ? 0 : -1} style={{ ...rowStyle(), color: 'var(--danger)' }} {...hoverRow}>
          <LogOut size={18} /> Log out
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
