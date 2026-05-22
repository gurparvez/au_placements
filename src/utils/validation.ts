export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^https?:\/\/.+/i;
export const PHONE_REGEX = /^\d{10,15}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}
