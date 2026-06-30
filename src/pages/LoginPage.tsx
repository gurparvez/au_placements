import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { loginUser, registerUser } from '@/context/auth/authSlice';
import { isValidEmail } from '@/utils/validation';

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

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState('');

  const [siRoll, setSiRoll] = useState('');
  const [siPw, setSiPw] = useState('');
  const [siShow, setSiShow] = useState(false);

  const [rUni, setRUni] = useState('');
  const [rRoll, setRRoll] = useState('');
  const [rFirst, setRFirst] = useState('');
  const [rLast, setRLast] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rPw, setRPw] = useState('');
  const [rShow, setRShow] = useState(false);
  const [idCard, setIdCard] = useState<File | null>(null);

  const submitSignin = async () => {
    const er: Errors = {};
    if (!siRoll.trim()) er.siRoll = 'Enter your AUID / Roll No.';
    if (!siPw) er.siPw = 'Enter your password';
    setErrors(er);
    if (Object.keys(er).length) { setBanner('Please fix the highlighted fields.'); return; }
    setBanner('');
    const res = await dispatch(loginUser({ auid: siRoll.trim(), password: siPw.trim() }));
    if (loginUser.fulfilled.match(res)) navigate('/profiles', { replace: true });
  };

  const submitRegister = async () => {
    const er: Errors = {};
    if (!rUni) er.rUni = 'Select your university';
    if (!rRoll.trim()) er.rRoll = 'AUID / Roll No. required';
    if (!rFirst.trim()) er.rFirst = 'First name required';
    if (!rLast.trim()) er.rLast = 'Last name required';
    if (!rEmail.trim() || !isValidEmail(rEmail.trim())) er.rEmail = 'Valid email required';
    if (!/^\d{10}$/.test(rPhone.trim())) er.rPhone = 'Enter a 10-digit phone';
    if ((rPw || '').length < 8) er.rPw = 'Minimum 8 characters';
    setErrors(er);
    if (Object.keys(er).length) { setBanner('Please fix the highlighted fields.'); return; }
    setBanner('');
    const res = await dispatch(
      registerUser({
        auid: rRoll.trim(), firstName: rFirst.trim(), lastName: rLast.trim(), email: rEmail.trim(),
        phone: rPhone.trim(), password: rPw, university: rUni as 'Akal University' | 'Eternal University',
        id_card: idCard || undefined,
      })
    );
    if (registerUser.fulfilled.match(res)) navigate('/profiles/create', { replace: true });
  };

  const onIdCard = (f?: File) => {
    if (f && f.size > 5 * 1024 * 1024) { setBanner('ID image must be 5MB or smaller'); return; }
    setIdCard(f || null);
  };

  const tabBtn = (m: 'signin' | 'register', label: string) => (
    <button
      onClick={() => { setTab(m); setErrors({}); setBanner(''); }}
      aria-pressed={tab === m}
      style={{ flex: 1, padding: 10, borderRadius: 7, cursor: 'pointer', fontWeight: 600, fontSize: 14, border: 'none', color: tab === m ? '#fff' : 'var(--text-muted)', background: tab === m ? 'var(--primary)' : 'transparent', transition: 'all .15s' }}
    >
      {label}
    </button>
  );

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
              ['Verified by your university ID', 'Recruiters trust the register.'],
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
        <div style={{ padding: 'clamp(28px,4vw,44px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-ctl)', padding: 4, gap: 4 }}>
            {tabBtn('signin', 'Sign in')}
            {tabBtn('register', 'Register')}
          </div>

          {(banner || authError) && (
            <div role="alert" style={{ marginTop: 18, padding: '11px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13.5, fontWeight: 500 }}>
              {banner || authError}
            </div>
          )}

          {tab === 'signin' ? (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label htmlFor="si-roll" style={labelStyle}>AUID / Roll No.</label>
                <input id="si-roll" value={siRoll} onChange={(e) => setSiRoll(e.target.value)} placeholder="e.g. 100482" style={fieldStyle(errors.siRoll)} />
                {errors.siRoll && <div style={errStyle}>{errors.siRoll}</div>}
              </div>
              <div>
                <label htmlFor="si-pw" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="si-pw" type={siShow ? 'text' : 'password'} value={siPw} onChange={(e) => setSiPw(e.target.value)} placeholder="Your password" style={{ ...fieldStyle(errors.siPw), paddingRight: 56 }} />
                  <button onClick={() => setSiShow((v) => !v)} aria-label="Show or hide password" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '6px 8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12.5, fontWeight: 550, background: 'none', border: 'none' }}>{siShow ? 'Hide' : 'Show'}</button>
                </div>
                {errors.siPw && <div style={errStyle}>{errors.siPw}</div>}
              </div>
              <button onClick={submitSignin} style={{ marginTop: 6, padding: 13, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none' }}>Sign in</button>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', margin: '2px 0 0' }}>
                New here? <button onClick={() => setTab('register')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>Create an account</button>
              </p>
            </div>
          ) : (
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="r-uni" style={labelStyle}>University</label>
                <select id="r-uni" value={rUni} onChange={(e) => setRUni(e.target.value)} style={{ ...fieldStyle(errors.rUni), cursor: 'pointer' }}>
                  <option value="">Select your university</option>
                  <option value="Akal University">Akal University</option>
                  <option value="Eternal University">Eternal University</option>
                </select>
                {errors.rUni && <div style={errStyle}>{errors.rUni}</div>}
              </div>
              <div>
                <label htmlFor="r-roll" style={labelStyle}>AUID / Roll No.</label>
                <input id="r-roll" value={rRoll} onChange={(e) => setRRoll(e.target.value)} placeholder="5–15 digit university ID" style={fieldStyle(errors.rRoll)} />
                {errors.rRoll && <div style={errStyle}>{errors.rRoll}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="r-first" style={labelStyle}>First name</label>
                  <input id="r-first" value={rFirst} onChange={(e) => setRFirst(e.target.value)} style={fieldStyle(errors.rFirst)} />
                  {errors.rFirst && <div style={errStyle}>{errors.rFirst}</div>}
                </div>
                <div>
                  <label htmlFor="r-last" style={labelStyle}>Last name</label>
                  <input id="r-last" value={rLast} onChange={(e) => setRLast(e.target.value)} style={fieldStyle(errors.rLast)} />
                  {errors.rLast && <div style={errStyle}>{errors.rLast}</div>}
                </div>
              </div>
              <div>
                <label htmlFor="r-email" style={labelStyle}>Email</label>
                <input id="r-email" type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} placeholder="you@example.com" style={fieldStyle(errors.rEmail)} />
                {errors.rEmail && <div style={errStyle}>{errors.rEmail}</div>}
              </div>
              <div>
                <label htmlFor="r-phone" style={labelStyle}>Phone</label>
                <input id="r-phone" value={rPhone} onChange={(e) => setRPhone(e.target.value)} placeholder="10-digit number" style={fieldStyle(errors.rPhone)} />
                {errors.rPhone && <div style={errStyle}>{errors.rPhone}</div>}
              </div>
              <div>
                <label htmlFor="r-pw" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="r-pw" type={rShow ? 'text' : 'password'} value={rPw} onChange={(e) => setRPw(e.target.value)} placeholder="Minimum 8 characters" style={{ ...fieldStyle(errors.rPw), paddingRight: 56 }} />
                  <button onClick={() => setRShow((v) => !v)} aria-label="Show or hide password" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '6px 8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12.5, fontWeight: 550, background: 'none', border: 'none' }}>{rShow ? 'Hide' : 'Show'}</button>
                </div>
                {errors.rPw && <div style={errStyle}>{errors.rPw}</div>}
              </div>
              <div>
                <label style={labelStyle}>ID card photo <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(optional)</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 'var(--r-ctl)', border: '1px dashed var(--border-strong)', background: 'var(--bg-2)', cursor: 'pointer', fontSize: 13.5, color: 'var(--text-muted)', position: 'relative' }}>
                  <span aria-hidden style={{ fontSize: 15 }}>⤓</span>
                  <span>{idCard ? idCard.name : 'Choose an image to upload'}</span>
                  <input type="file" accept="image/*" onChange={(e) => onIdCard(e.target.files?.[0])} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
                </label>
              </div>
              <button onClick={submitRegister} style={{ marginTop: 4, padding: 13, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none' }}>Create account</button>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', margin: '2px 0 0' }}>
                Already registered? <button onClick={() => setTab('signin')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>Sign in</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
