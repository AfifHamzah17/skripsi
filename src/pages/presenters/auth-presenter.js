// src/presenters/authPresenter.js

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
    onError('Terjadi kesalahan saat registrasi');
  }
};

export const handleLogin = async (formData, onSuccess, onError) => {
  try {
    const { error, message, result } = await loginUser(formData);
    if (!error && result?.token) {
      localStorage.setItem('token', result.token);
      onSuccess(); // misal: redirect ke home
    } else {
      onError(message || 'Login gagal');
    }
  } catch (e) {
    onError('Terjadi kesalahan saat login');
  }
};