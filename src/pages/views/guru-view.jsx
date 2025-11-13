// src/pages/views/guru-view.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FaBook, FaUser, FaSignOutAlt, FaArrowLeft, FaChalkboardTeacher, FaTools, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import { getPeminjamanByGuru } from '../models/peminjaman-model';
import Table from '../../components/table';

export default function GuruView() {
  const { user, mapelData, logout } = useAuth();
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPeminjamans = async () => {
      try {
        const response = await getPeminjamanByGuru();
        
        if (response.error) {
          setMessage(response.message);
        } else {
          setPeminjamans(response.result);
        }
      } catch (error) {
        setMessage('Gagal mengambil data peminjaman');
      } finally {
        setLoading(false);
      }
    };

    fetchPeminjamans();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Anda telah berhasil logout');
    window.location.hash = '#/login';
  };

  const columns = [
    { 
      header: 'Siswa', 
      field: 'user.nama',
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <FaUser className="h-4 w-4 text-primary-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row.user?.nama || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">
              {row.user?.kelas || '-'}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Alat', 
      field: 'alat.nama',
      render: (row) => (
        <div className="flex items-center">
          <FaTools className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {row.alat?.nama || row.alatId || 'Unknown'}
          </span>
        </div>
      )
    },
    { 
      header: 'Jumlah', 
      field: 'jumlah',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.jumlah} item
        </span>
      )
    },
    { 
      header: 'Tanggal Pinjam', 
      field: 'tanggalPeminjaman',
      render: (row) => (
        <div className="flex items-center">
          <FaCalendarAlt className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {new Date(row.tanggalPeminjaman).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      )
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => {
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
          disetujui: { color: 'bg-green-100 text-green-800', text: 'Disetujui' },
          ditolak: { color: 'bg-red-100 text-red-800', text: 'Ditolak' },
          kembali: { color: 'bg-blue-100 text-blue-800', text: 'Dikembalikan' },
        };
        
        const config = statusConfig[row.status] || statusConfig.pending;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.text}
          </span>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FaBook className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Tampilan Guru</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Selamat datang, {user?.nama}</span>
              <button
                onClick={() => window.location.hash = '#/profile'}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <FaUser className="mr-1" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Guru</h1>
            
            {/* Informasi Guru */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Informasi Guru</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{user?.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NIP:</span>
                  <span className="font-medium">{user?.nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No. HP:</span>
                  <span className="font-medium">{user?.nohp}</span>
                </div>
              </div>
            </div>

            {/* Mata Pelajaran */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Mata Pelajaran yang Diajar</h2>
                <button
                  onClick={() => window.location.hash = '#/profile'}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  Ubah
                </button>
              </div>
              
              {mapelData && mapelData.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mapelData.map((mapel, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {mapel}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Belum ada mata pelajaran yang dipilih</p>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <FaTools className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Peminjaman</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{peminjamans.length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <FaCalendarAlt className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {peminjamans.filter(p => p.status === 'pending').length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <FaCalendarAlt className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Disetujui</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {peminjamans.filter(p => p.status === 'disetujui').length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Dikembalikan</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {peminjamans.filter(p => p.status === 'kembali').length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Peminjaman */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => window.location.hash = '#/peminjaman/create'}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pinjam Alat</h3>
                <p className="text-gray-600">Buat permintaan peminjaman alat praktikum</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => window.location.hash = '#/peminjaman/history'}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Riwayat Peminjaman</h3>
                <p className="text-gray-600">Lihat riwayat peminjaman alat</p>
              </div>
            </div>

            {/* Peminjaman Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Peminjaman untuk Mapel Anda</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Daftar peminjaman alat oleh siswa untuk mapel yang Anda ampu</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <Table 
                  columns={columns}
                  data={peminjamans}
                  loading={loading}
                  emptyMessage="Tidak ada peminjaman tersedia"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}