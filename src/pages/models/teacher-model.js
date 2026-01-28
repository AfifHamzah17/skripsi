// src/pages/models/teacher-model.js

// const API_BASE = 'http://localhost:3000/api';
// const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app/api';
const API_BASE = import.meta.env.VITE_API_BASE;

// Mendapatkan semua guru (admin & petugas)

export const getAllTeachers = async () => {
  const token = localStorage.getItem('token');
  console.log('Making request to:', `${API_BASE}/teachers`);
  console.log('Token:', token);
  
  try {
    const response = await fetch(`${API_BASE}/teachers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content type:', contentType);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
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
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};
// Mendapatkan guru berdasarkan ID (admin & petugas)
export const getTeacherById = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Mendapatkan guru berdasarkan User ID (admin & petugas)
export const getTeacherByUserId = async (userId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Mendapatkan guru berdasarkan mapel (siswa, guru, petugas)
export const getTeacherByMapel = async (mapel) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/mapel/${mapel}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Membuat guru baru (admin & petugas)
export const createTeacher = async (data) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Memperbarui data guru (admin & petugas)
export const updateTeacher = async (id, data) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Menghapus guru (admin & petugas)
export const deleteTeacher = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Mengecek apakah guru sudah memiliki mapel (guru)
export const checkTeacherMapel = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/mapel`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};

// Menyimpan pilihan mapel guru (guru)
export const saveTeacherMapel = async (mapel) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/teachers/mapel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mapel }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { 
        error: true, 
        message: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    return { 
      error: true, 
      message: 'Network error or invalid response',
      details: error.message
    };
  }
};