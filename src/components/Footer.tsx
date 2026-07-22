
const PADX = 'clamp(20px,3vw,48px)'; // matches the navbar gutter

const linkStyle: React.CSSProperties = {
  fontSize: 14.5, fontWeight: 650, color: 'var(--text-muted)', textDecoration: 'none',
  transition: 'color .15s ease', lineHeight: 1.4, width: 'fit-content',
};
const Sep = () => (
  <span aria-hidden style={{ width: 1, height: 16, background: 'var(--border-strong)' }} />
);
const hover = (on: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) =>
  (e.currentTarget.style.color = on ? 'var(--text)' : 'var(--text-muted)');

const Group: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px 22px', flexWrap: 'wrap' }}>
    <span className="ledger-label">{label}</span>
    {children}
  </div>
);

const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
      {/* main band — brand inline against the institutions row, one compact strip */}
      <div style={{
        width: '100%', padding: `16px ${PADX}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px 40px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <img data-kp-logo="light" src="/logo_light.png" alt="" aria-hidden width={28} height={28} style={{ objectFit: 'contain', borderRadius: 8 }} />
          <img data-kp-logo="dark" src="/logo2.png" alt="" aria-hidden width={28} height={28} style={{ objectFit: 'contain', borderRadius: 8 }} />
          <span className="font-display" style={{ fontSize: 17.5, fontWeight: 550, letterSpacing: '-.015em', whiteSpace: 'nowrap' }}>
            Kalgidhar Placements
          </span>
          <span data-kp-show="desktop" style={{ fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            · The official placement register of Akal &amp; Eternal University
          </span>
        </div>

        <Group label="Institutions">
          <a href="https://www.auts.ac.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Akal University ↗</a>
          <Sep />
          <a href="https://eternaluniversity.edu.in" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>Eternal University ↗</a>
          <Sep />
          <a href="https://www.barusahib.org" target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>The Kalgidhar Trust ↗</a>
        </Group>
      </div>

      {/* baseline bar */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: `9px ${PADX}`,
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
