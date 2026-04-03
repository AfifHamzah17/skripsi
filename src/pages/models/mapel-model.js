// src/pages/models/mapel-model.js
const API = () => import.meta.env.VITE_API_BASE;

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
};

const jsonHeader = () => ({ 'Content-Type': 'application/json', ...authHeader() });

const safeJson = async (response) => {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error(`Server error (${response.status})`);
  return response.json();
};

export const getAllMapel = async () => {
  try {
    const base = await API();
    const response = await fetch(base + '/mapel', { headers: authHeader() });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.message || 'Gagal mengambil data mapel');
    return data;
  } catch (error) { return { error: true, message: error.message }; }
};

export const addMapel = async (nama, kelas, dibuatOleh, dibuatOlehId) => {
  try {
    const base = await API();
    const response = await fetch(base + '/mapel', {
      method: 'POST',
      headers: jsonHeader(),
      body: JSON.stringify({ nama, kelas, dibuatOleh, dibuatOlehId }),
    });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.message || 'Gagal menambah mapel');
    return data;
  } catch (error) { return { error: true, message: error.message }; }
};

export const editMapel = async (id, nama, kelas) => {
  try {
    const base = await API();
    const response = await fetch(base + '/mapel/' + id, {
      method: 'PUT',
      headers: jsonHeader(),
      body: JSON.stringify({ nama, kelas }),
    });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.message || 'Gagal mengupdate mapel');
    return data;
  } catch (error) { return { error: true, message: error.message }; }
};

export const deleteMapel = async (id) => {
  try {
    const base = await API();
    const response = await fetch(base + '/mapel/' + id, {
      method: 'DELETE',
      headers: authHeader(),
    });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.message || 'Gagal menghapus mapel');
    return data;
  } catch (error) { return { error: true, message: error.message }; }
};