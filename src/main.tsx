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
import VerifyEmailPage from './pages/VerifyEmailPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import JobsPage from './pages/JobsPage.tsx';
import JobPostPage from './pages/JobPostPage.tsx';
import ApplicationsPage from './pages/ApplicationsPage.tsx';
import JobApplicantsPage from './pages/JobApplicantsPage.tsx';
import RecruiterRequestPage from './pages/RecruiterRequestPage.tsx';
import AdminRecruiterRequestsPage from './pages/AdminRecruiterRequestsPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="students" element={<StudentPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/new" element={<JobPostPage />} />
            <Route path="jobs/:jobId/applications" element={<JobApplicantsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="recruiters/request" element={<RecruiterRequestPage />} />
            <Route path="admin/recruiter-requests" element={<AdminRecruiterRequestsPage />} />
            <Route path="profiles" element={<StudentProfilePage />} />
            <Route path="profiles/:userId" element={<StudentProfile />} />
            <Route path="profiles/create" element={<CreateProfile />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
