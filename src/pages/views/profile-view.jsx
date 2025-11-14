// src/pages/views/profile-view.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaUser, FaBook, FaSave, FaArrowLeft, FaEdit, FaCheck } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

// const API_BASE = 'http://localhost:3000/api';
const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app/api';
export default function ProfileView({ guruId }) {
  const { user, mapelData, refreshMapelData } = useAuth();
  const [selectedMapel, setSelectedMapel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [availableMapel, setAvailableMapel] = useState([]);
  const [guruData, setGuruData] = useState(null);
  const [fetchingGuru, setFetchingGuru] = useState(false);
  
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

  // Fetch guru data if guruId is provided
  useEffect(() => {
    if (guruId) {
      fetchGuruData();
    }
  }, [guruId]);

  const fetchGuruData = async () => {
    setFetchingGuru(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/teachers/${guruId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuruData(data.result);
        
        // Set selected mapel dari data guru
        if (data.result && data.result.mapel) {
          setSelectedMapel(data.result.mapel);
        }
      } else {
        toast.error('Gagal mengambil data guru');
      }
    } catch (error) {
      console.error('Error fetching guru data:', error);
      toast.error('Terjadi kesalahan saat mengambil data guru');
    } finally {
      setFetchingGuru(false);
    }
  };

  useEffect(() => {
    // Set selected mapel dari data yang sudah ada
    if (!guruId && mapelData && mapelData.length > 0) {
      setSelectedMapel(mapelData);
    }
  }, [mapelData, guruId]);

  useEffect(() => {
    // Filter mapel yang sudah dipilih
    const filteredMapel = daftarMapel.filter(mapel => !selectedMapel.includes(mapel));
    setAvailableMapel(filteredMapel);
  }, [selectedMapel]);

  const handleMapelChange = (mapel) => {
    if (selectedMapel.includes(mapel)) {
      // Hapus mapel dari pilihan jika sudah ada
      setSelectedMapel(selectedMapel.filter(item => item !== mapel));
    } else {
      // Tambahkan mapel ke pilihan
      setSelectedMapel([...selectedMapel, mapel]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMapel.length === 0) {
      setError('Pilih minimal satu mata pelajaran');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Determine which endpoint to use
      const endpoint = guruId 
        ? `${API_BASE}/teachers/${guruId}` 
        : `${API_BASE}/teachers/mapel`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mapel: selectedMapel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan mapel');
      }

      toast.success('Mapel berhasil diperbarui!');
      
      // Refresh data mapel di AuthContext
      await refreshMapelData();
      
      // If we're editing another guru, refresh their data
      if (guruId) {
        await fetchGuruData();
      }
      
      // Kembali ke mode view
      setIsEditing(false);
      
      // Redirect ke halaman utama setelah berhasil menyimpan
      setTimeout(() => {
        if (guruId) {
          window.location.hash = '#/petugas';
        } else {
          window.location.hash = '#/guru';
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Kembalikan selected mapel ke data asli
    if (guruId && guruData && guruData.mapel) {
      setSelectedMapel(guruData.mapel);
    } else {
      setSelectedMapel(mapelData || []);
    }
    setIsEditing(false);
  };

  // Determine if the current user can edit
  const canEdit = user?.role === 'guru' && !guruId || 
                 user?.role === 'petugas' && guruId;

  // Display data based on whether we're viewing own profile or another guru's
  const displayData = guruId ? guruData : user;

  // Only guru and petugas can access this page
  if (user?.role !== 'guru' && user?.role !== 'petugas') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <FaUser className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {guruId ? 'Profile Guru' : 'Profile Saya'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Informasi profile dan mata pelajaran yang diajar
          </p>
        </div>

        {fetchingGuru ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informasi Guru */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Informasi Guru</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{displayData?.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{displayData?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NIP:</span>
                  <span className="font-medium">{displayData?.nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No. HP:</span>
                  <span className="font-medium">{displayData?.nohp}</span>
                </div>
              </div>
            </div>

            {/* Mata Pelajaran */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Mata Pelajaran</h2>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      {daftarMapel.map((mapel) => (
                        <div key={mapel} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`mapel-${mapel}`}
                            checked={selectedMapel.includes(mapel)}
                            onChange={() => handleMapelChange(mapel)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`mapel-${mapel}`} className="ml-2 block text-sm text-gray-700">
                            {mapel}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Simpan
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {selectedMapel.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMapel.map((mapel, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                          {mapel}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Belum ada mata pelajaran yang dipilih</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-500"
          >
            <FaArrowLeft className="mr-1" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}