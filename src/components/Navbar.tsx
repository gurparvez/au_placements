import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/context/hooks';
import { Menu } from 'lucide-react';
import { initials } from '@/utils/avatar';
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
        <div style={{ width: '100%', padding: '0 12px 0 clamp(20px,3vw,48px)', height: 76, display: 'flex', alignItems: 'center', gap: 14 }}>
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
              { to: '/about', label: 'About' },
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

          <div style={{ marginLeft: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            {loading ? (
              <span data-kp-sk="true" style={{ width: 38, height: 38, borderRadius: '50%' }} aria-hidden />
            ) : (
              <>
                {!user && (
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
                {/* Single toggle — the account initial opens the drawer with all actions inside */}
                <button
                  data-sidebar-toggle
                  onClick={() => setSidebarOpen((o) => !o)}
                  aria-label="Toggle menu"
                  style={
                    user
                      ? {
                          width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 600, fontSize: 14, color: 'var(--on-primary)', background: 'var(--primary)',
                          flex: 'none', cursor: 'pointer', border: '2px solid var(--bg-2)', boxShadow: '0 0 0 1px var(--border)',
                        }
                      : {
                          width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', color: 'var(--text)',
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                        }
                  }
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
