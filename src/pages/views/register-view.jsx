// src/pages/views/register-view.jsx
import React, { useEffect, useState } from "react";
import { handleRegister } from "../presenters/auth-presenter";
import { toast } from "sonner";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserGraduate, FaIdCard, FaUserFriends } from "react-icons/fa";

export default function RegisterView() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    nohp: "",
    role: "",
    kelas: "",
    nip: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("bg-gradient-to-br", "from-blue-50", "to-indigo-100", "min-h-screen");
    return () => {
      document.body.classList.remove("bg-gradient-to-br", "from-blue-50", "to-indigo-100", "min-h-screen");
    };
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validasi dasar
    if (!form.nama || !form.email || !form.password || !form.nohp || !form.role) {
      setError("Semua field wajib diisi");
      toast.error("Lengkapi semua field wajib!");
      return;
    }

    if (form.role === "siswa" && !form.kelas) {
      setError("Field 'kelas' wajib diisi untuk role siswa");
      toast.error("Field 'kelas' wajib diisi untuk siswa");
      return;
    }

    if (form.role === "guru" && !form.nip) {
      setError("Field 'nip' wajib diisi untuk role guru");
      toast.error("Field 'nip' wajib diisi untuk guru");
      return;
    }

    // Submit form
    handleRegister(
      form,
      () => {
        toast.success("Registrasi berhasil!");
        window.location.hash = "#/login";
      },
      (errMsg) => {
        setError(errMsg);
        toast.error(errMsg || "Registrasi gagal!");
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Register</h1>
          <p className="mt-2 text-sm text-gray-600">
            Buat akun baru untuk mengakses sistem
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="nama"
                type="text"
                name="nama"
                placeholder="Nama lengkap"
                value={form.nama}
                onChange={onChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="nohp" className="block text-sm font-medium text-gray-700">
              No. HP
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                id="nohp"
                type="text"
                name="nohp"
                placeholder="Nomor handphone"
                value={form.nohp}
                onChange={onChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserFriends className="text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={onChange}
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none bg-white bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                <option value="">-- Pilih role --</option>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
              </select>
            </div>
          </div>

          {form.role === "siswa" && (
            <div>
              <label htmlFor="kelas" className="block text-sm font-medium text-gray-700">
                Kelas
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserGraduate className="text-gray-400" />
                </div>
                <input
                  id="kelas"
                  type="text"
                  name="kelas"
                  placeholder="Contoh: XI TKJ 2"
                  value={form.kelas}
                  onChange={onChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {form.role === "guru" && (
            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                NIP
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  id="nip"
                  type="text"
                  name="nip"
                  placeholder="Nomor Induk Pegawai"
                  value={form.nip}
                  onChange={onChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              Register
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">Sudah punya akun? </span>
            <a href="#/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}