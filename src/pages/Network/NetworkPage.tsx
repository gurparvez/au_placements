import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import connectionsApi, { type ConnectionEntry, type PendingLists } from '@/api/connections';
import messagesApi from '@/api/messages';
import { avatarColor, initials } from '@/utils/avatar';

const fullName = (u?: { firstName?: string; lastName?: string }) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : 'User');
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 };
const btnGhost: React.CSSProperties = { padding: '7px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { padding: '7px 14px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' };

const Avatar: React.FC<{ u?: { firstName?: string; lastName?: string } }> = ({ u }) => (
  <span aria-hidden style={{ width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, color: '#fff', background: avatarColor(fullName(u)) }}>
    {initials(u?.firstName, u?.lastName) || 'U'}
  </span>
);

const PersonRow: React.FC<{ entry: ConnectionEntry; right: React.ReactNode }> = ({ entry, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
    <Link to={`/profiles/${entry.user._id}`} style={{ textDecoration: 'none' }}><Avatar u={entry.user} /></Link>
    <div style={{ flex: 1, minWidth: 0 }}>
      <Link to={`/profiles/${entry.user._id}`} style={{ fontWeight: 650, textTransform: 'capitalize', color: 'var(--text)', textDecoration: 'none' }}>{fullName(entry.user)}</Link>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{entry.user.roles?.includes('recruiter') ? 'Recruiter' : 'Student'}</div>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{right}</div>
  </div>
);

const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);

  const [conns, setConns] = useState<ConnectionEntry[]>([]);
  const [pending, setPending] = useState<PendingLists>({ incoming: [], outgoing: [] });

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([connectionsApi.list(), connectionsApi.pending()]);
      setConns(c); setPending(p);
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

  if (!initialized) return <section style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!user) return <section style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Redirecting…</section>;

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', margin: '0 0 18px' }}>My network</h1>

      {pending.incoming.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ padding: '14px 14px 4px', fontWeight: 700 }}>Requests <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pending.incoming.length})</span></div>
          {pending.incoming.map((e) => (
            <PersonRow key={e.connectionId} entry={e} right={<>
              <button onClick={() => respond(e.connectionId, true)} style={btnPrimary}>Accept</button>
              <button onClick={() => respond(e.connectionId, false)} style={btnGhost}>Ignore</button>
            </>} />
          ))}
        </div>
      )}

      {pending.outgoing.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ padding: '14px 14px 4px', fontWeight: 700 }}>Sent requests</div>
          {pending.outgoing.map((e) => (
            <PersonRow key={e.connectionId} entry={e} right={<button onClick={() => withdraw(e.user._id)} style={btnGhost}>Withdraw</button>} />
          ))}
        </div>
      )}

      <div style={card}>
        <div style={{ padding: '14px 14px 4px', fontWeight: 700 }}>Connections <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({conns.length})</span></div>
        {conns.length === 0 ? (
          <div style={{ padding: '10px 14px 18px', color: 'var(--text-muted)', fontSize: 13.5 }}>No connections yet. Visit a profile and tap Connect.</div>
        ) : (
          conns.map((e) => (
            <PersonRow key={e.connectionId} entry={e} right={<>
              <button onClick={() => message(e.user._id)} style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 6 }}><MessageCircle size={14} /> Message</button>
              <button onClick={() => withdraw(e.user._id)} style={btnGhost}>Remove</button>
            </>} />
          ))
        )}
      </div>
    </section>
  );
};

export default NetworkPage;
