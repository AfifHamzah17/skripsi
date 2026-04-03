// src/App.jsx
import React, { useEffect, useState } from 'react';
import Router from './routes/router';
import Sidebar from './components/sidebar/Sidebar';
import './style.css';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { FaBars } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [routeHash, setRouteHash] = useState(window.location.hash.startsWith('#/') ? window.location.hash : '#/home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => { const m = window.innerWidth < 1024; setIsMobile(m); if (m && isCollapsed) setIsCollapsed(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isCollapsed]);

  useEffect(() => {
    const onHash = () => { const h = window.location.hash; if (h.startsWith('#/')) setRouteHash(h); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { setIsSidebarOpen(false); }, [routeHash]);

  const handleLogout = () => { logout(); window.location.hash = '#/auth'; };
  const isAuthPage = routeHash.includes('login') || routeHash.includes('register') || routeHash.includes('auth');

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f3f4f6'}}><div style={{width:48,height:48,borderRadius:'50%',borderTop:'2px solid #3b82f6',borderBottom:'2px solid #3b82f6',animation:'spin 1s linear infinite'}}/></div>;

  if (isAuthPage || !isAuthenticated) return (<div style={{minHeight:'100vh',background:'#f9fafb'}}><Router key={routeHash} user={user} isAuthenticated={isAuthenticated} /><ToastContainer position="top-right" autoClose={3000} theme="colored" /></div>);

  return (
    <div style={{display:'flex',height:'100vh',background:'#f3f4f6',overflow:'hidden'}}>
      <Sidebar user={user} onLogout={handleLogout} isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} routeHash={routeHash} isMobile={isMobile} />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',transition:'margin 0.3s ease',marginLeft:isMobile?0:(isCollapsed?80:256)}}>
        <header style={{height:64,background:'#fff',boxShadow:'0 1px 2px rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',zIndex:10,flexShrink:0,borderBottom:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
            {!isMobile?null:<button type="button" onClick={()=>setIsSidebarOpen(!isSidebarOpen)} style={{background:'none',border:'none',color:'#4b5563',cursor:'pointer',padding:4,display:'flex'}}><FaBars size={20}/></button>}
             <a href="#/"> <h1 style={{fontSize:isMobile?16:20,fontWeight:700,color:'#1f2937',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{isMobile?'SIPINJAM':'Sistem Peminjaman SMKN 1 Percut Sei Tuan'}</h1> </a>
          </div>
          <a href="#/profile/my" style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,textDecoration:'none',cursor:'pointer'}}>
            {!isMobile&&<div style={{textAlign:'right'}}><p style={{margin:0,fontSize:14,fontWeight:500,color:'#374151',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:160}}>{user?.nama||user?.username}</p><p style={{margin:0,fontSize:12,color:'#6b7280',textTransform:'capitalize'}}>{user?.role}</p></div>}
            {user?.foto?<img src={user.foto} alt="Profile" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid #e5e7eb'}}/>:<div style={{width:36,height:36,borderRadius:'50%',background:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',color:'#2563eb',fontWeight:600,fontSize:14,flexShrink:0}}>{(user?.nama||user?.username||'?').charAt(0).toUpperCase()}</div>}
          </a>
        </header>
        <main id="main-content" style={{flex:1,overflowY:'auto',overflowX:'hidden',background:'#f9fafb'}}>
          <Router key={routeHash} user={user} isAuthenticated={isAuthenticated} />
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored"/>
    </div>
  );
}

export default function App() { return <AuthProvider><AppContent/></AuthProvider>; }