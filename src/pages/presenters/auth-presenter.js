// src/pages/presenters/auth-presenter.js
import { loginUser, registerUser } from '../models/auth-model';

export const handleRegister = async (formData, onSuccess, onError) => {
  try {
    const { error, message } = await registerUser(formData);
    if (!error) {
      onSuccess(); // misal: redirect ke login
    } else {
      onError(message);
    }
  } catch (e) {
    console.error('Registration error:', e);
    onError('Terjadi kesalahan saat registrasi');
  }
};

export const handleLogin = async (formData, onSuccess, onError) => {
  try {
    const { error, message, result } = await loginUser(formData);
    console.log("Login response:", { error, message, result }); // Tambahkan logging
    
    if (!error && result?.token) {
      // Simpan token dan data user
      localStorage.setItem('token', result.token);
      
      // Simpan data user (result adalah data user, bukan result.user)
      localStorage.setItem('user', JSON.stringify(result));
      
      // Panggil onSuccess dengan data user
      onSuccess(result);
    } else {
      onError(message || 'Login gagal');
    }
  } catch (e) {
    console.error('Login error:', e);
    onError('Terjadi kesalahan saat login');
  }
};