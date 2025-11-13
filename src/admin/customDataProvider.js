// src/admin/customDataProvider.js
const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const customDataProvider = {
  getList: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}`, {
      headers: getAuthHeader(),
    });

    const json = await res.json();
    if (json.error) throw new Error(json.message || 'Failed to fetch');

    const dataArray = json[resource] || json.users || []; // fallback
    return {
      data: dataArray.map((item) => ({ ...item, id: item.id })), // RA butuh `id`
      total: dataArray.length,
    };
  },

  getOne: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      headers: getAuthHeader(),
    });

    const json = await res.json();
    if (json.error) throw new Error(json.message || 'Failed to fetch');

    const item = json[resource.slice(0, -1)] || json.user || {}; // singular
    return { data: { ...item, id: item.id } };
  },

  create: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(params.data),
    });

    const json = await res.json();
    if (json.error) throw new Error(json.message || 'Create failed');

    return { data: { ...params.data, id: json.id || params.data.id } };
  },

  update: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(params.data),
    });

    const json = await res.json();
    if (json.error) throw new Error(json.message || 'Update failed');

    return { data: params.data };
  },

  delete: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    const json = await res.json();
    if (json.error) throw new Error(json.message || 'Delete failed');

    return { data: { id: params.id } };
  },

  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
};

export default customDataProvider;
