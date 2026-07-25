import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/context/hooks';
import { motion } from 'motion/react';
import { Menu, Search } from 'lucide-react';
import { initials } from '@/utils/avatar';
import NotificationsBell from '@/components/NotificationsBell';
import MessagesBubble from '@/components/MessagesBubble';
import Sidebar from '@/components/Sidebar';

/* Two marks, one visible at a time — CSS (data-kp-logo) swaps them with the theme */
const logoImgStyle: React.CSSProperties = { objectFit: 'contain', borderRadius: 10, flex: 'none', transition: 'transform .25s cubic-bezier(.16,1,.3,1)' };
const LogoMark = ({ size = 46 }: { size?: number }) => (
  <>
    <img data-kp-logo="light" src="/logo_light.png" alt="Kalgidhar Trust" width={size} height={size} style={logoImgStyle} />
    <img data-kp-logo="dark" src="/logo2.png" alt="Kalgidhar Trust" width={size} height={size} style={logoImgStyle} />
  </>
);

const Navbar: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = !!user?.roles?.includes('admin');
  const isRecruiter = !!user?.roles?.includes('recruiter') && user?.status === 'active';

  useEffect(() => {
    const onScroll = () => {
      const n = headerRef.current;
      if (!n) return;
      const s = (window.scrollY || document.documentElement.scrollTop || 0) > 6;
      n.style.borderBottomColor = s ? 'var(--border)' : 'transparent';
      n.style.boxShadow = s ? 'var(--shadow)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="kp-onblue"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 120,
          background: 'var(--pri)',
          color: 'var(--text)',
          borderBottom: '1px solid transparent',
          transition: 'border-color .2s ease, box-shadow .2s ease',
        }}
      >
        {/* flowing colour band along the bottom edge */}
        <span aria-hidden className="kp-grad-rule" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, opacity: 0.7, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', width: '100%', padding: '0 12px 0 clamp(20px,3vw,48px)', height: 76, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            to="/"
            aria-label="Kalgidhar Placements home"
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', flex: 'none' }}
            onMouseEnter={(e) => {
              const line = e.currentTarget.querySelector<HTMLElement>('[data-kp-logo-line]');
              if (line) line.style.width = '100%';
              e.currentTarget.querySelectorAll<HTMLElement>('img').forEach((img) => { img.style.transform = 'scale(1.07) rotate(-3deg)'; });
            }}
            onMouseLeave={(e) => {
              const line = e.currentTarget.querySelector<HTMLElement>('[data-kp-logo-line]');
              if (line) line.style.width = '0';
              e.currentTarget.querySelectorAll<HTMLElement>('img').forEach((img) => { img.style.transform = 'none'; });
            }}
          >
            <LogoMark />
            {/* Serif wordmark — the register identity, with a brass line that draws in on hover */}
            <span data-kp-show="desktop" style={{ position: 'relative', display: 'inline-block' }}>
              <span className="font-display" style={{ fontWeight: 550, fontSize: 28, letterSpacing: '-.018em', lineHeight: 1.15 }}>
                Kalgidhar Placements
              </span>
              <span aria-hidden data-kp-logo-line style={{
                position: 'absolute', left: 0, bottom: -4, height: 2, width: 0, borderRadius: 2,
                background: 'var(--brass)', transition: 'width .28s cubic-bezier(.16,1,.3,1)',
              }} />
            </span>
          </Link>

          {/* Primary navigation — right-aligned; role destinations surface here, the drawer keeps only account actions */}
          <nav data-kp-show="desktop" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
            {[
              { to: '/', label: 'Home', exact: true },
              { to: '/students', label: 'Students' },
              { to: '/openings', label: 'Openings' },
              { to: '/companies', label: 'Companies' },
              ...(user ? [{ to: '/network', label: 'Network' }] : []),
              ...(user ? [{ to: '/feed', label: 'Feed' }] : []),
              ...(isRecruiter || isAdmin ? [{ to: '/recruiter/openings', label: 'My openings' }] : []),
              ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
            ].map(({ to, label, exact }) => {
              const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    position: 'relative', padding: '9px 15px', borderRadius: 'var(--r-ctl)', fontWeight: active ? 800 : 650,
                    fontSize: active ? 17.5 : 16, textDecoration: 'none', color: active ? 'var(--pri-ink)' : 'var(--text-muted)',
                    background: 'transparent',
                    transition: 'color .18s ease, transform .18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* active-page marker — no box; the label brightens, grows a touch, and the underline slides */}
                  <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-active-bar"
                      aria-hidden
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      style={{ position: 'absolute', left: 12, right: 12, bottom: -2, height: 3, borderRadius: 3, background: 'var(--primary)', zIndex: 1 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginLeft: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            {loading ? (
              <span data-kp-sk="true" style={{ width: 38, height: 38, borderRadius: '50%' }} aria-hidden />
            ) : (
              <>
                {/* Search — a round icon button matching the bell; fills when on /search */}
                <Link
                  to="/search"
                  aria-label="Search"
                  data-kp-show="desktop"
                  style={{
                    position: 'relative', width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: pathname === '/search' ? 'var(--on-primary)' : 'var(--text)',
                    background: pathname === '/search' ? 'var(--primary)' : 'var(--surface)',
                    textDecoration: 'none', transition: 'background .18s ease, color .18s ease',
                  }}
                  onMouseEnter={(e) => { if (pathname !== '/search') e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={(e) => { if (pathname !== '/search') e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <Search size={17} />
                </Link>
                {user && (
                  <>
                    <span data-kp-show="desktop"><MessagesBubble /></span>
                    <span data-kp-show="desktop"><NotificationsBell /></span>
                  </>
                )}
                {!user && (
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '9px 17px', border: 'none', borderRadius: 'var(--r-ctl)',
                      background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
                      transition: 'background .18s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
                  >
                    Sign in
                  </Link>
                )}
                {/* Single toggle — the account initial opens the drawer with profile, theme, and logout */}
                <button
                  data-sidebar-toggle
                  onClick={() => setSidebarOpen((o) => !o)}
                  aria-label="Toggle menu"
                  style={
                    user
                      ? {
                          width: 38, height: 38, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, fontSize: 15, color: 'var(--on-primary)', background: 'var(--primary)',
                          flex: 'none', cursor: 'pointer', transition: 'background .18s ease',
                        }
                      : {
                          width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', color: 'var(--text)',
                          background: 'var(--surface)', transition: 'background .18s ease',
                        }
                  }
                  onMouseEnter={(e) => { e.currentTarget.style.background = user ? 'var(--primary-hover)' : 'var(--surface-2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = user ? 'var(--primary)' : 'var(--surface)'; }}
                >
                  {user ? initials(user.firstName, user.lastName) || 'U' : <Menu size={19} />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
