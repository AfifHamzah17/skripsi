// src/pages/profile/profile-model.js
const API = () => import.meta.env.VITE_API_BASE;
const authH = () => { const t = localStorage.getItem('token'); return t ? { 'Authorization': 'Bearer ' + t } : {}; };
const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });
const safe = async (r) => { if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || 'Error ' + r.status); } return r.json(); };

const getProfile = async (userId) => {
  const base = await API();
  // /users/profile/:id  ← bukan /users/:id
  return fetch(base + '/users/profile/' + userId, { headers: authH() }).then(safe).catch(e => ({ error: true, message: e.message }));
};

const updateProfile = async (userId, data) => {
  const base = await API();
  // /users/profile/:id  ← bukan /users/:id
  return fetch(base + '/users/profile/' + userId, { method: 'PUT', headers: jsonH(), body: JSON.stringify(data) }).then(safe).catch(e => ({ error: true, message: e.message }));
};

const updateAvatar = async (userId, base64Image) => {
  const base = await API();
  // /users/profile/:id/avatar  ← endpoint baru di routes
  return fetch(base + '/users/profile/' + userId + '/avatar', { method: 'PUT', headers: jsonH(), body: JSON.stringify({ foto: base64Image }) }).then(safe).catch(e => ({ error: true, message: e.message }));
};

export default { getProfile, updateProfile, updateAvatar };