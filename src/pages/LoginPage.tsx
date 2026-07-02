import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authError = useAppSelector((s) => s.auth.error);

  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState('');

  const [siRoll, setSiRoll] = useState('');
  const [siPw, setSiPw] = useState('');
  const [siShow, setSiShow] = useState(false);

  const submitSignin = async () => {
    const er: Errors = {};
    if (!siRoll.trim()) er.siRoll = 'Enter your AUID or email.';
    if (!siPw) er.siPw = 'Enter your password';
    setErrors(er);
    if (Object.keys(er).length) { setBanner('Please fix the highlighted fields.'); return; }
    setBanner('');
    const res = await dispatch(loginUser({ identifier: siRoll.trim(), password: siPw.trim() }));
    if (loginUser.fulfilled.match(res)) {
      const roles = res.payload.data.user.roles || [];
      const dest = roles.includes('admin') ? '/admin' : roles.includes('recruiter') ? '/students' : '/profiles';
      navigate(dest, { replace: true });
    }
  };

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div data-kp-split="true" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)', minHeight: 560 }}>
        {/* Left panel */}
        <div data-kp-show="desktop" style={{ background: 'var(--primary)', padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(110% 90% at 100% 0%, rgba(255,255,255,.16), transparent 55%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="19" fill="#fff" />
                <rect x="11.5" y="11.5" width="17" height="17" rx="2.5" transform="rotate(45 20 20)" fill="var(--primary)" />
                <circle cx="20" cy="20" r="4.4" fill="#fff" />
              </svg>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Kalgidhar Placements</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: 30, letterSpacing: '-.02em', fontWeight: 700, margin: '48px 0 0', lineHeight: 1.15 }}>One profile.<br />Seen by every recruiter.</h2>
          </div>
          <ul style={{ position: 'relative', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Verified by your university', 'Recruiters trust the register.'],
              ['Visible across the whole network', 'Akal & Eternal, one directory.'],
              ['Yours to edit anytime', 'Keep it fresh as you grow.'],
            ].map(([t, s]) => (
              <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: '#fff' }}>
                <span aria-hidden style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontSize: 13 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{t}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)' }}>{s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div style={{ padding: 'clamp(28px,4vw,44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>Sign in</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '8px 0 0' }}>
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
              <input id="si-roll" value={siRoll} onChange={(e) => setSiRoll(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSignin()} placeholder="Students: AUID · Recruiters: email" style={fieldStyle(errors.siRoll)} />
              {errors.siRoll && <div style={errStyle}>{errors.siRoll}</div>}
            </div>
            <div>
              <label htmlFor="si-pw" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="si-pw" type={siShow ? 'text' : 'password'} value={siPw} onChange={(e) => setSiPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSignin()} placeholder="Your password" style={{ ...fieldStyle(errors.siPw), paddingRight: 56 }} />
                <button onClick={() => setSiShow((v) => !v)} aria-label="Show or hide password" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '6px 8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12.5, fontWeight: 550, background: 'none', border: 'none' }}>{siShow ? 'Hide' : 'Show'}</button>
              </div>
              {errors.siPw && <div style={errStyle}>{errors.siPw}</div>}
            </div>
            <button onClick={submitSignin} style={{ marginTop: 6, padding: 13, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none' }}>Sign in</button>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>
              Are you a recruiter?{' '}
              <Link to="/recruiter/apply" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Apply for access</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
