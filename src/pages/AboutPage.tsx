import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TRUST_STATS = [
  { num: '130+', label: 'Akal Academies' },
  { num: '75,000', label: 'Students' },
  { num: '5', label: 'States' },
  { num: '68+', label: 'Years' },
  { num: '2', label: 'Universities' },
  { num: '1986', label: 'First academy' },
];
const FOUNDERS = [
  { name: 'Sant Attar Singh Ji', years: '1866 – 1927', note: 'The visionary whose teachings seeded the movement for value-based education.', img: '/Sant_Attar_Singh_Ji.jpg' },
  { name: 'Sant Teja Singh Ji', years: 'Harvard A.M., 1911', note: 'Scholar and educationist who carried the mission across continents.', img: '/sant_baba_taja_singh_ji.jpg' },
  { name: 'Baba Iqbal Singh Ji', years: 'Padma Shri, 2022', note: 'Founder of the first Akal Academy at Baru Sahib in 1986.', img: '/baba_iqbal_singh_ji.jpg' },
];
const IMPACT = [
  { num: '7', label: 'Akal colleges' },
  { num: '68+', label: 'Years of service' },
  { num: '100%', label: 'Drug-free campuses' },
  { num: '16', label: 'Countries represented' },
];
const RECOGNITIONS = [
  { title: 'UGC & NAAC', note: 'Recognised and accredited.' },
  { title: 'ICAR / AICTE / INC', note: 'Programme approvals across disciplines.' },
  { title: 'UNDP SDG Award 2020', note: 'For sustainable development impact.' },
  { title: 'IIM-Ahmedabad case study', note: 'Studied as a model non-profit.' },
  { title: 'Padma Shri 2022', note: 'Awarded to Baba Iqbal Singh Ji.' },
  { title: 'BSE Social Stock Exchange', note: 'Among the first NPOs to list.' },
];
const VALUES = [
  { word: 'Educate', body: 'Modern, rigorous education accessible to every student, regardless of means.' },
  { word: 'Enshrine', body: 'Grounding learning in enduring values, character and service.' },
  { word: 'Empower', body: 'Turning graduates into confident, employable, contributing citizens.' },
];
const UNIVERSITIES = [
  { loc: 'Talwandi Sabo, Punjab · Est. 2015', name: 'Akal University', img: '/akal_university.jpg', body: 'Founded at “Guru Ki Kashi” in fulfilment of a long-held prophecy, Akal University blends modern education with values. It runs a free residential B.A. (Hons.) in Sri Guru Granth Sahib Studies alongside its science, technology and management programmes.', chips: ['700+ graduates', '16+ global partnerships', 'UGC recognised'], link: 'https://www.auts.ac.in', linkLabel: 'auts.ac.in' },
  { loc: 'Baru Sahib, Himachal Pradesh', name: 'Eternal University', img: '/eternal_university.jpg', body: 'Born of an ardas on 3 July 2006, Eternal University is among the first universities for girls in North India. Home to seven Akal colleges, it carries NAAC, ICAR and ISO recognition and welcomes students from 16 countries.', chips: ['7 Akal colleges', 'NAAC · ICAR · ISO', '16 countries'], link: 'https://eternaluniversity.edu.in', linkLabel: 'eternaluniversity.edu.in' },
];

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow)' };
const eyebrow: React.CSSProperties = { fontSize: 12.5, fontWeight: 650, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.06em' };
const subtleEyebrow: React.CSSProperties = { fontSize: 12.5, fontWeight: 650, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.05em' };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 550, padding: '5px 11px', borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--text-muted)' };

/** Image with a graceful striped placeholder until the file exists (drop files in public/about/). */
const Photo: React.FC<{ src: string; alt: string; circle?: boolean; ratio?: string; style?: React.CSSProperties }> = ({ src, alt, circle, ratio, style }) => {
  const [err, setErr] = useState(false);
  return (
    <div
      data-kp-ph="true"
      role="img"
      aria-label={alt}
      style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: circle ? '50%' : 'var(--r-card)', ...(ratio ? { aspectRatio: ratio } : {}), ...(circle ? { width: 56, height: 56 } : {}), ...style }}
    >
      {!err && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </div>
  );
};

const AboutPage: React.FC = () => {
  return (
    <>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 40px' }}>
        <span style={eyebrow}>About</span>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.08, letterSpacing: '-.03em', fontWeight: 700, margin: '14px 0 0' }}>
          One Trust. Two universities.<br />A timeless idea.
        </h1>
        <p style={{ fontSize: 'clamp(16px,1.7vw,19px)', color: 'var(--text-muted)', margin: '20px 0 0', lineHeight: 1.65, maxWidth: '62ch' }}>
          Kalgidhar Placements is run by The Kalgidhar Trust, Baru Sahib — the social and educational movement behind Akal University and Eternal University. This is the story of the institutions whose graduates you meet here.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        <div data-kp-2col="true" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 40, alignItems: 'center' }}>
          <div>
            <span style={subtleEyebrow}>Established 1956</span>
            <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-.02em', fontWeight: 700, margin: '10px 0 0' }}>The Kalgidhar Trust</h2>
            <p style={{ fontSize: 15.5, color: 'var(--text-muted)', margin: '16px 0 0', lineHeight: 1.65 }}>
              A movement for value-based, modern education rooted in service. The first Akal Academy opened at Baru Sahib in 1986 with just five students — today the Trust runs a network of academies and two universities across north India.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '8px 16px', borderRadius: 'var(--r-pill)', background: 'var(--primary-soft)', border: '1px solid var(--primary-soft-border)' }}>
              <span style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--primary)', letterSpacing: '.04em' }}>Educate · Enshrine · Empower</span>
            </div>
          </div>
          <figure style={{ margin: 0 }}>
            <Photo src="/baru_sahib.jpg" alt="Baru Sahib campus in the Himalayan foothills" ratio="4/3" />
            <figcaption style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 8 }}>Baru Sahib, Himachal Pradesh · barusahib.org</figcaption>
          </figure>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 1, marginTop: 40, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
          {TRUST_STATS.map((ts) => (
            <div key={ts.label} style={{ background: 'var(--surface)', padding: '22px 18px' }}>
              <div style={{ fontSize: 'clamp(22px,2.6vw,28px)', fontWeight: 700, letterSpacing: '-.02em' }}>{ts.num}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>{ts.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 14, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-subtle)', margin: '0 0 18px' }}>Founders</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {FOUNDERS.map((fo) => (
              <div key={fo.name} style={{ ...card, padding: 18 }}>
                <Photo src={fo.img} alt={`Portrait of ${fo.name}`} circle />
                <div style={{ fontWeight: 650, fontSize: 16, marginTop: 14, letterSpacing: '-.01em' }}>{fo.name}</div>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 550, marginTop: 2 }}>{fo.years}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.55 }}>{fo.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>
        <figure style={{ margin: 0, background: 'var(--primary)', borderRadius: 20, padding: 'clamp(28px,4vw,48px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(110% 110% at 0% 0%, rgba(255,255,255,.14), transparent 55%)' }} />
          <blockquote style={{ position: 'relative', margin: 0, color: '#fff', fontSize: 'clamp(19px,2.4vw,26px)', lineHeight: 1.45, fontWeight: 600, letterSpacing: '-.01em', maxWidth: '46ch' }}>
            “The work being done at Baru Sahib for education and rural upliftment is truly inspiring and worthy of national admiration.”
          </blockquote>
          <figcaption style={{ position: 'relative', color: 'rgba(255,255,255,.85)', fontSize: 14, marginTop: 20 }}>
            Dr. Manmohan Singh · <span style={{ color: 'rgba(255,255,255,.65)' }}>former Prime Minister of India</span>
          </figcaption>
        </figure>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        <div data-kp-2col="true" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {UNIVERSITIES.map((u) => (
            <div key={u.name} style={{ ...card, overflow: 'hidden' }}>
              <Photo src={u.img} alt={u.name} ratio="16/9" style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }} />
              <div style={{ padding: 28 }}>
                <span style={{ ...subtleEyebrow, fontSize: 12 }}>{u.loc}</span>
                <h2 style={{ fontSize: 24, letterSpacing: '-.02em', fontWeight: 700, margin: '10px 0 0' }}>{u.name}</h2>
                <p style={{ fontSize: 14.5, color: 'var(--text-muted)', margin: '14px 0 0', lineHeight: 1.65 }}>{u.body}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                  {u.chips.map((c) => <span key={c} style={chip}>{c}</span>)}
                </div>
                <a href={u.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 14, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>{u.linkLabel} <span aria-hidden>↗</span></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20 }}>
          {IMPACT.map((im) => (
            <div key={im.label}>
              <div style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, letterSpacing: '-.02em' }}>{im.num}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{im.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontSize: 'clamp(22px,2.8vw,28px)', letterSpacing: '-.02em', fontWeight: 700, margin: 0 }}>Recognition</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginTop: 24 }}>
          {RECOGNITIONS.map((rc) => (
            <div key={rc.title} style={{ ...card, padding: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 7, flex: 'none' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: '-.01em' }}>{rc.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>{rc.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {VALUES.map((vl) => (
            <div key={vl.word} style={{ ...card, padding: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{vl.word}</div>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.6 }}>{vl.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 72px' }}>
        <div style={{ ...card, borderRadius: 20, padding: 'clamp(28px,4vw,44px)' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', letterSpacing: '-.02em', fontWeight: 700, margin: 0, maxWidth: '24ch' }}>Meet the students this story produced.</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
            <Link to="/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}>Browse the register <span aria-hidden>→</span></Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--surface)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, textDecoration: 'none' }}>Create your profile</Link>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-subtle)', margin: '24px 0 0', lineHeight: 1.6 }}>
            Sources &amp; further reading: auts.ac.in · eternaluniversity.edu.in · barusahib.org. Figures are indicative and drawn from the Trust’s public materials.
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
