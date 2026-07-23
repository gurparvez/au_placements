import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Search, MapPin, Briefcase, Building2, GraduationCap, Clock, CalendarClock, ArrowUpRight, Check, Users } from 'lucide-react';
import openingsApi, { type Opening, type Pagination } from '@/api/openings';
import { useAppSelector } from '@/context/hooks';
import { avatarColor } from '@/utils/avatar';
import { Reveal, AnimatedNumber } from '@/components/motion';
import { motion } from 'motion/react';
import { SelectField } from '@/components/ui/select-field';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)',
  border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
};
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});
const pill = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: bg, color,
});
const metaPill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, padding: '4px 10px',
  borderRadius: 999, background: 'var(--bg-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
};

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';

const OpeningsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isStudent = !!user?.roles?.includes('student');
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  const apply = async (o: Opening) => {
    if (!user) { toast.error('Sign in as a student to apply.'); navigate('/login'); return; }
    if (!isStudent) { toast.error('Only students can apply to openings.'); return; }
    setApplying(o._id);
    try {
      const res = await openingsApi.apply(o._id);
      setOpenings((prev) => prev.map((x) => (x._id === o._id ? { ...x, has_applied: true, application_count: res.application_count } : x)));
      toast.success('Application submitted.');
    } catch (e) {
      const msg = axios.isAxiosError(e) ? (e.response?.data as any)?.message : undefined;
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setOpenings((prev) => prev.map((x) => (x._id === o._id ? { ...x, has_applied: true } : x)));
      }
      toast.error(msg || 'Could not submit your application.');
    } finally {
      setApplying(null);
    }
  };

  const load = useCallback(async (over?: { q?: string; type?: string; university?: string; page?: number }) => {
    setLoading(true);
    try {
      const res = await openingsApi.list({
        page: over?.page ?? page, limit: 12,
        q: (over?.q ?? q).trim() || undefined,
        type: (over?.type ?? type) || undefined,
        university: (over?.university ?? university) || undefined,
      });
      setOpenings(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load openings.');
    } finally {
      setLoading(false);
    }
  }, [page, type, university]); // q applied on submit

  useEffect(() => { load(); }, [load]);

  // Pass q/page explicitly — the memoized load() closure only refreshes when its
  // deps change, so a bare load() here would search with a stale query.
  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load({ q, page: 1 }); };

  return (
    <section style={{ padding: '40px clamp(20px,10vw,112px) 80px' }}>
      <Reveal>
        <div className="brass-rule" style={{ marginBottom: 14 }} />
        <span className="ledger-label" style={{ color: 'var(--brass)' }}>Internships &amp; jobs</span>
        <h1 className="font-display" style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, letterSpacing: '-.02em', margin: '10px 0 0' }}>Openings</h1>
        <p style={{ textAlign: 'left', color: 'var(--text-muted)', marginTop: 10, fontSize: 14 }}>
          Internships and jobs from our recruiters.
        </p>
      </Reveal>

      <form onSubmit={submitSearch} style={{ display: 'flex', gap: 10, margin: '22px 0 20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, company, location" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <SelectField aria-label="Type" value={type} onChange={(v) => { setType(v); setPage(1); }} style={{ width: 170 }}
          options={[{ value: '', label: 'Any type' }, { value: 'internship', label: 'Internship' }, { value: 'job', label: 'Job' }]} />
        <SelectField aria-label="University" value={university} onChange={(v) => { setUniversity(v); setPage(1); }} style={{ width: 190 }}
          options={[{ value: '', label: 'Any university' }, { value: 'Akal University', label: 'Akal University' }, { value: 'Eternal University', label: 'Eternal University' }]} />
        <button type="submit" {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: 550, fontSize: 13, cursor: 'pointer', transition: 'background .18s ease' }}>Search</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>Loading…</p>
      ) : openings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-card)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 650, margin: 0 }}>
            {q || type || university ? 'No openings match your filters' : 'No openings posted yet'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>
            {q || type || university ? 'Try a broader search, or clear the filters to see everything.' : 'Check back soon — new roles from recruiting partners appear here.'}
          </p>
          {(q || type || university) && (
            <button
              onClick={() => {
                setQ(''); setPage(1);
                // type/university are load() deps — clearing them refetches via the
                // effect; when they're already empty, fetch explicitly with overrides.
                if (!type && !university && page === 1) load({ q: '' });
                else { setType(''); setUniversity(''); }
              }}
              {...hoverBg('var(--primary-hover)', 'var(--primary)')}
              style={{ marginTop: 16, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background .18s ease' }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* Two cards per row — equal heights, staggered entrance, springy lift on hover */
        <div data-kp-split style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          {openings.map((o, i) => (
            <motion.article
              key={o._id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-4% 0px' }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.08 }}
              style={{ ...card, padding: 20, height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', transition: 'border-color .18s, box-shadow .18s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 35%, var(--border))'; e.currentTarget.style.boxShadow = '0 16px 32px -24px rgba(0,0,0,.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
                  <span aria-hidden style={{ width: 48, height: 48, borderRadius: 12, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', background: avatarColor(o.company) }}>
                    {companyInitials(o.company)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <h2 className="font-display" style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: '-.01em' }}>{o.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, color: 'var(--text-muted)', fontSize: 13.5, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 550, color: 'var(--text)' }}><Building2 size={14} /> {o.company}</span>
                      {o.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={14} /> {o.location}</span>}
                      {o.work_mode && <span style={{ textTransform: 'capitalize' }}>{o.work_mode}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span style={pill('var(--primary-soft)', 'var(--primary)')}>
                    <Briefcase size={12} /> {o.type === 'job' ? 'Job' : 'Internship'}
                  </span>
                  {o.stipend_or_salary && <span style={pill('var(--surface-2)', 'var(--text-muted)')}>{o.stipend_or_salary}</span>}
                </div>
              </div>

              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.description}</p>

              {o.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {o.skills.slice(0, 5).map((s) => (
                    <span key={s._id} style={pill('var(--surface-2)', 'var(--text-muted)')}>{s.displayName || s.name}</span>
                  ))}
                  {o.skills.length > 5 && (
                    <span className="data" style={pill('transparent', 'var(--text-subtle)')}>+{o.skills.length - 5}</span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {o.eligible_universities?.length > 0 && <span style={metaPill}><GraduationCap size={13} /> {o.eligible_universities.map((u) => u.replace(' University', '')).join(', ')}</span>}
                  {typeof o.min_experience === 'number' && o.min_experience > 0 && <span style={metaPill}><Clock size={13} /> {o.min_experience} mo+</span>}
                  {o.apply_by && <span style={metaPill}><CalendarClock size={13} /> Apply by {fmtDate(o.apply_by)}</span>}
                  {typeof o.application_count === 'number' && o.application_count > 0 && <span style={metaPill}><Users size={13} /> <span className="data">{o.application_count.toLocaleString()}</span> applied</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {o.apply_url && (
                    <a href={o.apply_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 550, fontSize: 13, textDecoration: 'none' }}>External link <ArrowUpRight size={14} /></a>
                  )}
                  {o.has_applied ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600, fontSize: 13.5 }}><Check size={15} /> Applied</span>
                  ) : (
                    (!user || isStudent) && (
                      <button onClick={() => apply(o)} disabled={applying === o._id} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 13.5, border: 'none', cursor: 'pointer', opacity: applying === o._id ? 0.7 : 1, transition: 'background .18s ease' }}>
                        {applying === o._id ? 'Applying…' : 'Apply'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page <span className="data">{pagination.page}</span> of <span className="data">{pagination.totalPages}</span> · <AnimatedNumber className="data" value={pagination.total} /> openings</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: '8px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} style={{ padding: '8px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: page >= pagination.totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default OpeningsPage;
