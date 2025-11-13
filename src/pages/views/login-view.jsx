// src/pages/views/login-view.jsx
import React, { useEffect, useState } from "react";
import { handleLogin } from "../presenters/auth-presenter";
import { toast } from "sonner";
import { useAuth } from "../../Context/AuthContext";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginView() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    document.body.classList.add("bg-gradient-to-br", "from-blue-50", "to-indigo-100", "min-h-screen");
    return () => {
      document.body.classList.remove("bg-gradient-to-br", "from-blue-50", "to-indigo-100", "min-h-screen");
    };
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      handleLogin(
        form,
        (userData) => {
          console.log("Login response:", userData);
          
          // Pastikan userData memiliki token
          if (!userData.token) {
            console.error("Token not found in response");
            setError("Token tidak ditemukan dalam response");
            toast.error("Token tidak ditemukan dalam response");
            setLoading(false);
            return;
          }
          
          toast.success("Login berhasil!");
          login(userData); // Simpan ke AuthContext dan localStorage
          window.location.hash = "#/home";
        },
        (errMsg) => {
          setError(errMsg);
          toast.error(errMsg || "Login gagal!");
        }
      );
    } catch (err) {
      setError("Terjadi kesalahan saat login");
      toast.error("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
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

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">Belum punya akun? </span>
            <a href="#/register" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}