import React, { useEffect, useState } from "react";
import { handleLogin, handleRegister, validateRegisterForm, prepareRegisterData, calculatePasswordStrength } from "./authPresenter";
import { checkBackendConnection } from "./authModel";
import { toast } from "sonner";
import { useAuth } from "../../Context/AuthContext";
import { FaBoxOpen, FaUserPlus, FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash, FaIdCard, FaEnvelope, FaPhone, FaUserFriends, FaChevronDown, FaExclamationCircle, FaSpinner, FaWhatsapp } from "react-icons/fa";
import "./auth.css";

const fmtPhone = v => { let d = v.replace(/\D/g, ''); if (!d.startsWith('0')) d = '0' + d; d = d.slice(0, 13); if (d.length <= 4) return d; if (d.length <= 8) return d.slice(0, 4) + '-' + d.slice(4); return d.slice(0, 4) + '-' + d.slice(4, 8) + '-' + d.slice(8); };
const parsePhone = v => v.replace(/\D/g, '');
const authH = () => { const t = localStorage.getItem('token'); return t ? { 'Authorization': 'Bearer ' + t } : {}; };
const JURUSAN = [{ v: 'RPL', l: 'RPL' }, { v: 'TKJ', l: 'TKJ' }];
const TINGKAT = ['X', 'XI', 'XII'];
const NOMOR = ['1', '2', '3'];
const waLink = p => 'https://wa.me/62' + (p || '').replace(/\D/g, '').replace(/^0/, '');

const PasswordStrengthIndicator = ({ password }) => {
  const { level, label } = calculatePasswordStrength(password);
  if (!password) return null;
  const dc = level === 'weak' ? 1 : level === 'medium' ? 3 : 5;
  const cc = level === 'weak' ? 'password-dot-weak' : level === 'medium' ? 'password-dot-medium' : 'password-dot-strong';
  const lc = level === 'weak' ? '#ef4444' : level === 'medium' ? '#f97316' : '#22c55e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <div style={{ display: 'flex' }}>{[0,1,2,3,4].map(i => <span key={i} className={`password-dot ${i < dc ? cc + ' active' : 'password-dot-inactive'}`} />)}</div>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: lc }}>{label}</span>
    </div>
  );
};

const AdminBtn = () => {
  const [s, setS] = useState({ open: false, list: [], load: false, err: '' });
  const toggle = async () => {
    if (s.open) return setS(p => ({ ...p, open: false }));
    setS(p => ({ ...p, open: true, load: true, err: '' }));
    const base = import.meta.env.VITE_API_BASE;
    const h = authH();
    for (const ep of [base + '/users/petugas', base + '/users?role=petugas']) {
      try {
        const r = await fetch(ep, { headers: h });
        if (!r.ok) continue;
        const d = await r.json();
        const arr = Array.isArray(d) ? d : d?.result ? (Array.isArray(d.result) ? d.result : [d.result]) : [];
        const pt = arr.filter(u => u.role === 'petugas');
        if (pt.length) return setS(p => ({ ...p, load: false, list: pt }));
      } catch { /* next */ }
    }
    setS(p => ({ ...p, load: false, err: 'Gagal memuat kontak admin' }));
  };
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.25)', whiteSpace: 'nowrap' }}><FaWhatsapp style={{ fontSize: 14 }} />Hubungi Admin</button>
      {s.open && (
        <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6, background: '#fff', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', width: 280, zIndex: 50, overflow: 'hidden' }}>
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

const bI = { width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderWidth: '1px', borderStyle: 'solid', borderColor: '#d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', backgroundColor: '#fff' };
const bLI = { ...bI, paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' };
const Label = ({ children, req }) => <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>{children}{req && <span style={{ color: '#ef4444' }}> *</span>}</label>;
const Err = ({ msg }) => msg ? <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{msg}</p> : null;
const Icon = ({ children }) => <span style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.875rem', pointerEvents: 'none' }}>{children}</span>;
const Wrap = ({ children }) => <div style={{ position: 'relative' }}>{children}</div>;
const Grp = ({ children }) => <div style={{ marginBottom: '0.75rem' }}>{children}</div>;
const EyeBtn = ({ show, onToggle, color = '#22c55e' }) => (
  <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} onMouseEnter={e => e.currentTarget.style.color = color} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{show ? <FaEyeSlash /> : <FaEye />}</button>
);

export default function AuthView() {
  const [isReg, setIsReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendSt, setBackendSt] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [regErr, setRegErr] = useState("");
  const [fErr, setFErr] = useState({});
  const [showLP, setShowLP] = useState(false);
  const [showRP, setShowRP] = useState(false);
  const [showCP, setShowCP] = useState(false);
  const [focus, setFocus] = useState(null);
  const [loginF, setLoginF] = useState({ email: "", password: "" });
  const [regF, setRegF] = useState({ nama: "", email: "", password: "", confirmPassword: "", nohp: "", role: "", tingkat: "", jurusan: "", nomor: "", kelas: "", nisn: "", nip: "", mapel: [], posisi: "" });
  const [mapelList, setMapelList] = useState([]);
  const [mapelLoad, setMapelLoad] = useState(false);
  const { login } = useAuth();

  useEffect(() => { checkBackendConnection().then(setBackendSt); }, []);
  useEffect(() => {
    const f = async () => {
      setMapelLoad(true);
      try {
        const r = await fetch(import.meta.env.VITE_API_BASE + '/mapel/public');
        if (r.ok) {
          const d = await r.json();
          const a = Array.isArray(d) ? d : d?.result ? (Array.isArray(d.result) ? d.result : []) : [];
          setMapelList(a.filter(Boolean));
        }
      } catch {}
      setMapelLoad(false);
    };
    f();
  }, []);
  useEffect(() => {
    const { tingkat, jurusan, nomor } = regF;
    setRegF(p => ({ ...p, kelas: (tingkat && jurusan && nomor) ? `${tingkat} ${jurusan} ${nomor}` : '' }));
  }, [regF.tingkat, regF.jurusan, regF.nomor]);

  const toggle = () => { setIsReg(!isReg); setLoginErr(""); setRegErr(""); setFErr({}); };
  const onLC = e => setLoginF(p => ({ ...p, [e.target.name]: e.target.value }));
  const onRC = e => {
    const { name, value } = e.target;
    if (name === 'mapel') { const c = Array.isArray(regF.mapel) ? regF.mapel : []; setRegF(p => ({ ...p, mapel: c.includes(value) ? c.filter(i => i !== value) : [...c, value] })); }
    else if (name === 'nohp') setRegF(p => ({ ...p, nohp: fmtPhone(value) }));
    else setRegF(p => ({ ...p, [name]: value }));
    if (fErr[name]) setFErr(p => ({ ...p, [name]: '' }));
  };

  const onLS = async e => {
    e.preventDefault(); setLoginErr("");
    if (!loginF.email || !loginF.password) { setLoginErr("Email dan password wajib diisi"); toast.error("Email dan password wajib diisi"); return; }
    setLoading(true);
    handleLogin(loginF,
      u => { setLoading(false); if (!u.token) { setLoginErr("Token tidak ditemukan"); toast.error("Token tidak ditemukan"); return; } toast.success("Login berhasil!"); login(u); window.location.hash = "#/home"; },
      m => { setLoading(false); setLoginErr(m); toast.error(m || "Login gagal!"); }
    );
  };

  const onRS = e => {
    e.preventDefault(); setRegErr(""); setFErr({});
    const parsed = { ...regF, nohp: parsePhone(regF.nohp) };
    const { isValid, errors } = validateRegisterForm(parsed);
    if (!isValid) { setFErr(errors); const f = Object.values(errors)[0]; setRegErr(f); toast.error(f); return; }
    setLoading(true);
    handleRegister(prepareRegisterData(parsed),
      m => { setLoading(false); toast.success(m); toggle(); setRegF({ nama: "", email: "", password: "", confirmPassword: "", nohp: "", role: "", tingkat: "", jurusan: "", nomor: "", kelas: "", nisn: "", nip: "", mapel: [], posisi: "" }); },
      m => { setLoading(false); setRegErr(m); toast.error(m || "Registrasi gagal!"); }
    );
  };

  const iS = (fn, fc = '#22c55e') => ({ ...bI, ...(focus === fn ? { borderColor: fc, boxShadow: `0 0 0 3px ${fc}22` } : {}), ...(fErr[fn] ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) });

  return (
    <section style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1rem' }}>
      <div style={{ position: 'fixed', top: '1rem', left: '1rem', fontSize: '0.75rem', color: '#9ca3af', zIndex: 100, background: 'rgba(255,255,255,0.9)', padding: '0.375rem 0.75rem', borderRadius: '0.375rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Backend: <span style={{ color: backendSt ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>{backendSt ? 'Connected' : 'Disconnected'}</span></div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '56rem', height: 'calc(100vh - 2rem)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', borderRadius: '1rem', overflow: 'hidden', background: '#fff' }} className="auth-main-box">

        {/* BLUE: Login Info */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', zIndex: 10, transition: 'transform 700ms, opacity 700ms', transform: isReg ? 'translateX(-100%)' : 'translateX(0)', opacity: isReg ? 0 : 1 }} className="auth-panel-desktop-only">
          <div style={{ width: '100%', height: '100%', background: '#2563eb', color: '#fff', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2.25rem', border: '1px solid rgba(255,255,255,0.3)' }}><FaBoxOpen /></div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.75rem', lineHeight: 1.2 }}>Sistem Peminjaman</h1>
            <p style={{ marginBottom: '2rem', fontSize: '0.875rem', lineHeight: 1.6, color: '#bfdbfe' }}>Transformasi digital peminjaman barang SMKN 1 Percut Sei Tuan: Lebih terstruktur, tanpa ribet, dan dapat diandalkan.</p>
            <button onClick={toggle} style={{ background: '#fff', color: '#2563eb', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', width: 'fit-content', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '0.875rem', transition: 'background 200ms' }} onMouseEnter={e => e.target.style.background = '#eff6ff'} onMouseLeave={e => e.target.style.background = '#fff'}>Buat Akun Baru</button>
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="auth-form-panel" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, background: '#fff', transition: 'transform 700ms', transform: isReg ? 'translateX(0)' : 'translateX(-100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isReg && (
            <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff', padding: '1.25rem 2rem 0.75rem', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
              <button onClick={toggle} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#2563eb'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}><FaArrowLeft /> Kembali</button>
            </div>
          )}
          <div className="auth-scroll" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ flex: 1 }} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '1rem 2rem 2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>Buat Akun Baru</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.25rem', fontSize: '0.875rem' }}>Lengkapi data di bawah ini untuk mendaftar</p>

              <form onSubmit={onRS}>
                <Grp>
                  <Label req>Nama Lengkap</Label>
                  <Wrap><Icon><FaUser /></Icon><input name="nama" type="text" placeholder="Nama lengkap" value={regF.nama} onChange={onRC} onFocus={() => setFocus('nama')} onBlur={() => setFocus(null)} style={iS('nama')} /></Wrap>
                  <Err msg={fErr.nama} />
                </Grp>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  <Grp>
                    <Label req>Email</Label>
                    <Wrap><Icon><FaEnvelope /></Icon><input name="email" type="email" placeholder="contoh@email.com" value={regF.email} onChange={onRC} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} style={iS('email')} /></Wrap>
                    <Err msg={fErr.email} />
                  </Grp>
                  <Grp>
                    <Label req>No. HP <span style={{ fontSize: '0.625rem', color: '#9ca3af', fontWeight: 400 }}>(format otomatis)</span></Label>
                    <Wrap><Icon><FaPhone /></Icon><input name="nohp" type="text" placeholder="0812-3456-7890" value={regF.nohp} onChange={onRC} onFocus={() => setFocus('nohp')} onBlur={() => setFocus(null)} inputMode="numeric" style={iS('nohp')} /></Wrap>
                    <Err msg={fErr.nohp} />
                    {regF.nohp && <p style={{ fontSize: '0.625rem', color: '#9ca3af', margin: '2px 0 0' }}>{parsePhone(regF.nohp).length} digit</p>}
                  </Grp>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  <Grp>
                    <Label req>Password</Label>
                    <Wrap><Icon><FaLock /></Icon><input name="password" type={showRP ? 'text' : 'password'} placeholder="Min. 8 karakter" value={regF.password} onChange={onRC} onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} style={{ ...iS('password'), paddingRight: '2.25rem' }} /><EyeBtn show={showRP} onToggle={() => setShowRP(!showRP)} /></Wrap>
                    <PasswordStrengthIndicator password={regF.password} />
                    <Err msg={fErr.password} />
                  </Grp>
                  <Grp>
                    <Label req>Konfirmasi Password</Label>
                    <Wrap><Icon><FaLock /></Icon><input name="confirmPassword" type={showCP ? 'text' : 'password'} placeholder="Ulangi password" value={regF.confirmPassword} onChange={onRC} onFocus={() => setFocus('confirmPassword')} onBlur={() => setFocus(null)} style={{ ...iS('confirmPassword'), paddingRight: '2.25rem' }} /><EyeBtn show={showCP} onToggle={() => setShowCP(!showCP)} /></Wrap>
                    <Err msg={fErr.confirmPassword} />
                  </Grp>
                </div>

                <Grp>
                  <Label req>Role</Label>
                  <Wrap><Icon><FaUserFriends /></Icon><select name="role" value={regF.role} onChange={onRC} onFocus={() => setFocus('role')} onBlur={() => setFocus(null)} style={{ ...iS('role'), appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}><option value="">-- Pilih role --</option><option value="siswa">Siswa</option><option value="guru">Guru</option></select><FaChevronDown style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.75rem', pointerEvents: 'none' }} /></Wrap>
                  <Err msg={fErr.role} />
                </Grp>

                {regF.role === "siswa" && (<>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>Kelas <span style={{ color: '#ef4444' }}> *</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Tingkat</label>
                        <select name="tingkat" value={regF.tingkat} onChange={onRC} style={{ width: '100%', paddingLeft: '0.5rem', appearance: 'none', backgroundColor: '#fff', fontSize: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderWidth: '1px', borderStyle: 'solid', borderColor: fErr.kelas ? '#ef4444' : '#d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', ...(fErr.kelas ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}>
                          <option value="">-- Pilih --</option>
                          {TINGKAT.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Jurusan</label>
                        <select name="jurusan" value={regF.jurusan} onChange={onRC} style={{ width: '100%', paddingLeft: '0.5rem', appearance: 'none', backgroundColor: '#fff', fontSize: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderWidth: '1px', borderStyle: 'solid', borderColor: fErr.kelas ? '#ef4444' : '#d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', ...(fErr.kelas ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}>
                          <option value="">-- Pilih --</option>
                          {JURUSAN.map(j => <option key={j.v} value={j.v}>{j.l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Nomor</label>
                        <select name="nomor" value={regF.nomor} onChange={onRC} style={{ width: '100%', paddingLeft: '0.5rem', appearance: 'none', backgroundColor: '#fff', fontSize: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', borderWidth: '1px', borderStyle: 'solid', borderColor: fErr.kelas ? '#ef4444' : '#d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 200ms, border-color 200ms', boxSizing: 'border-box', ...(fErr.kelas ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}>
                          <option value="">-- Pilih --</option>
                          {NOMOR.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    {regF.kelas && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}><span>Kelas: </span><span style={{ fontWeight: 600, color: '#2563eb' }}>{regF.kelas}</span></div>}
                    {fErr.kelas && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{fErr.kelas}</p>}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>NISN <span style={{ color: '#ef4444' }}> *</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.875rem', pointerEvents: 'none' }}><FaIdCard /></span>
                      <input name="nisn" type="text" placeholder="10 digit NISN" value={regF.nisn} onChange={onRC} maxLength={10} onFocus={() => setFocus('nisn')} onBlur={() => setFocus(null)} style={iS('nisn')} />
                    </div>
                    {fErr.nisn && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{fErr.nisn}</p>}
                  </div>
                </>)}

                {regF.role === "guru" && (<>
                  <Grp>
                    <Label req>NIP</Label>
                    <Wrap><Icon><FaIdCard /></Icon><input name="nip" type="text" placeholder="Nomor Induk Pegawai" value={regF.nip} onChange={onRC} onFocus={() => setFocus('nip')} onBlur={() => setFocus(null)} style={iS('nip')} /></Wrap>
                    <Err msg={fErr.nip} />
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
                            <input type="checkbox" id={`rm-${m}`} name="mapel" value={m} checked={Array.isArray(regF.mapel) && regF.mapel.includes(m)} onChange={onRC} className="mapel-checkbox" />
                            <label htmlFor={`rm-${m}`} style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>{m}</label>
                          </div>
                        ))}
                      </div>
                    )}
                    <Err msg={fErr.mapel} />
                  </Grp>
                </>)}

                {regErr && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }} className="animate-fade-in"><FaExclamationCircle style={{ color: '#ef4444', flexShrink: 0 }} /><span>{regErr}</span></div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, background: '#16a34a', color: '#fff', fontWeight: 600, padding: '0.625rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.5 : 1, fontSize: '0.875rem', transition: 'background 200ms' }} onMouseEnter={e => !loading && (e.target.style.background = '#15803d')} onMouseLeave={e => !loading && (e.target.style.background = '#16a34a')}>
                    {loading && <FaSpinner className="animate-spin" />}<span>{loading ? 'Mendaftar...' : 'Daftar Sekarang'}</span>
                  </button>
                  <AdminBtn />
                </div>
              </form>
            </div>
            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* LOGIN FORM */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', zIndex: 20, background: '#fff', transition: 'transform 700ms', transform: isReg ? 'translateX(100%)' : 'translateX(0)' }} className="auth-form-panel">
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }} className="auth-mobile-link"><button onClick={toggle} style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Belum punya akun? Daftar</button></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>Selamat Datang</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.25rem', fontSize: '0.875rem' }}>Silakan masukkan kredensial Anda</p>
            <form onSubmit={onLS} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Email</label>
                <Wrap><Icon><FaEnvelope /></Icon><input name="email" type="email" placeholder="Email" value={loginF.email} onChange={onLC} onFocus={() => setFocus('lE')} onBlur={() => setFocus(null)} style={{ ...bLI, ...(focus === 'lE' ? { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } : {}) }} /></Wrap>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Password</label>
                <Wrap><Icon><FaLock /></Icon><input name="password" type={showLP ? 'text' : 'password'} placeholder="Password" value={loginF.password} onChange={onLC} onFocus={() => setFocus('lP')} onBlur={() => setFocus(null)} style={{ ...bLI, ...(focus === 'lP' ? { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } : {}) }} /><EyeBtn show={showLP} onToggle={() => setShowLP(!showLP)} color="#2563eb" /></Wrap>
              </div>
              {loginErr && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="animate-fade-in"><FaExclamationCircle style={{ color: '#ef4444', flexShrink: 0 }} /><span>{loginErr}</span></div>}
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#fff', fontWeight: 600, padding: '0.625rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.5 : 1, fontSize: '0.875rem', transition: 'background 200ms' }} onMouseEnter={e => !loading && (e.target.style.background = '#1d4ed8')} onMouseLeave={e => !loading && (e.target.style.background = '#2563eb')}>
                {loading && <FaSpinner className="animate-spin" />}<span>{loading ? 'Memproses...' : 'Masuk'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* GREEN: Register Info */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 10, transition: 'transform 700ms, opacity 700ms', transform: isReg ? 'translateX(0)' : 'translateX(100%)', opacity: isReg ? 1 : 0 }} className="auth-panel-desktop-only">
          <div style={{ width: '100%', height: '100%', background: '#16a34a', color: '#fff', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2.25rem', border: '1px solid rgba(255,255,255,0.3)' }}><FaUserPlus /></div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.75rem', lineHeight: 1.2 }}>Bergabung Bersama Kami</h1>
            <p style={{ marginBottom: '2rem', fontSize: '0.875rem', lineHeight: 1.6, color: '#bbf7d0' }}>Daftarkan diri Anda untuk mulai memanfaatkan fasilitas peminjaman dengan efisien dan terlacak.</p>
            <button onClick={toggle} style={{ background: '#fff', color: '#16a34a', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', width: 'fit-content', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '0.875rem', transition: 'background 200ms' }} onMouseEnter={e => e.target.style.background = '#f0fdf4'} onMouseLeave={e => e.target.style.background = '#fff'}>Sudah Punya Akun?</button>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}