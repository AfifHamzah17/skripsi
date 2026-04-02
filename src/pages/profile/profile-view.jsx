import React, { useRef } from 'react';
import Cropper from 'react-easy-crop';
import {
  FaUser, FaEnvelope, FaWhatsapp, FaCamera, FaEdit, FaSave, FaTimes,
  FaTools, FaHistory, FaCheckCircle, FaSchool, FaBook, FaIdCard, FaShieldAlt,
} from 'react-icons/fa';

const roleColors = {
  guru: 'bg-blue-50 text-blue-700 border-blue-200',
  petugas: 'bg-purple-50 text-purple-700 border-purple-200',
  siswa: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  admin: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ═══ INLINE FIELD: label kiri ± input kanan, memanjang ═══
function InlineField({ label, icon: Icon, value, isEditing, onChange, type = 'text', disabled = false }) {
  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0 gap-4">
      <div className="w-36 sm:w-40 flex-shrink-0 flex items-center gap-2">
        <Icon className="text-[11px] text-gray-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        {isEditing && !disabled ? (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            placeholder={`Masukkan ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-sm text-gray-900 font-medium truncate">{value || <span className="text-gray-300 font-normal">—</span>}</p>
        )}
      </div>
    </div>
  );
}

export default function ProfileView({
  user, loading, error, isOwnProfile,
  isEditing, onEditToggle, onSave, onCancel,
  editData, onEditChange,
  avatarUploading, onAvatarSelect,
  cropModal, onCropChange, onZoomChange, onCropComplete, onCropConfirm, onCropCancel,
  statistics,
}) {
  const fileRef = useRef(null);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
        <FaTimes className="mx-auto h-12 w-12 text-red-300 mb-4" />
        <p className="text-red-600 text-sm">{error}</p>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200">Kembali</button>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">

        {/* ═══ HERO CARD ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-36 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 150"><circle cx="50" cy="30" r="80" fill="white" /><circle cx="350" cy="120" r="60" fill="white" /><circle cx="200" cy="-20" r="100" fill="white" /></svg>
            </div>
          </div>

          <div className="px-6 pb-6 -mt-14 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div
                className={`relative rounded-2xl overflow-hidden shadow-xl border-4 border-white ${isOwnProfile ? 'group cursor-pointer' : ''}`}
                onClick={() => isOwnProfile && fileRef.current?.click()}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200">
                  {user.foto ? (
                    <img src={user.foto} alt={user.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUser className="text-4xl text-gray-300" />
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl transition-opacity ${avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {avatarUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <div className="text-center text-white">
                        <FaCamera className="mx-auto text-lg mb-0.5" />
                        <span className="text-[9px] font-medium">Ubah Foto</span>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAvatarSelect(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                  disabled={!isOwnProfile || avatarUploading}
                />
              </div>

              <div className="flex-1 pt-1 sm:pb-1">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{user.nama}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-3 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wide ${roleColors[user.role] || roleColors.siswa}`}>
                    {user.role}
                  </span>
                  {user.verified && <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium"><FaShieldAlt />Terverifikasi</span>}
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={isEditing ? onCancel : onEditToggle}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${
                    isEditing
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-md'
                  }`}
                >
                  {isEditing ? <><FaTimes className="text-xs" />Batal</> : <><FaEdit className="text-xs" />Edit Profil</>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ STATS ═══ */}
        {statistics && (statistics.totalPinjam > 0 || statistics.dipinjam > 0 || statistics.selesai > 0) && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Pinjam', val: statistics.totalPinjam || 0, icon: FaTools, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
              { label: 'Sedang Dipinjam', val: statistics.dipinjam || 0, icon: FaHistory, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
              { label: 'Selesai', val: statistics.selesai || 0, icon: FaCheckCircle, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-xl p-4 border ${s.border} shadow-sm flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`text-lg ${s.text}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 leading-none">{s.val}</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ INFO SECTION — INLINE LAYOUT ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Informasi Pribadi</h2>
            {isEditing && <span className="text-[10px] text-blue-500 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">MODE EDIT</span>}
          </div>
          <div className="px-6 divide-y divide-gray-100">

            {/* ── Baris umum ── */}
            <InlineField label="Nama Lengkap" icon={FaUser} value={isEditing ? editData.nama : user.nama} isEditing={isEditing} onChange={(v) => onEditChange('nama', v)} />
            <InlineField label="Email" icon={FaEnvelope} value={isEditing ? editData.email : user.email} isEditing={isEditing} onChange={(v) => onEditChange('email', v)} type="email" />
            <InlineField label="No. HP" icon={FaWhatsapp} value={isEditing ? editData.nohp : user.nohp} isEditing={isEditing} onChange={(v) => onEditChange('nohp', v)} />

            {/* ── Guru ── */}
            {user.role === 'guru' && (
              <>
                <InlineField label="NIP" icon={FaIdCard} value={isEditing ? editData.nip : user.nip} isEditing={isEditing} onChange={(v) => onEditChange('nip', v)} />
                {user.mapel && (
                  <div className="flex items-center py-3 border-b border-gray-100 gap-4">
                    <div className="w-36 sm:w-40 flex-shrink-0 flex items-center gap-2">
                      <FaBook className="text-[11px] text-gray-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mapel</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.mapel}
                          onChange={(e) => onEditChange('mapel', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Pisahkan dengan koma"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(user.mapel) ? user.mapel : [user.mapel]).filter(Boolean).map((m, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Siswa ── */}
            {user.role === 'siswa' && (
              <>
                <InlineField label="NISN" icon={FaIdCard} value={isEditing ? editData.nisn : user.nisn} isEditing={isEditing} onChange={(v) => onEditChange('nisn', v)} disabled />
                <InlineField label="Kelas" icon={FaSchool} value={isEditing ? editData.kelas : user.kelas} isEditing={isEditing} onChange={(v) => onEditChange('kelas', v)} disabled />
              </>
            )}

            {/* ── Petugas ── */}
            {user.role === 'petugas' && (
              <InlineField label="NIP / ID" icon={FaIdCard} value={isEditing ? editData.nip : user.nip} isEditing={isEditing} onChange={(v) => onEditChange('nip', v)} />
            )}
          </div>

          {isEditing && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={onSave}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm shadow-blue-200 transition-all"
              >
                <FaSave className="text-xs" />Simpan Perubahan
              </button>
            </div>
          )}
        </div>

        {/* ═══ BACK ═══ */}
        {!isOwnProfile && (
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
        )}
      </div>

      {/* ═══ MODAL CROP ═══ */}
      {cropModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCropCancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Potong Foto Profil</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Rasio 1:1 — hasilnya akan bulat sempurna</p>
              </div>
              <button type="button" onClick={onCropCancel} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FaTimes className="text-sm" />
              </button>
            </div>
            <div className="relative w-full bg-gray-900" style={{ height: 320 }}>
              <Cropper
                image={cropModal.imageSrc}
                crop={cropModal.crop}
                zoom={cropModal.zoom}
                aspect={1}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
                style={{ containerStyle: { borderRadius: 0 } }}
              />
            </div>
            <div className="px-5 py-3 bg-gray-50 border-y border-gray-100 flex items-center gap-3">
              <span className="text-[11px] text-gray-400 font-medium w-10">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={cropModal.zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[11px] text-gray-400 font-mono w-8 text-right">{cropModal.zoom.toFixed(1)}x</span>
            </div>
            <div className="px-5 py-4 flex justify-end gap-2">
              <button type="button" onClick={onCropCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button type="button" onClick={onCropConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all">
                <FaCheckCircle className="inline mr-1.5 text-xs" />Gunakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}