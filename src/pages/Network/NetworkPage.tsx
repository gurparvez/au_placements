import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageCircle, Users2, UserCheck, UserPlus, Building2, MapPin, ArrowUpRight } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import connectionsApi, { type ConnectionEntry, type PendingLists } from '@/api/connections';
import companiesApi, { type Company } from '@/api/companies';
import messagesApi from '@/api/messages';
import { avatarColor, initials } from '@/utils/avatar';

const fullName = (u?: { firstName?: string; lastName?: string }) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : 'User');
const companyInitials = (c: string) => c.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' };
const btnGhost: React.CSSProperties = { padding: '7px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { padding: '7px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' };

type Tab = 'connections' | 'requests' | 'following';

const Avatar: React.FC<{ u?: { firstName?: string; lastName?: string } }> = ({ u }) => (
  <span aria-hidden style={{ width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, color: '#fff', background: avatarColor(fullName(u)) }}>
    {initials(u?.firstName, u?.lastName) || 'U'}
  </span>
);

const PersonRow: React.FC<{ entry: ConnectionEntry; right: React.ReactNode }> = ({ entry, right }) => (
  !entry.user ? null :
  <div
    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: '1px solid var(--border)', transition: 'background .15s' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <Link to={`/profiles/${entry.user._id}`} style={{ textDecoration: 'none' }} title={`View ${fullName(entry.user)}'s profile`}><Avatar u={entry.user} /></Link>
    <div style={{ flex: 1, minWidth: 0 }}>
      <Link
        to={`/profiles/${entry.user._id}`}
        title={`View ${fullName(entry.user)}'s profile`}
        style={{ fontWeight: 650, textTransform: 'capitalize', color: 'var(--text)', textDecoration: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >{fullName(entry.user)}</Link>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{entry.user.roles?.includes('recruiter') ? 'Recruiter' : 'Student'}</div>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{right}</div>
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '44px 20px', color: 'var(--text-muted)', fontSize: 13.5, textAlign: 'center' }}>
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

  if (!initialized) return <section style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!user) return <section style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Redirecting…</section>;

  const incoming = pending.incoming.length;
  const requestsTotal = pending.incoming.length + pending.outgoing.length;

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count: number; badge?: number }[] = [
    { key: 'connections', label: 'Connections', icon: <UserCheck size={16} />, count: conns.length },
    { key: 'requests', label: 'Requests', icon: <UserPlus size={16} />, count: requestsTotal, badge: incoming },
    { key: 'following', label: 'Following', icon: <Building2 size={16} />, count: following.length },
  ];

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <span aria-hidden style={{ width: 44, height: 44, borderRadius: 12, flex: 'none', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users2 size={22} />
        </span>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>My network</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            {conns.length} connection{conns.length === 1 ? '' : 's'} · following {following.length} compan{following.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, margin: '22px 0 20px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
            <span style={{ fontSize: 12.5, color: 'var(--text-subtle)', fontWeight: 600 }}>{t.count}</span>
            {t.badge ? (
              <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: '#fff' }}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Connections */}
      {tab === 'connections' && (
        <div style={card}>
          {conns.length === 0 ? (
            <EmptyState icon={<UserCheck size={26} />}>No connections yet. Visit a profile and tap Connect.</EmptyState>
          ) : (
            conns.map((e) => (
              <PersonRow key={e.connectionId} entry={e} right={<>
                <button onClick={() => message(e.user._id)} style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 6 }}><MessageCircle size={14} /> Message</button>
                <button onClick={() => withdraw(e.user._id)} style={btnGhost}>Remove</button>
              </>} />
            ))
          )}
        </div>
      )}

      {/* Requests */}
      {tab === 'requests' && (
        requestsTotal === 0 ? (
          <div style={card}><EmptyState icon={<UserPlus size={26} />}>No pending requests.</EmptyState></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {pending.incoming.length > 0 && (
              <div style={card}>
                <div style={{ padding: '14px 14px 4px', fontWeight: 700, fontSize: 14 }}>Incoming <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pending.incoming.length})</span></div>
                {pending.incoming.map((e) => (
                  <PersonRow key={e.connectionId} entry={e} right={<>
                    <button onClick={() => respond(e.connectionId, true)} style={btnPrimary}>Accept</button>
                    <button onClick={() => respond(e.connectionId, false)} style={btnGhost}>Ignore</button>
                  </>} />
                ))}
              </div>
            )}
            {pending.outgoing.length > 0 && (
              <div style={card}>
                <div style={{ padding: '14px 14px 4px', fontWeight: 700, fontSize: 14 }}>Sent <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pending.outgoing.length})</span></div>
                {pending.outgoing.map((e) => (
                  <PersonRow key={e.connectionId} entry={e} right={<button onClick={() => withdraw(e.user._id)} style={btnGhost}>Withdraw</button>} />
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Following */}
      {tab === 'following' && (
        <div style={card}>
          {following.length === 0 ? (
            <EmptyState icon={<Building2 size={26} />}>
              You're not following any companies yet.<br />
              <Link to="/companies" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Browse companies →</Link>
            </EmptyState>
          ) : (
            following.map((c) => (
              <div key={c.companyUserId}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: '1px solid var(--border)', transition: 'background .15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {c.logo ? (
                  <img src={c.logo} alt={c.company} style={{ width: 44, height: 44, borderRadius: 11, objectFit: 'cover', flex: 'none', border: '1px solid var(--border)' }} />
                ) : (
                  <span aria-hidden style={{ width: 44, height: 44, borderRadius: 11, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', background: avatarColor(c.company) }}>{companyInitials(c.company)}</span>
                )}
                <Link to={`/companies/${c.companyUserId}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 650 }}>{c.company}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {c.industry && <span>{c.industry}</span>}
                    {c.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.location}</span>}
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate(`/companies/${c.companyUserId}`)} style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', gap: 5 }}>View <ArrowUpRight size={13} /></button>
                  <button onClick={() => unfollow(c.companyUserId)} style={btnGhost}>Unfollow</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default NetworkPage;
