import React, { useState } from "react";
import { FaBars, FaTimes, FaHome, FaTools, FaUserTie, FaCog, FaSignOutAlt } from "react-icons/fa";
import "../../style.css";

export default function Navbar({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">SistemPeminjaman</span>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="#/home" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
            >
              <FaHome className="mr-2" />
              Home
            </a>
            
            {user?.role === 'siswa' && (
              <a 
                href="#/siswa" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaTools className="mr-2" />
                Peminjaman
              </a>
            )}
            
            {user?.role === 'guru' && (
              <a 
                href="#/guru" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaUserTie className="mr-2" />
                Monitoring
              </a>
            )}
            
            {user?.role === 'petugas' && (
              <a 
                href="#/petugas" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaCog className="mr-2" />
                Pengelolaan
              </a>
            )}
            
            <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.nama}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <a
              href="#/home"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
            >
              <FaHome className="mr-3" />
              Home
            </a>
            
            {user?.role === 'siswa' && (
              <a
                href="#/siswa"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaTools className="mr-3" />
                Peminjaman
              </a>
            )}
            
            {user?.role === 'guru' && (
              <a
                href="#/guru"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaUserTie className="mr-3" />
                Monitoring
              </a>
            )}
            
            {user?.role === 'petugas' && (
              <a
                href="#/petugas"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaCog className="mr-3" />
                Pengelolaan
              </a>
            )}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2 text-base font-medium text-gray-700">
                <div className="font-medium">{user?.nama}</div>
                <div className="text-sm text-gray-500">{user?.role}</div>
              </div>
              
              <button
                onClick={onLogout}
                className="w-full text-left mt-2 block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200 flex items-center"
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}