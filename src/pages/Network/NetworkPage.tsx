import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageCircle, UserCheck, UserPlus, Building2, MapPin, ArrowUpRight } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import connectionsApi, { type ConnectionEntry, type PendingLists } from '@/api/connections';
import companiesApi, { type Company } from '@/api/companies';
import messagesApi from '@/api/messages';
import { avatarColor, initials } from '@/utils/avatar';
import { Reveal } from '@/components/motion';

const fullName = (u?: { firstName?: string; lastName?: string }) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : 'User');
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' };
const netGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 };
const btnGhost: React.CSSProperties = { padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background .18s ease' };
const btnPrimary: React.CSSProperties = { padding: '7px 14px', border: 'none', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background .18s ease' };
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

type Tab = 'connections' | 'requests' | 'following';

const Avatar: React.FC<{ u?: { firstName?: string; lastName?: string } }> = ({ u }) => (
  <span aria-hidden style={{ width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 17, color: '#fff', background: avatarColor(fullName(u)) }}>
    {initials(u?.firstName, u?.lastName) || 'U'}
  </span>
);

const PersonRow: React.FC<{ entry: ConnectionEntry; right: React.ReactNode }> = ({ entry, right }) => {
  if (!entry.user) return null;
  const hue = avatarColor(fullName(entry.user));
  return (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: `color-mix(in srgb, ${hue} 18%, var(--surface))`, border: `1px solid color-mix(in srgb, ${hue} 28%, var(--border))`, boxShadow: 'var(--shadow)', transition: 'border-color .18s ease, box-shadow .18s ease' }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hue} 42%, var(--border))`; e.currentTarget.style.boxShadow = `0 18px 34px -24px color-mix(in srgb, ${hue} 45%, transparent)`; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hue} 28%, var(--border))`; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <Link to={`/profiles/${entry.user._id}`} style={{ textDecoration: 'none' }} title={`View ${fullName(entry.user)}'s profile`}><Avatar u={entry.user} /></Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          to={`/profiles/${entry.user._id}`}
          title={`View ${fullName(entry.user)}'s profile`}
          style={{ display: 'block', fontWeight: 650, textTransform: 'capitalize', color: 'var(--text)', textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >{fullName(entry.user)}</Link>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{entry.user.roles?.includes('recruiter') ? 'Recruiter' : 'Student'}</div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>{right}</div>
  </div>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '44px 20px', color: 'var(--text-muted)', fontSize: 14.5, textAlign: 'center' }}>
    <span style={{ opacity: 0.5 }}>{icon}</span>
    {children}
  </div>
);

const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);

  const [tab, setTab] = useState<Tab>('connections');
  const [conns, setConns] = useState<ConnectionEntry[]>([]);
  const [pending, setPending] = useState<PendingLists>({ incoming: [], outgoing: [] });
  const [following, setFollowing] = useState<Company[]>([]);

  const load = useCallback(async () => {
    try {
      const [c, p, f] = await Promise.all([connectionsApi.list(), connectionsApi.pending(), companiesApi.following()]);
      setConns(c); setPending(p); setFollowing(f);
    } catch { toast.error('Could not load your network.'); }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user) navigate('/login', { replace: true });
    else load();
  }, [initialized, user, navigate, load]);

  const respond = async (id: string, accept: boolean) => {
    try { await connectionsApi.respond(id, accept); toast.success(accept ? 'Connected.' : 'Request ignored.'); load(); }
    catch { toast.error('Could not update request.'); }
  };
  const withdraw = async (userId: string) => {
    try { await connectionsApi.remove(userId); load(); } catch { toast.error('Could not withdraw.'); }
  };
  const message = async (userId: string) => {
    try { const c = await messagesApi.start(userId); navigate(`/messages?c=${c._id}`); }
    catch { toast.error('Could not start the conversation.'); }
  };
  const unfollow = async (companyUserId: string) => {
    try { await companiesApi.unfollow(companyUserId); setFollowing((prev) => prev.filter((c) => c.companyUserId !== companyUserId)); }
    catch { toast.error('Could not unfollow.'); }
  };

  if (!initialized) return <section style={{ padding: '60px clamp(20px,10vw,64px)', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!user) return <section style={{ padding: '60px clamp(20px,10vw,64px)', color: 'var(--text-muted)' }}>Redirecting…</section>;

  const incoming = pending.incoming.length;
  const requestsTotal = pending.incoming.length + pending.outgoing.length;

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count: number; badge?: number }[] = [
    { key: 'connections', label: 'Connections', icon: <UserCheck size={16} />, count: conns.length },
    { key: 'requests', label: 'Requests', icon: <UserPlus size={16} />, count: requestsTotal, badge: incoming },
    { key: 'following', label: 'Following', icon: <Building2 size={16} />, count: following.length },
  ];

  return (
    <section style={{ padding: '6px clamp(20px,10vw,64px) 80px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, margin: '22px 0 20px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 15,
              color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
            <span className="data" style={{ fontSize: 13.5, color: 'var(--text-subtle)', fontWeight: 600 }}>{t.count}</span>
            {t.badge ? (
              <span className="data" style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'var(--on-primary)' }}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Connections */}
      {tab === 'connections' && (
        <Reveal>
        {conns.length === 0 ? (
          <div style={card}><EmptyState icon={<UserCheck size={26} />}>No connections yet. Connect from a profile.</EmptyState></div>
        ) : (
          <div style={netGrid}>
            {conns.map((e) => (
              <PersonRow key={e.connectionId} entry={e} right={<>
                <button onClick={() => message(e.user._id)} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 6 }}><MessageCircle size={14} /> Message</button>
                <button onClick={() => withdraw(e.user._id)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>Remove</button>
              </>} />
            ))}
          </div>
        )}
        </Reveal>
      )}

      {/* Requests */}
      {tab === 'requests' && (
        <Reveal>
        {requestsTotal === 0 ? (
          <div style={card}><EmptyState icon={<UserPlus size={26} />}>No pending requests.</EmptyState></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {pending.incoming.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Incoming <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pending.incoming.length})</span></div>
                <div style={netGrid}>
                  {pending.incoming.map((e) => (
                    <PersonRow key={e.connectionId} entry={e} right={<>
                      <button onClick={() => respond(e.connectionId, true)} {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={btnPrimary}>Accept</button>
                      <button onClick={() => respond(e.connectionId, false)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>Ignore</button>
                    </>} />
                  ))}
                </div>
              </div>
            )}
            {pending.outgoing.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Sent <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pending.outgoing.length})</span></div>
                <div style={netGrid}>
                  {pending.outgoing.map((e) => (
                    <PersonRow key={e.connectionId} entry={e} right={<button onClick={() => withdraw(e.user._id)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>Withdraw</button>} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </Reveal>
      )}

      {/* Following */}
      {tab === 'following' && (
        <Reveal>
        {following.length === 0 ? (
          <div style={card}><EmptyState icon={<Building2 size={26} />}>
            You're not following any companies yet.<br />
            <Link to="/companies" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Browse companies →</Link>
          </EmptyState></div>
        ) : (
          <div style={netGrid}>
            {following.map((c) => {
              const hue = avatarColor(c.company);
              return (
              <div key={c.companyUserId}
                style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: `color-mix(in srgb, ${hue} 18%, var(--surface))`, border: `1px solid color-mix(in srgb, ${hue} 28%, var(--border))`, boxShadow: 'var(--shadow)', transition: 'border-color .18s ease, box-shadow .18s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hue} 42%, var(--border))`; e.currentTarget.style.boxShadow = `0 18px 34px -24px color-mix(in srgb, ${hue} 45%, transparent)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hue} 28%, var(--border))`; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              >
                <Link to={`/companies/${c.companyUserId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
                  {c.logo ? (
                    <img src={c.logo} alt={c.company} style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'cover', flex: 'none', border: '1px solid var(--border)' }} />
                  ) : (
                    <span aria-hidden style={{ width: 44, height: 44, borderRadius: 11, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', background: avatarColor(c.company) }}>{companyInitials(c.company)}</span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {c.industry && <span>{c.industry}</span>}
                      {c.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.location}</span>}
                    </div>
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                  <button onClick={() => navigate(`/companies/${c.companyUserId}`)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', gap: 5 }}>View <ArrowUpRight size={13} /></button>
                  <button onClick={() => unfollow(c.companyUserId)} {...hoverBg('var(--surface-3)', 'var(--surface-2)')} style={btnGhost}>Unfollow</button>
                </div>
              </div>
            )})}
          </div>
        )}
        </Reveal>
      )}
    </section>
  );
};

export default NetworkPage;
