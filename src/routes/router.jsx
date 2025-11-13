// src/routes/router.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import LoginView from "../pages/views/login-view";
import RegisterView from "../pages/views/register-view";
import HomeView from "../pages/views/home-view";
import NotFoundView from "../pages/views/not-found-view"; 
import SiswaView from "../pages/views/siswa-view";
import GuruView from "../pages/views/guru-view";
import PetugasView from "../pages/views/petugas-view";
import AdminView from "../pages/views/admin-view";
import PilihMapelView from "../pages/views/pilih-mapel-view";
import ProfileView from "../pages/views/profile-view";

const routeMap = {
  login: <LoginView />,
  register: <RegisterView />,
  home: <HomeView />,
  siswa: <SiswaView />,
  guru: <GuruView />,
  petugas: <PetugasView />,
  admin: <AdminView />,
  "pilih-mapel": <PilihMapelView />,
  profile: <ProfileView />,
};

export default function Router() {
  const { user, isAuthenticated, hasMapel } = useAuth();
  const [currentHash, setCurrentHash] = useState(window.location.hash.replace("#/", "") || "login");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [guruId, setGuruId] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "") || "login";
      setCurrentHash(hash);
      
      // Extract guru ID from hash if present
      if (hash.startsWith("profile/")) {
        const id = hash.split("/")[1];
        setGuruId(id);
      } else {
        setGuruId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    // Hanya lakukan redirect jika sudah terautentikasi dan tidak sedang dalam proses redirect
    if (!isRedirecting && isAuthenticated) {
      const hash = currentHash;
      
      // Jika user sudah login dan mencoba akses login/register, arahkan ke dashboard
      if (hash === "login" || hash === "register") {
        setIsRedirecting(true);
        if (user.role === 'siswa') {
          window.location.hash = "#/siswa";
        } else if (user.role === 'guru') {
          // Cek apakah guru sudah memiliki mapel
          if (hasMapel === false) {
            window.location.hash = "#/pilih-mapel";
          } else {
            window.location.hash = "#/guru";
          }
        } else if (user.role === 'petugas') {
          window.location.hash = "#/petugas";
        } else if (user.role === 'admin') {
          window.location.hash = "#/admin";
        }
        return;
      }
      
      // Arahkan user ke view sesuai role jika di home
      if (hash === "home") {
        setIsRedirecting(true);
        if (user.role === 'siswa') {
          window.location.hash = "#/siswa";
        } else if (user.role === 'guru') {
          // Cek apakah guru sudah memiliki mapel
          if (hasMapel === false) {
            window.location.hash = "#/pilih-mapel";
          } else {
            window.location.hash = "#/guru";
          }
        } else if (user.role === 'petugas') {
          window.location.hash = "#/petugas";
        } else if (user.role === 'admin') {
          window.location.hash = "#/admin";
        }
        return;
      }
      
      // Jika guru dan belum memilih mapel, arahkan ke halaman pemilihan mapel
      if (user.role === 'guru' && hasMapel === false && hash !== "pilih-mapel") {
        setIsRedirecting(true);
        window.location.hash = "#/pilih-mapel";
        return;
      }
    }
    
    // Jika user belum login dan mencoba akses halaman selain login/register, arahkan ke login
    if (!isAuthenticated && !["login", "register"].includes(currentHash.split("/")[0])) {
      setIsRedirecting(true);
      window.location.hash = "#/login";
      return;
    }
    
    // Reset redirect flag setelah proses redirect selesai
    setIsRedirecting(false);
  }, [currentHash, isAuthenticated, user, hasMapel, isRedirecting]);

  const hash = currentHash.split("/")[0]; // Get base hash without parameters
  const Page = routeMap[hash] || <NotFoundView />;

  // Pass guruId as a prop to ProfileView if present
  if (hash === "profile" && guruId) {
    return React.cloneElement(<ProfileView />, { guruId });
  }

  return Page;
}