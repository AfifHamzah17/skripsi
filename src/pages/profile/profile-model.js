const API_URL = '/api/users';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return data;
}

export const getUserById = async (id) => {
  const res = await apiFetch(`/profile/${id}`);
  return res.user;
};

export const updateUserProfile = async (id, data) => {
  const res = await apiFetch(`/profile/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.user;
};

export const uploadAvatar = async (id, file) => {
  const formData = new FormData();
  formData.append('gambar', file);
  formData.append('subfolder', 'profile');

  const res = await apiFetch(`/${id}/avatar`, {
    method: 'POST',
    body: formData,
  });
  return res.url;
};