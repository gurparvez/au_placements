import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { Navbar } from './components';
import Footer from './components/Footer';
import { ThemeProvider } from './components/theme-provider';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';
import { fetchCurrentUser } from './context/auth/authSlice';
import { useAppDispatch } from './context';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
