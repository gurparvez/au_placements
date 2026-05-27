import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from './theme-toggle';
import { Link, useLocation } from 'react-router-dom';

import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  // 🔥 Redux auth state
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  // Add shadow when scrolling
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isStudents = location.pathname.startsWith('/students');
  const isJobs = location.pathname.startsWith('/jobs');
  const isApplications = location.pathname.startsWith('/applications');
  const isRecruiterRequest = location.pathname.startsWith('/recruiters/request');
  const isAdminRecruiterRequests = location.pathname.startsWith('/admin/recruiter-requests');
  const isStudentUser = user?.roles?.includes('student');
  const canReviewRecruiters = user?.roles?.some((role) => ['admin', 'tpo'].includes(role));
  const profileTarget = isStudentUser ? '/profiles' : '/jobs';

  const closeMobile = () => setMobileOpen(false);

  /* -------------------- Small Spinner Component -------------------- */
  const Spinner = () => (
    <div className="flex h-5 w-5 items-center justify-center">
      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
    </div>
  );

  return (
    <header
      className={`bg-background/80 fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur transition-shadow ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMobile}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-600">
              <img src="/logo2.png" alt="AU Logo" className="h-full w-full object-cover" />
            </div>

            <div className="hidden md:block">
              <span className="text-lg leading-none font-semibold">Kalgidhar Trust Placements</span>
              <div className="text-muted-foreground text-xs">Akal University | Eternal University</div>
            </div>
          </Link>

          {/* Right side */}
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

              <Link
                to="/about"
                onClick={closeMobile}
                className={`text-sm font-medium hover:underline ${
                  isHome ? 'underline underline-offset-4' : ''
                }`}
              >
                About
              </Link>

              <Link
                to="/jobs"
                onClick={closeMobile}
                className={`text-sm font-medium hover:underline ${
                  isJobs ? 'underline underline-offset-4' : ''
                }`}
              >
                Jobs
              </Link>

              {user && isStudentUser && (
                <Link
                  to="/applications"
                  onClick={closeMobile}
                  className={`text-sm font-medium hover:underline ${
                    isApplications ? 'underline underline-offset-4' : ''
                  }`}
                >
                  Applications
                </Link>
              )}

              {!user && (
                <Link
                  to="/recruiters/request"
                  onClick={closeMobile}
                  className={`text-sm font-medium hover:underline ${
                    isRecruiterRequest ? 'underline underline-offset-4' : ''
                  }`}
                >
                  Recruiters
                </Link>
              )}

              {canReviewRecruiters && (
                <Link
                  to="/admin/recruiter-requests"
                  onClick={closeMobile}
                  className={`text-sm font-medium hover:underline ${
                    isAdminRecruiterRequests ? 'underline underline-offset-4' : ''
                  }`}
                >
                  Recruiter Requests
                </Link>
              )}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <ModeToggle />

              {/* View Students */}
              <Link to="/students" onClick={closeMobile}>
                <Button variant={isStudents ? 'default' : 'outline'}>View Students</Button>
              </Link>

              {/* ------------------------------------ */}
              {/* AUTH AREA (Redux version) */}
              {/* ------------------------------------ */}

              {loading ? (
                // 🔵 Loading spinner while fetchCurrentUser() is running
                <Button variant="outline" disabled>
                  <Spinner />
                </Button>
              ) : user ? (
                // 🟢 Logged-in: show profile avatar
                <Link to={profileTarget} onClick={closeMobile}>
                  <button
                    aria-label="User menu"
                    className="focus:ring-ring flex items-center gap-2 rounded-full hover:cursor-pointer focus:ring-2 focus:outline-none"
                  >
                    <Avatar>
                      <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                      <AvatarFallback>{user.firstName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </Link>
              ) : (
                // 🔴 Not logged in
                <Link to="/login" onClick={closeMobile}>
                  <Button variant="outline">Login / Signup</Button>
                </Link>
              )}
            </div>

            {/* Mobile button */}
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

        {/* Mobile Panel */}
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

              <Link
                to="/about"
                onClick={closeMobile}
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
              >
                About
              </Link>

              <Link
                to="/jobs"
                onClick={closeMobile}
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
              >
                Jobs
              </Link>

              {user && isStudentUser && (
                <Link
                  to="/applications"
                  onClick={closeMobile}
                  className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
                >
                  Applications
                </Link>
              )}

              {!user && (
                <Link
                  to="/recruiters/request"
                  onClick={closeMobile}
                  className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
                >
                  Recruiters
                </Link>
              )}

              {canReviewRecruiters && (
                <Link
                  to="/admin/recruiter-requests"
                  onClick={closeMobile}
                  className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-600/40"
                >
                  Recruiter Requests
                </Link>
              )}

              <div className="mt-2 flex flex-col gap-2">
                <Link to="/students" onClick={closeMobile}>
                  <Button className="w-full">View Students</Button>
                </Link>

                {loading ? (
                  <Button className="w-full" variant="outline" disabled>
                    <Spinner />
                  </Button>
                ) : user ? (
                  <Link
                    to={profileTarget}
                    onClick={closeMobile}
                    className="flex items-center gap-2 rounded px-3 py-2"
                  >
                    <Avatar>
                      <AvatarImage src="/avatar-placeholder.png" alt="User avatar" />
                      <AvatarFallback>{user.firstName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Profile</span>
                  </Link>
                ) : (
                  <Link to="/login" onClick={closeMobile}>
                    <Button className="w-full" variant="outline">
                      Login / Signup
                    </Button>
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
