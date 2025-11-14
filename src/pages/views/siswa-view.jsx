// src/pages/views/siswa-view.jsx
import React, { useState, useEffect } from 'react';
import { getAlat } from '../models/alat-model';
import { createPeminjaman, getMyPeminjaman } from '../models/peminjaman-model';
import { FaTools, FaHistory, FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaFilter, FaImage } from 'react-icons/fa';
import { useAuth } from '../../Context/AuthContext';
import Modal from '../../components/modal';
import '../../style/siswa.css';

export default function SiswaView() {
  const { user } = useAuth();
  const [alats, setAlats] = useState([]);
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pinjam');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [gurus, setGurus] = useState([]);
  const [selectedGuru, setSelectedGuru] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Daftar mapel yang tersedia
  const daftarMapel = [
    'Kimia',
    'Fisika', 
    'Biologi',
    'Matematika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Teknik Elektro',
    'Teknik Mesin',
    'Teknik Sipil',
    'Akuntansi',
    'Administrasi Perkantoran',
    'Multimedia',
    'Rekayasa Perangkat Lunak',
    'Teknik Komputer dan Jaringan'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alatsData, peminjamanData] = await Promise.all([
          getAlat(),
          getMyPeminjaman()
        ]);
        
        if (alatsData.error) {
          setMessage(alatsData.message);
        } else {
          setAlats(alatsData.result);
        }
        
        if (peminjamanData.error) {
          setMessage(peminjamanData.message);
        } else {
          setPeminjamans(peminjamanData.result);
        }
      } catch (error) {
        setMessage('Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset form saat modal dibuka/tutup
  useEffect(() => {
    if (isModalOpen) {
      setSelectedMapel('');
      setGurus([]);
      setSelectedGuru('');
      setJumlah(1);
    }
  }, [isModalOpen]);

  // Fetch guru when mapel changes
  useEffect(() => {
    const fetchGuruByMapel = async () => {
      if (!selectedMapel) {
        setGurus([]);
        return;
      }

      console.log("=== FETCH GURU BY MAPEL DEBUG ===");
      console.log("Selected mapel:", selectedMapel);

      try {
        const token = localStorage.getItem('token');
        const url = `https://skripsi-api-995782183824.asia-southeast2.run.app/api/teachers/mapel/${selectedMapel}`;
        console.log("Fetching URL:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log("Response data:", data);
          setGurus(data.result || []);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch teachers by mapel. Status:', response.status);
          console.error('Error text:', errorText);
          setGurus([]);
        }
      } catch (error) {
        console.error('Error fetching teachers by mapel:', error);
        setGurus([]);
      }
    };

    fetchGuruByMapel();
  }, [selectedMapel]);

  const handlePinjamClick = (alat) => {
    setSelectedAlat(alat);
    setIsModalOpen(true);
  };

  const handleMapelChange = (e) => {
    setSelectedMapel(e.target.value);
    setSelectedGuru(''); // Reset guru selection when mapel changes
  };

  const handleGuruChange = (e) => {
    setSelectedGuru(e.target.value);
  };

  const handleJumlahChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= selectedAlat.stok) {
      setJumlah(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAlat || !selectedMapel || !selectedGuru || jumlah <= 0) {
      setMessage('Harap lengkapi semua field');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await createPeminjaman({
        alatId: selectedAlat.id,
        jumlah,
        mapel: selectedMapel,
        guruId: selectedGuru
      });
      
      if (response.error) {
        setMessage(response.message);
      } else {
        setMessage('Peminjaman berhasil diajukan');
        setIsModalOpen(false);
        setSelectedAlat(null);
        
        // Refresh data
        const [alatsData, peminjamanData] = await Promise.all([
          getAlat(),
          getMyPeminjaman()
        ]);
        
        if (!alatsData.error) setAlats(alatsData.result);
        if (!peminjamanData.error) setPeminjamans(peminjamanData.result);
      }
    } catch (error) {
      setMessage('Gagal melakukan peminjaman');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter data berdasarkan pencarian dan status
  const filteredAlats = alats.filter(alat => 
    alat.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPeminjamans = peminjamans.filter(peminjaman => {
    const matchesSearch = peminjaman.alat?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         peminjaman.mapel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || peminjaman.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistik dashboard
  const stats = {
    totalAlat: alats.length,
    availableAlat: alats.filter(a => a.stok > 0).length,
    pendingPeminjaman: peminjamans.filter(p => p.status === 'pending').length,
    approvedPeminjaman: peminjamans.filter(p => p.status === 'disetujui').length,
  };

  // Status badge component - SUDAH DIPERBAIKI
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="mr-1" />, text: 'Pending' },
      disetujui: { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="mr-1" />, text: 'Disetujui' },
      ditolak: { color: 'bg-red-100 text-red-800', icon: <FaTimesCircle className="mr-1" />, text: 'Ditolak' },
      dikembalikan: { color: 'bg-blue-100 text-blue-800', icon: <FaCheckCircle className="mr-1" />, text: 'Dikembalikan' },
      kembali: { color: 'bg-blue-100 text-blue-800', icon: <FaCheckCircle className="mr-1" />, text: 'Dikembalikan' }, // DITAMBAHKAN
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="siswa-dashboard">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
          <p className="mt-1 text-sm text-gray-500">Selamat datang di sistem peminjaman alat</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <FaTools className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Alat</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalAlat}</div>
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
                  <FaCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tersedia</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.availableAlat}</div>
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
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.pendingPeminjaman}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <FaCheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Disetujui</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.approvedPeminjaman}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className="mb-6 rounded-md bg-blue-50 p-4">
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pinjam' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('pinjam')}
            >
              <FaTools className="inline mr-2" />
              Pinjam Alat
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'riwayat' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('riwayat')}
            >
              <FaHistory className="inline mr-2" />
              Riwayat Peminjaman
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'pinjam' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Cari alat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Alat Cards Grid */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Alat Tersedia</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Pilih alat yang ingin dipinjam</p>
              </div>
              <div className="p-4">
                {filteredAlats.length > 0 ? (
                  <div className="alat-cards-grid">
                    {filteredAlats.map(alat => (
                      <div key={alat.id} className="alat-card">
                        <div className="alat-card-image">
                          {alat.gambar ? (
                            <img src={alat.gambar} alt={alat.nama} className="h-full w-full object-cover" />
                          ) : (
                            <FaImage className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <div className="alat-card-content">
                          <h3 className="alat-card-name">{alat.nama}</h3>
                          <p className="alat-card-stock">
                            Stok: <span className="alat-card-stock-value">{alat.stok}</span>
                          </p>
                          <div className="alat-card-footer">
                            <span className={`alat-card-status ${alat.stok > 0 ? 'available' : 'unavailable'}`}>
                              {alat.stok > 0 ? 'Tersedia' : 'Habis'}
                            </span>
                            <button
                              onClick={() => handlePinjamClick(alat)}
                              disabled={alat.stok <= 0}
                              className={`action-button primary ${alat.stok <= 0 ? 'disabled' : ''}`}
                            >
                              Pinjam
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Tidak ada alat yang tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'riwayat' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Cari peminjaman..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <FaFilter className="text-gray-400 mr-2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                    <option value="dikembalikan">Dikembalikan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Peminjaman List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Riwayat Peminjaman</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Daftar peminjaman yang pernah Anda ajukan</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alat</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPeminjamans.length > 0 ? (
                      filteredPeminjamans.map(peminjaman => (
                        <tr key={peminjaman.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{peminjaman.alat?.nama || 'Alat tidak diketahui'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{peminjaman.jumlah}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{peminjaman.mapel}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={peminjaman.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada riwayat peminjaman
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Peminjaman */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Peminjaman Alat"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alat</label>
            <div className="mt-1">
              <input
                type="text"
                readOnly
                value={selectedAlat?.nama || ''}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah</label>
            <div className="mt-1">
              <input
                type="number"
                min="1"
                max={selectedAlat?.stok || 1}
                value={jumlah}
                onChange={handleJumlahChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Stok tersedia: {selectedAlat?.stok || 0}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mapel</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {daftarMapel.map(mapel => (
                <div key={mapel} className="flex items-center">
                  <input
                    type="radio"
                    id={`mapel-${mapel}`}
                    name="mapel"
                    value={mapel}
                    checked={selectedMapel === mapel}
                    onChange={handleMapelChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`mapel-${mapel}`} className="ml-2 block text-sm text-gray-700">
                    {mapel}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {selectedMapel && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Guru</label>
              <div className="mt-1">
                {gurus.length > 0 ? (
                  <select
                    value={selectedGuru}
                    onChange={handleGuruChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                  >
                    <option value="" style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
                      Pilih guru
                    </option>
                    {gurus.map(guru => (
                      <option 
                        key={guru.id} 
                        value={guru.id}
                        style={{ 
                          backgroundColor: '#FFFFFF', 
                          color: '#000000',
                          WebkitTextFillColor: '#000000' // Untuk browser WebKit
                        }}
                      >
                        {guru.nama}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    {selectedMapel ? `Tidak ada guru untuk mapel ${selectedMapel}` : 'Pilih mapel terlebih dahulu'}
                  </div>
                )}
              </div>
            </div>
          )}

          {message && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {message}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedMapel || !selectedGuru}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Ajukan Peminjaman'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}