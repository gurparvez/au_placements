import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, MapPin, Users, UserPlus, Check } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import companiesApi, { type Company, type Pagination } from '@/api/companies';
import { avatarColor } from '@/utils/avatar';
import { Reveal } from '@/components/motion';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none' };
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (over?: { q?: string; page?: number }) => {
    setLoading(true);
    try {
      const res = await companiesApi.list({ page: over?.page ?? page, limit: 12, q: (over?.q ?? q).trim() || undefined });
      setCompanies(res.data); setPagination(res.pagination);
    } catch { toast.error('Could not load companies.'); }
    finally { setLoading(false); }
  }, [page]); // q on submit

  useEffect(() => { load(); }, [load]);

  // Pass q/page explicitly — the memoized load() closure only refreshes when its
  // deps change, so a bare load() here would search with a stale query.
  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load({ q, page: 1 }); };

  const toggleFollow = async (c: Company) => {
    if (!user) { toast.error('Sign in to follow companies.'); navigate('/login'); return; }
    try {
      const res = c.is_following ? await companiesApi.unfollow(c.companyUserId) : await companiesApi.follow(c.companyUserId);
      setCompanies((prev) => prev.map((x) => (x.companyUserId === c.companyUserId ? { ...x, is_following: res.following, followers: res.followers } : x)));
    } catch { toast.error('Could not update follow.'); }
  };

  return (
    <section style={{ padding: '40px clamp(20px,10vw,112px) 80px' }}>
      <Reveal>
        <div className="brass-rule" style={{ marginBottom: 14 }} />
        <span className="ledger-label" style={{ color: 'var(--brass)' }}>Recruiting partners</span>
        <h1 className="font-display" style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, letterSpacing: '-.02em', margin: '10px 0 0' }}>Companies</h1>
        <p style={{ textAlign: 'left', color: 'var(--text-muted)', marginTop: 10, fontSize: 15, maxWidth: '56ch', lineHeight: 1.6 }}>Follow companies recruiting from our universities.</p>
      </Reveal>

      <form onSubmit={submitSearch} style={{ display: 'flex', gap: 10, margin: '22px 0 20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <button type="submit" {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer', transition: 'background .18s ease' }}>Search</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading…</p>
      ) : companies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-card)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 650, margin: 0 }}>{q ? 'No companies match your search' : 'No companies yet'}</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>
            {q ? 'Check the spelling, or clear the search to browse every partner.' : 'Recruiting partners appear here once they join the register.'}
          </p>
          {q && (
            <button
              onClick={() => { setQ(''); setPage(1); if (page === 1) load({ q: '' }); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
              style={{ marginTop: 16, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background .18s ease' }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <Reveal delay={0.05}>
        {/* Locked to 4 per row on desktop; stacks via the responsive helper on small screens */}
        <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          {companies.map((c) => (
            <div
              key={c.companyUserId}
              style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color .18s, box-shadow .18s, transform .18s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 35%, var(--border))'; e.currentTarget.style.boxShadow = '0 18px 34px -24px rgba(0,0,0,.42)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Link to={`/companies/${c.companyUserId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                {c.logo ? (
                  <img src={c.logo} alt={c.company} style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover', flex: 'none', border: '1px solid var(--border)' }} />
                ) : (
                  <span aria-hidden style={{ width: 50, height: 50, borderRadius: 12, background: avatarColor(c.company), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flex: 'none' }}>{companyInitials(c.company)}</span>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
                  {c.industry && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.industry}</div>}
                </div>
              </Link>
              <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', display: 'flex', gap: 14, flexWrap: 'wrap', paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
                {c.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {c.location}</span>}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {c.followers ?? 0} follower{(c.followers ?? 0) === 1 ? '' : 's'}</span>
              </div>
              <button onClick={() => toggleFollow(c)}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.is_following ? 'var(--surface-2)' : 'var(--primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = c.is_following ? 'var(--surface)' : 'var(--primary)')}
                style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 14px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', transition: 'background .18s ease',
                  border: c.is_following ? '1px solid var(--border-strong)' : 'none',
                  background: c.is_following ? 'var(--surface)' : 'var(--primary)',
                  color: c.is_following ? 'var(--text)' : 'var(--on-primary)' }}>
                {c.is_following ? <><Check size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
              </button>
            </div>
          ))}
        </div>
        </Reveal>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: '8px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} style={{ padding: '8px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: page >= pagination.totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CompaniesPage;
