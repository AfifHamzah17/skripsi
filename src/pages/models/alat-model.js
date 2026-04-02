// src/pages/models/alat-model.js
// const API_BASE = 'http://localhost:3000/api';
const API_BASE = import.meta.env.VITE_API_BASE;

export const getAlat = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/alat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Get all alat with search and filter
export const getAllAlat = async (search = '', category = '', status = '') => {
  try {
    const token = localStorage.getItem('token');
    
    let url = `${API_BASE}/alat`;
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil data alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting all alat:', error);
    return { error: true, message: error.message || 'Gagal mengambil data alat' };
  }
};

// Get alat by ID
export const getAlatById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/alat/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil data alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting alat by ID:', error);
    return { error: true, message: error.message || 'Gagal mengambil data alat' };
  }
};

// Create alat
export const createAlat = async (alatData, imageFile = null) => {
  try {
    const token = localStorage.getItem('token');
    
    let formData = new FormData();
    
    // Add alat data
    Object.keys(alatData).forEach(key => {
      if (key !== 'gambar' && alatData[key] !== null && alatData[key] !== undefined) {
        formData.append(key, alatData[key]);
      }
    });
    
    // Add image if exists
    if (imageFile) {
      formData.append('gambar', imageFile);
    }
    
    const response = await fetch(`${API_BASE}/alat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal menambah alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating alat:', error);
    return { error: true, message: error.message || 'Gagal menambah alat' };
  }
};

// Update alat
export const updateAlat = async (id, alatData, imageFile = null) => {
  try {
    const token = localStorage.getItem('token');
    
    let formData = new FormData();
    
    // Add alat data
    Object.keys(alatData).forEach(key => {
      if (key !== 'gambar' && alatData[key] !== null && alatData[key] !== undefined) {
        formData.append(key, alatData[key]);
      }
    });
    
    // Add image if exists
    if (imageFile) {
      formData.append('gambar', imageFile);
    }
    
    const response = await fetch(`${API_BASE}/alat/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengupdate alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating alat:', error);
    return { error: true, message: error.message || 'Gagal mengupdate alat' };
  }
};

// Delete alat
export const deleteAlat = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/alat/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal menghapus alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting alat:', error);
    return { error: true, message: error.message || 'Gagal menghapus alat' };
  }
};

// Get alat statistics
export const getAlatStatistics = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/alat/statistics`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil statistik alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting alat statistics:', error);
    return { error: true, message: error.message || 'Gagal mengambil statistik alat' };
  }
};

// Get alat detail with history
export const getAlatDetail = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/alat/${id}/detail`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil detail alat');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting alat detail:', error);
    return { error: true, message: error.message || 'Gagal mengambil detail alat' };
  }
};