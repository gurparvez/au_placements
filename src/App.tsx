import { Outlet } from 'react-router';
import { Navbar } from './components';
import { ThemeProvider } from './components/theme-provider';
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
      <Outlet />
    </ThemeProvider>
  );
}

export default App;
