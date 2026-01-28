import React, { useState, useEffect, useMemo } from 'react';
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
  getAlatDetail,
  editPeminjaman, // Tambah import edit
  deletePeminjaman // Tambah import delete
} from '../models/peminjaman-model';
import { getAllTeachers } from '../models/teacher-model';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrasi Komponen Chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  FaHistory,
  FaFileExcel
} from 'react-icons/fa';

// Import useAuth
import { useAuth } from '../../Context/AuthContext';

export default function PetugasView() {
  const { user, logout } = useAuth();
  const [peminjamans, setPeminjamans] = useState([]);
  const [alats, setAlats] = useState([]);
  const [guruList, setGuruList] = useState([]);
  
  // State laporan
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

  // State untuk modal detail guru
  const [guruDetailModalOpen, setGuruDetailModalOpen] = useState(false);
  const [guruDetail, setGuruDetail] = useState(null);

  // --- DATA PROCESSING UNTUK CHART ---
  const chartData = useMemo(() => {
    // 1. Frekuensi Guru (Praktik)
    const guruCounts = {};
    peminjamans.forEach(p => {
      const guruName = p.guru?.nama || (guruList.find(g => g.id === p.guruId)?.nama) || 'Unknown';
      guruCounts[guruName] = (guruCounts[guruName] || 0) + 1;
    });

    // 2. Mapel Terbanyak
    const mapelCounts = {};
    peminjamans.forEach(p => {
      const mapel = p.mapel || 'Lainnya';
      mapelCounts[mapel] = (mapelCounts[mapel] || 0) + 1;
    });

    // 3. Alat Paling Sering Dipinjam
    const alatCounts = {};
    peminjamans.forEach(p => {
      const alatName = p.alat?.nama || (alats.find(a => a.id === p.alatId)?.nama) || 'Unknown';
      alatCounts[alatName] = (alatCounts[alatName] || 0) + (p.jumlah || 0);
    });

    // 4. Kelas Paling Sering Meminjam
    const kelasCounts = {};
    peminjamans.forEach(p => {
      const kelas = p.user?.kelas || 'Umum';
      kelasCounts[kelas] = (kelasCounts[kelas] || 0) + 1;
    });

    return {
      guru: {
        labels: Object.keys(guruCounts),
        data: Object.values(guruCounts)
      },
      mapel: {
        labels: Object.keys(mapelCounts),
        data: Object.values(mapelCounts)
      },
      alat: {
        labels: Object.keys(alatCounts),
        data: Object.values(alatCounts)
      },
      kelas: {
        labels: Object.keys(kelasCounts),
        data: Object.values(kelasCounts)
      }
    };
  }, [peminjamans, guruList, alats]);

  // Chart Options Umum
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // Agar bisa diatur tingginya via CSS container
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

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
      const response = await getAllTeachers();
      if (response.error) {
        console.error('Error from API:', response.message);
      }
      return response;
    } catch (error) {
      console.error('Error fetching guru list:', error);
      return { error: true, message: 'Terjadi kesalahan' };
    }
  };

  // --- HANDLERS UNTUK AKSI (Edit & Delete Peminjaman) ---
  
  const handleDeletePeminjaman = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Peminjaman',
      message: 'Apakah Anda yakin ingin menghapus data transaksi ini? Tindakan ini akan menghapus riwayat permanen.',
      icon: <FaTrash className="mx-auto h-12 w-12 text-red-500" />,
      onConfirm: () => confirmDeletePeminjaman(id),
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });
  };

  const confirmDeletePeminjaman = async (id) => {
    try {
      const response = await deletePeminjaman(id);
      if (response.error) {
        setMessage(response.message);
        toast.error(response.message);
      } else {
        setMessage('Data peminjaman berhasil dihapus');
        toast.success('Data peminjaman berhasil dihapus');
        setPeminjamans(peminjamans.filter(p => p.id !== id));
        setStatistics(prev => ({
          ...prev,
          totalPeminjaman: prev.totalPeminjaman - 1
        }));
      }
    } catch (error) {
      setMessage('Gagal menghapus data');
      toast.error('Gagal menghapus data');
    } finally {
      setConfirmModal({...confirmModal, isOpen: false});
    }
  };

  const handleEditPeminjaman = (peminjaman) => {
    // Untuk sementara, kita gunakan prompt sederhana karena tidak ada komponen form khusus edit peminjaman di prompt awal.
    // Anda bisa mengembangkan ini menjadi Modal Form AlatPeminjamanForm jika perlu.
    const newJumlah = prompt(`Masukkan jumlah baru untuk ${peminjaman.alat?.nama}:`, peminjaman.jumlah);
    
    if (newJumlah && !isNaN(newJumlah)) {
      setConfirmModal({
        isOpen: true,
        title: 'Edit Peminjaman',
        message: `Ubah jumlah menjadi ${newJumlah}?`,
        icon: <FaEdit className="mx-auto h-12 w-12 text-blue-500" />,
        onConfirm: async () => {
          try {
            const response = await editPeminjaman(peminjaman.id, { jumlah: parseInt(newJumlah) });
            if (response.error) {
              toast.error(response.message);
            } else {
              toast.success('Data berhasil diperbarui');
              // Refresh data lokal
              setPeminjamans(peminjamans.map(p => p.id === peminjaman.id ? {...p, jumlah: parseInt(newJumlah)} : p));
            }
          } catch (error) {
            toast.error('Gagal mengedit data');
          } finally {
            setConfirmModal({...confirmModal, isOpen: false});
          }
        },
        confirmText: 'Simpan',
        cancelText: 'Batal'
      });
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
        setPeminjamans(peminjamans.map(p => 
          p.id === id ? {...p, status: 'disetujui'} : p
        ));
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
        setPeminjamans(peminjamans.map(p => 
          p.id === id ? {...p, status: 'ditolak'} : p
        ));
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
        setPeminjamans(peminjamans.map(p => 
          p.id === returnModal.peminjamanId ? {...p, status: 'kembali'} : p
        ));
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
      if (!selectedAlat || !selectedAlat.id) {
        throw new Error("ID alat tidak ditemukan");
      }
      
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
        setSelectedAlat(null);
        const alatData = await getAllAlat();
        if (!alatData.error) {
          setAlats(alatData.result);
        }
      }
    } catch (error) {
      console.error("Error updating alat:", error);
      setMessage('Gagal memperbarui alat: ' + error.message);
      toast.error('Gagal memperbarui alat: ' + error.message);
    }
  };

  const handleDeleteAlat = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Alat',
      message: 'Apakah Anda yakin ingin menghapus alat ini?',
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
    const guru = guruList.find(g => g.id === guruId);
    if (guru) {
      setGuruDetail(guru);
      setGuruDetailModalOpen(true);
    }
  };

  const exportToExcel = async (type) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Peminjaman Detail');
      
      worksheet.columns = [
        { header: 'Nama Siswa', key: 'namaSiswa', width: 25 },
        { header: 'Nama Alat', key: 'namaAlat', width: 25 },
        { header: 'Jumlah', key: 'jumlah', width: 10 },
        { header: 'Nama Guru', key: 'namaGuru', width: 25 },
        { header: 'NIP', key: 'nipGuru', width: 20 },
        { header: 'Mapel', key: 'mapel', width: 20 },
        { header: 'Tanggal Pinjam', key: 'tanggalPinjam', width: 20 },
        { header: 'Tanggal Kembali', key: 'tanggalKembali', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Kondisi', key: 'kondisi', width: 15 }
      ];
      
      peminjamans.forEach((item) => {
        const guruInfo = item.guru || guruList.find(g => g.id === item.guruId);
        const alatInfo = item.alat || alats.find(a => a.id === item.alatId);

        worksheet.addRow({
          namaSiswa: item.user?.nama || 'Tidak diketahui',
          namaAlat: alatInfo?.nama || 'Tidak diketahui',
          jumlah: item.jumlah,
          namaGuru: guruInfo?.nama || 'Tidak diketahui',
          nipGuru: guruInfo?.nip || '-',
          mapel: Array.isArray(item.mapel) ? item.mapel.join(', ') : item.mapel,
          tanggalPinjam: new Date(item.tanggalPeminjaman).toLocaleDateString('id-ID'),
          tanggalKembali: item.tanggalPengembalian 
            ? new Date(item.tanggalPengembalian).toLocaleDateString('id-ID') 
            : '-',
          status: item.status,
          kondisi: item.kondisiPengembalian || '-'
        });
      });
      
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4F81BD' }
        };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell) => {
            cell.font = { name: 'Times New Roman', size: 12 };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `Laporan_Analisa_Peminjaman_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success('Laporan detail berhasil diunduh');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Gagal mengunduh laporan');
    }
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Petugas</h1>
            
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
                  onClick={() => setActiveTab('laporan')}
                >
                  <FaChartBar className="mr-2" />
                  Analisa & Laporan
                </button>
              </nav>
            </div>

            {/* Tab: Dashboard (Sedikit disederhanakan agar fokus ke Analisa) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <DashboardGrid statistics={statistics} />
                {/* ... Dashboard content lainnya sama seperti sebelumnya ... */}
                 <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Alat dengan Stok Rendah</h3>
                      <Button onClick={handleAddAlat} className="flex items-center"><FaPlus className="mr-1" /> Tambah</Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Alat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {alats.filter(a => a.stok < 5).map(alat => (
                            <tr key={alat.id}>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{alat.nama}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{alat.stok}</td>
                              <td className="px-6 py-4 text-sm font-medium">
                                <button onClick={() => handleEditClick(alat)} className="text-blue-600 hover:text-blue-900 mr-2"><FaEdit /></button>
                                <button onClick={() => handleDeleteAlat(alat.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            )}

            {/* Tab: Peminjaman (Opsional: Fokus ke status Pending/Disetujui) */}
            {activeTab === 'peminjaman' && (
              <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Daftar Peminjaman Aktif</h2>
                  <Button onClick={handleRefreshData} className="flex items-center"><FaSync className="mr-2" /> Refresh</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {peminjamans.filter(p => ['pending', 'disetujui'].includes(p.status)).map(peminjaman => (
                        <tr key={peminjaman.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.user?.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peminjaman.alat?.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${peminjaman.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                              {peminjaman.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {peminjaman.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button onClick={() => handleApprove(peminjaman.id)} className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"><FaCheckCircle className="inline mr-1" />Setujui</button>
                                <button onClick={() => handleReject(peminjaman.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"><FaTimesCircle className="inline mr-1" />Tolak</button>
                              </div>
                            )}
                            {peminjaman.status === 'disetujui' && (
                              <button onClick={() => handleReturn(peminjaman.id)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"><FaArrowLeft className="inline mr-1" />Kembalikan</button>
                            )}
                          </td>
                        </tr>
                      ))}
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
            
            {/* 
               TAB LAPORAN BARU: ANALISA & CHART + FULL TABLE 
            */}
            {activeTab === 'laporan' && (
              <div className="space-y-8">
                {/* BAGIAN 1: ANALISA VISUAL (CHARTS) */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Analisa Praktik Siswa</h2>
                      <p className="text-sm text-gray-500">Monitoring frekuensi penggunaan alat per Guru, Mapel, dan Kelas.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Chart 1: Frekuensi Guru (Praktik) */}
                    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Frekuensi Praktik Guru</h3>
                      <div style={{ height: '250px' }}>
                        <Bar
                          data={{
                            labels: chartData.guru.labels,
                            datasets: [{
                              label: 'Jumlah Peminjaman',
                              data: chartData.guru.data,
                              backgroundColor: 'rgba(59, 130, 246, 0.6)',
                              borderColor: 'rgb(59, 130, 246)',
                              borderWidth: 1
                            }]
                          }}
                          options={commonOptions}
                        />
                      </div>
                    </div>

                    {/* Chart 2: Mapel Terbanyak */}
                    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Mapel Paling Aktif</h3>
                      <div style={{ height: '250px' }}>
                        <Doughnut
                          data={{
                            labels: chartData.mapel.labels,
                            datasets: [{
                              data: chartData.mapel.data,
                              backgroundColor: [
                                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                              ],
                            }]
                          }}
                          options={commonOptions}
                        />
                      </div>
                    </div>

                    {/* Chart 3: Alat Paling Sering Dipinjam */}
                    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Alat Paling Sering Dipinjam</h3>
                      <div style={{ height: '250px' }}>
                        <Bar
                          data={{
                            labels: chartData.alat.labels.slice(0, 10), // Top 10
                            datasets: [{
                              label: 'Total Peminjaman',
                              data: chartData.alat.data.slice(0, 10),
                              backgroundColor: 'rgba(16, 185, 129, 0.6)',
                              borderColor: 'rgb(16, 185, 129)',
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            ...commonOptions,
                            indexAxis: 'y', // Horizontal bar chart
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 4: Kelas Paling Sering Meminjam */}
                    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivitas per Kelas</h3>
                      <div style={{ height: '250px' }}>
                        <Bar
                          data={{
                            labels: chartData.kelas.labels,
                            datasets: [{
                              label: 'Jumlah Transaksi',
                              data: chartData.kelas.data,
                              backgroundColor: 'rgba(245, 158, 11, 0.6)',
                              borderColor: 'rgb(245, 158, 11)',
                              borderWidth: 1
                            }]
                          }}
                          options={commonOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* BAGIAN 2: TABEL DETAIL FULL WIDTH (DENGAN URUTAN BARU) */}
                <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-600">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Laporan Detail Transaksi</h2>
                      <p className="text-sm text-gray-500">Riwayat lengkap peminjaman alat laboratorium.</p>
                    </div>
                    <button
                      onClick={() => exportToExcel('detail')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaFileExcel className="mr-2" />
                      Export Excel
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {/* URUTAN BARU SESUAI REQUEST */}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Guru</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pinjam</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Kembali</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {peminjamans.length > 0 ? (
                          peminjamans.map((peminjaman, index) => {
                            const guruInfo = peminjaman.guru || guruList.find(g => g.id === peminjaman.guruId);
                            const alatInfo = peminjaman.alat || alats.find(a => a.id === peminjaman.alatId);

                            return (
                              <tr key={peminjaman.id || index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {peminjaman.user?.nama || 'Tidak diketahui'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {alatInfo?.nama || 'Tidak diketahui'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {peminjaman.jumlah}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {guruInfo?.nama || 'Tidak diketahui'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                                  {guruInfo?.nip || '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {Array.isArray(peminjaman.mapel) ? peminjaman.mapel.join(', ') : peminjaman.mapel}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {peminjaman.tanggalPengembalian 
                                    ? new Date(peminjaman.tanggalPengembalian).toLocaleDateString('id-ID') 
                                    : '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {peminjaman.kondisiPengembalian ? (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      peminjaman.kondisiPengembalian === 'baik' ? 'bg-green-100 text-green-800' : 
                                      peminjaman.kondisiPengembalian === 'rusak berat' ? 'bg-red-100 text-red-800' : 
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {peminjaman.kondisiPengembalian}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
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
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                  <button
                                    onClick={() => handleEditPeminjaman(peminjaman)}
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1 rounded mr-1"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePeminjaman(peminjaman.id)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1 rounded"
                                    title="Hapus"
                                  >
                                    <FaTrash />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="11" className="px-6 py-12 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center">
                                <FaChartBar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <p>Belum ada data transaksi.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-xs text-gray-500 text-right">
                    Total Data: {peminjamans.length} transaksi
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
         
      
      {/* Modal Detail Guru */}
      <Modal 
        isOpen={guruDetailModalOpen}
        onClose={() => setGuruDetailModalOpen(false)}
        title="Profile Guru"
      >
        {guruDetail && (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FaChalkboardTeacher className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{guruDetail.nama}</h2>
            <p className="text-gray-600 mb-6">NIP: {guruDetail.nip}</p>
            
            <div className="w-full space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Informasi Kontak</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-24">Email:</span>
                    <span className="text-gray-900">{guruDetail.email}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-24">No. HP:</span>
                    <span className="text-gray-900">{guruDetail.nohp}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mata Pelajaran</h3>
                <div className="flex flex-wrap gap-2">
                  {guruDetail.mapel && Array.isArray(guruDetail.mapel) && guruDetail.mapel.length > 0 ? (
                    guruDetail.mapel.map((mapel, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {mapel}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Belum ada mata pelajaran</span>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Statistik Peminjaman</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {peminjamans.filter(p => p.guruId === guruDetail.id).length}
                    </p>
                    <p className="text-sm text-gray-600">Total Peminjaman</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">
                      {peminjamans.filter(p => p.guruId === guruDetail.id && p.status === 'disetujui').length}
                    </p>
                    <p className="text-sm text-gray-600">Disetujui</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-yellow-600">
                      {peminjamans.filter(p => p.guruId === guruDetail.id && p.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600">Menunggu</p>
                  </div>
                </div>
              </div>
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