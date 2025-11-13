// src/App.jsx
import React, { useEffect, useState } from "react";
import Router from "./routes/router";
import Navbar from "./components/navbar/navbar";
import "../src/style.css";
import { AuthProvider, useAuth } from "./Context/AuthContext";

function AppContent() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [routeHash, setRouteHash] = useState(
    window.location.hash.startsWith("#/") ? window.location.hash : "#/home"
  );

  useEffect(() => {
    const updateHash = () => {
      const currentHash = window.location.hash;
      if (currentHash.startsWith("#/")) {
        setRouteHash(currentHash);
      }
    };
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.hash = "#/login";
  };

  const isAuthPage = routeHash.includes("login") || routeHash.includes("register");

  // Tampilkan loading saat memeriksa autentikasi
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {!isAuthPage && isAuthenticated && user && (
        <header className="bg-white shadow">
          <div className="container main-header">
            <Navbar onLogout={handleLogout} user={user} />
          </div>
        </header>
      )}

      <main id="main-content" className="main-content">
        <Router key={routeHash} user={user} isAuthenticated={isAuthenticated} />
      </main>
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