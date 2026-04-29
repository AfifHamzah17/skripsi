// src/Context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { checkTeacherMapel as checkTeacherMapelModel } from '../pages/guru/guru-model';

const AuthContext = createContext();
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth must be used within AuthProvider'); return c; };

const API_BASE = () => import.meta.env.VITE_API_BASE;
const authH = () => { const t = localStorage.getItem('token'); return t ? { Authorization: 'Bearer ' + t } : {}; };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasMapel, setHasMapel] = useState(null);
  const [checkingMapel, setCheckingMapel] = useState(false);
  const [mapelData, setMapelData] = useState([]);

  const checkTeacherMapelStatus = useCallback(async (token) => {
    if (!token) return; setCheckingMapel(true);
    try {
      const result = await checkTeacherMapelModel();
      if (result.error) { setHasMapel(false); } else {
        setHasMapel(result.hasMapel);
        if (result.hasMapel && result.mapel) { setMapelData(result.mapel); const cached = JSON.parse(localStorage.getItem('user') || '{}'); cached.mapel = result.mapel; localStorage.setItem('user', JSON.stringify(cached)); setUser(prev => prev ? ({ ...prev, mapel: result.mapel }) : prev); } else { setMapelData([]); }
      }
    } catch { setHasMapel(false); } finally { setCheckingMapel(false); }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    const cached = localStorage.getItem('user');
    if (!token || !cached) return null;
    try {
      const uid = JSON.parse(cached).id;
      if (!uid) return null;
      const base = await API_BASE();
      const r = await fetch(base + '/users/profile/' + uid, { headers: authH() });
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return null;
      const d = await r.json();
      if (!r.ok || d.error) return null;
      const freshData = { ...JSON.parse(cached), ...d.result, token };
      localStorage.setItem('user', JSON.stringify(freshData));
      setUser(freshData);
      return freshData;
    } catch { return null; }
  }, []);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && token) {
        const parsed = JSON.parse(userData);
        if (parsed && parsed.token) {
          setUser(parsed); setIsAuthenticated(true);
          if (parsed.role === 'guru') {
            const lm = parsed.mapel;
            if (Array.isArray(lm) && lm.length > 0) { setHasMapel(true); setMapelData(lm); setCheckingMapel(false); }
            else if (typeof lm === 'string' && lm.trim()) { setHasMapel(true); setMapelData(lm.split(',').map(m => m.trim())); setCheckingMapel(false); }
            else { checkTeacherMapelStatus(token); }
          } else { setCheckingMapel(false); }
        } else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
      }
    } catch { localStorage.removeItem('user'); localStorage.removeItem('token'); } finally { setLoading(false); }
  }, [checkTeacherMapelStatus]);

  const login = (userData) => {
    try {
      if (!userData.token) return;
      localStorage.setItem('user', JSON.stringify(userData)); localStorage.setItem('token', userData.token);
      setUser(userData); setIsAuthenticated(true); setHasMapel(null); setMapelData([]);
      if (userData.role === 'guru') {
        const lm = userData.mapel;
        if (Array.isArray(lm) && lm.length > 0) { setHasMapel(true); setMapelData(lm); }
        else if (typeof lm === 'string' && lm.trim()) { setHasMapel(true); setMapelData(lm.split(',').map(m => m.trim())); }
        else { checkTeacherMapelStatus(userData.token); }
      }
    } catch {}
  };

  const logout = () => { try { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setIsAuthenticated(false); setHasMapel(null); setMapelData([]); } catch {} };
  const refreshMapelData = async () => { const t = localStorage.getItem('token'); if (t && user && user.role === 'guru') await checkTeacherMapelStatus(t); };

  const value = { user, login, logout, loading, isAuthenticated, hasMapel, checkingMapel, mapelData, refreshMapelData, refreshUser };
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}><div style={{ width: 48, height: 48, borderRadius: '50%', borderTop: '2px solid #3b82f6', borderBottom: '2px solid #3b82f6', animation: 'spin 1s linear infinite' }} /></div>;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};