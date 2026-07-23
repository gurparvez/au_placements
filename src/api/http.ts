import axios, { type AxiosInstance } from 'axios';
import { URL } from '../constants';

/** Fired once when an authenticated call comes back 401 — the session expired
 *  (or was revoked). App.tsx listens and walks the user to sign-in. */
export const AUTH_EXPIRED_EVENT = 'kp:auth-expired';

let notifiedAt = 0;

/** Shared axios factory: same base config everywhere, plus a response
 *  interceptor that turns silent 401 failures into one session-expired signal.
 *  Calls under /api/auth/ are exempt — login errors and the logged-out boot
 *  check (/api/auth/user) are expected 401s, not expiries. */
export function createHttp(timeout = 15000): AxiosInstance {
  const instance = axios.create({ baseURL: URL, withCredentials: true, timeout });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const url: string = err?.config?.url ?? '';
      if (status === 401 && !url.includes('/api/auth/')) {
        const now = Date.now();
        if (now - notifiedAt > 4000) {
          notifiedAt = now;
          window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
        }
      }
      return Promise.reject(err);
    }
  );
  return instance;
}
