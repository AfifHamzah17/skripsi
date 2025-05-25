import React, { useEffect } from "react";
import "../../assets/home.css";

export default function HomeView() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.hash = "#/login";
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Beranda</h1>
        <p>Selamat datang! Ini adalah halaman beranda setelah login.</p>
      </div>
    </div>
  );
}