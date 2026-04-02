// src/routes/router.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import AuthView from '../pages/auth/authView';
import HomeView from '../pages/views/home-view';
import NotFoundView from '../pages/views/not-found-view';
import AdminView from '../pages/views/admin-view';
import PilihMapelView from '../pages/views/pilih-mapel-view';
import ProfilePresenter from '../pages/profile/profile-presenter';
import GuruPresenter from '../pages/guru/guru-presenter';
import PetugasPresenter from '../pages/petugas/petugasPresenter';
import SiswaPresenter from '../pages/siswa/siswaPresenter';

const DEFAULT_SUBS = {
  siswa: 'pinjam',
  petugas: 'dashboard',
  guru: 'dashboard',
  admin: 'dashboard'
};

const ROUTE_COMPONENTS = {
  siswa: SiswaPresenter,
  petugas: PetugasPresenter,
  guru: GuruPresenter,
  admin: AdminView
};

const STATIC_ROUTES = {
  auth: AuthView,
  home: HomeView,
  'pilih-mapel': PilihMapelView
};

const getEffectiveHasMapel = (user, hasMapel) => {
  // Prioritaskan hasil dari context (API call)
  if (hasMapel !== null) return hasMapel;

  // Fallback: cek user.mapel langsung dari localStorage
  if (!user) return false;
  const mapel = user.mapel;

  if (Array.isArray(mapel)) return mapel.length > 0;
  if (typeof mapel === 'string') return mapel.trim().length > 0;
  if (mapel && typeof mapel === 'object') return Object.keys(mapel).length > 0;

  return false;
};

export default function Router() {
  const { user, isAuthenticated, hasMapel, checkingMapel } = useAuth();
  const [currentHash, setCurrentHash] = useState(
    window.location.hash.replace('#/', '') || 'auth'
  );
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.replace('#/', '') || 'auth';
      if (hash === 'login' || hash === 'register') hash = 'auth';
      setCurrentHash(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isRedirecting) return;

    const parts = currentHash.split('/');
    const baseHash = parts[0];

    // ==================== SUDAH LOGIN ====================
    if (isAuthenticated && user) {

      // Dari auth/home → redirect ke dashboard role
      if (baseHash === 'auth' || baseHash === 'home') {
        // Guru: tunggu selesai cek mapel dulu
        if (user.role === 'guru' && hasMapel === null && checkingMapel) {
          return; // biarkan loading, jangan redirect dulu
        }

        setIsRedirecting(true);

        if (user.role === 'guru') {
          if (getEffectiveHasMapel(user, hasMapel)) {
            window.location.hash = '#/guru/dashboard';
          } else {
            window.location.hash = '#/pilih-mapel';
          }
        } else {
          const targets = {
            siswa: '#/siswa/pinjam',
            petugas: '#/petugas/dashboard',
            admin: '#/admin/dashboard'
          };
          window.location.hash = targets[user.role] || '#/auth';
        }
        return;
      }

      // Guru: belum punya mapel → force pilih mapel
      if (user.role === 'guru' && !getEffectiveHasMapel(user, hasMapel) && baseHash !== 'pilih-mapel') {
        // Tunggu kalau masih cek
        if (hasMapel === null && checkingMapel) return;

        setIsRedirecting(true);
        window.location.hash = '#/pilih-mapel';
        return;
      }

      // Guru: sudah punya mapel tapi akses pilih-mapel → dashboard
      if (user.role === 'guru' && getEffectiveHasMapel(user, hasMapel) && baseHash === 'pilih-mapel') {
        setIsRedirecting(true);
        window.location.hash = '#/guru/dashboard';
        return;
      }

      // Route tanpa sub-route → tambahkan default
      if (ROUTE_COMPONENTS[baseHash] && !parts[1]) {
        setIsRedirecting(true);
        window.location.hash = `#/${baseHash}/${DEFAULT_SUBS[baseHash]}`;
        return;
      }
    }

    // ==================== BELUM LOGIN ====================
    if (!isAuthenticated && baseHash !== 'auth') {
      setIsRedirecting(true);
      window.location.hash = '#/auth';
      return;
    }

    setIsRedirecting(false);
  }, [currentHash, isAuthenticated, user, hasMapel, checkingMapel, isRedirecting]);

  // Loading / redirecting
  if (isRedirecting) return null;

  // Guru sedang dicek mapel-nya
  if (user?.role === 'guru' && hasMapel === null && checkingMapel) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const parts = currentHash.split('/');
  const baseHash = parts[0];

  // ==================== PROFILE ====================
  if (baseHash === 'profile' && parts[1]) {
    const profileId = parts[1] === 'my' ? user?.id : parts[1];
    return <ProfilePresenter userId={profileId} currentUser={user} />;
  }

  // ==================== STATIC ROUTES ====================
  if (STATIC_ROUTES[baseHash] && !parts[1]) {
    const StaticComponent = STATIC_ROUTES[baseHash];
    return <StaticComponent />;
  }

  // ==================== ROLE ROUTES ====================
  const Component = ROUTE_COMPONENTS[baseHash];
  if (Component) {
    const activeTab = parts[1] || DEFAULT_SUBS[baseHash] || null;
    return <Component user={user} activeTab={activeTab} />;
  }

  // ==================== 404 ====================
  return <NotFoundView />;
}