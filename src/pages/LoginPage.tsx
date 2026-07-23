import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, BadgeCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { loginUser } from '@/context/auth/authSlice';

type Errors = { [k: string]: string };

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 550, marginBottom: 6 };
const errStyle: React.CSSProperties = { color: 'var(--danger)', fontSize: 12.5, marginTop: 5 };
const fieldStyle = (err?: string): React.CSSProperties => ({
  width: '100%', padding: '11px 13px', borderRadius: 'var(--r-ctl)',
  border: `1px solid ${err ? 'var(--danger)' : 'var(--border-strong)'}`,
  background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
});

// The left panel always sits over a dark photo, so its accents are fixed
// light-on-dark regardless of the app theme — the old brass/gold, kept only on this page.
const PANEL_ACCENT = '#d8b25a';
const EASE = [0.16, 1, 0.3, 1] as const;

const PROOF: [string, string][] = [
  ['Verified by your university', 'Recruiters trust the register.'],
  ['Visible across the whole network', 'Akal & Eternal, one directory.'],
  ['Yours to edit anytime', 'Keep it fresh as you grow.'],
];

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authError = useAppSelector((s) => s.auth.error);

  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [siRoll, setSiRoll] = useState('');
  const [siPw, setSiPw] = useState('');
  const [siShow, setSiShow] = useState(false);

  const submitSignin = async () => {
    if (submitting) return;
    const er: Errors = {};
    if (!siRoll.trim()) er.siRoll = 'Enter your AUID or email.';
    if (!siPw) er.siPw = 'Enter your password.';
    setErrors(er);
    if (Object.keys(er).length) {
      setBanner('Please fix the highlighted fields.');
      document.getElementById(er.siRoll ? 'si-roll' : 'si-pw')?.focus();
      return;
    }
    setBanner('');
    setSubmitting(true);
    try {
      // Password goes verbatim — no flow that SETS passwords trims them, so
      // trimming here would lock out anyone whose password has edge whitespace.
      const res = await dispatch(loginUser({ identifier: siRoll.trim(), password: siPw }));
      if (loginUser.fulfilled.match(res)) {
        const roles = res.payload.data.user.roles || [];
        const dest = roles.includes('admin') ? '/admin' : roles.includes('recruiter') ? '/students' : '/profiles';
        navigate(dest, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ padding: '40px clamp(20px,10vw,112px) 80px' }}>
      <div
        data-kp-split="true"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)', minHeight: 580 }}
      >
        {/* ---------------- Left: editorial register panel ---------------- */}
        <div
          data-kp-show="desktop"
          style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 44 }}
        >
          <img src="/login_panel.webp" alt="" aria-hidden loading="lazy" width={1339} height={847} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* base wash + extra weight behind the headline (top) and proof ledger (bottom) */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(9,11,16,.50) 0%, rgba(9,11,16,.16) 34%, rgba(9,11,16,.16) 56%, rgba(9,11,16,.68) 100%), linear-gradient(165deg, rgba(9,11,16,.16) 0%, rgba(9,11,16,.22) 100%)' }} />

          {/* Top: identity */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* fixed dark panel — always the dark-mode mark, whatever the app theme */}
              <img src="/logo2.png" alt="Kalgidhar Trust" width={30} height={30} style={{ display: 'block', objectFit: 'contain', borderRadius: 7 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Kalgidhar Placements</span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
              style={{ height: 2, width: 40, background: PANEL_ACCENT, borderRadius: 2, margin: '30px 0 14px', transformOrigin: 'left center' }}
            />
            <span className="ledger-label" style={{ color: PANEL_ACCENT }}>The Akal &amp; Eternal Register</span>
            <div className="font-display" style={{ color: '#fff', fontSize: 32, letterSpacing: '-.02em', fontWeight: 500, margin: '12px 0 0', lineHeight: 1.12, maxWidth: '16ch', textWrap: 'balance' }}>
              One profile. Seen by every recruiter.
            </div>
          </motion.div>

          {/* Bottom: proof ledger */}
          <ul style={{ position: 'relative', listStyle: 'none', padding: 0, margin: 0 }}>
            {PROOF.map(([t, s], i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.35 + i * 0.12 }}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderTop: i ? '1px solid rgba(255,255,255,.14)' : 'none' }}
              >
                <BadgeCheck size={18} aria-hidden style={{ color: PANEL_ACCENT, flex: 'none', marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: '#fff' }}>{t}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.74)' }}>{s}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* ---------------- Right: sign-in form ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          style={{ padding: 'clamp(28px,4vw,44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div>
            <div className="brass-rule" style={{ marginBottom: 14 }} />
            <span className="ledger-label">Sign in to the register</span>
            <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.02em', margin: '10px 0 0' }}>Sign in</h1>
            <p style={{ textAlign: 'left', fontSize: 13.5, color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.55 }}>
              Accounts are created by your placement office. Contact an administrator if you need access.
            </p>
          </div>

          {(banner || authError) && (
            <div role="alert" style={{ marginTop: 18, padding: '11px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13.5, fontWeight: 500 }}>
              {banner || authError}
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="si-roll" style={labelStyle}>AUID or Email</label>
              <div style={{ position: 'relative' }}>
                <User size={16} aria-hidden style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  id="si-roll"
                  name="identifier"
                  autoComplete="username"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={siRoll}
                  onChange={(e) => setSiRoll(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitSignin()}
                  placeholder="Students: AUID · Recruiters: email"
                  style={{ ...fieldStyle(errors.siRoll), paddingLeft: 38 }}
                />
              </div>
              {errors.siRoll && <div style={errStyle}>{errors.siRoll}</div>}
            </div>
            <div>
              <label htmlFor="si-pw" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} aria-hidden style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  id="si-pw"
                  name="password"
                  type={siShow ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={siPw}
                  onChange={(e) => setSiPw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitSignin()}
                  placeholder="Your password"
                  style={{ ...fieldStyle(errors.siPw), paddingLeft: 38, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setSiShow((v) => !v)}
                  aria-label={siShow ? 'Hide password' : 'Show password'}
                  aria-pressed={siShow}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: 4 }}
                >
                  {siShow ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.siPw && <div style={errStyle}>{errors.siPw}</div>}
            </div>
            <button
              onClick={submitSignin}
              disabled={submitting}
              style={{ marginTop: 6, padding: 13, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', border: 'none', opacity: submitting ? 0.7 : 1, transition: 'background .18s ease' }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>
              Are you a recruiter?{' '}
              <Link to="/recruiter/apply" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Apply for access</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoginPage;
