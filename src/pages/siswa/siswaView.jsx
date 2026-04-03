import React, { useState } from 'react';
import { FaTools, FaCheckCircle, FaClock, FaImage, FaEye, FaTag, FaCube, FaSearch, FaFilter, FaClipboardList, FaTimesCircle, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import Modal from '../../components/modal';

const SBadge = ({ status }) => {
  const c = { pending: '#fef3c7', disetujui: '#d1fae5', ditolak: '#fee2e2', kembali: '#dbeafe', dikembalikan: '#dbeafe', dibatalkan: '#f3f4f6' };
  const t = { pending: '#92400e', disetujui: '#065f46', ditolak: '#991b1b', kembali: '#1e40af', dikembalikan: '#1e40af', dibatalkan: '#4b5563' };
  const i = { pending: <FaClock />, disetujui: <FaCheckCircle />, ditolak: <FaTimesCircle />, kembali: <FaCheckCircle />, dikembalikan: <FaCheckCircle />, dibatalkan: <FaBan /> };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: c[status] || c.pending, color: t[status] || t.pending }}>{i[status] || i.pending}{status}</span>;
};

const TH = ({ label, sk, sort, onSort, w }) => {
  const a = sort.key === sk;
  return <th onClick={() => onSort(sk)} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', width: w, borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label}<span style={{ fontSize: 9, color: a ? '#3b82f6' : '#d1d5db' }}>{a ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}</span></span></th>;
};

const Spin = ({ big }) => <div style={{ width: big ? 48 : 16, height: big ? 48 : 16, borderRadius: '50%', border: big ? '3px solid #e5e7eb' : '2px solid rgba(255,255,255,0.3)', borderTopColor: big ? '#3b82f6' : '#fff', animation: 'spin 0.6s linear infinite' }} />;

export default function SiswaView({ user, loading, message, activeTab, searchTerm, setSearchTerm, statusFilter, setStatusFilter, stats, filteredAlats, filteredPeminjamans, isModalOpen, selectedAlat, jumlah, selectedMapel, daftarMapel, gurus, selectedGuru, submitting, onPinjamClick, onMapelChange, onGuruChange, onJumlahChange, onSubmit, onCloseModal, detailModalOpen, selectedDetailAlat, onViewDetail, onCloseDetailModal, filterCategory, setFilterCategory, cancelModalOpen, cancelTarget, cancelling, onCancelClick, onConfirmCancel, onCloseCancelModal, riwayatSort, handleRiwayatSort }) {
  const [zoomed, setZoomed] = useState(false);
  const fmt = d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin big /></div>;

  const statCards = [
    { t: 'Total Alat', v: stats.totalAlat, i: <FaTools />, bg: '#eff6ff', ic: '#2563eb' },
    { t: 'Tersedia', v: stats.availableAlat, i: <FaCheckCircle />, bg: '#ecfdf5', ic: '#059669' },
    { t: 'Pending', v: stats.pendingPeminjaman, i: <FaClock />, bg: '#fef9c3', ic: '#d97706' },
    { t: 'Disetujui', v: stats.approvedPeminjaman, i: <FaCheckCircle />, bg: '#f3e8ff', ic: '#7c3aed' },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, background: '#f9fafb', minHeight: '100%', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 20px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, textTransform: 'capitalize' }}>{activeTab === 'pinjam' ? 'Pinjam Alat' : 'Riwayat Peminjaman'}</h1>
      </div>

      {/* PINJAM TAB */}
      {activeTab === 'pinjam' && (<>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {statCards.map(s => (
            <div key={s.t} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.ic, fontSize: 18 }}>{s.i}</div>
              <div><div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{s.t}</div><div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{s.v}</div></div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 12, borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative', flex: 1 }}><FaSearch style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }} /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari nama atau merek..." style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
          <div style={{ position: 'relative' }}><FaFilter style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 12 }} /><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 140, padding: '9px 12px 9px 32px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', appearance: 'none' }}><option value="all">Semua</option><option value="Elektronik">Elektronik</option><option value="Komputer">Komputer</option><option value="Jaringan">Jaringan</option><option value="Peralatan">Peralatan</option><option value="Bahan">Bahan</option><option value="Lainnya">Lainnya</option></select></div>
        </div>

        {/* Alat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {filteredAlats.length > 0 ? filteredAlats.map(a => (
            <div key={a.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, background: '#f3f4f6', cursor: 'pointer', position: 'relative' }} onClick={() => onViewDetail(a)}>
                {a.gambar ? <img src={a.gambar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaImage style={{ fontSize: 40, color: '#d1d5db' }} /></div>}
                {a.kategori && <span style={{ position: 'absolute', top: 8, left: 8, background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>{a.kategori}</span>}
              </div>
              <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.nama}>{a.nama}</h3>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, display: 'flex', gap: 12 }}>{a.merek && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaTag style={{ fontSize: 10 }} />{a.merek}</span>}<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaCube style={{ fontSize: 10 }} />Stok: {a.stok}</span></div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid #f3f4f6', paddingTop: 10, display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => onViewDetail(a)} style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 500, color: '#4b5563', background: '#f9fafb', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><FaEye style={{ fontSize: 11, color: '#9ca3af' }} />Detail</button>
                  <button type="button" onClick={() => onPinjamClick(a)} disabled={a.stok <= 0} style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600, color: a.stok > 0 ? '#fff' : '#9ca3af', background: a.stok > 0 ? '#2563eb' : '#f3f4f6', border: 'none', borderRadius: 6, cursor: a.stok > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><FaTools style={{ fontSize: 11 }} />Pinjam</button>
                </div>
              </div>
            </div>
          )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48 }}><FaImage style={{ fontSize: 48, color: '#d1d5db', margin: '0 auto 12px' }} /><p style={{ fontSize: 14, color: '#6b7280' }}>Tidak ada data alat.</p></div>}
        </div>
      </>)}

      {/* RIWAYAT TAB */}
      {activeTab === 'riwayat' && (<>
        <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 12, borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative', flex: 1 }}><FaSearch style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }} /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari riwayat..." style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
          <div style={{ position: 'relative' }}><FaFilter style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 12 }} /><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140, padding: '9px 12px 9px 32px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', appearance: 'none' }}><option value="all">Semua</option><option value="pending">Pending</option><option value="disetujui">Disetujui</option><option value="kembali">Kembali</option><option value="ditolak">Ditolak</option></select></div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          {filteredPeminjamans.length > 0 ? (<>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}><h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Riwayat Peminjaman</h3></div>
            <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{TH({ label: 'Alat', sk: 'alat', sort: riwayatSort, onSort: handleRiwayatSort })}{TH({ label: 'Jumlah', sk: 'jumlah', sort: riwayatSort, onSort: handleRiwayatSort, w: 70 })}{TH({ label: 'Mapel', sk: 'mapel', sort: riwayatSort, onSort: handleRiwayatSort })}{TH({ label: 'Tanggal', sk: 'tanggal', sort: riwayatSort, onSort: handleRiwayatSort })}{TH({ label: 'Status', sk: 'status', sort: riwayatSort, onSort: handleRiwayatSort, w: 130 })}</tr></thead>
              <tbody>{filteredPeminjamans.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.alat?.nama || '-'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'center' }}>{p.jumlah}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{p.mapel ? <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, background: '#faf5ff', color: '#7c3aed', borderRadius: 9999, border: '1px solid #e9d5ff' }}>{p.mapel}</span> : '-'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(p.tanggalPeminjaman)}</td>
                  <td style={{ padding: '10px 12px' }}><div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{SBadge({ status: p.status })}{p.status === 'pending' && <button type="button" onClick={() => onCancelClick(p)} style={{ padding: 4, background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#ef4444' }} title="Batalkan"><FaBan style={{ fontSize: 11 }} /></button>}</div></td>
                </tr>
              ))}</tbody>
            </table></div>
          </>) : (
            <div style={{ textAlign: 'center', padding: 48 }}><FaClipboardList style={{ fontSize: 48, color: '#d1d5db', margin: '0 auto 12px' }} /><h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Riwayat Kosong</h3><p style={{ fontSize: 13, color: '#6b7280' }}>Mulai pinjam alat untuk kebutuhan praktikmu!</p></div>
          )}
        </div>
      </>)}

      {/* MODAL: DETAIL */}
      <Modal isOpen={detailModalOpen} onClose={onCloseDetailModal} title="Detail Alat" size="lg">
        {selectedDetailAlat && (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative', background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', height: zoomed ? 'auto' : 300 }} onClick={() => setZoomed(!zoomed)}>
            {selectedDetailAlat.gambar ? <img src={selectedDetailAlat.gambar} alt="" style={{ width: '100%', display: 'block', objectFit: zoomed ? 'contain' : 'cover', maxHeight: zoomed ? 500 : 300 }} /> : <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaImage style={{ fontSize: 48, color: '#d1d5db' }} /></div>}
            <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>{zoomed ? 'Klik perkecil' : 'Klik perbesar'}</span>
          </div>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{selectedDetailAlat.nama}</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{selectedDetailAlat.kategori && <span style={{ padding: '4px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: 9999, fontSize: 13, fontWeight: 500 }}>{selectedDetailAlat.kategori}</span>}{selectedDetailAlat.merek && <span style={{ padding: '4px 12px', background: '#f3f4f6', color: '#374151', borderRadius: 9999, fontSize: 13 }}>Merek: {selectedDetailAlat.merek}</span>}<span style={{ padding: '4px 12px', background: selectedDetailAlat.stok > 0 ? '#ecfdf5' : '#fee2e2', color: selectedDetailAlat.stok > 0 ? '#059669' : '#dc2626', borderRadius: 9999, fontSize: 13, fontWeight: 500 }}>Stok: {selectedDetailAlat.stok}</span></div></div>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, border: '1px solid #f3f4f6' }}><h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Deskripsi</h3><p style={{ fontSize: 13, color: '#6b7280', margin: 0, whiteSpace: 'pre-line' }}>{selectedDetailAlat.deskripsi || 'Tidak ada deskripsi.'}</p></div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}><button type="button" onClick={() => { onCloseDetailModal(); onPinjamClick(selectedDetailAlat); }} disabled={selectedDetailAlat.stok <= 0} style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: selectedDetailAlat.stok > 0 ? '#fff' : '#9ca3af', background: selectedDetailAlat.stok > 0 ? '#2563eb' : '#f3f4f6', border: 'none', borderRadius: 8, cursor: selectedDetailAlat.stok > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}><FaTools style={{ fontSize: 12 }} />Pinjam</button></div>
        </div>)}
      </Modal>

      {/* MODAL: FORM PEMINJAMAN */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal} title="Form Peminjaman">
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Alat</label><input type="text" readOnly value={selectedAlat?.nama || ''} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#f9fafb', boxSizing: 'border-box' }} /></div>
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Jumlah</label><input type="number" min="1" max={selectedAlat?.stok || 1} value={jumlah} onChange={onJumlahChange} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} /><p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Stok: {selectedAlat?.stok || 0}</p></div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Mapel</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 6, maxHeight: 160, overflowY: 'auto', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              {daftarMapel.map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#374151', background: selectedMapel === m ? '#eff6ff' : 'transparent', border: '1px solid', borderColor: selectedMapel === m ? '#2563eb' : 'transparent', transition: 'all 0.1s' }} onMouseEnter={e => { if (selectedMapel !== m) e.currentTarget.style.background = '#f9fafb'; }} onMouseLeave={e => { if (selectedMapel !== m) e.currentTarget.style.background = 'transparent'; }}>
                  <input type="radio" name="mapel" value={m} checked={selectedMapel === m} onChange={onMapelChange} style={{ accentColor: '#2563eb' }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m}</span>
                </label>
              ))}
            </div>
          </div>
          {selectedMapel && (
            <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Guru</label>
              {gurus.length > 0 ? <select value={selectedGuru} onChange={onGuruChange} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}><option value="">Pilih guru</option>{gurus.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}</select>
              : <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>Tidak ada guru untuk {selectedMapel}</p>}
            </div>
          )}
          {message && <div style={{ padding: 10, fontSize: 13, color: '#991b1b', background: '#fee2e2', borderRadius: 8 }}>{message}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
            <button type="button" onClick={onCloseModal} style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' }}>Batal</button>
            <button type="submit" disabled={submitting || !selectedMapel || !selectedGuru} style={{ padding: '9px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: (!selectedMapel || !selectedGuru) ? 0.5 : 1 }}>{submitting ? <><Spin />Menyimpan...</> : 'Ajukan Peminjaman'}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: BATAL */}
      <Modal isOpen={cancelModalOpen} onClose={onCloseCancelModal} title="Batalkan Peminjaman">
        {cancelTarget && (<div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaExclamationTriangle style={{ fontSize: 24, color: '#ef4444' }} /></div>
          <div style={{ textAlign: 'center' }}><h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Yakin membatalkan?</h3><p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>"<b style={{ color: '#111827' }}>{cancelTarget.alat?.nama || '-'}</b>"</p></div>
          <div style={{ width: '100%', background: '#f9fafb', borderRadius: 8, padding: 12, border: '1px solid #f3f4f6' }}>
            {[['Mapel', cancelTarget.mapel], ['Jumlah', cancelTarget.jumlah], ['Tanggal', fmt(cancelTarget.tanggalPeminjaman)]].map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}><span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 500, color: '#111827' }}>{v}</span></div>)}
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button type="button" onClick={onCloseCancelModal} disabled={cancelling} style={{ flex: 1, padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', background: '#fff', cursor: 'pointer', opacity: cancelling ? 0.5 : 1 }}>Tidak</button>
            <button type="button" onClick={onConfirmCancel} disabled={cancelling} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: cancelling ? 0.5 : 1 }}>{cancelling ? <><Spin />Membatalkan...</> : <><FaBan style={{ fontSize: 11 }} />Ya, Batalkan</>}</button>
          </div>
        </div>)}
      </Modal>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}