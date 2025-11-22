import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from './theme-toggle';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Simple auth check using localStorage token
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const handleStorage = () => {
      const newToken = localStorage.getItem('token');
      setIsAuthenticated(!!newToken);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Add subtle shadow when scrolling
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isStudents = location.pathname.startsWith('/students');

  // Helper to close mobile when navigating
  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`bg-background/80 fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur transition-shadow ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo / Title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3" onClick={closeMobile}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600">
                <span className="text-sm font-semibold">AU</span>
              </div>
              <div className="hidden md:block">
                <span className="text-lg leading-none font-semibold">AU Placements</span>
                <div className="text-muted-foreground text-xs">Akal University</div>
              </div>
            </Link>
          </div>

          {/* Right: Links / Actions */}
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              <Link
                to="/"
                onClick={closeMobile}
                className={`text-sm font-medium hover:underline ${
                  isHome ? 'underline underline-offset-4' : ''
                }`}
              >
                Home
              </Link>
              {/* If you have an #about section on landing, this is fine */}
              <a href="#about" className="text-sm font-medium hover:underline">
                About
              </a>
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <ModeToggle />

              {/* View Students - always visible */}
              <Link to="/students" onClick={closeMobile}>
                <Button variant={isStudents ? 'default' : 'outline'}>View Students</Button>
              </Link>

              {/* Auth area: if not logged in -> show Login/Signup, else show Profile */}
              {!isAuthenticated ? (
                <Link to="/login" onClick={closeMobile}>
                  <Button variant="outline">Login / Signup</Button>
                </Link>
              ) : (
                <Link to="/profiles" onClick={closeMobile}>
                  <button className="focus:ring-ring flex items-center gap-2 rounded-full hover:cursor-pointer focus:ring-2 focus:outline-none">
                    <Avatar>
                      <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                      <AvatarFallback>PS</AvatarFallback>
                    </Avatar>
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="mt-3 pb-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={closeMobile}
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
              >
                Home
              </Link>
              <a
                href="#about"
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
                onClick={closeMobile}
              >
                About
              </a>

              {/* View Students + Auth area (mobile) */}
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/students" onClick={closeMobile}>
                  <Button className="w-full">View Students</Button>
                </Link>

                {!isAuthenticated ? (
                  <Link to="/login" onClick={closeMobile}>
                    <Button className="w-full" variant="outline">
                      Login / Signup
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to="/profiles"
                    onClick={closeMobile}
                    className="flex items-center gap-2 rounded px-3 py-2"
                  >
                    <Avatar>
                      <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                      <AvatarFallback>PS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Profile</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
