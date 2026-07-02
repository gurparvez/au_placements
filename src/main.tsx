import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import LandingPage from './pages/LandingPage.tsx';
import StudentPage from './pages/StudentPage.tsx';
import StudentProfile from './pages/StudentProfile.tsx';
import LoginPage from './pages/LoginPage.tsx';
import { Provider } from 'react-redux';
import { store } from './context/store.ts';
import StudentProfilePage from './pages/StudentPage/StudentProfilePage.tsx';
import CreateProfile from './pages/CreateProfile/CreateProfile.tsx';
import AboutPage from './pages/AboutPage.tsx';
import AdminPage from './pages/Admin/AdminPage.tsx';
import RecruiterApply from './pages/RecruiterApply/RecruiterApply.tsx';
import OpeningsPage from './pages/Openings/OpeningsPage.tsx';
import RecruiterOpenings from './pages/RecruiterOpenings/RecruiterOpenings.tsx';
import FeedPage from './pages/Feed/FeedPage.tsx';
import MessagesPage from './pages/Messages/MessagesPage.tsx';
import NetworkPage from './pages/Network/NetworkPage.tsx';
import CompaniesPage from './pages/Companies/CompaniesPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="students" element={<StudentPage />} />
            <Route path="profiles" element={<StudentProfilePage />} />
            <Route path="profiles/:userId" element={<StudentProfile />} />
            <Route path="profiles/create" element={<CreateProfile />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="openings" element={<OpeningsPage />} />
            <Route path="recruiter/apply" element={<RecruiterApply />} />
            <Route path="recruiter/openings" element={<RecruiterOpenings />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
