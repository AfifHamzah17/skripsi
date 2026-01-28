// src/Context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [hasMapel, setHasMapel] = useState(null); // null: belum dicek, true: sudah, false: belum
  const [checkingMapel, setCheckingMapel] = useState(false);
  const [mapelData, setMapelData] = useState([]); // Simpan data mapel guru

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
            
            // Jika role guru, cek apakah sudah punya mapel
            if (parsedUser.role === 'guru') {
              checkTeacherMapel(token);
            }
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fungsi untuk mengecek apakah guru sudah memiliki mapel
  const checkTeacherMapel = async (token) => {
    if (!token) return;

    setCheckingMapel(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/teachers/mapel`, {
          headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasMapel(data.hasMapel);
        if (data.hasMapel && data.mapel) {
          setMapelData(data.mapel);
        }
      } else {
        setHasMapel(false);
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
      
      // Reset hasMapel saat login, akan dicek ulang
      setHasMapel(null);
      setMapelData([]);
      
      // Jika role guru, cek apakah sudah punya mapel
      if (userData.role === 'guru') {
        checkTeacherMapel(userData.token);
      }
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
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

  // Fungsi untuk refresh data mapel
  const refreshMapelData = async () => {
    const token = localStorage.getItem('token');
    if (token && user && user.role === 'guru') {
      await checkTeacherMapel(token);
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

  if (loading || checkingMapel) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};