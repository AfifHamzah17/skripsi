const API_BASE = import.meta.env.VITE_API_BASE;

const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const finalOptions = {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
    ...options
  };
  try {
    const response = await fetch(`${API_BASE}${url}`, finalOptions);
    if (!response.ok) return { error: true, message: `Error ${response.status}: ${response.statusText}` };
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return { error: true, message: 'Server returned non-JSON response' };
    return await response.json();
  } catch (error) {
    return { error: true, message: 'Network error or invalid response', details: error.message };
  }
};

// ========== GURU API (dari teacher-model) ==========
export const getAllTeachers      = async ()                                      => await makeRequest('/teachers');
export const getTeacherById      = async (id)                                    => await makeRequest(`/teachers/${id}`);
export const getTeacherByUserId  = async (userId)                                => await makeRequest(`/teachers/user/${userId}`);
export const getTeacherByMapel   = async (mapel)                                 => await makeRequest(`/teachers/mapel/${mapel}`);
export const createTeacher       = async (data)                                  => await makeRequest('/teachers', { method: 'POST', body: JSON.stringify(data) });
export const updateTeacher       = async (id, data)                              => await makeRequest(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTeacher       = async (id)                                    => await makeRequest(`/teachers/${id}`, { method: 'DELETE' });
export const checkTeacherMapel   = async ()                                      => await makeRequest('/teachers/mapel');
export const saveTeacherMapel    = async (mapel)                                 => await makeRequest('/teachers/mapel', { method: 'POST', body: JSON.stringify({ mapel }) });

// ========== GURU MODEL CLASS ==========
import { getPeminjamanByGuru } from '../models/peminjaman-model';

export class GuruModel {

  async fetchPeminjaman() {
    try {
      const response = await getPeminjamanByGuru();
      if (response.error) return { success: false, data: null, message: response.message };
      return { success: true, data: response.result || [], message: '' };
    } catch (error) {
      return { success: false, data: null, message: 'Gagal mengambil data peminjaman' };
    }
  }

  calculateStatistics(data) {
    if (!data || data.length === 0) return { totalPeminjaman: 0, pending: 0, diproses: 0, selesai: 0, ditolak: 0, mapelStats: {} };
    const mapelStats = {};
    data.forEach(p => { if (p.mapel) mapelStats[p.mapel] = (mapelStats[p.mapel] || 0) + 1; });
    return {
      totalPeminjaman: data.length,
      pending:          data.filter(p => p.status === 'pending').length,
      diproses:         data.filter(p => p.status === 'disetujui').length,
      selesai:          data.filter(p => p.status === 'kembali').length,
      ditolak:          data.filter(p => p.status === 'ditolak').length,
      mapelStats
    };
  }

  filterByStatus(peminjamans, statusFilter) {
    if (statusFilter === 'all') return peminjamans;
    return peminjamans.filter(p => p.status === statusFilter);
  }

  prepareChartData(mapelStats) {
    return {
      labels:    Object.keys(mapelStats || {}),
      datasets:  [{
        label:           'Jumlah Peminjaman',
        data:            Object.values(mapelStats || {}),
        backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)', 'rgba(139,92,246,0.7)'],
        borderWidth: 1
      }]
    };
  }

  formatTanggal(dateStr)      { return dateStr ? new Date(dateStr).toLocaleDateString('id-ID') : '-'; }
  mapStatusLabel(status)      { return { pending: 'Menunggu', disetujui: 'Dipinjam', ditolak: 'Ditolak', kembali: 'Dikembalikan' }[status] || status; }
  getStatusBadgeClass(status) { return { pending: 'bg-yellow-100 text-yellow-800', disetujui: 'bg-green-100 text-green-800', ditolak: 'bg-red-100 text-red-800', kembali: 'bg-blue-100 text-blue-800' }[status] || 'bg-gray-100 text-gray-800'; }
  getKondisiBadgeClass(k)     { if (k === 'baik') return 'bg-green-100 text-green-800'; if (k === 'rusak berat') return 'bg-red-100 text-red-800'; return 'bg-yellow-100 text-yellow-800'; }
}