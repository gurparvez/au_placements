import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/context/hooks';
import { Home, Newspaper, GraduationCap, Briefcase, Building2, Users, Shield, Info, X } from 'lucide-react';

interface Item {
  to: string;
  label: string;
  icon: React.ReactNode;
  show?: boolean;
  accent?: boolean;
}

const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = !!user?.roles?.includes('admin');
  const isRecruiter = !!user?.roles?.includes('recruiter') && user?.status === 'active';
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement>(null);

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

  const items: Item[] = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/feed', label: 'Feed', icon: <Newspaper size={18} /> },
    { to: '/students', label: 'Register', icon: <GraduationCap size={18} /> },
    { to: '/openings', label: 'Openings', icon: <Briefcase size={18} /> },
    { to: '/companies', label: 'Companies', icon: <Building2 size={18} /> },
    { to: '/network', label: 'My network', icon: <Users size={18} />, show: !!user },
    { to: '/recruiter/openings', label: 'My openings', icon: <Briefcase size={18} />, show: isRecruiter, accent: true },
    { to: '/admin', label: 'Admin', icon: <Shield size={18} />, show: isAdmin, accent: true },
    { to: '/about', label: 'About', icon: <Info size={18} /> },
  ];

  return (
    <aside
      ref={ref}
      aria-hidden={!open}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 'min(80vw,270px)', zIndex: 300,
        background: 'var(--bg-2)', borderRight: '1px solid var(--border)', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto',
        transform: open ? 'translateX(0)' : 'translateX(-105%)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '0 12px 40px -12px rgba(0,0,0,.45)' : 'none',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Menu</span>
        <button onClick={onClose} aria-label="Close menu" style={{ width: 34, height: 34, borderRadius: 'var(--r-ctl)', cursor: 'pointer', color: 'var(--text)', border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} />
        </button>
      </div>

      {items
        .filter((i) => i.show !== false)
        .map((i) => {
          const active = pathname === i.to;
          return (
            <Link
              key={i.to}
              to={i.to}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 'var(--r-ctl)',
                textDecoration: 'none', fontWeight: 600, fontSize: 14,
                color: active || i.accent ? 'var(--primary)' : 'var(--text)',
                background: active ? 'var(--primary-soft)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {i.icon} {i.label}
            </Link>
          );
        })}
    </aside>
  );
};

export default Sidebar;
