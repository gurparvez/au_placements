import { Outlet } from 'react-router';
import { Navbar } from './components';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Navbar />
      <Outlet />
    </ThemeProvider>
  );
}

export default App;
