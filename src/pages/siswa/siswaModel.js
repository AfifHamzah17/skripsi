// src/pages/siswa/siswaModel.js
import { getAlat } from '../models/alat-model';
import { createPeminjaman, getMyPeminjaman } from '../models/peminjaman-model';

export const fetchAlats = async () => await getAlat();
export const fetchMyPeminjaman = async () => await getMyPeminjaman();
export const submitPeminjaman = async (data) => await createPeminjaman(data);

export const cancelPeminjaman = async (id) => {
  const r = await fetch(import.meta.env.VITE_API_BASE + '/peminjaman/' + id + '/batal', { method: 'PUT', headers: { Authorization: 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' } });
  const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Gagal'); return d;
};

export const fetchGuruByMapel = async (mapel) => {
  const r = await fetch(import.meta.env.VITE_API_BASE + '/teachers/mapel/' + mapel, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  if (!r.ok) throw new Error('Failed: ' + r.status);
  const d = await r.json(); return d.result || [];
};

export const processPeminjamanData = (data, alats) => data ? data.map(p => ({ ...p, alat: alats?.find(a => a.id === p.alatId) || null })) : [];

export const calculateStats = (alats, pinjam) => ({ totalAlat: alats.length, availableAlat: alats.filter(a => a.stok > 0).length, pendingPeminjaman: pinjam.filter(p => p.status === 'pending').length, approvedPeminjaman: pinjam.filter(p => p.status === 'disetujui').length });

export const filterAlats = (alats, q, cat) => alats.filter(a => a?.nama?.toLowerCase().includes(q.toLowerCase()) && (cat === 'all' || a?.kategori === cat));
export const filterPeminjamans = (pinjam, q, status) => pinjam.filter(p => (p.alat?.nama?.toLowerCase().includes(q.toLowerCase()) || p.mapel?.toLowerCase().includes(q.toLowerCase())) && (status === 'all' || p.status === status));

export const requestReturn = async (id, buktiPembelajaran) => {
  const r = await fetch(import.meta.env.VITE_API_BASE + '/peminjaman/' + id + '/request-return', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ buktiPembelajaran }),
  });
  const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Gagal'); return d;
};