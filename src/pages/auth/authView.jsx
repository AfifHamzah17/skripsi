// src/pages/auth/authView.jsx
import React, { useEffect, useState } from "react";
import {
  handleLogin, handleRegister, validateRegisterForm,
  prepareRegisterData, calculatePasswordStrength
} from "./authPresenter";
import { checkBackendConnection } from "./authModel";
import { toast } from "sonner";
import { useAuth } from "../../Context/AuthContext";
import {
  FaBoxOpen, FaUserPlus, FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash,
  FaIdCard, FaEnvelope, FaPhone, FaUserFriends,
  FaChevronDown, FaExclamationCircle, FaSpinner, FaClipboardList
} from "react-icons/fa";
import "./auth.css";

// ===================== CONSTANTS =====================
const MAPEL_OPTIONS = [
  'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Indonesia',
  'Bahasa Inggris', 'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi',
  'TIK', 'Penjaskes', 'Seni Budaya', 'PKn', 'Agama'
];

const JURUSAN_OPTIONS = [
  { value: 'RPL', label: 'RPL' },
  { value: 'TKJ', label: 'TKJ' }
];

const TINGKAT_OPTIONS = ['X', 'XI', 'XII'];
const NOMOR_OPTIONS = ['1', '2', '3'];

// ===================== PASSWORD STRENGTH COMPONENT =====================
const PasswordStrengthIndicator = ({ password }) => {
  const { level, label } = calculatePasswordStrength(password);
  if (!password) return null;

  const dotCount = level === 'weak' ? 1 : level === 'medium' ? 3 : 5;
  const dotClass = level === 'weak' ? 'password-dot-weak' : level === 'medium' ? 'password-dot-medium' : 'password-dot-strong';
  const labelColor = level === 'weak' ? '#ef4444' : level === 'medium' ? '#f97316' : '#22c55e';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <span
            key={i}
            className={`password-dot ${i < dotCount ? `${dotClass} active` : 'password-dot-inactive'}`}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: labelColor }}>
        {label}
      </span>
    </div>
  );
};

// ===================== BASE STYLES =====================
// Menggunakan pemisahan borderWidth, borderStyle, borderColor 
// untuk menghindari warning React "mixing shorthand and non-shorthand"
const baseInput = {
  width: '100%',
  paddingLeft: '2.25rem',
  paddingRight: '0.75rem',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'box-shadow 200ms, border-color 200ms',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff'
};

const baseLoginInput = {
  ...baseInput,
  paddingLeft: '2.5rem',
  paddingRight: '2.5rem',
  paddingTop: '0.625rem',
  paddingBottom: '0.625rem'
};

// ===================== ALL STYLES =====================
const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '1rem'
  },
  mainBox: {
    position: 'relative',
    width: '100%',
    maxWidth: '56rem',
    height: 'calc(100vh - 2rem)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    borderRadius: '1rem',
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  },
  bluePanel: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  greenPanel: {
    width: '100%',
    height: '100%',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  panelIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '5rem',
    height: '5rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    fontSize: '2.25rem',
    backdropFilter: 'blur(4px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  panelTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    lineHeight: '1.2'
  },
  panelDesc: {
    marginBottom: '2rem',
    fontSize: '0.875rem',
    lineHeight: '1.6'
  },
  panelButton: (color) => ({
    backgroundColor: '#ffffff',
    color: color,
    padding: '0.625rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    borderWidth: 0,
    cursor: 'pointer',
    transition: 'background-color 200ms',
    width: 'fit-content',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontSize: '0.875rem'
  }),
  
  // Register Form Layout
  stickyBackHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: '#ffffff',
    padding: '1.25rem 2rem 0.75rem 2rem',
    borderBottom: '1px solid #f3f4f6',
    flexShrink: 0
  },
  backButton: {
    color: '#9ca3af',
    background: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    transition: 'color 200ms',
    padding: 0
  },
  formScrollContainer: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  formContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 2rem 2rem 2rem'
  },
  
  // Login Form Layout
  loginFormContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2rem'
  },
  
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  formSubtitle: {
    color: '#6b7280',
    marginBottom: '1.25rem',
    fontSize: '0.875rem'
  },
  formGroup: {
    marginBottom: '0.75rem'
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '0.25rem'
  },
  inputWrapper: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    left: '0.75rem',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '0.875rem',
    pointerEvents: 'none'
  },
  input: baseInput,
  inputFocusGreen: {
    borderColor: '#22c55e',
    boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.15)'
  },
  inputError: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
  },
  inputFocusBlue: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'
  },
  selectIcon: {
    position: 'absolute',
    top: '50%',
    right: '0.75rem',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '0.75rem',
    pointerEvents: 'none'
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    background: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    transition: 'color 200ms',
    padding: '0.25rem'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#fecaca',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    marginTop: '0.5rem'
  },
  fieldError: {
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '0.25rem'
  },
  submitButton: (color, isLoading) => ({
    width: '100%',
    backgroundColor: color,
    color: '#ffffff',
    fontWeight: '600',
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
    borderRadius: '0.5rem',
    borderWidth: 0,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'background-color 200ms, opacity 200ms',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    opacity: isLoading ? 0.5 : 1,
    fontSize: '0.875rem'
  }),
  mobileLinkBtn: {
    color: '#2563eb',
    fontSize: '0.875rem',
    fontWeight: '600',
    background: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  statusBadge: {
    position: 'fixed',
    top: '1rem',
    left: '1rem',
    fontSize: '0.75rem',
    color: '#9ca3af',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  kelasGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem'
  },
  kelasPreview: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: '#4b5563'
  },
  kelasPreviewValue: {
    fontWeight: '600',
    color: '#2563eb'
  },
  mapelGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    maxHeight: '10rem',
    overflowY: 'auto',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: '0.5rem',
    padding: '0.75rem'
  },
  mapelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  mapelLabel: {
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none'
  },
  loginLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem'
  },
  loginInput: baseLoginInput,
  loginFormSpace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  smallSelect: {
    ...baseInput,
    paddingLeft: '0.5rem',
    appearance: 'none',
    backgroundColor: '#ffffff',
    fontSize: '0.75rem',
    paddingTop: '0.375rem',
    paddingBottom: '0.375rem'
  },
  smallLabel: {
    fontSize: '0.625rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
    display: 'block'
  }
};

// ===================== MAIN COMPONENT =====================
export default function AuthView() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(false);

  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nama: "", email: "", password: "", confirmPassword: "", nohp: "", role: "",
    tingkat: "", jurusan: "", nomor: "", kelas: "", nisn: "", nip: "", mapel: [], posisi: ""
  });

  const { login } = useAuth();

  useEffect(() => {
    const checkBackend = async () => {
      const isConnected = await checkBackendConnection();
      setBackendStatus(isConnected);
    };
    checkBackend();
  }, []);

  useEffect(() => {
    const { tingkat, jurusan, nomor } = registerForm;
    if (tingkat && jurusan && nomor) {
      setRegisterForm(prev => ({ ...prev, kelas: `${tingkat} ${jurusan} ${nomor}` }));
    } else {
      setRegisterForm(prev => ({ ...prev, kelas: '' }));
    }
  }, [registerForm.tingkat, registerForm.jurusan, registerForm.nomor]);

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setLoginError("");
    setRegisterError("");
    setFieldErrors({});
  };

  const onLoginChange = (e) => setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!loginForm.email || !loginForm.password) {
      setLoginError("Email dan password wajib diisi");
      toast.error("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    handleLogin(loginForm,
      (userData) => {
        setLoading(false);
        if (!userData.token) {
          setLoginError("Token tidak ditemukan dalam response");
          toast.error("Token tidak ditemukan dalam response");
          return;
        }
        toast.success("Login berhasil!");
        login(userData);
        window.location.hash = "#/home";
      },
      (errMsg) => {
        setLoading(false);
        setLoginError(errMsg);
        toast.error(errMsg || "Login gagal!");
      }
    );
  };

  const onRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mapel') {
      const currentMapel = Array.isArray(registerForm.mapel) ? registerForm.mapel : [];
      setRegisterForm(prev => ({
        ...prev,
        mapel: currentMapel.includes(value) ? currentMapel.filter(item => item !== value) : [...currentMapel, value]
      }));
    } else {
      setRegisterForm(prev => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const onRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError("");
    setFieldErrors({});
    const { isValid, errors } = validateRegisterForm(registerForm);
    if (!isValid) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setRegisterError(firstError);
      toast.error(firstError);
      return;
    }
    const submitData = prepareRegisterData(registerForm);
    setLoading(true);
    handleRegister(submitData,
      (msg) => {
        setLoading(false);
        toast.success(msg);
        toggleMode();
        setRegisterForm({
          nama: "", email: "", password: "", confirmPassword: "", nohp: "", role: "",
          tingkat: "", jurusan: "", nomor: "", kelas: "", nisn: "", nip: "", mapel: [], posisi: ""
        });
      },
      (errMsg) => {
        setLoading(false);
        setRegisterError(errMsg);
        toast.error(errMsg || "Registrasi gagal!");
      }
    );
  };

  const getInputStyle = (fieldName, focusStyle = styles.inputFocusGreen) => ({
    ...styles.input,
    ...(focusedField === fieldName ? focusStyle : {}),
    ...(fieldErrors[fieldName] ? styles.inputError : {})
  });

  const getSmallSelectStyle = (hasError) => ({
    ...styles.smallSelect,
    ...(hasError ? styles.inputError : {})
  });

  // ===================== RENDER =====================
  return (
    <section style={styles.container}>
      {/* Backend Status - Fixed Top Left */}
      <div style={styles.statusBadge}>
        Backend Connection:{' '}
        <span style={{ color: backendStatus ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
          {backendStatus ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div style={styles.mainBox} className="auth-main-box">

        {/* ===== PANEL KIRI: Login Info (Blue) ===== */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', zIndex: 10,
          transition: 'transform 700ms ease-in-out, opacity 700ms ease-in-out',
          transform: isRegisterMode ? 'translateX(-100%)' : 'translateX(0)',
          opacity: isRegisterMode ? 0 : 1
        }} className="auth-panel-desktop-only">
          <div style={styles.bluePanel}>
            <div style={styles.panelIcon}><FaBoxOpen /></div>
            <h1 style={styles.panelTitle}>Sistem Peminjaman</h1>
            <p style={{ ...styles.panelDesc, color: '#bfdbfe' }}>
              Transformasi digital peminjaman barang SMKN 1 Percut Sei Tuan:
              Lebih terstruktur, tanpa ribet, dan dapat diandalkan.
            </p>
            <button onClick={toggleMode} style={styles.panelButton('#2563eb')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}>
              Buat Akun Baru
            </button>
          </div>
        </div>

        {/* ===== PANEL KIRI: Register Form ===== */}
        <div className="auth-form-panel" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20,
          backgroundColor: '#ffffff', transition: 'transform 700ms ease-in-out',
          transform: isRegisterMode ? 'translateX(0)' : 'translateX(-100%)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Sticky Back Button */}
          {isRegisterMode && (
            <div style={styles.stickyBackHeader}>
              <button onClick={toggleMode} style={styles.backButton}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                <FaArrowLeft /> Kembali
              </button>
            </div>
          )}

          {/* Scrollable Form Content */}
          <div className="auth-scroll" style={styles.formScrollContainer}>
            <div style={{ flex: 1 }} />
            
            <div style={styles.formContent}>
              <h2 style={styles.formTitle}>Buat Akun Baru</h2>
              <p style={styles.formSubtitle}>Lengkapi data di bawah ini untuk mendaftar</p>

              <form onSubmit={onRegisterSubmit}>
                {/* Nama */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Lengkap <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FaUser style={styles.inputIcon} />
                    <input name="nama" type="text" placeholder="Nama lengkap" value={registerForm.nama} onChange={onRegisterChange}
                      onFocus={() => setFocusedField('nama')} onBlur={() => setFocusedField(null)} style={getInputStyle('nama')} />
                  </div>
                  {fieldErrors.nama && <p style={styles.fieldError}>{fieldErrors.nama}</p>}
                </div>

                {/* Email */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FaEnvelope style={styles.inputIcon} />
                    <input name="email" type="email" placeholder="contoh@email.com" value={registerForm.email} onChange={onRegisterChange}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} style={getInputStyle('email')} />
                  </div>
                  {fieldErrors.email && <p style={styles.fieldError}>{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input name="password" type={showRegisterPassword ? 'text' : 'password'} placeholder="Min. 8 karakter, huruf besar & angka/simbol"
                      value={registerForm.password} onChange={onRegisterChange}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      style={{ ...getInputStyle('password'), paddingRight: '2.25rem' }} />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} style={styles.togglePasswordBtn}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={registerForm.password} />
                  {fieldErrors.password && <p style={styles.fieldError}>{fieldErrors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Konfirmasi Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Ulangi password"
                      value={registerForm.confirmPassword} onChange={onRegisterChange}
                      onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                      style={{ ...getInputStyle('confirmPassword'), paddingRight: '2.25rem' }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.togglePasswordBtn}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p style={styles.fieldError}>{fieldErrors.confirmPassword}</p>}
                </div>

                {/* No. HP */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>No. HP <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FaPhone style={styles.inputIcon} />
                    <input name="nohp" type="tel" placeholder="08xxxxxxxxxx" value={registerForm.nohp} onChange={onRegisterChange}
                      onFocus={() => setFocusedField('nohp')} onBlur={() => setFocusedField(null)} style={getInputStyle('nohp')} />
                  </div>
                  {fieldErrors.nohp && <p style={styles.fieldError}>{fieldErrors.nohp}</p>}
                </div>

                {/* Role */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FaUserFriends style={styles.inputIcon} />
                    <select name="role" value={registerForm.role} onChange={onRegisterChange}
                      onFocus={() => setFocusedField('role')} onBlur={() => setFocusedField(null)}
                      style={{ ...getInputStyle('role'), appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}>
                      <option value="">-- Pilih role --</option>
                      <option value="siswa">Siswa</option>
                      <option value="guru">Guru</option>
                    </select>
                    <FaChevronDown style={styles.selectIcon} />
                  </div>
                  {fieldErrors.role && <p style={styles.fieldError}>{fieldErrors.role}</p>}
                </div>

                {/* ===== SISWA FIELDS ===== */}
                {registerForm.role === "siswa" && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Kelas <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={styles.kelasGrid}>
                        <div>
                          <label style={styles.smallLabel}>Tingkat</label>
                          <select name="tingkat" value={registerForm.tingkat} onChange={onRegisterChange} style={getSmallSelectStyle(fieldErrors.kelas)}>
                            <option value="">-- Pilih --</option>
                            {TINGKAT_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={styles.smallLabel}>Jurusan</label>
                          <select name="jurusan" value={registerForm.jurusan} onChange={onRegisterChange} style={getSmallSelectStyle(fieldErrors.kelas)}>
                            <option value="">-- Pilih --</option>
                            {JURUSAN_OPTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={styles.smallLabel}>Nomor</label>
                          <select name="nomor" value={registerForm.nomor} onChange={onRegisterChange} style={getSmallSelectStyle(fieldErrors.kelas)}>
                            <option value="">-- Pilih --</option>
                            {NOMOR_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      {registerForm.kelas && (
                        <div style={styles.kelasPreview}>
                          <span>Kelas: </span>
                          <span style={styles.kelasPreviewValue}>{registerForm.kelas}</span>
                        </div>
                      )}
                      {fieldErrors.kelas && <p style={styles.fieldError}>{fieldErrors.kelas}</p>}
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>NISN <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={styles.inputWrapper}>
                        <FaIdCard style={styles.inputIcon} />
                        <input name="nisn" type="text" placeholder="10 digit NISN" value={registerForm.nisn} onChange={onRegisterChange} maxLength={10}
                          onFocus={() => setFocusedField('nisn')} onBlur={() => setFocusedField(null)} style={getInputStyle('nisn')} />
                      </div>
                      {fieldErrors.nisn && <p style={styles.fieldError}>{fieldErrors.nisn}</p>}
                    </div>
                  </>
                )}

                {/* ===== GURU FIELDS ===== */}
                {registerForm.role === "guru" && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>NIP <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={styles.inputWrapper}>
                        <FaIdCard style={styles.inputIcon} />
                        <input name="nip" type="text" placeholder="Nomor Induk Pegawai" value={registerForm.nip} onChange={onRegisterChange}
                          onFocus={() => setFocusedField('nip')} onBlur={() => setFocusedField(null)} style={getInputStyle('nip')} />
                      </div>
                      {fieldErrors.nip && <p style={styles.fieldError}>{fieldErrors.nip}</p>}
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Mata Pelajaran <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={styles.mapelGrid} className="auth-scroll">
                        {MAPEL_OPTIONS.map(mapel => (
                          <div key={mapel} style={styles.mapelItem}>
                            <input type="checkbox" id={`reg-mapel-${mapel}`} name="mapel" value={mapel}
                              checked={Array.isArray(registerForm.mapel) && registerForm.mapel.includes(mapel)}
                              onChange={onRegisterChange} className="mapel-checkbox" />
                            <label htmlFor={`reg-mapel-${mapel}`} style={styles.mapelLabel}>{mapel}</label>
                          </div>
                        ))}
                      </div>
                      {fieldErrors.mapel && <p style={styles.fieldError}>{fieldErrors.mapel}</p>}
                    </div>
                  </>
                )}

                {registerError && (
                  <div style={styles.errorBox} className="animate-fade-in">
                    <FaExclamationCircle style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span>{registerError}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} style={styles.submitButton('#16a34a', loading)}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#16a34a')}>
                  {loading && <FaSpinner className="animate-spin" />}
                  <span>{loading ? 'Mendaftar...' : 'Daftar Sekarang'}</span>
                </button>
              </form>
            </div>

            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* ===== PANEL KANAN: Login Form ===== */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', zIndex: 20,
          backgroundColor: '#ffffff', transition: 'transform 700ms ease-in-out',
          transform: isRegisterMode ? 'translateX(100%)' : 'translateX(0)'
        }} className="auth-form-panel">
          <div style={styles.loginFormContent}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }} className="auth-mobile-link">
              <button onClick={toggleMode} style={styles.mobileLinkBtn}>Belum punya akun? Daftar</button>
            </div>

            <h2 style={styles.formTitle}>Selamat Datang</h2>
            <p style={styles.formSubtitle}>Silakan masukkan kredensial Anda</p>

            <form onSubmit={onLoginSubmit} style={styles.loginFormSpace}>
              <div>
                <label style={styles.loginLabel}>Email</label>
                <div style={styles.inputWrapper}>
                  <FaEnvelope style={{ ...styles.inputIcon, fontSize: '0.875rem' }} />
                  <input name="email" type="email" placeholder="Email" value={loginForm.email} onChange={onLoginChange}
                    onFocus={() => setFocusedField('loginEmail')} onBlur={() => setFocusedField(null)}
                    style={{ ...styles.loginInput, ...(focusedField === 'loginEmail' ? styles.inputFocusBlue : {}) }} />
                </div>
              </div>

              <div>
                <label style={styles.loginLabel}>Password</label>
                <div style={styles.inputWrapper}>
                  <FaLock style={{ ...styles.inputIcon, fontSize: '0.875rem' }} />
                  <input name="password" type={showLoginPassword ? 'text' : 'password'} placeholder="Password" value={loginForm.password} onChange={onLoginChange}
                    onFocus={() => setFocusedField('loginPassword')} onBlur={() => setFocusedField(null)}
                    style={{ ...styles.loginInput, ...(focusedField === 'loginPassword' ? styles.inputFocusBlue : {}) }} />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={styles.togglePasswordBtn}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={styles.errorBox} className="animate-fade-in">
                  <FaExclamationCircle style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <button type="submit" disabled={loading} style={styles.submitButton('#2563eb', loading)}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}>
                {loading && <FaSpinner className="animate-spin" />}
                <span>{loading ? 'Memproses...' : 'Masuk'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ===== PANEL KANAN: Register Info (Green) ===== */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 10,
          transition: 'transform 700ms ease-in-out, opacity 700ms ease-in-out',
          transform: isRegisterMode ? 'translateX(0)' : 'translateX(100%)',
          opacity: isRegisterMode ? 1 : 0
        }} className="auth-panel-desktop-only">
          <div style={styles.greenPanel}>
            <div style={styles.panelIcon}><FaUserPlus /></div>
            <h1 style={styles.panelTitle}>Bergabung Bersama Kami</h1>
            <p style={{ ...styles.panelDesc, color: '#bbf7d0' }}>
              Daftarkan diri Anda untuk mulai memanfaatkan fasilitas peminjaman dengan efisien dan terlacak.
            </p>
            <button onClick={toggleMode} style={styles.panelButton('#16a34a')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}>
              Sudah Punya Akun?
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}