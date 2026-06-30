import { avatarColor, initials } from './avatar';
import { availLabel } from './dates';

export interface CardVM {
  id: string;
  href: string;
  name: string;
  initials: string;
  avatarBg: string;
  headline: string;
  oppLabel: string;
  field: string;
  metaText: string;
  availLabel: string;
  hasAvail: boolean;
  skills: string[];
  extra: number;
  hasExtra: boolean;
}

/** Maps a backend student profile (with nested `user`) to the prototype card VM. */
export function studentToCardVM(s: any): CardVM {
  const first = s?.user?.firstName ?? '';
  const last = s?.user?.lastName ?? '';
  const name = `${first} ${last}`.trim();
  const skills: string[] = Array.isArray(s?.skills)
    ? s.skills.map((x: any) => x?.displayName || x?.name || '').filter(Boolean)
    : [];
  const lf = s?.looking_for || {};
  const course = s?.education?.[0]?.course?.name || '';
  const meta = [course, s?.user?.university, s?.location, `${s?.total_experience || 0} mo exp`]
    .filter(Boolean)
    .join('  ·  ');
  const av = availLabel({ from_date: lf.from_date, to_date: lf.to_date });
  return {
    id: s?.user?._id,
    href: `/profiles/${s?.user?._id}`,
    name,
    initials: initials(first, last) || '?',
    avatarBg: avatarColor(name),
    headline: s?.headline || '',
    oppLabel: lf.type === 'job' ? 'Open to work' : 'Open to internship',
    field: s?.preferred_field || '',
    metaText: meta,
    availLabel: av,
    hasAvail: !!av,
    skills: skills.slice(0, 4),
    extra: Math.max(0, skills.length - 4),
    hasExtra: skills.length > 4,
  };
}
