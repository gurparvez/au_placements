import { Link } from 'react-router-dom';

const PADX = 'clamp(20px,3vw,48px)';
const linkStyle: React.CSSProperties = { fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' };
const hover = (on: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) =>
  (e.currentTarget.style.color = on ? 'var(--text)' : 'var(--text-muted)');

const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
      <div
        style={{
          width: '100%', padding: `14px ${PADX}`, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/logo2.png" alt="Kalgidhar Trust" width={22} height={22} style={{ display: 'block', objectFit: 'contain', borderRadius: 6 }} />
          <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>© 2026 Kalgidhar Placements</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Link to="/about" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>About</Link>
          <a href="https://www.auts.ac.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Akal University ↗</a>
          <a href="https://eternaluniversity.edu.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Eternal University ↗</a>
          <a href="https://www.barusahib.org" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Kalgidhar Trust ↗</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
