import { Link } from 'react-router-dom';

const PADX = 'clamp(20px,10vw,112px)';

const linkStyle: React.CSSProperties = {
  fontSize: 13.5, color: 'var(--text-muted)', textDecoration: 'none',
  transition: 'color .15s ease', lineHeight: 1.4, width: 'fit-content',
};
const hover = (on: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) =>
  (e.currentTarget.style.color = on ? 'var(--text)' : 'var(--text-muted)');

const Group: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 140 }}>
    <span className="ledger-label" style={{ marginBottom: 2 }}>{label}</span>
    {children}
  </div>
);

const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
      {/* main band — brand block against quiet link columns */}
      <div style={{
        width: '100%', padding: `44px ${PADX} 36px`, display: 'flex',
        justifyContent: 'space-between', gap: '36px 64px', flexWrap: 'wrap',
      }}>
        <div style={{ maxWidth: 320, minWidth: 220 }}>
          <div className="brass-rule" style={{ marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo2.png" alt="" aria-hidden width={30} height={30} style={{ display: 'block', objectFit: 'contain', borderRadius: 8 }} />
            <span className="font-display" style={{ fontSize: 19, fontWeight: 550, letterSpacing: '-.015em' }}>
              Kalgidhar Placements
            </span>
          </div>
          <p style={{ textAlign: 'left', fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.6 }}>
            The official placement register of Akal &amp; Eternal University.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '30px 64px', flexWrap: 'wrap' }}>
          <Group label="Platform">
            <Link to="/students" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Students</Link>
            <Link to="/openings" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Openings</Link>
            <Link to="/companies" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Companies</Link>
            <Link to="/feed" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Feed</Link>
          </Group>
          <Group label="Institutions">
            <a href="https://www.auts.ac.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Akal University ↗</a>
            <a href="https://eternaluniversity.edu.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Eternal University ↗</a>
            <a href="https://www.barusahib.org" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Kalgidhar Trust ↗</a>
            <Link to="/about" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>About</Link>
          </Group>
        </div>
      </div>

      {/* baseline bar */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: `13px ${PADX}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>© 2026 Kalgidhar Placements</span>
        <span className="ledger-label" data-kp-show="desktop" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
          <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brass)' }} />
          The Official Placement Register · Vol. 2026
        </span>
      </div>
    </footer>
  );
};

export default Footer;
