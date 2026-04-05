// src/pages/auth/authModel.js
const API_BASE = import.meta.env.VITE_API_BASE;

export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE}`, { method: 'GET' });
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    return { error: true, message: error.message || 'Gagal terhubung ke server' };
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Login gagal';
      try { const errorData = JSON.parse(errorText); errorMessage = errorData.message || errorMessage; } catch (e) {}
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    return { error: true, message: error.message || 'Gagal terhubung ke server' };
  }
};

export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal mengambil data users');
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: true, message: error.message || 'Gagal mengambil data users' };
  }
};