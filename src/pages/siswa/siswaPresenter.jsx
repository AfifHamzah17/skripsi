import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import SiswaView from './siswaView';
import { getAllMapel } from '../models/mapel-model';
import { fetchAlats, fetchMyPeminjaman, submitPeminjaman, cancelPeminjaman, fetchGuruByMapel, processPeminjamanData, calculateStats, filterAlats, filterPeminjamans } from './siswaModel';

export default function SiswaPresenter({ user, activeTab }) {
  const [alats, setAlats] = useState([]);
  const [pinjam, setPinjam] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selAlat, setSelAlat] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [catF, setCatF] = useState('all');
  const [modal, setModal] = useState(false);
  const [selMapel, setSelMapel] = useState('');
  const [gurus, setGurus] = useState([]);
  const [selGuru, setSelGuru] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [detailAlat, setDetailAlat] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [rSort, setRSort] = useState({ key: null, dir: 'asc' });

  const load = useCallback(async () => {
    try {
      setLoading(true); setMsg('');
      const [a, p, m] = await Promise.all([fetchAlats(), fetchMyPeminjaman(), getAllMapel()]);
      if (!a.error) setAlats(a.result || []); else setMsg(a.message);
      if (!p.error) setPinjam(processPeminjamanData(p.result, a.result)); else setPinjam(p.result || []);
      if (!m.error) { const names = (m.result || []).map(x => x.nama).filter(Boolean); setMapelList(names.length ? names : ['Tidak ada data mapel']); }
      else setMapelList(['Tidak ada data mapel']);
    } catch { setMsg('Gagal memuat data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (modal) { setSelMapel(''); setGurus([]); setSelGuru(''); setJumlah(1); setMsg(''); } }, [modal]);

  const loadGuru = useCallback(async (m) => { if (!m) { setGurus([]); return; } try { setGurus(await fetchGuruByMapel(m)); } catch { setGurus([]); } }, []);
  useEffect(() => { loadGuru(selMapel); }, [selMapel, loadGuru]);

  const openDetail = a => { setDetailAlat(a); setDetailModal(true); };
  const closeDetail = () => { setDetailModal(false); setDetailAlat(null); };
  const openPinjam = a => { setSelAlat(a); setModal(true); };
  const onMapelChange = e => { setSelMapel(e.target.value); setSelGuru(''); };
  const onGuruChange = e => setSelGuru(e.target.value);
  const onJumlahChange = e => { const v = +e.target.value; if (v > 0 && v <= selAlat?.stok) setJumlah(v); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selAlat || !selMapel || !selGuru || jumlah <= 0) return setMsg('Lengkapi semua field');
    setSubmitting(true); setMsg('');
    try {
      const r = await submitPeminjaman({ alatId: selAlat.id, jumlah, mapel: selMapel, guruId: selGuru });
      if (r.error) { setMsg(r.message); toast.error(r.message); }
      else { toast.success(`"${selAlat.nama}" diajukan!`); setModal(false); setSelAlat(null); await load(); }
    } catch { setMsg('Gagal'); toast.error('Coba lagi'); }
    finally { setSubmitting(false); }
  };

  const openCancel = p => { setCancelTarget(p); setCancelModal(true); };
  const confirmCancel = async () => {
    if (!cancelTarget) return; setCancelling(true);
    try { await cancelPeminjaman(cancelTarget.id); toast.success('Dibatalkan'); setCancelModal(false); setCancelTarget(null); await load(); }
    catch (e) { toast.error(e.message || 'Gagal'); }
    finally { setCancelling(false); }
  };

  const handleRiwayatSort = k => setRSort(p => ({ key: k, dir: p.key === k && p.dir === 'asc' ? 'desc' : 'asc' }));

  const sorted = useMemo(() => {
    if (!rSort.key) return filterPeminjamans(pinjam, search, statusF);
    return [...filterPeminjamans(pinjam, search, statusF)].sort((a, b) => {
      let va, vb;
      if (rSort.key === 'jumlah') { va = a.jumlah; vb = b.jumlah; return rSort.dir === 'asc' ? va - vb : vb - va; }
      if (rSort.key === 'tanggal') { va = new Date(a.tanggalPeminjaman || 0).getTime(); vb = new Date(b.tanggalPeminjaman || 0).getTime(); }
      else { va = String(rSort.key === 'alat' ? a.alat?.nama : rSort.key === 'mapel' ? a.mapel : a.status || '').toLowerCase(); vb = String(rSort.key === 'alat' ? b.alat?.nama : rSort.key === 'mapel' ? b.mapel : b.status || '').toLowerCase(); }
      if (va < vb) return rSort.dir === 'asc' ? -1 : 1; if (va > vb) return rSort.dir === 'asc' ? 1 : -1; return 0;
    });
  }, [pinjam, search, statusF, rSort]);

  return (
    <SiswaView user={user} loading={loading} message={msg} activeTab={activeTab} searchTerm={search} setSearchTerm={setSearch} statusFilter={statusF} setStatusFilter={setStatusF} stats={calculateStats(alats, pinjam)} filteredAlats={filterAlats(alats, search, catF)} filteredPeminjamans={sorted} isModalOpen={modal} selectedAlat={selAlat} jumlah={jumlah} selectedMapel={selMapel} daftarMapel={mapelList} gurus={gurus} selectedGuru={selGuru} submitting={submitting} onPinjamClick={openPinjam} onMapelChange={onMapelChange} onGuruChange={onGuruChange} onJumlahChange={onJumlahChange} onSubmit={handleSubmit} onCloseModal={() => setModal(false)} detailModalOpen={detailModal} selectedDetailAlat={detailAlat} onViewDetail={openDetail} onCloseDetailModal={closeDetail} filterCategory={catF} setFilterCategory={setCatF} cancelModalOpen={cancelModal} cancelTarget={cancelTarget} cancelling={cancelling} onCancelClick={openCancel} onConfirmCancel={confirmCancel} onCloseCancelModal={() => { setCancelModal(false); setCancelTarget(null); }} riwayatSort={rSort} handleRiwayatSort={handleRiwayatSort} />
  );
}