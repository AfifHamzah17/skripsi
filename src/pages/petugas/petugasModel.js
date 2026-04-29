// src/pages/petugas/petugasModel.js
import { getAllPeminjaman, updatePeminjamanStatus, getAllAlat, deletePeminjaman } from '../models/peminjaman-model';
import { getAllUsers } from '../auth/authModel';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const API = () => import.meta.env.VITE_API_BASE;

const safeJson = async (response) => {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error(`Server error (${response.status})`);
  return response.json();
};

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
};

const jsonHeader = () => ({ 'Content-Type': 'application/json', ...authHeader() });

export const petugasModel = {
  getInitialData: async () => {
    try {
      const base = await API();
      const [peminjamanRes, alatRes, usersRes, teachersRes] = await Promise.all([
        getAllPeminjaman(),
        getAllAlat(),
        getAllUsers(),
        fetch(base + '/teachers', { headers: authHeader() }).then(r => safeJson(r)).catch(() => ({ teachers: [] }))
      ]);
      return {
        peminjamans: peminjamanRes.error ? [] : peminjamanRes.result,
        alats: alatRes.error ? [] : alatRes.result,
        guruList: usersRes.error ? [] : (usersRes.users || usersRes.result || []),
        teachers: teachersRes.teachers || teachersRes.result || teachersRes || [],
      };
    } catch (error) { throw new Error('Gagal mengambil data awal'); }
  },

  returnPeminjaman: async (id, condition, buktiGambar = null) => {
    try {
      const base = await API();
      console.log('[MODEL] returnPeminjaman endpoint:', base + '/peminjaman/' + id + '/return-condition');
      const response = await fetch(base + '/peminjaman/' + id + '/return-condition', {
        method: 'PUT',
        headers: jsonHeader(),
        body: JSON.stringify({ condition, buktiGambar }),
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal memproses pengembalian');
      return data;
    } catch (error) {
      console.error('[MODEL] returnPeminjaman error:', error);
      return { error: true, message: error.message };
    }
  },

  approvePeminjaman: (id) => updatePeminjamanStatus(id, 'disetujui'),
  rejectPeminjaman: (id) => updatePeminjamanStatus(id, 'ditolak'),
  deletePeminjamanData: (id) => deletePeminjaman(id),

  editPeminjamanData: async (id, data) => {
    try {
      const base = await API();
      const response = await fetch(base + '/peminjaman/' + id, { method: 'PUT', headers: jsonHeader(), body: JSON.stringify(data) });
      const res = await safeJson(response);
      if (!response.ok) throw new Error(res.message || 'Gagal mengupdate');
      return res;
    } catch (error) { return { error: true, message: error.message }; }
  },

  addAlat: async (alatData, imageFile = null) => {
    try {
      const base = await API();
      const formData = new FormData();
      Object.keys(alatData).forEach(key => { if (key !== 'gambar' && alatData[key] !== null && alatData[key] !== undefined) formData.append(key, alatData[key]); });
      if (imageFile) formData.append('gambar', imageFile);
      const response = await fetch(base + '/alat', { method: 'POST', headers: authHeader(), body: formData });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal menambah alat');
      return data;
    } catch (error) { return { error: true, message: error.message }; }
  },

  editAlat: async (id, alatData, imageFile = null) => {
    try {
      const base = await API();
      const formData = new FormData();
      Object.keys(alatData).forEach(key => { if (key !== 'gambar' && alatData[key] !== null && alatData[key] !== undefined) formData.append(key, alatData[key]); });
      if (imageFile) formData.append('gambar', imageFile);
      const response = await fetch(base + '/alat/' + id, { method: 'PUT', headers: authHeader(), body: formData });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal mengupdate alat');
      return data;
    } catch (error) { return { error: true, message: error.message }; }
  },

  removeAlat: async (id) => {
    try {
      const base = await API();
      const response = await fetch(base + '/alat/' + id, { method: 'DELETE', headers: authHeader() });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal menghapus alat');
      return data;
    } catch (error) { return { error: true, message: error.message }; }
  },

  getAlatDetail: async (id) => {
    try {
      const base = await API();
      const response = await fetch(base + '/alat/' + id + '/detail', { headers: authHeader() });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal mengambil detail');
      return data;
    } catch (error) { return { error: true, message: error.message }; }
  },

  getAlatTracking: async (id) => {
    try {
      const base = await API();
      const response = await fetch(base + '/alat/' + id + '/tracking', { headers: authHeader() });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal mengambil tracking');
      return data;
    } catch (error) { return { error: true, message: error.message }; }
  },

  resetUserPassword: async (userId, newPassword) => {
    try {
      const base = await API();
      const response = await fetch(base + '/users/' + userId + '/reset-password', { method: 'POST', headers: jsonHeader(), body: JSON.stringify({ newPassword }) });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || 'Gagal mereset password');
      return data;
    } catch (error) { return { error: true, message: error.message }; }
  },

  deleteUser: async (userId) => {
    try {
      const base = await API();
      const headers = authHeader();
      const r1 = await fetch(base + '/users/' + userId, { method: 'DELETE', headers });
      if (!r1.ok) { const d = await safeJson(r1); throw new Error(d.message || 'Gagal menghapus user'); }
      await fetch(base + '/teachers/user/' + userId, { method: 'DELETE', headers }).catch(() => {});
      return { success: true };
    } catch (error) { return { error: true, message: error.message }; }
  },

 createUser: async (userData) => {
    try {
      const base = await API();
      const userRes = await fetch(base + '/users', { method: 'POST', headers: jsonHeader(), body: JSON.stringify(userData) });
      const userDataRes = await safeJson(userRes);
      if (!userRes.ok) throw new Error(userDataRes.message);
      if (userData.role === 'guru') {
        const newId = userDataRes.result?.id;
        if (newId) {
          const ct = await fetch(base + '/teachers/user/' + newId, { headers: authHeader() });
          if (ct.ok) {
            const td = await safeJson(ct);
            if (td.teacher) await fetch(base + '/teachers/' + td.teacher.id, { method: 'PUT', headers: jsonHeader(), body: JSON.stringify({ mapel: userData.mapel, updatedAt: new Date().toISOString() }) }).catch(() => {});
          } else await fetch(base + '/teachers', { method: 'POST', headers: jsonHeader(), body: JSON.stringify({ userId: newId, mapel: userData.mapel, createdAt: new Date().toISOString() }) }).catch(() => {});
        }
      }
      return userDataRes;
    } catch (error) { return { error: true, message: error.message }; }
  },

  updateUser: async (userId, userData) => {
    try {
      const base = await API();
      const userRes = await fetch(base + '/users/' + userId, { method: 'PUT', headers: jsonHeader(), body: JSON.stringify(userData) });
      const userDataRes = await safeJson(userRes);
      if (!userRes.ok) throw new Error(userDataRes.message);
      if (userData.role === 'guru') {
        const ct = await fetch(base + '/teachers/user/' + userId, { headers: authHeader() });
        if (ct.ok) {
          const td = await safeJson(ct);
          if (td.teacher) await fetch(base + '/teachers/' + td.teacher.id, { method: 'PUT', headers: jsonHeader(), body: JSON.stringify({ mapel: userData.mapel, updatedAt: new Date().toISOString() }) }).catch(() => {});
        } else await fetch(base + '/teachers', { method: 'POST', headers: jsonHeader(), body: JSON.stringify({ userId, mapel: userData.mapel, createdAt: new Date().toISOString() }) }).catch(() => {});
      }
      return userDataRes;
    } catch (error) { return { error: true, message: error.message }; }
  },

  exportToExcel: async (filteredPeminjamans, guruList, alats) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Laporan Transaksi');
      ws.columns = [
        { header: 'No', key: 'no', width: 5 }, { header: 'Nama Siswa', key: 'namaSiswa', width: 22 }, { header: 'Kelas', key: 'kelas', width: 15 },
        { header: 'Nama Alat', key: 'namaAlat', width: 22 }, { header: 'Jumlah', key: 'jumlah', width: 8 }, { header: 'Guru Pendamping', key: 'namaGuru', width: 22 },
        { header: 'Mapel', key: 'mapel', width: 18 }, { header: 'Tgl Pinjam', key: 'tglPinjam', width: 15 }, { header: 'Tgl Kembali', key: 'tglKembali', width: 15 },
        { header: 'Kondisi', key: 'kondisi', width: 12 }, { header: 'Status', key: 'status', width: 12 },
      ];
      filteredPeminjamans.forEach((item, index) => {
        const guruInfo = item.guru || guruList.find(g => g.id === item.guruId);
        const alatInfo = item.alat || alats.find(a => a.id === item.alatId);
        ws.addRow({ no: index + 1, namaSiswa: item.user?.nama || '-', kelas: item.user?.kelas || '-', namaAlat: alatInfo?.nama || '-', jumlah: item.jumlah, namaGuru: guruInfo?.nama || '-', mapel: Array.isArray(item.mapel) ? item.mapel.join(', ') : (item.mapel || '-'), tglPinjam: item.tanggalPeminjaman ? new Date(item.tanggalPeminjaman).toLocaleDateString('id-ID') : '-', tglKembali: item.tanggalPengembalian ? new Date(item.tanggalPengembalian).toLocaleDateString('id-ID') : '-', kondisi: item.kondisiPengembalian || '-', status: item.status });
      });
      const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      ws.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; cell.border = thinBorder; });
      ws.eachRow((row, rn) => { if (rn > 1) row.eachCell((cell) => { cell.border = thinBorder; cell.alignment = { vertical: 'middle' }; }); });
      const footerRow = ws.addRow({ no: '', namaSiswa: 'TOTAL DATA', kelas: '', namaAlat: '', jumlah: filteredPeminjamans.length, namaGuru: 'TRANSAKSI', mapel: '', tglPinjam: '', tglKembali: '', kondisi: '', status: '' });
      footerRow.eachCell((cell) => { cell.font = { bold: true, size: 11 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } }; cell.border = thinBorder; });
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Laporan_Peminjaman_${new Date().toISOString().slice(0, 10)}.xlsx`);
      return { success: true };
    } catch (error) { return { success: false, error: 'Gagal mengunduh laporan' }; }
  },
};