import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Users, Briefcase, Building2, Newspaper, MessageCircle, UserPlus,
  GraduationCap, Search, Send,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAllStudents } from '@/context/student/studentSlice';
import StudentCard from '@/components/StudentCard';
import { studentToCardVM } from '@/utils/cardVM';

const STATS = [
  { icon: GraduationCap, num: '120+', label: 'Students registered' },
  { icon: Building2, num: '30+', label: 'Partner companies' },
  { icon: Users, num: '2', label: 'University campuses' },
  { icon: Briefcase, num: '50+', label: 'Recruitment drives' },
];

const FEATURES = [
  { icon: Users, title: 'Rich student profiles', body: 'Showcase skills, education, projects, experience and availability in one polished profile.' },
  { icon: Newspaper, title: 'Community feed', body: 'Post updates, mention peers, react and comment — your campus professional network.' },
  { icon: Briefcase, title: 'Internships & jobs', body: 'Recruiters post openings; students browse and apply by field, skills and university.' },
  { icon: Building2, title: 'Company directory', body: 'Follow companies hiring from your campus and never miss a role.' },
  { icon: UserPlus, title: 'Connections', body: 'Connect with fellow students and grow your professional network.' },
  { icon: MessageCircle, title: 'Direct messaging', body: 'Chat with peers and recruiters right inside the platform.' },
];

const STEPS = [
  { icon: GraduationCap, n: '1', title: 'Build your profile', body: 'Sign in with your university ID and set up a rich profile in minutes — experience, projects, skills and more.' },
  { icon: Search, n: '2', title: 'Get discovered', body: 'Recruiters browse and filter by skills, field, university and availability to find you.' },
  { icon: Send, n: '3', title: 'Connect & get hired', body: 'Get messaged directly and apply to openings that match your goals.' },
];

const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 'var(--r-ctl)',
  background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
};
const ctaOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '13px 22px', borderRadius: 'var(--r-ctl)',
  background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid var(--border-strong)',
};
const eyebrow: React.CSSProperties = { fontSize: 12.5, fontWeight: 650, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.06em' };

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { allStudents } = useAppSelector((s) => s.student);

  useEffect(() => {
    if (!allStudents) dispatch(fetchAllStudents());
  }, [dispatch, allStudents]);

  const cards = (allStudents ?? []).slice(0, 6).map(studentToCardVM);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 85% -10%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '64px 24px 44px' }}>
          <div data-kp-hero="true" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center' }}>
            <div style={{ animation: 'kpRise .5s ease' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 12.5, fontWeight: 600, border: '1px solid var(--primary-soft-border)' }}>
                <Sparkles size={14} /> For Akal &amp; Eternal University
              </span>
              <h1 style={{ fontSize: 'clamp(34px,5vw,54px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 700, margin: '18px 0 0', maxWidth: '15ch' }}>
                Where campus talent meets opportunity.
              </h1>
              <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'var(--text-muted)', margin: '18px 0 0', maxWidth: '48ch', lineHeight: 1.6 }}>
                Build one rich profile, share your work on the feed, and connect with recruiters.
                Companies post openings and reach out directly — internships and jobs, all in one place.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
                <Link to="/students" style={ctaPrimary}>Explore students <ArrowRight size={17} /></Link>
                {user ? (
                  <Link to="/feed" style={ctaOutline}>Go to your feed</Link>
                ) : (
                  <Link to="/login" style={ctaOutline}>Sign in</Link>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 30 }}>
                <div style={{ display: 'flex' }}>
                  {[['HK', '#2563EB'], ['AM', '#4F6B8F'], ['NS', '#3F7D8C']].map(([t, bg], i) => (
                    <span key={t} style={{ width: 32, height: 32, borderRadius: '50%', background: bg, border: '2px solid var(--bg)', marginLeft: i ? -9 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-3)', border: '2px solid var(--bg)', marginLeft: -9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}>+120</span>
                </div>
                <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>120+ students registered and counting</span>
              </div>
            </div>

            <div style={{ animation: 'kpRise .6s ease' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--shadow)', padding: 22, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 10px', borderRadius: 'var(--r-pill)' }}>Sample profile</span>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ width: 58, height: 58, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 19, fontWeight: 600, boxShadow: '0 0 0 3px var(--surface), 0 0 0 4px var(--border)' }}>HK</span>
                  <div>
                    <div style={{ fontWeight: 650, fontSize: 18, letterSpacing: '-.01em' }}>Harleen Kaur</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Final-year CSE · Frontend &amp; React</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 550, padding: '4px 11px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)' }}>Open to internship</span>
                  <span style={{ fontSize: 12, padding: '4px 11px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Web Development</span>
                </div>
                <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>B.Tech Computer Science · Akal University · Bathinda, Punjab · 8 months exp</div>
                <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['React', 'TypeScript', 'Tailwind'].map((s) => (
                    <span key={s} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 'var(--r-chip)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{s}</span>
                  ))}
                  <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 'var(--r-chip)', color: 'var(--text-subtle)' }}>+5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
          {STATS.map((st) => (
            <div key={st.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span aria-hidden style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><st.icon size={22} /></span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1 }}>{st.num}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{st.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 8px' }}>
        <div style={{ maxWidth: 620 }}>
          <span style={eyebrow}>Everything in one place</span>
          <h2 style={{ fontSize: 'clamp(26px,3.4vw,34px)', letterSpacing: '-.02em', fontWeight: 700, margin: '12px 0 0' }}>A full campus network, not just a directory.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18, marginTop: 36 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: 22, boxShadow: 'var(--shadow)' }}>
              <span aria-hidden style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary-soft-border)' }}><f.icon size={21} /></span>
              <h3 style={{ fontSize: 16.5, fontWeight: 650, margin: '16px 0 0', letterSpacing: '-.01em' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '7px 0 0', lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={eyebrow}>How it works</span>
          <h2 style={{ fontSize: 'clamp(26px,3.4vw,34px)', letterSpacing: '-.02em', fontWeight: 700, margin: '12px 0 0' }}>Three steps from profile to placed.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18, marginTop: 36 }}>
          {STEPS.map((step) => (
            <div key={step.n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: 26, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><step.icon size={20} /></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)' }}>STEP {step.n}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 650, margin: '16px 0 0', letterSpacing: '-.01em' }}>{step.title}</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== EXPLORE STUDENTS ===================== */}
      {cards.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <div>
              <span style={eyebrow}>The register</span>
              <h2 style={{ fontSize: 'clamp(26px,3.4vw,34px)', letterSpacing: '-.02em', fontWeight: 700, margin: '12px 0 0' }}>Explore talented students.</h2>
            </div>
            <Link to="/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 550, fontSize: 14, textDecoration: 'none' }}>
              See all <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
            {cards.map((vm) => (
              <StudentCard key={vm.id} vm={vm} />
            ))}
          </div>
        </section>
      )}

      {/* ===================== CTA ===================== */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'var(--primary)', borderRadius: 22, padding: 'clamp(32px,5vw,56px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 120% at 100% 0%, rgba(255,255,255,.14), transparent 55%)' }} />
          <div style={{ position: 'relative', maxWidth: 620 }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(26px,4vw,40px)', letterSpacing: '-.02em', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Your next opportunity starts with a profile.</h2>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 16, margin: '16px 0 0', lineHeight: 1.6 }}>It takes a few minutes to set up — and a network of recruiters to find you.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              {!user && <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 22px', borderRadius: 'var(--r-ctl)', background: '#fff', color: '#0F1115', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Sign in</Link>}
              <Link to="/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 'var(--r-ctl)', background: 'rgba(255,255,255,.16)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,.25)' }}>Browse the register</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
