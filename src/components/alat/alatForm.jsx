// src/components/alat/AlatForm.jsx
import React, { useState, useEffect } from 'react';

const AlatForm = ({ 
  initialData = null, 
  onSubmit, 
  loading = false,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    id: '',
    nama: '',
    merek: '',
    stok: 0,
    kategori: '',
    deskripsi: '',
    gambar: null
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  
  // NEW: Track original image URL from database (for edit mode)
  const [originalImage, setOriginalImage] = useState(null);
  // NEW: Track if user explicitly wants to remove the image
  const [removeImage, setRemoveImage] = useState(false);

  const categories = [
    'Elektronik',
    'Komputer',
    'Jaringan',
    'Peralatan',
    'Bahan',
    'Lainnya'
  ];

  useEffect(() => {
    if (initialData) {
      // EDIT MODE
      setFormData({
        id: initialData.id || '',
        nama: initialData.nama || '',
        merek: initialData.merek || '',
        stok: initialData.stok || 0,
        kategori: initialData.kategori || '',
        deskripsi: initialData.deskripsi || '',
        gambar: null // Always null for file input in edit mode
      });
      
      if (initialData.gambar) {
        setPreviewImage(initialData.gambar);
        setOriginalImage(initialData.gambar); // Store original image URL
      } else {
        setPreviewImage(null);
        setOriginalImage(null);
      }
      
      setRemoveImage(false); // Reset remove flag
    } else {
      // CREATE MODE - Reset everything
      setFormData({
        id: '',
        nama: '',
        merek: '',
        stok: 0,
        kategori: '',
        deskripsi: '',
        gambar: null
      });
      setPreviewImage(null);
      setOriginalImage(null);
      setRemoveImage(false);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Hanya file gambar yang diperbolehkan');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // Changed to 2MB to match backend
        setError('Ukuran file maksimal 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        gambar: file
      }));
      
      // NEW: Reset removeImage flag since user is uploading a new image
      setRemoveImage(false);
      setError('');
    }
  };

  // NEW: Handle remove image button click
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, gambar: null }));
    setRemoveImage(true); // Set flag to tell backend to delete the image
    
    // Reset file input
    const fileInput = document.getElementById('gambar-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama alat wajib diisi';
    }
    
    if (!formData.merek.trim()) {
      newErrors.merek = 'Merek alat wajib diisi';
    }
    
    if (!formData.stok || formData.stok < 0) {
      newErrors.stok = 'Stok tidak boleh negatif';
    }
    
    if (!formData.kategori) {
      newErrors.kategori = 'Kategori harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // NEW: Pass removeImage flag to parent
      onSubmit(formData, formData.gambar, removeImage);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (onCancel) {
      onCancel();
    }
  };

  // Determine image status for UI hints
  const imageStatus = {
    hasNewImage: formData.gambar !== null,
    hasOriginalImage: originalImage !== null,
    willRemoveImage: removeImage && !formData.gambar
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama */}
      <div>
        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Alat <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={(e) => handleChange('nama', e.target.value)}
          className={`w-full px-3 py-2 border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
          placeholder="Masukkan nama alat"
        />
        {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
      </div>

      {/* Merek */}
      <div>
        <label htmlFor="merek" className="block text-sm font-medium text-gray-700 mb-1">
          Merek <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="merek"
          name="merek"
          value={formData.merek}
          onChange={(e) => handleChange('merek', e.target.value)}
          className={`w-full px-3 py-2 border ${errors.merek ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
          placeholder="Masukkan merek alat"
        />
        {errors.merek && <p className="mt-1 text-sm text-red-600">{errors.merek}</p>}
      </div>

      {/* Stok */}
      <div>
        <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
          Stok <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="stok"
          name="stok"
          value={formData.stok}
          onChange={(e) => handleChange('stok', parseInt(e.target.value) || 0)}
          min="0"
          className={`w-full px-3 py-2 border ${errors.stok ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
          placeholder="Masukkan jumlah stok"
        />
        {errors.stok && <p className="mt-1 text-sm text-red-600">{errors.stok}</p>}
      </div>

      {/* Kategori */}
      <div>
        <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          id="kategori"
          name="kategori"
          value={formData.kategori}
          onChange={(e) => handleChange('kategori', e.target.value)}
          className={`w-full px-3 py-2 border ${errors.kategori ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="">Pilih kategori</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.kategori && <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>}
      </div>

      {/* Deskripsi */}
      <div>
        <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi <span style={{fontSize:11,color:'#9ca3af',fontWeight:400}}>({formData.deskripsi.length}/1000)</span>
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={(e) => {
            if (e.target.value.length > 1000) return;
            handleChange('deskripsi', e.target.value);
          }}
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan deskripsi alat (maks 1000 karakter)"
          style={{resize:'vertical'}}
        />
        {formData.deskripsi.length >= 950 && (
          <p style={{fontSize:11,color:formData.deskripsi.length >= 1000 ? '#ef4444' : '#f59e0b',margin:'4px 0 0'}}>
            {formData.deskripsi.length >= 1000 ? 'Batas maksimal tercapai' : `Sisa ${1000 - formData.deskripsi.length} karakter`}
          </p>
        )}
      </div>

      {/* Gambar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gambar Alat
        </label>
        <div className="space-y-2">
          {/* Preview Image */}
          {previewImage && (
            <div className="relative group">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity"
                title="Hapus gambar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Show indicator if this is a new image */}
              {imageStatus.hasNewImage && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Gambar baru
                </div>
              )}
            </div>
          )}
          
          {/* Show info when image will be removed */}
          {imageStatus.willRemoveImage && imageStatus.hasOriginalImage && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Gambar akan dihapus saat disimpan
            </div>
          )}

          {/* Upload Area */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600">
                {previewImage ? 'Ganti gambar' : 'Klik untuk upload gambar'}
              </span>
              <span className="text-xs text-gray-400 mt-1">Maks. 2MB</span>
              <input
                id="gambar-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Menyimpan...</span>
            </div>
          ) : (
            initialData ? 'Update Alat' : 'Tambah Alat'
          )}
        </button>
      </div>
    </form>
  );
};

export default AlatForm;