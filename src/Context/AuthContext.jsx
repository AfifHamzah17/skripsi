// src/Context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkTeacherMapel as checkTeacherMapelModel } from '../pages/guru/guru-model';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasMapel, setHasMapel] = useState(null);
  const [checkingMapel, setCheckingMapel] = useState(false);
  const [mapelData, setMapelData] = useState([]);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
          const parsedUser = JSON.parse(userData);

          if (parsedUser && parsedUser.token) {
            setUser(parsedUser);
            setIsAuthenticated(true);

            if (parsedUser.role === 'guru') {
              // Fallback: cek user.mapel dulu dari localStorage
              const localMapel = parsedUser.mapel;
              if (Array.isArray(localMapel) && localMapel.length > 0) {
                setHasMapel(true);
                setMapelData(localMapel);
                setCheckingMapel(false);
              } else if (typeof localMapel === 'string' && localMapel.trim()) {
                setHasMapel(true);
                setMapelData(localMapel.split(',').map(m => m.trim()));
                setCheckingMapel(false);
              } else {
                // Kosong → cek ke API
                checkTeacherMapelStatus(token);
              }
            } else {
              setCheckingMapel(false);
            }
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const checkTeacherMapelStatus = async (token) => {
    if (!token) return;

    setCheckingMapel(true);
    try {
      const result = await checkTeacherMapelModel();

      if (result.error) {
        console.warn('Mapel check error (treated as no mapel):', result.message);
        setHasMapel(false);
      } else {
        setHasMapel(result.hasMapel);
        if (result.hasMapel && result.mapel) {
          setMapelData(result.mapel);
          // Sync ke localStorage juga
          const cached = JSON.parse(localStorage.getItem('user') || '{}');
          cached.mapel = result.mapel;
          localStorage.setItem('user', JSON.stringify(cached));
          setUser(prev => ({ ...prev, mapel: result.mapel }));
        } else {
          setMapelData([]);
        }
      }
    } catch (error) {
      console.error('Error checking teacher mapel:', error);
      setHasMapel(false);
    } finally {
      setCheckingMapel(false);
    }
  };

  const login = (userData) => {
    try {
      if (!userData.token) {
        console.error('User data missing token');
        return;
      }

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);

      setUser(userData);
      setIsAuthenticated(true);

      setHasMapel(null);
      setMapelData([]);

      if (userData.role === 'guru') {
        // Fallback: cek mapel dari response login
        const localMapel = userData.mapel;
        if (Array.isArray(localMapel) && localMapel.length > 0) {
          setHasMapel(true);
          setMapelData(localMapel);
        } else if (typeof localMapel === 'string' && localMapel.trim()) {
          setHasMapel(true);
          setMapelData(localMapel.split(',').map(m => m.trim()));
        } else {
          checkTeacherMapelStatus(userData.token);
        }
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setHasMapel(null);
      setMapelData([]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshMapelData = async () => {
    const token = localStorage.getItem('token');
    if (token && user && user.role === 'guru') {
      await checkTeacherMapelStatus(token);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    hasMapel,
    checkingMapel,
    mapelData,
    refreshMapelData
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};