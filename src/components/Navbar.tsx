import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { Sun, Moon, User as UserIcon, LogOut, MessageCircle, Users, Menu } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { initials } from '@/utils/avatar';
import NotificationsBell from '@/components/NotificationsBell';
import Sidebar from '@/components/Sidebar';
import { logoutUser, clearAuth } from '@/context/auth/authSlice';
import { clearStudentState } from '@/context/student/studentSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LogoMark = ({ size = 46 }: { size?: number }) => (
  <img
    src="/logo2.png"
    alt="Kalgidhar Trust"
    width={size}
    height={size}
    style={{ display: 'block', objectFit: 'contain', borderRadius: 10, flex: 'none', transition: 'transform .25s cubic-bezier(.16,1,.3,1)' }}
  />
);

const iconBtn: React.CSSProperties = {
  width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
  background: 'var(--surface-2)', border: '1px solid var(--border)', textDecoration: 'none',
};

const Navbar: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.loading);
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleLogout = async () => {
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

  useEffect(() => {
    const onScroll = () => {
      const n = headerRef.current;
      if (!n) return;
      const s = (window.scrollY || document.documentElement.scrollTop || 0) > 6;
      n.style.borderBottomColor = s ? 'var(--border)' : 'transparent';
      n.style.boxShadow = s ? '0 8px 24px -20px rgba(0,0,0,.6)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const me = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 120,
          background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
          backdropFilter: 'saturate(140%) blur(12px)',
          WebkitBackdropFilter: 'saturate(140%) blur(12px)',
          borderBottom: '1px solid transparent',
          transition: 'border-color .2s ease, box-shadow .2s ease',
        }}
      >
        <div style={{ width: '100%', padding: '0 clamp(20px,3vw,48px)', height: 76, display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Menu button toggles the sliding sidebar */}
          <button
            data-sidebar-toggle
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{ ...iconBtn, color: 'var(--text)' }}
          >
            <Menu size={19} />
          </button>

          <Link
            to="/"
            aria-label="Kalgidhar Placements home"
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', flex: 'none' }}
            onMouseEnter={(e) => {
              const line = e.currentTarget.querySelector<HTMLElement>('[data-kp-logo-line]');
              const img = e.currentTarget.querySelector<HTMLElement>('img');
              if (line) line.style.width = '100%';
              if (img) img.style.transform = 'scale(1.07) rotate(-3deg)';
            }}
            onMouseLeave={(e) => {
              const line = e.currentTarget.querySelector<HTMLElement>('[data-kp-logo-line]');
              const img = e.currentTarget.querySelector<HTMLElement>('img');
              if (line) line.style.width = '0';
              if (img) img.style.transform = 'none';
            }}
          >
            <LogoMark />
            {/* Serif wordmark — the register identity, with a brass line that draws in on hover */}
            <span data-kp-show="desktop" style={{ position: 'relative', display: 'inline-block' }}>
              <span className="font-display" style={{ fontWeight: 550, fontSize: 27, letterSpacing: '-.018em', lineHeight: 1.15 }}>
                Kalgidhar Placements
              </span>
              <span aria-hidden data-kp-logo-line style={{
                position: 'absolute', left: 0, bottom: -4, height: 2, width: 0, borderRadius: 2,
                background: 'var(--brass)', transition: 'width .28s cubic-bezier(.16,1,.3,1)',
              }} />
            </span>
          </Link>

          {/* Primary navigation — right-aligned, sitting just before the account/actions (the sidebar keeps the full list) */}
          <nav data-kp-show="desktop" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
            {[
              { to: '/', label: 'Home', exact: true },
              { to: '/feed', label: 'Feed' },
              { to: '/students', label: 'Students' },
              { to: '/openings', label: 'Openings' },
              { to: '/companies', label: 'Companies' },
              ...(user ? [{ to: '/network', label: 'Network' }] : []),
            ].map(({ to, label, exact }) => {
              const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    position: 'relative', padding: '8px 13px', borderRadius: 'var(--r-ctl)', fontWeight: active ? 650 : 550,
                    fontSize: 14, textDecoration: 'none', color: active ? 'var(--text)' : 'var(--text-muted)',
                    background: active ? 'var(--surface-2)' : 'transparent',
                    transition: 'color .18s ease, background .18s ease, transform .18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text)';
                    if (!active) e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {label}
                  {active && <span aria-hidden style={{ position: 'absolute', left: 13, right: 13, bottom: 1, height: 2, borderRadius: 2, background: 'var(--brass)' }} />}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginLeft: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
              title="Toggle theme"
              style={iconBtn}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user && (
              <>
                <Link to="/messages" aria-label="Messages" style={iconBtn}>
                  <MessageCircle size={17} />
                </Link>
                <NotificationsBell />
              </>
            )}

            {loading ? (
              <span data-kp-sk="true" style={{ width: 34, height: 34, borderRadius: '50%' }} aria-hidden />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 600, fontSize: 14, color: '#fff', background: 'var(--primary)',
                      flex: 'none', cursor: 'pointer', border: '2px solid var(--bg-2)', boxShadow: '0 0 0 1px var(--border)',
                    }}
                  >
                    {initials(user.firstName, user.lastName) || 'U'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="z-300 min-w-48">
                  <DropdownMenuLabel>
                    <span style={{ display: 'block', textTransform: 'capitalize' }}>{me || 'Your account'}</span>
                    {user.auid && (
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>AUID {user.auid}</span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(user.roles?.includes('recruiter') ? `/companies/${user._id}` : '/profiles')}>
                    <UserIcon size={16} /> {user.roles?.includes('recruiter') ? 'Company profile' : 'View profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/network')}>
                    <Users size={16} /> My network
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '9px 17px', borderRadius: 'var(--r-ctl)',
                  background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 550, fontSize: 14, textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
