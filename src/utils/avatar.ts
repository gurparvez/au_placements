const PALETTE = ['#2563EB', '#4F6B8F', '#5B6470', '#3F7D8C', '#6366A8', '#7A8290', '#2E7D6B', '#8A5A8F'];

export function avatarColor(name = ''): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export const initials = (f = '', l = '') => ((f[0] ?? '') + (l[0] ?? '')).toUpperCase();
