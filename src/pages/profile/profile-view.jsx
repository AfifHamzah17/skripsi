import React, { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { FaUser, FaEnvelope, FaWhatsapp, FaCamera, FaEdit, FaSave, FaTimes, FaTools, FaHistory, FaCheckCircle, FaSchool, FaBook, FaIdCard, FaShieldAlt } from 'react-icons/fa';
import MapelSelector from '../../components/MapelSelector';

const fmtPhone = p => { if (!p) return '-'; const d = p.replace(/\D/g, ''); return d.length < 10 ? p : d.slice(0, 4) + '-' + d.slice(4, 8) + '-' + d.slice(8); };
const waLink = p => 'https://wa.me/62' + (p || '').replace(/\D/g, '').replace(/^0/, '');
const rc = { guru: ['#eff6ff','#2563eb','#dbeafe'], petugas: ['#faf5ff','#7c3aed','#e9d5ff'], siswa: ['#eef2ff','#4338ca','#c7d2fe'], admin: ['#ecfdf5','#059669','#d1fae5'] };

const AdminBtn = () => {
  const [s, setS] = useState({ open: false, list: [], load: false, err: '' });
  const toggle = async () => {
    if (s.open) return setS(p => ({ ...p, open: false }));
    setS(p => ({ ...p, open: true, load: true, err: '' }));
    const t = localStorage.getItem('token'), h = { Authorization: 'Bearer ' + t }, base = import.meta.env.VITE_API_BASE;
    for (const ep of ['/users?role=petugas', '/users/petugas']) {
      try { const r = await fetch(base + ep, { headers: h }); if (!r.ok) continue; const d = await r.json(); const arr = Array.isArray(d) ? d : d?.result ? (Array.isArray(d.result) ? d.result : [d.result]) : []; const pt = arr.filter(u => u.role === 'petugas'); if (pt.length) return setS(p => ({ ...p, load: false, list: pt })); } catch { /* next */ }
    }
    setS(p => ({ ...p, load: false, err: 'Gagal memuat kontak admin' }));
  };
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.25)' }}><FaWhatsapp style={{ fontSize: 14 }} />Hubungi Admin</button>
      {s.open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', width: 280, zIndex: 50, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', fontSize: 12, fontWeight: 600, color: '#374151' }}>Kontak Petugas</div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {s.load ? <div style={{ padding: 20, textAlign: 'center' }}><div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#16a34a', animation: 'spin 0.6s linear infinite', margin: '0 auto' }} /></div>
              : s.err ? <p style={{ padding: '12px 14px', fontSize: 12, color: '#ef4444', margin: 0 }}>{s.err}</p>
              : s.list.map(c => (
                <a key={c.id} href={waLink(c.nohp)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', textDecoration: 'none', color: '#111827', borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaWhatsapp style={{ fontSize: 14, color: '#16a34a' }} /></span>
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{c.nama}</p><p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{c.nohp || '-'}</p></div>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

function Field({ label, icon: Icon, value, isEditing, onChange, type = 'text', disabled = false, href, children }) {
  const content = href && !isEditing ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} style={{ fontSize: 14, color: '#2563eb', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>{value || <span style={{ color: '#d1d5db', fontWeight: 400 }}>—</span>}</a>
  ) : (value || <span style={{ color: '#d1d5db', fontWeight: 400 }}>—</span>);
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f3f4f6', gap: 16 }}>
      <div style={{ width: 140, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Icon style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }} /><span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children || (isEditing && !disabled ? (
          <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#d1d5db'} placeholder={`Masukkan ${label.toLowerCase()}`} />
        ) : (
          <p style={{ fontSize: 14, color: '#111827', fontWeight: 500, margin: 0 }}>{content}</p>
        ))}
      </div>
    </div>
  );
}

export default function ProfileView({ user, loading, error, isOwnProfile, isEditing, onEditToggle, onSave, onCancel, editData, onEditChange, avatarUploading, onAvatarSelect, cropModal, onCropChange, onZoomChange, onCropComplete, onCropConfirm, onCropCancel, statistics }) {
  const fileRef = useRef(null);
  const c = rc[user?.role] || rc.siswa;
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}><div style={{ width: 48, height: 48, borderRadius: '50%', borderTop: '2px solid #3b82f6', borderBottom: '2px solid #3b82f6', animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}><div style={{ textAlign: 'center', background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', maxWidth: 360 }}><FaTimes style={{ margin: '0 auto 16px', fontSize: 48, color: '#fca5a5', display: 'block' }} /><p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p><button onClick={() => window.history.back()} style={{ marginTop: 16, padding: '10px 20px', background: '#f3f4f6', borderRadius: 8, fontSize: 13, color: '#4b5563', border: 'none', cursor: 'pointer' }}>Kembali</button></div></div>;
  if (!user) return null;
  const nohpVal = isEditing ? editData.nohp : fmtPhone(user.nohp);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header Card */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <div style={{ height: 144, background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}><svg width="100%" height="100%" viewBox="0 0 400 150"><circle cx="50" cy="30" r="80" fill="white" /><circle cx="350" cy="120" r="60" fill="white" /><circle cx="200" cy="-20" r="100" fill="white" /></svg></div>
          </div>
          <div style={{ padding: '0 24px 24px', marginTop: -56, position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
              {/* Avatar */}
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '4px solid #fff', cursor: isOwnProfile ? 'pointer' : 'default', width: 112, height: 112, flexShrink: 0 }} onClick={() => isOwnProfile && fileRef.current?.click()}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f3f4f6,#e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user.foto ? <img src={user.foto} alt={user.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUser style={{ fontSize: 40, color: '#d1d5db' }} />}</div>
                {isOwnProfile && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, opacity: avatarUploading ? 1 : 0, transition: 'opacity 0.2s' }} className="group-hover-parent">{avatarUploading ? <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} /> : <div style={{ textAlign: 'center', color: '#fff' }}><FaCamera style={{ fontSize: 18, display: 'block', marginBottom: 2 }} /><span style={{ fontSize: 9, fontWeight: 500 }}>Ubah Foto</span></div>}</div>}
                <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) onAvatarSelect(f); e.target.value = ''; }} style={{ display: 'none' }} disabled={!isOwnProfile || avatarUploading} />
              </div>
              {/* Nama + Role */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>{user.nama}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 9999, border: `1px solid ${c[2]}`, background: c[0], color: c[1], textTransform: 'uppercase', letterSpacing: '0.03em' }}>{user.role}</span>
                  {user.verified && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#3b82f6', fontWeight: 500 }}><FaShieldAlt />Terverifikasi</span>}
                </div>
              </div>
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                {user.role === 'guru' && !isEditing && <AdminBtn />}
                {isOwnProfile && (
                  <button onClick={isEditing ? onCancel : onEditToggle} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: isEditing ? '1px solid #d1d5db' : 'none', background: isEditing ? '#f9fafb' : '#2563eb', color: isEditing ? '#4b5563' : '#fff', boxShadow: isEditing ? 'none' : '0 2px 8px rgba(37,99,235,0.3)', transition: 'all 0.15s' }} onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = '#1d4ed8'; }} onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = '#2563eb'; }}>
                    {isEditing ? <><FaTimes style={{ fontSize: 12 }} />Batal</> : <><FaEdit style={{ fontSize: 12 }} />Edit Profil</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {statistics && (statistics.totalPinjam > 0 || statistics.dipinjam > 0 || statistics.selesai > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[{ l: 'Total Pinjam', v: statistics.totalPinjam || 0, i: FaTools, bg: '#ecfdf5', tc: '#059669', bc: '#d1fae5' }, { l: 'Sedang Dipinjam', v: statistics.dipinjam || 0, i: FaHistory, bg: '#eff6ff', tc: '#2563eb', bc: '#dbeafe' }, { l: 'Selesai', v: statistics.selesai || 0, i: FaCheckCircle, bg: '#eef2ff', tc: '#4338ca', bc: '#c7d2fe' }].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, border: `1px solid ${s.bc}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><s.i style={{ fontSize: 18, color: s.tc }} /></div>
                <div><div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.v}</div><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>{s.l}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: isEditing ? '2px solid #2563eb' : '1px solid #f3f4f6', overflow: 'hidden', transition: 'border 0.2s' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Informasi Pribadi</h2>
            {isEditing && <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, background: '#2563eb', padding: '4px 12px', borderRadius: 9999 }}>MODE EDIT</span>}
          </div>
          <div style={{ padding: '0 24px' }}>
            <Field label="Nama Lengkap" icon={FaUser} value={isEditing ? editData.nama : user.nama} isEditing={isEditing} onChange={v => onEditChange('nama', v)} />
            <Field label="Email" icon={FaEnvelope} value={isEditing ? editData.email : user.email} isEditing={isEditing} onChange={v => onEditChange('email', v)} type="email" href={!isEditing && user.email ? 'mailto:' + user.email : undefined} />
            <Field label="No. HP" icon={FaWhatsapp} value={nohpVal} isEditing={isEditing} onChange={v => onEditChange('nohp', v)} href={!isEditing && user.nohp ? waLink(user.nohp) : undefined} />
            {user.role === 'guru' && (<>
              <Field label="NIP" icon={FaIdCard} value={isEditing ? editData.nip : user.nip} isEditing={isEditing} onChange={v => onEditChange('nip', v)} />
              <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #f3f4f6', gap: 16 }}>
                <div style={{ width: 140, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}><FaBook style={{ fontSize: 12, color: '#9ca3af' }} /><span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Mapel</span></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? <MapelSelector selected={Array.isArray(editData.mapel) ? editData.mapel : editData.mapel ? [editData.mapel] : []} onChange={v => onEditChange('mapel', v)} />
                    : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(Array.isArray(user.mapel) ? user.mapel : user.mapel ? [user.mapel] : []).filter(Boolean).map((m, i) => <span key={i} style={{ padding: '5px 14px', fontSize: 13, fontWeight: 500, background: '#eef2ff', color: '#4338ca', borderRadius: 9999, border: '1px solid #c7d2fe' }}>{m}</span>)}{(Array.isArray(user.mapel) ? user.mapel : [user.mapel]).filter(Boolean).length === 0 && <span style={{ color: '#d1d5db', fontSize: 14 }}>—</span>}</div>}
                </div>
              </div>
            </>)}
            {user.role === 'siswa' && (<><Field label="NISN" icon={FaIdCard} value={isEditing ? editData.nisn : user.nisn} isEditing={isEditing} onChange={v => onEditChange('nisn', v)} disabled /><Field label="Kelas" icon={FaSchool} value={isEditing ? editData.kelas : user.kelas} isEditing={isEditing} onChange={v => onEditChange('kelas', v)} disabled /></>)}
            {user.role === 'petugas' && <Field label="NIP / ID" icon={FaIdCard} value={isEditing ? editData.nip : user.nip} isEditing={isEditing} onChange={v => onEditChange('nip', v)} />}
          </div>
          {/* Save Button */}
          {isEditing && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onSave} style={{ padding: '12px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'} onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                <FaSave style={{ fontSize: 13 }} />Simpan Perubahan
              </button>
            </div>
          )}
        </div>

        {!isOwnProfile && <button onClick={() => window.history.back()} style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#6b7280', fontWeight: 500, cursor: 'pointer' }}>← Kembali</button>}
      </div>

      {/* Crop Modal */}
      {cropModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onCropCancel} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.2)', width: '100%', maxWidth: 400, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Potong Foto</h3></div><button type="button" onClick={onCropCancel} style={{ padding: 6, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6b7280' }}><FaTimes style={{ fontSize: 12 }} /></button></div>
            <div style={{ position: 'relative', width: '100%', background: '#111', height: 320 }}><Cropper image={cropModal.imageSrc} crop={cropModal.crop} zoom={cropModal.zoom} aspect={1} onCropChange={onCropChange} onZoomChange={onZoomChange} onCropComplete={onCropComplete} cropShape="round" showGrid={false} /></div>
            <div style={{ padding: '12px 20px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, width: 36 }}>Zoom</span><input type="range" min={1} max={3} step={0.05} value={cropModal.zoom} onChange={e => onZoomChange(Number(e.target.value))} style={{ flex: 1, height: 6, accentColor: '#2563eb', cursor: 'pointer' }} /></div>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" onClick={onCropCancel} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#4b5563', background: '#f3f4f6', borderRadius: 10, cursor: 'pointer', border: 'none' }}>Batal</button><button type="button" onClick={onCropConfirm} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563eb', borderRadius: 10, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaCheckCircle style={{ fontSize: 12 }} />Gunakan</button></div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.group-hover-parent{opacity:0}.group-hover-parent:hover{opacity:1}`}</style>
    </div>
  );
}