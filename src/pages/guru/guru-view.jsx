// src/pages/guru/guruView.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaTachometerAlt, FaHandHolding, FaTools, FaSync, FaPlus, FaBook, FaSearch,
  FaTimesCircle, FaChartPie, FaArrowUp, FaExclamationTriangle, FaChevronLeft,
  FaChevronRight, FaExpand, FaExternalLinkAlt, FaCalendarAlt, FaInfoCircle,FaClipboardList
} from 'react-icons/fa';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';
import Modal from '../../components/modal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// ═══════════════════════════════════════════════
// REUSABLE
// ═══════════════════════════════════════════════

const TabHeader = ({ title, icon: Icon, children }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
      {Icon && <span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Icon className="text-lg text-blue-600" /></span>}
      {title}
    </h1>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const FilterBar = ({ children }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">{children}</div>
  </div>
);

const InputSearch = ({ value, onChange, placeholder, span = 2 }) => (
  <div className={`relative col-span-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400 text-sm" /></div>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all" />
  </div>
);

const SelectFilter = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all">
    {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);

const ResetBtn = ({ onClick }) => (
  <button type="button" onClick={onClick}
    className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600 hover:text-gray-800 transition-all flex items-center justify-center gap-2">
    <FaTimesCircle className="text-xs" />Reset
  </button>
);

const PaginationControls = ({ page, setPage, totalPages, limit, setLimit, totalData }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-white">
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 sm:mb-0">
      <span>Tampilkan</span>
      <select value={limit} onChange={(e) => {
        const v = e.target.value;
        if (v === 'custom') { const cv = prompt('Jumlah per halaman:'); if (!cv) return; setLimit(parseInt(cv, 10) || 10); }
        else setLimit(parseInt(v, 10));
      }} className="px-2 py-1 border rounded-md text-xs bg-white">
        <option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="custom">Custom</option>
      </select>
      <span>data/halaman (Total: {totalData})</span>
    </div>
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
        className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><FaChevronLeft className="text-xs" /></button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pn;
        if (totalPages <= 5) pn = i + 1;
        else { pn = Math.max(1, page - 2) + i; if (pn > totalPages || pn < 1) return null; }
        return (<button key={pn} type="button" onClick={() => setPage(pn)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${page === pn ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>{pn}</button>);
      })}
      <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
        className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><FaChevronRight className="text-xs" /></button>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const m = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    disetujui: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    kembali: 'bg-blue-50 text-blue-700 border border-blue-200',
    ditolak: 'bg-red-50 text-red-700 border border-red-200',
    dibatalkan: 'bg-gray-100 text-gray-600 border border-gray-200',
  };
  const lbl = { pending: 'Menunggu', disetujui: 'Dipinjam', kembali: 'Selesai', ditolak: 'Ditolak', dibatalkan: 'Dibatalkan' };
  return <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${m[status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>{lbl[status] || status}</span>;
};

const KondisiBadge = ({ kondisi }) => {
  const m = { baik: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 'rusak berat': 'bg-red-50 text-red-700 border border-red-200', kurang: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${m[kondisi] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>{kondisi}</span>;
};

const SortableTh = ({ label, sortKey, sort, onSort, className }) => {
  const active = sort.key === sortKey;
  return (
    <th onClick={() => onSort(sortKey)} className={`cursor-pointer hover:text-blue-600 select-none transition-colors whitespace-nowrap ${className || ''}`}>
      <span className="flex items-center gap-1">{label}<span className={`text-[10px] ${active ? 'text-blue-500' : 'text-gray-300'}`}>{active ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}</span></span>
    </th>
  );
};

const EmptyState = ({ icon: Icon, message }) => (
  <div className="text-center py-12 px-4">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><Icon className="text-xl text-gray-400" /></div>
    <h3 className="text-sm font-semibold text-gray-600">{message}</h3>
  </div>
);

const fmt = (tgl) => tgl ? new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const fmtTime = (tgl) => tgl ? new Date(tgl).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

// ═══════════════════════════════════════════════
// TAB NAV
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════

const DashboardTab = ({ statistics, chartData }) => (
  <div className="space-y-5">
    <DashboardGrid statistics={statistics} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center"><FaChartPie className="text-xs text-indigo-500" /></span>
          Tracking Penggunaan
        </h3>
        <div className="flex items-center justify-center" style={{ height: '240px' }}>
          {statistics.totalPeminjaman > 0 ? (
            <div className="w-full h-full"><Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } }, cutout: '62%' }} /></div>
          ) : <EmptyState icon={FaChartPie} message="Belum ada data" />}
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center"><FaTachometerAlt className="text-xs text-blue-500" /></span>
          Detail Aktivitas
        </h3>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex justify-between items-center">
          <span className="text-xs text-blue-600 font-medium">Total Terlibat</span>
          <span className="text-xl font-bold text-blue-700">{statistics.totalPeminjaman || 0}<span className="text-xs font-normal ml-1">kali</span></span>
        </div>
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Rincian per Mapel:</h4>
        <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
          {statistics.mapelStats && Object.keys(statistics.mapelStats).length > 0 ? (
            Object.entries(statistics.mapelStats).map(([mapel, count]) => {
              const pct = ((count / (statistics.totalPeminjaman || 1)) * 100);
              return (
                <div key={mapel}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium text-gray-700">{mapel}</span><span className="text-gray-400">{count}x ({pct.toFixed(0)}%)</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })
          ) : <p className="text-gray-400 italic text-xs">Tidak ada data mapel.</p>}
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════
// PEMINJAMAN TAB
// ═══════════════════════════════════════════════

const PeminjamanTab = ({ peminjamans, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ key: '', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSort = (key) => setSort(p => p.key === key ? { ...p, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  const filtered = useMemo(() => {
    let d = [...peminjamans];
    if (search) { const q = search.toLowerCase(); d = d.filter(r => (r.user?.nama || '').toLowerCase().includes(q) || (r.user?.kelas || '').toLowerCase().includes(q) || (r.alat?.nama || '').toLowerCase().includes(q) || (r.mapel || '').toLowerCase().includes(q)); }
    if (status !== 'all') d = d.filter(r => r.status === status);
    if (sort.key) {
      d.sort((a, b) => {
        let va, vb;
        switch (sort.key) {
          case 'siswa': va = (a.user?.nama || '').toLowerCase(); vb = (b.user?.nama || '').toLowerCase(); break;
          case 'kelas': va = (a.user?.kelas || '').toLowerCase(); vb = (b.user?.kelas || '').toLowerCase(); break;
          case 'mapel': va = (a.mapel || '').toLowerCase(); vb = (b.mapel || '').toLowerCase(); break;
          case 'alat': va = (a.alat?.nama || '').toLowerCase(); vb = (b.alat?.nama || '').toLowerCase(); break;
          case 'tanggal': va = a.tanggalPeminjaman || ''; vb = b.tanggalPeminjaman || ''; break;
          case 'kondisi': va = a.kondisiPengembalian || ''; vb = b.kondisiPengembalian || ''; break;
          case 'status': va = a.status || ''; vb = b.status || ''; break;
          default: return 0;
        }
        if (va < vb) return sort.dir === 'asc' ? -1 : 1;
        if (va > vb) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return d;
  }, [peminjamans, search, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  // Reset page when filter/limit changes
  useEffect(() => { setPage(1); }, [search, status, limit]);

  const handleReset = () => { setSearch(''); setStatus('all'); setSort({ key: '', dir: 'asc' }); setPage(1); toast.info('Filter direset'); };

  return (
    <div className="space-y-4">
      <FilterBar>
        <InputSearch value={search} onChange={setSearch} placeholder="Cari siswa, kelas, alat, mapel..." span={2} />
        <SelectFilter value={status} onChange={setStatus} options={[
          { value: 'all', label: 'Semua Status' }, { value: 'pending', label: 'Menunggu' }, { value: 'disetujui', label: 'Dipinjam' }, { value: 'kembali', label: 'Selesai' }, { value: 'ditolak', label: 'Ditolak' }, { value: 'dibatalkan', label: 'Dibatalkan' }
        ]} />
        <ResetBtn onClick={handleReset} />
      </FilterBar>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <SortableTh label="Siswa" sortKey="siswa" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
                <SortableTh label="Kelas" sortKey="kelas" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
                <SortableTh label="Mapel" sortKey="mapel" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
                <SortableTh label="Alat" sortKey="alat" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
                <SortableTh label="Jml" sortKey="" sort={sort} onSort={() => {}} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase text-center" />
                <SortableTh label="Tanggal" sortKey="tanggal" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
                <SortableTh label="Kondisi" sortKey="kondisi" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
                <SortableTh label="Status" sortKey="status" sort={sort} onSort={handleSort} className="px-3 py-2.5 text-[11px] font-medium text-gray-500 uppercase" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length > 0 ? paginated.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">{r.user?.nama || '-'}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.user?.kelas || '-'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {r.mapel ? <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">{r.mapel}</span> : <span className="text-gray-300 text-xs">-</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center"><FaTools className="text-[9px] text-emerald-600" /></span>{r.alat?.nama || '-'}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 text-center">{r.jumlah || 1}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmt(r.tanggalPeminjaman)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{r.status === 'kembali' && r.kondisiPengembalian ? <KondisiBadge kondisi={r.kondisiPengembalian} /> : <span className="text-gray-300 text-xs">-</span>}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan={8}><EmptyState icon={FaSearch} message="Tidak ada data ditemukan" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} totalData={filtered.length} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAPEL TAB + MODAL DETAIL
// ═══════════════════════════════════════════════

const MapelTab = ({ mapelData, statistics, peminjamans }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalStatus, setModalStatus] = useState('all');
  const [modalSort, setModalSort] = useState({ key: '', dir: 'asc' });
  const [modalPage, setModalPage] = useState(1);
  const [modalLimit, setModalLimit] = useState(8);

  const openDetail = (mapel) => {
    setSelectedMapel(mapel);
    setModalSearch('');
    setModalStatus('all');
    setModalSort({ key: '', dir: 'asc' });
    setModalPage(1);
    setModalLimit(8);
    setModalOpen(true);
  };

  const handleModalSort = (key) => setModalSort(p => p.key === key ? { ...p, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  const modalFiltered = useMemo(() => {
    if (!selectedMapel) return [];
    let d = peminjamans.filter(r => r.mapel === selectedMapel);
    if (modalSearch) {
      const q = modalSearch.toLowerCase();
      d = d.filter(r => (r.user?.nama || '').toLowerCase().includes(q) || (r.alat?.nama || '').toLowerCase().includes(q) || (r.user?.kelas || '').toLowerCase().includes(q));
    }
    if (modalStatus !== 'all') d = d.filter(r => r.status === modalStatus);
    if (modalSort.key) {
      d.sort((a, b) => {
        let va, vb;
        switch (modalSort.key) {
          case 'siswa': va = (a.user?.nama || '').toLowerCase(); vb = (b.user?.nama || '').toLowerCase(); break;
          case 'kelas': va = (a.user?.kelas || '').toLowerCase(); vb = (b.user?.kelas || '').toLowerCase(); break;
          case 'alat': va = (a.alat?.nama || '').toLowerCase(); vb = (b.alat?.nama || '').toLowerCase(); break;
          case 'jumlah': va = a.jumlah || 0; vb = b.jumlah || 0; break;
          case 'tanggal': va = a.tanggalPeminjaman || ''; vb = b.tanggalPeminjaman || ''; break;
          case 'tglKembali': va = a.tanggalPengembalian || ''; vb = b.tanggalPengembalian || ''; break;
          case 'kondisi': va = a.kondisiPengembalian || ''; vb = b.kondisiPengembalian || ''; break;
          case 'status': va = a.status || ''; vb = b.status || ''; break;
          default: return 0;
        }
        if (typeof va === 'number') return modalSort.dir === 'asc' ? va - vb : vb - va;
        if (va < vb) return modalSort.dir === 'asc' ? -1 : 1;
        if (va > vb) return modalSort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return d;
  }, [selectedMapel, peminjamans, modalSearch, modalStatus, modalSort]);

  const modalTotalPages = Math.max(1, Math.ceil(modalFiltered.length / modalLimit));
  const modalPaginated = modalFiltered.slice((modalPage - 1) * modalLimit, modalPage * modalLimit);

  useEffect(() => { setModalPage(1); }, [modalSearch, modalStatus, modalLimit]);

  const mapelStats = useMemo(() => {
    if (!selectedMapel) return {};
    const d = peminjamans.filter(r => r.mapel === selectedMapel);
    return {
      total: d.length,
      pending: d.filter(r => r.status === 'pending').length,
      disetujui: d.filter(r => r.status === 'disetujui').length,
      kembali: d.filter(r => r.status === 'kembali').length,
      ditolak: d.filter(r => r.status === 'ditolak').length,
      dibatalkan: d.filter(r => r.status === 'dibatalkan').length,
      totalAlat: d.reduce((s, r) => s + (r.jumlah || 1), 0),
      baik: d.filter(r => r.kondisiPengembalian === 'baik').length,
      kurang: d.filter(r => r.kondisiPengembalian === 'kurang').length,
      rusak: d.filter(r => r.kondisiPengembalian === 'rusak berat').length,
    };
  }, [selectedMapel, peminjamans]);

  return (
    <>
      {mapelData && mapelData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mapelData.map((mapel, i) => {
            const count = statistics.mapelStats?.[mapel] || 0;
            return (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer" onClick={() => openDetail(mapel)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors"><FaBook className="text-sm text-indigo-500" /></span>
                    <h3 className="font-semibold text-gray-900 text-sm">{mapel}</h3>
                  </div>
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((count / Math.max(...Object.values(statistics.mapelStats || { 0: 1 }), 1)) * 100, 100)}%` }} />
                </div>
                <div className="flex items-center justify-end mt-2">
                  <span className="text-[10px] text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                    <FaExpand className="text-[8px]" />Lihat Detail
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState icon={FaBook} message="Belum ada mata pelajaran" />
        </div>
      )}

      {/* MODAL DETAIL MAPEL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={null} size="xl">
        {selectedMapel && (
          <div className="space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><FaBook className="text-lg text-indigo-500" /></span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedMapel}</h2>
                  <p className="text-xs text-gray-500">Detail seluruh transaksi peminjaman</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { label: 'Total', val: mapelStats.total, color: 'bg-gray-50 text-gray-800 border-gray-200' },
                { label: 'Menunggu', val: mapelStats.pending, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'Dipinjam', val: mapelStats.disetujui, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: 'Selesai', val: mapelStats.kembali, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Ditolak', val: mapelStats.ditolak, color: 'bg-red-50 text-red-700 border-red-200' },
                { label: 'Batal', val: mapelStats.dibatalkan, color: 'bg-gray-50 text-gray-500 border-gray-200' },
                { label: 'Total Alat', val: mapelStats.totalAlat, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              ].map((s, i) => (
                <div key={i} className={`rounded-lg p-2.5 border text-center ${s.color}`}>
                  <div className="text-lg font-bold leading-none">{s.val}</div>
                  <div className="text-[10px] mt-1 opacity-70">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Kondisi Summary */}
            {mapelStats.kembali > 0 && (
              <div className="flex items-center gap-3 px-1">
                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">Kondisi:</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-emerald-400" />Baik {mapelStats.baik}</span>
                  <span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-amber-400" />Kurang {mapelStats.kurang}</span>
                  <span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-red-400" />Rusak {mapelStats.rusak}</span>
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <div className="relative md:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400 text-xs" /></div>
                <input type="text" value={modalSearch} onChange={(e) => { setModalSearch(e.target.value); }} placeholder="Cari dalam mapel ini..."
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <select value={modalStatus} onChange={(e) => { setModalStatus(e.target.value); }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Semua Status</option><option value="pending">Menunggu</option><option value="disetujui">Dipinjam</option><option value="kembali">Selesai</option><option value="ditolak">Ditolak</option><option value="dibatalkan">Dibatalkan</option>
              </select>
              <button type="button" onClick={() => { setModalSearch(''); setModalStatus('all'); setModalSort({ key: '', dir: 'asc' }); setModalPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs text-gray-600 flex items-center justify-center gap-1">
                <FaTimesCircle className="text-[10px]" />Reset
              </button>
            </div>

            <div className="text-xs text-gray-500 px-1">{modalFiltered.length} transaksi</div>

            {/* Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <SortableTh label="Siswa" sortKey="siswa" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                      <SortableTh label="Kelas" sortKey="kelas" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                      <SortableTh label="Alat" sortKey="alat" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                      <SortableTh label="Jml" sortKey="jumlah" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase text-center" />
                      <SortableTh label="Tgl Pinjam" sortKey="tanggal" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                      <SortableTh label="Tgl Kembali" sortKey="tglKembali" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                      <SortableTh label="Kondisi" sortKey="kondisi" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                      <SortableTh label="Status" sortKey="status" sort={modalSort} onSort={handleModalSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {modalPaginated.length > 0 ? modalPaginated.map((r) => (
                      <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">{r.user?.nama || '-'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.user?.kelas || '-'}</td>
                        <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5"><span className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center"><FaTools className="text-[9px] text-emerald-600" /></span>{r.alat?.nama || '-'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 text-center">{r.jumlah || 1}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-[9px] text-gray-400" />{fmt(r.tanggalPeminjaman)}</span>
                          {fmtTime(r.tanggalPeminjaman) && <span className="text-[10px] text-gray-400 ml-1">{fmtTime(r.tanggalPeminjaman)}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                          {r.tanggalPengembalian ? (
                            <span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-[9px] text-blue-400" />{fmt(r.tanggalPengembalian)}</span>
                          ) : <span className="text-gray-300 text-xs">-</span>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{r.status === 'kembali' && r.kondisiPengembalian ? <KondisiBadge kondisi={r.kondisiPengembalian} /> : <span className="text-gray-300 text-xs">-</span>}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={8}><EmptyState icon={FaSearch} message="Tidak ada data untuk filter ini" /></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={modalPage} setPage={setModalPage} totalPages={modalTotalPages} limit={modalLimit} setLimit={setModalLimit} totalData={modalFiltered.length} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

// ═══════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════

export default function GuruView({
  activeTab, mapelData, peminjamans, loading, message, statistics,
  statusFilter, chartData, handleRefreshData, handleStatusFilterChange,
  formatTanggal, mapStatusLabel, getStatusBadgeClass, getKondisiBadgeClass,
}) {
  const mainRef = useRef(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setShowTopBtn(el.scrollTop > 300 || window.scrollY > 300);
    el.addEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('scroll', onScroll); };
  }, []);

  const scrollToTop = () => { mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleRefresh = () => { handleRefreshData?.(); toast.success('Data berhasil di-refresh'); };

  if (loading) return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div ref={mainRef} className="p-6 space-y-5 bg-gray-50 min-h-full w-full relative">

      {showTopBtn && (
        <button type="button" onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110" title="Ke atas">
          <FaArrowUp className="text-sm" />
        </button>
      )}


      {message && (
        <div className="rounded-xl bg-blue-50 p-3 border border-blue-100 flex items-center gap-2.5">
          <FaInfoCircle className="text-sm text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      )}

      {/* ═══ DASHBOARD ═══ */}
      {activeTab === 'dashboard' && (
        <>
          <TabHeader title="Dashboard Guru" >
            <Button onClick={handleRefresh} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm">
              <FaSync className="mr-2" />Refresh
            </Button>
          </TabHeader>
          <DashboardTab statistics={statistics} chartData={chartData} />
        </>
      )}

      {/* ═══ PEMINJAMAN ═══ */}
      {activeTab === 'peminjaman' && (
        <>
          <TabHeader title="Peminjaman Saya">
            <Button onClick={handleRefresh} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm">
              <FaSync className="mr-2" />Refresh
            </Button>
          </TabHeader>
          <PeminjamanTab peminjamans={peminjamans} onRefresh={handleRefresh} />
        </>
      )}

      {/* ═══ MAPEL ═══ */}
      {activeTab === 'mapel' && (
        <>
          <TabHeader title="Mata Pelajaran" >
            <button
              type="button"
              onClick={() => { window.location.hash = '#/guru/profile'; }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <FaPlus className="text-xs" />Kelola Mapel
            </button>
          </TabHeader>
          <MapelTab mapelData={mapelData} statistics={statistics} peminjamans={peminjamans} />
        </>
      )}
    </div>
  );
}