import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const PADX = 'clamp(20px,3vw,48px)';
const linkStyle: React.CSSProperties = { fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', width: 'fit-content' };
const hover = (on: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) =>
  (e.currentTarget.style.color = on ? 'var(--text)' : 'var(--text-muted)');
const headStyle: React.CSSProperties = { fontSize: 12, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-subtle)' };
const colStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };

const Footer: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
      <div
        data-kp-2col="true"
        style={{ width: '100%', padding: `52px ${PADX} 32px`, display: 'grid', gridTemplateColumns: 'minmax(240px,1.7fr) 1fr 1fr 1fr', gap: 40 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <img src="/logo2.png" alt="Kalgidhar Trust" width={34} height={34} style={{ display: 'block', objectFit: 'contain', borderRadius: 9 }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Kalgidhar Placements</span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '16px 0 0', maxWidth: '46ch', lineHeight: 1.7, textAlign: 'justify' }}>
            Kalgidhar Placements is the official campus placement register of the Kalgidhar Trust. We help students of Akal
            University and Eternal University build professional profiles and connect with recruiters for internships and
            full-time roles across the country.
          </p>
        </div>

        <nav style={colStyle} aria-label="Explore">
          <span style={headStyle}>Explore</span>
          <Link to="/" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Home</Link>
          <Link to="/students" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Register</Link>
          <Link to="/about" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>About</Link>
        </nav>

        <nav style={colStyle} aria-label="Universities">
          <span style={headStyle}>Universities</span>
          <a href="https://www.auts.ac.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Akal University ↗</a>
          <a href="https://eternaluniversity.edu.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Eternal University ↗</a>
        </nav>

        <nav style={colStyle} aria-label="Trust">
          <span style={headStyle}>Trust</span>
          <a href="https://www.barusahib.org" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>The Kalgidhar Trust ↗</a>
          <a href="https://www.barusahib.org" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Baru Sahib ↗</a>
        </nav>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ width: '100%', padding: `16px ${PADX}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>© 2026 Kalgidhar Placements · A non-commercial campus register.</span>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            title="Toggle theme"
            style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
