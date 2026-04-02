import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import AuthView from '../pages/views/auth-view';
import HomeView from '../pages/views/home-view';
import NotFoundView from '../pages/views/not-found-view';
import AdminView from '../pages/views/admin-view';
import PilihMapelView from '../pages/views/pilih-mapel-view';
import ProfilePresenter from '../pages/profile/profile-presenter';
import GuruPresenter from '../pages/guru/guru-presenter';
import PetugasPresenter from '../pages/petugas/petugasPresenter';
import SiswaPresenter from '../pages/siswa/siswaPresenter';

const DEFAULT_SUBS = { siswa: 'pinjam', petugas: 'dashboard', guru: 'dashboard', admin: 'dashboard' };
const ROUTE_COMPONENTS = { siswa: SiswaPresenter, petugas: PetugasPresenter, guru: GuruPresenter, admin: AdminView };
const STATIC_ROUTES = { auth: AuthView, home: HomeView, 'pilih-mapel': PilihMapelView };

export default function Router() {
  const { user, isAuthenticated, hasMapel } = useAuth();
  const [currentHash, setCurrentHash] = useState(window.location.hash.replace('#/', '') || 'auth');
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

    if (isAuthenticated) {
      if (baseHash === 'auth' || baseHash === 'home') {
        setIsRedirecting(true);
        const targets = { siswa: '#/siswa/pinjam', guru: hasMapel ? '#/guru/dashboard' : '#/pilih-mapel', petugas: '#/petugas/dashboard', admin: '#/admin/dashboard' };
        window.location.hash = targets[user.role] || '#/auth';
        return;
      }
      if (user.role === 'guru' && hasMapel === false && baseHash !== 'pilih-mapel') {
        setIsRedirecting(true);
        window.location.hash = '#/pilih-mapel';
        return;
      }
      if (ROUTE_COMPONENTS[baseHash] && !parts[1]) {
        setIsRedirecting(true);
        window.location.hash = `#/${baseHash}/${DEFAULT_SUBS[baseHash]}`;
        return;
      }
    }

    if (!isAuthenticated && baseHash !== 'auth') {
      setIsRedirecting(true);
      window.location.hash = '#/auth';
      return;
    }
    setIsRedirecting(false);
  }, [currentHash, isAuthenticated, user, hasMapel, isRedirecting]);

  if (isRedirecting) return null;

  const parts = currentHash.split('/');
  const baseHash = parts[0];

  // ✅ Profile: "my" → pakai ID user yang login, selain itu pakai ID dari URL
  if (baseHash === 'profile' && parts[1]) {
    const profileId = parts[1] === 'my' ? user?.id : parts[1];
    return <ProfilePresenter userId={profileId} currentUser={user} />;
  }

  if (STATIC_ROUTES[baseHash] && !parts[1]) {
    const StaticComponent = STATIC_ROUTES[baseHash];
    return <StaticComponent />;
  }

  const Component = ROUTE_COMPONENTS[baseHash];
  if (Component) {
    const activeTab = parts[1] || DEFAULT_SUBS[baseHash] || null;
    return <Component user={user} activeTab={activeTab} />;
  }

  return <NotFoundView />;
}