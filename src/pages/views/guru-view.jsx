// src/pages/views/guru-view.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FaBook, 
  FaUser, 
  FaSignOutAlt, 
  FaTachometerAlt, 
  FaHandHolding, 
  FaTools, 
  FaCalendarAlt, 
  FaChalkboardTeacher,
  FaEdit,
  FaPlus,
  FaChartBar,
  FaHistory,
  FaClipboardList,
  FaSync
} from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import { getPeminjamanByGuru } from '../models/peminjaman-model';
import Table from '../../components/table';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';

export default function GuruView() {
  // Get mapelData from useAuth context
  const { user, logout, mapelData } = useAuth();
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    const fetchPeminjamans = async () => {
      try {
        const response = await getPeminjamanByGuru();
        
        if (response.error) {
          setMessage(response.message);
        } else {
          setPeminjamans(response.result || []);
          
          // Calculate statistics
          const data = response.result || [];
          const stats = {
            totalPeminjaman: data.length,
            pending: data.filter(p => p.status === 'pending').length,
            disetujui: data.filter(p => p.status === 'disetujui').length,
            kembali: data.filter(p => p.status === 'kembali').length
          };
          setStatistics(stats);
        }
      } catch (error) {
        setMessage('Gagal mengambil data peminjaman');
        console.error('Error fetching peminjaman:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeminjamans();
  }, []); // Only run once on component mount

  const handleLogout = () => {
    logout();
    toast.success('Anda telah berhasil logout');
    window.location.hash = '#/login';
  };

  const handleApprove = async (id) => {
    try {
      // Placeholder for approve logic
      toast.success('Peminjaman disetujui');
      // Refresh data
      const response = await getPeminjamanByGuru();
      if (!response.error) {
        setPeminjamans(response.result || []);
      }
    } catch (error) {
      toast.error('Gagal menyetujui peminjaman');
    }
  };

  const handleReject = async (id) => {
    try {
      // Placeholder for reject logic
      toast.success('Peminjaman ditolak');
      // Refresh data
      const response = await getPeminjamanByGuru();
      if (!response.error) {
        setPeminjamans(response.result || []);
      }
    } catch (error) {
      toast.error('Gagal menolak peminjaman');
    }
  };

  const handleReturn = async (id) => {
    try {
      // Placeholder for return logic
      toast.success('Alat dikembalikan');
      // Refresh data
      const response = await getPeminjamanByGuru();
      if (!response.error) {
        setPeminjamans(response.result || []);
      }
    } catch (error) {
      toast.error('Gagal mengembalikan alat');
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const response = await getPeminjamanByGuru();
      if (!response.error) {
        const data = response.result || [];
        setPeminjamans(data);
        
        // Update statistics
        const stats = {
          totalPeminjaman: data.length,
          pending: data.filter(p => p.status === 'pending').length,
          disetujui: data.filter(p => p.status === 'disetujui').length,
          kembali: data.filter(p => p.status === 'kembali').length
        };
        setStatistics(stats);
      }
      
      setMessage('Data berhasil diperbarui');
      toast.success('Data berhasil diperbarui');
    } catch (error) {
      setMessage('Gagal memperbarui data');
      toast.error('Gagal memperbarui data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Siswa', 
      field: 'user.nama',
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUser className="h-4 w-4 text-blue-600" />
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
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <FaTools className="h-4 w-4 text-green-600" />
          </div>
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
        <div className="flex items-center text-sm text-gray-900">
          <FaCalendarAlt className="mr-2 h-4 w-4 text-gray-400" />
          {new Date(row.tanggalPeminjaman).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
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
    },
    { 
      header: 'Aksi', 
      field: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Setujui
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Tolak
              </button>
            </>
          )}
          {row.status === 'disetujui' && (
            <button
              onClick={() => handleReturn(row.id)}
              className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kembalikan
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FaBook className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Tampilan Guru</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Selamat datang, {user?.nama}</span>
              <button
                onClick={() => window.location.hash = '#/profile'}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
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
            
            {/* Alert Message */}
            {message && (
              <div className="mb-6 rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">{message}</p>
                      </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'dashboard' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <FaTachometerAlt className="mr-2" />
                  Dashboard
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'peminjaman' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('peminjaman')}
                >
                  <FaHandHolding className="mr-2" />
                  Peminjaman
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'mapel' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('mapel')}
                >
                  <FaChalkboardTeacher className="mr-2" />
                  Mapel
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'laporan' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('laporan')}
                >
                  <FaChartBar className="mr-2" />
                  Laporan
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <DashboardGrid statistics={statistics} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Guru</h3>
                    <div className="space-y-3">
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
                  
                  <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">Mata Pelajaran yang Diajar</h3>
                      <button
                        onClick={() => window.location.hash = '#/profile'}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FaEdit className="mr-1" />
                        Ubah
                      </button>
                    </div>
                    
                    {mapelData && mapelData.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {mapelData.map((mapel, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {mapel}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Belum ada mata pelajaran yang dipilih</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'peminjaman' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Daftar Peminjaman</h2>
                    <Button 
                      onClick={handleRefreshData}
                      className="flex items-center"
                    >
                      <FaSync className="mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table 
                    columns={columns}
                    data={peminjamans}
                    loading={loading}
                    emptyMessage="Tidak ada data peminjaman"
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'mapel' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Mata Pelajaran</h2>
                    <Button 
                      onClick={() => window.location.hash = '#/profile'}
                      className="flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Kelola Mapel
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {mapelData && mapelData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mapelData.map((mapel, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-900">{mapel}</h3>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 italic mb-4">Belum ada mata pelajaran yang dipilih</p>
                      <Button 
                        onClick={() => window.location.hash = '#/profile'}
                        className="flex items-center mx-auto"
                      >
                        <FaPlus className="mr-2" />
                        Tambah Mapel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'laporan' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Laporan Peminjaman</h2>
                </div>
                <div className="text-gray-500 italic text-center py-8">
                  Fitur laporan akan segera hadir
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}