// src/components/PetugasMapelView.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Modal from './modal';
import { toast } from 'react-toastify';
import { getAllMapel, addMapel, editMapel, deleteMapel } from '../pages/models/mapel-model';
import { getAllRoster, addRoster, editRoster, deleteRoster } from '../pages/models/roster-model';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaExclamationTriangle, FaTimes, FaChevronLeft, FaChevronRight, FaChevronDown, FaBook, FaCalendarAlt, FaPrint, FaTable, FaTh, FaCheckSquare, FaSquare } from 'react-icons/fa';

const HARI = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const HARI_PDF = HARI;
const TINGKAT = ['X', 'XI', 'XII'];
const JURUSAN = ['RPL', 'TKJ'];
const NOMOR = ['1', '2'];
const MAX_JP = 15;
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const TH = { padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' };
const TD = { padding: '8px 10px', borderBottom: '1px solid #f9fafb', color: '#374151', verticalAlign: 'middle', fontSize: '13px' };
const ACT = { padding: '5px', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const ARR = { padding: '4px 7px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const PALETTE = ['#dbeafe','#fce7f3','#d1fae5','#fef3c7','#ede9fe','#fee2e2','#e0e7ff','#ccfbf1','#fef9c3','#f3e8ff','#cffafe','#ffe4e6','#ecfccb','#f5f3ff','#fff7ed','#dcfce7','#fae8ff','#e0f2fe','#fef2f2','#f0fdf4'];
const getColor = id => { let h = 0; for (let i = 0; i < (id || '').length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0; return PALETTE[Math.abs(h) % PALETTE.length]; };
const Sel = ({ val, opts, onChange, ph, w }) => (<div style={{ position: 'relative', width: w || 'auto' }}><select value={val} onChange={onChange} style={{ width: '100%', paddingLeft: 8, paddingRight: 20, paddingTop: 6, paddingBottom: 6, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', appearance: 'none', cursor: 'pointer' }}><option value="">{ph}</option>{opts.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select><FaChevronDown style={{ position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 9, pointerEvents: 'none' }} /></div>);

export default function PetugasMapelView({ user, addTrigger, userList = [], teachers = [] }) {
  const printRef = useRef(null);
  const [subTab, setSubTab] = useState('mapel');
  const [mapelList, setMapelList] = useState([]);
  const [mapelLoading, setMapelLoading] = useState(true);
  const [mapelSearch, setMapelSearch] = useState('');
  const [mapelFilterJenis, setMapelFilterJenis] = useState('');
  const [mapelPage, setMapelPage] = useState(1);
  const [mapelLimit, setMapelLimit] = useState(10);
  const [mapelSort, setMapelSort] = useState({ key: null, dir: 'asc' });
  const [mapelForm, setMapelForm] = useState({ open: false, mode: 'add', data: null });
  const [mapelDel, setMapelDel] = useState({ open: false, data: null });
  const [mfd, setMfd] = useState({ nama: '', produktif: false });
  const [mErr, setMErr] = useState({});
  const [mSubmit, setMSubmit] = useState(false);
  
  // ========== BULK DELETE STATE (TAMBAHAN) ==========
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [bulkDelModal, setBulkDelModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const [rosterList, setRosterList] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilterHari, setRosterFilterHari] = useState('');
  const [rosterFilterKelas, setRosterFilterKelas] = useState('');
  const [rosterPage, setRosterPage] = useState(1);
  const [rosterLimit, setRosterLimit] = useState(10);
  const [rosterSort, setRosterSort] = useState({ key: null, dir: 'asc' });
  const [rosterView, setRosterView] = useState('data');
  const [rosterForm, setRosterForm] = useState({ open: false, mode: 'add', data: null });
  const [rosterDel, setRosterDel] = useState({ open: false, data: null });
  const [rfd, setRfd] = useState({ hari: '', selectedJPs: [], tingkat: '', jurusan: '', nomor: '', kelas: '', mapelId: '', guruId: '' });
  const [rErr, setRErr] = useState({});
  const [rSubmit, setRSubmit] = useState(false);
  const [gridKelas, setGridKelas] = useState('');

  const nameToId = useMemo(() => { const m = {}; userList.forEach(u => { if (u.nama) m[u.nama.trim().toLowerCase()] = u.id; }); return m; }, [userList]);
  const guruOpts = useMemo(() => userList.filter(u => u.role === 'guru' && u.nama).map(u => ({ value: u.id, label: u.nama })), [userList]);
  const mapelOpts = useMemo(() => mapelList.map(m => ({ value: m.id, label: m.nama })), [mapelList]);
  const loadMapel = useCallback(async () => { setMapelLoading(true); const r = await getAllMapel(); if (r.error) toast.error('Gagal: ' + r.message); else setMapelList(r.result || []); setMapelLoading(false); }, []);
  const loadRoster = useCallback(async () => { setRosterLoading(true); const r = await getAllRoster(); if (r.error) toast.error('Gagal: ' + r.message); else setRosterList(r.result || []); setRosterLoading(false); }, []);
  
  useEffect(() => { loadMapel(); loadRoster(); }, [loadMapel, loadRoster]);
  useEffect(() => { if (addTrigger > 0) { setSubTab('mapel'); setMfd({ nama: '', produktif: false }); setMErr({}); setMapelForm({ open: true, mode: 'add', data: null }); } }, [addTrigger]);
  
  // Reset bulk saat ganti tab
  useEffect(() => { setBulkMode(false); setBulkSelected(new Set()); }, [subTab]);

  // ========== MAPEL LOGIC ==========
  useEffect(() => { setMapelPage(1); }, [mapelSearch, mapelFilterJenis, mapelLimit]);
  const mapelFiltered = useMemo(() => { let r = mapelList; if (mapelSearch) { const q = mapelSearch.toLowerCase(); r = r.filter(m => m.nama?.toLowerCase().includes(q) || m.dibuatOleh?.toLowerCase().includes(q)); } if (mapelFilterJenis) r = r.filter(m => mapelFilterJenis === 'produktif' ? m.produktif : !m.produktif); return r; }, [mapelList, mapelSearch, mapelFilterJenis]);
  const mapelSorted = useMemo(() => { if (!mapelSort.key) return mapelFiltered; return [...mapelFiltered].sort((a, b) => { let va, vb; if (mapelSort.key === 'createdAt') { va = new Date(a.createdAt || 0).getTime(); vb = new Date(b.createdAt || 0).getTime(); } else { va = (a[mapelSort.key] || '').toLowerCase(); vb = (b[mapelSort.key] || '').toLowerCase(); } if (va < vb) return mapelSort.dir === 'asc' ? -1 : 1; if (va > vb) return mapelSort.dir === 'asc' ? 1 : -1; return 0; }); }, [mapelFiltered, mapelSort]);
  const mapelTP = Math.max(1, Math.ceil(mapelFiltered.length / mapelLimit));
  const mapelPag = useMemo(() => mapelSorted.slice((mapelPage - 1) * mapelLimit, (mapelPage - 1) * mapelLimit + mapelLimit), [mapelSorted, mapelPage, mapelLimit]);
  const mSort = k => { setMapelSort(p => ({ key: k, dir: p.key === k && p.dir === 'asc' ? 'desc' : 'asc' })); setMapelPage(1); };
  
  const mSubmitFn = async () => { 
    const e = {}; 
    if (!mfd.nama.trim()) e.nama = 'Wajib'; 
    else if (mfd.nama.trim().length < 3) e.nama = 'Minimal 3 huruf'; 
    if (Object.keys(e).length) { setMErr(e); toast.error(Object.values(e)[0]); return; } 
    setMSubmit(true); 
    try { 
      const r = mapelForm.mode === 'add' ? await addMapel(mfd.nama.trim(), mfd.produktif, user?.nama || 'Petugas') : await editMapel(mapelForm.data.id, mfd.nama.trim(), mfd.produktif); 
      if (r.error) toast.error(r.message); 
      else { toast.success(mapelForm.mode === 'add' ? `"${mfd.nama.trim()}" ditambahkan` : 'Diperbarui'); setMapelForm({ open: false, mode: 'add', data: null }); loadMapel(); } 
    } catch { toast.error('Gagal'); } 
    setMSubmit(false); 
  };
  
  const mDelFn = async () => { 
    if (!mapelDel.data) return; 
    const r = await deleteMapel(mapelDel.data.id); 
    if (r.error) toast.error(r.message); 
    else { toast.success(`"${mapelDel.data.nama}" dihapus`); setMapelDel({ open: false, data: null }); loadMapel(); loadRoster(); } 
  };

  // ========== BULK DELETE LOGIC (TAMBAHAN) ==========
  const toggleBulkSelect = (id) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBulkAll = () => {
    if (bulkSelected.size === mapelFiltered.length) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(mapelFiltered.map(m => m.id)));
    }
  };

  const mBulkDelFn = async () => {
    setBulkDeleting(true);
    try {
      const ids = Array.from(bulkSelected);
      const results = await Promise.all(ids.map(id => deleteMapel(id)));
      const failed = results.filter(r => r.error);
      if (failed.length > 0) {
        toast.error(`${failed.length}/${ids.length} gagal dihapus`);
      } else {
        toast.success(`${ids.length} mapel berhasil dihapus`);
        setBulkDelModal(false);
        setBulkMode(false);
        setBulkSelected(new Set());
        loadMapel();
        loadRoster();
      }
    } catch {
      toast.error('Gagal menghapus');
    }
    setBulkDeleting(false);
  };

  // ========== ROSTER LOGIC ==========
  useEffect(() => { 
    const { tingkat, jurusan, nomor } = rfd; 
    let k = ''; 
    if (tingkat) k = tingkat; 
    if (tingkat && jurusan) k = `${tingkat} ${jurusan}`; 
    if (tingkat && jurusan && nomor) k = `${tingkat} ${jurusan} ${nomor}`; 
    setRfd(p => ({ ...p, kelas: k })); 
  }, [rfd.tingkat, rfd.jurusan, rfd.nomor]);
  
  useEffect(() => { setRosterPage(1); }, [rosterSearch, rosterFilterHari, rosterFilterKelas, rosterLimit]);
  const rosterKelasOpts = useMemo(() => [...new Set(rosterList.map(r => r.kelas).filter(Boolean))].sort(), [rosterList]);
  const rosterFiltered = useMemo(() => { 
    let r = rosterList; 
    if (rosterSearch) { const q = rosterSearch.toLowerCase(); r = r.filter(x => x.mapelNama?.toLowerCase().includes(q) || x.guruNama?.toLowerCase().includes(q) || x.kelas?.toLowerCase().includes(q)); } 
    if (rosterFilterHari) r = r.filter(x => x.hari === rosterFilterHari); 
    if (rosterFilterKelas) r = r.filter(x => x.kelas === rosterFilterKelas); 
    return r; 
  }, [rosterList, rosterSearch, rosterFilterHari, rosterFilterKelas]);
  
  const rosterSorted = useMemo(() => { 
    if (!rosterSort.key) return rosterFiltered; 
    return [...rosterFiltered].sort((a, b) => { 
      let va, vb; 
      if (rosterSort.key === 'jamKe') { va = a.jamKe || 0; vb = b.jamKe || 0; return rosterSort.dir === 'asc' ? va - vb : vb - va; } 
      va = (a[rosterSort.key] || '').toLowerCase(); vb = (b[rosterSort.key] || '').toLowerCase(); 
      if (va < vb) return rosterSort.dir === 'asc' ? -1 : 1; 
      if (va > vb) return rosterSort.dir === 'asc' ? 1 : -1; 
      return 0; 
    }); 
  }, [rosterFiltered, rosterSort]);
  
  const rosterTP = Math.max(1, Math.ceil(rosterFiltered.length / rosterLimit));
  const rosterPag = useMemo(() => rosterSorted.slice((rosterPage - 1) * rosterLimit, (rosterPage - 1) * rosterLimit + rosterLimit), [rosterSorted, rosterPage, rosterLimit]);
  const rSort = k => { setRosterSort(p => ({ key: k, dir: p.key === k && p.dir === 'asc' ? 'desc' : 'asc' })); setRosterPage(1); };
  
  const onRfd = e => { 
    const { name, value } = e.target; 
    if (name === 'tingkat') setRfd(p => ({ ...p, tingkat: value, jurusan: '', nomor: '', kelas: '' })); 
    else if (name === 'jurusan') setRfd(p => ({ ...p, jurusan: value, nomor: '', kelas: value ? `${p.tingkat} ${value}` : '' })); 
    else setRfd(p => ({ ...p, [name]: value })); 
    if (rErr[name]) setRErr(p => { const n = { ...p }; delete n[name]; return n; }); 
  };
  
  const toggleJP = jp => { setRfd(p => ({ ...p, selectedJPs: p.selectedJPs.includes(jp) ? p.selectedJPs.filter(x => x !== jp) : [...p.selectedJPs, jp].sort((a, b) => a - b) })); };
  const selAllJP = () => { setRfd(p => ({ ...p, selectedJPs: p.selectedJPs.length === MAX_JP ? [] : Array.from({ length: MAX_JP }, (_, i) => i + 1) })); };

  const rSubmitFn = async () => {
    const e = {};
    if (!rfd.hari) e.hari = 'Wajib';
    if (rosterForm.mode === 'add') { if (!rfd.selectedJPs.length) e.jp = 'Pilih minimal 1 JP'; } else { if (!rfd.editJamKe || parseInt(rfd.editJamKe) < 1) e.jp = 'Wajib'; }
    if (!rfd.kelas.trim()) e.kelas = 'Wajib';
    if (!rfd.mapelId) e.mapelId = 'Wajib';
    if (!rfd.guruId) e.guruId = 'Wajib';
    if (Object.keys(e).length) { setRErr(e); toast.error(Object.values(e)[0]); return; }
    const jps = rosterForm.mode === 'add' ? rfd.selectedJPs : [parseInt(rfd.editJamKe)];
    const conflicts = jps.filter(jp => rosterList.some(r => r.hari === rfd.hari && r.kelas === rfd.kelas.trim() && r.jamKe === jp && r.id !== rosterForm.data?.id));
    if (conflicts.length) { toast.error(`Jam ${conflicts.join(',')} di ${rfd.hari} ${rfd.kelas} sudah terisi`); return; }
    setRSubmit(true);
    try {
      const payloads = jps.map(jp => ({ hari: rfd.hari, jamKe: jp, kelas: rfd.kelas.trim(), mapelId: rfd.mapelId, guruId: rfd.guruId, dibuatOleh: user?.nama }));
      const results = await Promise.all(payloads.map(p => addRoster(p)));
      const errs = results.filter(r => r.error);
      if (errs.length) toast.error(`${errs.length}/${payloads.length} gagal`); else { toast.success(`${payloads.length} jadwal ditambahkan`); setRosterForm({ open: false, mode: 'add', data: null }); loadRoster(); }
    } catch { toast.error('Gagal'); }
    setRSubmit(false);
  };
  
  const rEditFn = async () => {
    const e = {};
    if (!rfd.hari) e.hari = 'Wajib';
    if (!rfd.editJamKe || parseInt(rfd.editJamKe) < 1) e.jp = 'Wajib';
    if (!rfd.kelas.trim()) e.kelas = 'Wajib';
    if (!rfd.mapelId) e.mapelId = 'Wajib';
    if (!rfd.guruId) e.guruId = 'Wajib';
    if (Object.keys(e).length) { setRErr(e); toast.error(Object.values(e)[0]); return; }
    const jp = parseInt(rfd.editJamKe);
    if (rosterList.some(r => r.hari === rfd.hari && r.kelas === rfd.kelas.trim() && r.jamKe === jp && r.id !== rosterForm.data?.id)) { toast.error(`Jam ${jp} sudah terisi`); return; }
    setRSubmit(true);
    try { const r = await editRoster(rosterForm.data.id, { hari: rfd.hari, jamKe: jp, kelas: rfd.kelas.trim(), mapelId: rfd.mapelId, guruId: rfd.guruId }); if (r.error) toast.error(r.message); else { toast.success('Diperbarui'); setRosterForm({ open: false, mode: 'add', data: null }); loadRoster(); } } catch { toast.error('Gagal'); }
    setRSubmit(false);
  };
  
  const rDelFn = async () => { if (!rosterDel.data) return; const r = await deleteRoster(rosterDel.data.id); if (r.error) toast.error(r.message); else { toast.success('Dihapus'); setRosterDel({ open: false, data: null }); loadRoster(); } };
  const openRAdd = () => { setRfd({ hari: '', selectedJPs: [], tingkat: '', jurusan: '', nomor: '', kelas: '', mapelId: '', guruId: '' }); setRErr({}); setRosterForm({ open: true, mode: 'add', data: null }); };
  const openREdit = item => { let t = '', j = '', n = ''; if (item.kelas) { const p = item.kelas.trim().split(/\s+/); if (p.length >= 1) t = p[0]; if (p.length >= 2) j = p[1]; if (p.length >= 3) n = p[2]; } setRfd({ hari: item.hari || '', selectedJPs: [], editJamKe: item.jamKe || '', tingkat: t, jurusan: j, nomor: n, kelas: item.kelas || '', mapelId: item.mapelId || '', guruId: item.guruId || '' }); setRErr({}); setRosterForm({ open: true, mode: 'edit', data: item }); };

  // ========== GRID VIEW DATA ==========
  const gridKelasList = useMemo(() => [...new Set(rosterList.map(r => r.kelas).filter(Boolean))].sort(), [rosterList]);
  const gridFilteredKelas = useMemo(() => gridKelas.length ? (gridKelas ? [gridKelas] : gridKelasList) : [], [gridKelas, gridKelasList]);
  const gridData = useMemo(() => {
    const maxJam = rosterList.length ? Math.max(...rosterList.map(r => r.jamKe || 0)) : 0;
    const map = {};
    rosterList.forEach(r => { if (!map[r.kelas]) map[r.kelas] = {}; if (!map[r.kelas][r.jamKe]) map[r.kelas][r.jamKe] = {}; map[r.kelas][r.jamKe][r.hari] = { mapelNama: r.mapelNama, guruNama: r.guruNama, mapelId: r.mapelId }; });
    return { maxJam: Math.max(maxJam, 1), map };
  }, [rosterList]);

  const Th = (label, key, w) => { const s = subTab === 'mapel' ? mapelSort : rosterSort; const a = s.key === key; const fn = subTab === 'mapel' ? mSort : rSort; return <th onClick={() => fn(key)} style={{ ...TH, cursor: 'pointer', userSelect: 'none', width: w || 'auto' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label}<span style={{ fontSize: 9, color: a ? '#7c3aed' : '#d1d5db' }}>{a ? (s.dir === 'asc' ? '▲' : '▼') : '⇅'}</span></span></th>; };
  
  const Pagi = ({ page, setPage, tp, limit, setLimit, total }) => (total > 0 ? <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 6 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}><span>Tampilkan</span><div style={{ position: 'relative' }}><select value={limit} onChange={e => setLimit(+e.target.value)} style={{ paddingLeft: 4, paddingRight: 16, paddingTop: 3, paddingBottom: 3, border: '1px solid #d1d5db', borderRadius: 4, fontSize: 11, outline: 'none', background: '#fff', appearance: 'none' }}>{[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}</select><FaChevronDown style={{ position: 'absolute', top: '50%', right: 4, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 8, pointerEvents: 'none' }} /></div><span>dari {total}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...ARR, opacity: page === 1 ? 0.4 : 1 }}><FaChevronLeft /></button>{Array.from({ length: Math.min(tp, 5) }, (_, i) => { let pn = tp <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, tp - 4)) + i; return pn > tp ? null : <button key={pn} type="button" onClick={() => setPage(pn)} style={{ padding: '4px 9px', borderRadius: 4, fontSize: 12, fontWeight: page === pn ? 600 : 500, background: page === pn ? '#7c3aed' : '#f3f4f6', color: page === pn ? '#fff' : '#374151', border: 'none', cursor: 'pointer' }}>{pn}</button>; })}<button type="button" onClick={() => setPage(p => Math.min(tp, p + 1))} disabled={page === tp} style={{ ...ARR, opacity: page === tp ? 0.4 : 1 }}><FaChevronRight /></button></div></div> : null);
  
  const Spin = () => <span className="animate-spin" style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block' }} />;
  
  // ========== PRINT AMAN (TANPA CSS @media print) ==========
  const handlePrint = () => {
    const kelasToPrint = gridFilteredKelas.length === 1 ? gridFilteredKelas[0] : gridKelas;
    if (!kelasToPrint) {
      toast.error('Pilih kelas terlebih dahulu');
      return;
    }
    
    const kelasData = gridData.map[kelasToPrint] || {};
    let tableRows = '';
    for (let jam = 1; jam <= gridData.maxJam; jam++) {
      let cells = `<td style="padding:6px;text-align:center;font-weight:600;background:${jam % 2 === 0 ? '#f9fafb' : '#fff'}">${jam}</td>`;
      HARI_PDF.forEach(hari => {
        const cell = kelasData[jam]?.[hari];
        if (cell) {
          cells += `<td style="padding:6px 8px;background:${getColor(cell.mapelId)}"><div style="font-weight:600;font-size:11px">${cell.mapelNama}</div><div style="font-size:10px;color:#666">${cell.guruNama}</div></td>`;
        } else {
          cells += `<td style="padding:6px;background:${jam % 2 === 0 ? '#f9fafb' : '#fff'}"></td>`;
        }
      });
      tableRows += `<tr>${cells}</tr>`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up diblokir browser');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Jadwal ${kelasToPrint}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #7c3aed;padding-bottom:15px;margin-bottom:20px}
    .title{background:#7c3aed;color:white;padding:10px 16px;font-weight:700;border-radius:8px 8px 0 0}
    table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:8px;border:1px solid #e5e7eb;font-size:11px;text-align:center}
    td{padding:6px;border:1px solid #f0f0f0;font-size:12px}@page{size:landscape;margin:10mm}
    </style></head><body>
    <div class="header"><img src="/Logo-1.png" height="50" onerror="this.style.display='none'"/><div style="text-align:center"><h2>JADWAL PELAJARAN</h2><p style="font-size:12px;color:#666">Tahun Ajaran 2024/2025</p></div><div style="width:60px"></div></div>
    <div class="title">${kelasToPrint}</div>
    <table><thead><tr><th>JP</th>${HARI_PDF.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
    <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:10px;border-top:2px solid #7c3aed;font-size:11px;color:#666">
    <span>Dicetak: ${new Date().toLocaleString('id-ID')}</span><span>Oleh: ${user?.nama || 'Petugas'}</span></div>
    <script>setTimeout(()=>window.print(),500)<\/script></body></html>`);
    printWindow.document.close();
  };

  if (subTab === 'mapel' ? mapelLoading : rosterLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}><div className="animate-spin" style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#7c3aed' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 2, background: '#f3f4f6', padding: 3, borderRadius: 8, width: 'fit-content' }}>
          {[{ key: 'mapel', label: 'Mapel' }, { key: 'roster', label: 'Roster Jadwal' }].map(t => (<button key={t.key} type="button" onClick={() => setSubTab(t.key)} style={{ padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: subTab === t.key ? 600 : 500, border: 'none', cursor: 'pointer', background: subTab === t.key ? '#fff' : 'transparent', color: subTab === t.key ? '#7c3aed' : '#6b7280', boxShadow: subTab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>{t.label}</button>))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* BULK DELETE BUTTON (TAMBAHAN) */}
          {subTab === 'mapel' && (
            <button type="button" onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: bulkMode ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: bulkMode ? '#fef2f2' : '#fff', color: bulkMode ? '#ef4444' : '#6b7280', fontWeight: 500 }}>
              <FaTrash style={{ fontSize: 11 }} />
              {bulkMode ? 'Batal' : 'Hapus'}
            </button>
          )}
          {subTab === 'roster' && (
            <button type="button" onClick={openRAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              <FaPlus style={{ fontSize: 11 }} />Tambah Jadwal
            </button>
          )}
        </div>
      </div>

      {/* BULK SELECTION BAR (TAMBAHAN) */}
      {bulkMode && bulkSelected.size > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 10, color: '#fff' }}>
          <button type="button" onClick={toggleBulkAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {bulkSelected.size === mapelFiltered.length ? <FaCheckSquare style={{ fontSize: 16 }} /> : <FaSquare style={{ fontSize: 16 }} />}
            <span>{bulkSelected.size === mapelFiltered.length ? 'Batal Pilih Semua' : 'Pilih Semua'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{bulkSelected.size} dipilih</span>
            <button type="button" onClick={() => setBulkDelModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              <FaTrash style={{ fontSize: 11 }} />Hapus
            </button>
          </div>
        </div>
      )}

      {/* ========== MAPEL TAB ========== */}
      {subTab === 'mapel' && (<>
        <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 150 }}><FaSearch style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 11, pointerEvents: 'none' }} /><input type="text" value={mapelSearch} onChange={e => setMapelSearch(e.target.value)} placeholder="Cari nama mapel..." style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} /></div>
            <Sel val={mapelFilterJenis} opts={[{ value: 'produktif', label: 'Produktif' }, { value: 'non', label: 'Non-Produktif' }]} onChange={e => setMapelFilterJenis(e.target.value)} ph="Semua Jenis" w="140px" />
            <button type="button" onClick={() => { setMapelSearch(''); setMapelFilterJenis(''); }} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}><FaTimes style={{ fontSize: 9 }} /> Reset</button>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '6px 0 0' }}><b style={{ color: '#6b7280' }}>{mapelFiltered.length}</b> dari <b style={{ color: '#6b7280' }}>{mapelList.length}</b> mapel</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>
            {/* BULK CHECKBOX COLUMN (TAMBAHAN) */}
            {bulkMode && <th style={{ ...TH, width: 40, textAlign: 'center' }}><input type="checkbox" checked={bulkSelected.size === mapelFiltered.length && mapelFiltered.length > 0} onChange={toggleBulkAll} style={{ cursor: 'pointer', accentColor: '#7c3aed' }} /></th>}
            <th style={{ ...TH, width: 44, textAlign: 'center' }}>No</th>{Th('Nama Mapel', 'nama')}{Th('Jenis', 'produktif', '120px')}{Th('Dibuat Oleh', 'dibuatOleh')}{Th('Dibuat', 'createdAt')}<th style={{ ...TH, width: 80, textAlign: 'center' }}>Aksi</th>
          </tr></thead><tbody>
            {mapelPag.length > 0 ? mapelPag.map((m, i) => { const cid = m.dibuatOleh ? nameToId[m.dibuatOleh.trim().toLowerCase()] : null; return (<tr key={m.id} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              {/* BULK CHECKBOX CELL (TAMBAHAN) */}
              {bulkMode && <td style={{ ...TD, textAlign: 'center' }}><input type="checkbox" checked={bulkSelected.has(m.id)} onChange={() => toggleBulkSelect(m.id)} style={{ cursor: 'pointer', accentColor: '#7c3aed' }} /></td>}
              <td style={{ ...TD, textAlign: 'center', color: '#9ca3af' }}>{(mapelPage - 1) * mapelLimit + i + 1}</td><td style={{ ...TD, fontWeight: 500, color: '#111827' }}>{m.nama}</td><td style={TD}>{m.produktif ? <span style={{ padding: '2px 10px', backgroundColor: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, borderRadius: 9999, border: '1px solid #bbf7d0' }}>Produktif</span> : <span style={{ padding: '2px 10px', backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 11, fontWeight: 500, borderRadius: 9999, border: '1px solid #e5e7eb' }}>Non-Produktif</span>}</td><td style={TD}>{m.dibuatOleh ? (cid ? <a href={`#/profile/${cid}`} onClick={e => { e.preventDefault(); window.location.hash = `#/profile/${cid}`; }} style={{ color: '#7c3aed', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>{m.dibuatOleh}</a> : <span>{m.dibuatOleh}</span>) : <span style={{ color: '#d1d5db' }}>—</span>}</td><td style={{ ...TD, fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{fmtDate(m.createdAt)}</td><td style={{ ...TD, textAlign: 'center' }}><span style={{ display: 'inline-flex', gap: 2 }}><button type="button" onClick={() => { setMfd({ nama: m.nama || '', produktif: !!m.produktif }); setMErr({}); setMapelForm({ open: true, mode: 'edit', data: m }); }} style={ACT} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><FaEdit style={{ fontSize: 12, color: '#2563eb' }} /></button><button type="button" onClick={() => setMapelDel({ open: true, data: m })} style={ACT} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Hapus"><FaTrash style={{ fontSize: 12, color: '#ef4444' }} /></button></span></td>
            </tr>); }) : (<tr><td colSpan={bulkMode ? 7 : 6} style={{ padding: '36px 20px', textAlign: 'center' }}><FaBook style={{ fontSize: 28, color: '#d1d5db', display: 'block', margin: '0 auto 8px' }} /><p style={{ fontWeight: 500, color: '#6b7280', margin: 0, fontSize: 13 }}>Belum ada data</p></td></tr>)}
          </tbody></table></div>
          <Pagi page={mapelPage} setPage={setMapelPage} tp={mapelTP} limit={mapelLimit} setLimit={setMapelLimit} total={mapelFiltered.length} />
        </div>
      </>)}

      {/* ========== ROSTER TAB ========== */}
      {subTab === 'roster' && (<>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2, background: '#f3f4f6', padding: 2, borderRadius: 6 }}>
            {[['data', 'Data', FaTable], ['jadwal', 'Jadwal', FaTh]].map(([k, l, Ic]) => (
              <button key={k} type="button" onClick={() => setRosterView(k)} style={{ padding: '5px 14px', borderRadius: 4, fontSize: 12, fontWeight: rosterView === k ? 600 : 500, border: 'none', cursor: 'pointer', background: rosterView === k ? '#fff' : 'transparent', color: rosterView === k ? '#7c3aed' : '#6b7280', boxShadow: rosterView === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none', display: 'flex', alignItems: 'center', gap: 5 }}><Ic style={{ fontSize: 11 }} />{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {rosterView === 'jadwal' && <Sel val={gridKelas} opts={[{ value: '', label: 'Semua Kelas' }, ...gridKelasList.map(k => ({ value: k, label: k }))]} onChange={e => setGridKelas(e.target.value)} ph="Semua" w="140px" />}
            {rosterView === 'jadwal' && <button type="button" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}><FaPrint style={{ fontSize: 11 }} />Cetak / PDF</button>}
          </div>
        </div>

        {/* DATA VIEW */}
        {rosterView === 'data' && (<>
          <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 150 }}><FaSearch style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 11, pointerEvents: 'none' }} /><input type="text" value={rosterSearch} onChange={e => setRosterSearch(e.target.value)} placeholder="Cari..." style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} /></div>
              <Sel val={rosterFilterHari} opts={HARI} onChange={e => setRosterFilterHari(e.target.value)} ph="Hari" w="110px" />
              <Sel val={rosterFilterKelas} opts={rosterKelasOpts} onChange={e => setRosterFilterKelas(e.target.value)} ph="Kelas" w="110px" />
              <button type="button" onClick={() => { setRosterSearch(''); setRosterFilterHari(''); setRosterFilterKelas(''); }} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}><FaTimes style={{ fontSize: 9 }} /></button>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '6px 0 0' }}><b style={{ color: '#6b7280' }}>{rosterFiltered.length}</b> jadwal</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ ...TH, width: 44, textAlign: 'center' }}>No</th>{Th('Hari', 'hari', '80px')}{Th('Jam', 'jamKe', '60px')}{Th('Kelas', 'kelas', '90px')}{Th('Mapel', 'mapelNama')}{Th('Guru', 'guruNama')}<th style={{ ...TH, width: 70, textAlign: 'center' }}>Aksi</th></tr></thead><tbody>
              {rosterPag.length > 0 ? rosterPag.map((r, i) => (<tr key={r.id} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><td style={{ ...TD, textAlign: 'center', color: '#9ca3af' }}>{(rosterPage - 1) * rosterLimit + i + 1}</td><td style={TD}><span style={{ padding: '2px 8px', backgroundColor: '#eef2ff', color: '#4338ca', fontSize: 11, fontWeight: 600, borderRadius: 9999, border: '1px solid #c7d2fe' }}>{r.hari}</span></td><td style={{ ...TD, textAlign: 'center', fontWeight: 600 }}>{r.jamKe}</td><td style={TD}><span style={{ padding: '2px 8px', backgroundColor: '#f0fdf4', color: '#166534', fontSize: 12, fontWeight: 500, borderRadius: 9999, border: '1px solid #bbf7d0' }}>{r.kelas}</span></td><td style={{ ...TD, fontWeight: 500 }}>{r.mapelNama || '-'}</td><td style={TD}>{r.guruNama || '-'}</td><td style={{ ...TD, textAlign: 'center' }}><span style={{ display: 'inline-flex', gap: 2 }}><button type="button" onClick={() => openREdit(r)} style={ACT} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><FaEdit style={{ fontSize: 12, color: '#2563eb' }} /></button><button type="button" onClick={() => setRosterDel({ open: true, data: r })} style={ACT} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><FaTrash style={{ fontSize: 12, color: '#ef4444' }} /></button></span></td></tr>)) : (<tr><td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center' }}><FaCalendarAlt style={{ fontSize: 28, color: '#d1d5db', display: 'block', margin: '0 auto 8px' }} /><p style={{ fontWeight: 500, color: '#6b7280', margin: 0, fontSize: 13 }}>Belum ada jadwal</p></td></tr>)}
            </tbody></table></div>
            <Pagi page={rosterPage} setPage={setRosterPage} tp={rosterTP} limit={rosterLimit} setLimit={setRosterLimit} total={rosterFiltered.length} />
          </div>
        </>)}

        {/* JADWAL VIEW (GRID INFOGRAFIS) */}
        {rosterView === 'jadwal' && (<div ref={printRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {gridFilteredKelas.length > 0 ? gridFilteredKelas.map(kelas => {
            const kelasData = gridData.map[kelas] || {};
            return (
              <div key={kelas} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)', color: '#fff' }}><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{kelas}</h3></div>
                <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr><th style={{ padding: '8px 6px', background: '#f9fafb', fontWeight: 600, color: '#6b7280', fontSize: 11, textAlign: 'center', borderBottom: '2px solid #e5e7eb', width: 50 }}>JP</th>{HARI_PDF.map(h => (<th key={h} style={{ padding: '8px 6px', background: '#f9fafb', fontWeight: 600, color: '#6b7280', fontSize: 10, textAlign: 'center', borderBottom: '2px solid #e5e7eb', minWidth: 120, textTransform: 'uppercase' }}>{h}</th>))}</tr></thead>
                  <tbody>{Array.from({ length: gridData.maxJam }, (_, i) => i + 1).map(jam => (<tr key={jam}><td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 600, color: '#9ca3af', borderBottom: '1px solid #f3f4f6', background: jam % 2 === 0 ? '#fafafa' : '#fff', fontSize: 12 }}>{jam}</td>{HARI_PDF.map(hari => { const cell = kelasData[jam]?.[hari]; return (<td key={hari} style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', background: cell ? getColor(cell.mapelId) : (jam % 2 === 0 ? '#fafafa' : '#fff'), minHeight: 40, verticalAlign: 'middle', borderLeft: '1px solid #f3f4f6' }}>{cell ? (<><div style={{ fontWeight: 600, color: '#1f2937', fontSize: 12, lineHeight: 1.2 }}>{cell.mapelNama}</div><div style={{ color: '#6b7280', fontSize: 10, lineHeight: 1.2 }}>{cell.guruNama}</div></>) : null}</td>); })}</tr>))}</tbody>
                </table></div>
              </div>
            );
          }) : (<div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 10, border: '1px solid #f3f4f6' }}><FaCalendarAlt style={{ fontSize: 40, color: '#d1d5db', display: 'block', margin: '0 auto 12px' }} /><p style={{ fontWeight: 500, color: '#6b7280', margin: 0, fontSize: 14 }}>Belum ada data roster</p><p style={{ color: '#9ca3af', margin: '4px 0 0', fontSize: 13 }}>Tambahkan jadwal terlebih dahulu</p></div>)}
        </div>)}
      </>)}

      {/* ========== MODALS ========== */}

      {/* MODAL: MAPEL FORM */}
      <Modal isOpen={mapelForm.open} onClose={() => setMapelForm({ open: false, mode: 'add', data: null })} title={mapelForm.mode === 'add' ? 'Tambah Mapel' : 'Edit Mapel'} size="sm">
        <div>
          <div style={{ marginBottom: 12 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Nama Mapel <span style={{ color: '#ef4444' }}>*</span></label><input type="text" value={mfd.nama} onChange={e => { setMfd(p => ({ ...p, nama: e.target.value })); if (mErr.nama) setMErr(p => { const n = { ...p }; delete n.nama; return n; }); }} placeholder="Contoh: Pemrograman Dasar" style={{ width: '100%', padding: '7px 10px', border: `1px solid ${mErr.nama ? '#ef4444' : '#d1d5db'}`, borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', ...(mErr.nama ? { boxShadow: '0 0 0 2px rgba(239,68,68,0.1)' } : {}) }} autoFocus onKeyDown={e => e.key === 'Enter' && mSubmitFn()} />{mErr.nama && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{mErr.nama}</p>}</div>
          <div style={{ marginBottom: 12 }}><label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}><input type="checkbox" checked={mfd.produktif} onChange={e => setMfd(p => ({ ...p, produktif: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />Mapel Produktif</label></div>
          {mapelForm.mode === 'add' && (<div style={{ fontSize: 11, color: '#6b7280', background: '#f5f3ff', padding: '8px 10px', borderRadius: 6, border: '1px solid #e9e5ff', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><span style={{ width: 18, height: 18, borderRadius: '50%', background: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{(user?.nama || 'P')[0].toUpperCase()}</span>Dibuat oleh: <b style={{ color: '#6d28d9' }}>{user?.nama || 'Petugas'}</b></div>)}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}><button type="button" onClick={() => setMapelForm({ open: false, mode: 'add', data: null })} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Batal</button><button type="button" onClick={mSubmitFn} disabled={mSubmit} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#7c3aed', border: 'none', borderRadius: 6, cursor: mSubmit ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: mSubmit ? 0.5 : 1 }}>{mSubmit ? <><Spin /> Menyimpan...</> : mapelForm.mode === 'add' ? 'Tambah' : 'Simpan'}</button></div>
        </div>
      </Modal>

      {/* MODAL: MAPEL DELETE */}
      <Modal isOpen={mapelDel.open} onClose={() => setMapelDel({ open: false, data: null })} title="Hapus Mapel" size="sm">
        <div style={{ textAlign: 'center' }}><div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid #fecaca' }}><FaExclamationTriangle style={{ fontSize: 22, color: '#ef4444' }} /></div><p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>Yakin menghapus:</p><div style={{ padding: '6px 12px', background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', fontWeight: 700, color: '#111827', fontSize: 14 }}>"{mapelDel.data?.nama}"</div></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 16 }}><button type="button" onClick={() => setMapelDel({ open: false, data: null })} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Batal</button><button type="button" onClick={mDelFn} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Ya, Hapus</button></div>
      </Modal>

      {/* MODAL: BULK DELETE (TAMBAHAN) */}
      <Modal isOpen={bulkDelModal} onClose={() => setBulkDelModal(false)} title="Hapus Mapel" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid #fecaca' }}><FaExclamationTriangle style={{ fontSize: 22, color: '#ef4444' }} /></div>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>Yakin ingin menghapus <b style={{ color: '#ef4444' }}>{bulkSelected.size} mapel</b> yang dipilih?</p>
          <p style={{ fontSize: 11, color: '#f59e0b', margin: '4px 0 0' }}>Roster terkait tidak otomatis terhapus</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 16 }}>
          <button type="button" onClick={() => setBulkDelModal(false)} disabled={bulkDeleting} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Batal</button>
          <button type="button" onClick={mBulkDelFn} disabled={bulkDeleting} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#ef4444', border: 'none', borderRadius: 6, cursor: bulkDeleting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: bulkDeleting ? 0.5 : 1 }}>
            {bulkDeleting ? <><Spin /> Menghapus...</> : `Ya, Hapus ${bulkSelected.size} Mapel`}
          </button>
        </div>
      </Modal>

      {/* MODAL: ROSTER FORM */}
      <Modal isOpen={rosterForm.open} onClose={() => setRosterForm({ open: false, mode: 'add', data: null })} title={rosterForm.mode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'} size="sm">
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Hari <span style={{ color: '#ef4444' }}>*</span></label><Sel val={rfd.hari} opts={HARI} onChange={e => onRfd({ target: { name: 'hari', value: e.target.value } })} ph="-- Pilih --" />{rErr.hari && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{rErr.hari}</p>}</div>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Kelas <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}><Sel val={rfd.tingkat} opts={TINGKAT} onChange={e => onRfd({ target: { name: 'tingkat', value: e.target.value } })} ph="Tingkat" /><Sel val={rfd.jurusan} opts={rfd.tingkat ? JURUSAN : []} onChange={e => onRfd({ target: { name: 'jurusan', value: e.target.value } })} ph="Jurusan" /><Sel val={rfd.nomor} opts={rfd.jurusan ? NOMOR : []} onChange={e => onRfd({ target: { name: 'nomor', value: e.target.value } })} ph="No" /></div>
              {rfd.kelas && <p style={{ fontSize: 11, color: '#166534', margin: '4px 0 0', fontWeight: 500 }}>{rfd.kelas}</p>}{rErr.kelas && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{rErr.kelas}</p>}
            </div>
          </div>
          {rosterForm.mode === 'add' ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><label style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>Jam Pelajaran <span style={{ color: '#ef4444' }}>*</span></label><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 11, color: rfd.selectedJPs.length ? '#7c3aed' : '#9ca3af', fontWeight: 600 }}>{rfd.selectedJPs.length} JP dipilih</span><button type="button" onClick={selAllJP} style={{ padding: '2px 8px', fontSize: 10, fontWeight: 500, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #e9e5ff', borderRadius: 4, cursor: 'pointer' }}>{rfd.selectedJPs.length === MAX_JP ? 'Hapus Semua' : 'Pilih Semua'}</button></div></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{Array.from({ length: MAX_JP }, (_, i) => i + 1).map(jp => { const sel = rfd.selectedJPs.includes(jp); return (<button key={jp} type="button" onClick={() => toggleJP(jp)} style={{ padding: '5px 0', width: 38, borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: sel ? '#7c3aed' : '#e5e7eb', background: sel ? '#7c3aed' : '#fff', color: sel ? '#fff' : '#374151', transition: 'all 0.1s' }}>{jp}</button>); })}</div>
              {rErr.jp && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{rErr.jp}</p>}
            </div>
          ) : (
            <div style={{ marginBottom: 10 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Jam Ke <span style={{ color: '#ef4444' }}>*</span></label><input type="number" name="editJamKe" value={rfd.editJamKe} onChange={onRfd} placeholder="1" min="1" style={{ width: '100%', padding: '7px 10px', border: `1px solid ${rErr.jp ? '#ef4444' : '#d1d5db'}`, borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />{rErr.jp && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{rErr.jp}</p>}</div>
          )}
          <div style={{ marginBottom: 10 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Mapel <span style={{ color: '#ef4444' }}>*</span></label><Sel val={rfd.mapelId} opts={mapelOpts} onChange={e => onRfd({ target: { name: 'mapelId', value: e.target.value } })} ph="-- Pilih Mapel --" />{rErr.mapelId && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{rErr.mapelId}</p>}</div>
          <div style={{ marginBottom: 12 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Guru <span style={{ color: '#ef4444' }}>*</span></label><Sel val={rfd.guruId} opts={guruOpts} onChange={e => onRfd({ target: { name: 'guruId', value: e.target.value } })} ph="-- Pilih Guru --" />{rErr.guruId && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{rErr.guruId}</p>}{guruOpts.length === 0 && <p style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>Tambah guru di tab User terlebih dahulu.</p>}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}><button type="button" onClick={() => setRosterForm({ open: false, mode: 'add', data: null })} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Batal</button><button type="button" onClick={rosterForm.mode === 'add' ? rSubmitFn : rEditFn} disabled={rSubmit} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#7c3aed', border: 'none', borderRadius: 6, cursor: rSubmit ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: rSubmit ? 0.5 : 1 }}>{rSubmit ? <><Spin /> Menyimpan...</> : rosterForm.mode === 'add' ? `Tambah (${rfd.selectedJPs.length})` : 'Simpan'}</button></div>
        </div>
      </Modal>

      {/* MODAL: ROSTER DELETE */}
      <Modal isOpen={rosterDel.open} onClose={() => setRosterDel({ open: false, data: null })} title="Hapus Jadwal" size="sm">
        <div style={{ textAlign: 'center' }}><div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid #fecaca' }}><FaExclamationTriangle style={{ fontSize: 22, color: '#ef4444' }} /></div><p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>Hapus jadwal:</p><div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}><b>{rosterDel.data?.hari}</b> · Jam <b>{rosterDel.data?.jamKe}</b> · <b>{rosterDel.data?.kelas}</b><br /><span style={{ color: '#6b7280' }}>{rosterDel.data?.mapelNama} — {rosterDel.data?.guruNama}</span></div></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 16 }}><button type="button" onClick={() => setRosterDel({ open: false, data: null })} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Batal</button><button type="button" onClick={rDelFn} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Ya, Hapus</button></div>
      </Modal>
    </div>
  );
}