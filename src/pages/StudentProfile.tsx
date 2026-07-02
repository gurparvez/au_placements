// src/pages/StudentProfile.tsx — public profile /profiles/:userId
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/context/hooks';
import { fetchAnyStudentProfile } from '@/context/student/studentSlice';
import skillsApi from '@/api/skills';
import outreachApi from '@/api/outreach';
import messagesApi from '@/api/messages';
import connectionsApi, { type ConnStatus } from '@/api/connections';
import { toast } from 'sonner';
import { avatarColor, initials } from '@/utils/avatar';
import { rangeYears, fmtMonth, availLabel, yearOf } from '@/utils/dates';

const CATEGORY: Record<string, string> = { high_school: 'High School', ug: 'Undergraduate', pg: 'Postgraduate', diploma: 'Diploma', phd: 'PhD', other: 'Other' };
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow)' };
const h2: React.CSSProperties = { fontSize: 17, fontWeight: 650, margin: '0 0 16px' };
const skBlock = (st: React.CSSProperties) => <span data-kp-sk="true" style={st} />;

function contactHref(s: any) {
  const subj = encodeURIComponent('Opportunity via AU Placements: Profile Selection');
  const body = encodeURIComponent(
    `Hi ${s.firstName || 'there'},\n\nI came across your profile on Kalgidhar Placements and was impressed by your background in ${s.field || 'your field'}. We have an opportunity that may be a strong fit and would love to connect.\n\nWould you be open to a short call this week?\n\nWarm regards,\n`
  );
  return `mailto:${s.email || ''}?subject=${subj}&body=${body}`;
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px 80px' }}>
    <Link to="/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
      <span aria-hidden>←</span> Back to register
    </Link>
    {children}
  </section>
);

const PublicStudentProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { publicProfile, loading, error } = useAppSelector((s) => s.student);
  const authUser = useAppSelector((s) => s.auth.user);
  const [resolved, setResolved] = useState<any[] | null>(null);
  const [compose, setCompose] = useState<{ open: boolean; subject: string; body: string }>({ open: false, subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [conn, setConn] = useState<{ status: ConnStatus; connectionId?: string }>({ status: 'none' });

  useEffect(() => {
    if (userId) dispatch(fetchAnyStudentProfile({ userId }));
  }, [userId, dispatch]);

  // Connection relationship with the profile owner (when viewing someone else).
  useEffect(() => {
    const targetId = (publicProfile as any)?.user?._id;
    if (authUser && targetId && authUser._id !== targetId) {
      connectionsApi.status(targetId).then(setConn).catch(() => setConn({ status: 'none' }));
    } else {
      setConn({ status: 'none' });
    }
  }, [authUser, publicProfile]);

  useEffect(() => {
    if (!publicProfile) return;
    (async () => {
      const projects = publicProfile?.projects || [];
      const out = await Promise.all(
        projects.map(async (p: any) => {
          if (!p.tech_used || p.tech_used.length === 0) return { ...p, tech_resolved: [] };
          const names = await Promise.all(
            p.tech_used.map(async (id: string) => {
              try { const { skill } = await skillsApi.getSkillById(id); return skill?.displayName || skill?.name || null; }
              catch { return null; }
            })
          );
          return { ...p, tech_resolved: names.filter(Boolean) };
        })
      );
      setResolved(out);
    })();
  }, [publicProfile]);

  if (loading || (!publicProfile && !error)) {
    return (
      <Shell>
        <div style={{ ...card, marginTop: 18, padding: 28 }} aria-live="polite">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {skBlock({ width: 96, height: 96, borderRadius: '50%' })}
            <div style={{ flex: 1 }}>
              {skBlock({ display: 'block', height: 22, width: '40%', marginBottom: 12 })}
              {skBlock({ display: 'block', height: 13, width: '70%', marginBottom: 8 })}
              {skBlock({ display: 'block', height: 13, width: '50%' })}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !publicProfile) {
    return (
      <Shell>
        <div style={{ marginTop: 40, textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-card)' }}>
          <div aria-hidden style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto', color: 'var(--text-subtle)' }}>?</div>
          <h2 style={{ fontSize: 21, fontWeight: 700, margin: '18px 0 0' }}>Profile not found</h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-muted)', margin: '8px 0 0' }}>This student may have removed their profile, or the link is incorrect.</p>
          <Link to="/students" style={{ display: 'inline-flex', marginTop: 18, padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Back to register</Link>
        </div>
      </Shell>
    );
  }

  const p: any = publicProfile;
  const u = p.user || {};
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  const lf = p.looking_for || {};
  const av = availLabel({ from_date: lf.from_date, to_date: lf.to_date });
  const cs = { firstName: u.firstName, email: u.email, field: p.preferred_field };

  // Inbuilt emailing is available only to logged-in, approved recruiters.
  const isRecruiter = !!authUser?.roles?.includes('recruiter') && authUser?.status === 'active';
  const studentId = u._id || userId || '';
  const canMessage = !!authUser && authUser._id !== studentId;

  const startMessage = async () => {
    try {
      const convo = await messagesApi.start(studentId);
      navigate(`/messages?c=${convo._id}`);
    } catch {
      toast.error('Could not start the conversation.');
    }
  };

  const doConnect = async () => {
    try { await connectionsApi.request(studentId); setConn({ status: 'outgoing' }); toast.success('Connection request sent.'); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Could not send request.'); }
  };
  const doAccept = async () => {
    if (!conn.connectionId) return;
    try { await connectionsApi.respond(conn.connectionId, true); setConn({ status: 'connected' }); toast.success('Connected.'); }
    catch { toast.error('Could not accept.'); }
  };
  const doRemoveConn = async () => {
    try { await connectionsApi.remove(studentId); setConn({ status: 'none' }); }
    catch { toast.error('Could not update connection.'); }
  };

  const connectButton = () => {
    if (!authUser || authUser._id === studentId) return null;
    const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 'var(--r-ctl)', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)' };
    if (conn.status === 'none') return <button onClick={doConnect} style={{ ...base, background: 'var(--primary)', color: '#fff', border: 'none' }}>+ Connect</button>;
    if (conn.status === 'outgoing') return <button onClick={doRemoveConn} style={base} title="Withdraw request">Requested</button>;
    if (conn.status === 'incoming') return <button onClick={doAccept} style={{ ...base, background: 'var(--primary)', color: '#fff', border: 'none' }}>Accept request</button>;
    if (conn.status === 'connected') return <button onClick={doRemoveConn} style={base} title="Remove connection">✓ Connected</button>;
    return null;
  };

  const openCompose = () =>
    setCompose({
      open: true,
      subject: 'Opportunity via Kalgidhar Placements',
      body:
        `Hi ${u.firstName || 'there'},\n\nI came across your profile on Kalgidhar Placements and was impressed by your background in ${p.preferred_field || 'your field'}. We have an opportunity that may be a strong fit and would love to connect.\n\nWould you be open to a short call this week?\n\nWarm regards,\n${authUser?.firstName ?? ''}`,
    });

  const sendCompose = async () => {
    if (!compose.subject.trim() || !compose.body.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    setSending(true);
    try {
      await outreachApi.emailStudent({ studentId, subject: compose.subject, body: compose.body });
      toast.success(`Email sent to ${u.firstName || 'the student'}.`);
      setCompose((c) => ({ ...c, open: false }));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not send the email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ ...card, padding: 24 }}>
      <h2 style={h2}>{title}</h2>
      {children}
    </div>
  );

  return (
    <Shell>
      {/* Masthead */}
      <div style={{ ...card, marginTop: 18, padding: 'clamp(22px,3vw,30px)' }}>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {p.profile_image ? (
            <img src={p.profile_image} alt={name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', flex: 'none' }} />
          ) : (
            <span aria-hidden style={{ width: 96, height: 96, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 34, color: '#fff', background: avatarColor(name) }}>{initials(u.firstName, u.lastName) || 'U'}</span>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: '-.02em', fontWeight: 700, margin: 0 }}>{name}</h1>
              {u.verified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'var(--success-soft)', color: 'var(--success)' }}><span aria-hidden>✓</span> Verified</span>}
            </div>
            {p.headline && <p style={{ fontSize: 16, color: 'var(--text)', margin: '8px 0 0' }}>{p.headline}</p>}
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
              {[u.university, p.location, `${p.total_experience || 0} months experience`].filter(Boolean).join(' · ')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 550, padding: '5px 12px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                {lf.type === 'job' ? 'Open to work' : 'Open to internship'}
              </span>
              {av && <span style={{ fontSize: 12.5, fontWeight: 500, padding: '5px 12px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Available {av}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 170 }}>
            {isRecruiter ? (
              <button onClick={openCompose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' }}>Contact</button>
            ) : (
              <a href={contactHref(cs)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Contact</a>
            )}
            {connectButton()}
            {canMessage && (
              <button onClick={startMessage} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--surface)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Message</button>
            )}
            {p.resume_link && <a href={p.resume_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--surface)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Résumé <span aria-hidden>↗</span></a>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div data-kp-split="true" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 18, marginTop: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          {p.about?.trim() && (
            <Section title="About">
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{p.about}</p>
            </Section>
          )}

          {(p.experience || []).length > 0 && (
            <Section title="Experience">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {p.experience.map((ex: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', marginTop: 5 }} />
                      <span style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }} />
                    </div>
                    <div style={{ paddingBottom: 2 }}>
                      <div style={{ fontWeight: 650, fontSize: 15 }}>{ex.role}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{ex.company} · {rangeYears(ex.start_date, ex.end_date, !ex.end_date)}</div>
                      {ex.description && <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.6 }}>{ex.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resolved && resolved.length > 0 && (
            <Section title="Projects">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {resolved.map((pr: any, i: number) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 650, fontSize: 15 }}>{pr.title}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>{pr.on_going ? `${yearOf(pr.start_date)} – Ongoing` : rangeYears(pr.start_date, pr.end_date, false)}</span>
                    </div>
                    {pr.description && <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.6 }}>{pr.description}</p>}
                    {pr.tech_resolved?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                        {pr.tech_resolved.map((t: string, j: number) => <span key={j} style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 'var(--r-chip)', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>)}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
                      {pr.code_url && <a href={pr.code_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Code ↗</a>}
                      {pr.live_url && <a href={pr.live_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Live ↗</a>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(p.education || []).length > 0 && (
            <Section title="Education">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {p.education.map((ed: any, i: number) => {
                  const isSchool = ed.level === 'school';
                  const years = isSchool
                    ? ed.passing_year
                      ? String(ed.passing_year)
                      : ''
                    : rangeYears(ed.from_date, ed.to_date, false);
                  return (
                    <div key={i}>
                      <div style={{ fontWeight: 650, fontSize: 15 }}>
                        {isSchool ? ed.institute : ed.course?.name || ed.institute}
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                        {isSchool
                          ? [ed.grade && `Class ${ed.grade}`, ed.board].filter(Boolean).join(' · ') || 'School'
                          : ed.institute}
                        {years ? ` · ${years}` : ''}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {isSchool ? (
                          ed.grade && <span style={{ fontSize: 11.5, fontWeight: 550, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>School</span>
                        ) : (
                          <span style={{ fontSize: 11.5, fontWeight: 550, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{CATEGORY[ed.course?.category] || 'Course'}</span>
                        )}
                        {!isSchool && ed.specialization && <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{ed.specialization}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {(p.certificates || []).length > 0 && (
            <Section title="Licenses & certifications">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {p.certificates.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{c.issued_by} · {fmtMonth(c.issue_date)}</div>
                      {c.valid_until && <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', marginTop: 2 }}>Valid until {fmtMonth(c.valid_until)}</div>}
                    </div>
                    {c.certificate_url && <a href={c.certificate_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', flex: 'none' }}>View ↗</a>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(p.skills || []).length > 0 && (
            <Section title="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {p.skills.map((s: any, i: number) => <span key={i} style={{ fontSize: 12.5, padding: '5px 11px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>{s.displayName || s.name}</span>)}
              </div>
            </Section>
          )}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 84 }}>
          <div style={{ ...card, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 650, margin: '0 0 14px' }}>Contact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href={contactHref(cs)} style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', fontSize: 13.5 }}>
                <span aria-hidden style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14, flex: 'none' }}>✉</span>
                <span style={{ wordBreak: 'break-all' }}>{u.email}</span>
              </a>
              {u.phone && (
                <a href={`tel:${u.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', fontSize: 13.5 }}>
                  <span aria-hidden style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14, flex: 'none' }}>☎</span>
                  <span>{u.phone}</span>
                </a>
              )}
              {p.linkedin_url && (
                <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', fontSize: 13.5 }}>
                  <span aria-hidden style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: 13, flex: 'none' }}>in</span>
                  <span>LinkedIn</span>
                </a>
              )}
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--text)', fontSize: 13.5 }}>
                  <span aria-hidden style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14, flex: 'none' }}>⎇</span>
                  <span>GitHub</span>
                </a>
              )}
            </div>
            {isRecruiter ? (
              <button onClick={openCompose} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16, padding: 11, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' }}>Email {name}</button>
            ) : (
              <a href={contactHref(cs)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16, padding: 11, borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Email {name}</a>
            )}
          </div>
        </aside>
      </div>

      {compose.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => !sending && setCompose((c) => ({ ...c, open: false }))} style={{ position: 'absolute', inset: 0, background: 'rgba(6,8,12,.55)' }} />
          <div style={{ ...card, position: 'relative', width: 'min(560px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Email {name}</h2>
            <p style={{ margin: '6px 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              Sent through Kalgidhar Placements. {name} can reply directly to your email.
            </p>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' }}>Subject</label>
            <input
              value={compose.subject}
              onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 14 }}
            />
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-muted)' }}>Message</label>
            <textarea
              value={compose.body}
              onChange={(e) => setCompose((c) => ({ ...c, body: e.target.value }))}
              rows={8}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button onClick={() => setCompose((c) => ({ ...c, open: false }))} disabled={sending} style={{ padding: '10px 16px', borderRadius: 'var(--r-ctl)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 550, fontSize: 14, cursor: 'pointer', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={sendCompose} disabled={sending} style={{ padding: '10px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', opacity: sending ? 0.7 : 1 }}>{sending ? 'Sending…' : 'Send email'}</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
};

export default PublicStudentProfile;
