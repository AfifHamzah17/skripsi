import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTachometerAlt, FaHandHolding, FaTools, FaSync, FaBook, FaSearch, FaTimesCircle, FaChartPie, FaArrowUp, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaExpand, FaExternalLinkAlt, FaCalendarAlt, FaInfoCircle, FaClipboardList, FaWhatsapp } from 'react-icons/fa';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';
import Modal from '../../components/modal';
import HoverCard from '../../components/HoverCard';
import MapelSelector from '../../components/MapelSelector';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

const fmt = tgl => tgl ? new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const fmtTime = tgl => tgl ? new Date(tgl).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

const StatusBadge = ({ status }) => {
  const m = { pending: 'bg-amber-50 text-amber-700 border border-amber-200', disetujui: 'bg-emerald-50 text-emerald-700 border border-emerald-200', kembali: 'bg-blue-50 text-blue-700 border border-blue-200', ditolak: 'bg-red-50 text-red-700 border border-red-200', dibatalkan: 'bg-gray-100 text-gray-600 border border-gray-200' };
  const lbl = { pending: 'Menunggu', disetujui: 'Dipinjam', kembali: 'Selesai', ditolak: 'Ditolak', dibatalkan: 'Dibatalkan' };
  return <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${m[status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>{lbl[status] || status}</span>;
};
const KondisiBadge = ({ kondisi }) => {
  const m = { baik: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 'rusak berat': 'bg-red-50 text-red-700 border border-red-200', kurang: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${m[kondisi] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>{kondisi}</span>;
};
const SortableTh = ({ label, sortKey, sort, onSort, className }) => {
  const a = sort.key === sortKey;
  return <th onClick={() => onSort(sortKey)} className={`cursor-pointer hover:text-blue-600 select-none whitespace-nowrap ${className || ''}`}><span className="flex items-center gap-1">{label}<span className={`text-[10px] ${a ? 'text-blue-500' : 'text-gray-300'}`}>{a ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}</span></span></th>;
};
const EmptyState = ({ icon: Icon, message }) => (
  <div className="text-center py-12 px-4"><div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><Icon className="text-xl text-gray-400" /></div><h3 className="text-sm font-semibold text-gray-600">{message}</h3></div>
);
const Pag = ({ page, setPage, totalPages, limit, setLimit, totalData }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-white">
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 sm:mb-0"><span>Tampilkan</span><select value={limit} onChange={e => { const v = e.target.value; if (v === 'custom') { const cv = prompt('Jumlah:'); if (!cv) return; setLimit(parseInt(cv, 10) || 10); } else setLimit(parseInt(v, 10)); }} className="px-2 py-1 border rounded-md text-xs bg-white"><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="custom">Custom</option></select><span>dari {totalData}</span></div>
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><FaChevronLeft className="text-xs" /></button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => { let pn = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i; if (pn > totalPages) return null; return <button key={pn} type="button" onClick={() => setPage(pn)} className={`px-3 py-1 rounded-md text-xs font-medium ${page === pn ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>{pn}</button>; })}
      <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><FaChevronRight className="text-xs" /></button>
    </div>
  </div>
);

/* ═══ INLINE: Hubungi Admin (fallback multi-endpoint) ═══ */
const AdminBtn = () => {
  const [s, setS] = useState({ open: false, list: [], load: false, err: '' });
  const toggle = async () => {
    if (s.open) return setS(p => ({ ...p, open: false }));
    setS(p => ({ ...p, open: true, load: true, err: '' }));
    const t = localStorage.getItem('token'), h = { Authorization: 'Bearer ' + t }, base = import.meta.env.VITE_API_BASE;
    for (const ep of ['/users?role=petugas', '/users/petugas']) {
      try {
        const r = await fetch(base + ep, { headers: h });
        if (!r.ok) continue;
        const d = await r.json();
        const arr = Array.isArray(d) ? d : d?.result ? (Array.isArray(d.result) ? d.result : [d.result]) : [];
        const pt = arr.filter(u => u.role === 'petugas');
        if (pt.length) return setS(p => ({ ...p, load: false, list: pt }));
      } catch { /* next */ }
    }
    setS(p => ({ ...p, load: false, err: 'Gagal memuat kontak admin' }));
  };
  const wa = p => 'https://wa.me/62' + (p || '').replace(/\D/g, '').replace(/^0/, '');
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><FaWhatsapp style={{ fontSize: 14 }} />Hubungi Admin</button>
      {s.open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', width: 260, zIndex: 50, overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Kontak Petugas</div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {s.load ? <div style={{ padding: 16, textAlign: 'center' }}><div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#16a34a', animation: 'spin 0.6s linear infinite', margin: '0 auto' }} /></div>
              : s.err ? <p style={{ padding: '10px 12px', fontSize: 12, color: '#ef4444', margin: 0 }}>{s.err}</p>
              : s.list.map(c => (
                <a key={c.id} href={wa(c.nohp)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', textDecoration: 'none', color: '#111827', borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaWhatsapp style={{ fontSize: 13, color: '#16a34a' }} /></span>
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{c.nama}</p><p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{c.nohp || '-'}</p></div>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══ DASHBOARD ═══ */
const DashboardTab = ({ statistics, chartData }) => (
  <div className="space-y-5">
    <DashboardGrid statistics={statistics} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center"><FaChartPie className="text-xs text-indigo-500" /></span>Tracking Penggunaan</h3>
        <div className="flex items-center justify-center" style={{ height: 240 }}>{statistics.totalPeminjaman > 0 ? <div className="w-full h-full"><Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } }, cutout: '62%' }} /></div> : <EmptyState icon={FaChartPie} message="Belum ada data" />}</div>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><span className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center"><FaTachometerAlt className="text-xs text-blue-500" /></span>Detail Aktivitas</h3>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex justify-between items-center"><span className="text-xs text-blue-600 font-medium">Total Terlibat</span><span className="text-xl font-bold text-blue-700">{statistics.totalPeminjaman || 0}<span className="text-xs font-normal ml-1">kali</span></span></div>
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Rincian per Mapel:</h4>
        <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
          {statistics.mapelStats && Object.keys(statistics.mapelStats).length > 0 ? Object.entries(statistics.mapelStats).map(([mapel, count]) => { const pct = (count / (statistics.totalPeminjaman || 1)) * 100; return (<div key={mapel}><div className="flex justify-between text-xs mb-1"><span className="font-medium text-gray-700">{mapel}</span><span className="text-gray-400">{count}x ({pct.toFixed(0)}%)</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div></div>); })
            : <p className="text-gray-400 italic text-xs">Tidak ada data mapel.</p>}
        </div>
      </div>
    </div>
  </div>
);

/* ═══ PEMINJAMAN ═══ */
const PeminjamanTab = ({ peminjamans }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ key: '', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const handleSort = k => setSort(p => p.key === k ? { ...p, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' });
  const filtered = useMemo(() => {
    let d = [...peminjamans];
    if (search) { const q = search.toLowerCase(); d = d.filter(r => (r.user?.nama || '').toLowerCase().includes(q) || (r.user?.kelas || '').toLowerCase().includes(q) || (r.alat?.nama || '').toLowerCase().includes(q) || (r.mapel || '').toLowerCase().includes(q)); }
    if (status !== 'all') d = d.filter(r => r.status === status);
    if (sort.key) d.sort((a, b) => { let va, vb; switch (sort.key) { case 'siswa': va = (a.user?.nama || '').toLowerCase(); vb = (b.user?.nama || '').toLowerCase(); break; case 'kelas': va = (a.user?.kelas || '').toLowerCase(); vb = (b.user?.kelas || '').toLowerCase(); break; case 'mapel': va = (a.mapel || '').toLowerCase(); vb = (b.mapel || '').toLowerCase(); break; case 'alat': va = (a.alat?.nama || '').toLowerCase(); vb = (b.alat?.nama || '').toLowerCase(); break; case 'tanggal': va = a.tanggalPeminjaman || ''; vb = b.tanggalPeminjaman || ''; break; default: return 0; } if (va < vb) return sort.dir === 'asc' ? -1 : 1; if (va > vb) return sort.dir === 'asc' ? 1 : -1; return 0; });
    return d;
  }, [peminjamans, search, status, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  useEffect(() => { setPage(1); }, [search, status, limit]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <div style={{ position: 'relative' }}><FaSearch style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari siswa, kelas, alat, mapel..." style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}>{[{ v: 'all', l: 'Semua Status' }, { v: 'pending', l: 'Menunggu' }, { v: 'disetujui', l: 'Dipinjam' }, { v: 'kembali', l: 'Selesai' }, { v: 'ditolak', l: 'Ditolak' }].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
          <button type="button" onClick={() => { setSearch(''); setStatus('all'); }} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, color: '#4b5563', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FaTimesCircle style={{ fontSize: 11 }} />Reset</button>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead><tr style={{ background: '#f9fafb' }}>{['Siswa', 'Kelas', 'Mapel', 'Alat', 'Jml', 'Tanggal', 'Kondisi', 'Status'].map((h, i) => <th key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', textAlign: i === 4 ? 'center' : 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #f3f4f6' }}>{h}</th>)}</tr></thead>
          <tbody>
            {paginated.length > 0 ? paginated.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}><HoverCard user={r.user} onClick={() => r.userId && (window.location.hash = `#/profile/${r.userId}`)}><span>{r.user?.nama || '-'}</span></HoverCard></td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>{r.user?.kelas || '-'}</td>
                <td style={{ padding: '10px 12px' }}>{r.mapel ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>{r.mapel}</span> : <span style={{ color: '#d1d5db', fontSize: 12 }}>-</span>}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 20, height: 20, borderRadius: 4, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTools style={{ fontSize: 9, color: '#059669' }} /></span>{r.alat?.nama || '-'}</span></td>
                <td style={{ padding: '10px 12px', fontSize: 12, textAlign: 'center' }}>{r.jumlah || 1}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(r.tanggalPeminjaman)}</td>
                <td style={{ padding: '10px 12px' }}>{r.status === 'kembali' && r.kondisiPengembalian ? <KondisiBadge kondisi={r.kondisiPengembalian} /> : <span style={{ color: '#d1d5db', fontSize: 12 }}>-</span>}</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={r.status} /></td>
              </tr>
            )) : <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center' }}><EmptyState icon={FaSearch} message="Tidak ada data" /></td></tr>}
          </tbody>
        </table></div>
        <Pag page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} totalData={filtered.length} />
      </div>
    </div>
  );
};

/* ═══ MAPEL TAB ═══ */
const MapelTab = ({ mapelData, statistics, peminjamans }) => {
  const [modal, setModal] = useState({ open: false, mapel: null });
  const [ms, setMs] = useState({ search: '', status: 'all', sort: { key: '', dir: 'asc' }, page: 1, limit: 8 });
  const openDetail = mapel => { setModal({ open: true, mapel }); setMs({ search: '', status: 'all', sort: { key: '', dir: 'asc' }, page: 1, limit: 8 }); };
  const maxVal = Math.max(...Object.values(statistics.mapelStats || { x: 1 }), 1);
  const mFiltered = useMemo(() => {
    if (!modal.mapel) return [];
    let d = peminjamans.filter(r => r.mapel === modal.mapel);
    if (ms.search) { const q = ms.search.toLowerCase(); d = d.filter(r => (r.user?.nama || '').toLowerCase().includes(q) || (r.alat?.nama || '').toLowerCase().includes(q)); }
    if (ms.status !== 'all') d = d.filter(r => r.status === ms.status);
    if (ms.sort.key) d.sort((a, b) => { let va, vb; switch (ms.sort.key) { case 'siswa': va = (a.user?.nama || '').toLowerCase(); vb = (b.user?.nama || '').toLowerCase(); break; case 'alat': va = (a.alat?.nama || '').toLowerCase(); vb = (b.alat?.nama || '').toLowerCase(); break; case 'tanggal': va = a.tanggalPeminjaman || ''; vb = b.tanggalPeminjaman || ''; break; case 'status': va = a.status || ''; vb = b.status || ''; break; default: return 0; } if (va < vb) return ms.sort.dir === 'asc' ? -1 : 1; if (va > vb) return ms.sort.dir === 'asc' ? 1 : -1; return 0; });
    return d;
  }, [modal.mapel, peminjamans, ms]);
  const mTotal = Math.max(1, Math.ceil(mFiltered.length / ms.limit));
  const mPag = mFiltered.slice((ms.page - 1) * ms.limit, ms.page * ms.limit);
  useEffect(() => { setMs(p => ({ ...p, page: 1 })); }, [ms.search, ms.status, ms.limit]);
  const mStats = useMemo(() => { if (!modal.mapel) return {}; const d = peminjamans.filter(r => r.mapel === modal.mapel); return { total: d.length, pending: d.filter(r => r.status === 'pending').length, disetujui: d.filter(r => r.status === 'disetujui').length, kembali: d.filter(r => r.status === 'kembali').length, ditolak: d.filter(r => r.status === 'ditolak').length, baik: d.filter(r => r.kondisiPengembalian === 'baik').length, kurang: d.filter(r => r.kondisiPengembalian === 'kurang').length, rusak: d.filter(r => r.kondisiPengembalian === 'rusak berat').length }; }, [modal.mapel, peminjamans]);

  return (<>
    {mapelData?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mapelData.map((mapel, i) => { const count = statistics.mapelStats?.[mapel] || 0; return (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer" onClick={() => openDetail(mapel)}>
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2.5"><span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100"><FaBook className="text-sm text-indigo-500" /></span><h3 className="font-semibold text-gray-900 text-sm">{mapel}</h3></div><span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{count}</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${Math.min((count / maxVal) * 100, 100)}%` }} /></div>
            <div className="flex justify-end mt-2"><span className="text-[10px] text-gray-400 group-hover:text-blue-500 flex items-center gap-1"><FaExpand className="text-[8px]" />Detail</span></div>
          </div>);
        })}
      </div>
    ) : <div className="bg-white rounded-xl shadow-sm border border-gray-100"><EmptyState icon={FaBook} message="Belum ada mata pelajaran" /></div>}

    <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mapel: null })} title={null} size="xl">
      {modal.mapel && (<div className="space-y-4">
        <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><FaBook className="text-lg text-indigo-500" /></span><div><h2 className="text-lg font-bold text-gray-900">{modal.mapel}</h2><p className="text-xs text-gray-500">Detail transaksi peminjaman</p></div></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">{[{ l: 'Total', v: mStats.total, c: 'bg-gray-50 text-gray-800 border-gray-200' }, { l: 'Menunggu', v: mStats.pending, c: 'bg-amber-50 text-amber-700 border-amber-200' }, { l: 'Dipinjam', v: mStats.disetujui, c: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { l: 'Selesai', v: mStats.kembali, c: 'bg-blue-50 text-blue-700 border-blue-200' }, { l: 'Ditolak', v: mStats.ditolak, c: 'bg-red-50 text-red-700 border-red-200' }, { l: 'Baik', v: mStats.baik, c: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { l: 'Kurang', v: mStats.kurang, c: 'bg-amber-50 text-amber-700 border-amber-200' }].map((s, i) => <div key={i} className={`rounded-lg p-2.5 border text-center ${s.c}`}><div className="text-lg font-bold leading-none">{s.v}</div><div className="text-[10px] mt-1 opacity-70">{s.l}</div></div>)}</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
          <div className="relative md:col-span-2"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" /><input type="text" value={ms.search} onChange={e => setMs(p => ({ ...p, search: e.target.value }))} placeholder="Cari..." className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <select value={ms.status} onChange={e => setMs(p => ({ ...p, status: e.target.value }))} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="all">Semua</option><option value="pending">Menunggu</option><option value="disetujui">Dipinjam</option><option value="kembali">Selesai</option><option value="ditolak">Ditolak</option></select>
          <button type="button" onClick={() => setMs({ search: '', status: 'all', sort: { key: '', dir: 'asc' }, page: 1, limit: 8 })} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs flex items-center justify-center gap-1"><FaTimesCircle className="text-[10px]" />Reset</button>
        </div>
        <div className="text-xs text-gray-500">{mFiltered.length} transaksi</div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto"><table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 sticky top-0 z-10"><tr>{['Siswa', 'Kelas', 'Alat', 'Jml', 'Tgl Pinjam', 'Tgl Kembali', 'Kondisi', 'Status'].map(h => <th key={h} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {mPag.length > 0 ? mPag.map(r => (<tr key={r.id} className="hover:bg-blue-50/30">
                <td className="px-3 py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">{r.user?.nama || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{r.user?.kelas || '-'}</td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap"><span className="inline-flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center"><FaTools className="text-[9px] text-emerald-600" /></span>{r.alat?.nama || '-'}</span></td>
                <td className="px-3 py-2.5 text-xs text-center">{r.jumlah || 1}</td>
                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmt(r.tanggalPeminjaman)}</td>
                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.tanggalPengembalian ? fmt(r.tanggalPengembalian) : <span className="text-gray-300">-</span>}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{r.status === 'kembali' && r.kondisiPengembalian ? <KondisiBadge kondisi={r.kondisiPengembalian} /> : <span className="text-gray-300 text-xs">-</span>}</td>
                <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={r.status} /></td>
              </tr>)) : <tr><td colSpan={8}><EmptyState icon={FaSearch} message="Tidak ada data" /></td></tr>}
            </tbody>
          </table></div>
          <Pag page={ms.page} setPage={setMs.bind(null, p => ({ ...p, page: p }))} totalPages={mTotal} limit={ms.limit} setLimit={v => setMs(p => ({ ...p, limit: v }))} totalData={mFiltered.length} />
        </div>
      </div>)}
    </Modal>
  </>);
};

/* ═══ MAIN ═══ */
export default function GuruView({user, activeTab, mapelData, peminjamans, loading, message, statistics, chartData, handleRefreshData }) {
  const mainRef = useRef(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  useEffect(() => { const el = mainRef.current; if (!el) return; const fn = () => setShowTopBtn(el.scrollTop > 300 || window.scrollY > 300); el.addEventListener('scroll', fn); window.addEventListener('scroll', fn); return () => { el.removeEventListener('scroll', fn); window.removeEventListener('scroll', fn); }; }, []);
  const userMapel = useMemo(() => {
  const a = Array.isArray(user?.mapel) ? user.mapel : user?.mapel ? [user.mapel] : [];
  const b = Array.isArray(mapelData) ? mapelData : mapelData ? [mapelData] : [];
  return [...new Set([...a, ...b])];
}, [user?.mapel, mapelData]);

  if (loading) return <div className="flex justify-center items-center h-full w-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" /></div>;

  return (
    <div ref={mainRef} className="p-6 space-y-5 bg-gray-50 min-h-full w-full relative">
      {showTopBtn && <button type="button" onClick={() => { mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center"><FaArrowUp className="text-sm" /></button>}
      {message && <div className="rounded-xl bg-blue-50 p-3 border border-blue-100 flex items-center gap-2.5"><FaInfoCircle className="text-sm text-blue-500" /><p className="text-sm text-blue-700">{message}</p></div>}

      {activeTab === 'dashboard' && (<><div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100"><h1 className="text-xl font-bold text-gray-900 flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FaTachometerAlt className="text-lg text-blue-600" /></span>Dashboard Guru</h1><button onClick={() => { handleRefreshData?.(); toast.success('Data di-refresh'); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"><FaSync />Refresh</button></div><DashboardTab statistics={statistics} chartData={chartData} /></>)}

      {activeTab === 'peminjaman' && (<><div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100"><h1 className="text-xl font-bold text-gray-900 flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FaHandHolding className="text-lg text-blue-600" /></span>Peminjaman Saya</h1><button onClick={() => { handleRefreshData?.(); toast.success('Data di-refresh'); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"><FaSync />Refresh</button></div><PeminjamanTab peminjamans={peminjamans} /></>)}

      {activeTab === 'mapel' && (<>
        <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100"><h1 className="text-xl font-bold text-gray-900 flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FaBook className="text-lg text-blue-600" /></span>Mata Pelajaran</h1><AdminBtn /></div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 10px' }}>Mapel yang Anda ampu:</p>
          <MapelSelector selected={userMapel} onChange={() => {}} disabled={true} />
          {userMapel.length === 0 && <p style={{ fontSize: 12, color: '#f59e0b', margin: '8px 0 0', fontWeight: 500 }}>Belum ada mapel terpilih. Hubungi admin untuk menambahkan.</p>}
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '8px 0 0' }}>Untuk mengubah, hubungi admin atau kunjungi halaman profil.</p>
        </div>
        <MapelTab mapelData={userMapel} statistics={statistics} peminjamans={peminjamans} />
      </>)}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}