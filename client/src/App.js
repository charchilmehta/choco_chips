import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HospitalRegistration from './pages/HospitalRegistration';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import VideoRoom from './pages/VideoRoom';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-hospital" element={<HospitalRegistration />} />

            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <RoleRoute role="admin">
                    <AdminDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/doctor/*"
              element={
                <PrivateRoute>
                  <RoleRoute role="doctor">
                    <DoctorDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/patient/*"
              element={
                <PrivateRoute>
                  <RoleRoute role="patient">
                    <PatientDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/video/:roomId"
              element={
                <PrivateRoute>
                  <VideoRoom />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
