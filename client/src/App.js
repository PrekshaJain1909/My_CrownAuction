import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuctionList from './pages/AuctionList';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import Dashboard from './pages/Dashboard';
import NotificationHandler from './components/NotificationHandler';

function AppContent() {
  const { loading, isAuthenticated, isSeller } = useAuth();

  // Protected Route Component - Now inside AuthProvider
  const ProtectedRoute = ({ children, requireSeller = false }) => {
    if (loading) {
      return <div className="spinner"></div>;
    }

    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    if (requireSeller && !isSeller()) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  // Public Route Component - Now inside AuthProvider
  const PublicRoute = ({ children }) => {
    if (loading) {
      return <div className="spinner"></div>;
    }

    if (isAuthenticated()) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <NotificationHandler />

      <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '20px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auctions" element={<AuctionList />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-auction"
            element={
              <ProtectedRoute requireSeller={true}>
                <CreateAuction />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;