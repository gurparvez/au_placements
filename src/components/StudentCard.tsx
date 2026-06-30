import React from 'react';
import { Link } from 'react-router-dom';
import type { CardVM } from '@/utils/cardVM';

const onHover = (lift: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.transform = lift ? 'translateY(-3px)' : 'none';
  e.currentTarget.style.borderColor = lift ? 'var(--border-strong)' : 'var(--border)';
  e.currentTarget.style.boxShadow = lift ? '0 16px 32px -20px rgba(0,0,0,.4)' : 'var(--shadow)';
};

export default function StudentCard({ vm }: { vm: CardVM }) {
  return (
    <Link
      to={vm.href}
      aria-label={`View profile of ${vm.name}`}
      onMouseEnter={onHover(true)}
      onMouseLeave={onHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        padding: 18,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-card)',
        textDecoration: 'none',
        color: 'var(--text)',
        boxShadow: 'var(--shadow)',
        transition: 'border-color .18s,box-shadow .18s,transform .18s',
      }}
    >
      <span aria-hidden style={{ position: 'absolute', top: 18, right: 18, color: 'var(--text-subtle)', fontSize: 14 }}>↗</span>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingRight: 22 }}>
        <span
          aria-hidden
          style={{ width: 46, height: 46, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, color: '#fff', background: vm.avatarBg }}
        >
          {vm.initials}
        </span>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.25, letterSpacing: '-.01em' }}>{vm.name}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
            {vm.headline}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11.5, fontWeight: 550, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          {vm.oppLabel}
        </span>
        {vm.field && (
          <span style={{ fontSize: 11.5, fontWeight: 500, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
            {vm.field}
          </span>
        )}
      </div>

      {vm.metaText && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{vm.metaText}</div>}
      {vm.hasAvail && <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Available {vm.availLabel}</div>}

      {vm.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {vm.skills.map((sk, i) => (
            <span key={i} style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 'var(--r-chip)', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {sk}
            </span>
          ))}
          {vm.hasExtra && <span style={{ fontSize: 11.5, padding: '3px 8px', color: 'var(--text-subtle)' }}>+{vm.extra}</span>}
        </div>
      )}
    </Link>
  );
}
