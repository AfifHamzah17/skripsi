// src/pages/views/guru-view.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FaBook, FaUser, FaSignOutAlt, FaTachometerAlt, FaHandHolding, FaTools, 
  FaCalendarAlt, FaChalkboardTeacher, FaSync, FaCheckCircle, 
  FaTimesCircle, FaArrowLeft, FaPlus // <--- FIX: Tambahkan FaPlus disini
} from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import { getPeminjamanByGuru } from '../models/peminjaman-model';
import Table from '../../components/table';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';

export default function GuruView() {
  const { user, logout, mapelData } = useAuth();
  
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statistics, setStatistics] = useState({});
  
  // Filter status di tab peminjaman
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'disetujui', 'kembali', 'ditolak'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getPeminjamanByGuru();
      
      if (response.error) {
        setMessage(response.message);
        setPeminjamans([]);
      } else {
        const data = response.result || [];
        setPeminjamans(data);
        
        // Hitung Statistik Dashboard
        const stats = {
          totalPeminjaman: data.length,
          pending: data.filter(p => p.status === 'pending').length,
          diproses: data.filter(p => p.status === 'disetujui').length,
          selesai: data.filter(p => p.status === 'kembali').length,
          ditolak: data.filter(p => p.status === 'ditolak').length,
        };
        
        // Statistik per Mapel
        const mapelStats = {};
        mapelData.forEach(m => {
            mapelStats[m] = data.filter(p => p.mapel === m).length;
        });
        stats.mapelStats = mapelStats;

        setStatistics(stats);
      }
    } catch (error) {
      setMessage('Gagal mengambil data peminjaman');
      console.error('Error fetching peminjaman:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Anda telah berhasil logout');
    window.location.hash = '#/login';
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/peminjaman/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'disetujui' })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.message);
      
      toast.success('Peminjaman disetujui');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.message || 'Gagal menyetujui');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/peminjaman/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ditolak' })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.message);

      toast.success('Peminjaman ditolak');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.message || 'Gagal menolak');
    }
  };

  const handleReturn = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/peminjaman/${id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if(data.error) throw new Error(data.message);

      toast.success('Alat dikembalikan');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.message || 'Gagal mengembalikan');
    }
  };

  const handleRefreshData = () => {
    fetchDashboardData();
    toast.success('Data berhasil diperbarui');
  };

  // Filter data berdasarkan tab peminjaman
  const filteredPeminjamans = peminjamans.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

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
            <div className="text-sm font-medium text-gray-900">{row.user?.nama || 'Unknown'}</div>
            <div className="text-xs text-gray-500">{row.user?.kelas || '-'}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Mapel', 
      field: 'mapel',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {row.mapel}
        </span>
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
          <span className="text-sm text-gray-900 ml-2">{row.alat?.nama || row.alatId || 'Unknown'}</span>
        </div>
      )
    },
    { 
      header: 'Tanggal', 
      field: 'tanggalPeminjaman',
      render: (row) => (
        <div className="flex items-center text-sm text-gray-900">
          <FaCalendarAlt className="mr-2 h-4 w-4 text-gray-400" />
          {new Date(row.tanggalPeminjaman).toLocaleDateString('id-ID')}
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
              <button onClick={() => handleApprove(row.id)} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded text-xs"><FaCheckCircle className="mr-1 inline"/>Setujui</button>
              <button onClick={() => handleReject(row.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded text-xs"><FaTimesCircle className="mr-1 inline"/>Tolak</button>
            </>
          )}
          {row.status === 'disetujui' && (
            <button onClick={() => handleReturn(row.id)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded text-xs"><FaArrowLeft className="mr-1 inline"/>Kembali</button>
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
              <button onClick={() => window.location.hash = '#/profile'} className="flex items-center text-sm text-blue-600 hover:text-blue-800"><FaUser className="mr-1"/> Profile</button>
              <button onClick={handleLogout} className="flex items-center text-sm text-red-600 hover:text-red-800"><FaSignOutAlt className="mr-1"/> Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white min-h-[80vh]">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Guru</h1>
            
            {message && (
              <div className="mb-6 rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500">
                <p className="text-sm text-blue-700">{message}</p>
              </div>
            )}

            {/* Tabs - HAPUS TAB LAPORAN */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FaTachometerAlt className="mr-2" /> Dashboard
                </button>
                <button onClick={() => setActiveTab('peminjaman')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'peminjaman' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FaHandHolding className="mr-2" /> Peminjaman
                </button>
                <button onClick={() => setActiveTab('mapel')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'mapel' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FaChalkboardTeacher className="mr-2" /> Mapel
                </button>
              </nav>
            </div>

            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <DashboardGrid statistics={statistics} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Analisa Peminjaman per Mapel</h3>
                    <div className="space-y-3">
                      {mapelData && mapelData.length > 0 ? (
                        mapelData.map((mapel) => {
                          const count = statistics.mapelStats?.[mapel] || 0;
                          const percentage = peminjamans.length > 0 ? (count / peminjamans.length) * 100 : 0;
                          return (
                            <div key={mapel}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{mapel}</span>
                                <span className="text-gray-500">{count} Peminjaman</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-gray-500 italic">Belum ada mapel.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Guru</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Nama:</span><span className="font-medium">{user?.nama}</span></div>
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Email:</span><span className="font-medium">{user?.email}</span></div>
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-600">NIP:</span><span className="font-medium">{user?.nip}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">No. HP:</span><span className="font-medium">{user?.nohp}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab: Peminjaman (Laporan & Aksi) */}
            {activeTab === 'peminjaman' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Filter Status:</span>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    >
                      <option value="all">Semua</option>
                      <option value="pending">Menunggu Persetujuan</option>
                      <option value="disetujui">Sedang Dipinjam</option>
                      <option value="kembali">Selesai</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                  <Button onClick={handleRefreshData} className="flex items-center text-sm"><FaSync className="mr-2" /> Refresh</Button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <Table 
                    columns={columns}
                    data={filteredPeminjamans}
                    loading={loading}
                    emptyMessage="Tidak ada data peminjaman untuk mapel yang Anda ampu."
                  />
                </div>
              </div>
            )}
            
            {/* Tab: Mapel */}
            {activeTab === 'mapel' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Mata Pelajaran yang Diajar</h2>
                  <Button onClick={() => window.location.hash = '#/profile'} className="flex items-center"><FaPlus className="mr-2" /> Kelola</Button>
                </div>
                {mapelData && mapelData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mapelData.map((mapel, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{mapel}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {statistics.mapelStats?.[mapel] || 0} Pinjam
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic">Belum ada mata pelajaran yang dipilih</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}