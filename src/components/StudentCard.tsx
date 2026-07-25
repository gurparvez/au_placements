import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowUpRight, CalendarClock, BadgeCheck } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import type { CardVM } from '@/utils/cardVM';

/* Register profile card — soft, matching the site, with two LIVE signals: a
   slow light orbits each avatar, and a radar-ping beacon pulses on the status.
   Hover layers on: a lift with a hue-tinted glow, a glare sweep, a charging
   arrow, and skill chips that spring. Kept minimal — each motion is subtle. */
const MotionLink = motion.create(Link);
const tintOf = (hue: string, amount: number) => `color-mix(in srgb, ${hue} ${amount}%, var(--surface))`;
const EASE = [0.16, 1, 0.3, 1] as const;

export default function StudentCard({ vm }: { vm: CardVM }) {
  const hue = vm.avatarBg;
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  return (
    <MotionLink
      to={vm.href}
      data-theme="light"
      aria-label={`View profile of ${vm.name}`}
      onClick={(e) => { if (!user) { e.preventDefault(); toast.error('Sign in to view profiles.'); navigate('/login'); } }}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.985 }}
      variants={{ rest: { y: 0 }, hover: { y: -6 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        padding: 18,
        height: '100%',
        boxSizing: 'border-box',
        background: tintOf(hue, 18),
        border: `1px solid color-mix(in srgb, ${hue} 28%, var(--border))`,
        borderRadius: 'var(--r-card)',
        textDecoration: 'none',
        color: 'var(--text)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        transition: 'border-color .22s ease, box-shadow .22s ease, background .22s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${hue} 42%, var(--border))`;
        e.currentTarget.style.boxShadow = `0 24px 48px -24px color-mix(in srgb, ${hue} 45%, transparent)`;
        e.currentTarget.style.background = tintOf(hue, 24);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `color-mix(in srgb, ${hue} 28%, var(--border))`;
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.background = tintOf(hue, 18);
      }}
    >
      {/* hover glare — a soft diagonal light slides across */}
      <motion.span
        aria-hidden
        variants={{ rest: { x: '-130%' }, hover: { x: '230%' } }}
        transition={{ duration: 0.75, ease: EASE }}
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '55%', pointerEvents: 'none', zIndex: 2,
          background: 'linear-gradient(105deg, transparent, color-mix(in srgb, #ffffff 20%, transparent), transparent)',
          transform: 'skewX(-14deg)',
        }}
      />

      {/* ── header: live-ring avatar · name · arrow ── */}
      <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ position: 'relative', width: 56, height: 56, flex: 'none' }}>
          {/* LIVE: a light continuously sweeps the ring */}
          <span aria-hidden style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${hue}, color-mix(in srgb, ${hue} 0%, transparent) 55%, ${hue})`,
            animation: 'kpRingSpin 5s linear infinite',
          }} />
          <span aria-hidden style={{
            position: 'absolute', inset: 3, borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff', background: hue,
            border: '2px solid var(--surface)',
          }}>
            {vm.initials}
          </span>
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 18.5, lineHeight: 1.2, letterSpacing: '-.01em', textTransform: 'capitalize' }}>{vm.name}</span>
            <BadgeCheck size={15} aria-hidden style={{ color: 'var(--brass)', flex: 'none' }} />
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.35, marginTop: 1 }}>
            {vm.headline || '—'}
          </div>
        </div>
        <motion.span
          aria-hidden
          variants={{ rest: { x: 0, y: 0, rotate: 0 }, hover: { x: 3, y: -3, rotate: 45 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          <ArrowUpRight size={15} />
        </motion.span>
      </div>

      {/* ── status: beacon pill (LIVE ping) + field ── */}
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 650, padding: '4px 12px 4px 10px', borderRadius: 6, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <span aria-hidden style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--primary)', animation: 'kpPing 1.8s ease-out infinite' }} />
            <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
          </span>
          {vm.oppLabel}
        </span>
        {vm.field && (
          <span style={{ fontSize: 13.5, fontWeight: 550, color: 'var(--text-muted)' }}>
            {vm.field}
          </span>
        )}
      </div>

      {/* ── meta + availability ── */}
      {vm.metaText && <div style={{ position: 'relative', fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{vm.metaText}</div>}
      {vm.hasAvail && (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-subtle)' }}>
          <CalendarClock size={13} /> Available {vm.availLabel}
        </div>
      )}

      {/* ── skills ── */}
      {vm.skills.length > 0 && (
        <div style={{ position: 'relative', marginTop: 'auto', paddingTop: 13, fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {vm.skills.map((sk, i) => (
            <span key={i}>
              {i > 0 && <span style={{ color: 'var(--text-subtle)', margin: '0 7px' }}>·</span>}
              {sk}
            </span>
          ))}
          {vm.hasExtra && <span style={{ color: 'var(--text-subtle)', fontWeight: 650, marginLeft: 7 }}>+{vm.extra}</span>}
        </div>
      )}
    </MotionLink>
  );
}
