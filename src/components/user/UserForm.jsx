// src/components/user/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaIdCard, FaEnvelope, FaPhone, FaUserFriends, FaChevronDown, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

const JURUSAN = [{ v: 'RPL', l: 'RPL' }, { v: 'TKJ', l: 'TKJ' }];
const TINGKAT = ['X', 'XI', 'XII'];
const NOMOR = ['1', '2', '3'];
const fmtPhone = v => { let d = v.replace(/\D/g, ''); if (!d.startsWith('0')) d = '0' + d; d = d.slice(0, 13); if (d.length <= 4) return d; if (d.length <= 8) return d.slice(0, 4) + '-' + d.slice(4); return d.slice(0, 4) + '-' + d.slice(4, 8) + '-' + d.slice(8); };
const parsePhone = v => v.replace(/\D/g, '');
const calcPw = pw => { if (!pw) return { level: 'none', label: '' }; let s = 0; if (pw.length >= 8) s++; if (pw.length >= 10) s++; if (/[a-z]/.test(pw)) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^a-zA-Z0-9]/.test(pw)) s++; if (s <= 2) return { level: 'weak', label: 'Lemah' }; if (s <= 4) return { level: 'medium', label: 'Sedang' }; return { level: 'strong', label: 'Kuat' }; };

const bI = { width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', backgroundColor: '#fff' };
const Label = ({ children, req }) => <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>{children}{req && <span style={{ color: '#ef4444' }}> *</span>}</label>;
const Err = ({ msg }) => msg ? <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{msg}</p> : null;
const Icon = ({ children }) => <span style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.875rem', pointerEvents: 'none' }}>{children}</span>;
const Wrap = ({ children }) => <div style={{ position: 'relative' }}>{children}</div>;
const Grp = ({ children }) => <div style={{ marginBottom: '0.75rem' }}>{children}</div>;
const EyeBtn = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} onMouseEnter={e => e.currentTarget.style.color = '#22c55e'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{show ? <FaEyeSlash /> : <FaEye />}</button>
);
const PwDot = ({ pw }) => { const { level, label } = calcPw(pw); if (!pw) return null; const dc = level === 'weak' ? 1 : level === 'medium' ? 3 : 5; const cc = level === 'weak' ? 'password-dot-weak' : level === 'medium' ? 'password-dot-medium' : 'password-dot-strong'; const lc = level === 'weak' ? '#ef4444' : level === 'medium' ? '#f97316' : '#22c55e'; return (<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}><div style={{ display: 'flex' }}>{[0,1,2,3,4].map(i => <span key={i} className={`password-dot ${i < dc ? cc + ' active' : 'password-dot-inactive'}`} />)}</div><span style={{ fontSize: '0.75rem', fontWeight: 500, color: lc }}>{label}</span></div>); };

export default function UserForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState({ nama: '', password: '', role: 'siswa', email: '', nohp: '', nisn: '', nip: '', posisi: '', tingkat: '', jurusan: '', nomor: '', kelas: '', mapel: [] });
  const [errors, setErrors] = useState({});
  const [showP, setShowP] = useState(false);
  const [focus, setFocus] = useState(null);
  const [mapelList, setMapelList] = useState([]);
  const [mapelLoad, setMapelLoad] = useState(false);

  useEffect(() => {
    const f = async () => { setMapelLoad(true); try { const r = await fetch(import.meta.env.VITE_API_BASE + '/mapel/public'); if (r.ok) { const d = await r.json(); const a = Array.isArray(d) ? d : d?.result ? (Array.isArray(d.result) ? d.result : []) : []; setMapelList(a.filter(Boolean)); } } catch {} setMapelLoad(false); };
    f();
  }, []);

  useEffect(() => {
    if (initialData) {
      const k = initialData.kelas || '';
      const parts = k.split(' ');
      setForm({ nama: initialData.nama || '', password: '', role: initialData.role || 'siswa', email: initialData.email || '', nohp: initialData.nohp ? fmtPhone(initialData.nohp) : '', nisn: initialData.nisn || '', nip: initialData.nip || '', posisi: initialData.posisi || '', tingkat: parts[0] || '', jurusan: parts[1] || '', nomor: parts[2] || '', kelas: k, mapel: Array.isArray(initialData.mapel) ? initialData.mapel : initialData.mapel ? [initialData.mapel] : [] });
    }
  }, [initialData]);

  useEffect(() => { const { tingkat, jurusan, nomor } = form; setForm(p => ({ ...p, kelas: (tingkat && jurusan && nomor) ? `${tingkat} ${jurusan} ${nomor}` : '' })); }, [form.tingkat, form.jurusan, form.nomor]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: null })); };
  const onMapel = v => { const c = Array.isArray(form.mapel) ? form.mapel : []; set('mapel', c.includes(v) ? c.filter(i => i !== v) : [...c, v]); };

  const iS = (fn, fc = '#22c55e') => ({ ...bI, ...(focus === fn ? { borderColor: fc, boxShadow: `0 0 0 3px ${fc}22` } : {}), ...(errors[fn] ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) });

  const validate = () => {
    const e = {};
    if (!form.nama.trim()) e.nama = 'Wajib diisi';
    if (!initialData && !form.password) e.password = 'Wajib diisi';
    if (!initialData && form.password && form.password.length < 8) e.password = 'Minimal 8 karakter';
    if (form.nohp) { const d = parsePhone(form.nohp); if (d.length < 11 || d.length > 13) e.nohp = 'No HP harus 11-13 digit'; }
    if (form.role === 'siswa' && !form.kelas) e.kelas = 'Wajib diisi untuk siswa';
    if (form.role === 'siswa' && !form.nisn) e.nisn = 'Wajib diisi untuk siswa';
    if (form.role === 'guru' && !form.nip) e.nip = 'Wajib diisi untuk guru';
    if (form.role === 'guru' && (!form.mapel || form.mapel.length === 0)) e.mapel = 'Pilih minimal satu mata pelajaran';
    if (form.role === 'petugas' && !form.posisi) e.posisi = 'Wajib diisi untuk petugas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = ev => {
    ev.preventDefault();
    if (!validate()) return;
    const data = { ...form, nohp: parsePhone(form.nohp) };
    delete data.tingkat; delete data.jurusan; delete data.nomor;
    if (form.role !== 'siswa') { delete data.kelas; delete data.nisn; }
    if (form.role !== 'guru') { delete data.nip; delete data.mapel; }
    if (form.role !== 'petugas') delete data.posisi;
    if (initialData && !data.password) delete data.password;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Grp>
        <Label req>Nama Lengkap</Label>
        <Wrap><Icon><FaUser /></Icon><input type="text" value={form.nama} onChange={e => set('nama', e.target.value)} onFocus={() => setFocus('nama')} onBlur={() => setFocus(null)} style={iS('nama')} placeholder="Nama lengkap" /></Wrap>
        <Err msg={errors.nama} />
      </Grp>

      {!initialData && (
        <Grp>
          <Label req>Password</Label>
          <Wrap><Icon><FaLock /></Icon><input type={showP ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)} style={{ ...iS('pw'), paddingRight: '2.25rem' }} placeholder="Min. 8 karakter, huruf besar & angka/simbol" /><EyeBtn show={showP} onToggle={() => setShowP(!showP)} /></Wrap>
          <PwDot pw={form.password} />
          <Err msg={errors.password} />
        </Grp>
      )}

      <Grp>
        <Label req>Role</Label>
        <Wrap><Icon><FaUserFriends /></Icon><select value={form.role} onChange={e => { set('role', e.target.value); setErrors(p => ({ ...p, kelas: null, nisn: null, nip: null, mapel: null, posisi: null })); }} onFocus={() => setFocus('role')} onBlur={() => setFocus(null)} style={{ ...iS('role'), appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}><option value="siswa">Siswa</option><option value="guru">Guru</option><option value="petugas">Petugas</option></select><FaChevronDown style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.75rem', pointerEvents: 'none' }} /></Wrap>
      </Grp>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        <Grp>
          <Label>Email</Label>
          <Wrap><Icon><FaEnvelope /></Icon><input type="email" value={form.email} onChange={e => set('email', e.target.value)} onFocus={() => setFocus('em')} onBlur={() => setFocus(null)} style={iS('em')} placeholder="contoh@email.com" /></Wrap>
        </Grp>
        <Grp>
          <Label>No. HP <span style={{ fontSize: '0.625rem', color: '#9ca3af', fontWeight: 400 }}>(format otomatis)</span></Label>
          <Wrap><Icon><FaPhone /></Icon><input type="text" value={form.nohp} onChange={e => set('nohp', fmtPhone(e.target.value))} onFocus={() => setFocus('hp')} onBlur={() => setFocus(null)} style={iS('hp')} placeholder="0812-3456-7890" inputMode="numeric" /></Wrap>
          <Err msg={errors.nohp} />
          {form.nohp && <p style={{ fontSize: '0.625rem', color: '#9ca3af', margin: '2px 0 0' }}>{parsePhone(form.nohp).length} digit</p>}
        </Grp>
      </div>

      {form.role === 'siswa' && (<>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>Kelas <span style={{ color: '#ef4444' }}> *</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Tingkat</label>
              <select value={form.tingkat} onChange={e => set('tingkat', e.target.value)} style={{ width: '100%', paddingLeft: '0.5rem', appearance: 'none', backgroundColor: '#fff', fontSize: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderWidth: '1px', borderStyle: 'solid', borderColor: errors.kelas ? '#ef4444' : '#d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', ...(errors.kelas ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}><option value="">-- Pilih --</option>{TINGKAT.map(t => <option key={t} value={t}>{t}</option>)}</select>
            </div>
            <div>
              <label style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Jurusan</label>
              <select value={form.jurusan} onChange={e => set('jurusan', e.target.value)} style={{ width: '100%', paddingLeft: '0.5rem', appearance: 'none', backgroundColor: '#fff', fontSize: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderWidth: '1px', borderStyle: 'solid', borderColor: errors.kelas ? '#ef4444' : '#d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', ...(errors.kelas ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}><option value="">-- Pilih --</option>{JURUSAN.map(j => <option key={j.v} value={j.v}>{j.l}</option>)}</select>
            </div>
            <div>
              <label style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Nomor</label>
              <select value={form.nomor} onChange={e => set('nomor', e.target.value)} style={{ width: '100%', paddingLeft: '0.5rem', appearance: 'none', backgroundColor: '#fff', fontSize: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderWidth: '1px', borderStyle: 'solid', borderColor: errors.kelas ? '#ef4444' : '#d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', ...(errors.kelas ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}><option value="">-- Pilih --</option>{NOMOR.map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
          </div>
          {form.kelas && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}><span>Kelas: </span><span style={{ fontWeight: 600, color: '#2563eb' }}>{form.kelas}</span></div>}
          <Err msg={errors.kelas} />
        </div>
        <Grp>
          <Label req>NISN</Label>
          <Wrap><Icon><FaIdCard /></Icon><input type="text" value={form.nisn} onChange={e => set('nisn', e.target.value)} maxLength={10} onFocus={() => setFocus('nisn')} onBlur={() => setFocus(null)} style={iS('nisn')} placeholder="10 digit NISN" /></Wrap>
          <Err msg={errors.nisn} />
        </Grp>
      </>)}

      {form.role === 'guru' && (<>
        <Grp>
          <Label req>NIP</Label>
          <Wrap><Icon><FaIdCard /></Icon><input type="text" value={form.nip} onChange={e => set('nip', e.target.value)} onFocus={() => setFocus('nip')} onBlur={() => setFocus(null)} style={iS('nip')} placeholder="Nomor Induk Pegawai" /></Wrap>
          <Err msg={errors.nip} />
        </Grp>
        <Grp>
          <Label req>Mata Pelajaran</Label>
          {mapelLoad ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.875rem' }}><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#22c55e', animation: 'spin 0.6s linear infinite', marginRight: 8 }} />Memuat mata pelajaran...</div>
          ) : mapelList.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>Tidak ada mata pelajaran tersedia</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', maxHeight: '10rem', overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.75rem' }} className="auth-scroll">
              {mapelList.map(m => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id={`am-${m}`} value={m} checked={Array.isArray(form.mapel) && form.mapel.includes(m)} onChange={e => onMapel(e.target.value)} className="mapel-checkbox" />
                  <label htmlFor={`am-${m}`} style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>{m}</label>
                </div>
              ))}
            </div>
          )}
          <Err msg={errors.mapel} />
        </Grp>
      </>)}

      {form.role === 'petugas' && (
        <Grp>
          <Label req>Posisi</Label>
          <Wrap><Icon><FaUserFriends /></Icon><input type="text" value={form.posisi} onChange={e => set('posisi', e.target.value)} onFocus={() => setFocus('pos')} onBlur={() => setFocus(null)} style={iS('pos')} placeholder="Contoh: Lab Komputer" /></Wrap>
          <Err msg={errors.posisi} />
        </Grp>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
        <button type="button" onClick={onCancel} disabled={loading} style={{ padding: '0.5rem 1.25rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#374151', background: '#fff', cursor: 'pointer' }}>Batal</button>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#fff', background: '#2563eb', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{loading && <FaSpinner className="animate-spin" />}{loading ? 'Menyimpan...' : initialData ? 'Update User' : 'Tambah User'}</button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  );
}