import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    style={{ display: 'block', objectFit: 'contain', borderRadius: 10, flex: 'none' }}
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
          >
            <LogoMark />
            <span data-kp-show="desktop" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.01em' }}>Kalgidhar Placements</span>
              <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 500, letterSpacing: '.01em' }}>
                Akal University · Eternal University
              </span>
            </span>
          </Link>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
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
