// src/pages/views/pilih-mapel-view.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaBook, FaSave, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function PilihMapelView() {
  const { user, refreshMapelData } = useAuth();
  const [selectedMapel, setSelectedMapel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableMapel, setAvailableMapel] = useState([]);
  
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
    // Filter mapel yang sudah dipilih
    const filteredMapel = daftarMapel.filter(mapel => !selectedMapel.includes(mapel));
    setAvailableMapel(filteredMapel);
  }, [selectedMapel]);

  const handleMapelChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedMapel(options);
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
      const response = await fetch(`${API_BASE}/teachers/mapel`, {
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

      toast.success('Mapel berhasil disimpan!');
      
      // Refresh data mapel di AuthContext
      await refreshMapelData();
      
      // Redirect ke dashboard guru
      window.location.hash = '#/guru';
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <FaBook className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Pilih Mata Pelajaran</h1>
          <p className="mt-2 text-sm text-gray-600">
            Selamat datang, {user?.nama}. Pilih mata pelajaran yang Anda ajarkan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="mapel" className="block text-sm font-medium text-gray-700">
              Mata Pelajaran
            </label>
            <div className="mt-1">
              <select
                id="mapel"
                multiple
                value={selectedMapel}
                onChange={handleMapelChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-48"
              >
                {availableMapel.map((mapel) => (
                  <option key={mapel} value={mapel}>
                    {mapel}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Tahan Ctrl/Cmd untuk memilih lebih dari satu mapel
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Simpan Pilihan
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.hash = '#/login';
            }}
            className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-500"
          >
            <FaArrowLeft className="mr-1" />
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}