// src/components/user/UserForm.jsx
import React, { useState, useEffect } from 'react';
import MapelSelector from '../MapelSelector';

const fmtPhoneInput = (val) => {
  let d = val.replace(/\D/g, '');
  if (!d.startsWith('0')) d = '0' + d;
  d = d.slice(0, 13);
  if (d.length <= 4) return d;
  if (d.length <= 8) return d.slice(0, 4) + '-' + d.slice(4);
  return d.slice(0, 4) + '-' + d.slice(4, 8) + '-' + d.slice(8);
};

const parsePhone = (val) => val.replace(/\D/g, '');

export default function UserForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'siswa', email: '', nohp: '', nisn: '', nip: '', kelas: '', mapel: [] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        nama: initialData.nama || '', username: initialData.username || '', password: '',
        role: initialData.role || 'siswa', email: initialData.email || '',
        nohp: initialData.nohp ? fmtPhoneInput(initialData.nohp) : '',
        nisn: initialData.nisn || '', nip: initialData.nip || '',
        kelas: initialData.kelas || '',
        mapel: Array.isArray(initialData.mapel) ? initialData.mapel : initialData.mapel ? [initialData.mapel] : [],
      });
    }
  }, [initialData]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.nama.trim()) e.nama = 'Wajib diisi';
    if (!form.username.trim()) e.username = 'Wajib diisi';
    if (!initialData && !form.password) e.password = 'Wajib diisi';
    if (form.nohp) {
      const digits = parsePhone(form.nohp);
      if (digits.length < 11 || digits.length > 13) e.nohp = 'No HP harus 11-13 digit';
    }
    if (form.role === 'siswa' && !form.kelas) e.kelas = 'Wajib diisi siswa';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = { ...form, nohp: parsePhone(form.nohp) };
    if (initialData && !data.password) delete data.password;
    onSubmit(data);
  };

  const inputStyle = (field) => ({ width: '100%', padding: '8px 12px', border: `1px solid ${errors[field] ? '#ef4444' : '#d1d5db'}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' });
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 };
  const errStyle = { fontSize: 11, color: '#ef4444', margin: '2px 0 0' };

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
      <div><label style={labelStyle}>Nama <span style={{color:'#ef4444'}}>*</span></label><input type="text" value={form.nama} onChange={e => set('nama', e.target.value)} style={inputStyle('nama')} placeholder="Nama lengkap"/>{errors.nama && <p style={errStyle}>{errors.nama}</p>}</div>
      <div><label style={labelStyle}>Username <span style={{color:'#ef4444'}}>*</span></label><input type="text" value={form.username} onChange={e => set('username', e.target.value)} style={inputStyle('username')} placeholder="Username login"/>{errors.username && <p style={errStyle}>{errors.username}</p>}</div>
      {!initialData && <div><label style={labelStyle}>Password <span style={{color:'#ef4444'}}>*</span></label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle('password')} placeholder="Min 8 karakter, huruf besar & angka/simbol"/>{errors.password && <p style={errStyle}>{errors.password}</p>}</div>}
      <div><label style={labelStyle}>Role</label><select value={form.role} onChange={e => set('role', e.target.value)} style={{...inputStyle('role'),backgroundColor:'#fff'}}><option value="siswa">Siswa</option><option value="guru">Guru</option><option value="petugas">Petugas</option></select></div>
      <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle('email')} placeholder="email@contoh.com"/></div>
      <div>
        <label style={labelStyle}>No HP <span style={{fontSize:11,color:'#9ca3af',fontWeight:400}}>(format otomatis)</span></label>
        <input type="text" value={form.nohp} onChange={e => set('nohp', fmtPhoneInput(e.target.value))} style={inputStyle('nohp')} placeholder="0812-3456-7890" inputMode="numeric"/>
        {errors.nohp && <p style={errStyle}>{errors.nohp}</p>}
        {form.nohp && <p style={{fontSize:10,color:'#9ca3af',margin:'2px 0 0'}}>{parsePhone(form.nohp).length} digit</p>}
      </div>
      {form.role === 'siswa' && <div><label style={labelStyle}>NISN</label><input type="text" value={form.nisn} onChange={e => set('nisn', e.target.value)} style={inputStyle('nisn')} placeholder="NISN siswa"/></div>}
      {form.role === 'siswa' && <div><label style={labelStyle}>Kelas <span style={{color:'#ef4444'}}>*</span></label><input type="text" value={form.kelas} onChange={e => set('kelas', e.target.value)} style={inputStyle('kelas')} placeholder="Contoh: XII RPL 1"/>{errors.kelas && <p style={errStyle}>{errors.kelas}</p>}</div>}
      {form.role === 'guru' && <div><label style={labelStyle}>NIP</label><input type="text" value={form.nip} onChange={e => set('nip', e.target.value)} style={inputStyle('nip')} placeholder="NIP guru"/></div>}
      {form.role === 'guru' && <div><label style={labelStyle}>Mata Pelajaran</label><MapelSelector selected={form.mapel} onChange={m => set('mapel', m)}/></div>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:12,borderTop:'1px solid #f3f4f6'}}>
        <button type="button" onClick={onCancel} disabled={loading} style={{padding:'8px 20px',border:'1px solid #d1d5db',borderRadius:8,fontSize:13,color:'#374151',background:'#fff',cursor:'pointer'}}>Batal</button>
        <button type="submit" disabled={loading} style={{padding:'8px 20px',border:'none',borderRadius:8,fontSize:13,color:'#fff',background:'#2563eb',cursor:loading?'wait':'pointer',opacity:loading?0.6:1}}>{loading ? 'Menyimpan...' : initialData ? 'Update User' : 'Tambah User'}</button>
      </div>
    </form>
  );
}