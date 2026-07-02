import React, { useEffect, useRef, useState } from 'react';
import postsApi, { type MentionUser } from '@/api/posts';

const fullName = (u: MentionUser) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

interface Props {
  value: string;
  onChange: (v: string) => void;
  mentions: MentionUser[];
  onMentionsChange: (m: MentionUser[]) => void;
  placeholder?: string;
  rows?: number;
}

/**
 * A textarea that supports @mentions: type "@" + a name, pick from the dropdown,
 * and the full "@First Last" is inserted while the user is tracked in `mentions`.
 */
const MentionTextarea: React.FC<Props> = ({ value, onChange, mentions, onMentionsChange, placeholder, rows = 3 }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MentionUser[]>([]);

  // debounced search when a query is active
  useEffect(() => {
    if (query === '') { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        setResults(await postsApi.searchMentions(query));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    const caret = e.target.selectionStart ?? val.length;
    const upto = val.slice(0, caret);
    const m = upto.match(/@(\w{0,30})$/);
    if (m) {
      setRange({ start: caret - m[0].length, end: caret });
      setQuery(m[1]);
    } else {
      setRange(null);
      setQuery('');
    }
  };

  const pick = (u: MentionUser) => {
    if (!range) return;
    const token = `@${fullName(u)} `;
    const next = value.slice(0, range.start) + token + value.slice(range.end);
    onChange(next);
    if (!mentions.some((x) => x._id === u._id)) onMentionsChange([...mentions, u]);
    setRange(null);
    setQuery('');
    setResults([]);
    // restore focus + caret after the inserted token
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        const pos = range.start + token.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const open = !!range && (results.length > 0 || query.length > 0);

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        style={{ width: '100%', padding: '11px 13px', borderRadius: 'var(--r-ctl)', border: '1px solid var(--border-strong)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
      />
      {open && (
        <div style={{ position: 'absolute', zIndex: 50, left: 8, right: 8, marginTop: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow)', maxHeight: 220, overflow: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)' }}>No people found.</div>
          ) : (
            results.map((u) => (
              <button key={u._id} type="button" onClick={() => pick(u)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: 'var(--text)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                <span style={{ textTransform: 'capitalize', fontWeight: 550 }}>{fullName(u) || 'User'}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>{u.roles?.includes('recruiter') ? 'Recruiter' : 'Student'}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MentionTextarea;
