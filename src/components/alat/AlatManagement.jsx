// src/components/alat/AlatManagement.jsx
import React, { useState, useEffect } from 'react';
import { FaBox, FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaChartBar } from 'react-icons/fa';
import { getAllAlat, createAlat, updateAlat, deleteAlat, getAlatStatistics, getAlatTracking } from '../models/alat-model';
import { toast } from 'sonner';
import AlatForm from './alatForm';
import AlatDetail from './AlatDetail';
import AlatCard from './AlatCard';
import AlatStatistics from './AlatStatistics';
import Modal from '../modal'; // Import your Modal component

const AlatManagement = () => {
  const [alats, setAlats] = useState([]);
  const [filteredAlats, setFilteredAlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // NEW: separate loading state for form submission
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statistics, setStatistics] = useState(null);

  const categories = [
    'Elektronik',
    'Komputer',
    'Jaringan',
    'Peralatan',
    'Bahan',
    'Lainnya'
  ];

  const stockStatusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'terbatas', label: 'Terbatas' },
    { value: 'habis', label: 'Habis' }
  ];

  // Fetch alat data
  const fetchAlats = async () => {
    try {
      setLoading(true);
      const response = await getAllAlat(searchTerm, selectedCategory, selectedStatus);
      
      if (response.error) {
        console.error('Error fetching alats:', response.message);
        toast.error('Gagal memuat data alat');
      } else {
        setAlats(response.result || []);
        setFilteredAlats(response.result || []);
      }
    } catch (error) {
      console.error('Error in fetchAlats:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CREATE ALAT ====================
  const handleCreateAlat = async (formData, imageFile, removeImage) => {
    try {
      setSubmitting(true);
      
      const data = new FormData();
      data.append('nama', formData.nama);
      data.append('merek', formData.merek);
      data.append('stok', formData.stok.toString());
      data.append('kategori', formData.kategori);
      data.append('deskripsi', formData.deskripsi || '');
      
      if (imageFile) {
        data.append('gambar', imageFile);
      }
      
      const response = await createAlat(data);
      
      if (response.error) {
        toast.error(response.message || 'Gagal menambahkan alat');
      } else {
        toast.success('Alat berhasil ditambahkan');
        handleFormClose();
      }
    } catch (error) {
      console.error('Error creating alat:', error);
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== EDIT ALAT ====================
  const handleEditAlat = async (formData, imageFile, removeImage) => {
    try {
      setSubmitting(true);
      
      const data = new FormData();
      data.append('nama', formData.nama);
      data.append('merek', formData.merek);
      data.append('stok', formData.stok.toString());
      data.append('kategori', formData.kategori);
      data.append('deskripsi', formData.deskripsi || '');
      
      // Add new image if selected
      if (imageFile) {
        data.append('gambar', imageFile);
      }
      
      // Add removeImage flag if user clicked X button
      if (removeImage) {
        data.append('removeImage', 'true');
      }
      
      const response = await updateAlat(formData.id, data);
      
      if (response.error) {
        toast.error(response.message || 'Gagal memperbarui alat');
      } else {
        toast.success('Alat berhasil diperbarui');
        handleFormClose();
      }
    } catch (error) {
      console.error('Error updating alat:', error);
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete alat
  const handleDeleteAlat = async (alatId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus alat ini?')) {
      try {
        const response = await deleteAlat(alatId);
        
        if (response.error) {
          toast.error(response.message || 'Gagal menghapus alat');
        } else {
          toast.success('Alat berhasil dihapus');
          fetchAlats();
        }
      } catch (error) {
        console.error('Error deleting alat:', error);
        toast.error('Terjadi kesalahan saat menghapus alat');
      }
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAlat(null);
    fetchAlats(); // Refresh list after close
  };

  // Handle add alat
  const handleAddAlat = () => {
    setSelectedAlat(null);
    setShowForm(true);
  };

  // Handle edit alat
  const handleEditClick = (alat) => {
    setSelectedAlat(alat);
    setShowForm(true);
  };

  // Handle view alat
  const handleViewAlat = (alat) => {
    setSelectedAlat(alat);
    setShowDetail(true);
  };

  // Handle detail close
  const handleDetailClose = () => {
    setShowDetail(false);
    setSelectedAlat(null);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchAlats();
  }, [searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Alat</h1>
          <p className="text-sm text-gray-600">Kelola inventaris alat laboratorium</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStatistics(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <FaChartBar className="mr-2" />
            Statistik
          </button>
          <button
            onClick={handleAddAlat}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Tambah Alat
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari alat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {stockStatusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={resetFilters}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Alat Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAlats.length === 0 ? (
        <div className="text-center py-12">
          <FaBox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data alat</h3>
          <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan alat baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlats.map(alat => (
            <AlatCard
              key={alat.id}
              alat={alat}
              onEdit={() => handleEditClick(alat)}
              onDelete={() => handleDeleteAlat(alat.id)}
              onView={() => handleViewAlat(alat)}
            />
          ))}
        </div>
      )}

      {/* ==================== MODAL: Add/Edit Alat Form ==================== */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={handleFormClose}
          title={selectedAlat ? "Edit Alat" : "Tambah Alat Baru"}
          size="xl"
        >
          <AlatForm
            initialData={selectedAlat}      
            onSubmit={selectedAlat ? handleEditAlat : handleCreateAlat}  
            onCancel={handleFormClose}     
            loading={submitting}              
          />
        </Modal>
      )}

      {/* Modal: Detail Alat */}
      {showDetail && (
        <Modal
          isOpen={showDetail}
          onClose={handleDetailClose}
          title="Detail Alat"
          size="xl"
        >
          <AlatDetail
            alat={selectedAlat}
            onClose={handleDetailClose}
          />
        </Modal>
      )}

      {/* Modal: Statistics */}
      {showStatistics && (
        <Modal
          isOpen={showStatistics}
          onClose={() => setShowStatistics(false)}
          title="Statistik Alat"
          size="xl"
        >
          <AlatStatistics
            statistics={statistics}
            onClose={() => setShowStatistics(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default AlatManagement;