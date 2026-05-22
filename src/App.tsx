import { Outlet } from 'react-router';
import { Navbar } from './components';
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
      <Navbar />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
