import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import LandingPage from './pages/LandingPage.tsx';
import StudentPage from './pages/StudentPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<LandingPage />} />
          <Route path="students" element={<StudentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
