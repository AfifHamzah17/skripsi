// src/pages/models/alat-model.js

// const API_BASE = 'http://localhost:3000/api';
const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app/api';

export const getAlat = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const createAlat = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateAlat = async (id, data) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE}/alat/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update alat');
    }
    
    return responseData;
  } catch (error) {
    console.error('Update alat error:', error);
    throw error;
  }
};

export const deleteAlat = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getAllAlat = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};