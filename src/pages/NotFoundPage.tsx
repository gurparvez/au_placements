import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/* Unknown URL — a directed dead-end in the register's voice, not a blank shell. */
const NotFoundPage: React.FC = () => (
  <section style={{ padding: '80px clamp(20px,10vw,112px) 100px', textAlign: 'center' }}>
    <div className="font-display data" style={{ fontSize: 'clamp(56px,10vw,96px)', fontWeight: 500, color: 'var(--brass)', lineHeight: 1 }}>404</div>
    <h1 className="font-display" style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, letterSpacing: '-.02em', margin: '18px 0 0' }}>
      This page is not in the register
    </h1>
    <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '12px auto 0', maxWidth: '44ch', textAlign: 'center', lineHeight: 1.6 }}>
      The address may be mistyped, or the entry may have been removed. Head back home or browse the student register.
    </p>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
      <Link
        to="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', transition: 'background .18s ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
      >
        <ArrowLeft size={16} /> Back to home
      </Link>
      <Link
        to="/students"
        style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', border: '1px solid var(--border-strong)', transition: 'background .18s ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
      >
        Browse the register
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
