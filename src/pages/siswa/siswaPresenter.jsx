// src/pages/siswa/siswaPresenter.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import SiswaView from './siswaView';
import { getAllMapel } from '../models/mapel-model';
import { getRosterNow, getGuruByMapelKelas } from '../models/roster-model';
import { fetchAlats, fetchMyPeminjaman, submitPeminjaman, cancelPeminjaman, processPeminjamanData, calculateStats, filterAlats, filterPeminjamans, requestReturn } from './siswaModel';
import Cropper from 'react-easy-crop';
import { FaImage, FaUndo, FaTimes } from 'react-icons/fa';

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
    try { setLoading(true); setMsg(''); const [a, p, m] = await Promise.all([fetchAlats(), fetchMyPeminjaman(), getAllMapel()]); if (!a.error) setAlats(a.result || []); else setMsg(a.message); if (!p.error) setPinjam(processPeminjamanData(p.result, a.result)); else setPinjam(p.result || []); if (!m.error) setMapelList(m.result || []); else setMapelList([]); } catch { setMsg('Gagal memuat data'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Modal buka → cek roster sekarang
  useEffect(() => {
    if (modal) {
      setSelMapel(''); setGurus([]); setSelGuru(''); setJumlah(1); setMsg(''); setRosterNow(null); setRosterStatus('kosong');
      if (user?.kelas) {
        getRosterNow(user.kelas).then(r => {
          if (!r.error && r.result) {
            setRosterNow(r.result); setRosterStatus('active');
            if (r.result.mapelId) { setSelMapel(r.result.mapelId); }
            if (r.result.guruId) { setGurus([{ id: r.result.guruId, nama: r.result.guruNama || 'Guru' }]); setSelGuru(r.result.guruId); }
          } else { setRosterStatus('kosong'); }
        }).catch(() => setRosterStatus('kosong'));
      }
    }
  }, [modal, user?.kelas]);

  // Mapel berubah manual → load guru (skip kalau masih pakai auto dari roster)
  const loadGuru = useCallback(async (mapelId) => {
    if (!mapelId || !user?.kelas) { setGurus([]); return; }
    try { const r = await getGuruByMapelKelas(mapelId, user.kelas); if (!r.error && r.result) { const list = r.result.map(g => ({ id: g.guruId, nama: g.guruNama || 'Guru' })); setGurus(list); if (list.length === 1) setSelGuru(list[0].id); } else setGurus([]); } catch { setGurus([]); }
  }, [user?.kelas]);

  useEffect(() => { if (selMapel && selMapel !== rosterNow?.mapelId) loadGuru(selMapel); else if (!selMapel) { setGurus([]); setSelGuru(''); } }, [selMapel, loadGuru, rosterNow?.mapelId]);

  const openDetail = a => { setDetailAlat(a); setDetailModal(true); };
  const closeDetail = () => { setDetailModal(false); setDetailAlat(null); };
  const openPinjam = a => { setSelAlat(a); setModal(true); };
  const onMapelChange = e => { setSelMapel(e.target.value); setSelGuru(''); };
  const onGuruChange = e => setSelGuru(e.target.value);
  const onJumlahChange = e => { const v = +e.target.value; if (v > 0 && v <= selAlat?.stok) setJumlah(v); };

  const handleSubmit = async e => {
    e.preventDefault(); if (!selAlat || !selMapel || !selGuru || jumlah <= 0) return setMsg('Lengkapi semua field');
    const mapelNama = mapelList.find(m => m.id === selMapel)?.nama || selMapel;
    setSubmitting(true); setMsg('');
    try { const r = await submitPeminjaman({ alatId: selAlat.id, jumlah, mapel: mapelNama, guruId: selGuru }); if (r.error) { setMsg(r.message); toast.error(r.message); } else { toast.success(`"${selAlat.nama}" diajukan!`); setModal(false); setSelAlat(null); await load(); } } catch { setMsg('Gagal'); toast.error('Coba lagi'); } finally { setSubmitting(false); }
  };

  const openCancel = p => { setCancelTarget(p); setCancelModal(true); };
  const confirmCancel = async () => { if (!cancelTarget) return; setCancelling(true); try { await cancelPeminjaman(cancelTarget.id); toast.success('Dibatalkan'); setCancelModal(false); setCancelTarget(null); await load(); } catch (e) { toast.error(e.message || 'Gagal'); } finally { setCancelling(false); } };

  const handleRiwayatSort = k => setRSort(p => ({ key: k, dir: p.key === k && p.dir === 'asc' ? 'desc' : 'asc' }));

  const sorted = useMemo(() => {
    if (!rSort.key) return filterPeminjamans(pinjam, search, statusF);
    return [...filterPeminjamans(pinjam, search, statusF)].sort((a, b) => {
      let va, vb; if (rSort.key === 'jumlah') { va = a.jumlah; vb = b.jumlah; return rSort.dir === 'asc' ? va - vb : vb - va; } if (rSort.key === 'tanggal') { va = new Date(a.tanggalPeminjaman || 0).getTime(); vb = new Date(b.tanggalPeminjaman || 0).getTime(); } else { va = String(rSort.key === 'alat' ? a.alat?.nama : rSort.key === 'mapel' ? a.mapel : a.status || '').toLowerCase(); vb = String(rSort.key === 'alat' ? b.alat?.nama : rSort.key === 'mapel' ? b.mapel : b.status || '').toLowerCase(); } if (va < vb) return rSort.dir === 'asc' ? -1 : 1; if (va > vb) return rSort.dir === 'asc' ? 1 : -1; return 0;
    });
  }, [pinjam, search, statusF, rSort]);

  const createImage = (url) => new Promise((resolve, reject) => { const image = new Image(); image.crossOrigin = "anonymous"; image.addEventListener("load", () => resolve(image)); image.addEventListener("error", reject); image.src = url; });
  const getCroppedImg = async (imageSrc, pixelCrop) => { const image = await createImage(imageSrc); const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d"); const MAX = 1024; let w = pixelCrop.width, h = pixelCrop.height; if (w > MAX || h > MAX) { if (w > h) { h = (h / w) * MAX; w = MAX; } else { w = (w / h) * MAX; h = MAX; } } canvas.width = w; canvas.height = h; ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, w, h); return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7); }); };

  const openRetReq = (p) => { setRetReq({ open: true, id: p.id }); setPhotos([]); };
  const closeRetReq = () => { setRetReq({ open: false, id: null }); setPhotos([]); };
  const handleFileSel = (e) => { const f = e.target.files[0]; if (!f || !f.type.startsWith("image/")) return; const r = new FileReader(); r.onloadend = () => setCropSt({ open: true, idx: photos.length, src: r.result }); r.readAsDataURL(f); e.target.value = ""; };
  const onCropDone = useCallback((c, p) => setCropPx(p), []);
  const confirmCrop = async () => { try { const blob = await getCroppedImg(cropSt.src, cropPx); if (blob.size > 1 * 1024 * 1024) return toast.error("Foto terlalu besar, potong lebih kecil."); const r = new FileReader(); r.onloadend = () => { setPhotos(prev => [...prev, { src: r.result }]); setCropSt({ open: false, idx: -1, src: null }); setZoom(1); }; r.readAsDataURL(blob); } catch { toast.error("Gagal memproses gambar"); } };
  const cancelCrop = () => { setCropSt({ open: false, idx: -1, src: null }); setZoom(1); };
  const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const submitRetReq = async () => { if (!photos.length) return toast.error("Upload minimal 1 foto bukti"); setSubmittingRet(true); try { const r = await requestReturn(retReq.id, photos.map(p => p.src)); if (r.error) toast.error(r.message); else { toast.success("Berhasil diajukan"); closeRetReq(); await load(); } } catch (e) { toast.error(e.message || 'Gagal'); } finally { setSubmittingRet(false); } };

  return (
    <SiswaView user={user} loading={loading} message={msg} activeTab={activeTab} searchTerm={search} setSearchTerm={setSearch} statusFilter={statusF} setStatusFilter={setStatusF} stats={calculateStats(alats, pinjam)} filteredAlats={filterAlats(alats, search, catF)} filteredPeminjamans={sorted} isModalOpen={modal} selectedAlat={selAlat} jumlah={jumlah} selectedMapel={selMapel} daftarMapel={mapelList} gurus={gurus} selectedGuru={selGuru} submitting={submitting} onPinjamClick={openPinjam} onMapelChange={onMapelChange} onGuruChange={onGuruChange} onJumlahChange={onJumlahChange} onSubmit={handleSubmit} onCloseModal={() => setModal(false)} detailModalOpen={detailModal} selectedDetailAlat={detailAlat} onViewDetail={openDetail} onCloseDetailModal={closeDetail} filterCategory={catF} setFilterCategory={setCatF} cancelModalOpen={cancelModal} cancelTarget={cancelTarget} cancelling={cancelling} onCancelClick={openCancel} onConfirmCancel={confirmCancel} onCloseCancelModal={() => { setCancelModal(false); setCancelTarget(null); }} riwayatSort={rSort} handleRiwayatSort={handleRiwayatSort} rosterNow={rosterNow} rosterStatus={rosterStatus} retReqModal={retReq} photos={photos} cropSt={cropSt} crop={crop} zoom={zoom} setZoom={setZoom} setCrop={setCrop} onCropDone={onCropDone} openRetReq={openRetReq} closeRetReq={closeRetReq} handleFileSel={handleFileSel} confirmCrop={confirmCrop} cancelCrop={cancelCrop} removePhoto={removePhoto} submitRetReq={submitRetReq} submittingRet={submittingRet} />
  );
}