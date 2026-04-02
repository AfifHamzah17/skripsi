// src/pages/siswa/siswaModel.js
import { getAlat } from '../models/alat-model';
import { createPeminjaman, getMyPeminjaman } from '../models/peminjaman-model';

export const DAFTAR_MAPEL = [
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
  'Teknik Komputer dan Jaringan',
];

export const fetchAlats = async () => {
  const response = await getAlat();
  return response;
};

export const fetchMyPeminjaman = async () => {
  const response = await getMyPeminjaman();
  return response;
};

export const submitPeminjaman = async (data) => {
  const response = await createPeminjaman(data);
  return response;
};

// ========== Cancel Peminjaman ==========
export const cancelPeminjaman = async (peminjamanId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(import.meta.env.VITE_API_BASE + '/peminjaman/' + peminjamanId + '/batal', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal membatalkan peminjaman');
  }
  return data;
};
// ========================================

// ========== Fetch Guru By Mapel ==========
export const fetchGuruByMapel = async (mapel) => {
  const token = localStorage.getItem('token');
  const response = await fetch(import.meta.env.VITE_API_BASE + '/teachers/mapel/' + mapel, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch teachers: ${response.status}`);
  }

  const data = await response.json();
  return data.result || [];
};
// ========================================

export const processPeminjamanData = (peminjamanData, alatsData) => {
  if (!peminjamanData) {
    return [];
  }

  return peminjamanData.map((p) => {
    const alatDetail = alatsData?.find((a) => a.id === p.alatId);
    return {
      ...p,
      alat: alatDetail || null,
    };
  });
};

export const calculateStats = (alats, peminjamans) => ({
  totalAlat: alats.length,
  availableAlat: alats.filter((a) => a.stok > 0).length,
  pendingPeminjaman: peminjamans.filter((p) => p.status === 'pending').length,
  approvedPeminjaman: peminjamans.filter((p) => p.status === 'disetujui').length,
});

export const filterAlats = (alats, searchTerm, category) => {
  return alats.filter((alat) => {
    const matchesSearch = alat?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || alat?.kategori === category;
    return matchesSearch && matchesCategory;
  });
};

export const filterPeminjamans = (peminjamans, searchTerm, statusFilter) => peminjamans.filter((peminjaman) => {
  const matchesSearch = peminjaman.alat?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    || peminjaman.mapel.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === 'all' || peminjaman.status === statusFilter;
  return matchesSearch && matchesStatus;
});