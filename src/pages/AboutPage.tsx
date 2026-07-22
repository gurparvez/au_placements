import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const EASE = [0.16, 1, 0.3, 1] as const;
const GUTTER = 'clamp(20px,10vw,112px)';

const TRUST_STATS = [
  { num: '130+', label: 'Akal Academies' },
  { num: '75,000', label: 'Students' },
  { num: '5', label: 'States' },
  { num: '68+', label: 'Years' },
  { num: '2', label: 'Universities' },
  { num: '1986', label: 'First academy' },
];
const FOUNDERS = [
  {
    name: 'Sant Attar Singh Ji',
    years: '1866 – 1927',
    note: 'The revered saint of Mastuana Sahib who taught that spiritual and scientific education must go hand in hand. A century ago he envisioned a centre of learning in the Himalayan foothills where character would be built alongside knowledge — the seed from which Baru Sahib grew. He sent his disciple Sant Teja Singh abroad to master modern education and bring it home.',
    img: '/Sant_Attar_Singh_Ji.jpg',
  },
  {
    name: 'Sant Teja Singh Ji',
    years: 'Harvard A.M., 1911',
    note: 'A scholar who studied at Cambridge and Harvard and carried the mission across three continents. In 1956, at the age of 79, he laid the foundation of Baru Sahib — the "Valley of Divine Peace" — fulfilling his master\'s vision, and entrusted its future to a young Iqbal Singh before passing in 1965.',
    img: '/sant_baba_taja_singh_ji.jpg',
  },
  {
    name: 'Baba Iqbal Singh Ji',
    years: '1926 – 2022 · Padma Shri',
    note: 'A Director of Agriculture in Himachal Pradesh who gave his retirement — and everything after — to Baru Sahib. He opened the first Akal Academy in 1986 with just five students and lived to see 130 academies, two universities and thousands of rural children educated. India honoured him with the Padma Shri in 2022.',
    img: '/Baba_Iqbal_Singh.jpg',
  },
];
const VALUES = [
  { word: 'Educate', body: 'Modern, rigorous education accessible to every student, regardless of means.' },
  { word: 'Enshrine', body: 'Grounding learning in enduring values, character and service.' },
  { word: 'Empower', body: 'Turning graduates into confident, employable, contributing citizens.' },
];
const UNIVERSITIES = [
  {
    loc: 'Talwandi Sabo, Punjab · Est. 2015',
    name: 'Akal University',
    img: '/akal_university.webp',
    body: 'Founded at "Guru Ki Kashi" — the historic seat of learning where the tenth Guru completed the Sri Guru Granth Sahib — Akal University fulfils a vision Sant Attar Singh Ji voiced over a century ago. A UGC-recognised university, it teaches sciences, engineering, management and humanities alongside a free residential B.A. (Hons.) in Sri Guru Granth Sahib Studies, the first programme of its kind. Its 700+ graduates carry the same pairing the Trust has always stood for: rigorous modern education grounded in character, on a completely drug-free campus with partnerships reaching universities across the world.',
  },
  {
    loc: 'Baru Sahib, Himachal Pradesh · Est. 2006',
    name: 'Eternal University',
    img: '/eternal_university.webp',
    body: 'Born of an ardas on 3 July 2006 in the Valley of Divine Peace, Eternal University is among the first universities for girls in North India — built on the belief that educating a daughter educates a generation. Its seven Akal colleges span engineering, nursing, agriculture, biotechnology and education, carrying NAAC accreditation with ICAR, INC and ISO recognition. Students from 16 countries study on its Himalayan campus, where research and professional degrees are matched with meditation, seva and a values-led way of living.',
  },
];

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow)' };
const hoverBg = (over: string, base: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = over; },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = base; },
});

/* One consistent section opener — mirrors the home page. */
const SectionHead: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <Reveal style={{ marginBottom: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <motion.span
        className="brass-rule"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ transformOrigin: 'left center' }}
      />
      <span className="ledger-label" style={{ color: 'var(--brass)' }}>{eyebrow}</span>
    </div>
    <h2 className="font-display" style={{ fontSize: 'clamp(26px,3.2vw,34px)', letterSpacing: '-.02em', fontWeight: 500, margin: '12px 0 0', lineHeight: 1.12, textWrap: 'balance' }}>
      {title}
    </h2>
  </Reveal>
);

/** Image with a graceful striped placeholder until the file loads. */
const Photo: React.FC<{ src: string; alt: string; ratio?: string; position?: string; style?: React.CSSProperties }> = ({ src, alt, ratio, position, style }) => {
  const [err, setErr] = useState(false);
  return (
    <div
      data-kp-ph="true"
      role="img"
      aria-label={alt}
      style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', ...(ratio ? { aspectRatio: ratio } : {}), ...style }}
    >
      {!err && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: position ?? 'center', display: 'block' }}
        />
      )}
    </div>
  );
};

const AboutPage: React.FC = () => {
  return (
    <>
      {/* ===================== MASTHEAD ===================== */}
      <section style={{ padding: `64px ${GUTTER} 24px` }}>
        <Reveal>
          <div className="brass-rule" style={{ marginBottom: 14 }} />
          <span className="ledger-label" style={{ color: 'var(--brass)' }}>About the register</span>
          <h1 className="font-display" style={{ fontSize: 'clamp(30px,4.5vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', fontWeight: 500, margin: '12px 0 0' }}>
            One Trust. Two universities. A timeless idea.
          </h1>
          <p style={{ textAlign: 'left', fontSize: 'clamp(16px,1.7vw,19px)', color: 'var(--text-muted)', margin: '20px 0 0', lineHeight: 1.65 }}>
            Kalgidhar Placements is run by The Kalgidhar Trust, Baru Sahib — the social and educational movement behind Akal University and Eternal University. This is the story of the institutions whose graduates you meet here.
          </p>
        </Reveal>
      </section>

      {/* ===================== THE TRUST ===================== */}
      <section style={{ padding: `48px ${GUTTER} 0` }}>
        {/* Full-bleed photo banner — the story sits on the campus itself, behind a soft tint */}
        <Reveal>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', minHeight: 'clamp(340px,40vw,460px)', display: 'flex', alignItems: 'center' }}>
            <img
              src="/baru_sahib.jpg"
              alt="Baru Sahib campus in the Himalayan foothills"
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* the tint between photo and text */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(9,11,16,.62) 0%, rgba(9,11,16,.38) 46%, rgba(9,11,16,.08) 100%)' }} />

            <div style={{ position: 'relative', padding: 'clamp(30px,4.5vw,56px)', maxWidth: 640 }}>
              <span className="ledger-label" style={{ color: '#d8b25a' }}>Established 1956</span>
              <h2 className="font-display" style={{ color: '#fff', fontSize: 'clamp(26px,3.4vw,38px)', letterSpacing: '-.02em', fontWeight: 500, margin: '10px 0 0' }}>The Kalgidhar Trust</h2>
              <p style={{ textAlign: 'left', fontSize: 15.5, color: 'rgba(255,255,255,.88)', margin: '16px 0 0', lineHeight: 1.65, maxWidth: '56ch' }}>
                A movement for value-based, modern education rooted in service. The first Akal Academy opened at Baru Sahib in 1986 with just five students — today the Trust runs a network of academies and two universities across north India.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 22, padding: '8px 16px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.3)' }}>
                <span style={{ fontSize: 13.5, fontWeight: 650, color: '#fff', letterSpacing: '.04em' }}>Educate · Enshrine · Empower</span>
              </div>
            </div>

            <span className="ledger-label" style={{ position: 'absolute', right: 22, bottom: 18, color: 'rgba(255,255,255,.75)', fontSize: 10.5 }}>
              Baru Sahib · Himachal Pradesh
            </span>
          </div>
        </Reveal>

        {/* stat lattice */}
        <Stagger stagger={0.05}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 1, marginTop: 44, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
            {TRUST_STATS.map((ts) => (
              <StaggerItem key={ts.label} style={{ background: 'var(--surface)', padding: '22px 18px' }}>
                <div className="font-display data" style={{ fontSize: 'clamp(22px,2.6vw,28px)', fontWeight: 500, letterSpacing: '-.01em' }}>{ts.num}</div>
                <div className="ledger-label" style={{ marginTop: 7, letterSpacing: '.08em' }}>{ts.label}</div>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      </section>

      {/* ===================== FOUNDERS (image-led) ===================== */}
      <section style={{ padding: `72px ${GUTTER} 0` }}>
        <SectionHead eyebrow="The lineage" title="Three lives, one mission." />
        <Stagger stagger={0.09}>
          <div data-kp-browse="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
            {FOUNDERS.map((fo) => (
              <StaggerItem key={fo.name} style={{ minWidth: 0, height: '100%' }}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  style={{ ...card, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Photo src={fo.img} alt={`Portrait of ${fo.name}`} ratio="4/4.4" position="top" style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }} />
                  <div style={{ padding: '18px 20px 20px' }}>
                    <div className="font-display" style={{ fontWeight: 500, fontSize: 19, letterSpacing: '-.01em' }}>{fo.name}</div>
                    <div className="ledger-label" style={{ color: 'var(--brass)', marginTop: 5 }}>{fo.years}</div>
                    <p style={{ textAlign: 'left', fontSize: 13.5, color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.6 }}>{fo.note}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      </section>

      {/* ===================== UNIVERSITIES ===================== */}
      <section style={{ padding: `72px ${GUTTER} 0` }}>
        <SectionHead eyebrow="The universities" title="Two campuses, one standard." />
        <div data-kp-2col="true" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'stretch' }}>
          {UNIVERSITIES.map((u, i) => (
            <Reveal key={u.name} delay={i * 0.08} style={{ height: '100%' }}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                style={{ ...card, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Photo src={u.img} alt={u.name} ratio="16/9" style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }} />
                <div style={{ padding: 28, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span className="ledger-label">{u.loc}</span>
                  <h3 className="font-display" style={{ fontSize: 24, letterSpacing: '-.02em', fontWeight: 500, margin: '10px 0 0' }}>{u.name}</h3>
                  <p style={{ textAlign: 'left', fontSize: 14.5, color: 'var(--text-muted)', margin: '14px 0 0', lineHeight: 1.7 }}>{u.body}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== VALUES (three-column ledger) ===================== */}
      <section style={{ padding: `72px ${GUTTER} 0` }}>
        <Stagger stagger={0.1} className="kp-ledger" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {VALUES.map((vl, i) => (
            <StaggerItem key={vl.word} style={{ paddingLeft: i === 0 ? 0 : 26, paddingRight: 26 }}>
              <div className="font-display" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-.01em', color: 'var(--brass)' }}>{vl.word}</div>
              <p style={{ textAlign: 'left', fontSize: 14.5, color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.6 }}>{vl.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===================== CTA ===================== */}
      <section style={{ padding: `72px ${GUTTER} 72px` }}>
        <Reveal>
          <div style={{ ...card, borderRadius: 20, padding: 'clamp(28px,4vw,44px)' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(22px,3vw,30px)', letterSpacing: '-.02em', fontWeight: 500, margin: 0, maxWidth: '24ch', textWrap: 'balance' }}>Meet the students this story produced.</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
              <Link to="/students" {...hoverBg('var(--primary-hover)', 'var(--primary)')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', transition: 'background .18s ease' }}>Browse the register <span aria-hidden>→</span></Link>
              <Link to="/login" {...hoverBg('var(--surface-2)', 'var(--surface)')} style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 20px', borderRadius: 'var(--r-ctl)', background: 'var(--surface)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', transition: 'background .18s ease' }}>Create your profile</Link>
            </div>
            <p style={{ textAlign: 'left', fontSize: 12.5, color: 'var(--text-subtle)', margin: '24px 0 0', lineHeight: 1.6 }}>
              Sources &amp; further reading: auts.ac.in · eternaluniversity.edu.in · barusahib.org. Figures are indicative and drawn from the Trust's public materials.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default AboutPage;
