import React from 'react';
import { Link } from 'react-router-dom';
import type { PostAuthor } from '@/api/posts';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fullName = (u: PostAuthor) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

/**
 * Renders post/comment text with @mentions (linked to a student's profile) and
 * bare URLs turned into links. Mentions are matched by "@Full Name" against the
 * mentions list attached to the post/comment.
 */
export function renderRichText(content: string, mentions: PostAuthor[] = []): React.ReactNode {
  const mentionTokens = mentions
    .map((u) => ({ token: `@${fullName(u)}`, user: u }))
    .filter((x) => x.token.length > 1)
    .sort((a, b) => b.token.length - a.token.length); // longest first

  const alt = mentionTokens.map((x) => escapeRegExp(x.token)).join('|');
  const re = new RegExp(`(${alt ? alt + '|' : ''}https?:\\/\\/[^\\s]+)`, 'g');

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = re.exec(content)) !== null) {
    if (m.index > last) nodes.push(content.slice(last, m.index));
    const match = m[0];

    if (match.startsWith('@')) {
      const found = mentionTokens.find((x) => x.token === match);
      const u = found?.user;
      const isStudent = u?.roles?.includes('student');
      if (u && isStudent) {
        nodes.push(
          <Link key={key++} to={`/profiles/${u._id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            {match}
          </Link>
        );
      } else {
        nodes.push(
          <span key={key++} style={{ color: 'var(--primary)', fontWeight: 600 }}>{match}</span>
        );
      }
    } else {
      nodes.push(
        <a key={key++} href={match} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>
          {match}
        </a>
      );
    }
    last = m.index + match.length;
  }
  if (last < content.length) nodes.push(content.slice(last));
  return nodes;
}
