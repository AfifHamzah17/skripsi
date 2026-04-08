// src/pages/auth/presenter.jsx
import { loginUser, registerUser } from './authModel';

// ===================== PASSWORD STRENGTH =====================
export const calculatePasswordStrength = (password) => {
  if (!password) return { level: 'none', score: 0, label: '' };
  
  let score = 0;
  
  // Panjang
  if (password.length >= 8) score += 1;
  if (password.length >= 10) score += 1;
  
  // Karakter variety
  if (/[a-z]/.test(password)) score += 1;        // lowercase
  if (/[A-Z]/.test(password)) score += 1;        // uppercase
  if (/[0-9]/.test(password)) score += 1;        // angka
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // simbol
  
  if (score <= 2) return { level: 'weak', score, label: 'Lemah' };
  if (score <= 4) return { level: 'medium', score, label: 'Sedang' };
  return { level: 'strong', score, label: 'Kuat' };
};

// ===================== VALIDASI REGISTER =====================
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Nama
  if (!formData.nama?.trim()) {
    errors.nama = 'Nama lengkap harus diisi';
  }

  // Email
  if (!formData.email?.trim()) {
    errors.email = 'Email harus diisi';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Format email tidak valid';
  }

  // Password
  if (!formData.password) {
    errors.password = 'Password harus diisi';
  } else if (formData.password.length < 8) {
    errors.password = 'Password minimal 8 karakter';
  } else if (!/[A-Z]/.test(formData.password)) {
    errors.password = 'Password harus mengandung huruf besar';
  } else if (!/[\d\W]/.test(formData.password)) {
    errors.password = 'Password harus mengandung angka atau simbol';
  }

  // Confirm Password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password harus diisi';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Password tidak cocok';
  }

  // No HP
  if (!formData.nohp?.trim()) {
    errors.nohp = 'No. HP harus diisi';
  } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.nohp)) {
    errors.nohp = 'Format No. HP tidak valid';
  }

  // Role
  if (!formData.role) {
    errors.role = 'Role harus dipilih';
  }

  // Validasi khusus per role
  if (formData.role === 'siswa') {
    if (!formData.kelas?.trim()) {
      errors.kelas = 'Kelas harus diisi untuk siswa';
    }
    if (!formData.nisn?.trim()) {
      errors.nisn = 'NISN harus diisi untuk siswa';
    } else if (!/^\d{10}$/.test(formData.nisn)) {
      errors.nisn = 'NISN harus tepat 10 digit angka';
    }
  }

  if (formData.role === 'petugas' && !formData.posisi?.trim()) {
    errors.posisi = 'Posisi harus diisi untuk petugas';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===================== PREPARE DATA =====================
export const prepareRegisterData = (formData) => {
  const submitData = { ...formData };
  
  // Hapus field sementara (untuk compose kelas)
  delete submitData.tingkat;
  delete submitData.jurusan;
  delete submitData.nomor;
  
  // Hapus confirm password (tidak dikirim ke backend)
  delete submitData.confirmPassword;
  
  // Hapus field yang tidak sesuai role
  if (submitData.role !== 'siswa') {
    delete submitData.kelas;
    delete submitData.nisn;
  }
  if (submitData.role !== 'petugas') {
    delete submitData.posisi;
  }

  return submitData;
};

// ===================== HANDLERS =====================
export const handleRegister = async (formData, onSuccess, onError) => {
  try {
    const { error, message } = await registerUser(formData);
    if (!error) {
      onSuccess(message || 'Registrasi berhasil!');
    } else {
      onError(message);
    }
  } catch (e) {
    console.error('Registration error:', e);
    onError(e.message || 'Terjadi kesalahan saat registrasi');
  }
};

export const handleLogin = async (formData, onSuccess, onError) => {
  try {
    const { error, message, result } = await loginUser(formData);
    
    if (!error && result?.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result));
      onSuccess(result);
    } else {
      onError(message || 'Login gagal');
    }
  } catch (e) {
    console.error('Login error:', e);
    onError(e.message || 'Terjadi kesalahan saat login');
  }
};