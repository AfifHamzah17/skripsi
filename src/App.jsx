import React, { useEffect, useState } from "react";
import Router from "./routes/router";
import Navbar from "./components/navbar/navbar";
import "../src/style.css";

export default function App() {
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
    localStorage.removeItem("token");
    window.location.hash = "#/login";
  };

  const isAuthPage = routeHash.includes("login") || routeHash.includes("register");

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {!isAuthPage && (
        <header className="bg-white shadow">
          <div className="container main-header">
            <Navbar onLogout={handleLogout} />
          </div>
        </header>
      )}

      <main id="main-content" className="main-content">
        <Router key={routeHash} />
      </main>
    </div>
  );
}
