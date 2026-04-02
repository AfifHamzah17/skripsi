// src/pages/models/teacher-model.js
// const API_BASE = 'http://localhost:3000/api';
// const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app/api';
const API_BASE = import.meta.env.VITE_API_BASE;

// Helper function untuk membuat request dengan error handling
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // Merge options
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, finalOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText.substring(0, 200));
      return { 
        error: true, 
        message: 'Server returned non-JSON response',
        details: responseText.substring(0, 500)
      };
    }
    
    const data = await response.json();
    // console.log(`API Data [${options.method || 'GET'} ${url}]:`, data);
    return data;
  } catch (error) {
    console.error(`Network or parsing error [${options.method || 'GET'} ${url}]:`, error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Mendapatkan semua guru (admin & petugas)
export const getAllTeachers = async () => {
  return await makeRequest('/teachers');
};

// Mendapatkan guru berdasarkan ID (admin & petugas)
export const getTeacherById = async (id) => {
  return await makeRequest(`/teachers/${id}`);
};

// Mendapatkan guru berdasarkan User ID (admin & petugas)
export const getTeacherByUserId = async (userId) => {
  return await makeRequest(`/teachers/user/${userId}`);
};

// Mendapatkan guru berdasarkan mapel (siswa, guru, petugas)
export const getTeacherByMapel = async (mapel) => {
  return await makeRequest(`/teachers/mapel/${mapel}`);
};

// Membuat guru baru (admin & petugas)
export const createTeacher = async (data) => {
  return await makeRequest('/teachers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Memperbarui data guru (admin & petugas)
export const updateTeacher = async (id, data) => {
  return await makeRequest(`/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Menghapus guru (admin & petugas)
export const deleteTeacher = async (id) => {
  return await makeRequest(`/teachers/${id}`, {
    method: 'DELETE',
  });
};

// Mengecek apakah guru sudah memiliki mapel (guru)
export const checkTeacherMapel = async () => {
  return await makeRequest('/teachers/mapel');
};

// Menyimpan pilihan mapel guru (guru)
export const saveTeacherMapel = async (mapel) => {
  return await makeRequest('/teachers/mapel', {
    method: 'POST',
    body: JSON.stringify({ mapel }),
  });
};