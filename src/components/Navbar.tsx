import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/context/hooks';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { initials } from '@/utils/avatar';

const LogoMark = ({ size = 46 }: { size?: number }) => (
  <img
    src="/logo2.png"
    alt="Kalgidhar Trust"
    width={size}
    height={size}
    style={{ display: 'block', objectFit: 'contain', borderRadius: 10, flex: 'none' }}
  />
);

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/students', label: 'Register' },
  { to: '/about', label: 'About' },
];

const Navbar: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.loading);
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [mobileOpen, setMobileOpen] = useState(false);

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
  const navLinkStyle: React.CSSProperties = {
    padding: '8px 13px',
    borderRadius: 'var(--r-ctl)',
    textDecoration: 'none',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: 14,
  };

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
        <div
          style={{
            width: '100%',
            padding: '0 clamp(20px,3vw,48px)',
            height: 76,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <Link
            to="/"
            aria-label="Kalgidhar Placements home"
            onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', flex: 'none' }}
          >
            <LogoMark />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.01em' }}>Kalgidhar Placements</span>
              <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 500, letterSpacing: '.01em' }}>
                Akal University · Eternal University
              </span>
            </span>
          </Link>

          <nav data-kp-show="desktop" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            {NAV.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={navLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.background = 'var(--surface-2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              data-kp-show="desktop"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
              title="Toggle theme"
              style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {loading ? (
              <span data-kp-sk="true" style={{ width: 34, height: 34, borderRadius: '50%' }} aria-hidden />
            ) : user ? (
              <Link
                to="/profiles"
                aria-label="Your profile"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#fff',
                  background: 'var(--primary)',
                  textDecoration: 'none',
                  flex: 'none',
                  border: '2px solid var(--bg-2)',
                  boxShadow: '0 0 0 1px var(--border)',
                }}
              >
                {initials(user.firstName, user.lastName) || 'U'}
              </Link>
            ) : (
              <Link
                data-kp-show="desktop"
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '9px 17px',
                  borderRadius: 'var(--r-ctl)',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 550,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
            )}

            <button
              data-kp-show="mobile"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--r-ctl)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
                border: '1px solid var(--border-strong)',
                background: 'var(--surface)',
                fontSize: 18,
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.5)', animation: 'kpFade .15s ease' }} />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 'min(82vw,320px)',
              background: 'var(--bg-2)',
              borderLeft: '1px solid var(--border)',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              animation: 'kpPop .2s ease',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{ width: 34, height: 34, borderRadius: 'var(--r-ctl)', cursor: 'pointer', color: 'var(--text)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                ✕
              </button>
            </div>
            {NAV.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 14px', borderRadius: 'var(--r-ctl)', textDecoration: 'none', color: 'var(--text)', fontWeight: 550 }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 600, padding: '0 14px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Theme
            </span>
            <div style={{ display: 'flex', gap: 8, padding: '6px 10px' }}>
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    flex: 1,
                    padding: 9,
                    borderRadius: 'var(--r-ctl)',
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: theme === t ? 'var(--primary-soft)' : 'transparent',
                    color: theme === t ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 550,
                    fontSize: 13,
                    textTransform: 'capitalize',
                  }}
                >
                  {t === 'system' ? 'Auto' : t}
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            {!user ? (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', textDecoration: 'none', fontWeight: 600, textAlign: 'center' }}
              >
                Sign in
              </Link>
            ) : (
              <Link
                to="/profiles"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, textAlign: 'center' }}
              >
                Your profile
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
