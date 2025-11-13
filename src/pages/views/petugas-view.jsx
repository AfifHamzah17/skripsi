// src/pages/views/petugas-view.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getAllPeminjaman, 
  updatePeminjamanStatus, 
  returnPeminjamanWithCondition,
  getLaporanGuru,
  getLaporanKelas,
  getLaporanAlat,
  getAllAlat,
  createAlat,
  updateAlat,
  deleteAlat,
  getAlatDetail // Tambahkan fungsi baru untuk mendapatkan detail alat
} from '../models/peminjaman-model';

// Import komponen
import PeminjamanTable from '../../components/peminjaman/peminjamanTable';
import AlatTable from '../../components/alat/alatTable';
import LaporanTable from '../../components/peminjaman/laporanTable';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';
import Modal from '../../components/modal';
import AlatForm from '../../components/alat/alatForm';

// Import icons
import { 
  FaBook, 
  FaUser, 
  FaSignOutAlt, 
  FaTachometerAlt, 
  FaHandHolding, 
  FaTools, 
  FaChartBar, 
  FaSync, 
  FaPlus, 
  FaChalkboardTeacher,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEye,
  FaBox,
  FaHistory
} from 'react-icons/fa';

// Import useAuth
import { useAuth } from '../../Context/AuthContext';

export default function PetugasView() {
  const { user, logout } = useAuth();
  const [peminjamans, setPeminjamans] = useState([]);
  const [alats, setAlats] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [laporanGuru, setLaporanGuru] = useState([]);
  const [laporanKelas, setLaporanKelas] = useState({});
  const [laporanAlat, setLaporanAlat] = useState({});
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State untuk modal
  const [alatModalOpen, setAlatModalOpen] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [alatDetailModalOpen, setAlatDetailModalOpen] = useState(false);
  const [alatDetail, setAlatDetail] = useState(null);
  
  // State untuk modal konfirmasi
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: null,
    onConfirm: null,
    confirmText: 'Ya',
    cancelText: 'Batal'
  });
  
  // State untuk modal pengembalian
  const [returnModal, setReturnModal] = useState({
    isOpen: false,
    peminjamanId: null,
    condition: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [peminjamanData, alatData, guruData] = await Promise.all([
          getAllPeminjaman(),
          getAllAlat(),
          fetchGuruList()
        ]);
        
        if (peminjamanData.error) {
          setMessage(peminjamanData.message);
        } else {
          setPeminjamans(peminjamanData.result);
          
          // Hitung statistik dari peminjaman
          const stats = {
            totalPeminjaman: peminjamanData.result.length,
            pending: peminjamanData.result.filter(p => p.status === 'pending').length,
            disetujui: peminjamanData.result.filter(p => p.status === 'disetujui').length,
            kembali: peminjamanData.result.filter(p => p.status === 'kembali').length
          };
          setStatistics(stats);
        }
        
        if (alatData.error) {
          setMessage(alatData.message);
        } else {
          setAlats(alatData.result);
        }

        if (guruData.error) {
          setMessage(guruData.message);
        } else {
          setGuruList(guruData.result || []);
        }
      } catch (error) {
        setMessage('Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchGuruList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/teachers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { result: data.result || [] };
      } else {
        return { error: true, message: 'Gagal mengambil data guru' };
      }
    } catch (error) {
      console.error('Error fetching guru list:', error);
      return { error: true, message: 'Terjadi kesalahan saat mengambil data guru' };
    }
  };

  const fetchLaporan = async () => {
    try {
      const [guruData, kelasData, alatData] = await Promise.all([
        getLaporanGuru(startDate),
        getLaporanKelas(),
        getLaporanAlat()
      ]);
      
      if (!guruData.error) setLaporanGuru(guruData.result);
      if (!kelasData.error) setLaporanKelas(kelasData.result);
      if (!alatData.error) setLaporanAlat(alatData.result);
    } catch (error) {
      setMessage('Gagal mengambil data laporan');
    }
  };

  const handleApprove = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Setujui Peminjaman',
      message: 'Apakah Anda yakin ingin menyetujui peminjaman ini? Stok alat akan dikurangi.',
      icon: <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />,
      onConfirm: () => confirmApprove(id),
      confirmText: 'Ya, Setujui',
      cancelText: 'Batal'
    });
  };

  const confirmApprove = async (id) => {
    try {
      const response = await updatePeminjamanStatus(id, 'disetujui');
      
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setMessage('Peminjaman disetujui');
        toast.success('Peminjaman disetujui');
        // Update local state
        setPeminjamans(peminjamans.map(p => 
          p.id === id ? {...p, status: 'disetujui'} : p
        ));
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          pending: prev.pending - 1,
          disetujui: prev.disetujui + 1
        }));
      }
    } catch (error) {
      setMessage('Gagal menyetujui peminjaman');
      toast.error('Gagal menyetujui peminjaman');
    } finally {
      setConfirmModal({...confirmModal, isOpen: false});
    }
  };

  const handleReject = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Tolak Peminjaman',
      message: 'Apakah Anda yakin ingin menolak peminjaman ini?',
      icon: <FaTimesCircle className="mx-auto h-12 w-12 text-red-500" />,
      onConfirm: () => confirmReject(id),
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal'
    });
  };

  const confirmReject = async (id) => {
    try {
      const response = await updatePeminjamanStatus(id, 'ditolak');
      
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setMessage('Peminjaman ditolak');
        toast.success('Peminjaman ditolak');
        // Update local state
        setPeminjamans(peminjamans.map(p => 
          p.id === id ? {...p, status: 'ditolak'} : p
        ));
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          pending: prev.pending - 1
        }));
      }
    } catch (error) {
      setMessage('Gagal menolak peminjaman');
      toast.error('Gagal menolak peminjaman');
    } finally {
      setConfirmModal({...confirmModal, isOpen: false});
    }
  };

  const handleReturn = (id) => {
    setReturnModal({
      isOpen: true,
      peminjamanId: id,
      condition: ''
    });
  };

  const confirmReturn = async () => {
    if (!returnModal.condition) {
      toast.error('Silakan pilih kondisi alat');
      return;
    }

    try {
      const response = await returnPeminjamanWithCondition(returnModal.peminjamanId, returnModal.condition);
      
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setMessage('Pengembalian alat berhasil diproses');
        toast.success('Pengembalian alat berhasil diproses');
        // Update local state
        setPeminjamans(peminjamans.map(p => 
          p.id === returnModal.peminjamanId ? {...p, status: 'kembali'} : p
        ));
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          disetujui: prev.disetujui - 1,
          kembali: prev.kembali + 1
        }));
      }
    } catch (error) {
      setMessage('Gagal memproses pengembalian');
      toast.error('Gagal memproses pengembalian');
    } finally {
      setReturnModal({...returnModal, isOpen: false});
    }
  };

  const handleCreateAlat = async (alatData) => {
    try {
      const response = await createAlat(alatData);
      
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setMessage('Alat berhasil ditambahkan');
        toast.success('Alat berhasil ditambahkan');
        setAlatModalOpen(false);
        // Refresh data
        const alatData = await getAllAlat();
        if (!alatData.error) {
          setAlats(alatData.result);
        }
      }
    } catch (error) {
      setMessage('Gagal menambah alat');
      toast.error('Gagal menambah alat');
    }
  };

  const handleEditAlat = async (alatData) => {
    try {
      // Gunakan selectedAlat langsung untuk mendapatkan ID
      if (!selectedAlat || !selectedAlat.id) {
        throw new Error("ID alat tidak ditemukan");
      }
      
      // Ensure ID is preserved from selectedAlat
      const alatWithId = {
        ...alatData,
        id: selectedAlat.id
      };
      
      const response = await updateAlat(alatWithId.id, alatWithId);
      
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setMessage('Alat berhasil diperbarui');
        toast.success('Alat berhasil diperbarui');
        setAlatModalOpen(false);
        setSelectedAlat(null); // Reset selectedAlat
        // Refresh data
        const alatData = await getAllAlat();
        if (!alatData.error) {
          setAlats(alatData.result);
        }
      }
    } catch (error) {
      // Tangani error dengan benar untuk mencegah refresh
      console.error("Error updating alat:", error);
      setMessage('Gagal memperbarui alat: ' + error.message);
      toast.error('Gagal memperbarui alat: ' + error.message);
    }
  };

  const handleDeleteAlat = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Alat',
      message: 'Apakah Anda yakin ingin menghapus alat ini? Tindakan ini tidak dapat dibatalkan.',
      icon: <FaTrash className="mx-auto h-12 w-12 text-red-500" />,
      onConfirm: () => confirmDeleteAlat(id),
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });
  };

  const confirmDeleteAlat = async (id) => {
    try {
      await deleteAlat(id);
      setMessage('Alat berhasil dihapus');
      toast.success('Alat berhasil dihapus');
      // Refresh data
      const alatData = await getAllAlat();
      if (!alatData.error) {
        setAlats(alatData.result);
      }
    } catch (error) {
      setMessage('Gagal menghapus alat');
      toast.error('Gagal menghapus alat');
    } finally {
      setConfirmModal({...confirmModal, isOpen: false});
    }
  };

  const handleViewAlatDetail = async (alatId) => {
    try {
      const response = await getAlatDetail(alatId);
      
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setAlatDetail(response.result);
        setAlatDetailModalOpen(true);
      }
    } catch (error) {
      setMessage('Gagal mengambil detail alat');
      toast.error('Gagal mengambil detail alat');
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const [peminjamanData, alatData, guruData] = await Promise.all([
        getAllPeminjaman(),
        getAllAlat(),
        fetchGuruList()
      ]);
      
      if (!peminjamanData.error) {
        setPeminjamans(peminjamanData.result);
      }
      
      if (!alatData.error) {
        setAlats(alatData.result);
      }

      if (!guruData.error) {
        setGuruList(guruData.result || []);
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

  const handleAddAlat = () => {
    setSelectedAlat(null);
    setAlatModalOpen(true);
  };

  const handleEditClick = (alat) => {
    setSelectedAlat(alat);
    setAlatModalOpen(true);
  };

  const handleCloseModal = () => {
    setAlatModalOpen(false);
    setSelectedAlat(null);
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar dari sistem?',
      icon: <FaSignOutAlt className="mx-auto h-12 w-12 text-blue-500" />,
      onConfirm: () => {
        logout();
        toast.success('Anda telah berhasil logout');
        window.location.hash = '#/login';
      },
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal'
    });
  };

  const viewGuruProfile = (guruId) => {
    window.location.hash = `#/profile/${guruId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FaBook className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Tampilan Petugas</span>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Petugas</h1>
            
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'alat' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('alat')}
                >
                  <FaTools className="mr-2" />
                  Manajemen Alat
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'guru' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveTab('guru')}
                >
                  <FaChalkboardTeacher className="mr-2" />
                  Data Guru
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'laporan' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => {
                    setActiveTab('laporan');
                    fetchLaporan();
                  }}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Peminjaman Terbaru</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alat</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {peminjamans.slice(0, 5).map(peminjaman => (
                            <tr key={peminjaman.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.user?.nama || 'Tidak diketahui'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.alat?.nama || 'Tidak diketahui'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  peminjaman.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  peminjaman.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                                  peminjaman.status === 'ditolak' ? 'bg-red-100 text-red-800' :
                                  peminjaman.status === 'kembali' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {peminjaman.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {peminjaman.status === 'pending' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleApprove(peminjaman.id)}
                                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                                    >
                                      <FaCheckCircle className="inline mr-1" />
                                      Setujui
                                    </button>
                                    <button
                                      onClick={() => handleReject(peminjaman.id)}
                                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                                    >
                                      <FaTimesCircle className="inline mr-1" />
                                      Tolak
                                    </button>
                                  </div>
                                )}
                                {peminjaman.status === 'disetujui' && (
                                  <button
                                    onClick={() => handleReturn(peminjaman.id)}
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                                  >
                                    <FaArrowLeft className="inline mr-1" />
                                    Kembalikan
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Alat dengan Stok Rendah</h3>
                      <Button 
                        onClick={handleAddAlat}
                        className="flex items-center"
                      >
                        <FaPlus className="mr-1" />
                        Tambah
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Alat</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {alats.filter(a => a.stok < 5).length > 0 ? (
                            alats.filter(a => a.stok < 5).map(alat => (
                              <tr key={alat.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alat.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alat.stok}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alat.kondisi}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleEditClick(alat)}
                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                  >
                                    <FaEdit className="inline" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAlat(alat.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FaTrash className="inline" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                Tidak ada alat dengan stok rendah
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'peminjaman' && (
              <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alat</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Kembali</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {peminjamans.length > 0 ? (
                        peminjamans.map(peminjaman => (
                          <tr key={peminjaman.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.user?.nama || 'Tidak diketahui'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.alat?.nama || 'Tidak diketahui'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.jumlah}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.mapel}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {peminjaman.tanggalPengembalian ? 
                                new Date(peminjaman.tanggalPengembalian).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                }) : '-'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                peminjaman.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                peminjaman.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                                peminjaman.status === 'ditolak' ? 'bg-red-100 text-red-800' :
                                peminjaman.status === 'kembali' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {peminjaman.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {peminjaman.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApprove(peminjaman.id)}
                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                                  >
                                    <FaCheckCircle className="inline mr-1" />
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleReject(peminjaman.id)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                                  >
                                    <FaTimesCircle className="inline mr-1" />
                                    Tolak
                                  </button>
                                </div>
                              )}
                              {peminjaman.status === 'disetujui' && (
                                <button
                                  onClick={() => handleReturn(peminjaman.id)}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                                >
                                  <FaArrowLeft className="inline mr-1" />
                                  Kembalikan
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                            Tidak ada data peminjaman
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'alat' && (
              <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Manajemen Alat</h2>
                  <Button 
                    onClick={handleAddAlat}
                    className="flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Tambah Alat
                  </Button>
                </div>
                
                {/* Card Grid untuk Alat */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alats.length > 0 ? (
                    alats.map(alat => (
                      <div key={alat.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                              <FaBox className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{alat.nama}</h3>
                              <p className="text-sm text-gray-500">Total Stok: {alat.stok}</p>
                            </div>
                          </div>
                          
                          {/* Kondisi Stok */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Kondisi Stok:</h4>
                            <div className="space-y-1">
                              {alat.kondisiStok && alat.kondisiStok.baik > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-600">Baik:</span>
                                  <span className="font-medium">{alat.kondisiStok.baik}</span>
                                </div>
                              )}
                              {alat.kondisiStok && alat.kondisiStok.kurang > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-yellow-600">Kurang:</span>
                                  <span className="font-medium">{alat.kondisiStok.kurang}</span>
                                </div>
                              )}
                              {alat.kondisiStok && alat.kondisiStok.rusak > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-red-600">Rusak:</span>
                                  <span className="font-medium">{alat.kondisiStok.rusak}</span>
                                </div>
                              )}
                              {(!alat.kondisiStok || (
                                alat.kondisiStok.baik === 0 && 
                                alat.kondisiStok.kurang === 0 && 
                                alat.kondisiStok.rusak === 0
                              )) && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Kondisi:</span>
                                  <span className="font-medium">{alat.kondisi || 'Tidak diketahui'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Stok */}
                          <div className="mb-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                alat.stok > 10 ? 'bg-green-100 text-green-800' : 
                                alat.stok > 5 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {alat.stok > 10 ? 'Tersedia' : alat.stok > 5 ? 'Terbatas' : 'Menipis'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Aksi */}
                          <div className="flex justify-between">
                            <button
                              onClick={() => handleViewAlatDetail(alat.id)}
                              className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium flex items-center"
                            >
                              <FaEye className="mr-1" />
                              Detail
                            </button>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditClick(alat)}
                                className="text-gray-600 hover:text-gray-800 p-2 rounded"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteAlat(alat.id)}
                                className="text-red-600 hover:text-red-800 p-2 rounded"
                                title="Hapus"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FaBox className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data alat</h3>
                      <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan alat baru.</p>
                      <div className="mt-6">
                        <Button onClick={handleAddAlat}>
                          <FaPlus className="mr-1" />
                          Tambah Alat Baru
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'guru' && (
              <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Data Guru</h2>
                  <Button 
                    onClick={handleRefreshData}
                    className="flex items-center"
                  >
                    <FaSync className="mr-2" />
                    Refresh Data
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {guruList.length > 0 ? (
                        guruList.map((guru) => (
                          <tr key={guru.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guru.nama}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guru.nip}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guru.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {guru.mapel && Array.isArray(guru.mapel) && guru.mapel.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {guru.mapel.slice(0, 2).map((mapel, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {mapel}
                                    </span>
                                  ))}
                                  {guru.mapel.length > 2 && (
                                    <span className="text-xs text-gray-500">+{guru.mapel.length - 2} lainnya</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Belum ada</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => viewGuruProfile(guru.id)}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                              >
                                <FaChalkboardTeacher className="inline mr-1" />
                                Lihat Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            Tidak ada data guru
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'laporan' && (
              <div className="space-y-8">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Laporan Peminjaman</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <LaporanTable 
                      title="Peminjaman per Guru"
                      data={laporanGuru}
                      columns={[
                        { header: 'Nama Guru', field: 'nama' },
                        { header: 'Mapel', field: 'mapel' },
                        { header: 'Jumlah Peminjaman', field: 'jumlahPeminjaman' }
                      ]}
                    />
                    
                    <LaporanTable 
                      title="Peminjaman per Kelas"
                      data={Object.entries(laporanKelas).map(([kelas, jumlah]) => ({ kelas, jumlah }))}
                      columns={[
                        { header: 'Kelas', field: 'kelas' },
                        { header: 'Jumlah Peminjaman', field: 'jumlah' }
                      ]}
                    />
                    
                    <LaporanTable 
                      title="Pemakaian Alat"
                      data={Object.entries(laporanAlat).map(([alatId, data]) => ({ ...data, id: alatId }))}
                      columns={[
                        { header: 'Alat', field: 'nama' },
                        { header: 'Jumlah Pemakaian', field: 'jumlah' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal Alat */}
      <Modal 
        isOpen={alatModalOpen}
        onClose={handleCloseModal}
        title={selectedAlat ? "Edit Alat" : "Tambah Alat"}
      >
        <AlatForm 
          initialData={selectedAlat}
          onSubmit={selectedAlat ? handleEditAlat : handleCreateAlat}
          onCancel={handleCloseModal}
          loading={loading}
        />
      </Modal>
      
      {/* Modal Detail Alat */}
      <Modal 
        isOpen={alatDetailModalOpen}
        onClose={() => setAlatDetailModalOpen(false)}
        title="Detail Alat"
      >
        {alatDetail && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{alatDetail.nama}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Total Stok:</span>
                  <span className="ml-2 text-gray-900">{alatDetail.stok}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kondisi Umum:</span>
                  <span className="ml-2 text-gray-900">{alatDetail.kondisi}</span>
                </div>
              </div>
            </div>
            
            {/* Riwayat Peminjaman */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <FaHistory className="mr-2" />
                Riwayat Peminjaman Terakhir
              </h4>
              {alatDetail.riwayatPeminjaman && alatDetail.riwayatPeminjaman.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Kembali</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {alatDetail.riwayatPeminjaman.map((peminjaman, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{peminjaman.user?.nama || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{peminjaman.user?.kelas || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {peminjaman.tanggalPengembalian ? 
                              new Date(peminjaman.tanggalPengembalian).toLocaleDateString('id-ID') : 
                              '-'
                            }
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {peminjaman.kondisiPengembalian || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Belum ada riwayat peminjaman untuk alat ini
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal Konfirmasi Umum */}
      <Modal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
        title={confirmModal.title}
      >
        <div className="text-center">
          <div className="mb-4">
            {confirmModal.icon}
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{confirmModal.title}</h3>
          <p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setConfirmModal({...confirmModal, isOpen: false})}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {confirmModal.cancelText}
          </button>
          <button
            type="button"
            onClick={confirmModal.onConfirm}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {confirmModal.confirmText}
          </button>
        </div>
      </Modal>
      
      {/* Modal Pengembalian */}
      <Modal 
        isOpen={returnModal.isOpen}
        onClose={() => setReturnModal({...returnModal, isOpen: false})}
        title="Konfirmasi Pengembalian"
      >
        <div className="text-center">
          <div className="mb-4">
            <FaQuestionCircle className="mx-auto h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Konfirmasi Pengembalian</h3>
          <p className="text-sm text-gray-500 mb-6">Apakah Anda sudah memeriksa kondisi alat saat dikembalikan?</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">Kondisi Alat</label>
          <select
            id="condition"
            name="condition"
            value={returnModal.condition}
            onChange={(e) => setReturnModal({...returnModal, condition: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Pilih Kondisi --</option>
            <option value="baik">Baik</option>
            <option value="kurang">Kurang</option>
            <option value="rusak berat">Rusak Berat</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setReturnModal({...returnModal, isOpen: false})}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmReturn}
            disabled={!returnModal.condition}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  );
}