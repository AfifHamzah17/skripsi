// src/pages/models/roster-model.js
const API = () => import.meta.env.VITE_API_BASE;
const authHeader = () => { const t = localStorage.getItem('token'); return t ? { 'Authorization': 'Bearer ' + t } : {}; };
const jsonHeader = () => ({ 'Content-Type': 'application/json', ...authHeader() });
const safeJson = async (r) => { if (!(r.headers.get('content-type') || '').includes('application/json')) throw new Error(`Server error (${r.status})`); return r.json(); };

export const getAllRoster = async () => {
  try { const b = await API(), r = await fetch(b + '/roster', { headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const addRoster = async (data) => {
  try { const b = await API(), r = await fetch(b + '/roster', { method: 'POST', headers: jsonHeader(), body: JSON.stringify(data) }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const editRoster = async (id, data) => {
  try { const b = await API(), r = await fetch(b + '/roster/' + id, { method: 'PUT', headers: jsonHeader(), body: JSON.stringify(data) }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const deleteRoster = async (id) => {
  try { const b = await API(), r = await fetch(b + '/roster/' + id, { method: 'DELETE', headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const getRosterNow = async (kelas) => {
  try { const b = await API(), r = await fetch(b + '/roster/now/' + kelas, { headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const getGuruByMapelKelas = async (mapelId, kelas) => {
  try { const b = await API(), r = await fetch(b + '/roster/guru?mapelId=' + mapelId + '&kelas=' + kelas, { headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};

export const getMapelByUserId = async (userId) => {
  try { const b = await API(), r = await fetch(b + '/roster/mapel-by-user/' + userId, { headers: authHeader() }), d = await safeJson(r); if (!r.ok) throw new Error(d.message || 'Gagal'); return d; } catch (e) { return { error: true, message: e.message }; }
};