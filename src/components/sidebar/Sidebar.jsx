import React from 'react';
import { FaHome, FaUser, FaTools, FaClipboardList, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaChalkboardTeacher, FaChartBar, FaHistory, FaBook } from 'react-icons/fa';

const MenuItem = ({ to, icon, label, isCollapsed, isActive }) => (
  <li>
    <a href={`#/${to}`} className={`group flex items-center p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} ${isCollapsed ? 'justify-center' : ''}`} title={isCollapsed ? label : ''}>
      <span className={`text-xl ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}>{icon}</span>
      <span className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden w-0 opacity-0' : 'block opacity-100'}`}>{label}</span>
    </a>
  </li>
);

export default function Sidebar({ user, onLogout, isOpen, toggleSidebar, isCollapsed, setIsCollapsed, routeHash }) {
  const getMenuItems = () => {
    switch (user?.role) {
      case 'siswa':
        return [
          { to: 'siswa/pinjam', icon: <FaTools />, label: 'Pinjam Alat' },
          { to: 'siswa/riwayat', icon: <FaHistory />, label: 'Riwayat Peminjaman' }
        ];
      case 'guru':
        return [
          { to: 'guru/dashboard', icon: <FaHome />, label: 'Dashboard' },
          { to: 'guru/peminjaman', icon: <FaClipboardList />, label: 'Peminjaman' },
          { to: 'guru/mapel', icon: <FaBook />, label: 'Mata Pelajaran' }
        ];
      case 'admin':
        return [
          { to: 'admin/dashboard', icon: <FaHome />, label: 'Dashboard' },
          { to: 'admin/alat', icon: <FaTools />, label: 'Kelola Alat' },
          { to: 'admin/laporan', icon: <FaChartBar />, label: 'Laporan' }
        ];
      case 'petugas':
        return [
          { to: 'petugas/dashboard', icon: <FaHome />, label: 'Dashboard' },
          { to: 'petugas/peminjaman', icon: <FaClipboardList />, label: 'Peminjaman' },
          { to: 'petugas/alat', icon: <FaTools />, label: 'Manajemen Alat' },
          { to: 'petugas/guru', icon: <FaChalkboardTeacher />, label: 'Data Guru' },
          { to: 'petugas/laporan', icon: <FaChartBar />, label: 'Analisis Praktik Siswa' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const checkActive = (path) => routeHash === `#/${path}`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden transition-opacity" onClick={toggleSidebar} />}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}>
        <div className={`h-16 flex items-center border-b border-gray-200 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <img className="w-14 h-12 rounded" src="/logo.png" alt="SIPINJAM Logo" />
            <span className={`font-bold text-lg text-gray-800 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>SIPINJAM</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem key={index} {...item} isCollapsed={isCollapsed} isActive={checkActive(item.to)} />
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-gray-200 mt-auto">
          <ul className="space-y-1">
            <li>
              <a href="#/profile/my" className={`flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 ${isCollapsed ? 'justify-center' : ''}`}>
                <FaUser className="text-xl" />
                <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Profil</span>
              </a>
            </li>
            <li>
              <button onClick={onLogout} className={`w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''}`}>
                <FaSignOutAlt className="text-xl" />
                <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Keluar</span>
              </button>
            </li>
            <li className="hidden lg:block">
              <button onClick={() => setIsCollapsed(!isCollapsed)} className={`w-full flex items-center p-3 rounded-lg text-gray-500 hover:bg-gray-100 ${isCollapsed ? 'justify-center' : ''}`}>
                {isCollapsed ? <FaChevronRight className="text-xl" /> : <FaChevronLeft className="text-xl" />}
                <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{isCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}