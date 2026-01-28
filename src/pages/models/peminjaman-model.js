// src/pages/models/peminjaman-model.js
// const API_BASE = 'http://localhost:3000/api';
// const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app/api';
const API_BASE = import.meta.env.VITE_API_BASE;
// Fungsi untuk membuat peminjaman baru
export const createPeminjaman = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Fungsi untuk mendapatkan peminjaman berdasarkan guru
export const getPeminjamanByGuru = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/guru`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mendapatkan semua peminjaman
export const getAllPeminjaman = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mendapatkan peminjaman milik sendiri
export const getMyPeminjaman = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk memperbarui status peminjaman
export const updatePeminjamanStatus = async (id, status) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// Fungsi untuk mengembalikan alat
export const returnPeminjaman = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/${id}/return`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mengembalikan alat dengan kondisi
export const returnPeminjamanWithCondition = async (id, condition) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/${id}/return-condition`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ condition }),
  });
  return response.json();
};

// Fungsi untuk mendapatkan laporan berdasarkan guru
export const getLaporanGuru = async (startDate) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/laporan/guru?startDate=${startDate}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mendapatkan laporan berdasarkan kelas
export const getLaporanKelas = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/laporan/kelas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mendapatkan laporan berdasarkan alat
export const getLaporanAlat = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/laporan/alat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk menghapus alat
export const deleteAlat = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mendapatkan semua alat
export const getAllAlat = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mendapatkan detail alat (dengan riwayat peminjaman)
export const getAlatDetail = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat/${id}/detail`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk membuat alat baru
export const createAlat = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Fungsi untuk memperbarui alat
export const updateAlat = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Fungsi untuk menghapus peminjaman
export const deletePeminjaman = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fungsi untuk mengedit peminjaman (Update jumlah atau mapel)
export const editPeminjaman = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/peminjaman/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};