// src/pages/petugas/petugasPresenter.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';
import { petugasModel } from './petugasModel';
import PetugasView from './petugasView';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaSignOutAlt } from 'react-icons/fa';

const createImage = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener("load", () => resolve(image));
  image.addEventListener("error", reject);
  image.src = url;
});

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85); });
};

export default function PetugasPresenter() {
  const { user, logout } = useAuth();
  const [peminjamans, setPeminjamans] = useState([]);
  const [alats, setAlats] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [searchAlat, setSearchAlat] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchPeminjaman, setSearchPeminjaman] = useState('');
  const [filterStatusPeminjaman, setFilterStatusPeminjaman] = useState('all');
  const [searchGuru, setSearchGuru] = useState('');
  const [filterRoleGuru, setFilterRoleGuru] = useState('all');
  const [guruPage, setGuruPage] = useState(1);
  const [guruLimit, setGuruLimit] = useState(10);
  const [guruSort, setGuruSort] = useState({ key: null, dir: 'asc' });
  const [searchLaporan, setSearchLaporan] = useState('');
  const [filterStatusLaporan, setFilterStatusLaporan] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [laporanPage, setLaporanPage] = useState(1);
  const [laporanLimit, setLaporanLimit] = useState(10);
  const [laporanSort, setLaporanSort] = useState({ key: null, dir: 'asc' });

  const [alatModalOpen, setAlatModalOpen] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [alatDetailModalOpen, setAlatDetailModalOpen] = useState(false);
  const [alatDetail, setAlatDetail] = useState(null);
  const [alatTrackingModalOpen, setAlatTrackingModalOpen] = useState(false);
  const [alatTrackingData, setAlatTrackingData] = useState(null);
  const [guruDetailModalOpen, setGuruDetailModalOpen] = useState(false);
  const [guruDetail, setGuruDetail] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, user: null, newPassword: '', confirmPassword: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', icon: null, onConfirm: null, confirmText: 'Ya', cancelText: 'Batal' });
  const [returnModal, setReturnModal] = useState({ isOpen: false, peminjamanId: null, condition: '', buktiGambar: null });
  const [cropModal, setCropModal] = useState({ isOpen: false, imageSrc: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [editLaporanModal, setEditLaporanModal] = useState({ isOpen: false, data: null, jumlah: '', mapel: '', kondisiPengembalian: '' });  
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null });

  useEffect(() => {
    const handleHash = () => { const tab = window.location.hash.replace('#/', '').split('/')[1] || 'dashboard'; setActiveTab(['dashboard', 'peminjaman', 'alat', 'guru', 'laporan'].includes(tab) ? tab : 'dashboard'); };
    handleHash(); window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await petugasModel.getInitialData();
      setPeminjamans(data.peminjamans); setAlats(data.alats); setGuruList(data.guruList); setTeachers(data.teachers || []);
      setStatistics({ totalPeminjaman: data.peminjamans.length, pending: data.peminjamans.filter(p => p.status === 'pending').length, disetujui: data.peminjamans.filter(p => p.status === 'disetujui').length, kembali: data.peminjamans.filter(p => ['kembali', 'dikembalikan'].includes(p.status)).length });
    } catch { toast.error('Gagal mengambil data'); }
    finally { setLoading(false); }
  };

  const handleRefreshData = async () => { await loadData(); toast.success('Data berhasil diperbarui'); };

  // --- Resolve guruId → user ---
  const guruIdToUser = useMemo(() => {
    const map = {};
    teachers.forEach(t => { const u = guruList.find(usr => usr.id === t.userId); if (u) map[t.id] = u; });
    return map;
  }, [teachers, guruList]);

  // --- Filters ---
  const filteredAlats = useMemo(() => {
    let res = alats;
    if (searchAlat) res = res.filter(a => a.nama.toLowerCase().includes(searchAlat.toLowerCase()) || a.merek?.toLowerCase().includes(searchAlat.toLowerCase()));
    if (filterCategory) res = res.filter(a => a.kategori === filterCategory);
    if (filterStatus) res = res.filter(a => { if (filterStatus === 'tersedia') return a.stok > 10; if (filterStatus === 'terbatas') return a.stok > 0 && a.stok <= 10; if (filterStatus === 'habis') return a.stok === 0; return true; });
    return res;
  }, [alats, searchAlat, filterCategory, filterStatus]);

  const filteredPeminjamans = useMemo(() => {
    let res = peminjamans.filter(p => ['pending', 'disetujui'].includes(p.status));
    if (searchPeminjaman) res = res.filter(p => p.user?.nama?.toLowerCase().includes(searchPeminjaman.toLowerCase()) || p.alat?.nama?.toLowerCase().includes(searchPeminjaman.toLowerCase()));
    if (filterStatusPeminjaman !== 'all') res = res.filter(p => p.status === filterStatusPeminjaman);
    return res;
  }, [peminjamans, searchPeminjaman, filterStatusPeminjaman]);

  const filteredGuruList = useMemo(() => {
    let res = guruList;
    if (searchGuru) res = res.filter(g => g.nama?.toLowerCase().includes(searchGuru.toLowerCase()) || g.email?.toLowerCase().includes(searchGuru.toLowerCase()) || g.nip?.includes(searchGuru) || g.nisn?.includes(searchGuru));
    if (filterRoleGuru !== 'all') res = res.filter(g => g.role === filterRoleGuru);
    return res;
  }, [guruList, searchGuru, filterRoleGuru]);

  const filteredLaporan = useMemo(() => {
    let res = peminjamans;
    if (searchLaporan) res = res.filter(p => p.user?.nama?.toLowerCase().includes(searchLaporan.toLowerCase()) || p.alat?.nama?.toLowerCase().includes(searchLaporan.toLowerCase()));
    if (filterStatusLaporan !== 'all') res = res.filter(p => p.status === filterStatusLaporan);
    if (startDate) res = res.filter(p => new Date(p.tanggalPeminjaman) >= new Date(startDate));
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59); res = res.filter(p => new Date(p.tanggalPeminjaman) <= end); }
    return res;
  }, [peminjamans, searchLaporan, filterStatusLaporan, startDate, endDate]);

  // --- Sort helper ---
  const sortData = useCallback((data, sort, getVal) => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      let va = getVal(a, sort.key), vb = getVal(b, sort.key);
      if (typeof va === 'number') return sort.dir === 'asc' ? va - vb : vb - va;
      va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase();
      return va < vb ? (sort.dir === 'asc' ? -1 : 1) : va > vb ? (sort.dir === 'asc' ? 1 : -1) : 0;
    });
  }, []);

  const getGuruVal = useCallback((u, key) => {
    if (key === 'nama') return u.nama; if (key === 'role') return u.role;
    if (key === 'identitas') return u.role === 'guru' ? u.nip : u.role === 'siswa' ? u.nisn : '';
    if (key === 'email') return u.email; if (key === 'nohp') return u.nohp;
    return '';
  }, []);

  const getLaporanVal = useCallback((p, key) => {
    if (key === 'siswa') return p.user?.nama; if (key === 'nohp') return guruIdToUser[p.guruId]?.nohp;
    if (key === 'alat') return p.alat?.nama; if (key === 'guru') return p.guru?.nama;
    if (key === 'mapel') return Array.isArray(p.mapel) ? p.mapel[0] : p.mapel;
    if (key === 'tglPinjam') return new Date(p.tanggalPeminjaman).getTime();
    if (key === 'kondisi') return p.kondisiPengembalian; if (key === 'status') return p.status;
    return '';
  }, [guruIdToUser]);

  // --- FIX: key/dir yang benar ---
  const handleGuruSort = useCallback((key) => { setGuruSort(p => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' })); setGuruPage(1); }, []);
  const handleLaporanSort = useCallback((key) => { setLaporanSort(p => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' })); setLaporanPage(1); }, []);

  // --- Pagination + Sort ---
  const totalPagesGuru = Math.ceil(filteredGuruList.length / guruLimit);
  const paginatedGuruList = useMemo(() => filteredGuruList.slice((guruPage - 1) * guruLimit, (guruPage - 1) * guruLimit + guruLimit), [filteredGuruList, guruPage, guruLimit]);
  const sortedGuruList = useMemo(() => sortData(paginatedGuruList, guruSort, getGuruVal), [paginatedGuruList, guruSort, sortData, getGuruVal]);
  useEffect(() => { setGuruPage(1); }, [searchGuru, filterRoleGuru]);

  const totalPagesLaporan = Math.ceil(filteredLaporan.length / laporanLimit);
  const paginatedLaporan = useMemo(() => filteredLaporan.slice((laporanPage - 1) * laporanLimit, (laporanPage - 1) * laporanLimit + laporanLimit), [filteredLaporan, laporanPage, laporanLimit]);
  const sortedLaporan = useMemo(() => sortData(paginatedLaporan, laporanSort, getLaporanVal), [paginatedLaporan, laporanSort, sortData, getLaporanVal]);
  useEffect(() => { setLaporanPage(1); }, [searchLaporan, filterStatusLaporan, startDate, endDate, laporanLimit]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const kondisiCounts = { 'Baik': 0, 'Kurang': 0, 'Rusak Berat': 0, 'Belum Dikembalikan': 0 };
    const mapelCounts = {}, guruCounts = {}, alatCounts = {}, kelasCounts = {}, trendBulanan = {};
    const dayCounts = { 'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0 };
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    peminjamans.forEach(p => {
      const k = p.kondisiPengembalian;
      if (k === 'baik') kondisiCounts['Baik']++; else if (k === 'kurang') kondisiCounts['Kurang']++; else if (k === 'rusak berat') kondisiCounts['Rusak Berat']++; else if (['disetujui', 'pending'].includes(p.status)) kondisiCounts['Belum Dikembalikan']++;
      const mapel = Array.isArray(p.mapel) ? p.mapel[0] : p.mapel; if (mapel) mapelCounts[mapel] = (mapelCounts[mapel] || 0) + 1;
      if (p.guru) guruCounts[p.guru.nama] = (guruCounts[p.guru.nama] || 0) + 1;
      if (p.alat) alatCounts[p.alat.nama] = (alatCounts[p.alat.nama] || 0) + (p.jumlah || 0);
      if (p.user?.kelas) kelasCounts[p.user.kelas] = (kelasCounts[p.user.kelas] || 0) + 1;
      if (p.tanggalPeminjaman) {
        const d = new Date(p.tanggalPeminjaman);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; trendBulanan[key] = (trendBulanan[key] || 0) + 1;
        const dayName = days[d.getDay()]; if (dayCounts.hasOwnProperty(dayName)) dayCounts[dayName]++;
      }
    });
    const sortedTrend = Object.keys(trendBulanan).sort();
    const sortE = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
    return {
      kondisi: { labels: Object.keys(kondisiCounts), data: Object.values(kondisiCounts) },
      trend: { labels: sortedTrend.map(k => { const [y, m] = k.split('-'); return `${months[parseInt(m, 10) - 1]} ${y}`; }), data: sortedTrend.map(k => trendBulanan[k]) },
      mapel: { labels: sortE(mapelCounts).slice(0, 5).map(e => e[0]), data: sortE(mapelCounts).slice(0, 5).map(e => e[1]) },
      guru: { labels: sortE(guruCounts).slice(0, 10).map(e => e[0]), data: sortE(guruCounts).slice(0, 10).map(e => e[1]) },
      alat: { labels: sortE(alatCounts).slice(0, 5).map(e => e[0]), data: sortE(alatCounts).slice(0, 5).map(e => e[1]) },
      kelas: { labels: sortE(kelasCounts).slice(0, 5).map(e => e[0]), data: sortE(kelasCounts).slice(0, 5).map(e => e[1]) },
      hari: { labels: Object.keys(dayCounts), data: Object.values(dayCounts) },
    };
  }, [peminjamans]);

  // --- Actions ---
  const handleApprove = (id) => setConfirmModal({ isOpen: true, title: 'Setujui Peminjaman', message: 'Stok alat akan dikurangi.', icon: <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />, onConfirm: () => doAction(id, 'approve'), confirmText: 'Ya, Setujui', cancelText: 'Batal' });
  const handleReject = (id) => setConfirmModal({ isOpen: true, title: 'Tolak Peminjaman', message: 'Peminjaman ini akan ditolak.', icon: <FaTimesCircle className="mx-auto h-12 w-12 text-red-500" />, onConfirm: () => doAction(id, 'reject'), confirmText: 'Ya, Tolak', cancelText: 'Batal' });

  const doAction = async (id, type) => {
    try {
      const res = type === 'approve' ? await petugasModel.approvePeminjaman(id) : await petugasModel.rejectPeminjaman(id);
      if (!res.error) { setPeminjamans(prev => prev.map(p => p.id === id ? { ...p, status: type === 'approve' ? 'disetujui' : 'ditolak' } : p)); setStatistics(prev => ({ ...prev, pending: prev.pending - 1 })); toast.success(`Berhasil ${type === 'approve' ? 'menyetujui' : 'menolak'}`); }
      else toast.error(res.message);
    } catch { toast.error('Gagal memproses'); }
    finally { setConfirmModal(p => ({ ...p, isOpen: false })); }
  };

  const handleReturn = (id) => { setReturnModal({ isOpen: true, peminjamanId: id, condition: "", buktiGambar: null }); setCropModal({ isOpen: false, imageSrc: null }); };
  const handleBuktiChange = (e) => { const f = e.target.files[0]; if (!f || !f.type.startsWith("image/")) return; const r = new FileReader(); r.onloadend = () => setCropModal({ isOpen: true, imageSrc: r.result }); r.readAsDataURL(f); e.target.value = ""; };
  const onCropComplete = useCallback((c, p) => setCroppedAreaPixels(p), []);
  const handleCropConfirm = async () => {
    try {
      const blob = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels);
      if (blob.size > 2 * 1024 * 1024) return toast.error("Hasil crop melebihi 2MB.");
      const r = new FileReader(); r.onloadend = () => { setReturnModal(p => ({ ...p, buktiGambar: r.result })); setCropModal({ isOpen: false, imageSrc: null }); setZoom(1); }; r.readAsDataURL(blob);
    } catch { toast.error("Gagal memproses gambar"); }
  };
  const handleCropCancel = () => { setCropModal({ isOpen: false, imageSrc: null }); setZoom(1); };

  const confirmReturn = async () => {
    if (!returnModal.condition) return toast.error("Pilih kondisi alat");
    if (["kurang", "rusak berat"].includes(returnModal.condition) && !returnModal.buktiGambar) return toast.error("Wajib upload bukti foto");
    try {
      const res = await petugasModel.returnPeminjaman(returnModal.peminjamanId, returnModal.condition, returnModal.buktiGambar);
      if (res.error) toast.error(res.message);
      else { toast.success("Pengembalian berhasil"); setPeminjamans(prev => prev.map(p => p.id === returnModal.peminjamanId ? { ...p, status: "kembali", kondisiPengembalian: returnModal.condition, tanggalPengembalian: new Date().toISOString() } : p)); setStatistics(prev => ({ ...prev, disetujui: prev.disetujui - 1, kembali: prev.kembali + 1 })); }
    } catch { toast.error("Gagal memproses"); }
    finally { setReturnModal({ isOpen: false, peminjamanId: null, condition: "", buktiGambar: null }); }
  };

  const handleAddAlat = () => { setSelectedAlat(null); setAlatModalOpen(true); };
  const handleEditClick = (alat) => { setSelectedAlat(alat); setAlatModalOpen(true); };
  const handleCloseModal = () => { setAlatModalOpen(false); setSelectedAlat(null); };
  const handleCreateAlat = async (d, f) => { const res = await petugasModel.addAlat(d, f); if (res.error) toast.error(res.message); else { toast.success('Alat ditambahkan'); handleCloseModal(); loadData(); } };
  const handleEditAlat = async (d, f) => { if (!selectedAlat?.id) return; const res = await petugasModel.editAlat(selectedAlat.id, d, f); if (res.error) toast.error(res.message); else { toast.success('Alat diperbarui'); handleCloseModal(); loadData(); } };
  const handleDeleteAlat = (id) => setConfirmModal({ isOpen: true, title: 'Hapus Alat', message: 'Data alat akan dihapus permanen.', icon: <FaTrash className="mx-auto h-12 w-12 text-red-500" />, onConfirm: async () => { const res = await petugasModel.removeAlat(id); if (res.error) toast.error(res.message); else { toast.success('Alat dihapus'); loadData(); } setConfirmModal(p => ({ ...p, isOpen: false })); }, confirmText: 'Hapus', cancelText: 'Batal' });
  const handleViewAlatDetail = async (id) => { const res = await petugasModel.getAlatDetail(id); if (res.error) toast.error(res.message); else { setAlatDetail(res.result || res.alat || res); setAlatDetailModalOpen(true); } };

  // --- FIX: Tracking client-side, tanpa API ---
  const handleViewAlatTracking = (id) => {
    const alat = alats.find(a => a.id === id);
    const riwayat = peminjamans.filter(p => p.alatId === id).map(p => ({
      tanggal: p.tanggalPeminjaman, user: p.user, guru: p.guru, jumlah: p.jumlah,
      status: p.status, kondisiPengembalian: p.kondisiPengembalian,
    }));
    setAlatTrackingData({ alat: { nama: alat?.nama || '-', totalPinjam: riwayat.length }, riwayatPinjam: riwayat });
    setAlatTrackingModalOpen(true);
  };

  const handleOpenEditLaporan = (p) => setEditLaporanModal({ isOpen: true, data: p, jumlah: p.jumlah, mapel: Array.isArray(p.mapel) ? p.mapel[0] : p.mapel, kondisiPengembalian: p.kondisiPengembalian || '' });  
  const handleSaveEditLaporan = async () => {
    if (!editLaporanModal.jumlah || parseInt(editLaporanModal.jumlah) < 1) return toast.error('Jumlah harus diisi');
    const payload = { jumlah: parseInt(editLaporanModal.jumlah), mapel: editLaporanModal.mapel };
    if (editLaporanModal.kondisiPengembalian) payload.kondisiPengembalian = editLaporanModal.kondisiPengembalian;
    const res = await petugasModel.editPeminjamanData(editLaporanModal.data.id, payload);
    if (res.error) toast.error(res.message); else { toast.success('Data diperbarui'); setEditLaporanModal({ isOpen: false, data: null, jumlah: '', mapel: '', kondisiPengembalian: '' }); loadData(); }
  };

  const handleDeletePeminjaman = (id) => setConfirmModal({ isOpen: true, title: 'Hapus Transaksi', message: 'Data akan dihapus permanen.', icon: <FaTrash className="mx-auto h-12 w-12 text-red-500" />, onConfirm: async () => { const res = await petugasModel.deletePeminjamanData(id); if (res.error) toast.error(res.message); else { toast.success('Dihapus'); setPeminjamans(prev => prev.filter(p => p.id !== id)); } setConfirmModal(v => ({ ...v, isOpen: false })); }, confirmText: 'Hapus', cancelText: 'Batal' });
  const handleResetPassword = (u) => setResetPasswordModal({ isOpen: true, user: u, newPassword: '', confirmPassword: '' });
  const handlePasswordChange = (e) => setResetPasswordModal(p => ({ ...p, [e.target.name]: e.target.value }));
  const confirmResetPassword = async () => {
    if (!resetPasswordModal.newPassword) return toast.error('Password harus diisi');
    if (resetPasswordModal.newPassword !== resetPasswordModal.confirmPassword) return toast.error('Password tidak cocok');
    if (!/^(?=.*[A-Z])(?=.*[\d\W]).{8,}$/.test(resetPasswordModal.newPassword)) return toast.error('Min 8 huruf, huruf besar & angka/simbol');
    const res = await petugasModel.resetUserPassword(resetPasswordModal.user.id, resetPasswordModal.newPassword);
    if (res.error) toast.error(res.message); else { toast.success('Password direset'); setResetPasswordModal({ isOpen: false, user: null, newPassword: '', confirmPassword: '' }); }
  };

  const handleDeleteUser = (u) => {
    if (user.role === 'petugas' && u.role === 'petugas') return toast.error('Petugas tidak dapat menghapus akun Petugas lain.');
    setConfirmModal({ isOpen: true, title: 'Hapus Akun', message: `Hapus akun ${u.nama}?`, icon: <FaTrash className="mx-auto h-12 w-12 text-red-500" />, onConfirm: async () => { const res = await petugasModel.deleteUser(u.id); if (res.error) toast.error(res.message); else { toast.success('Akun dihapus'); setGuruList(prev => prev.filter(x => x.id !== u.id)); } setConfirmModal(v => ({ ...v, isOpen: false })); }, confirmText: 'Hapus', cancelText: 'Batal' });
  };

  const handleAddUser = () => { setSelectedUser(null); setUserModalOpen(true); };
  const handleEditUser = (u) => { setSelectedUser(u); setUserModalOpen(true); };
  const handleCloseUserModal = () => { setUserModalOpen(false); setSelectedUser(null); };
  const handleCreateUser = async (d) => { const res = await petugasModel.createUser(d); if (res.error) toast.error(res.message); else { toast.success('User ditambahkan'); handleCloseUserModal(); loadData(); } };
  const handleUpdateUser = async (d) => { if (!selectedUser?.id) return; const res = await petugasModel.updateUser(selectedUser.id, d); if (res.error) toast.error(res.message); else { toast.success('User diperbarui'); handleCloseUserModal(); loadData(); } };
  const viewGuruProfile = (id) => { const g = guruList.find(x => x.id === id); if (g) { setGuruDetail(g); setGuruDetailModalOpen(true); } };
  const handleLogout = () => setConfirmModal({ isOpen: true, title: 'Logout', message: 'Keluar dari sistem?', icon: <FaSignOutAlt className="mx-auto h-12 w-12 text-blue-500" />, onConfirm: () => { logout(); toast.success('Berhasil logout'); window.location.hash = '#/auth'; }, confirmText: 'Ya', cancelText: 'Batal' });
  const handleExportFiltered = () => petugasModel.exportToExcel(filteredLaporan, guruList, alats).then(res => { if (!res.success) toast.error(res.error); });

  const handleViewDetail = useCallback((p) => {
    const userInfo = guruList.find(u => u.id === p.userId);
    const teacherDoc = teachers.find(t => t.id === p.guruId);
    const teacherUser = teacherDoc ? guruList.find(u => u.id === teacherDoc.userId) : null;
    setDetailModal({
      isOpen: true,
      data: {
        ...p,
        fullUser: { ...p.user, ...(userInfo || {}) },
        fullGuru: {
          ...p.guru,
          foto: p.guru?.foto || teacherUser?.foto || null,
          nohp: p.guru?.nohp || teacherUser?.nohp || '-',
          mapelUsed: Array.isArray(p.mapel) ? p.mapel : (p.mapel ? [p.mapel] : []),
        },
      },
    });
  }, [guruList, teachers]);

  return (
    <PetugasView
      user={user} peminjamans={peminjamans} alats={filteredAlats} guruList={guruList} statistics={statistics} chartData={chartData} loading={loading} activeTab={activeTab}
      filteredPeminjamans={filteredPeminjamans} filteredGuruList={filteredGuruList} filteredLaporan={filteredLaporan}
      sortedGuruList={sortedGuruList} guruSort={guruSort} handleGuruSort={handleGuruSort}
      sortedLaporan={sortedLaporan} laporanSort={laporanSort} handleLaporanSort={handleLaporanSort}
      guruIdToUser={guruIdToUser}
      paginatedLaporan={paginatedLaporan} laporanPage={laporanPage} setLaporanPage={setLaporanPage} laporanLimit={laporanLimit} setLaporanLimit={setLaporanLimit} totalPagesLaporan={totalPagesLaporan}
      paginatedGuruList={paginatedGuruList} guruPage={guruPage} setGuruPage={setGuruPage} guruLimit={guruLimit} setGuruLimit={setGuruLimit} totalPagesGuru={totalPagesGuru}
      editLaporanModal={editLaporanModal} setEditLaporanModal={setEditLaporanModal} handleOpenEditLaporan={handleOpenEditLaporan} handleSaveEditLaporan={handleSaveEditLaporan}
      searchAlat={searchAlat} setSearchAlat={setSearchAlat} filterCategory={filterCategory} setFilterCategory={setFilterCategory} filterStatus={filterStatus} setFilterStatus={setFilterStatus}
      searchPeminjaman={searchPeminjaman} setSearchPeminjaman={setSearchPeminjaman} filterStatusPeminjaman={filterStatusPeminjaman} setFilterStatusPeminjaman={setFilterStatusPeminjaman}
      searchGuru={searchGuru} setSearchGuru={setSearchGuru} filterRoleGuru={filterRoleGuru} setFilterRoleGuru={setFilterRoleGuru}
      searchLaporan={searchLaporan} setSearchLaporan={setSearchLaporan} filterStatusLaporan={filterStatusLaporan} setFilterStatusLaporan={setFilterStatusLaporan}
      startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
      alatModalOpen={alatModalOpen} selectedAlat={selectedAlat} alatDetailModalOpen={alatDetailModalOpen} alatDetail={alatDetail}
      confirmModal={confirmModal} returnModal={returnModal} guruDetailModalOpen={guruDetailModalOpen} guruDetail={guruDetail}
      resetPasswordModal={resetPasswordModal} alatTrackingModalOpen={alatTrackingModalOpen} alatTrackingData={alatTrackingData}
      userModalOpen={userModalOpen} selectedUser={selectedUser} cropModal={cropModal} crop={crop} zoom={zoom}
      setZoom={setZoom} setCrop={setCrop} onCropComplete={onCropComplete}
      setReturnModal={setReturnModal} setConfirmModal={setConfirmModal} setAlatDetailModalOpen={setAlatDetailModalOpen} setAlatTrackingModalOpen={setAlatTrackingModalOpen}
      setGuruDetailModalOpen={setGuruDetailModalOpen} setResetPasswordModal={setResetPasswordModal}
      handleLogout={handleLogout} handleRefreshData={handleRefreshData} handleAddAlat={handleAddAlat} handleEditClick={handleEditClick}
      handleDeleteAlat={handleDeleteAlat} handleViewAlatDetail={handleViewAlatDetail} handleCloseModal={handleCloseModal}
      handleCreateAlat={handleCreateAlat} handleEditAlat={handleEditAlat} handleApprove={handleApprove} handleReject={handleReject}
      handleReturn={handleReturn} confirmReturn={confirmReturn} handleBuktiChange={handleBuktiChange}
      handleCropConfirm={handleCropConfirm} handleCropCancel={handleCropCancel} handleDeletePeminjaman={handleDeletePeminjaman}
      viewGuruProfile={viewGuruProfile} handleExportFiltered={handleExportFiltered} handleResetPassword={handleResetPassword}
      handleDeleteUser={handleDeleteUser} handlePasswordChange={handlePasswordChange} confirmResetPassword={confirmResetPassword}
      handleAddUser={handleAddUser} handleCloseUserModal={handleCloseUserModal} handleCreateUser={handleCreateUser}
      handleUpdateUser={handleUpdateUser} handleEditUser={handleEditUser} handleViewAlatTracking={handleViewAlatTracking}
      detailModal={detailModal} setDetailModal={setDetailModal} handleViewDetail={handleViewDetail}    
      />
  );
}