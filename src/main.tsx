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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingPage />} />
            <Route path="students" element={<StudentPage />} />
            <Route path="profiles" element={<StudentProfilePage />} />
            <Route path="profiles/:userId" element={<StudentProfile />} />
            <Route path="profiles/create" element={<CreateProfile />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
