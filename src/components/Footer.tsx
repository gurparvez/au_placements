import { Link } from 'react-router-dom';

const PADX = 'clamp(20px,3vw,48px)'; // matches the navbar gutter

const linkStyle: React.CSSProperties = {
  fontSize: 15.5, fontWeight: 650, color: 'var(--text-muted)', textDecoration: 'none',
  transition: 'color .18s ease, transform .18s cubic-bezier(.16,1,.3,1)', lineHeight: 1.4, width: 'fit-content',
  display: 'inline-block',
};
const Sep = () => (
  <span aria-hidden style={{ width: 1, height: 16, background: 'var(--border-strong)' }} />
);
/* colourful hover — link inks to the accent and nudges up */
const hover = (on: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.color = on ? 'var(--primary)' : 'var(--text-muted)';
  e.currentTarget.style.transform = on ? 'translateY(-2px)' : 'none';
};

const Group: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px 22px', flexWrap: 'wrap' }}>
    <span className="ledger-label">{label}</span>
    {children}
  </div>
);

const Footer: React.FC = () => {
  return (
    <footer className="kp-onblue" style={{ position: 'relative', background: 'var(--pri)', color: 'var(--text)' }}>
      {/* flowing colour band along the top edge */}
      <span aria-hidden className="kp-grad-rule" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, pointerEvents: 'none' }} />
      {/* main band — brand inline against the institutions row, one compact strip */}
      <div style={{
        width: '100%', padding: `16px ${PADX}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px 40px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <img data-kp-logo="light" src="/logo_light.png" alt="" aria-hidden width={28} height={28} style={{ objectFit: 'contain', borderRadius: 8 }} />
          <img data-kp-logo="dark" src="/logo2.png" alt="" aria-hidden width={28} height={28} style={{ objectFit: 'contain', borderRadius: 8 }} />
          <span className="font-display" style={{ fontSize: 18.5, fontWeight: 550, letterSpacing: '-.015em', whiteSpace: 'nowrap' }}>
            Kalgidhar Placements
          </span>
          <span data-kp-show="desktop" style={{ fontSize: 13.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            · The official placement register of Akal &amp; Eternal University
          </span>
        </div>

        <Group label="Institutions">
          <a href="https://www.auts.ac.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Akal University ↗</a>
          <Sep />
          <a href="https://eternaluniversity.edu.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Eternal University ↗</a>
          <Sep />
          <a href="https://www.barusahib.org" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>The Kalgidhar Trust ↗</a>
          <Sep />
          <Link to="/about" style={linkStyle} onMouseEnter={hover(true) as any} onMouseLeave={hover(false) as any}>About</Link>
        </Group>
      </div>

      {/* baseline bar */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: `9px ${PADX}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>© 2026 Kalgidhar Placements</span>
        <span className="ledger-label" data-kp-show="desktop" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5 }}>
          <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brass)' }} />
          The Official Placement Register
        </span>
      </div>
    </footer>
  );
};

export default Footer;
