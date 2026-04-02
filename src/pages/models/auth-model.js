// src/pages/models/auth-model.js
// const API_BASE = 'http://localhost:3000/api';
// const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app/api';
const API_BASE = import.meta.env.VITE_API_BASE;

export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil data users');
    }
    
    // Debug: Log response
    //console.log('Users from API:', data.users);
    if (data.users) {
      const guruUsers = data.users.filter(user => user.role === 'guru');
      //console.log('Guru users count:', guruUsers.length);
      guruUsers.forEach(guru => {
        //console.log(`Guru ${guru.nama} mapel:`, guru.mapel);
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: true, message: error.message || 'Gagal mengambil data users' };
  }
};

export const registerUser = async (formData) => {
  try {
    //console.log("Sending registration request:", formData);
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    //console.log("Registration response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    //console.log("Registration response data:", data);
    return data;
  } catch (error) {
    console.error('Register error:', error);
    return { error: true, message: 'Gagal terhubung ke server' };
  }
};

export const loginUser = async ({ email, password }) => {
  try { 
    //console.log("Sending login request for:", email);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    //console.log("Login response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    //console.log("Login response data:", data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { error: true, message: 'Gagal terhubung ke server' };
  }
};