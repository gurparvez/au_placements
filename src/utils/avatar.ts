const PALETTE = ['#4272C4', '#5E63B4', '#8560AC', '#AE5E86', '#B96552', '#B5883E', '#2F8B7D', '#4B9065', '#3C8096', '#6F5CA0'];

export function avatarColor(name = ''): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export const initials = (f = '', l = '') => ((f[0] ?? '') + (l[0] ?? '')).toUpperCase();
