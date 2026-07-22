import { Outlet, useLocation } from 'react-router';
import { MotionConfig, motion } from 'motion/react';
import { Toaster } from 'sonner';
import { Navbar } from './components';
import Footer from './components/Footer';
import { ThemeProvider } from './components/theme-provider';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect, useLayoutEffect } from 'react';
import { fetchCurrentUser } from './context/auth/authSlice';
import { useAppDispatch } from './context';

function App() {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  // Transition between top-level sections only — drill-ins (e.g. a company
  // profile, a message thread) swap content in place without re-animating.
  const section = pathname.split('/')[1] || 'home';

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

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
        <Toaster position="top-center" />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
