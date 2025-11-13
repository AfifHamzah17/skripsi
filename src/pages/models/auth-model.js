// src/pages/models/auth-model.js
const API_BASE = 'http://localhost:3000/api';

export const registerUser = async (formData) => {
  try {
    console.log("Sending registration request:", formData); // Tambahkan logging
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    console.log("Registration response status:", response.status); // Tambahkan logging
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Registration response data:", data); // Tambahkan logging
    return data;
  } catch (error) {
    console.error('Register error:', error);
    return { error: true, message: 'Gagal terhubung ke server' };
  }
};

export const loginUser = async ({ email, password }) => {
  try { 
    console.log("Sending login request for:", email); // Tambahkan logging
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log("Login response status:", response.status); // Tambahkan logging
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login error response:", errorText); // Tambahkan logging
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Login response data:", data); // Tambahkan logging
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { error: true, message: 'Gagal terhubung ke server' };
  }
};