import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Loader2, Users, Building2, MapPin, ArrowUpRight } from 'lucide-react';
import studentApi, { type UserSearchResult } from '@/api/students';
import companiesApi, { type Company } from '@/api/companies';
import { avatarColor, initials } from '@/utils/avatar';
import { Reveal } from '@/components/motion';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' };
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';
const fullName = (r: UserSearchResult) => `${r.firstName} ${r.lastName ?? ''}`.trim();

const SectionTitle: React.FC<{ icon: React.ReactNode; label: string; count: number }> = ({ icon, label, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px 10px', color: 'var(--text-muted)', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
    <span style={{ color: 'var(--brass)', display: 'inline-flex' }}>{icon}</span> {label} <span className="data" style={{ color: 'var(--text-subtle)' }}>{count}</span>
  </div>
);

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [people, setPeople] = useState<UserSearchResult[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Only the latest request may write results — a slow response for an older
  // term must never overwrite what the user is looking at now.
  const reqRef = useRef(0);
  const run = useCallback(async (term: string) => {
    const t = term.trim();
    const req = ++reqRef.current;
    if (t.length < 2) { setPeople([]); setCompanies([]); setSearched(false); return; }
    setLoading(true);
    try {
      const [ppl, comp] = await Promise.all([
        studentApi.searchStudents(t),
        companiesApi.list({ page: 1, limit: 8, q: t }),
      ]);
      if (req !== reqRef.current) return;
      setPeople(ppl);
      setCompanies(comp.data);
    } catch {
      if (req !== reqRef.current) return;
      setPeople([]); setCompanies([]);
    } finally {
      if (req === reqRef.current) {
        setLoading(false);
        setSearched(true);
      }
    }
  }, []);

  // Debounced live search; also keeps ?q= in the URL so results are shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      run(q);
      setParams(q.trim() ? { q: q.trim() } : {}, { replace: true });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const nothing = searched && !loading && people.length === 0 && companies.length === 0;

  return (
    <section style={{ padding: '32px clamp(20px,10vw,112px) 80px' }}>
      <Reveal>
        <div className="brass-rule" style={{ marginBottom: 14 }} />
        <span className="ledger-label" style={{ color: 'var(--brass)' }}>Search the register</span>
        <h1 className="font-display" style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 500, letterSpacing: '-.02em', margin: '10px 0 0' }}>Search</h1>
        <p style={{ margin: '10px 0 20px', fontSize: 13.5, color: 'var(--text-muted)' }}>Search by name, AUID, or company.</p>
      </Reveal>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people or companies…"
          aria-label="Search people or companies"
          style={{ width: '100%', padding: '13px 44px 13px 44px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontSize: 15, outline: 'none' }}
        />
        {loading && <Loader2 size={17} className="kp-spin" style={{ position: 'absolute', right: 14, top: 15, color: 'var(--text-subtle)' }} />}
      </div>

      {q.trim().length < 2 ? (
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Type at least 2 characters to search.
        </div>
      ) : nothing ? (
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Search size={26} style={{ opacity: 0.5 }} />
          <p style={{ margin: '10px 0 0', fontSize: 14 }}>No people or companies match “{q.trim()}”.</p>
        </div>
      ) : (
        <Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {/* People */}
          {people.length > 0 && (
            <div>
              <SectionTitle icon={<Users size={14} />} label="People" count={people.length} />
              <div style={card}>
                {people.map((r, i) => {
                  const name = fullName(r);
                  return (
                    <Link
                      key={r._id}
                      to={`/profiles/${r._id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textDecoration: 'none', color: 'var(--text)', borderTop: i === 0 ? 'none' : '1px solid var(--border)', transition: 'background .15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span aria-hidden style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, background: avatarColor(name) }}>{initials(r.firstName, r.lastName) || '?'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 650, fontSize: 14.5, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || 'Unnamed'}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                          {r.auid ? `AUID ${r.auid}` : 'Student'}{r.university ? ` · ${r.university.replace(' University', '')}` : ''}
                        </div>
                      </div>
                      <ArrowUpRight size={16} style={{ color: 'var(--text-subtle)', flex: 'none' }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Companies */}
          {companies.length > 0 && (
            <div>
              <SectionTitle icon={<Building2 size={14} />} label="Companies" count={companies.length} />
              <div style={card}>
                {companies.map((c, i) => (
                  <button
                    key={c.companyUserId}
                    onClick={() => navigate(`/companies/${c.companyUserId}`)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: 'none', borderTop: i === 0 ? 'none' : '1px solid var(--border)', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', transition: 'background .15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {c.logo ? (
                      <img src={c.logo} alt={c.company} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flex: 'none', border: '1px solid var(--border)' }} />
                    ) : (
                      <span aria-hidden style={{ width: 40, height: 40, borderRadius: 10, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, background: avatarColor(c.company) }}>{companyInitials(c.company)}</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {c.industry && <span>{c.industry}</span>}
                        {c.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.location}</span>}
                      </div>
                    </div>
                    <ArrowUpRight size={16} style={{ color: 'var(--text-subtle)', flex: 'none' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </Reveal>
      )}
    </section>
  );
};

export default SearchPage;
