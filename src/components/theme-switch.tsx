import { Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const OPTS = [
  { val: 'light', label: 'Light', Icon: Sun },
  { val: 'dark', label: 'Dark', Icon: Moon },
  { val: 'system', label: 'System', Icon: MonitorSmartphone },
] as const;

export function ThemeSwitch({ size = 28 }: { size?: number }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-pill)',
      }}
    >
      {OPTS.map(({ val, label, Icon }) => {
        const active = theme === val;
        return (
          <button
            key={val}
            type="button"
            aria-label={`${label} theme`}
            aria-pressed={active}
            title={label}
            onClick={() => setTheme(val)}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: active ? 'var(--primary)' : 'var(--text-subtle)',
              background: active ? 'var(--primary-soft)' : 'transparent',
            }}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSwitch;
