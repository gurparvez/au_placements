import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, MapPin, Briefcase, Building2 } from 'lucide-react';
import openingsApi, { type Opening, type Pagination } from '@/api/openings';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)',
  border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none',
};
const pill = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: bg, color,
});

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const OpeningsPage: React.FC = () => {
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await openingsApi.list({ page, limit: 12, q: q.trim() || undefined, type: type || undefined, university: university || undefined });
      setOpenings(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load openings.');
    } finally {
      setLoading(false);
    }
  }, [page, type, university]); // q applied on submit

  useEffect(() => { load(); }, [load]);

  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>Openings</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>
        Internships and jobs posted by recruiters for Akal &amp; Eternal University students.
      </p>

      <form onSubmit={submitSearch} style={{ display: 'flex', gap: 10, margin: '22px 0 20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, company, location" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="">Any type</option>
          <option value="internship">Internship</option>
          <option value="job">Job</option>
        </select>
        <select value={university} onChange={(e) => { setUniversity(e.target.value); setPage(1); }} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="">Any university</option>
          <option value="Akal University">Akal University</option>
          <option value="Eternal University">Eternal University</option>
        </select>
        <button type="submit" style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: 550, fontSize: 13, cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>Loading…</p>
      ) : openings.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          {q || type || university ? 'No openings match your filters.' : 'No openings have been posted yet. Check back soon.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {openings.map((o) => (
            <article key={o._id} style={{ ...card, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{o.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: 'var(--text-muted)', fontSize: 13.5, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Building2 size={14} /> {o.company}</span>
                    {o.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={14} /> {o.location}</span>}
                    {o.work_mode && <span style={{ textTransform: 'capitalize' }}>· {o.work_mode}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span style={pill('var(--primary-soft)', 'var(--primary)')}>
                    <Briefcase size={11} style={{ verticalAlign: -1, marginRight: 4 }} />{o.type === 'job' ? 'Job' : 'Internship'}
                  </span>
                  {o.stipend_or_salary && <span style={pill('var(--surface-2)', 'var(--text-muted)')}>{o.stipend_or_salary}</span>}
                </div>
              </div>

              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{o.description}</p>

              {o.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {o.skills.map((s) => (
                    <span key={s._id} style={pill('var(--surface-2)', 'var(--text-muted)')}>{s.displayName || s.name}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {o.eligible_universities?.length > 0 && <span>Eligible: {o.eligible_universities.join(', ')}</span>}
                  {typeof o.min_experience === 'number' && o.min_experience > 0 && <span>Min exp: {o.min_experience} mo</span>}
                  {o.apply_by && <span>Apply by {fmtDate(o.apply_by)}</span>}
                </div>
                {o.apply_url && (
                  <a href={o.apply_url} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>Apply ↗</a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.totalPages} · {pagination.total} openings</span>
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
