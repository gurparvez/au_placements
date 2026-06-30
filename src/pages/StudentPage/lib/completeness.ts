import type { StudentProfileResponse } from '@/api/students.types';

export interface CompletenessCheck {
  label: string;
  done: boolean;
}

export interface CompletenessResult {
  percent: number;
  done: number;
  total: number;
  checks: CompletenessCheck[];
  missing: string[];
}

/**
 * Computes a LinkedIn-style profile-strength score from the fields the
 * backend already stores. Used to nudge students to complete their profile.
 */
export function getProfileCompleteness(
  profile: StudentProfileResponse | null
): CompletenessResult {
  const checks: CompletenessCheck[] = [
    { label: 'Add a profile photo', done: !!profile?.profile_image },
    { label: 'Write a headline', done: !!profile?.headline?.trim() },
    { label: 'Write an About summary', done: !!profile?.about?.trim() },
    { label: 'Set your location', done: !!profile?.location?.trim() },
    { label: 'Add work experience', done: (profile?.experience?.length ?? 0) > 0 },
    { label: 'Add education', done: (profile?.education?.length ?? 0) > 0 },
    { label: 'Add at least 3 skills', done: (profile?.skills?.length ?? 0) >= 3 },
    { label: 'Add a project', done: (profile?.projects?.length ?? 0) > 0 },
    { label: "Set what you're looking for", done: !!profile?.looking_for?.type },
    { label: 'Upload a résumé', done: !!profile?.resume_link },
    {
      label: 'Add a LinkedIn or GitHub link',
      done: !!(profile?.linkedin_url || profile?.github_url),
    },
  ];

  const done = checks.filter((c) => c.done).length;
  const total = checks.length;
  const percent = Math.round((done / total) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  return { percent, done, total, checks, missing };
}
