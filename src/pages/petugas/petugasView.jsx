//src/pages/petugas/petugasView.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Cropper from 'react-easy-crop';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import DashboardGrid from '../../components/dashboard/dashboardGrid';
import Button from '../../components/button';
import Modal from '../../components/modal';
import AlatForm from '../../components/alat/alatForm';
import UserForm from '../../components/user/UserForm';
import AlatCard from '../../components/alat/AlatCard';
import PetugasMapelView from '../../components/PetugasMapelView';
import { toast } from 'react-toastify';
import { FaTools, FaExternalLinkAlt, FaCalendarAlt, FaImage, FaSync, FaPlus, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaArrowLeft, FaEye, FaHistory, FaFileExcel, FaQuestionCircle, FaExclamationTriangle, FaSearch, FaClipboardList, FaChartPie, FaChartLine, FaChevronLeft, FaChevronRight, FaUserCircle, FaEnvelope, FaWhatsapp, FaArrowUp, FaUser, FaSchool, FaTimes, FaIdCard, FaBook } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler);

const FilterBar = ({ children }) => (<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{children}</div></div>);
const InputSearch = ({ value, onChange, placeholder, span = 2 }) => (<div className={`relative col-span-1 ${span === 2 ? 'md:col-span-2' : ''}`}><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400 text-sm" /></div><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" /></div>);
const SelectFilter = ({ value, onChange, options }) => (<select value={value} onChange={(e) => onChange(e.target.value)} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">{options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>);
const PaginationControls = ({ page, setPage, totalPages, limit, setLimit, totalData }) => (<div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-white"><div className="flex items-center gap-2 text-sm text-gray-600"><span>Tampilkan</span><select value={limit} onChange={(e) => { const v = e.target.value; if (v === 'custom') { const cv = prompt('Jumlah per halaman:'); if (!cv) return; setLimit(parseInt(cv, 10) || 10); } else setLimit(parseInt(v, 10)); }} className="px-2 py-1 border rounded-md text-xs bg-white"><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="custom">Custom</option></select><span>data/halaman (Total: {totalData})</span></div><div className="flex items-center gap-1"><button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><FaChevronLeft className="text-xs" /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => { let pn; if (totalPages <= 5) pn = i + 1; else { pn = Math.max(1, page - 2) + i; if (pn > totalPages || pn < 1) return null; } return (<button key={pn} type="button" onClick={() => setPage(pn)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${page === pn ? 'bg-blue-600 text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>{pn}</button>); })}<button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><FaChevronRight className="text-xs" /></button></div></div>);
const StatusBadge = ({ status }) => (<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : status === 'disetujui' ? 'bg-green-100 text-green-800' : status === 'diajukan_kembali' ? 'bg-purple-100 text-purple-800' : status === 'kembali' ? 'bg-blue-100 text-blue-800' : status === 'ditolak' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{status === 'diajukan_kembali' ? 'Diajukan Kembali' : status}</span>);
const KondisiBadge = ({ kondisi }) => (<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${kondisi === 'baik' ? 'bg-green-100 text-green-800' : kondisi === 'rusak berat' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{kondisi}</span>);
const SortableTh = ({ label, sortKey, sort, onSort, className }) => { const active = sort.key === sortKey; return (<th onClick={() => onSort(sortKey)} className={`cursor-pointer hover:text-gray-700 select-none ${className || ''}`}><span className="flex items-center gap-1">{label}<span className={`text-[10px] ${active ? 'text-blue-500' : 'text-gray-300'}`}>{active ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}</span></span></th>); };
const HoverCard = ({ user, onClick, children }) => { const [show, setShow] = useState(false); const ref = useRef(null); const [pos, setPos] = useState({ top: 0, left: 0 }); useEffect(() => { if (!show) return; const hide = () => setShow(false); window.addEventListener('scroll', hide, true); return () => window.removeEventListener('scroll', hide, true); }, [show]); if (!user) return <>{children}</>; return (<span ref={ref} className="relative inline-block cursor-pointer hover:text-blue-600 hover:underline" onMouseEnter={() => { const r = ref.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, left: r.left }); setShow(true); }} onMouseLeave={() => setShow(false)} onClick={() => { onClick?.(); setShow(false); }}>{children}{show && (<div className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-60" style={{ top: Math.min(pos.top, window.innerHeight - 220), left: Math.min(pos.left, window.innerWidth - 260) }}><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><FaUserCircle className="text-base text-blue-500" /></div><div><p className="font-semibold text-sm text-gray-900 leading-tight">{user.nama}</p><span className={`inline-block mt-0.5 px-1.5 py-0 text-[9px] font-medium rounded-full ${user.role === 'guru' ? 'bg-blue-50 text-blue-700' : user.role === 'petugas' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>{user.role}</span></div></div>{user.email && <p className="text-[11px] text-gray-500 flex items-center gap-1"><FaEnvelope className="text-[9px]" />{user.email}</p>}{user.nohp && <p className="text-[11px] text-gray-500 flex items-center gap-1"><FaWhatsapp className="text-[9px] text-green-500" />{user.nohp}</p>}{user.role === 'siswa' && user.kelas && <p className="text-[11px] text-gray-500">Kelas: {user.kelas}</p>}{(user.nip || user.nisn) && <p className="text-[11px] text-gray-500">{user.nip ? `NIP: ${user.nip}` : `NISN: ${user.nisn}`}</p>}<p className="text-[10px] text-blue-500 mt-1.5 border-t border-gray-100 pt-1.5">Klik untuk lihat profil lengkap →</p></div>)}</span>); };
const todayStr = new Date().toISOString().split('T')[0];
const fmt = (d) => { if (!d) return '-'; return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); };
const fmtTime = (d) => { if (!d) return ''; const dt = new Date(d); return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`; };

// ═══ DETAIL MODAL CARD ═══
  const DetailCard = ({ data, onClose }) => {
    const [isBuktiZoomed, setIsBuktiZoomed] = useState(false);
    const [isBuktiBelajarZoomed, setIsBuktiBelajarZoomed] = useState(false);
    if (!data) return null;
    const u = data.fullUser, g = data.fullGuru, a = data.alat;
    const hasBukti = data.buktiGambar && (data.kondisiPengembalian === 'kurang' || data.kondisiPengembalian === 'rusak berat');
    const hasBuktiBelajar = data.buktiPembelajaran && Array.isArray(data.buktiPembelajaran) && data.buktiPembelajaran.length > 0;
    const has = (v) => v && v !== '-' && v !== 'null' && v !== 'undefined';
    const sec = (icon, label) => (<div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12,paddingBottom:8,borderBottom:'1px solid #f3f4f6'}}>{icon}<span style={{fontSize:12,fontWeight:600,color:'#374151',textTransform:'uppercase',letterSpacing:'0.04em'}}>{label}</span></div>);
    const row = (label, val) => has(val) ? (<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}><span style={{fontSize:12,color:'#9ca3af',flexShrink:0,width:100}}>{label}</span><span style={{fontSize:13,color:'#111827',fontWeight:500,textAlign:'right',wordBreak:'break-all'}}>{val}</span></div>) : null;
    const link = (label, icon, href, val, iconColor) => has(val) ? (<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}><span style={{fontSize:12,color:'#9ca3af',flexShrink:0,width:100}}>{label}</span><a href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined} onClick={!href.startsWith('http')&&!href.startsWith('mailto')?(e)=>{e.preventDefault();onClose();setTimeout(()=>window.location.hash=`#/profile/${data.userId||u?.id}`,50);}:undefined} style={{fontSize:13,color:'#2563eb',fontWeight:500,textDecoration:'none',display:'flex',alignItems:'center',gap:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:260}}>{icon}<span>{val}</span></a></div>) : null;
    const picBox = (bg, borderC, ic, img, fallback) => (
      <div style={{width:48,height:48,borderRadius:14,backgroundColor:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`2px solid ${borderC}`,overflow:'hidden'}}>
        {img ? <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:20,color:ic}}>{fallback}</span>}
      </div>
    );

    return (
      <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <div style={{position:'absolute',inset:0,backgroundColor:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)'}} onClick={onClose} />
        <div style={{position:'relative',backgroundColor:'#fff',borderRadius:16,boxShadow:'0 25px 50px rgba(0,0,0,0.2)',width:'100%',maxWidth:520,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div><h2 style={{fontSize:18,fontWeight:700,color:'#111827',margin:0}}>Detail Transaksi</h2><p style={{fontSize:11,color:'#9ca3af',margin:'2px 0 0'}}>ID: {data.id?.slice(0,12)}...</p></div>
            <div style={{display:'flex',alignItems:'center',gap:8}}><StatusBadge status={data.status} /><button type="button" onClick={onClose} style={{padding:6,backgroundColor:'#f3f4f6',border:'none',borderRadius:8,cursor:'pointer',color:'#6b7280'}} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#e5e7eb'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#f3f4f6'}><FaTimes style={{fontSize:12}} /></button></div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:20}}>
            <div>{sec(<FaClipboardList style={{fontSize:12,color:'#6366f1'}}/>,'Info Peminjaman')}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px'}}>
                <div style={{display:'flex',flexDirection:'column',gap:2}}><span style={{fontSize:11,color:'#9ca3af'}}>Tgl Pinjam</span><span style={{fontSize:13,fontWeight:500,color:'#111827'}}>{fmt(data.tanggalPeminjaman)} {fmtTime(data.tanggalPeminjaman)}</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:2}}><span style={{fontSize:11,color:'#9ca3af'}}>Tgl Kembali</span><span style={{fontSize:13,fontWeight:500,color:'#111827'}}>{data.tanggalPengembalian?`${fmt(data.tanggalPengembalian)} ${fmtTime(data.tanggalPengembalian)}`:<span style={{color:'#d1d5db'}}>—</span>}</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:2}}><span style={{fontSize:11,color:'#9ca3af'}}>Jumlah</span><span style={{fontSize:13,fontWeight:600,color:'#111827'}}>{data.jumlah||1} unit</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:2}}><span style={{fontSize:11,color:'#9ca3af'}}>Mapel</span><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{g?.mapelUsed?.map((m,i)=><span key={i} style={{fontSize:11,fontWeight:500,backgroundColor:'#eef2ff',color:'#4338ca',padding:'2px 10px',borderRadius:9999,border:'1px solid #c7d2fe'}}>{m}</span>)||<span style={{color:'#d1d5db'}}>—</span>}</div></div>
                <div style={{gridColumn:'1 / -1',display:'flex',flexDirection:'column',gap:2}}><span style={{fontSize:11,color:'#9ca3af'}}>Kondisi Pengembalian</span>{data.kondisiPengembalian?<KondisiBadge kondisi={data.kondisiPengembalian}/>:<span style={{color:'#d1d5db',fontSize:13}}>—</span>}</div>
              </div>
            </div>
            <div>{sec(<FaUser style={{fontSize:12,color:'#3b82f6'}}/>,'Info Peminjam')}
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                {picBox('#eff6ff','#dbeafe','#93c5fd',u?.foto,<FaUser />)}
                <div style={{flex:1,minWidth:0}}><p style={{fontSize:14,fontWeight:600,color:'#111827',margin:'0 0 6px'}}>{u?.nama||'-'}</p><div style={{display:'flex',flexWrap:'wrap',gap:'4px 12px'}}>{u?.role&&<span style={{fontSize:10,fontWeight:600,padding:'1px 8px',borderRadius:9999,backgroundColor:'#eff6ff',color:'#2563eb',textTransform:'uppercase'}}>{u.role}</span>}{u?.kelas&&<span style={{fontSize:11,color:'#6b7280',display:'flex',alignItems:'center',gap:3}}><FaSchool style={{fontSize:9}}/>{u.kelas}</span>}</div></div>
              </div>
              <div style={{marginTop:10,borderTop:'1px solid #f9fafb',paddingTop:8}}>
                {link('NISN',<FaIdCard style={{fontSize:10,flexShrink:0}}/>,'nisn-link',u?.nisn,'#2563eb')}
                {link('Email',<FaEnvelope style={{fontSize:10,flexShrink:0}}/>,'mailto:'+u?.email,u?.email)}
                {link('No HP',<FaWhatsapp style={{fontSize:10,flexShrink:0,color:'#16a34a'}}/>,'https://wa.me/62'+(u?.nohp||'').replace(/^0/,''),u?.nohp)}
              </div>
            </div>
            <div>{sec(<FaUserCircle style={{fontSize:12,color:'#8b5cf6'}}/>,'Guru Pendamping')}
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                {picBox('#faf5ff','#e9d5ff','#c084fc',g?.foto,<FaUserCircle />)}
                <div style={{flex:1,minWidth:0}}><p style={{fontSize:14,fontWeight:600,color:'#111827',margin:'0 0 4px'}}>{g?.nama||'-'}</p>{has(g?.nip)&&g.nip!=='-'&&<p style={{fontSize:11,color:'#9ca3af',margin:0}}>NIP: {g.nip}</p>}</div>
              </div>
              <div style={{marginTop:10,borderTop:'1px solid #f9fafb',paddingTop:8}}>
                {link('Email',<FaEnvelope style={{fontSize:10,flexShrink:0}}/>,'mailto:'+g?.email,g?.email)}
                {link('No HP',<FaWhatsapp style={{fontSize:10,flexShrink:0,color:'#16a34a'}}/>,'https://wa.me/62'+(g?.nohp||'').replace(/^0/,''),g?.nohp)}
              </div>
            </div>
            <div>{sec(<FaTools style={{fontSize:12,color:'#f59e0b'}}/>,'Info Alat')}
              <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 14px',backgroundColor:'#fffbeb',borderRadius:10,border:'1px solid #fef3c7'}}>
                <div style={{width:80,height:80,borderRadius:10,backgroundColor:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid #fde68a',overflow:'hidden'}}>
                  {a?.gambar ? <img src={a.gambar} alt={a?.nama} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <FaTools style={{fontSize:28,color:'#f59e0b'}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:14,fontWeight:600,color:'#92400e',margin:0}}>{a?.nama||'-'}</p>
                  {a?.merek&&<p style={{fontSize:11,color:'#b45309',margin:'2px 0 0'}}>Merek: {a.merek}</p>}
                  {a?.kategori&&<span style={{display:'inline-block',padding:'2px 8px',backgroundColor:'#fef3c7',color:'#92400e',fontSize:11,fontWeight:500,borderRadius:9999,border:'1px solid #fde68a',margin:'4px 4px 0 0'}}>{a.kategori}</span>}
                  <p style={{fontSize:11,color:'#b45309',margin:'2px 0 0'}}>Jumlah: {data.jumlah||1} unit</p>
                </div>
              </div>
            </div>
            {hasBuktiBelajar && (<div>{sec(<FaImage style={{fontSize:12,color:'#2563eb'}}/>,'Bukti Pembelajaran')}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:8}}>
                {data.buktiPembelajaran.map((src, i) => (
                  <div key={i} style={{position:'relative',borderRadius:10,overflow:'hidden',border:'1px solid #dbeafe',backgroundColor:'#eff6ff',cursor:'pointer'}} onClick={()=>setIsBuktiBelajarZoomed(!isBuktiBelajarZoomed)}>
                    <img src={src} alt={`Bukti ${i+1}`} style={{width:'100%',height:isBuktiBelajarZoomed?200:100,objectFit:isBuktiBelajarZoomed?'contain':'cover',display:'block',transition:'height 0.2s'}} />
                    <div style={{position:'absolute',bottom:4,right:4,display:'flex',gap:4}}>
                      <span style={{fontSize:9,fontWeight:600,backgroundColor:'rgba(0,0,0,0.5)',color:'#fff',padding:'2px 6px',borderRadius:4,backdropFilter:'blur(4px)'}}>{i+1}/{data.buktiPembelajaran.length}</span>
                      <a href={src} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:9,fontWeight:500,backgroundColor:'rgba(0,0,0,0.5)',color:'#fff',padding:'3px 8px',borderRadius:4,textDecoration:'none',display:'flex',alignItems:'center',gap:3,backdropFilter:'blur(4px)'}}><FaExternalLinkAlt style={{fontSize:8}}/>Buka</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>)}
            {data.status==='kembali'&&(<div>{sec(<FaImage style={{fontSize:12,color:hasBukti?'#ef4444':'#9ca3af'}}/>,'Bukti Pengembalian')}
              {hasBukti?(<div style={{position:'relative',borderRadius:12,overflow:'hidden',border:'1px solid #fecaca',backgroundColor:'#fef2f2',cursor:'pointer'}} onClick={()=>setIsBuktiZoomed(!isBuktiZoomed)}>
                <img src={data.buktiGambar} alt="Bukti" style={{width:'100%',maxHeight:isBuktiZoomed?500:260,objectFit:isBuktiZoomed?'contain':'cover',display:'block',transition:'max-height 0.3s'}}/>
                <div style={{position:'absolute',bottom:8,left:8}}><span style={{fontSize:10,fontWeight:600,backgroundColor:'rgba(0,0,0,0.6)',color:'#fff',padding:'3px 10px',borderRadius:6,backdropFilter:'blur(4px)'}}>Kondisi: {data.kondisiPengembalian}</span></div>
                <div style={{position:'absolute',bottom:8,right:8,display:'flex',gap:6}}>
                  <span style={{fontSize:10,fontWeight:500,backgroundColor:'rgba(0,0,0,0.6)',color:'#fff',padding:'3px 10px',borderRadius:6,backdropFilter:'blur(4px)'}}>{isBuktiZoomed?'Klik perkecil':'Klik perbesar'}</span>
                  <a href={data.buktiGambar} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()} style={{fontSize:10,fontWeight:500,backgroundColor:'rgba(0,0,0,0.6)',color:'#fff',padding:'4px 10px',borderRadius:6,textDecoration:'none',display:'flex',alignItems:'center',gap:4,backdropFilter:'blur(4px)'}}><FaExternalLinkAlt style={{fontSize:9}}/>Buka</a>
                </div>
              </div>):(<div style={{padding:'20px 16px',backgroundColor:'#f9fafb',borderRadius:10,border:'1px dashed #e5e7eb',textAlign:'center'}}><FaCheckCircle style={{fontSize:20,color:'#10b981',marginBottom:6}}/><p style={{fontSize:12,color:'#6b7280',margin:0}}>Dikembalikan dalam kondisi <strong style={{color:'#059669'}}>baik</strong>. Tidak perlu bukti foto.</p></div>)}
            </div>)}
          </div>
          <div style={{padding:'16px 24px',borderTop:'1px solid #f3f4f6',display:'flex',justifyContent:'flex-end',flexShrink:0}}><button type="button" onClick={onClose} style={{padding:'10px 24px',backgroundColor:'#f3f4f4f',color:'#4b5563',fontWeight:600,borderRadius:10,border:'none',cursor:'pointer',fontSize:13}} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#e5e7eb'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='#f3f4f6'}>Tutup</button></div>
        </div>
      </div>
    );
  };

export default function PetugasView({
  user, peminjamans, alats, guruList, statistics, chartData, loading, activeTab,
  filteredPeminjamans, filteredGuruList, filteredLaporan,
  sortedGuruList, guruSort, handleGuruSort,
  sortedLaporan, laporanSort, handleLaporanSort,
  guruIdToUser,
  paginatedLaporan, laporanPage, setLaporanPage, laporanLimit, setLaporanLimit, totalPagesLaporan,
  paginatedGuruList, guruPage, setGuruPage, guruLimit, setGuruLimit, totalPagesGuru,
  editLaporanModal, setEditLaporanModal, handleOpenEditLaporan, handleSaveEditLaporan,
  searchAlat, setSearchAlat, filterCategory, setFilterCategory, filterStatus, setFilterStatus,
  searchPeminjaman, setSearchPeminjaman, filterStatusPeminjaman, setFilterStatusPeminjaman,
  searchGuru, setSearchGuru, filterRoleGuru, setFilterRoleGuru,
  searchLaporan, setSearchLaporan, filterStatusLaporan, setFilterStatusLaporan,
  startDate, setStartDate, endDate, setEndDate,
  alatModalOpen, selectedAlat, alatDetailModalOpen, alatDetail,
  confirmModal, returnModal, guruDetailModalOpen, guruDetail,
  resetPasswordModal, alatTrackingModalOpen, alatTrackingData,
  userModalOpen, selectedUser, cropModal, crop, zoom,
  setZoom, setCrop, onCropComplete,
  setReturnModal, setConfirmModal, setAlatDetailModalOpen, setAlatTrackingModalOpen,
  setGuruDetailModalOpen, setResetPasswordModal,
  handleLogout, handleRefreshData, handleAddAlat, handleEditClick, handleDeleteAlat,
  handleViewAlatDetail, handleCloseModal, handleCreateAlat, handleEditAlat,
  handleApprove, handleReject, handleReturn, confirmReturn, handleBuktiChange,
  handleCropConfirm, handleCropCancel, handleDeletePeminjaman,
  viewGuruProfile, handleExportFiltered, handleResetPassword, handleDeleteUser,
  handlePasswordChange, confirmResetPassword, handleAddUser, handleCloseUserModal,
  handleCreateUser, handleUpdateUser, handleEditUser, handleViewAlatTracking,
  detailModal, setDetailModal, handleViewDetail, teachers, userRosterMap,
}) {
  const mainRef = useRef(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [trackSearch, setTrackSearch] = useState('');
  const [trackStatus, setTrackStatus] = useState('all');
  const [trackSort, setTrackSort] = useState({ key: '', dir: 'asc' });
  const [trackPage, setTrackPage] = useState(1);
  const [trackLimit, setTrackLimit] = useState(10);
  const [mapelAddTrigger, setMapelAddTrigger] = useState(0);

  const kondisiOrder = { baik: 1, kurang: 2, rusak: 3 };
  const statusOrder = { pending: 1, disetujui: 2, kembali: 3, ditolak: 4, dibatalkan: 5 };
  useEffect(() => { const el = mainRef.current; if (!el) return; const onScroll = () => setShowTopBtn(el.scrollTop > 300 || window.scrollY > 300); el.addEventListener('scroll', onScroll); window.addEventListener('scroll', onScroll); return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('scroll', onScroll); }; }, []);
  const scrollToTop = () => { mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0, grid: { color: '#f3f4f6' } } }, x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 0 } } } };
  const hBarOpts = { ...chartOpts, indexAxis: 'y' };
  const handleStartDateChange = (val) => { setStartDate(val); if (endDate && val && new Date(val) > new Date(endDate)) setEndDate(''); };
  const handleEndDateChange = (val) => { if (val > todayStr) return; if (startDate && val && new Date(val) < new Date(startDate)) return; setEndDate(val); };
  const getUserById = (id) => guruList.find(u => u.id === id);

  const trackStats = useMemo(() => { const rows = alatTrackingData?.riwayatPinjam || []; return { total: rows.length, pending: rows.filter(r => r.status === 'pending').length, disetujui: rows.filter(r => r.status === 'disetujui').length, kembali: rows.filter(r => r.status === 'kembali').length, ditolak: rows.filter(r => r.status === 'ditolak').length, dibatalkan: rows.filter(r => r.status === 'dibatalkan').length, totalPinjam: rows.reduce((s, r) => s + (r.jumlah || 1), 0), baik: rows.filter(r => r.kondisiPengembalian === 'baik').length, kurang: rows.filter(r => r.kondisiPengembalian === 'kurang').length, rusak: rows.filter(r => r.kondisiPengembalian === 'rusak').length }; }, [alatTrackingData]);
  const trackFiltered = useMemo(() => {
    let rows = alatTrackingData?.riwayatPinjam || [];
    if (trackSearch) { const q = trackSearch.toLowerCase(); rows = rows.filter(r => (r.user?.nama || '').toLowerCase().includes(q) || (r.guru?.nama || '').toLowerCase().includes(q)); }
    if (trackStatus !== 'all') rows = rows.filter(r => r.status === trackStatus);
    if (trackSort.key) { const { key, dir } = trackSort; rows = [...rows].sort((a, b) => { let va, vb; switch (key) { case 'peminjam': va = (a.user?.nama || '').toLowerCase(); vb = (b.user?.nama || '').toLowerCase(); break; case 'kelas': va = (a.user?.kelas || '').toLowerCase(); vb = (b.user?.kelas || '').toLowerCase(); break; case 'guru': va = (a.guru?.nama || '').toLowerCase(); vb = (b.guru?.nama || '').toLowerCase(); break; case 'jumlah': va = a.jumlah || 0; vb = b.jumlah || 0; break; case 'tanggal': va = a.tanggalPeminjaman || a.tanggal || ''; vb = b.tanggalPeminjaman || b.tanggal || ''; break; case 'tglKembali': va = a.tanggalPengembalian || a.tanggalKembali || ''; vb = b.tanggalPengembalian || b.tanggalKembali || ''; break; case 'kondisi': va = kondisiOrder[a.kondisiPengembalian] ?? 99; vb = kondisiOrder[b.kondisiPengembalian] ?? 99; break; case 'status': va = statusOrder[a.status] ?? 99; vb = statusOrder[b.status] ?? 99; break; default: return 0; } if (va < vb) return dir === 'asc' ? -1 : 1; if (va > vb) return dir === 'asc' ? 1 : -1; return 0; }); }
    return rows;
  }, [alatTrackingData, trackSearch, trackStatus, trackSort]);
  const trackTotalPages = Math.max(1, Math.ceil(trackFiltered.length / trackLimit));
  const trackPaginated = useMemo(() => { const start = (trackPage - 1) * trackLimit; return trackFiltered.slice(start, start + trackLimit); }, [trackFiltered, trackPage, trackLimit]);
  const handleTrackSort = (key) => { setTrackSort(prev => ({ key: prev.key === key ? (prev.dir === 'asc' ? key : '') : key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' })); setTrackPage(1); };

  if (loading) return (<div className="flex justify-center items-center h-full w-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" /></div>);
  const recentActivity = [...peminjamans].sort((a, b) => new Date(b.tanggalPeminjaman) - new Date(a.tanggalPeminjaman)).slice(0, 5);

  return (
    <div ref={mainRef} className="p-6 space-y-6 bg-gray-50 min-h-full w-full relative">
      {showTopBtn && (<button type="button" onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110" title="Ke atas"><FaArrowUp className="text-sm" /></button>)}

      {/* HEADER */}
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:16,background:'#fff',padding:16,borderRadius:12,boxShadow:'0 1px 3px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
        <h1 style={{fontSize:24,fontWeight:700,color:'#111827',margin:0,textTransform:'capitalize'}}>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'laporan' ? 'Analisis Praktik Siswa' : activeTab === 'mapel' ? 'Manajemen Mapel' : activeTab === 'guru' ? 'Manajemen User' : activeTab.replace('-', ' ')}</h1>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}>
          {['dashboard','peminjaman'].includes(activeTab) && <button type="button" onClick={handleRefreshData} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',backgroundColor:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}><FaSync/>Refresh</button>}
          {activeTab === 'alat' && <button type="button" onClick={handleAddAlat} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',backgroundColor:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}><FaPlus/>Tambah Alat</button>}
          {activeTab === 'guru' && <button type="button" onClick={handleAddUser} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',backgroundColor:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}><FaPlus/>Tambah User</button>}
          {activeTab === 'laporan' && <button type="button" onClick={handleExportFiltered} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',backgroundColor:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}><FaFileExcel/>Export Filtered</button>}
          {activeTab === 'mapel' && <button type="button" onClick={() => setMapelAddTrigger(p => p + 1)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',backgroundColor:'#7c3aed',color:'#fff',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}><FaPlus/>Tambah Mapel</button>}
        </div>
      </div>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <DashboardGrid statistics={statistics} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center"><FaChartLine className="mr-2 text-blue-500" />Tren Peminjaman Per Bulan</h3><div style={{ height: '250px' }}><Line data={{ labels: chartData.trend.labels, datasets: [{ label: 'Jumlah Peminjaman', data: chartData.trend.data, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }] }} options={chartOpts} /></div></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center"><FaChartPie className="mr-2 text-indigo-500" />Distribusi Kondisi Pengembalian</h3><div style={{ height: '250px' }}><Doughnut data={{ labels: chartData.kondisi.labels, datasets: [{ data: chartData.kondisi.data, backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'] }] }} options={chartOpts} /></div></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-md font-semibold text-gray-800 flex items-center"><FaClipboardList className="mr-2 text-gray-500" />Aktivitas Terkini</h3></div>
            <div className="divide-y divide-gray-50">{recentActivity.length > 0 ? recentActivity.map((p) => (<div key={p.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${p.status === 'pending' ? 'bg-yellow-400' : p.status === 'disetujui' ? 'bg-green-400' : 'bg-blue-400'}`} /><div><p className="text-sm font-medium text-gray-900">{p.user?.nama || '-'}</p><p className="text-xs text-gray-500">Meminjam {p.alat?.nama || '-'}</p></div></div><span className="text-xs text-gray-400">{new Date(p.tanggalPeminjaman).toLocaleDateString('id-ID')}</span></div>)) : <p className="p-6 text-sm text-gray-500 text-center">Belum ada aktivitas.</p>}</div>
          </div>
        </div>
      )}

      {/* PEMINJAMAN */}
      {activeTab === 'peminjaman' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <FilterBar><InputSearch value={searchPeminjaman} onChange={setSearchPeminjaman} placeholder="Cari siswa atau alat..." /><SelectFilter value={filterStatusPeminjaman} onChange={setFilterStatusPeminjaman} options={[{ value: 'all', label: 'Semua Status' }, { value: 'pending', label: 'Pending' }, { value: 'disetujui', label: 'Disetujui' }, { value: 'diajukan_kembali', label: 'Diajukan Kembali' }]} /><button type="button" onClick={() => { setSearchPeminjaman(''); setFilterStatusPeminjaman('all'); }} className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Reset</button></FilterBar>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alat</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredPeminjamans.length > 0 ? filteredPeminjamans.map((p) => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm text-gray-900">{p.user?.nama || '-'}</td><td className="px-6 py-4 text-sm text-gray-600">{p.alat?.nama || '-'}</td><td className="px-6 py-4"><StatusBadge status={p.status} /></td><td className="px-6 py-4 text-center text-sm">{p.status === 'pending' && (<div className="flex justify-center gap-2"><button type="button" onClick={() => handleApprove(p.id)} className="text-green-600 hover:bg-green-100 px-3 py-1 rounded-lg text-xs font-medium"><FaCheckCircle className="inline mr-1" />Setujui</button><button type="button" onClick={() => handleReject(p.id)} className="text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium"><FaTimesCircle className="inline mr-1" />Tolak</button></div>)}{p.status === 'disetujui' && (<span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>Menunggu siswa</span>)}{p.status === 'diajukan_kembali' && (<button type="button" onClick={() => handleReturn(p.id)} className="text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-medium"><FaArrowLeft className="inline mr-1" />Proses Pengembalian</button>)}</td></tr>)) : (<tr><td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada peminjaman aktif.</td></tr>)}</tbody></table></div>
        </div>
      )}

      {/* ALAT */}
      {activeTab === 'alat' && (<div><FilterBar><InputSearch value={searchAlat} onChange={setSearchAlat} placeholder="Cari nama atau merek alat..." /><SelectFilter value={filterCategory} onChange={setFilterCategory} options={[{ value: '', label: 'Semua Kategori' }, { value: 'Elektronik', label: 'Elektronik' }, { value: 'Komputer', label: 'Komputer' }, { value: 'Jaringan', label: 'Jaringan' }, { value: 'Peralatan', label: 'Peralatan' }, { value: 'Bahan', label: 'Bahan' }, { value: 'Lainnya', label: 'Lainnya' }]} /><button type="button" onClick={() => { setSearchAlat(''); setFilterCategory(''); setFilterStatus(''); }} className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Reset</button></FilterBar><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{alats.length > 0 ? alats.map((alat) => (<AlatCard key={alat.id} alat={alat} onEdit={() => handleEditClick(alat)} onDelete={() => handleDeleteAlat(alat.id)} onView={handleViewAlatDetail} onTrack={handleViewAlatTracking} />)) : (<div className="col-span-full text-center py-16"><FaSearch className="mx-auto h-12 w-12 text-gray-300 mb-4" /><h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data alat.</h3><div className="mt-6"><button type="button" onClick={handleAddAlat} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"><FaPlus className="mr-2" />Tambah Alat Baru</button></div></div>)}</div></div>)}

      {/* GURU / USER */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <FilterBar><InputSearch value={searchGuru} onChange={setSearchGuru} placeholder="Cari nama, email, NISN/NIP..." /><SelectFilter value={filterRoleGuru} onChange={setFilterRoleGuru} options={[{ value: 'all', label: 'Semua Role' }, { value: 'petugas', label: 'Petugas' }, { value: 'guru', label: 'Guru' }, { value: 'siswa', label: 'Siswa' }]} /><button type="button" onClick={() => { setSearchGuru(''); setFilterRoleGuru('all'); }} className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Reset</button></FilterBar>

          {/* Profil User */}
          <Modal isOpen={guruDetailModalOpen} onClose={() => setGuruDetailModalOpen(false)} title="Profil User" size="md">
            {guruDetail && (<div className="space-y-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><FaUserCircle className="text-3xl text-blue-500" /></div><div><h3 className="text-lg font-bold text-gray-900">{guruDetail.nama}</h3><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${guruDetail.role === 'guru' ? 'bg-blue-50 text-blue-700' : guruDetail.role === 'petugas' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>{guruDetail.role}</span></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><span className="text-gray-500 block mb-1">NISN / NIP</span><p className="font-medium text-gray-900">{guruDetail.role === 'guru' ? (guruDetail.nip || '-') : guruDetail.role === 'siswa' ? (guruDetail.nisn || '-') : '-'}</p></div>{guruDetail.role === 'siswa' && (<div><span className="text-gray-500 block mb-1">Kelas</span><p className="font-medium text-gray-900">{guruDetail.kelas || '-'}</p></div>)}<div><span className="text-gray-500 block mb-1">Email</span>{guruDetail.email ? (<a href={`mailto:${guruDetail.email}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1.5"><FaEnvelope className="text-xs" />{guruDetail.email}</a>) : <p className="font-medium text-gray-400">-</p>}</div><div><span className="text-gray-500 block mb-1">No HP (WhatsApp)</span>{guruDetail.nohp ? (<a href={`https://wa.me/62${guruDetail.nohp.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline flex items-center gap-1.5"><FaWhatsapp className="text-xs" />{guruDetail.nohp}</a>) : <p className="font-medium text-gray-400">-</p>}</div>{guruDetail.role === 'guru' && (userRosterMap[guruDetail.id] || []).length > 0 && (<div className="sm:col-span-2"><span className="text-gray-500 block mb-2">Mapel <span className="text-[10px] text-gray-400">(dari roster)</span></span><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{(userRosterMap[guruDetail.id] || []).map(m => (<div key={m.nama} style={{ padding: '6px 10px', background: '#faf5ff', borderRadius: 6, border: '1px solid #e9d5ff' }}><div style={{ fontWeight: 600, color: '#6d28d9', fontSize: 12 }}>{m.nama}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>{m.kelasList.map(k => <span key={k} style={{ fontSize: 10, padding: '1px 6px', background: '#fff', color: '#7c3aed', borderRadius: 9999, border: '1px solid #ddd6fe' }}>{k}</span>)}</div></div>))}</div></div>)}</div></div>)}
          </Modal>

          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><SortableTh label="Nama" sortKey="nama" sort={guruSort} onSort={handleGuruSort} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase w-[16%]" /><SortableTh label="Role" sortKey="role" sort={guruSort} onSort={handleGuruSort} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase w-[10%]" /><SortableTh label="NISN / NIP" sortKey="identitas" sort={guruSort} onSort={handleGuruSort} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase w-[12%]" /><th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase w-[14%]">Mapel</th><th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase w-[16%]">Email</th><th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase w-[12%]">No HP</th><th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[20%]">Aksi</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{sortedGuruList?.length > 0 ? sortedGuruList.map((u) => (<tr key={u.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-medium text-gray-900 truncate">{u.nama}</td><td className="px-4 py-3"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${u.role === 'guru' ? 'bg-blue-50 text-blue-700' : u.role === 'petugas' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>{u.role}</span></td><td className="px-4 py-3 text-sm text-gray-600">{u.role === 'guru' ? (u.nip || '-') : u.role === 'siswa' ? (u.nisn || '-') : '-'}</td><td className="px-4 py-3 text-sm text-gray-600">{(userRosterMap[u.id] || []).length > 0 ? (<div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>{userRosterMap[u.id].slice(0, 2).map(m => <span key={m.nama} style={{ fontSize: 11, padding: '1px 6px', background: '#eef2ff', color: '#4338ca', borderRadius: 9999 }}>{m.nama}</span>)}{userRosterMap[u.id].length > 2 && <span style={{ fontSize: 10, color: '#9ca3af' }}>+{userRosterMap[u.id].length - 2}</span>}</div>) : <span className="text-gray-300">-</span>}</td><td className="px-4 py-3 text-sm text-gray-500 truncate">{u.email || '-'}</td><td className="px-4 py-3 text-sm text-gray-500">{u.nohp || '-'}</td><td className="px-4 py-3 text-center"><div className="flex justify-center items-center gap-1"><button type="button" onClick={() => viewGuruProfile(u.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Profil"><FaEye className="text-xs" /></button><button type="button" onClick={() => handleEditUser(u)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Edit"><FaEdit className="text-xs" /></button><button type="button" onClick={() => handleResetPassword(u)} className="px-2 py-1 text-yellow-600 hover:bg-yellow-50 rounded-lg text-[10px] font-medium">Reset</button>{!(user.role === 'petugas' && u.role === 'petugas') && (<button type="button" onClick={() => handleDeleteUser(u)} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-medium">Hapus</button>)}</div></td></tr>)) : (<tr><td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada data user.</td></tr>)}</tbody></table></div>
          <PaginationControls page={guruPage} setPage={setGuruPage} totalPages={totalPagesGuru} limit={guruLimit} setLimit={setGuruLimit} totalData={filteredGuruList.length} />
        </div>
      )}

      {/* LAPORAN */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4">Top 5 Kelas Paling Aktif</h3><div style={{ height: '250px' }}><Bar data={{ labels: chartData.kelas.labels, datasets: [{ label: 'Transaksi', data: chartData.kelas.data, backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4 }] }} options={hBarOpts} /></div></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4">Distribusi Kondisi Pengembalian</h3><div style={{ height: '250px' }}><Doughnut data={{ labels: chartData.kondisi.labels, datasets: [{ data: chartData.kondisi.data, backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'] }] }} options={chartOpts} /></div></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4">Frekuensi Praktik Guru</h3><div style={{ height: '300px' }}><Bar data={{ labels: chartData.guru.labels, datasets: [{ label: 'Jumlah Praktik', data: chartData.guru.data, backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4 }] }} options={chartOpts} /></div></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4">Mapel Paling Aktif</h3><div style={{ height: '250px' }}><Bar data={{ labels: chartData.mapel.labels, datasets: [{ label: 'Peminjaman', data: chartData.mapel.data, backgroundColor: '#F59E0B', borderRadius: 4 }] }} options={hBarOpts} /></div></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4">Alat Paling Sering Dipinjam</h3><div style={{ height: '250px' }}><Bar data={{ labels: chartData.alat.labels, datasets: [{ label: 'Total Pinjam', data: chartData.alat.data, backgroundColor: '#10B981', borderRadius: 4 }] }} options={hBarOpts} /></div></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-4">Aktivitas Per Hari</h3><div style={{ height: '250px' }}><Bar data={{ labels: chartData.hari.labels, datasets: [{ label: 'Transaksi', data: chartData.hari.data, backgroundColor: '#8B5CF6', borderRadius: 4 }] }} options={chartOpts} /></div></div>

          {/* LAPORAN DETAIL TRANSAKSI — +Tgl Kembali +Lihat Detail */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="text-md font-semibold text-gray-800">Laporan Detail Transaksi</h3></div>
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500 italic mb-3">Gunakan filter Rentang Tanggal untuk membatasi data.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="col-span-2 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400 text-xs" /></div><input type="text" value={searchLaporan} onChange={(e) => setSearchLaporan(e.target.value)} placeholder="Cari data..." className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" /></div>
                <select value={filterStatusLaporan} onChange={(e) => setFilterStatusLaporan(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="all">Semua Status</option><option value="pending">Pending</option><option value="disetujui">Disetujui</option><option value="kembali">Kembali</option><option value="ditolak">Ditolak</option></select>
                <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} max={endDate || todayStr} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="date" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} min={startDate} max={todayStr} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="mt-2 flex justify-between items-center"><p className="text-xs text-gray-500">Menampilkan {filteredLaporan.length} dari {peminjamans.length} data</p><button type="button" onClick={() => { setSearchLaporan(''); setFilterStatusLaporan('all'); setStartDate(''); setEndDate(''); }} className="text-xs text-blue-600 hover:underline">Reset Filter</button></div>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10"><tr>
                  <SortableTh label="Siswa" sortKey="siswa" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="No HP Guru" sortKey="nohp" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Alat" sortKey="alat" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Guru" sortKey="guru" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Mapel" sortKey="mapel" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Tgl Pinjam" sortKey="tglPinjam" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Tgl Kembali" sortKey="tglKembali" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Kondisi" sortKey="kondisi" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <SortableTh label="Status" sortKey="status" sort={laporanSort} onSort={handleLaporanSort} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase" />
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedLaporan.length > 0 ? sortedLaporan.map((p, i) => (
                    <tr key={p.id || i} className="hover:bg-gray-50 text-sm">
                      <td className="px-3 py-2"><HoverCard user={getUserById(p.userId)} onClick={() => p.userId && viewGuruProfile(p.userId)}><span className="text-gray-900">{p.user?.nama || '-'}</span></HoverCard></td>
                      <td className="px-3 py-2 text-gray-500">{guruIdToUser[p.guruId]?.nohp || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{p.alat?.nama || '-'}</td>
                      <td className="px-3 py-2"><HoverCard user={guruIdToUser[p.guruId]} onClick={() => guruIdToUser[p.guruId] && viewGuruProfile(guruIdToUser[p.guruId].id)}><span className="text-gray-600">{p.guru?.nama || '-'}</span></HoverCard></td>
                      <td className="px-3 py-2 text-gray-600">{Array.isArray(p.mapel) ? p.mapel.join(', ') : (p.mapel || '-')}</td>
                      <td className="px-3 py-2 text-gray-500">{new Date(p.tanggalPeminjaman).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-3 py-2 text-gray-500">{p.tanggalPengembalian ? new Date(p.tanggalPengembalian).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2">{p.kondisiPengembalian ? <KondisiBadge kondisi={p.kondisiPengembalian} /> : <span className="text-gray-300">-</span>}</td>
                      <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button type="button" onClick={() => handleViewDetail(p)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded mr-1" title="Lihat Detail"><FaEye className="text-xs" /></button>
                        <button type="button" onClick={() => handleOpenEditLaporan(p)} className="text-blue-600 hover:bg-blue-50 p-1 rounded mr-1" title="Edit"><FaEdit className="text-xs" /></button>
                        <button type="button" onClick={() => handleDeletePeminjaman(p.id)} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Hapus"><FaTrash className="text-xs" /></button>
                      </td>
                    </tr>
                  )) : (<tr><td colSpan="10" className="px-6 py-12 text-center text-sm text-gray-500"><FaExclamationTriangle className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p>Tidak ada data.</p></td></tr>)}
                </tbody>
              </table>
            </div>
            <PaginationControls page={laporanPage} setPage={setLaporanPage} totalPages={totalPagesLaporan} limit={laporanLimit} setLimit={setLaporanLimit} totalData={filteredLaporan.length} />
          </div>
        </div>
      )}

      {/* ===== MAPEL ===== */}
      {activeTab === 'mapel' && <PetugasMapelView user={user} addTrigger={mapelAddTrigger} userList={guruList} teachers={teachers}/>}

      {/* ===== MODALS ===== */}
      <Modal isOpen={alatModalOpen} onClose={handleCloseModal} title={selectedAlat ? 'Edit Alat' : 'Tambah Alat Baru'} size="xl"><AlatForm initialData={selectedAlat} onSubmit={selectedAlat ? handleEditAlat : handleCreateAlat} onCancel={handleCloseModal} loading={loading} /></Modal>
      <Modal isOpen={userModalOpen} onClose={handleCloseUserModal} title={selectedUser ? 'Edit User' : 'Tambah User Baru'} size="lg"><UserForm initialData={selectedUser} onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} onCancel={handleCloseUserModal} loading={loading} /></Modal>

      <Modal isOpen={alatDetailModalOpen} onClose={() => { setAlatDetailModalOpen(false); setIsZoomed(false); }} title="Detail Spesifikasi Alat" size="lg">
        {alatDetail && (<div className="space-y-6"><div className="relative w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center border border-gray-200" style={{ height: isZoomed ? 'auto' : '300px' }} onClick={() => setIsZoomed(!isZoomed)}>{alatDetail.gambar ? <img src={alatDetail.gambar} alt={alatDetail.nama} className={`w-full transition-transform duration-300 ${isZoomed ? 'object-contain max-h-[500px]' : 'object-cover h-full'}`} /> : <FaImage className="h-24 w-24 text-gray-300" />}<div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">{isZoomed ? 'Klik perkecil' : 'Klik perbesar'}</div></div><div><h2 className="text-2xl font-bold text-gray-900">{alatDetail.nama}</h2><div className="flex flex-wrap gap-2 mt-2">{alatDetail.kategori && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{alatDetail.kategori}</span>}{alatDetail.merek && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Merek: {alatDetail.merek}</span>}<span className={`px-3 py-1 rounded-full text-sm font-medium ${alatDetail.stok > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>Stok: {alatDetail.stok}</span></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-100"><h3 className="text-md font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">Spesifikasi & Deskripsi</h3><p className="text-sm text-gray-600 whitespace-pre-line">{alatDetail.deskripsi || 'Tidak ada deskripsi.'}</p></div></div>)}
      </Modal>

      {/* TRACKING MODAL */}
      <Modal isOpen={alatTrackingModalOpen} onClose={() => setAlatTrackingModalOpen(false)} title={null} size="xl">
        {alatTrackingData && (<div className="space-y-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center"><FaTools className="text-lg text-emerald-500" /></span><div><h2 className="text-lg font-bold text-gray-900">{alatTrackingData.alat?.nama}</h2><p className="text-xs text-gray-500">Tracking log seluruh peminjaman alat ini</p></div></div></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">{[{ label: 'Total', val: trackStats.total, color: 'bg-gray-50 text-gray-800 border-gray-200' }, { label: 'Menunggu', val: trackStats.pending, color: 'bg-amber-50 text-amber-700 border-amber-200' }, { label: 'Dipinjam', val: trackStats.disetujui, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { label: 'Selesai', val: trackStats.kembali, color: 'bg-blue-50 text-blue-700 border-blue-200' }, { label: 'Ditolak', val: trackStats.ditolak, color: 'bg-red-50 text-red-700 border-red-200' }, { label: 'Batal', val: trackStats.dibatalkan, color: 'bg-gray-50 text-gray-500 border-gray-200' }, { label: 'Total Pinjam', val: trackStats.totalPinjam, color: 'bg-teal-50 text-teal-700 border-teal-200' }].map((s, i) => (<div key={i} className={`rounded-lg p-2.5 border text-center ${s.color}`}><div className="text-lg font-bold leading-none">{s.val}</div><div className="text-[10px] mt-1 opacity-70">{s.label}</div></div>))}</div>
          {trackStats.kembali > 0 && (<div className="flex items-center gap-3 px-1"><span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">Kondisi:</span><div className="flex items-center gap-2"><span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-emerald-400" />Baik {trackStats.baik}</span><span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-amber-400" />Kurang {trackStats.kurang}</span><span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-red-400" />Rusak {trackStats.rusak}</span></div></div>)}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"><div className="relative md:col-span-2"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400 text-xs" /></div><input type="text" value={trackSearch} onChange={(e) => { setTrackSearch(e.target.value); setTrackPage(1); }} placeholder="Cari peminjam atau guru..." className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" /></div><select value={trackStatus} onChange={(e) => { setTrackStatus(e.target.value); setTrackPage(1); }} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"><option value="all">Semua Status</option><option value="pending">Menunggu</option><option value="disetujui">Dipinjam</option><option value="kembali">Selesai</option><option value="ditolak">Ditolak</option><option value="dibatalkan">Dibatalkan</option></select><button type="button" onClick={() => { setTrackSearch(''); setTrackStatus('all'); setTrackSort({ key: '', dir: 'asc' }); setTrackPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs text-gray-600 flex items-center justify-center gap-1"><FaTimesCircle className="text-[10px]" />Reset</button></div>
          <div className="text-xs text-gray-500 px-1">{trackFiltered.length} transaksi</div>
          <div className="border border-gray-200 rounded-xl overflow-hidden"><div className="overflow-x-auto max-h-[400px] overflow-y-auto"><table className="min-w-full divide-y divide-gray-100"><thead className="bg-gray-50 sticky top-0 z-10"><tr><SortableTh label="Peminjam" sortKey="peminjam" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /><SortableTh label="Kelas" sortKey="kelas" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /><SortableTh label="Guru" sortKey="guru" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /><SortableTh label="Jml" sortKey="jumlah" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase text-center" /><SortableTh label="Tgl Pinjam" sortKey="tanggal" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /><SortableTh label="Tgl Kembali" sortKey="tglKembali" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /><SortableTh label="Kondisi" sortKey="kondisi" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /><SortableTh label="Status" sortKey="status" sort={trackSort} onSort={handleTrackSort} className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase" /></tr></thead><tbody className="divide-y divide-gray-50">{trackPaginated.length > 0 ? trackPaginated.map((r, idx) => (<tr key={r.id || `track-${idx}`} className="hover:bg-emerald-50/30 transition-colors"><td className="px-3 py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">{r.user?.nama || '-'}</td><td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.user?.kelas || '-'}</td><td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.guru?.nama || '-'}</td><td className="px-3 py-2.5 text-xs text-gray-600 text-center">{r.jumlah || 1}</td><td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap"><span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-[9px] text-gray-400" />{fmt(r.tanggalPeminjaman || r.tanggal)}{fmtTime(r.tanggalPeminjaman || r.tanggal) && <span className="text-[10px] text-gray-400 ml-1">{fmtTime(r.tanggalPeminjaman || r.tanggal)}</span>}</span></td><td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{(r.tanggalPengembalian || r.tanggalKembali) ? (<span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-[9px] text-blue-400" />{fmt(r.tanggalPengembalian || r.tanggalKembali)}</span>) : <span className="text-gray-300 text-xs">-</span>}</td><td className="px-3 py-2.5 whitespace-nowrap">{r.status === 'kembali' && r.kondisiPengembalian ? <KondisiBadge kondisi={r.kondisiPengembalian} /> : <span className="text-gray-300 text-xs">-</span>}</td><td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={r.status} /></td></tr>)) : (<tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500"><FaSearch className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p>Tidak ada data untuk filter ini</p></td></tr>)}</tbody></table></div><PaginationControls page={trackPage} setPage={setTrackPage} totalPages={trackTotalPages} limit={trackLimit} setLimit={setTrackLimit} totalData={trackFiltered.length} /></div>
        </div>)}
      </Modal>

      {/* Profil User */}
      {/* <Modal isOpen={guruDetailModalOpen} onClose={() => setGuruDetailModalOpen(false)} title="Profil User" size="md">
        {guruDetail && (<div className="space-y-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><FaUserCircle className="text-3xl text-blue-500" /></div><div><h3 className="text-lg font-bold text-gray-900">{guruDetail.nama}</h3><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${guruDetail.role === 'guru' ? 'bg-blue-50 text-blue-700' : guruDetail.role === 'petugas' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>{guruDetail.role}</span></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><span className="text-gray-500 block mb-1">NISN / NIP</span><p className="font-medium text-gray-900">{guruDetail.role === 'guru' ? (guruDetail.nip || '-') : guruDetail.role === 'siswa' ? (guruDetail.nisn || '-') : '-'}</p></div>{guruDetail.role === 'siswa' && (<div><span className="text-gray-500 block mb-1">Kelas</span><p className="font-medium text-gray-900">{guruDetail.kelas || '-'}</p></div>)}<div><span className="text-gray-500 block mb-1">Email</span>{guruDetail.email ? (<a href={`mailto:${guruDetail.email}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1.5"><FaEnvelope className="text-xs" />{guruDetail.email}</a>) : <p className="font-medium text-gray-400">-</p>}</div><div><span className="text-gray-500 block mb-1">No HP (WhatsApp)</span>{guruDetail.nohp ? (<a href={`https://wa.me/62${guruDetail.nohp.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline flex items-center gap-1.5"><FaWhatsapp className="text-xs" />{guruDetail.nohp}</a>) : <p className="font-medium text-gray-400">-</p>}</div>{guruDetail.role === 'guru' && guruDetail.mapel && (<div className="sm:col-span-2"><span className="text-gray-500 block mb-2">Mapel</span><div className="flex flex-wrap gap-1.5">{(Array.isArray(guruDetail.mapel) ? guruDetail.mapel : [guruDetail.mapel]).filter(Boolean).map((m, i) => (<span key={i} className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">{m}</span>))}</div></div>)}</div></div>)}
      </Modal> */}

      {/* Edit Laporan */}
      <Modal isOpen={editLaporanModal.isOpen} onClose={() => setEditLaporanModal({ isOpen: false, data: null, jumlah: '', mapel: '', kondisiPengembalian: '' })} title="Edit Data Transaksi" size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label><input type="text" value={editLaporanModal.data?.user?.nama || '-'} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Alat</label><input type="text" value={editLaporanModal.data?.alat?.nama || '-'} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Jumlah <span className="text-red-500">*</span></label><input type="number" value={editLaporanModal.jumlah} onChange={(e) => setEditLaporanModal(p => ({ ...p, jumlah: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" min="1" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mapel</label><input type="text" value={editLaporanModal.mapel} onChange={(e) => setEditLaporanModal(p => ({ ...p, mapel: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan mapel" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Pengembalian</label><select value={editLaporanModal.kondisiPengembalian} onChange={(e) => setEditLaporanModal(p => ({ ...p, kondisiPengembalian: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"><option value="">-- Tidak diubah --</option><option value="baik">Baik</option><option value="kurang">Kurang</option><option value="rusak berat">Rusak Berat</option></select></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditLaporanModal({ isOpen: false, data: null, jumlah: '', mapel: '', kondisiPengembalian: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button type="button" onClick={handleSaveEditLaporan} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Simpan</button>
          </div>
        </div>
      </Modal>

      {/* Konfirmasi */}
      <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} title={confirmModal.title} size="sm">
        <div className="text-center"><div className="mb-4 flex justify-center">{confirmModal.icon}</div><p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">{confirmModal.cancelText}</button><button type="button" onClick={confirmModal.onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{confirmModal.confirmText}</button></div>
      </Modal>

      {/* Pengembalian + Crop */}
      <Modal isOpen={returnModal.isOpen} onClose={() => setReturnModal({ ...returnModal, isOpen: false })} title="Pengembalian Alat" size="sm">
        <div className="text-center mb-4"><FaQuestionCircle className="mx-auto h-10 w-10 text-blue-500 mb-2" /><p className="text-sm text-gray-500">Pastikan kondisi alat sudah diperiksa.</p></div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Alat <span className="text-red-500">*</span></label><select value={returnModal.condition} onChange={(e) => setReturnModal((prev) => ({ ...prev, condition: e.target.value, buktiGambar: e.target.value === 'baik' ? null : prev.buktiGambar }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"><option value="">-- Pilih --</option><option value="baik">Baik</option><option value="kurang">Kurang</option><option value="rusak berat">Rusak Berat</option></select></div>
        {(returnModal.condition === 'kurang' || returnModal.condition === 'rusak berat') && (<div className="mb-4">{cropModal.isOpen ? (<div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-xs font-medium text-red-800 mb-2">Potong gambar (Rasio 4:3)</p><div className="relative w-full h-56 bg-black rounded-lg overflow-hidden"><Cropper image={cropModal.imageSrc} crop={crop} zoom={zoom} aspect={4 / 3} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} /></div><div className="flex items-center gap-2 mt-2"><span className="text-xs text-gray-600">Zoom</span><input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" /></div><div className="flex justify-end gap-2 mt-3"><button type="button" onClick={handleCropCancel} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border rounded-lg">Batal</button><button type="button" onClick={handleCropConfirm} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg">Gunakan</button></div></div>) : (<div className="p-3 bg-red-50 border border-red-200 rounded-lg">{returnModal.buktiGambar ? (<><div className="relative inline-block w-full"><img src={returnModal.buktiGambar} alt="bukti" className="w-full h-40 object-cover rounded-lg" /><button type="button" onClick={() => setReturnModal((prev) => ({ ...prev, buktiGambar: null }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"><FaTimesCircle className="text-xs" /></button></div><p className="mt-1 text-xs text-green-700 font-medium">✓ Foto siap</p></>) : (<><label htmlFor="bukti" className="block text-xs font-medium text-red-800 mb-1"><FaExclamationTriangle className="inline mr-1" />Wajib Upload Bukti</label><input id="bukti" type="file" accept="image/*" onChange={handleBuktiChange} className="block w-full text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-white file:text-gray-700 border border-gray-300 rounded-md cursor-pointer" /><p className="mt-1 text-xs text-red-600">JPG/PNG. Crop otomatis.</p></>)}</div>)}</div>)}
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setReturnModal({ ...returnModal, isOpen: false })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button><button type="button" onClick={confirmReturn} disabled={!returnModal.condition || (['kurang', 'rusak berat'].includes(returnModal.condition) && !returnModal.buktiGambar)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">Simpan</button></div>
      </Modal>

      {/* Reset Password */}
      <Modal isOpen={resetPasswordModal.isOpen} onClose={() => setResetPasswordModal({ ...resetPasswordModal, isOpen: false })} title="Reset Password" size="sm">
        <div className="space-y-3"><p className="text-sm text-gray-600">Reset password untuk: <span className="font-semibold">{resetPasswordModal.user?.nama}</span></p><div><label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label><input type="password" name="newPassword" value={resetPasswordModal.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Min 8 karakter, huruf besar & angka/simbol" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi</label><input type="password" name="confirmPassword" value={resetPasswordModal.confirmPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setResetPasswordModal({ ...resetPasswordModal, isOpen: false })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button><button type="button" onClick={confirmResetPassword} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Reset</button></div></div>
      </Modal>

      {/* ===== DETAIL MODAL ===== */}
      {detailModal.isOpen && <DetailCard data={detailModal.data} onClose={() => setDetailModal({ isOpen: false, data: null })} />}
    </div>
  );
}