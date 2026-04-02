// src/pages/siswa/siswaView.jsx
import React, { useState } from 'react';
import { FaTools, FaCheckCircle, FaClock, FaImage, FaEye, FaTag, FaCube, FaSearch, FaFilter, FaClipboardList, FaTimesCircle, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import Modal from '../../components/modal';

const StatusBadge = ({ status }) => {
  const cfg = { pending: { c: 'bg-yellow-100 text-yellow-800', i: <FaClock className="mr-1" /> }, disetujui: { c: 'bg-green-100 text-green-800', i: <FaCheckCircle className="mr-1" /> }, ditolak: { c: 'bg-red-100 text-red-800', i: <FaTimesCircle className="mr-1" /> }, dikembalikan: { c: 'bg-blue-100 text-blue-800', i: <FaCheckCircle className="mr-1" /> }, kembali: { c: 'bg-blue-100 text-blue-800', i: <FaCheckCircle className="mr-1" /> }, dibatalkan: { c: 'bg-gray-100 text-gray-600', i: <FaBan className="mr-1" /> } };
  const s = cfg[status] || cfg.pending;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${s.c}`}>{s.i}{status}</span>;
};

const SortableTh = ({ label, sortKey, sort, onSort, className }) => (
  <th onClick={() => onSort(sortKey)} className={`cursor-pointer hover:text-gray-700 select-none ${className || ''}`}>
    <span className="flex items-center gap-1">{label}<span className={`text-[10px] ${sort.key === sortKey ? 'text-blue-500' : 'text-gray-300'}`}>{sort.key === sortKey ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}</span></span>
  </th>
);

export default function SiswaView({
  user, loading, message, activeTab, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
  stats, filteredAlats, filteredPeminjamans, isModalOpen, selectedAlat, jumlah, selectedMapel,
  daftarMapel, gurus, selectedGuru, submitting, onPinjamClick, onMapelChange, onGuruChange,
  onJumlahChange, onSubmit, onCloseModal, detailModalOpen, selectedDetailAlat, onViewDetail,
  onCloseDetailModal, filterCategory, setFilterCategory, cancelModalOpen, cancelTarget, cancelling,
  onCancelClick, onConfirmCancel, onCloseCancelModal, riwayatSort, handleRiwayatSort,
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (loading) return (<div className="flex justify-center items-center h-full w-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" /></div>);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab === 'pinjam' ? 'Pinjam Alat' : 'Riwayat Peminjaman'}</h1>
      </div>

      {/* TAB: PINJAM ALAT */}
      {activeTab === 'pinjam' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Total Alat', v: stats.totalAlat, i: <FaTools className="h-6 w-6 text-blue-600" />, b: 'bg-blue-100' },
              { t: 'Tersedia', v: stats.availableAlat, i: <FaCheckCircle className="h-6 w-6 text-green-600" />, b: 'bg-green-100' },
              { t: 'Pending', v: stats.pendingPeminjaman, i: <FaClock className="h-6 w-6 text-yellow-600" />, b: 'bg-yellow-100' },
              { t: 'Disetujui', v: stats.approvedPeminjaman, i: <FaCheckCircle className="h-6 w-6 text-purple-600" />, b: 'bg-purple-100' },
            ].map((s) => (
              <div key={s.t} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="px-4 py-5 sm:p-6"><div className="flex items-center"><div className={`flex-shrink-0 ${s.b} rounded-md p-3`}>{s.i}</div><div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">{s.t}</dt><dd><div className="text-2xl font-semibold text-gray-900">{s.v}</div></dd></dl></div></div></div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
                <input type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Cari nama atau merek alat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="col-span-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaFilter className="text-gray-400" /></div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none">
                  <option value="all">Semua</option><option value="Elektronik">Elektronik</option><option value="Komputer">Komputer</option><option value="Jaringan">Jaringan</option><option value="Peralatan">Peralatan</option><option value="Bahan">Bahan</option><option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlats.length > 0 ? filteredAlats.map((alat) => (
              <div key={alat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
                <div className="relative h-48 bg-gray-100 flex-shrink-0 cursor-pointer" onClick={() => onViewDetail(alat)}>
                  {alat.gambar ? (<img src={alat.gambar} alt={alat.nama} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><FaImage className="h-16 w-16 text-gray-300" /></div>)}
                  {alat.kategori && (<span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow">{alat.kategori}</span>)}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1" title={alat.nama}>{alat.nama}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-3 space-x-3">
                    {alat.merek && (<span className="flex items-center"><FaTag className="mr-1 text-xs" />{alat.merek}</span>)}
                    <span className="flex items-center"><FaCube className="mr-1 text-xs" />Stok: {alat.stok}</span>
                  </div>
                  <div className="mt-auto border-t border-gray-100 pt-3 flex items-center gap-2">
                    <button type="button" onClick={() => onViewDetail(alat)} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"><FaEye className="mr-1.5 text-gray-400" />Detail</button>
                    <button type="button" onClick={() => onPinjamClick(alat)} disabled={alat.stok <= 0} className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${alat.stok > 0 ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}><FaTools className="mr-1.5" />Pinjam</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-16"><FaImage className="mx-auto h-12 w-12 text-gray-300 mb-4" /><h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data alat.</h3><p className="mt-1 text-sm text-gray-500">Coba ubah kata kunci pencarian.</p></div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RIWAYAT PEMINJAMAN */}
      {activeTab === 'riwayat' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
                <input type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Cari riwayat peminjaman..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="col-span-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaFilter className="text-gray-400" /></div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none">
                  <option value="all">Semua</option><option value="pending">Pending</option><option value="disetujui">Disetujui</option><option value="ditolak">Ditolak</option><option value="dikembalikan">Dikembalikan</option><option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredPeminjamans.length > 0 ? (
              <>
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-md font-semibold text-gray-800">Riwayat Peminjaman</h3></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                      <SortableTh label="Alat" sortKey="alat" sort={riwayatSort} onSort={handleRiwayatSort} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" />
                      <SortableTh label="Jumlah" sortKey="jumlah" sort={riwayatSort} onSort={handleRiwayatSort} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" />
                      <SortableTh label="Mapel" sortKey="mapel" sort={riwayatSort} onSort={handleRiwayatSort} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" />
                      <SortableTh label="Tanggal" sortKey="tanggal" sort={riwayatSort} onSort={handleRiwayatSort} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" />
                      <SortableTh label="Status" sortKey="status" sort={riwayatSort} onSort={handleRiwayatSort} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" />
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPeminjamans.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.alat?.nama || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{p.jumlah}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{p.mapel}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.tanggalPeminjaman).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={p.status} />
                              {p.status === 'pending' && (
                                <button type="button" onClick={() => onCancelClick(p)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg" title="Batalkan"><FaBan className="text-xs" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6"><FaClipboardList className="h-16 w-16 text-gray-300" /></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Riwayat Peminjaman Kosong</h3>
                <p className="text-sm text-gray-500 max-w-md text-center leading-relaxed mb-8">Kamu belum memiliki riwayat peminjaman. Mulai pinjam alat untuk kebutuhan praktikmu!</p>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"><FaTools className="mr-2 w-4 h-4" />Pergi ke menu "Pinjam Alat" untuk mulai</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DETAIL */}
      <Modal isOpen={detailModalOpen} onClose={onCloseDetailModal} title="Detail Spesifikasi Alat" size="lg">
        {selectedDetailAlat && (
          <div className="space-y-6">
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center border border-gray-200" style={{ height: isZoomed ? 'auto' : '300px' }} onClick={() => setIsZoomed(!isZoomed)}>
              {selectedDetailAlat.gambar ? (<img src={selectedDetailAlat.gambar} alt={selectedDetailAlat.nama} className={`w-full transition-transform duration-300 ${isZoomed ? 'object-contain max-h-[500px]' : 'object-cover h-full'}`} />) : (<FaImage className="h-24 w-24 text-gray-300" />)}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">{isZoomed ? 'Klik perkecil' : 'Klik perbesar'}</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedDetailAlat.nama}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDetailAlat.kategori && (<span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{selectedDetailAlat.kategori}</span>)}
                {selectedDetailAlat.merek && (<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Merek: {selectedDetailAlat.merek}</span>)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDetailAlat.stok > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>Stok: {selectedDetailAlat.stok}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="text-md font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">Spesifikasi & Deskripsi</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{selectedDetailAlat.deskripsi || 'Tidak ada deskripsi.'}</p>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button type="button" onClick={() => { onCloseDetailModal(); onPinjamClick(selectedDetailAlat); }} disabled={selectedDetailAlat.stok <= 0} className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${selectedDetailAlat.stok > 0 ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}><FaTools className="mr-2" />Pinjam Alat Ini</button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: FORM PEMINJAMAN */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal} title="Form Peminjaman Alat">
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Alat</label><input type="text" readOnly value={selectedAlat?.nama || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
            <input type="number" min="1" max={selectedAlat?.stok || 1} value={jumlah} onChange={onJumlahChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <p className="mt-1 text-xs text-gray-500">Stok tersedia: {selectedAlat?.stok || 0}</p>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Mapel</span>
            <div className="grid grid-cols-2 gap-2">{daftarMapel.map((m) => (<div key={m} className="flex items-center"><input id={`mapel-${m}`} type="radio" name="mapel" value={m} checked={selectedMapel === m} onChange={onMapelChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" /><label htmlFor={`mapel-${m}`} className="ml-2 text-sm text-gray-700">{m}</label></div>))}</div>
          </div>
          {selectedMapel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guru</label>
              {gurus.length > 0 ? (<select value={selectedGuru} onChange={onGuruChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="">Pilih guru</option>{gurus.map((g) => (<option key={g.id} value={g.id}>{g.nama}</option>))}</select>) : (<p className="text-sm text-gray-500 italic">{selectedMapel ? `Tidak ada guru untuk ${selectedMapel}` : 'Pilih mapel terlebih dahulu'}</p>)}
            </div>
          )}
          {message && (<div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{message}</div>)}
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={submitting || !selectedMapel || !selectedGuru} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Memproses...</>) : 'Ajukan Peminjaman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: BATALKAN */}
      <Modal isOpen={cancelModalOpen} onClose={onCloseCancelModal} title="Batalkan Peminjaman">
        {cancelTarget && (
          <div className="space-y-5">
            <div className="flex justify-center"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><FaExclamationTriangle className="h-8 w-8 text-red-500" /></div></div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Yakin ingin membatalkan?</h3>
              <p className="text-sm text-gray-500">Peminjaman <span className="font-semibold text-gray-700">"{cancelTarget.alat?.nama || '-'}"</span> akan dibatalkan.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Mapel</span><span className="text-gray-900 font-medium">{cancelTarget.mapel}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Jumlah</span><span className="text-gray-900 font-medium">{cancelTarget.jumlah}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tanggal</span><span className="text-gray-900 font-medium">{new Date(cancelTarget.tanggalPeminjaman).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onCloseCancelModal} disabled={cancelling} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Tidak, Kembali</button>
              <button type="button" onClick={onConfirmCancel} disabled={cancelling} className="flex-1 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center">
                {cancelling ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Membatalkan...</>) : (<><FaBan className="mr-1.5" />Ya, Batalkan</>)}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}