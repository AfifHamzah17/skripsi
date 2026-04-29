import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import SiswaView from './siswaView';
import { getAllMapel } from '../models/mapel-model';
import { getRosterNow, getGuruByMapelKelas, getAllRoster } from '../models/roster-model';
import { fetchAlats, fetchMyPeminjaman, submitPeminjaman, cancelPeminjaman, processPeminjamanData, calculateStats, filterAlats, filterPeminjamans, requestReturn } from './siswaModel';
import Cropper from 'react-easy-crop';
import { useAuth } from '../../Context/AuthContext';

const HARI_ARR = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

export default function SiswaPresenter({ user, activeTab }) {
  const { refreshUser } = useAuth();
  const [alats, setAlats] = useState([]);
  const [pinjam, setPinjam] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [availableMapel, setAvailableMapel] = useState([]);
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
  const [retReq, setRetReq] = useState({ open: false, id: null });
  const [photos, setPhotos] = useState([]);
  const [cropSt, setCropSt] = useState({ open: false, idx: -1, src: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPx, setCropPx] = useState(null);
  const [submittingRet, setSubmittingRet] = useState(false);
  const [rosterNow, setRosterNow] = useState(null);
  const [rosterStatus, setRosterStatus] = useState('kosong');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setMsg('');
      const [a, p, m] = await Promise.all([fetchAlats(), fetchMyPeminjaman(), getAllMapel()]);
      if (!a.error) setAlats(a.result || []);
      else setMsg(a.message);
      if (!p.error) setPinjam(processPeminjamanData(p.result, a.result));
      else setPinjam(p.result || []);
      if (!m.error) setMapelList(m.result || []);
      else setMapelList([]);
    } catch {
      setMsg('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!modal) return;
    setSelMapel('');
    setGurus([]);
    setSelGuru('');
    setJumlah(1);
    setMsg('');
    setRosterNow(null);
    setRosterStatus('kosong');
    setAvailableMapel([]);
    let cancelled = false;
    (async () => {
      await refreshUser();
      if (cancelled) return;
      const freshUser = JSON.parse(localStorage.getItem('user') || '{}');
      const kelas = freshUser.kelas;
      if (!kelas) {
        setRosterStatus('kosong');
        return;
      }
      try {
        const [nowRes, allRosterRes] = await Promise.all([getRosterNow(kelas), getAllRoster()]);
        if (cancelled) return;
        const nowResult = !nowRes.error && nowRes.result ? nowRes.result : null;
        const allRoster = !allRosterRes.error && allRosterRes.result ? allRosterRes.result : [];
        const todayIdx = new Date().getDay();
        const validHariSet = new Set();
        if (todayIdx >= 1 && todayIdx <= 5) {
          validHariSet.add(HARI_ARR[todayIdx]);
          if (todayIdx + 1 <= 5) validHariSet.add(HARI_ARR[todayIdx + 1]);
        }
        let activeMapelIds = new Set();
        if (nowResult) {
          activeMapelIds.add(nowResult.mapelId);
        }
        allRoster.forEach(r => {
          if (r.kelas === kelas && r.mapelId && validHariSet.has(r.hari)) activeMapelIds.add(r.mapelId);
        });
        const filtered = mapelList.filter(m => activeMapelIds.has(m.id));
        setAvailableMapel(filtered);
        if (filtered.length > 0) {
          setRosterStatus(nowResult ? 'active' : 'manual');
          if (nowResult) {
            setRosterNow({ ...nowResult, _hari: nowRes.hari, _jamKe: nowRes.jamKe });
            setSelMapel(nowResult.mapelId);
          }
          if (nowResult?.guruId) {
            setGurus([{ id: nowResult.guruId, nama: nowResult.guruNama || 'Guru' }]);
            setSelGuru(nowResult.guruId);
          }
        } else {
          setRosterStatus('kosong');
        }
      } catch {
        if (!cancelled) setRosterStatus('kosong');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modal, refreshUser, mapelList]);

  const loadGuru = useCallback(async (mapelId) => {
    if (!mapelId || !user?.kelas) {
      setGurus([]);
      return;
    }
    try {
      const r = await getGuruByMapelKelas(mapelId, user.kelas);
      if (!r.error && r.result) {
        const list = r.result.map(g => ({ id: g.guruId, nama: g.guruNama || 'Guru' }));
        setGurus(list);
        if (list.length === 1) setSelGuru(list[0].id);
      } else setGurus([]);
    } catch {
      setGurus([]);
    }
  }, [user?.kelas]);

  useEffect(() => {
    if (selMapel && selMapel !== rosterNow?.mapelId) loadGuru(selMapel);
    else if (!selMapel) {
      setGurus([]);
      setSelGuru('');
    }
  }, [selMapel, loadGuru, rosterNow?.mapelId]);

  const openDetail = a => {
    setDetailAlat(a);
    setDetailModal(true);
  };
  const closeDetail = () => {
    setDetailModal(false);
    setDetailAlat(null);
  };
  const openPinjam = a => {
    setSelAlat(a);
    setModal(true);
  };
  const onMapelChange = e => {
    setSelMapel(e.target.value);
    setSelGuru('');
  };
  const onGuruChange = e => setSelGuru(e.target.value);
  const onJumlahChange = e => {
    const v = +e.target.value;
    if (v > 0 && v <= selAlat?.stok) setJumlah(v);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selAlat || !selMapel || !selGuru || jumlah <= 0) return setMsg('Lengkapi semua field');
    const mapelNama = availableMapel.find(m => m.id === selMapel)?.nama || selMapel;
    setSubmitting(true);
    setMsg('');
    try {
      const r = await submitPeminjaman({ alatId: selAlat.id, jumlah, mapel: mapelNama, guruId: selGuru });
      if (r.error) {
        setMsg(r.message);
        toast.error(r.message);
      } else {
        toast.success(`"${selAlat.nama}" diajukan!`);
        setModal(false);
        setSelAlat(null);
        await load();
      }
    } catch {
      setMsg('Gagal');
      toast.error('Coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  const openCancel = p => {
    setCancelTarget(p);
    setCancelModal(true);
  };
  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelPeminjaman(cancelTarget.id);
      toast.success('Dibatalkan');
      setCancelModal(false);
      setCancelTarget(null);
      await load();
    } catch (e) {
      toast.error(e.message || 'Gagal');
    } finally {
      setCancelling(false);
    }
  };
  const handleRiwayatSort = k => setRSort(p => ({ key: k, dir: p.key === k && p.dir === 'asc' ? 'desc' : 'asc' }));

  const sorted = useMemo(() => {
    if (!rSort.key) return filterPeminjamans(pinjam, search, statusF);
    return [...filterPeminjamans(pinjam, search, statusF)].sort((a, b) => {
      let va, vb;
      if (rSort.key === 'jumlah') {
        va = a.jumlah;
        vb = b.jumlah;
        return rSort.dir === 'asc' ? va - vb : vb - va;
      }
      if (rSort.key === 'tanggal') {
        va = new Date(a.tanggalPeminjaman || 0).getTime();
        vb = new Date(b.tanggalPeminjaman || 0).getTime();
      } else {
        va = String(rSort.key === 'alat' ? a.alat?.nama : rSort.key === 'mapel' ? a.mapel : a.status || '').toLowerCase();
        vb = String(rSort.key === 'alat' ? b.alat?.nama : rSort.key === 'mapel' ? b.mapel : b.status || '').toLowerCase();
      }
      if (va < vb) return rSort.dir === 'asc' ? -1 : 1;
      if (va > vb) return rSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pinjam, search, statusF, rSort]);

  const createImage = url => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const getCroppedImg = async (src, px) => {
    const img = await createImage(src);
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const MAX = 1024;
    let w = px.width, h = px.height;
    if (w > MAX || h > MAX) {
      if (w > h) {
        h = (h / w) * MAX;
        w = MAX;
      } else {
        w = (w / h) * MAX;
        h = MAX;
      }
    }
    c.width = w;
    c.height = h;
    ctx.drawImage(img, px.x, px.y, px.width, px.height, 0, 0, w, h);
    return new Promise(r => c.toBlob(b => r(b), "image/jpeg", 0.7));
  };

  const openRetReq = p => {
    setRetReq({ open: true, id: p.id });
    setPhotos([]);
  };
  const closeRetReq = () => {
    setRetReq({ open: false, id: null });
    setPhotos([]);
  };
  const handleFileSel = e => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    const rd = new FileReader();
    rd.onloadend = () => setCropSt({ open: true, idx: photos.length, src: rd.result });
    rd.readAsDataURL(f);
    e.target.value = "";
  };
  const onCropDone = useCallback((c, p) => setCropPx(p), []);
  const confirmCrop = async () => {
    try {
      const blob = await getCroppedImg(cropSt.src, cropPx);
      if (blob.size > 1 * 1024 * 1024) return toast.error("Foto terlalu besar.");
      const rd = new FileReader();
      rd.onloadend = () => {
        setPhotos(prev => [...prev, { src: rd.result }]);
        setCropSt({ open: false, idx: -1, src: null });
        setZoom(1);
      };
      rd.readAsDataURL(blob);
    } catch {
      toast.error("Gagal memproses gambar");
    }
  };
  const cancelCrop = () => {
    setCropSt({ open: false, idx: -1, src: null });
    setZoom(1);
  };
  const removePhoto = i => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const submitRetReq = async () => {
    if (!photos.length) return toast.error("Upload minimal 1 foto");
    setSubmittingRet(true);
    try {
      const r = await requestReturn(retReq.id, photos.map(p => p.src));
      if (r.error) toast.error(r.message);
      else {
        toast.success("Berhasil diajukan");
        closeRetReq();
        await load();
      }
    } catch (e) {
      toast.error(e.message || 'Gagal');
    } finally {
      setSubmittingRet(false);
    }
  };

  return (
    <SiswaView
      user={user}
      loading={loading}
      message={msg}
      activeTab={activeTab}
      searchTerm={search}
      setSearchTerm={setSearch}
      statusFilter={statusF}
      setStatusFilter={setStatusF}
      stats={calculateStats(alats, pinjam)}
      filteredAlats={filterAlats(alats, search, catF)}
      filteredPeminjamans={sorted}
      isModalOpen={modal}
      selectedAlat={selAlat}
      jumlah={jumlah}
      selectedMapel={selMapel}
      availableMapel={availableMapel}
      daftarMapel={mapelList}
      gurus={gurus}
      selectedGuru={selGuru}
      submitting={submitting}
      onPinjamClick={openPinjam}
      onMapelChange={onMapelChange}
      onGuruChange={onGuruChange}
      onJumlahChange={onJumlahChange}
      onSubmit={handleSubmit}
      onCloseModal={() => setModal(false)}
      detailModalOpen={detailModal}
      selectedDetailAlat={detailAlat}
      onViewDetail={openDetail}
      onCloseDetailModal={closeDetail}
      filterCategory={catF}
      setFilterCategory={setCatF}
      cancelModalOpen={cancelModal}
      cancelTarget={cancelTarget}
      cancelling={cancelling}
      onCancelClick={openCancel}
      onConfirmCancel={confirmCancel}
      onCloseCancelModal={() => {
        setCancelModal(false);
        setCancelTarget(null);
      }}
      riwayatSort={rSort}
      handleRiwayatSort={handleRiwayatSort}
      rosterNow={rosterNow}
      rosterStatus={rosterStatus}
      retReqModal={retReq}
      photos={photos}
      cropSt={cropSt}
      crop={crop}
      zoom={zoom}
      setZoom={setZoom}
      setCrop={setCrop}
      onCropDone={onCropDone}
      openRetReq={openRetReq}
      closeRetReq={closeRetReq}
      handleFileSel={handleFileSel}
      confirmCrop={confirmCrop}
      cancelCrop={cancelCrop}
      removePhoto={removePhoto}
      submitRetReq={submitRetReq}
      submittingRet={submittingRet}
    />
  );
}