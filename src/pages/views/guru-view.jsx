import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FaBook, FaUser, FaSignOutAlt, FaTachometerAlt, FaHandHolding, FaTools, 
  FaCalendarAlt, FaChalkboardTeacher, FaSync, FaChartPie, FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import { getPeminjamanByGuru } from '../models/peminjaman-model';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';

// Import Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registrasi Komponen Chart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function GuruView() {
  const { user, logout, mapelData } = useAuth();
  
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statistics, setStatistics] = useState({});
  const [statusFilter, setStatusFilter] = useState('all'); 

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
        setStatistics({}); 
      } else {
        const data = response.result || [];
        console.log("=== DATA DITERIMA DI FRONTEND ===");
        console.log(JSON.stringify(data, null, 2)); 
        
        setPeminjamans(data);
        
        const stats = {
          totalPeminjaman: data.length,
          pending: data.filter(p => p.status === 'pending').length,
          diproses: data.filter(p => p.status === 'disetujui').length,
          selesai: data.filter(p => p.status === 'kembali').length,
          ditolak: data.filter(p => p.status === 'ditolak').length,
        };

        const mapelStats = {};
        data.forEach(p => {
          if (p.mapel) {
            mapelStats[p.mapel] = (mapelStats[p.mapel] || 0) + 1;
          }
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

  const chartData = useMemo(() => {
    const labels = Object.keys(statistics.mapelStats || {});
    const counts = Object.values(statistics.mapelStats || {});

    return {
      labels,
      datasets: [{
        label: 'Jumlah Peminjaman',
        data: counts,
        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(139, 92, 246, 0.7)'],
        borderWidth: 1,
      }],
    };
  }, [statistics.mapelStats]);

  const handleLogout = () => {
    logout();
    toast.success('Anda telah berhasil logout');
    window.location.hash = '#/login';
  };

  const handleRefreshData = () => {
    fetchDashboardData();
    toast.success('Data berhasil diperbarui');
  };

  const filteredPeminjamans = peminjamans.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

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
              <FaBook className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Tampilan Guru</span>
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

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
                  <FaTachometerAlt className="mr-2" /> Dashboard
                </button>
                <button onClick={() => setActiveTab('peminjaman')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'peminjaman' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
                  <FaHandHolding className="mr-2" /> Peminjaman
                </button>
                <button onClick={() => setActiveTab('mapel')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'mapel' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
                  <FaChalkboardTeacher className="mr-2" /> Mapel
                </button>
              </nav>
            </div>

            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <DashboardGrid statistics={statistics} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white shadow rounded-lg p-6 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Penggunaan Nama Anda</h3>
                    <div className="flex-1 flex items-center justify-center">
                      {statistics.totalPeminjaman > 0 ? (
                        <div className="w-full h-64">
                          <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                      ) : ( <p className="text-gray-500">Belum ada data</p> )}
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Aktivitas</h3>
                     <div className="mb-6">
                        <div className="flex justify-between border-b pb-2 mb-2">
                          <span className="text-gray-600 font-medium">Total Dilibatkan:</span>
                          <span className="font-bold text-blue-600 text-lg">{statistics.totalPeminjaman || 0} Kali</span>
                        </div>
                      </div>
                      <h4 className="text-md font-medium text-gray-800 mb-3">Rincian per Mapel:</h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {statistics.mapelStats && Object.keys(statistics.mapelStats).length > 0 ? (
                          Object.entries(statistics.mapelStats).map(([mapel, count]) => {
                            const total = statistics.totalPeminjaman || 1;
                            const percentage = (count / total) * 100;
                            return (
                              <div key={mapel}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">{mapel}</span>
                                  <span className="text-gray-500">{count} kali ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            )
                          })
                        ) : ( <p className="text-gray-500 italic text-sm">Tidak ada data mapel.</p> )}
                      </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab: Peminjaman - MANUAL TABLE IMPLEMENTATION */}
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

                <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPeminjamans.length > 0 ? (
                        filteredPeminjamans.map((row) => (
                          <tr key={row.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.user?.nama || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {row.user?.kelas || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {row.mapel || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <FaTools className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-900 ml-2">{row.alat?.nama || '-'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row.tanggalPeminjaman ? new Date(row.tanggalPeminjaman).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {row.status === 'kembali' && row.kondisiPengembalian ? (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  row.kondisiPengembalian === 'baik' ? 'bg-green-100 text-green-800' : 
                                  row.kondisiPengembalian === 'rusak berat' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {row.kondisiPengembalian}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                row.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                                row.status === 'ditolak' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {row.status === 'pending' ? 'Menunggu' : 
                                 row.status === 'disetujui' ? 'Dipinjam' : 
                                 row.status === 'ditolak' ? 'Ditolak' : 
                                 row.status === 'kembali' ? 'Dikembalikan' : row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                            Tidak ada data peminjaman.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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