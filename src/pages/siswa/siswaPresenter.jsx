// src/pages/siswa/siswaPresenter.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import SiswaView from './siswaView';
import { fetchAlats, fetchMyPeminjaman, submitPeminjaman, cancelPeminjaman, fetchGuruByMapel, processPeminjamanData, calculateStats, filterAlats, filterPeminjamans, DAFTAR_MAPEL } from './siswaModel';

export default function SiswaPresenter({ user, activeTab }) {
  const [alats, setAlats] = useState([]);
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [gurus, setGurus] = useState([]);
  const [selectedGuru, setSelectedGuru] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailAlat, setSelectedDetailAlat] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [riwayatSort, setRiwayatSort] = useState({ key: null, dir: 'asc' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setMessage('');
      const [alatsData, peminjamanData] = await Promise.all([fetchAlats(), fetchMyPeminjaman()]);
      if (!alatsData.error) setAlats(alatsData.result || []);
      else setMessage(alatsData.message);
      if (!peminjamanData.error) setPeminjamans(processPeminjamanData(peminjamanData.result, alatsData.result));
      else setPeminjamans(peminjamanData.result || []);
    } catch { setMessage('Gagal mengambil data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (isModalOpen) { setSelectedMapel(''); setGurus([]); setSelectedGuru(''); setJumlah(1); setMessage(''); } }, [isModalOpen]);

  const handleFetchGuruByMapel = useCallback(async (mapel) => { if (!mapel) { setGurus([]); return; } try { setGurus(await fetchGuruByMapel(mapel)); } catch { setGurus([]); } }, []);
  useEffect(() => { handleFetchGuruByMapel(selectedMapel); }, [selectedMapel, handleFetchGuruByMapel]);

  const handleViewDetail = (alat) => { setSelectedDetailAlat(alat); setDetailModalOpen(true); };
  const handleCloseDetailModal = () => { setDetailModalOpen(false); setSelectedDetailAlat(null); };
  const handlePinjamClick = (alat) => { setSelectedAlat(alat); setIsModalOpen(true); };
  const handleMapelChange = (e) => { setSelectedMapel(e.target.value); setSelectedGuru(''); };
  const handleGuruChange = (e) => { setSelectedGuru(e.target.value); };
  const handleJumlahChange = (e) => { const v = parseInt(e.target.value, 10); if (v > 0 && v <= selectedAlat?.stok) setJumlah(v); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlat || !selectedMapel || !selectedGuru || jumlah <= 0) return setMessage('Harap lengkapi semua field');
    setSubmitting(true); setMessage('');
    try {
      const res = await submitPeminjaman({ alatId: selectedAlat.id, jumlah, mapel: selectedMapel, guruId: selectedGuru });
      if (res.error) { setMessage(res.message); toast.error(res.message); }
      else { toast.success(`Peminjaman "${selectedAlat.nama}" berhasil diajukan!`); setIsModalOpen(false); setSelectedAlat(null); await fetchData(); }
    } catch { setMessage('Gagal melakukan peminjaman'); toast.error('Gagal. Coba lagi.'); }
    finally { setSubmitting(false); }
  };

  const handleCloseModal = () => { setIsModalOpen(false); setMessage(''); };
  const handleCancelClick = (p) => { setCancelTarget(p); setCancelModalOpen(true); };
  const handleCloseCancelModal = () => { setCancelModalOpen(false); setCancelTarget(null); };
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try { await cancelPeminjaman(cancelTarget.id); toast.success(`Peminjaman "${cancelTarget.alat?.nama}" dibatalkan`); setCancelModalOpen(false); setCancelTarget(null); await fetchData(); }
    catch (e) { toast.error(e.message || 'Gagal membatalkan'); }
    finally { setCancelling(false); }
  };

  // --- Sort riwayat ---
  const sortData = useCallback((data, sort, getVal) => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      let va = getVal(a, sort.key), vb = getVal(b, sort.key);
      if (typeof va === 'number') return sort.dir === 'asc' ? va - vb : vb - va;
      va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase();
      return va < vb ? (sort.dir === 'asc' ? -1 : 1) : va > vb ? (sort.dir === 'asc' ? 1 : -1) : 0;
    });
  }, []);

  const getRiwayatVal = useCallback((p, key) => {
    if (key === 'alat') return p.alat?.nama; if (key === 'jumlah') return p.jumlah;
    if (key === 'mapel') return p.mapel; if (key === 'tanggal') return new Date(p.tanggalPeminjaman).getTime();
    if (key === 'status') return p.status;
    return '';
  }, []);


  const handleRiwayatSort = useCallback((key) => { setRiwayatSort(p => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' })); }, []);
  const stats = calculateStats(alats, peminjamans);
  const filteredAlatsList = filterAlats(alats, searchTerm, filterCategory);
  const filteredPeminjamansList = filterPeminjamans(peminjamans, searchTerm, statusFilter);

  const sortedPeminjamans = useMemo(() => sortData(filteredPeminjamansList, riwayatSort, getRiwayatVal), [filteredPeminjamansList, riwayatSort, sortData, getRiwayatVal]);

  return (
    <SiswaView
      user={user} loading={loading} message={message} activeTab={activeTab}
      searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
      stats={stats} filteredAlats={filteredAlatsList} filteredPeminjamans={sortedPeminjamans}
      isModalOpen={isModalOpen} selectedAlat={selectedAlat} jumlah={jumlah} selectedMapel={selectedMapel}
      daftarMapel={DAFTAR_MAPEL} gurus={gurus} selectedGuru={selectedGuru} submitting={submitting}
      onPinjamClick={handlePinjamClick} onMapelChange={handleMapelChange} onGuruChange={handleGuruChange}
      onJumlahChange={handleJumlahChange} onSubmit={handleSubmit} onCloseModal={handleCloseModal}
      detailModalOpen={detailModalOpen} selectedDetailAlat={selectedDetailAlat} onViewDetail={handleViewDetail}
      onCloseDetailModal={handleCloseDetailModal} filterCategory={filterCategory} setFilterCategory={setFilterCategory}
      cancelModalOpen={cancelModalOpen} cancelTarget={cancelTarget} cancelling={cancelling}
      onCancelClick={handleCancelClick} onConfirmCancel={handleConfirmCancel} onCloseCancelModal={handleCloseCancelModal}
      riwayatSort={riwayatSort} handleRiwayatSort={handleRiwayatSort}
    />
  );
}