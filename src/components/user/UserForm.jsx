// src/components/user/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const UserForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    nohp: '',
    role: 'siswa',
    kelas: '',
    jurusan: '', // Untuk menyimpan jurusan sementara
    tingkat: '', // Untuk menyimpan tingkat kelas (X, XI, XII)
    nomor: '', // Untuk menyimpan nomor kelas (1, 2, 3)
    nisn: '', // Tambah field NISN
    nip: '',
    mapel: [],
    posisi: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Parse kelas jika ada
      let jurusan = '';
      let tingkat = '';
      let nomor = '';
      
      if (initialData.kelas) {
        const kelasParts = initialData.kelas.split(' ');
        if (kelasParts.length === 3) {
          tingkat = kelasParts[0];
          jurusan = kelasParts[1];
          nomor = kelasParts[2];
        }
      }
      
      setFormData({
        nama: initialData.nama || '',
        email: initialData.email || '',
        password: '',
        nohp: initialData.nohp || '',
        role: initialData.role || 'siswa',
        kelas: initialData.kelas || '',
        jurusan,
        tingkat,
        nomor,
        nisn: initialData.nisn || '', // Tambah NISN
        nip: initialData.nip || '',
        mapel: Array.isArray(initialData.mapel) ? initialData.mapel : [],
        posisi: initialData.posisi || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'nisn') {
      console.log('NISN handleChange triggered. Value:', value);
      console.log('Current formData.nisn:', formData.nisn);
    }
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'mapel') {
      // Handle multiple mapel selection
      const currentMapel = Array.isArray(formData.mapel) ? formData.mapel : [];
      
      if (value === '') {
        setFormData(prev => ({ ...prev, [name]: [] }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: currentMapel.includes(value) 
            ? currentMapel.filter(item => item !== value)
            : [...currentMapel, value]
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Jika jurusan, tingkat, atau nomor berubah, update kelas
      if (name === 'jurusan' || name === 'tingkat' || name === 'nomor') {
        const newFormData = { ...formData, [name]: value };
        const { jurusan: j, tingkat: t, nomor: n } = newFormData;
        
        if (j && t && n) {
          newFormData.kelas = `${t} ${j} ${n}`;
        } else {
          newFormData.kelas = '';
        }
        
        setFormData(newFormData);
        return; // Return early to avoid setting the state twice
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!initialData && !formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password && !/^(?=.*[A-Z])(?=.*[\d\W]).{8,}$/.test(formData.password)) {
      newErrors.password = 'Password minimal 8 karakter, dengan huruf besar & angka/simbol';
    }

    if (!formData.nohp.trim()) {
      newErrors.nohp = 'No. HP harus diisi';
    }

    if (formData.role === 'siswa') {
      if (!formData.kelas.trim()) {
        newErrors.kelas = 'Kelas harus diisi untuk siswa';
      }
      if (!formData.nisn.trim()) {
        newErrors.nisn = 'NISN harus diisi untuk siswa';
      }
    }

    if (formData.role === 'guru' || formData.role === 'admin') {
      if (!formData.nip.trim()) {
        newErrors.nip = 'NIP harus diisi untuk guru/admin';
      }
    }

    if (formData.role === 'petugas') {
      if (!formData.posisi.trim()) {
        newErrors.posisi = 'Posisi harus diisi untuk petugas';
      }
    }

    if (formData.role === 'guru' && (!formData.mapel || formData.mapel.length === 0)) {
      newErrors.mapel = 'Pilih minimal satu mata pelajaran untuk guru';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      
      // Remove temporary fields
      delete submitData.jurusan;
      delete submitData.tingkat;
      delete submitData.nomor;
      
      // Remove empty fields based on role
      if (submitData.role !== 'siswa') {
        delete submitData.kelas;
        delete submitData.nisn;
      }
      if (submitData.role !== 'guru' && submitData.role !== 'admin') {
        delete submitData.nip;
        delete submitData.mapel;
      }
      if (submitData.role !== 'petugas') {
        delete submitData.posisi;
      }
      
      // Remove password if it's empty (for edit mode)
      if (!submitData.password) {
        delete submitData.password;
      }
      
      onSubmit(submitData);
    }
  };

  const mapelOptions = [
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Sejarah',
    'Geografi',
    'Ekonomi',
    'Sosiologi',
    'TIK',
    'Penjaskes',
    'Seni Budaya',
    'PKn',
    'Agama'
  ];

  const jurusanOptions = [
    { value: 'RPL', label: 'RPL' },
    { value: 'TKJ', label: 'TKJ' }
  ];

  const tingkatOptions = ['X', 'XI', 'XII'];
  const nomorOptions = ['1', '2', '3'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama */}
        <div className="md:col-span-2">
          <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.nama ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Masukkan nama lengkap"
          />
          {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contoh@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Password (hanya untuk tambah user) */}
        {!initialData && (
          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Minimal 8 karakter, huruf besar & angka/simbol"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
        )}

        {/* No. HP */}
        <div className="md:col-span-2">
          <label htmlFor="nohp" className="block text-sm font-medium text-gray-700 mb-1">
            No. HP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="nohp"
            name="nohp"
            value={formData.nohp}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.nohp ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="08xxxxxxxxxx"
          />
          {errors.nohp && <p className="mt-1 text-sm text-red-600">{errors.nohp}</p>}
        </div>

        {/* Role */}
        <div className="md:col-span-2">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="siswa">Siswa</option>
            <option value="guru">Guru</option>
            <option value="admin">Admin</option>
            <option value="petugas">Petugas</option>
          </select>
        </div>

        {/* Field khusus berdasarkan role */}
        {formData.role === 'siswa' && (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="tingkat" className="block text-xs text-gray-600 mb-1">Tingkat</label>
                  <select
                    id="tingkat"
                    name="tingkat"
                    value={formData.tingkat}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {tingkatOptions.map(tingkat => (
                      <option key={tingkat} value={tingkat}>{tingkat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="jurusan" className="block text-xs text-gray-600 mb-1">Jurusan</label>
                  <select
                    id="jurusan"
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {jurusanOptions.map(jurusan => (
                      <option key={jurusan.value} value={jurusan.value}>{jurusan.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="nomor" className="block text-xs text-gray-600 mb-1">Nomor</label>
                  <select
                    id="nomor"
                    name="nomor"
                    value={formData.nomor}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {nomorOptions.map(nomor => (
                      <option key={nomor} value={nomor}>{nomor}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {formData.kelas && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Kelas: </span>
                  <span className="text-sm font-medium text-blue-600">{formData.kelas}</span>
                </div>
              )}
              
              {errors.kelas && <p className="mt-1 text-sm text-red-600">{errors.kelas}</p>}
            </div>

            {/* NISN - TAMBAHKAN INI */}
            <div className="md:col-span-2">
              <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nisn"
                name="nisn"
                value={formData.nisn}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.nisn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan NISN (contoh: 1234567890)"
                maxLength="10" // NISN biasanya 10 digit
              />
              {errors.nisn && <p className="mt-1 text-sm text-red-600">{errors.nisn}</p>}
            </div>
          </>
        )}

        {(formData.role === 'guru' || formData.role === 'admin') && (
          <div className="md:col-span-2">
            <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">
              NIP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nip"
              name="nip"
              value={formData.nip}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.nip ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan NIP"
            />
            {errors.nip && <p className="mt-1 text-sm text-red-600">{errors.nip}</p>}
          </div>
        )}

        {formData.role === 'guru' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {mapelOptions.map(mapel => (
                <div key={mapel} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id={`mapel-${mapel}`}
                    name="mapel"
                    value={mapel}
                    checked={Array.isArray(formData.mapel) && formData.mapel.includes(mapel)}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`mapel-${mapel}`} className="text-sm text-gray-700 cursor-pointer">
                    {mapel}
                  </label>
                </div>
              ))}
            </div>
            {errors.mapel && <p className="mt-1 text-sm text-red-600">{errors.mapel}</p>}
          </div>
        )}

        {formData.role === 'petugas' && (
          <div className="md:col-span-2">
            <label htmlFor="posisi" className="block text-sm font-medium text-gray-700 mb-1">
              Posisi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="posisi"
              name="posisi"
              value={formData.posisi}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.posisi ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: Lab Komputer"
            />
            {errors.posisi && <p className="mt-1 text-sm text-red-600">{errors.posisi}</p>}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {initialData ? 'Update User' : 'Tambah User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;