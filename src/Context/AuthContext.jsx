// src/Context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkTeacherMapel as checkTeacherMapelModel } from '../pages/models/teacher-model';

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
            
            // Jika role guru, cek apakah sudah punya mapel
            if (parsedUser.role === 'guru') {
              checkTeacherMapelStatus(token);
            } else {
                // If not guru, no need to check mapel
                setCheckingMapel(false);
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

  const checkTeacherMapelStatus = async (token) => {
    if (!token) return;

    setCheckingMapel(true);
    try {
      // Call the model function
      const result = await checkTeacherMapelModel();

      if (result.error) {
        // Log warning but allow user to proceed
        console.warn("Mapel check returned error (403/404 treated as no mapel):", result.message);
        // Assume false so they can go to the selection page
        setHasMapel(false);
      } else {
        // Success
        setHasMapel(result.hasMapel);
        if (result.hasMapel && result.mapel) {
          setMapelData(result.mapel);
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
      
      // Reset hasMapel saat login
      setHasMapel(null);
      setMapelData([]);
      
      if (userData.role === 'guru') {
        checkTeacherMapelStatus(userData.token);
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

  // Show loading spinner only if initial auth loading is happening
  // Do NOT block UI if checkingMapel is true (allows user to see page while checking)
  if (loading) {
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