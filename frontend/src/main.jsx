import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import CoursePage from './pages/CoursePage.jsx';
import CoursesList from './pages/CoursesList.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/courses" replace />} />
          <Route path="auth" element={<LoginRegister />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="courses/:id" element={<CoursePage />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
