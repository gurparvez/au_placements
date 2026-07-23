import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './context/store.ts';

// The landing page stays eager — it is the first paint. Everything else
// loads as its own chunk the first time it is visited.
import LandingPage from './pages/LandingPage.tsx';
const StudentPage = lazy(() => import('./pages/StudentPage.tsx'));
const StudentProfile = lazy(() => import('./pages/StudentProfile.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const StudentProfilePage = lazy(() => import('./pages/StudentPage/StudentProfilePage.tsx'));
const CreateProfile = lazy(() => import('./pages/CreateProfile/CreateProfile.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage.tsx'));
const RecruiterApply = lazy(() => import('./pages/RecruiterApply/RecruiterApply.tsx'));
const OpeningsPage = lazy(() => import('./pages/Openings/OpeningsPage.tsx'));
const RecruiterOpenings = lazy(() => import('./pages/RecruiterOpenings/RecruiterOpenings.tsx'));
const FeedPage = lazy(() => import('./pages/Feed/FeedPage.tsx'));
const MessagesPage = lazy(() => import('./pages/Messages/MessagesPage.tsx'));
const NetworkPage = lazy(() => import('./pages/Network/NetworkPage.tsx'));
const CompaniesPage = lazy(() => import('./pages/Companies/CompaniesPage.tsx'));
const CompanyProfilePage = lazy(() => import('./pages/Companies/CompanyProfilePage.tsx'));
const SearchPage = lazy(() => import('./pages/Search/SearchPage.tsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'));

const RouteFallback = () => (
  <section style={{ padding: '60px clamp(20px,10vw,112px)', color: 'var(--text-muted)', fontSize: 14 }} aria-busy="true">
    Loading…
  </section>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingPage />} />
            <Route path="about" element={<Suspense fallback={<RouteFallback />}><AboutPage /></Suspense>} />
            <Route path="students" element={<Suspense fallback={<RouteFallback />}><StudentPage /></Suspense>} />
            <Route path="profiles" element={<Suspense fallback={<RouteFallback />}><StudentProfilePage /></Suspense>} />
            <Route path="profiles/:userId" element={<Suspense fallback={<RouteFallback />}><StudentProfile /></Suspense>} />
            <Route path="profiles/create" element={<Suspense fallback={<RouteFallback />}><CreateProfile /></Suspense>} />
            <Route path="admin" element={<Suspense fallback={<RouteFallback />}><AdminPage /></Suspense>} />
            <Route path="feed" element={<Suspense fallback={<RouteFallback />}><FeedPage /></Suspense>} />
            <Route path="messages" element={<Suspense fallback={<RouteFallback />}><MessagesPage /></Suspense>} />
            <Route path="network" element={<Suspense fallback={<RouteFallback />}><NetworkPage /></Suspense>} />
            <Route path="companies" element={<Suspense fallback={<RouteFallback />}><CompaniesPage /></Suspense>} />
            <Route path="companies/:companyUserId" element={<Suspense fallback={<RouteFallback />}><CompanyProfilePage /></Suspense>} />
            <Route path="search" element={<Suspense fallback={<RouteFallback />}><SearchPage /></Suspense>} />
            <Route path="openings" element={<Suspense fallback={<RouteFallback />}><OpeningsPage /></Suspense>} />
            <Route path="recruiter/apply" element={<Suspense fallback={<RouteFallback />}><RecruiterApply /></Suspense>} />
            <Route path="recruiter/openings" element={<Suspense fallback={<RouteFallback />}><RecruiterOpenings /></Suspense>} />
            <Route path="login" element={<Suspense fallback={<RouteFallback />}><LoginPage /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFoundPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
