import { Outlet, useLocation } from 'react-router';
import { MotionConfig, motion } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { Navbar } from './components';
import Footer from './components/Footer';
import { ThemeProvider } from './components/theme-provider';
import ErrorBoundary from './components/ErrorBoundary';
import { ConfirmHost } from './components/confirm';
import { useEffect, useLayoutEffect } from 'react';
import { fetchCurrentUser, clearAuth } from './context/auth/authSlice';
import { useAppDispatch } from './context';
import { useNavigate } from 'react-router';
import { AUTH_EXPIRED_EVENT } from './api/http';

// Browser-tab titles per section — history and open tabs stay legible.
const SECTION_TITLES: Record<string, string> = {
  home: 'Kalgidhar Trust Placements',
  about: 'About',
  students: 'Students',
  profiles: 'Profile',
  admin: 'Admin',
  feed: 'Feed',
  messages: 'Messages',
  network: 'My network',
  companies: 'Companies',
  search: 'Search',
  openings: 'Openings',
  recruiter: 'Recruiters',
  login: 'Sign in',
};

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Transition between top-level sections only — drill-ins (e.g. a company
  // profile, a message thread) swap content in place without re-animating.
  const section = pathname.split('/')[1] || 'home';

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    const t = SECTION_TITLES[section];
    document.title = t && section !== 'home' ? `${t} · Kalgidhar Placements` : 'Kalgidhar Trust Placements';
  }, [section]);

  // Session expired mid-use (any API 401) → clear state, explain, go to sign-in.
  useEffect(() => {
    const onExpired = () => {
      dispatch(clearAuth());
      toast.error('Your session has expired. Sign in again to continue.', { id: 'kp-auth' });
      navigate('/login');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [dispatch, navigate]);

  // Say it plainly when the connection drops — otherwise every action just "fails".
  useEffect(() => {
    const onOffline = () => toast.error('You are offline. Changes will not save until the connection returns.', { id: 'kp-net', duration: Infinity });
    const onOnline = () => { toast.dismiss('kp-net'); toast.success('Back online.', { duration: 2500 }); };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => { window.removeEventListener('offline', onOffline); window.removeEventListener('online', onOnline); };
  }, []);

  // Land every new page at the top before paint — no leftover mid-scroll jumps.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MotionConfig reducedMotion="user">
        <a
          href="#main"
          className="focus:bg-card focus:shadow-card sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-[9px] focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main id="main" style={{ flex: 1 }}>
            <ErrorBoundary>
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-ctl)', boxShadow: 'var(--shadow)', fontSize: '13.5px', fontWeight: 500,
            },
          }}
        />
        <ConfirmHost />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
