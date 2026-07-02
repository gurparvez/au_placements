import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Send, MessagesSquare, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/context/hooks';
import messagesApi, { type Conversation, type Message } from '@/api/messages';
import { avatarColor, initials } from '@/utils/avatar';

const fullName = (u?: { firstName?: string; lastName?: string }) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : 'User');
const isStudent = (u?: { roles?: string[] }) => !!u?.roles?.includes('student');
const msgTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const listTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return msgTime(iso);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const Avatar: React.FC<{ u?: { firstName?: string; lastName?: string }; size?: number }> = ({ u, size = 40 }) => (
  <span aria-hidden style={{ width: size, height: size, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: size / 2.6, color: '#fff', background: avatarColor(fullName(u)) }}>
    {initials(u?.firstName, u?.lastName) || 'U'}
  </span>
);

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);
  const initialized = useAppSelector((s) => s.auth.initialized);

  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(params.get('c'));
  const [thread, setThread] = useState<{ conversation: Conversation; messages: Message[] } | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConvos = useCallback(async () => {
    try { setConvos(await messagesApi.listConversations()); } catch { /* ignore */ }
  }, []);
  const loadThread = useCallback(async (id: string) => {
    try { setThread(await messagesApi.listMessages(id)); } catch { toast.error('Could not load messages.'); }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user) navigate('/login', { replace: true });
    else loadConvos();
  }, [initialized, user, navigate, loadConvos]);

  useEffect(() => {
    if (!activeId) { setThread(null); return; }
    loadThread(activeId);
    const t = setInterval(() => { loadThread(activeId); loadConvos(); }, 7000);
    return () => clearInterval(t);
  }, [activeId, loadThread, loadConvos]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [thread?.messages.length]);

  const openConvo = (id: string) => { setActiveId(id); setParams({ c: id }); };

  const send = async () => {
    if (!activeId || !text.trim()) return;
    setSending(true);
    try {
      const msg = await messagesApi.send(activeId, text.trim());
      setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev));
      setText('');
      loadConvos();
    } catch { toast.error('Could not send message.'); }
    finally { setSending(false); }
  };

  if (!initialized) return <section style={{ maxWidth: 980, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Loading…</section>;
  if (!user) return <section style={{ maxWidth: 980, margin: '0 auto', padding: '60px 24px', color: 'var(--text-muted)' }}>Redirecting…</section>;

  const other = thread?.conversation.other ?? undefined;

  return (
    <section style={{ maxWidth: 980, margin: '0 auto', padding: '24px 16px 40px' }}>
      <div
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          display: 'grid', gridTemplateColumns: '320px 1fr', height: 'min(72vh, 640px)', overflow: 'hidden',
        }}
      >
        {/* ---------------- conversation list ---------------- */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minWidth: 0, ...(activeId ? { } : {}) }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 17 }}>Messages</div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {convos.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13.5 }}>No conversations yet. Start one from a profile.</div>
            ) : (
              convos.map((c) => {
                const active = activeId === c._id;
                return (
                  <button
                    key={c._id}
                    onClick={() => openConvo(c._id)}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'center', width: '100%', textAlign: 'left', padding: '12px 16px',
                      border: 'none', borderLeft: `3px solid ${active ? 'var(--primary)' : 'transparent'}`, cursor: 'pointer',
                      background: active ? 'var(--surface-2)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-2)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar u={c.other ?? undefined} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontWeight: c.unread > 0 ? 700 : 600, fontSize: 14, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName(c.other ?? undefined)}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', flex: 'none' }}>{listTime(c.last_message?.sent_at || c.last_activity)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginTop: 2 }}>
                        <span style={{ fontSize: 12.5, color: c.unread > 0 ? 'var(--text)' : 'var(--text-muted)', fontWeight: c.unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_message?.text || 'No messages yet'}</span>
                        {c.unread > 0 && <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{c.unread}</span>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ---------------- thread ---------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!thread ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessagesSquare size={40} style={{ opacity: 0.5 }} />
              <div style={{ marginTop: 10, fontSize: 14 }}>Select a conversation to start chatting</div>
            </div>
          ) : (
            <>
              {/* thread header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => { setActiveId(null); setParams({}); }} aria-label="Back" style={{ display: 'none', width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }}><ArrowLeft size={16} /></button>
                {other && isStudent(other) ? (
                  <Link to={`/profiles/${other._id}`} style={{ textDecoration: 'none' }}><Avatar u={other} size={38} /></Link>
                ) : (
                  <Avatar u={other} size={38} />
                )}
                <div style={{ minWidth: 0 }}>
                  {other && isStudent(other) ? (
                    <Link to={`/profiles/${other._id}`} style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--text)', textDecoration: 'none' }}>{fullName(other)}</Link>
                  ) : (
                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{fullName(other)}</span>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{other?.roles?.includes('recruiter') ? 'Recruiter' : 'Student'}</div>
                </div>
              </div>

              {/* messages */}
              <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg)' }}>
                {thread.messages.length === 0 && <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: 13.5 }}>Say hello 👋</div>}
                {thread.messages.map((m, i) => {
                  const mine = m.sender._id === user._id;
                  const prev = thread.messages[i - 1];
                  const grouped = prev && prev.sender._id === m.sender._id;
                  return (
                    <div key={m._id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row', marginTop: grouped ? -4 : 0 }}>
                      {!mine && (grouped ? <span style={{ width: 28, flex: 'none' }} /> : <Avatar u={m.sender} size={28} />)}
                      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ padding: '9px 13px', borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: mine ? 'var(--primary)' : 'var(--surface)', color: mine ? '#fff' : 'var(--text)', border: mine ? 'none' : '1px solid var(--border)' }}>{m.content}</div>
                        <span style={{ fontSize: 10.5, color: 'var(--text-subtle)', margin: '3px 4px 0' }}>{msgTime(m.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* composer */}
              <div style={{ display: 'flex', gap: 10, padding: 14, borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Write a message…"
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none' }}
                />
                <button onClick={send} disabled={sending || !text.trim()} aria-label="Send" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', opacity: sending || !text.trim() ? 0.5 : 1 }}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MessagesPage;
