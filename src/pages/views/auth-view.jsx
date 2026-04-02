// src/pages/views/auth-view.jsx
import React, { useEffect, useState } from "react";
import { handleLogin, handleRegister } from "../presenters/auth-presenter";
import { toast } from "sonner";
import { useAuth } from "../../Context/AuthContext";
import { 
  FaBoxOpen, FaUserPlus, FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash, 
  FaIdCard, FaEnvelope, FaPhone, FaUserFriends, FaUserGraduate, 
  FaChevronDown, FaExclamationCircle, FaSpinner
} from "react-icons/fa";

export default function AuthView() {
  // ================= STATE MANAGEMENT =================
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(false);
  
  // Error State
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Password Visibility State
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nama: "",
    email: "",
    password: "",
    nohp: "",
    role: "",
    kelas: "",
    nip: "",
  });

  const { login } = useAuth();

  // ================= SIDE EFFECTS =================
  useEffect(() => {
    document.body.classList.add("bg-gradient-to-br", "from-slate-100", "to-slate-200");
    
    // Check Backend Connection (Simulasi)
    const checkBackend = async () => {
      try {
        // await axios.get('http://localhost:3000/'); 
        setBackendStatus(true); 
      } catch (e) {
        setBackendStatus(false);
      }
    };
    checkBackend();

    return () => {
      document.body.classList.remove("bg-gradient-to-br", "from-slate-100", "to-slate-200");
    };
  }, []);

  // ================= HANDLERS =================
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setLoginError("");
    setRegisterError("");
  };

  // --- Login Handlers ---
  const onLoginChange = (e) => {
    setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!loginForm.email || !loginForm.password) {
      setLoginError("Email dan password wajib diisi");
      toast.error("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    handleLogin(
      loginForm,
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

  // --- Register Handlers ---
  const onRegisterChange = (e) => {
    setRegisterForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError("");

    // Validasi dasar dari kode asli
    if (!registerForm.nama || !registerForm.email || !registerForm.password || !registerForm.nohp || !registerForm.role) {
      setRegisterError("Semua field wajib diisi");
      toast.error("Lengkapi semua field wajib!");
      return;
    }

    if (registerForm.role === "siswa" && !registerForm.kelas) {
      setRegisterError("Field 'kelas' wajib diisi untuk role siswa");
      toast.error("Field 'kelas' wajib diisi untuk siswa");
      return;
    }

    if (registerForm.role === "guru" && !registerForm.nip) {
      setRegisterError("Field 'nip' wajib diisi untuk role guru");
      toast.error("Field 'nip' wajib diisi untuk guru");
      return;
    }

    setLoading(true);
    handleRegister(
      registerForm,
      (msg) => {
        setLoading(false);
        toast.success(msg || "Registrasi berhasil!");
        toggleMode(); 
        // Reset form optional
        setRegisterForm({
          nama: "", email: "", password: "", nohp: "", role: "", kelas: "", nip: ""
        });
      },
      (errMsg) => {
        setLoading(false);
        setRegisterError(errMsg);
        toast.error(errMsg || "Registrasi gagal!");
      }
    );
  };

  // ================= RENDER =================
  return (
    <section className="fixed inset-0 bg-gradient-to-br from-slate-100 to-slate-200 z-50 flex items-center justify-center overflow-hidden p-4 md:p-0">
      
      <div className="relative w-full max-w-4xl h-[calc(100vh-2rem)] md:h-[680px] shadow-2xl rounded-2xl overflow-hidden bg-white">
        
        {/* ==================================================
        PANEL KIRI: Login Info (Blue) & Register Form (White)
        ================================================== */}
        
        {/* 1. Login Info (Background Blue) - Hanya tampil di Desktop */}
        <div 
          className={`hidden md:block absolute top-0 left-0 w-1/2 h-full z-10 transition-transform duration-700 ease-in-out ${
            isRegisterMode ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
          }`}
        >
          <div className="w-full h-full bg-blue-600 text-white p-10 flex flex-col justify-center">
            <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-4xl backdrop-blur-sm border border-white/30">
              <FaBoxOpen />
            </div>
            {/* Diubah: Konten EOQ -> Sistem Peminjaman */}
            <h1 className="text-3xl font-bold mb-3">Sistem Peminjaman</h1>
            <p className="text-blue-100 mb-8 text-sm">Transformasi digital peminjaman barang SMKN 1 Percut Sei Tuan: Lebih terstruktur, tanpa ribet, dan dapat diandalkan.</p>
            <button onClick={toggleMode} className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition w-fit shadow-lg">
              Buat Akun Baru
            </button>
          </div>
        </div>
        
        {/* 2. Register Form (Foreground White) */}
        <div 
          className={`absolute top-0 left-0 w-full md:w-1/2 h-full z-20 bg-white transition-transform duration-700 ease-in-out overflow-y-auto ${
            isRegisterMode ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'
          }`}
        >
          {/* Back Button */}
          {isRegisterMode && (
            <button onClick={toggleMode} className="absolute top-6 left-6 text-gray-400 hover:text-blue-600 transition z-30 flex items-center gap-2">
              <FaArrowLeft /> Kembali
            </button>
          )}

          <div className="w-full h-full flex flex-col justify-center p-8 md:p-10 pt-16 md:pt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Buat Akun Baru</h2>
            <p className="text-gray-500 mb-5 text-sm">Lengkapi data di bawah ini untuk mendaftar</p>

            <form onSubmit={onRegisterSubmit} className="space-y-3">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    name="nama"
                    type="text" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Nama lengkap" 
                    value={registerForm.nama}
                    onChange={onRegisterChange}
                    required 
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    name="email"
                    type="email" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Email" 
                    value={registerForm.email}
                    onChange={onRegisterChange}
                    required 
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    name="password"
                    type={showRegisterPassword ? 'text' : 'password'} 
                    className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Password" 
                    value={registerForm.password}
                    onChange={onRegisterChange}
                    required 
                  />
                  <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* No. HP */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">No. HP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    name="nohp"
                    type="text" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Nomor handphone" 
                    value={registerForm.nohp}
                    onChange={onRegisterChange}
                    required 
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserFriends className="text-gray-400 text-sm" />
                  </div>
                  <select 
                    name="role"
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none appearance-none bg-white" 
                    value={registerForm.role}
                    onChange={onRegisterChange}
                    required
                  >
                    <option value="">-- Pilih role --</option>
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaChevronDown className="text-gray-400 text-xs" />
                  </div>
                </div>
              </div>

              {/* Dynamic Fields based on Role */}
              {registerForm.role === "siswa" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUserGraduate className="text-gray-400 text-sm" />
                    </div>
                    <input 
                      name="kelas"
                      type="text" 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                      placeholder="Contoh: XI TKJ 2" 
                      value={registerForm.kelas}
                      onChange={onRegisterChange}
                      required 
                    />
                  </div>
                </div>
              )}

              {registerForm.role === "guru" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">NIP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="text-gray-400 text-sm" />
                    </div>
                    <input 
                      name="nip"
                      type="text" 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                      placeholder="Nomor Induk Pegawai" 
                      value={registerForm.nip}
                      onChange={onRegisterChange}
                      required 
                    />
                  </div>
                </div>
              )}

              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                  <FaExclamationCircle className="text-red-500" />
                  <span>{registerError}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                {loading && <FaSpinner className="animate-spin" />}
                <span>{loading ? 'Mendaftar...' : 'Daftar Sekarang'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ================================================== */}
        {/* PANEL KANAN: Login Form (White) & Register Info (Green) */}
        {/* ================================================== */}

        {/* Login Form */}
        <div 
          className={`absolute top-0 right-0 w-full md:w-1/2 h-full z-20 bg-white transition-transform duration-700 ease-in-out ${
            isRegisterMode ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="w-full h-full flex flex-col justify-center p-8 md:p-10">
            
            {/* Header Khusus Mobile (Tombol Daftar) */}
            <div className="md:hidden mb-6 text-center">
              <button onClick={toggleMode} className="text-blue-600 text-sm font-semibold hover:underline">
                Belum punya akun? Daftar
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang</h2>
            <p className="text-gray-500 mb-6 text-sm">Silakan masukkan kredensial Anda</p>

            <form onSubmit={onLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input 
                    name="email"
                    type="email" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Email" 
                    value={loginForm.email}
                    onChange={onLoginChange}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input 
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'} 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Password" 
                    value={loginForm.password}
                    onChange={onLoginChange}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowLoginPassword(!showLoginPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                  <FaExclamationCircle className="text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <FaSpinner className="animate-spin" />}
                <span>{loading ? 'Memproses...' : 'Masuk'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Register Info (Background Green) - Hanya tampil di Desktop */}
        <div 
          className={`hidden md:block absolute top-0 right-0 w-1/2 h-full z-10 transition-transform duration-700 ease-in-out ${
            isRegisterMode ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="w-full h-full bg-green-600 text-white p-10 flex flex-col justify-center">
            <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-4xl backdrop-blur-sm border border-white/30">
              <FaUserPlus />
            </div>
            {/* Diubah: Konten EOQ -> Sistem Peminjaman */}
            <h1 className="text-3xl font-bold mb-3">Bergabung Bersama Kami</h1>
            <p className="text-green-100 mb-8 text-sm">Daftarkan diri Anda untuk mulai memanfaatkan fasilitas peminjaman dengan efisien dan terlacah.</p>
            <button onClick={toggleMode} className="bg-white text-green-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition w-fit shadow-lg">
              Sudah Punya Akun?
            </button>
          </div>
        </div>

      </div>

      <div className="absolute bottom-4 text-xs text-gray-400">
        Backend Connection: 
        <span className={backendStatus ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
          {backendStatus ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </section>
  );
}