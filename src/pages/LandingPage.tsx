import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence, animate, useMotionValue, useSpring } from 'motion/react';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Users, Briefcase, Building2, Newspaper,
  MessageCircle, UserPlus, GraduationCap, Search, Send, MapPin, MousePointer2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import { studentToCardVM, type CardVM } from '@/utils/cardVM';
import { Reveal, AnimatedNumber } from '@/components/motion';

const EASE = [0.16, 1, 0.3, 1] as const;
const MotionLink = motion.create(Link);

const STATS = [
  { value: 120, suffix: '+', label: 'Students registered' },
  { value: 30, suffix: '+', label: 'Partner companies' },
  { value: 2, suffix: '', label: 'University campuses' },
  { value: 50, suffix: '+', label: 'Recruitment drives' },
];

/* Three tones only — blue (identity), teal, amber — cycling across the six
   cards so the lattice stays lively without leaving the palette's story. */
const FEATURES = [
  { icon: Users, tone: '#2563eb', title: 'Rich student profiles', body: 'Skills, projects, and experience in one profile.' },
  { icon: Newspaper, tone: '#d97706', title: 'Community feed', body: 'Post updates, mention peers, react, comment.' },
  { icon: Briefcase, tone: '#0d9488', title: 'Internships & jobs', body: 'Browse and apply to recruiter openings.' },
  { icon: Building2, tone: '#0d9488', title: 'Company directory', body: 'Follow companies hiring from your campus.' },
  { icon: UserPlus, tone: '#2563eb', title: 'Connections', body: 'Build a lasting professional network.' },
  { icon: MessageCircle, tone: '#d97706', title: 'Direct messaging', body: 'Message peers and recruiters directly.' },
];

const STEPS = [
  { icon: GraduationCap, n: '01', title: 'Build your profile', body: 'Sign in and set up your profile.' },
  { icon: Search, n: '02', title: 'Get discovered', body: 'Recruiters filter the register to find you.' },
  { icon: Send, n: '03', title: 'Connect & get hired', body: 'Get messaged and apply to openings.' },
];

/* The hero's "How the register works" card walks itself: a brass dot travels
   down the rail step to step, the active row lifts and brightens, and a
   progress hairline under the header paces the cycle. */
const HERO_STEPS: [string, string, string][] = [
  ['01', 'Create your profile', 'Courses, projects, and skills in one place.'],
  ['02', 'Get verified', 'Your placement office signs off every entry.'],
  ['03', 'Be seen by recruiters', 'One directory across both campuses.'],
];
const STEP_MS = 2800;

const HeroSteps: React.FC = () => {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return; // stay on the first step — no auto-advance for reduced motion
    const t = setInterval(() => setActive((v) => (v + 1) % HERO_STEPS.length), STEP_MS);
    return () => clearInterval(t);
  }, [reduceMotion]);

  return (
    <>
      <div style={{ position: 'relative', padding: '15px 18px', borderBottom: '2px solid var(--border)' }}>
        <span className="ledger-label" style={{ color: 'var(--text)' }}>How the register works</span>
        {/* pacing hairline — refills each step over the brass rule */}
        <motion.span
          key={active}
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 2, background: 'var(--brass)', transformOrigin: 'left center' }}
        />
      </div>

      {/* rows share the card's leftover height evenly, so the frame never shows a gap */}
      <div style={{ padding: '4px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
        {HERO_STEPS.map(([n, title, sub], i) => {
          const on = i === active;
          return (
            <motion.button
              key={n}
              type="button"
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, x: on ? 6 : 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.45 + i * 0.12 }}
              style={{
                position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start', width: '100%', textAlign: 'left',
                padding: '15px 10px 15px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              {/* traveling marker — one dot, springing between rows */}
              {on && (
                <motion.span
                  layoutId="kp-step-dot"
                  aria-hidden
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{ position: 'absolute', left: 0, top: 22, width: 7, height: 7, borderRadius: '50%', background: 'var(--brass)', boxShadow: '0 0 0 4px var(--primary-soft)' }}
                />
              )}
              <motion.span
                className="font-display data"
                aria-hidden
                animate={{ color: on ? 'var(--brass)' : 'var(--text-subtle)', scale: on ? 1.12 : 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{ fontSize: 25, fontWeight: 550, lineHeight: 1.2, flex: 'none', transformOrigin: 'left center' }}
              >
                {n}
              </motion.span>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <motion.span animate={{ color: on ? 'var(--text)' : 'var(--text-muted)' }} style={{ fontWeight: 700, fontSize: 17.5 }}>{title}</motion.span>
                  {/* the sign-off stamps itself on the verification step */}
                  {i === 1 && on && (
                    <motion.span
                      initial={{ opacity: 0, scale: 1.9, rotate: -18 }}
                      animate={{ opacity: 1, scale: 1, rotate: -6 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 17 }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 5, border: '1.5px solid var(--success)', color: 'var(--success)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}
                    >
                      <BadgeCheck size={11} /> Verified
                    </motion.span>
                  )}
                </span>
                <motion.div animate={{ opacity: on ? 1 : 0.78 }} style={{ fontSize: 15.5, fontWeight: 550, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{sub}</motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );
};

/* Ambient floaters around the step stage — soft blurred orbs plus faint line
   icons, each bobbing on its own rhythm. Decorative only; hidden from AT and
   from reduced-motion users. */
const STEP_FLOATERS: { icon?: React.ElementType; x: string; y: string; size: number; dur: number; delay: number }[] = [
  { x: '9%', y: '18%', size: 120, dur: 9, delay: 0 },
  { x: '86%', y: '55%', size: 150, dur: 11, delay: 1.4 },
  { icon: GraduationCap, x: '17%', y: '58%', size: 26, dur: 6.5, delay: 0.4 },
  { icon: BadgeCheck, x: '77%', y: '16%', size: 24, dur: 7.5, delay: 1.1 },
  { icon: Briefcase, x: '31%', y: '10%', size: 20, dur: 8, delay: 2 },
  { icon: Send, x: '65%', y: '68%', size: 20, dur: 7, delay: 0.7 },
];

const StepFloaters: React.FC<{ onDark?: boolean }> = ({ onDark }) => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <>
      {STEP_FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          aria-hidden
          animate={{ y: [0, -16, 0], rotate: f.icon ? [0, 9, -6, 0] : 0, scale: f.icon ? 1 : [1, 1.12, 1] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: f.x, top: f.y, pointerEvents: 'none',
            ...(f.icon
              ? { color: onDark ? '#ffffff' : 'var(--brass)', opacity: onDark ? 0.5 : 0.18, display: 'inline-flex' }
              : { width: f.size, height: f.size, borderRadius: '50%', background: onDark ? '#ffffff' : 'var(--primary-soft)', filter: 'blur(28px)', opacity: onDark ? 0.4 : 0.7 }),
          }}
        >
          {f.icon && <f.icon size={f.size} />}
        </motion.span>
      ))}
    </>
  );
};

/* Icon per step: profile → cap, verified → badge, seen → search. */
const STEP_ICONS: React.ElementType[] = [GraduationCap, BadgeCheck, Search];
const WORK_STEPS: [string, string, string][] = [
  ['01', 'Build your profile', 'Sign in and set up your profile.'],
  ['02', 'Get discovered', 'Recruiters filter the register to find you.'],
  ['03', 'Connect & get hired', 'Get messaged and apply to openings.'],
];
const WORK_ICONS: React.ElementType[] = [GraduationCap, Search, Send];

/* Ambient life for the hero background — blurred accent orbs, faint drifting
   line icons, and tiny pulsing dots, each on its own rhythm. Decorative only:
   behind the content, no pointer events, hidden for reduced motion. */
const HERO_FLOATERS: {
  kind: 'orb' | 'icon' | 'dot';
  icon?: React.ElementType;
  x: string; y: string; size: number; dur: number; delay: number; drift?: number;
}[] = [
  { kind: 'orb', x: '3%', y: '9%', size: 160, dur: 12, delay: 0 },
  { kind: 'dot', x: '63%', y: '6%', size: 8, dur: 6.5, delay: 0.8 },
  { kind: 'orb', x: '90%', y: '11%', size: 120, dur: 10, delay: 1 },
  { kind: 'icon', icon: Briefcase, x: '54%', y: '22%', size: 22, dur: 9, delay: 1.6, drift: -12 },
  { kind: 'dot', x: '84%', y: '32%', size: 9, dur: 6, delay: 0 },
  { kind: 'icon', icon: Building2, x: '4%', y: '46%', size: 24, dur: 10, delay: 0.9, drift: 10 },
  { kind: 'orb', x: '72%', y: '54%', size: 140, dur: 14, delay: 2 },
  { kind: 'dot', x: '94%', y: '62%', size: 7, dur: 7, delay: 1.8 },
  { kind: 'icon', icon: GraduationCap, x: '18%', y: '80%', size: 26, dur: 8, delay: 0.5, drift: 14 },
  { kind: 'icon', icon: Send, x: '48%', y: '90%', size: 20, dur: 7.5, delay: 2.4, drift: -10 },
  { kind: 'dot', x: '68%', y: '84%', size: 7, dur: 7.5, delay: 2.6 },
  { kind: 'icon', icon: Users, x: '90%', y: '82%', size: 24, dur: 8.5, delay: 1.2, drift: 12 },
];

const HeroFloaters: React.FC = () => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {HERO_FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            y: [0, -18, 0],
            x: f.drift ? [0, f.drift, 0] : 0,
            rotate: f.kind === 'icon' ? [0, 10, -7, 0] : 0,
            scale: f.kind === 'dot' ? [1, 1.6, 1] : f.kind === 'orb' ? [1, 1.14, 1] : 1,
          }}
          transition={{
            opacity: { duration: 1.2, delay: 0.4 + i * 0.12 },
            default: { duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute', left: f.x, top: f.y, display: 'inline-flex',
            ...(f.kind === 'orb'
              ? { width: f.size, height: f.size, borderRadius: '50%', background: 'var(--primary-soft)', filter: 'blur(30px)', opacity: 0.4 }
              : f.kind === 'dot'
                ? { width: f.size, height: f.size, borderRadius: '50%', background: 'var(--brass)', opacity: 0.1 }
                : { color: 'var(--brass)', opacity: 0.08 }),
          }}
        >
          {f.kind === 'icon' && f.icon && <f.icon size={f.size} />}
        </motion.span>
      ))}
    </div>
  );
};

/* Page-wide ambient floaters — blurred accent orbs, faint drifting icons, and
   pulsing dots spread down the whole home page, sitting behind every section so
   they show through the background gaps. Decorative; off for reduced motion. */
const PAGE_FLOATERS: {
  kind: 'orb' | 'icon' | 'dot';
  icon?: React.ElementType;
  x: string; y: string; size: number; dur: number; delay: number; drift?: number;
}[] = [
  { kind: 'orb', x: '7%', y: '6%', size: 200, dur: 14, delay: 0 },
  { kind: 'icon', icon: Briefcase, x: '31%', y: '9%', size: 26, dur: 9, delay: 1.2, drift: -12 },
  { kind: 'dot', x: '55%', y: '5%', size: 9, dur: 6, delay: 0 },
  { kind: 'orb', x: '84%', y: '8%', size: 160, dur: 12, delay: 1 },
  { kind: 'icon', icon: GraduationCap, x: '16%', y: '21%', size: 30, dur: 8, delay: 0.4, drift: 14 },
  { kind: 'dot', x: '43%', y: '24%', size: 7, dur: 7, delay: 1.5 },
  { kind: 'orb', x: '68%', y: '19%', size: 180, dur: 16, delay: 2 },
  { kind: 'icon', icon: Building2, x: '92%', y: '23%', size: 28, dur: 10, delay: 0.8, drift: 10 },
  { kind: 'dot', x: '6%', y: '38%', size: 8, dur: 6.5, delay: 0.8 },
  { kind: 'orb', x: '35%', y: '41%', size: 190, dur: 15, delay: 0.6 },
  { kind: 'icon', icon: Send, x: '60%', y: '37%', size: 24, dur: 7.5, delay: 2.0, drift: -10 },
  { kind: 'dot', x: '87%', y: '42%', size: 7, dur: 7.5, delay: 2.2 },
  { kind: 'orb', x: '12%', y: '56%', size: 190, dur: 15, delay: 1.8 },
  { kind: 'icon', icon: Users, x: '41%', y: '59%', size: 28, dur: 8.5, delay: 1.0, drift: 12 },
  { kind: 'dot', x: '71%', y: '55%', size: 8, dur: 6.8, delay: 1.2 },
  { kind: 'orb', x: '91%', y: '60%', size: 150, dur: 13, delay: 1.6 },
  { kind: 'icon', icon: MessageCircle, x: '23%', y: '74%', size: 26, dur: 9.5, delay: 1.8, drift: -12 },
  { kind: 'orb', x: '52%', y: '77%', size: 200, dur: 17, delay: 2.4 },
  { kind: 'icon', icon: UserPlus, x: '79%', y: '73%', size: 24, dur: 8, delay: 0.5, drift: 10 },
  { kind: 'dot', x: '10%', y: '90%', size: 9, dur: 6.4, delay: 2.0 },
  { kind: 'icon', icon: Newspaper, x: '45%', y: '93%', size: 26, dur: 7, delay: 2.6, drift: -10 },
  { kind: 'orb', x: '73%', y: '89%', size: 170, dur: 14, delay: 0.9 },
];

const PageFloaters: React.FC = () => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {PAGE_FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            y: [0, -18, 0],
            x: f.drift ? [0, f.drift, 0] : 0,
            rotate: f.kind === 'icon' ? [0, 10, -7, 0] : 0,
            scale: f.kind === 'dot' ? [1, 1.6, 1] : f.kind === 'orb' ? [1, 1.14, 1] : 1,
          }}
          transition={{
            opacity: { duration: 1.2, delay: 0.3 + i * 0.08 },
            default: { duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute', left: f.x, top: f.y, display: 'inline-flex',
            ...(f.kind === 'orb'
              ? { width: f.size, height: f.size, borderRadius: '50%', background: 'var(--primary-soft)', filter: 'blur(34px)', opacity: 0.4 }
              : f.kind === 'dot'
                ? { width: f.size, height: f.size, borderRadius: '50%', background: 'var(--brass)', opacity: 0.1 }
                : { color: 'var(--brass)', opacity: 0.08 }),
          }}
        >
          {f.kind === 'icon' && f.icon && <f.icon size={f.size} />}
        </motion.span>
      ))}
    </div>
  );
};

/* One step on stage at a time: the icon chip springs in, the number pops with a
   tilt, title and description cascade after it, then the whole line exits left
   before the next begins (AnimatePresence mode="wait"). The active dot doubles
   as a timer, filling over the step's duration. */
const StepSequence: React.FC<{ steps: [string, string, string][]; icons: React.ElementType[]; onDark?: boolean }> = ({ steps, icons, onDark }) => {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), STEP_MS);
    return () => clearInterval(t);
  }, [reduce, steps.length]);
  const [n, title, sub] = steps[i];
  const Icon = icons[i];
  return (
    <div style={{ position: 'relative', padding: '18px 0 6px' }}>
      <StepFloaters onDark={onDark} />
      <div style={{ overflow: 'hidden', minHeight: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={n}
            exit={{ x: -110, opacity: 0, transition: { duration: 0.32, ease: EASE } }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', padding: '0 20px' }}
          >
            {/* icon chip — springs in with a spin */}
            <motion.span
              initial={{ scale: 0.2, rotate: -120, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 19 }}
              style={{
                width: 52, height: 52, borderRadius: 16, flex: 'none', display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', background: onDark ? 'rgba(255,255,255,.2)' : 'var(--primary-soft)', color: onDark ? '#ffffff' : 'var(--brass)',
              }}
            >
              <Icon size={26} />
            </motion.span>
            {/* number — pops with a tilt */}
            <motion.span
              className="font-display data"
              initial={{ scale: 0.4, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.07 }}
              style={{ fontSize: 38, fontWeight: 600, color: onDark ? '#ffffff' : 'var(--brass)', lineHeight: 1 }}
            >
              {n}
            </motion.span>
            {/* title and description cascade in */}
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
              <motion.span
                initial={{ x: 46, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
                style={{ fontWeight: 700, fontSize: 23, color: onDark ? '#ffffff' : 'var(--text)' }}
              >
                {title}
              </motion.span>
              <motion.span
                data-kp-show="desktop"
                initial={{ x: 46, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.2 }}
                style={{ color: onDark ? 'rgba(255,255,255,.85)' : 'var(--text-muted)', fontSize: 17 }}
              >
                {sub}
              </motion.span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* position dots — the active pill fills like a timer until the next step */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {steps.map(([sn], di) => (
          <button
            key={sn}
            onClick={() => setI(di)}
            aria-label={`Step ${sn}`}
            style={{
              position: 'relative', width: di === i ? 34 : 8, height: 8, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
              background: onDark ? 'rgba(255,255,255,.4)' : 'var(--border-strong)', overflow: 'hidden',
              transition: 'width .3s cubic-bezier(.16,1,.3,1)',
            }}
          >
            {di === i && (
              <motion.span
                key={`fill-${i}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : STEP_MS / 1000, ease: 'linear' }}
                style={{ position: 'absolute', inset: 0, background: onDark ? '#ffffff' : 'var(--brass)', borderRadius: 0, transformOrigin: 'left center', display: 'block' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/* Full-bleed feature lattice with a self-touring arrow. The marker snakes the
   grid — top row left->right, drops to the bottom-right card, bottom row
   right->left, then climbs back — landing in each card's empty space exactly
   once per cycle, travelling a U-arc and trailing a comet that fades at rest. */
const FEAT_MS = 1700;

const FeatureLattice: React.FC = () => {
  const [step, setStep] = useState(0);
  const [landed, setLanded] = useState(0); // which card the arrow has settled BIG on
  const [mobile, setMobile] = useState(false);
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // stacked to one column on small screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 880px)');
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const colsN = mobile ? 1 : 3;
  const rowsN = mobile ? FEATURES.length : 2;
  // snake on desktop; simple top-to-bottom when stacked
  const order = mobile ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 5, 4, 3];
  const active = order[step];

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const read = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // target the EMPTY area of each card (lower-right), not its centre/content
  const spotOf = (i: number) => {
    const col = i % colsN, row = Math.floor(i / colsN);
    const cw = dims.w / colsN, ch = dims.h / rowsN;
    return { x: col * cw + cw * 0.82, y: row * ch + ch * 0.6 };
  };

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rot = useMotionValue(0);
  const sc = useMotionValue(1);
  const t1x = useSpring(mx, { stiffness: 280, damping: 26 }); const t1y = useSpring(my, { stiffness: 280, damping: 26 });
  const t2x = useSpring(mx, { stiffness: 180, damping: 26 }); const t2y = useSpring(my, { stiffness: 180, damping: 26 });
  const t3x = useSpring(mx, { stiffness: 115, damping: 26 }); const t3y = useSpring(my, { stiffness: 115, damping: 26 });
  const t4x = useSpring(mx, { stiffness: 72, damping: 26 });  const t4y = useSpring(my, { stiffness: 72, damping: 26 });

  const placed = useRef(false);
  useEffect(() => {
    if (!dims.w || placed.current) return;
    const c = spotOf(order[0]);
    mx.set(c.x); my.set(c.y);
    placed.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, mobile]);

  useEffect(() => {
    if (reduce || !dims.w) return;
    const t = setInterval(() => setStep((v) => (v + 1) % order.length), FEAT_MS);
    return () => clearInterval(t);
  }, [reduce, dims.w, order.length]);

  const prev = useRef(active);
  useEffect(() => {
    if (!dims.w) return;
    const from = spotOf(prev.current);
    const to = spotOf(active);
    prev.current = active;
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const dur = 0.95;
    if (dist < 1) { setLanded(active); return; } // first placement — no hop
    const len = dist || 1;
    let px = -dy / len, py = dx / len;
    if (py < 0) { px = -px; py = -py; }
    const arc = 38;
    const midx = (from.x + to.x) / 2 + px * arc;
    const midy = (from.y + to.y) / 2 + py * arc;
    const ease = [0.16, 1, 0.3, 1] as const;
    setLanded(-1); // arrow lifts off + shrinks — no card is expanded mid-flight
    animate(mx, [from.x, midx, to.x], { duration: dur, ease, times: [0, 0.5, 1] });
    animate(my, [from.y, midy, to.y], { duration: dur, ease, times: [0, 0.5, 1] });
    animate(rot, (Math.atan2(dy, dx) * 180) / Math.PI, { duration: 0.42, ease });
    // small while airborne, pops back to full size as it lands on the card
    animate(sc, [1, 0.55, 1.14, 1], { duration: dur, times: [0, 0.5, 0.82, 1], ease: 'easeOut' });
    // the card expands only once the arrow has grown big on landing
    const tid = window.setTimeout(() => setLanded(active), dur * 0.82 * 1000);
    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, dims.w]);

  const cols = mobile ? '1fr' : 'repeat(3,minmax(0,1fr))';
  const tone = FEATURES[active].tone;
  const trail = [
    { x: t1x, y: t1y, size: 13, op: 0.32 },
    { x: t2x, y: t2y, size: 10, op: 0.2 },
    { x: t3x, y: t3y, size: 7, op: 0.11 },
  ];

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: cols, gap: 1, perspective: 1400,
        background: 'var(--border)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        {FEATURES.map((f, i) => {
          const on = i === landed;
          const col = i % colsN;
          const origin = colsN === 1 ? 'center center' : col === 0 ? 'left center' : col === colsN - 1 ? 'right center' : 'center center';
          return (
            <motion.div
              key={f.title}
              animate={{ scale: on ? 1.06 : 1, rotateX: on ? -7 : 0, z: on ? 30 : 0, opacity: landed === -1 ? 1 : on ? 1 : 0.8, zIndex: on ? 5 : 1, boxShadow: on ? '0 30px 50px -20px rgba(6,10,20,.34)' : '0 0 0 0 rgba(6,10,20,0)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              style={{
                position: 'relative', transformOrigin: origin, cursor: 'default',
                background: `color-mix(in srgb, ${f.tone} ${on ? 24 : 14}%, var(--surface))`,
                padding: '32px 26px', transition: 'background .4s ease',
              }}
            >
              <motion.span aria-hidden animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.35 }} style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(130% 90% at 50% 0%, color-mix(in srgb, ${f.tone} 26%, transparent), transparent 68%)`,
              }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.span
                  animate={{ scale: on ? 1.14 : 1, rotate: on ? -7 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 13 }}
                  style={{ width: 46, height: 46, borderRadius: 12, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${f.tone} 22%, var(--surface))`, color: f.tone }}
                >
                  <f.icon size={22} aria-hidden />
                </motion.span>
                <h3 style={{ fontSize: 20, fontWeight: 750, margin: 0, letterSpacing: '-.01em' }}>{f.title}</h3>
              </div>
              <p style={{ ...para, position: 'relative', fontSize: 16, color: 'var(--text-muted)', margin: '11px 0 0', lineHeight: 1.6, maxWidth: '74%' }}>{f.body}</p>
            </motion.div>
          );
        })}
      </div>

      {/* comet trail + arrow marker */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6 }}>
        {trail.map((t, k) => (
          <motion.span key={k} style={{ position: 'absolute', top: 0, left: 0, x: t.x, y: t.y }}>
            <span style={{ display: 'block', width: t.size, height: t.size, marginLeft: -t.size / 2, marginTop: -t.size / 2, borderRadius: '50%', background: tone, opacity: t.op, filter: 'blur(1px)' }} />
          </motion.span>
        ))}
        <motion.div style={{ position: 'absolute', top: 0, left: 0, x: mx, y: my }}>
          <motion.div style={{ scale: sc, marginLeft: -25, marginTop: -25 }}>
            <span style={{ width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tone, color: '#fff', border: '3px solid var(--surface)', boxShadow: `0 14px 30px -8px ${tone}` }}>
              <motion.span style={{ rotate: rot, display: 'flex' }}>
                <ArrowRight size={25} strokeWidth={2.8} />
              </motion.span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/* ---- shared styles ---- */
const GUTTER = 'clamp(20px,10vw,112px)';
const wrap: React.CSSProperties = { width: '100%', padding: `0 ${GUTTER}` };
const para: React.CSSProperties = { textAlign: 'left' };
const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 'var(--r-ctl)',
  background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 16, textDecoration: 'none',
  transition: 'background .18s ease',
};
const ctaOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '13px 22px', borderRadius: 'var(--r-ctl)',
  background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 16, textDecoration: 'none',
  border: '1px solid var(--border-strong)', transition: 'background .18s ease, border-color .18s ease',
};
const chip = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 12.5, fontWeight: 550, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: bg, color, whiteSpace: 'nowrap',
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
const SectionHead: React.FC<{ eyebrow: string; title: string; action?: React.ReactNode; wide?: boolean }> = ({ eyebrow, title, action, wide }) => (
  <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 34 }}>
    <div style={{ maxWidth: wide ? 'none' : 640, minWidth: 0 }}>
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
      <h2 className="font-display" style={{ fontSize: 'clamp(27px,3.4vw,36px)', letterSpacing: '-.02em', fontWeight: 500, margin: '12px 0 0', lineHeight: 1.12, textWrap: wide ? undefined : 'balance' }}>
        {title}
      </h2>
    </div>
    {action}
  </Reveal>
);

/* ---- Profile carousel: a slow, infinite reel of profile cards — a large avatar,
   the student's name, and their university. Auto-scrolls; pauses on hover so a
   card can be read and clicked. Two identical halves keep the loop seamless. ---- */
const CarouselCard: React.FC<{ vm: CardVM }> = ({ vm }) => (
  <MotionLink
    to={vm.href}
    aria-label={`View profile of ${vm.name}`}
    whileHover={{ y: -6 }}
    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    style={{
      flex: 'none', width: 216, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: '28px 20px 24px', borderRadius: 18, textDecoration: 'none', color: 'var(--text)',
      background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      transition: 'border-color .2s ease, box-shadow .2s ease',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${vm.avatarBg} 55%, var(--border))`; e.currentTarget.style.boxShadow = `0 26px 48px -22px color-mix(in srgb, ${vm.avatarBg} 50%, transparent)`; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
  >
    {/* big profile picture — photo when available, otherwise a coloured monogram */}
    <span style={{ position: 'relative', width: 104, height: 104, flex: 'none' }}>
      <span aria-hidden style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: `conic-gradient(from 150deg, ${vm.avatarBg}, color-mix(in srgb, ${vm.avatarBg} 22%, var(--surface)), ${vm.avatarBg})`, opacity: 0.55 }} />
      {vm.profileImage ? (
        <img src={vm.profileImage} alt="" loading="lazy" style={{ position: 'relative', width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--surface)' }} />
      ) : (
        <span style={{ position: 'relative', width: 104, height: 104, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 36, color: '#fff', background: vm.avatarBg, border: '4px solid var(--surface)' }}>{vm.initials}</span>
      )}
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
      <span style={{ fontWeight: 700, fontSize: 16.5, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vm.name}</span>
      <BadgeCheck size={14} aria-hidden style={{ color: 'var(--brass)', flex: 'none' }} />
    </span>
    <span style={{ fontSize: 13.5, color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{vm.university || '—'}</span>
  </MotionLink>
);

const ProfileCarousel: React.FC<{ cards: CardVM[] }> = ({ cards }) => {
  const reduce = useReducedMotion();
  if (cards.length === 0) return null;
  if (reduce) {
    return (
      <div style={{ display: 'flex', gap: 18, overflowX: 'auto', padding: '14px clamp(14px,2vw,30px) 26px' }}>
        {cards.map((vm) => <CarouselCard key={vm.id} vm={vm} />)}
      </div>
    );
  }
  return (
    <div className="kp-carousel">
      <div className="kp-carousel-track">
        {['a', 'b'].map((half) => (
          <div key={half} className="kp-carousel-half" aria-hidden={half === 'b'}>
            {cards.map((vm) => <CarouselCard key={`${half}-${vm.id}`} vm={vm} />)}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---- Rotating quotes: famous words on work, opportunity, and learning, shown on
   the register's blue band. Auto-advances (pausing on hover), arrows for manual
   control, and a fade-through between quotes. Reduced-motion holds on one. ---- */
const QUOTES: { text: string; author: string }[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Choose a job you love, and you will never have to work a day in your life.", author: "Confucius" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas Edison" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Whether you think you can, or you think you can't — you're right.", author: "Henry Ford" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Talent wins games, but teamwork and intelligence win championships.", author: "Michael Jordan" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Nothing will work unless you do.", author: "Maya Angelou" },
  { text: "A goal is a dream with a deadline.", author: "Napoleon Hill" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "W. B. Yeats" },
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
  { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
  { text: "Your talent determines what you can do. Your attitude determines how well you do it.", author: "Lou Holtz" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Great things in business are never done by one person; they're done by a team of people.", author: "Steve Jobs" },
  { text: "Winners never quit and quitters never win.", author: "Vince Lombardi" },
];

const quoteNavBtn: React.CSSProperties = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%',
  border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3,
  transition: 'background .18s ease',
};

const QuoteRotator: React.FC = () => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % QUOTES.length), 6000);
    return () => clearTimeout(t);
  }, [i, reduce, paused]);
  const go = (d: number) => setI((v) => (v + d + QUOTES.length) % QUOTES.length);
  const q = QUOTES[i];
  return (
    <section style={{ padding: '28px 0 0' }}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* oversized decorative quotation mark */}
        <span aria-hidden style={{ position: 'absolute', top: 'clamp(-34px,-2vw,-12px)', left: 'clamp(16px,5vw,70px)', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(150px,20vw,280px)', lineHeight: 1, color: 'color-mix(in srgb, var(--primary) 13%, transparent)', pointerEvents: 'none', userSelect: 'none' }}>“</span>

        <div style={{ position: 'relative', maxWidth: 940, margin: '0 auto', padding: 'clamp(54px,7vw,92px) clamp(56px,9vw,130px)', textAlign: 'center', minHeight: 'clamp(250px,30vw,340px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -18 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ margin: 0 }}
            >
              <p style={{ color: 'var(--text)', fontFamily: '"Palatino Linotype", Palatino, Georgia, "Times New Roman", serif', fontStyle: 'italic', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 500, lineHeight: 1.42, letterSpacing: 0, margin: 0, textAlign: 'center', textWrap: 'balance' }}>
                {q.text}
              </p>
              <footer style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <span aria-hidden style={{ width: 26, height: 2, background: 'var(--primary)' }} />
                <cite className="ledger-label" style={{ color: 'var(--text-muted)', fontStyle: 'normal', fontSize: 13 }}>{q.author}</cite>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* manual controls */}
        <button onClick={() => go(-1)} aria-label="Previous quote" style={{ ...quoteNavBtn, left: 'clamp(10px,2vw,26px)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}><ChevronLeft size={20} /></button>
        <button onClick={() => go(1)} aria-label="Next quote" style={{ ...quoteNavBtn, right: 'clamp(10px,2vw,26px)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}><ChevronRight size={20} /></button>

        {/* position in the set */}
        <span aria-hidden style={{ position: 'absolute', bottom: 15, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-subtle)', fontSize: 12, fontWeight: 600, letterSpacing: '.1em', fontVariantNumeric: 'tabular-nums' }}>
          {String(i + 1).padStart(2, '0')} / {QUOTES.length}
        </span>
      </div>
    </section>
  );
};

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
      <span aria-hidden style={{ width: 42, height: 42, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, color: '#fff', background: vm.avatarBg }}>
        {vm.initials}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontWeight: 650, fontSize: 15.5, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vm.name}</span>
          <BadgeCheck size={14} aria-hidden style={{ color: 'var(--brass)', flex: 'none' }} />
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {vm.headline || vm.field || 'Student · Open to opportunities'}
        </div>
      </div>
      <span style={chip('var(--primary-soft)', 'var(--primary)')}>{vm.oppLabel}</span>
    </Link>
  </motion.div>
);

/* ------------------- Marketeam-style hero machinery ------------------- */

/* Types the headline character by character (35ms/char, 400ms lead-in), with a
   blinking caret while typing. Two-tone: chars before `splitAt` in ink, the
   rest in the accent. Reduced motion renders the full line instantly. */
const TypewriterHeading: React.FC<{ text: string; splitAt: number; onDone?: () => void }> = ({ text, splitAt, onDone }) => {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  const done = n >= text.length;

  useEffect(() => {
    if (reduce) { onDone?.(); return; }
    let i = 0;
    let t: number;
    const start = window.setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < text.length) t = window.setTimeout(tick, 35);
      else onDone?.();
    }, 400);
    return () => { window.clearTimeout(start); window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduce]);

  const typed = text.slice(0, n);
  return (
    <span aria-label={text}>
      <span aria-hidden>{typed.slice(0, splitAt)}</span>
      <span aria-hidden style={{ color: 'var(--pri-ink)' }}>{typed.slice(splitAt)}</span>
      {!done && <span aria-hidden className="kp-caret" style={{ height: '0.85em', verticalAlign: '-0.08em', marginLeft: 3 }} />}
    </span>
  );
};

/* Orbit placements — orbit index, angle, disc size, shape, from the reference design. */
const SATELLITES: { orbit: 0 | 1 | 2 | 3; angle: number; size: number; square?: boolean }[] = [
  { orbit: 0, angle: 270, size: 58, square: true },
  { orbit: 1, angle: 60, size: 58 },
  { orbit: 1, angle: 180, size: 78 },
  { orbit: 1, angle: 300, size: 58, square: true },
  { orbit: 2, angle: 130, size: 88 },
  { orbit: 3, angle: 30, size: 58 },
  { orbit: 3, angle: 95, size: 88, square: true },
  { orbit: 3, angle: 220, size: 88, square: true },
  { orbit: 3, angle: 320, size: 58 },
];
/* Ring diameters sized so even the outermost satellites (44px past the ring
   line) stay inside the 720px box — nothing gets clipped by the hero edges. */
const ORBITS = [
  { d: 320, dur: 30, dir: 'L' as const },
  { d: 445, dur: 40, dir: 'R' as const },
  { d: 545, dur: 50, dir: 'R' as const },
  { d: 630, dur: 60, dir: 'L' as const },
];

/* Four slowly rotating rings carrying real register students; the centre disc
   counts up the live total. Pure CSS animation — satellites counter-spin to
   stay upright and fly in staggered. */
const OrbitViz: React.FC<{ cards: CardVM[]; total: number }> = ({ cards, total }) => {
  // The centre disc walks through all four register figures, one at a time.
  const [si, setSi] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setSi((v) => (v + 1) % STATS.length), 3200);
    return () => clearInterval(t);
  }, [reduce]);
  const stat = STATS[si];
  const statValue = si === 0 ? Math.max(total, STATS[0].value) : stat.value;
  return (
  <div className="kp-orbitbox" aria-label={`${total} students in the register`}>
    {/* centre disc — painted first, satellites pass over it */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 276, height: 276, borderRadius: '50%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center', overflow: 'hidden',
      background: 'var(--surface)',
      border: '3px solid var(--text)',
      boxShadow: '10px 10px 0 0 var(--text)',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={si}
          initial={{ opacity: 0, y: 26, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -26, scale: 0.82, transition: { duration: 0.28, ease: EASE } }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <span className="font-display data" style={{ fontSize: 58, fontWeight: 600, lineHeight: 1, letterSpacing: '-.02em' }}>
            {statValue}{stat.suffix}
          </span>
          <span className="font-display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-muted)' }}>
            {stat.label}
          </span>
        </motion.div>
      </AnimatePresence>
      {/* progress dots — which figure is on stage */}
      <div style={{ position: 'absolute', bottom: 40, display: 'flex', gap: 6 }}>
        {STATS.map((x, di) => (
          <button
            key={x.label}
            onClick={() => setSi(di)}
            aria-label={x.label}
            style={{
              width: di === si ? 18 : 6, height: 6, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
              background: di === si ? 'var(--brass)' : 'var(--border-strong)',
              transition: 'width .3s cubic-bezier(.16,1,.3,1), background .2s ease',
            }}
          />
        ))}
      </div>
    </div>

    {/* rings with their satellites — the original single-layer motion, untouched */}
    {ORBITS.map((o, oi) => (
      <div
        key={o.d}
        className="kp-orbit"
        style={{
          width: o.d, height: o.d,
          animation: `${o.dir === 'L' ? 'kpSpinL' : 'kpSpinR'} ${o.dur}s linear infinite`,
        }}
      >
        {SATELLITES.filter((x) => x.orbit === oi).map((x, xi) => {
          const vm = cards[SATELLITES.findIndex((y) => y === x)];
          if (!vm) return null;
          const r = o.d / 2;
          return (
            <span
              key={`${x.angle}-${xi}`}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: x.size, height: x.size, marginLeft: -x.size / 2, marginTop: -x.size / 2,
                transform: `rotate(${x.angle}deg) translate(${r}px) rotate(${-x.angle}deg)`,
              }}
            >
              <span style={{ display: 'block', animation: `${o.dir === 'L' ? 'kpRot' : 'kpRotRev'} ${o.dur}s linear infinite` }}>
                <Link
                  to={vm.href}
                  aria-label={`View profile of ${vm.name}`}
                  title={vm.name}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: x.size, height: x.size,
                    borderRadius: x.square ? (x.size > 70 ? 24 : 20) : '50%',
                    background: vm.avatarBg, color: '#fff', fontWeight: 700,
                    fontSize: x.size / 3.2, textDecoration: 'none', textTransform: 'uppercase',
                    border: '2px solid color-mix(in srgb, #ffffff 26%, transparent)',
                    boxShadow: `0 0 ${x.size / 2}px color-mix(in srgb, ${vm.avatarBg} 65%, transparent)`,
                    animation: `kpFlyIn .7s cubic-bezier(0.22, 1, 0.36, 1) both`,
                    animationDelay: `${0.6 + (SATELLITES.indexOf(x) * 0.19)}s`,
                    transition: 'scale .2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.scale = '1.14'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.scale = '1'; }}
                >
                  {vm.initials}
                </Link>
              </span>
            </span>
          );
        })}
      </div>
    ))}
  </div>
  );
};

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

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* ===================== MASTHEAD TICKER — university names crawl forever, TV-style ===================== */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <span className="sr-only">Akal University and Eternal University — the official placement register</span>
        <div aria-hidden className="kp-marquee" style={{ height: 20, display: 'flex', alignItems: 'center' }}>
          <div className="kp-marquee-track">
            {['a', 'b'].map((half) => (
              <div key={half} style={{ display: 'flex', alignItems: 'center' }}>
                {Array.from({ length: 8 }).flatMap((_, r) =>
                  ['Eternal University', 'Akal University'].map((name, i) => (
                    <span key={`${r}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', flex: 'none' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {name}
                      </span>
                      <span aria-hidden style={{ width: 4, height: 4, margin: '0 26px', borderRadius: '50%', background: 'var(--primary)', flex: 'none' }} />
                    </span>
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== HERO — full-viewport, orbit visualization ===================== */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
        {/* ambient accent glow, slowly breathing */}
        <motion.div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(52% 70% at 82% 8%, color-mix(in srgb, var(--pri) 16%, transparent), transparent 62%), radial-gradient(40% 52% at 8% 92%, color-mix(in srgb, var(--pri) 9%, transparent), transparent 60%)' }}
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div style={{ position: 'relative', padding: `46px ${GUTTER} 34px`, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div data-kp-hero="true" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 40, alignItems: 'center' }}>
            {/* ---- left: masthead — typewriter entrance ---- */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE }}
              style={{ paddingTop: 24 }}
            >
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
              <h1 className="font-display" style={{ fontSize: 'clamp(48px,6.4vw,82px)', lineHeight: 1.02, letterSpacing: '-1.5px', fontWeight: 600, margin: '14px 0 0', maxWidth: '15ch', minHeight: '2.1em' }}>
                <TypewriterHeading text="Where Campus Talent Meets Opportunity." splitAt={20} />
              </h1>
              <motion.p
                style={{ ...para, fontSize: 'clamp(15px,1.5vw,17.5px)', color: 'var(--text-muted)', margin: '20px 0 0', maxWidth: '50ch', lineHeight: 1.65 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 1.9 }}
              >
                One verified profile, read by every recruiter. Share your work, follow hiring companies,
                and get contacted directly.
              </motion.p>
              <motion.div
                style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 30 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 2.15 }}
              >
                {/* primary — ink pill inside the rotating conic border; accent fill sweeps in from the right on hover */}
                <span className="btn-border-wrap">
                  <Link
                    to="/students"
                    className="kp-fill-btn"
                    data-fill-from="right"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'var(--text)', color: 'var(--bg)', fontWeight: 600, fontSize: 17, textDecoration: 'none' }}
                  >
                    Explore the register <ArrowRight size={18} />
                  </Link>
                </span>
                {user ? (
                  <Link to="/feed" className="kp-fill-btn" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 26px', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid var(--border-strong)' }}>Go to your feed</Link>
                ) : (
                  <Link to="/login" className="kp-fill-btn" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 26px', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid var(--border-strong)' }}>Sign in</Link>
                )}
              </motion.div>
              {/* cursor + verification badge — the register's sign-off */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 2.5 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginLeft: 'clamp(40px, 16vw, 250px)', marginTop: 36, width: 'fit-content' }}
              >
                <MousePointer2 size={22} aria-hidden style={{ color: 'var(--pri-ink)', fill: 'var(--pri-ink)', transform: 'translateY(-6px)' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'var(--pri)', color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <BadgeCheck size={16} aria-hidden /> Verified by the universities
                </span>
              </motion.div>
            </motion.div>

            {/* ---- right: orbit visualization — the register as a living system ---- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}
            >
              <OrbitViz cards={cards} total={total} />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ===================== HOW THE REGISTER WORKS (one step at a time) ===================== */}
      <section style={{ marginTop: -6, padding: `0 0 8px` }}>
        <Reveal>
          {/* full-bleed band — no side edges, spans the whole screen */}
          <motion.div
            style={{
              width: '100%', padding: '26px 24px 22px', position: 'relative',
              background: 'var(--primary)', borderTop: '1px solid color-mix(in srgb, var(--primary) 78%, #000)', borderBottom: '1px solid color-mix(in srgb, var(--primary) 78%, #000)',
            }}
          >
            <span className="ledger-label" style={{ display: 'block', textAlign: 'center', marginBottom: 6, color: '#ffffff' }}>How to register</span>
            <StepSequence steps={HERO_STEPS} icons={STEP_ICONS} onDark />
          </motion.div>
        </Reveal>
      </section>

      {/* ===================== FROM THE REGISTER — the shelf (students spine-out; hover pulls one off) ===================== */}
      {cards.length > 0 && (
        <section style={{ padding: `68px 0 0` }}>
          <div style={{ padding: `0 ${GUTTER}` }}>
            <SectionHead
              eyebrow="From the register"
              title="Talent, currently open to work."
              wide
            />
          </div>
          <ProfileCarousel cards={cards.slice(0, 20)} />

          {/* borderless text link, centered below the shelf */}
          <div style={{ padding: `0 ${GUTTER}` }}>
            <Reveal delay={0.1} style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <MotionLink
                to="/students"
                initial="rest"
                animate="rest"
                whileHover="h"
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}
              >
                <span style={{ position: 'relative' }}>
                  See all students in the register
                  <motion.span
                    aria-hidden
                    variants={{ rest: { scaleX: 0 }, h: { scaleX: 1 } }}
                    transition={{ duration: 0.35, ease: EASE }}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: -3, height: 2, borderRadius: 2, background: 'var(--brass)', transformOrigin: 'left center' }}
                  />
                </span>
                <motion.span variants={{ rest: { x: 0 }, h: { x: 6 } }} transition={{ type: 'spring', stiffness: 380, damping: 20 }} style={{ display: 'inline-flex' }}>
                  <ArrowRight size={17} />
                </motion.span>
              </MotionLink>
            </Reveal>
          </div>
        </section>
      )}

      {/* ===================== HOW IT WORKS (one step at a time — full-bleed band) ===================== */}
      <section style={{ padding: `72px 0 0` }}>
        <Reveal>
          {/* full-bleed band — matches the register-works strip */}
          <motion.div
            style={{
              width: '100%', padding: '26px 24px 22px', position: 'relative',
              background: 'var(--primary)', borderTop: '1px solid color-mix(in srgb, var(--primary) 78%, #000)', borderBottom: '1px solid color-mix(in srgb, var(--primary) 78%, #000)',
            }}
          >
            <span className="ledger-label" style={{ display: 'block', textAlign: 'center', marginBottom: 6, color: '#ffffff' }}>How it works</span>
            <StepSequence steps={WORK_STEPS} icons={WORK_ICONS} onDark />
          </motion.div>
        </Reveal>
      </section>

      {/* ===================== FEATURES (full-bleed self-touring lattice) ===================== */}
      <section style={{ padding: `72px 0 0` }}>
        <div style={{ padding: `0 ${GUTTER}` }}>
          <SectionHead eyebrow="The platform" title="A full campus network, not just a directory." wide />
        </div>
        {/* edge-to-edge — the lattice touches both screen borders */}
        <FeatureLattice />
      </section>

      {/* ===================== QUOTES (rotating — famous words on the register's blue band) ===================== */}
      <QuoteRotator />
      </div>
    </div>
  );
};

export default LandingPage;
