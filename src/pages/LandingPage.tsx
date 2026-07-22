import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Users, Briefcase, Building2, Newspaper,
  MessageCircle, UserPlus, GraduationCap, Search, Send, MapPin,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import StudentCard from '@/components/StudentCard';
import { studentToCardVM, type CardVM } from '@/utils/cardVM';
import { Reveal, Stagger, StaggerItem, AnimatedNumber } from '@/components/motion';

const EASE = [0.16, 1, 0.3, 1] as const;
const MotionLink = motion.create(Link);

const STATS = [
  { value: 120, suffix: '+', label: 'Students registered' },
  { value: 30, suffix: '+', label: 'Partner companies' },
  { value: 2, suffix: '', label: 'University campuses' },
  { value: 50, suffix: '+', label: 'Recruitment drives' },
];

const FEATURES = [
  { icon: Users, tone: '#2563eb', title: 'Rich student profiles', body: 'Skills, projects, and experience in one profile.' },
  { icon: Newspaper, tone: '#d97706', title: 'Community feed', body: 'Post updates, mention peers, react, comment.' },
  { icon: Briefcase, tone: '#0d9488', title: 'Internships & jobs', body: 'Browse and apply to recruiter openings.' },
  { icon: Building2, tone: '#a855f7', title: 'Company directory', body: 'Follow companies hiring from your campus.' },
  { icon: UserPlus, tone: '#16a34a', title: 'Connections', body: 'Build a lasting professional network.' },
  { icon: MessageCircle, tone: '#ec4899', title: 'Direct messaging', body: 'Message peers and recruiters directly.' },
];

const STEPS = [
  { icon: GraduationCap, n: '01', title: 'Build your profile', body: 'Sign in and set up your profile.' },
  { icon: Search, n: '02', title: 'Get discovered', body: 'Recruiters filter the register to find you.' },
  { icon: Send, n: '03', title: 'Connect & get hired', body: 'Get messaged and apply to openings.' },
];

/* ---- shared styles ---- */
const GUTTER = 'clamp(20px,10vw,112px)';
const wrap: React.CSSProperties = { width: '100%', padding: `0 ${GUTTER}` };
const para: React.CSSProperties = { textAlign: 'left' };
const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 'var(--r-ctl)',
  background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
  transition: 'background .18s ease',
};
const ctaOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '13px 22px', borderRadius: 'var(--r-ctl)',
  background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
  border: '1px solid var(--border-strong)', transition: 'background .18s ease, border-color .18s ease',
};
const chip = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 11.5, fontWeight: 550, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: bg, color, whiteSpace: 'nowrap',
});

/* Hover feedback for inline-styled links/buttons (keeps this file's inline convention). */
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

/* Headline rises word by word — the page's one flourish. */
const HeadlineWords: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.07 }}
        >
          {w + (i < words.length - 1 ? ' ' : '')}
        </motion.span>
      ))}
    </>
  );
};

/* One consistent section opener: brass rule · eyebrow · serif title (· action). */
const SectionHead: React.FC<{ eyebrow: string; title: string; action?: React.ReactNode }> = ({ eyebrow, title, action }) => (
  <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 34 }}>
    <div style={{ maxWidth: 640, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.span
          className="brass-rule"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ transformOrigin: 'left center' }}
        />
        <span className="ledger-label" style={{ color: 'var(--brass)' }}>{eyebrow}</span>
      </div>
      <h2 className="font-display" style={{ fontSize: 'clamp(27px,3.4vw,36px)', letterSpacing: '-.02em', fontWeight: 500, margin: '12px 0 0', lineHeight: 1.12, textWrap: 'balance' }}>
        {title}
      </h2>
    </div>
    {action}
  </Reveal>
);

/* A single row in the live register panel. */
const RegisterRow: React.FC<{ vm: CardVM; i: number }> = ({ vm, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE, delay: 0.35 + i * 0.1 }}
  >
    <Link
      to={vm.href}
      aria-label={`View profile of ${vm.name}`}
      style={{
        display: 'flex', gap: 12, alignItems: 'center', padding: '13px 6px', textDecoration: 'none', color: 'var(--text)',
        borderTop: i === 0 ? 'none' : '1px solid var(--border)', borderRadius: 8,
        transition: 'background .15s ease, transform .18s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
    >
      <span aria-hidden style={{ width: 42, height: 42, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, color: '#fff', background: vm.avatarBg }}>
        {vm.initials}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontWeight: 650, fontSize: 14.5, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vm.name}</span>
          <BadgeCheck size={14} aria-hidden style={{ color: 'var(--brass)', flex: 'none' }} />
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {vm.headline || vm.field || 'Student · Open to opportunities'}
        </div>
      </div>
      <span style={chip('var(--primary-soft)', 'var(--primary)')}>{vm.oppLabel}</span>
    </Link>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { allStudents } = useAppSelector((s) => s.student);

  useEffect(() => {
    if (!allStudents) dispatch(fetchAllStudents());
  }, [dispatch, allStudents]);

  const cards = (allStudents ?? []).map(studentToCardVM);
  const total = allStudents?.length ?? 0;
  const heroRows = cards.slice(0, 3);
  const gridCards = cards.slice(0, 6);

  return (
    <>
      {/* ===================== MASTHEAD STRIP ===================== */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ ...wrap, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="ledger-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Akal University · Eternal University
          </span>
          <span className="ledger-label" data-kp-show="desktop" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <motion.span
              aria-hidden
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brass)' }}
              animate={{ scale: [1, 1.45, 1], opacity: [1, 0.55, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            The Official Placement Register · Vol. 2026
          </span>
        </div>
      </div>

      {/* ===================== HERO ===================== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* ambient brass glow, slowly breathing */}
        <motion.div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(52% 70% at 88% -10%, color-mix(in srgb, var(--brass) 10%, transparent), transparent 62%)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div style={{ position: 'relative', padding: `56px ${GUTTER} 60px` }}>
          <div data-kp-hero="true" style={{ display: 'grid', gridTemplateColumns: '1.02fr .98fr', gap: 52, alignItems: 'center' }}>
            {/* ---- left: masthead (staggered entrance) ---- */}
            <div>
              <motion.div
                className="brass-rule"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                style={{ marginBottom: 16, transformOrigin: 'left center' }}
              />
              <motion.span
                className="ledger-label"
                style={{ color: 'var(--text-muted)', display: 'inline-block' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
              >
                The Akal &amp; Eternal Register
              </motion.span>
              <h1 className="font-display" style={{ fontSize: 'clamp(38px,5.4vw,60px)', lineHeight: 1.04, letterSpacing: '-.02em', fontWeight: 500, margin: '14px 0 0', maxWidth: '15ch', textWrap: 'balance' }}>
                <HeadlineWords text="Where campus talent meets opportunity." />
              </h1>
              <motion.p
                style={{ ...para, fontSize: 'clamp(15px,1.5vw,17.5px)', color: 'var(--text-muted)', margin: '20px 0 0', maxWidth: '50ch', lineHeight: 1.65 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.5 }}
              >
                One verified profile, read by every recruiter. Share your work, follow hiring companies,
                and get contacted directly.
              </motion.p>
              <motion.div
                style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.62 }}
              >
                <MotionLink to="/students" style={ctaPrimary} {...hoverBg('var(--primary-hover)', 'var(--primary)')} whileHover="h" whileTap={{ scale: 0.98 }}>
                  Explore the register
                  <motion.span variants={{ h: { x: 4 } }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} style={{ display: 'inline-flex' }}>
                    <ArrowRight size={17} />
                  </motion.span>
                </MotionLink>
                {user ? (
                  <MotionLink to="/feed" style={ctaOutline} {...hoverBg('var(--surface-2)', 'var(--surface)')} whileTap={{ scale: 0.98 }}>Go to your feed</MotionLink>
                ) : (
                  <MotionLink to="/login" style={ctaOutline} {...hoverBg('var(--surface-2)', 'var(--surface)')} whileTap={{ scale: 0.98 }}>Sign in</MotionLink>
                )}
              </motion.div>
              <motion.div
                style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 30, flexWrap: 'wrap' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div style={{ display: 'flex' }} aria-hidden>
                  {[['HK', '#2563EB'], ['AM', '#4F6B8F'], ['NS', '#3F7D8C']].map(([t, bg], i) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.85 + i * 0.08 }}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: bg, border: '2px solid var(--bg)', marginLeft: i ? -9 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}
                    >
                      {t}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 1.1 }}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-3)', border: '2px solid var(--bg)', marginLeft: -9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
                  >
                    +120
                  </motion.span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--text-muted)' }}>
                  <BadgeCheck size={15} aria-hidden style={{ color: 'var(--brass)' }} /> Verified by the universities
                </span>
              </motion.div>
            </div>

            {/* ---- right: live register panel ---- */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--shadow)', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '15px 18px', borderBottom: '2px solid var(--brass)' }}>
                  <span className="ledger-label" style={{ color: 'var(--text)' }}>The Register</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}>
                    <motion.span
                      aria-hidden
                      style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }}
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    Live
                  </span>
                </div>

                <div style={{ padding: '4px 12px' }}>
                  {heroRows.length > 0 ? (
                    heroRows.map((vm, i) => <RegisterRow key={vm.id} vm={vm} i={i} />)
                  ) : (
                    [0, 1, 2].map((i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 4px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                        <span data-kp-sk="true" style={{ width: 42, height: 42, borderRadius: '50%', flex: 'none' }} />
                        <div style={{ flex: 1 }}>
                          <span data-kp-sk="true" style={{ display: 'block', height: 12, width: '55%', marginBottom: 7 }} />
                          <span data-kp-sk="true" style={{ display: 'block', height: 10, width: '75%' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <MotionLink
                  to="/students"
                  whileHover="h"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '13px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)', textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13.5, transition: 'background .15s ease' }}
                  {...hoverBg('var(--surface-2)', 'var(--bg-2)')}
                >
                  <span>{total > 0 ? `See all ${total} in the register` : 'Browse the register'}</span>
                  <motion.span variants={{ h: { x: 4 } }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} style={{ display: 'inline-flex' }}>
                    <ArrowRight size={16} />
                  </motion.span>
                </MotionLink>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== STATS (ledger band) ===================== */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ padding: `26px ${GUTTER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <motion.span
              className="brass-rule"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ transformOrigin: 'left center' }}
            />
            <span className="ledger-label">By the numbers</span>
          </div>
          <Stagger className="kp-ledger" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {STATS.map((st, i) => (
              <StaggerItem key={st.label} style={{ paddingLeft: i === 0 ? 0 : 22, paddingRight: 22 }}>
                <div className="font-display data" style={{ fontSize: 'clamp(30px,3.6vw,40px)', fontWeight: 500, letterSpacing: '-.01em', lineHeight: 1 }}>
                  <AnimatedNumber value={st.value} suffix={st.suffix} />
                </div>
                <div className="ledger-label" style={{ marginTop: 8, letterSpacing: '.08em' }}>{st.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===================== FROM THE REGISTER (proof first) ===================== */}
      {gridCards.length > 0 && (
        <section style={{ padding: `68px ${GUTTER} 0` }}>
          <SectionHead
            eyebrow="From the register"
            title="Talent, currently open to work."
            action={(
              <MotionLink to="/students" whileHover="h" whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 550, fontSize: 14, textDecoration: 'none', transition: 'background .15s ease' }} {...hoverBg('var(--surface-2)', 'var(--surface)')}>
                See all
                <motion.span variants={{ h: { x: 3 } }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} style={{ display: 'inline-flex' }}>
                  <ArrowRight size={15} />
                </motion.span>
              </MotionLink>
            )}
          />
          {/* Locked to 3 columns so six cards always tile 3×2 with no orphans (stacks on mobile). */}
          <Stagger stagger={0.07}>
            <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
              {gridCards.map((vm) => (
                <StaggerItem key={vm.id} style={{ minWidth: 0, height: '100%' }}>
                  <StudentCard vm={vm} />
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </section>
      )}

      {/* ===================== FEATURES (hairline lattice — no boxes) ===================== */}
      <section style={{ padding: `76px ${GUTTER} 0` }}>
        <SectionHead eyebrow="The platform" title="A full campus network, not just a directory." />
        {/* Locked to 3 columns — six cells always tile a full 3×2 brick lattice. */}
        <Stagger stagger={0.06}>
          <div data-kp-browse="true" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
            gap: 1, background: 'var(--border)', border: '1px solid var(--border)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {FEATURES.map((f) => (
              <StaggerItem
                key={f.title}
                style={{ background: `color-mix(in srgb, ${f.tone} 12%, var(--surface))`, padding: '26px 24px', transition: 'background .18s ease', cursor: 'default' }}
              >
                <div
                  onMouseEnter={(e) => { (e.currentTarget.parentElement as HTMLElement).style.background = `color-mix(in srgb, ${f.tone} 20%, var(--surface))`; }}
                  onMouseLeave={(e) => { (e.currentTarget.parentElement as HTMLElement).style.background = `color-mix(in srgb, ${f.tone} 12%, var(--surface))`; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <f.icon size={17} aria-hidden style={{ color: f.tone, flex: 'none' }} />
                    <h3 style={{ fontSize: 15.5, fontWeight: 650, margin: 0, letterSpacing: '-.01em' }}>{f.title}</h3>
                  </div>
                  <p style={{ ...para, fontSize: 13.5, color: 'var(--text-muted)', margin: '9px 0 0', lineHeight: 1.6 }}>{f.body}</p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      </section>

      {/* ===================== HOW IT WORKS (sequence) ===================== */}
      <section style={{ padding: `76px ${GUTTER} 72px` }}>
        <SectionHead eyebrow="How it works" title="Three steps from profile to placed." />
        <Stagger stagger={0.1} className="kp-ledger" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {STEPS.map((step, i) => (
            <StaggerItem key={step.n} style={{ paddingLeft: i === 0 ? 0 : 26, paddingRight: 26 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span className="font-display data" style={{ fontSize: 34, fontWeight: 500, color: 'var(--brass)', lineHeight: 1 }}>{step.n}</span>
                <span aria-hidden style={{ color: 'var(--text-subtle)', transform: 'translateY(2px)' }}><step.icon size={18} /></span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 650, margin: '18px 0 0', letterSpacing: '-.01em' }}>{step.title}</h3>
              <p style={{ ...para, fontSize: 14.5, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.6 }}>{step.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===================== CTA (masthead band, grounded in place) ===================== */}
      <section style={{ padding: `0 ${GUTTER} 84px` }}>
        <Reveal delay={0.05} style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {/* slow Ken Burns drift on the campus photograph */}
          <motion.img
            src="/baru_sahib.jpg" alt="" aria-hidden loading="lazy" width={1600} height={1000}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            animate={{ scale: [1, 1.07] }}
            transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
          />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(9,11,16,.74) 0%, rgba(9,11,16,.52) 46%, rgba(9,11,16,.18) 100%)' }} />
          <div style={{ position: 'relative', padding: 'clamp(34px,5vw,60px)', maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <motion.span
                className="brass-rule"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ transformOrigin: 'left center', background: '#d8b25a' }}
              />
              <span className="ledger-label" style={{ color: '#d8b25a', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={12} /> Baru Sahib · Himachal Pradesh
              </span>
            </div>
            <h2 className="font-display" style={{ color: '#fff', fontSize: 'clamp(28px,4.2vw,44px)', letterSpacing: '-.02em', fontWeight: 500, margin: 0, lineHeight: 1.08, textWrap: 'balance' }}>Your next opportunity starts with a profile.</h2>
            <p style={{ ...para, color: 'rgba(255,255,255,.86)', fontSize: 16, margin: '16px 0 0', lineHeight: 1.6, maxWidth: '46ch' }}>Set up in minutes — recruiters are ready.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              {!user && (
                <MotionLink to="/login" whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 22px', borderRadius: 'var(--r-ctl)', background: '#fff', color: '#0F1115', fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'background .18s ease' }} {...hoverBg('#e9ecf1', '#fff')}>
                  Sign in
                </MotionLink>
              )}
              <MotionLink to="/students" whileHover="h" whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 'var(--r-ctl)', background: 'rgba(255,255,255,.12)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,.28)', transition: 'background .18s ease' }} {...hoverBg('rgba(255,255,255,.22)', 'rgba(255,255,255,.12)')}>
                Browse the register
                <motion.span variants={{ h: { x: 3, y: -3 } }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} style={{ display: 'inline-flex' }}>
                  <ArrowUpRight size={16} />
                </motion.span>
              </MotionLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default LandingPage;
