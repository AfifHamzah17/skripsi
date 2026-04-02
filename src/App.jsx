// src/App.jsx
import React, { useEffect, useState } from 'react';
import Router from './routes/router';
import Sidebar from './components/sidebar/Sidebar';
import './style.css';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [routeHash, setRouteHash] = useState(
    window.location.hash.startsWith('#/') ? window.location.hash : '#/home'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Tablet ke bawah default collapsed
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateHash = () => {
      const h = window.location.hash;
      if (h.startsWith('#/')) setRouteHash(h);
    };
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.hash = '#/auth';
  };

  const isAuthPage =
    routeHash.includes('login') ||
    routeHash.includes('register') ||
    routeHash.includes('auth');

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // ==================== AUTH PAGE ====================
  if (isAuthPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Router key={routeHash} user={user} isAuthenticated={isAuthenticated} />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    );
  }

  // ==================== MAIN LAYOUT ====================
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        routeHash={routeHash}
      />

      {/* Content */}
      <div
        className={`flex-1 flex flex-col flex-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 lg:hidden focus:outline-none"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 capitalize hidden sm:block">
              Sistem Peminjaman SMKN 1 Percut Sei Tuan
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.nama || user?.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Main */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50"
        >
          <Router key={routeHash} user={user} isAuthenticated={isAuthenticated} />
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}