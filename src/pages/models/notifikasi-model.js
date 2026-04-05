const API = () => import.meta.env.VITE_API_BASE;
const h = () => { const t = localStorage.getItem('token'); return t ? { 'Authorization': 'Bearer ' + t } : {}; };
const safe = async r => { if (!r.ok) throw new Error((await r.json().catch(() => ({})).message || 'Error')); return r.json(); };

export const getNotifByUser = async () => {
  const r = await fetch(await API() + '/notifikasi', { headers: h() });
  return safe(r).catch(() => ({ result: [] }));
};

export const getUnreadCount = async () => {
  const r = await fetch(await API() + '/notifikasi/unread', { headers: h() });
  return safe(r).catch(() => ({ result: 0 }));
};

export const markRead = async id => {
  const r = await fetch(await API() + '/notifikasi/' + id + '/read', { method: 'PUT', headers: h() });
  return safe(r).catch(() => ({}));
};

export const markAllRead = async () => {
  const r = await fetch(await API() + '/notifikasi/mark-all-read', { method: 'PUT', headers: h() });
  return safe(r).catch(() => ({}));
};