// src/components/sidebar/Sidebar.jsx
import React from 'react';
import { FaHome,FaUser,FaTools,FaClipboardList,FaSignOutAlt,FaChevronLeft,FaChevronRight,FaChalkboardTeacher,FaChartBar,FaHistory,FaBook } from 'react-icons/fa';

const MenuItem = ({ to, icon, label, isActive, showLabel }) => (
  <li style={{listStyle:'none'}}>
    <a href={`#/${to}`} style={{display:'flex',alignItems:'center',padding:12,borderRadius:8,textDecoration:'none',transition:'all 0.2s',background:isActive?'#2563eb':'transparent',color:isActive?'#fff':'#4b5563',boxShadow:isActive?'0 4px 6px rgba(37,99,235,0.3)':'none'}}>
      <span style={{fontSize:20,color:isActive?'#fff':'#6b7280',flexShrink:0}}>{icon}</span>
      {showLabel&&<span style={{marginLeft:16,fontWeight:500,whiteSpace:'nowrap'}}>{label}</span>}
    </a>
  </li>
);

export default function Sidebar({ user, onLogout, isOpen, toggleSidebar, isCollapsed, setIsCollapsed, routeHash, isMobile }) {
  const getMenuItems = () => {
    switch (user?.role) {
      case 'siswa': return [{to:'siswa/pinjam',icon:<FaTools/>,label:'Pinjam Alat'},{to:'siswa/riwayat',icon:<FaHistory/>,label:'Riwayat Peminjaman'}];
      case 'guru': return [{to:'guru/dashboard',icon:<FaHome/>,label:'Dashboard'},{to:'guru/peminjaman',icon:<FaClipboardList/>,label:'Peminjaman'},{to:'guru/mapel',icon:<FaBook/>,label:'Mata Pelajaran'}];
      case 'admin': return [{to:'admin/dashboard',icon:<FaHome/>,label:'Dashboard'},{to:'admin/alat',icon:<FaTools/>,label:'Kelola Alat'},{to:'admin/laporan',icon:<FaChartBar/>,label:'Laporan'}];
      case 'petugas': return [{to:'petugas/dashboard',icon:<FaHome/>,label:'Dashboard'},{to:'petugas/peminjaman',icon:<FaClipboardList/>,label:'Peminjaman'},{to:'petugas/alat',icon:<FaTools/>,label:'Manajemen Alat'},{to:'petugas/guru',icon:<FaChalkboardTeacher/>,label:'Manajemen Akun'},{to:'petugas/mapel',icon:<FaBook/>,label:'Manajemen Mapel'},{to:'petugas/laporan',icon:<FaChartBar/>,label:'Analisis Praktik Siswa'}];
      default: return [];
    }
  };
  const menuItems = getMenuItems();
  const checkActive = (p) => routeHash === `#/${p}`;
  const w = isMobile ? 256 : (isCollapsed ? 80 : 256);
  const showLabel = isMobile ? true : !isCollapsed;

  return (
    <>
      {isOpen && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:20}} onClick={toggleSidebar}/>}
      <aside style={{position:'fixed',top:0,left:0,height:'100%',background:'#fff',borderRight:'1px solid #e5e7eb',zIndex:30,transition:'all 0.3s ease',display:'flex',flexDirection:'column',width:w,transform:isOpen||!isMobile?'translateX(0)':'translateX(-100%)'}}>
        <div style={{height:64,display:'flex',alignItems:'center',borderBottom:'1px solid #e5e7eb',padding:'0 16px',justifyContent:showLabel?'space-between':'center',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,overflow:'hidden'}}>
            <img style={{width:56,height:48,borderRadius:4,flexShrink:0}} src="/logo.png" alt="Logo"/>
            {showLabel&&<span style={{fontWeight:700,fontSize:18,color:'#1f2937',whiteSpace:'nowrap'}}>SIPINJAM</span>}
          </div>
        </div>
        <nav style={{flex:1,overflowY:'auto',padding:'16px 12px'}}>
          <ul style={{listStyle:'none',margin:0,padding:0,display:'flex',flexDirection:'column',gap:4}}>
            {menuItems.map((item,i)=><MenuItem key={i} {...item} isActive={checkActive(item.to)} showLabel={showLabel}/>)}
          </ul>
        </nav>
        <div style={{padding:12,borderTop:'1px solid #e5e7eb',marginTop:'auto'}}>
          <ul style={{listStyle:'none',margin:0,padding:0,display:'flex',flexDirection:'column',gap:4}}>
            <li><a href="#/profile/my" style={{display:'flex',alignItems:'center',padding:12,borderRadius:8,textDecoration:'none',color:'#4b5563',transition:'background 0.2s'}}><FaUser style={{fontSize:20,flexShrink:0}}/>{showLabel&&<span style={{marginLeft:16,fontWeight:500}}>Profil</span>}</a></li>
            <li><button onClick={onLogout} style={{width:'100%',display:'flex',alignItems:'center',padding:12,borderRadius:8,color:'#ef4444',background:'none',border:'none',cursor:'pointer',transition:'background 0.2s'}}><FaSignOutAlt style={{fontSize:20,flexShrink:0}}/>{showLabel&&<span style={{marginLeft:16,fontWeight:500}}>Keluar</span>}</button></li>
            {!isMobile&&<li><button onClick={()=>setIsCollapsed(!isCollapsed)} style={{width:'100%',display:'flex',alignItems:'center',padding:12,borderRadius:8,color:'#6b7280',background:'none',border:'none',cursor:'pointer',justifyContent:showLabel?'flex-start':'center',transition:'background 0.2s'}}>{isCollapsed?<FaChevronRight style={{fontSize:20}}/>:<FaChevronLeft style={{fontSize:20}}/>}{showLabel&&<span style={{marginLeft:16,fontWeight:500}}>{isCollapsed?'Expand':'Collapse'}</span>}</button></li>}
          </ul>
        </div>
      </aside>
    </>
  );
}