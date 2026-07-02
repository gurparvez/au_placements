import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Building2, MapPin } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import companiesApi, { type Company, type Pagination } from '@/api/companies';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none' };

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companiesApi.list({ page, limit: 12, q: q.trim() || undefined });
      setCompanies(res.data); setPagination(res.pagination);
    } catch { toast.error('Could not load companies.'); }
    finally { setLoading(false); }
  }, [page]); // q on submit

  useEffect(() => { load(); }, [load]);

  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const toggleFollow = async (c: Company) => {
    if (!user) { toast.error('Sign in to follow companies.'); navigate('/login'); return; }
    try {
      const res = c.is_following ? await companiesApi.unfollow(c.companyUserId) : await companiesApi.follow(c.companyUserId);
      setCompanies((prev) => prev.map((x) => (x.companyUserId === c.companyUserId ? { ...x, is_following: res.following, followers: res.followers } : x)));
    } catch { toast.error('Could not update follow.'); }
  };

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>Companies</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>Follow companies to stay close to recruiters hiring from your universities.</p>

      <form onSubmit={submitSearch} style={{ display: 'flex', gap: 10, margin: '22px 0 20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <button type="submit" style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 550, fontSize: 13, cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading…</p>
      ) : companies.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No companies yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {companies.map((c) => (
            <div key={c.companyUserId} style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {c.logo ? (
                  <img src={c.logo} alt={c.company} style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', flex: 'none' }} />
                ) : (
                  <span style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flex: 'none' }}><Building2 size={22} /></span>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
                  {c.industry && <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{c.industry}</div>}
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {c.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.location}</span>}
                <span>{c.followers ?? 0} follower{(c.followers ?? 0) === 1 ? '' : 's'}</span>
              </div>
              <button onClick={() => toggleFollow(c)}
                style={{ marginTop: 'auto', padding: '9px 14px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                  border: c.is_following ? '1px solid var(--border-strong)' : 'none',
                  background: c.is_following ? 'var(--surface)' : 'var(--primary)',
                  color: c.is_following ? 'var(--text)' : '#fff' }}>
                {c.is_following ? 'Following ✓' : '+ Follow'}
              </button>
            </div>
          ))}
        </div>
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
