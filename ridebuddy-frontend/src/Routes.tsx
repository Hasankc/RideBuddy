import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Swipe from './pages/Swipe';
import Events from './pages/Events';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/" /> : element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute element={<Login />} />} />
      <Route path="/register" element={<PublicRoute element={<Register />} />} />
      <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
      <Route path="/swipe" element={<PrivateRoute element={<Swipe />} />} />
      <Route path="/events" element={<PrivateRoute element={<Events />} />} />
    </Routes>
  );
};

export default AppRoutes;