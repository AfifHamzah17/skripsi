// src/pages/models/mapel-model.js
const API = () => import.meta.env.VITE_API_BASE;
const authHeader = () => { const t = localStorage.getItem('token'); return t ? { 'Authorization': 'Bearer ' + t } : {}; };
const jsonHeader = () => ({ 'Content-Type': 'application/json', ...authHeader() });
const safeJson = async (r) => { if (!(r.headers.get('content-type') || '').includes('application/json')) throw new Error(`Server error (${r.status})`); return r.json(); };

export const getAllMapel = async () => {
  try { const b = await API(), r = await fetch(b + '/mapel', { headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const addMapel = async (nama, produktif, dibuatOleh) => {
  try { const b = await API(), r = await fetch(b + '/mapel', { method: 'POST', headers: jsonHeader(), body: JSON.stringify({ nama, produktif, dibuatOleh }) }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const editMapel = async (id, nama, produktif) => {
  try { const b = await API(), r = await fetch(b + '/mapel/' + id, { method: 'PUT', headers: jsonHeader(), body: JSON.stringify({ nama, produktif }) }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const deleteMapel = async (id) => {
  try { const b = await API(), r = await fetch(b + '/mapel/' + id, { method: 'DELETE', headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const getMapelByUserId = async (userId) => {
  try { const b = await API(), r = await fetch(b + '/roster/mapel-by-user/' + userId, { headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};