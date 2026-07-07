import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import type { CardVM } from '@/utils/cardVM';

const onHover = (lift: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.transform = lift ? 'translateY(-4px)' : 'none';
  e.currentTarget.style.borderColor = lift ? 'color-mix(in srgb, var(--primary) 40%, var(--border))' : 'var(--border)';
  e.currentTarget.style.boxShadow = lift ? '0 20px 38px -22px rgba(0,0,0,.45)' : 'var(--shadow)';
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
        gap: 12,
        padding: 18,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-card)',
        textDecoration: 'none',
        color: 'var(--text)',
        boxShadow: 'var(--shadow)',
        transition: 'border-color .18s, box-shadow .18s, transform .18s',
      }}
    >
      {/* header: avatar + name + arrow */}
      <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
        <span
          aria-hidden
          style={{
            width: 52, height: 52, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 600, fontSize: 17, color: '#fff', background: vm.avatarBg,
            boxShadow: '0 0 0 3px var(--surface), 0 0 0 4px var(--border)',
          }}
        >
          {vm.initials}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 650, fontSize: 16, lineHeight: 1.25, letterSpacing: '-.01em', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vm.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {vm.headline || '—'}
          </div>
        </div>
        <span aria-hidden style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          <ArrowUpRight size={15} />
        </span>
      </div>

      {/* badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          {vm.oppLabel}
        </span>
        {vm.field && (
          <span style={{ fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
            {vm.field}
          </span>
        )}
      </div>

      {vm.metaText && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{vm.metaText}</div>}
      {vm.hasAvail && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-subtle)' }}>
          <CalendarClock size={13} /> Available {vm.availLabel}
        </div>
      )}

      {vm.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {vm.skills.map((sk, i) => (
            <span key={i} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 'var(--r-chip)', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {sk}
            </span>
          ))}
          {vm.hasExtra && <span style={{ fontSize: 11.5, padding: '3px 4px', color: 'var(--text-subtle)', fontWeight: 550 }}>+{vm.extra}</span>}
        </div>
      )}
    </Link>
  );
}
