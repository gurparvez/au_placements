import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import authApi, { type RecruiterRequestPayload } from '@/api/auth';
import { isValidEmail } from '@/utils/validation';

const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 550, marginBottom: 6 };
const err: React.CSSProperties = { color: 'var(--danger)', fontSize: 12.5, marginTop: 5 };
const field = (e?: string): React.CSSProperties => ({
  width: '100%', padding: '11px 13px', borderRadius: 'var(--r-ctl)',
  border: `1px solid ${e ? 'var(--danger)' : 'var(--border-strong)'}`,
  background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
});

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;

type Errs = Record<string, string>;

function extractError(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const d: any = e.response?.data;
    if (Array.isArray(d?.errors) && d.errors.length) return d.errors.map((x: any) => x.message).join(', ');
    if (d?.message) return d.message;
  }
  return fallback;
}

const RecruiterApply: React.FC = () => {
  const [form, setForm] = useState<RecruiterRequestPayload>({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    company: '', designation: '', company_website: '', industry: '',
    company_size: undefined, location: '', linkedin_url: '', about: '',
  });
  const [errors, setErrors] = useState<Errs>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof RecruiterRequestPayload>(k: K, v: RecruiterRequestPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const er: Errs = {};
    if (!form.firstName.trim()) er.firstName = 'First name is required';
    if (!isValidEmail(form.email.trim())) er.email = 'Valid email required';
    if (form.password.length < 8) er.password = 'Minimum 8 characters';
    if (!form.company.trim()) er.company = 'Company name is required';
    if (form.phone && !/^\d{10,15}$/.test(form.phone)) er.phone = 'Enter a 10–15 digit phone';
    setErrors(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    try {
      // strip empty optionals
      const payload: RecruiterRequestPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName?.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        password: form.password,
        company: form.company.trim(),
        designation: form.designation?.trim() || undefined,
        company_website: form.company_website?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        company_size: form.company_size || undefined,
        location: form.location?.trim() || undefined,
        linkedin_url: form.linkedin_url?.trim() || undefined,
        about: form.about?.trim() || undefined,
      };
      await authApi.requestRecruiter(payload);
      setDone(true);
    } catch (e) {
      toast.error(extractError(e, 'Could not submit your request. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Request submitted</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
          Thanks! Your recruiter account is <strong>pending admin approval</strong>. Once approved you
          can sign in with your email and password to contact students and post openings.
        </p>
        <Link to="/login" style={{ display: 'inline-block', marginTop: 22, padding: '11px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>Apply as a recruiter</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>
        Tell us about you and your company. An admin reviews every request before your account is activated.
      </p>

      <div style={{ marginTop: 26, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={label}>First name</label>
          <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} style={field(errors.firstName)} />
          {errors.firstName && <div style={err}>{errors.firstName}</div>}
        </div>
        <div>
          <label style={label}>Last name</label>
          <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} style={field()} />
        </div>
        <div>
          <label style={label}>Work email</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@company.com" style={field(errors.email)} />
          {errors.email && <div style={err}>{errors.email}</div>}
        </div>
        <div>
          <label style={label}>Phone</label>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="10-digit number" style={field(errors.phone)} />
          {errors.phone && <div style={err}>{errors.phone}</div>}
        </div>
        <div>
          <label style={label}>Password</label>
          <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min 8 characters" style={field(errors.password)} />
          {errors.password && <div style={err}>{errors.password}</div>}
        </div>
        <div>
          <label style={label}>Your designation</label>
          <input value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="e.g. HR Manager" style={field()} />
        </div>

        <div style={{ gridColumn: '1 / -1', height: 1, background: 'var(--border)', margin: '4px 0' }} />

        <div>
          <label style={label}>Company name</label>
          <input value={form.company} onChange={(e) => set('company', e.target.value)} style={field(errors.company)} />
          {errors.company && <div style={err}>{errors.company}</div>}
        </div>
        <div>
          <label style={label}>Company website</label>
          <input value={form.company_website} onChange={(e) => set('company_website', e.target.value)} placeholder="https://…" style={field()} />
        </div>
        <div>
          <label style={label}>Industry</label>
          <input value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. Software" style={field()} />
        </div>
        <div>
          <label style={label}>Company size</label>
          <select value={form.company_size ?? ''} onChange={(e) => set('company_size', (e.target.value || undefined) as any)} style={{ ...field(), cursor: 'pointer' }}>
            <option value="">Select</option>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Location</label>
          <input value={form.location} onChange={(e) => set('location', e.target.value)} style={field()} />
        </div>
        <div>
          <label style={label}>LinkedIn URL</label>
          <input value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/…" style={field()} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={label}>About the company <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(optional)</span></label>
          <textarea value={form.about} onChange={(e) => set('about', e.target.value)} rows={3} style={{ ...field(), resize: 'vertical' }} />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 13.5, textDecoration: 'none' }}>← Back to sign in</Link>
          <button onClick={submit} disabled={submitting} style={{ padding: '12px 22px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', border: 'none', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecruiterApply;
