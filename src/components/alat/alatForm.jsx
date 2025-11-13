// src/components/alat/AlatForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../input';
import Button from '../button';

const AlatForm = ({ 
  initialData = null, 
  onSubmit, 
  loading = false,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    id: '',
    nama: '',
    stok: 0,
    kondisi: ''
  });

  const [errors, setErrors] = useState({});

  // Pilihan kondisi alat
  const kondisiOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'kurang_baik', label: 'Kurang Baik' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        nama: initialData.nama || '',
        stok: initialData.stok || 0,
        kondisi: initialData.kondisi || ''
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama) {
      newErrors.nama = 'Nama alat wajib diisi';
    }
    
    if (formData.stok < 0) {
      newErrors.stok = 'Stok tidak boleh negatif';
    }
    
    if (!formData.kondisi) {
      newErrors.kondisi = 'Kondisi alat wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // MENCEGAH REFRESH HALAMAN
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Alat <span className="text-red-500">*</span>
        </label>
        <input
          id="nama"
          type="text"
          value={formData.nama}
          onChange={(e) => handleChange('nama', e.target.value)}
          className={`w-full px-4 py-2 border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors`}
          placeholder="Masukkan nama alat"
        />
        {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
      </div>
      
      <div>
        <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
          Stok <span className="text-red-500">*</span>
        </label>
        <input
          id="stok"
          type="number"
          min="0"
          value={formData.stok}
          onChange={(e) => handleChange('stok', parseInt(e.target.value) || 0)}
          className={`w-full px-4 py-2 border ${errors.stok ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors`}
          placeholder="Masukkan jumlah stok"
        />
        {errors.stok && <p className="mt-1 text-sm text-red-600">{errors.stok}</p>}
      </div>
      
      <div>
        <label htmlFor="kondisi" className="block text-sm font-medium text-gray-700 mb-1">
          Kondisi <span className="text-red-500">*</span>
        </label>
        <select
          id="kondisi"
          value={formData.kondisi}
          onChange={(e) => handleChange('kondisi', e.target.value)}
          className={`w-full px-4 py-2 border ${errors.kondisi ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white bg-no-repeat bg-right`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
          }}
        >
          <option value="">-- Pilih kondisi alat --</option>
          {kondisiOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.kondisi && <p className="mt-1 text-sm text-red-600">{errors.kondisi}</p>}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit" // Tetap gunakan type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
          ) : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

export default AlatForm;