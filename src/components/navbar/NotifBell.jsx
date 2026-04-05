import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheckDouble, FaTimes, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaExclamationTriangle, FaBan, FaInfoCircle, FaEye } from 'react-icons/fa';
import { getNotifByUser, getUnreadCount, markRead, markAllRead } from '../../pages/models/notifikasi-model';
import { toast } from 'react-toastify';

const fmtWIB = iso => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' WIB'; };
const relTime = iso => { const s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 60) return 'Baru saja'; if (s < 3600) return Math.floor(s / 60) + ' menit lalu'; if (s < 86400) return Math.floor(s / 3600) + ' jam lalu'; return Math.floor(s / 86400) + ' hari lalu'; };
const remain = iso => { if (!iso) return null; const h = (new Date(iso) - Date.now()) / 3600000; if (h <= 0) return null; return h < 24 ? `${Math.ceil(h)} jam` : `${Math.floor(h / 24)} hari`; };
const tM = t => ({ approve: { i: <FaCheckCircle />, c: '#10b981', bg: '#ecfdf5', b: '#10b981' }, return: { i: <FaArrowLeft />, c: '#3b82f6', bg: '#eff6ff', b: '#3b82f6' }, request: { i: <FaInfoCircle />, c: '#3b82f6', bg: '#eff6ff', b: '#3b82f6' }, info: { i: <FaInfoCircle />, c: '#6366f1', bg: '#eef2ff', b: '#6366f1' }, reject: { i: <FaTimesCircle />, c: '#ef4444', bg: '#fef2f2', b: '#ef4444' }, warning: { i: <FaExclamationTriangle />, c: '#f59e0b', bg: '#fffbeb', b: '#f59e0b' }, cancel: { i: <FaBan />, c: '#6b7280', bg: '#f3f4f6', b: '#9ca3af' } }[t] || { i: <FaBell />, c: '#6b7280', bg: '#f3f4f6', b: '#9ca3af' });
const grp = items => {
  const n = new Date(), td = new Date(n.getFullYear(), n.getMonth(), n.getDate()), yd = new Date(td); yd.setDate(yd.getDate() - 1);
  const wa = new Date(td); wa.setDate(wa.getDate() - 7);
  const g = { 'Hari Ini': [], 'Kemarin': [], 'Minggu Ini': [], 'Lebih Lama': [] };
  items.forEach(x => { const d = new Date(x.createdAt); if (d >= td) g['Hari Ini'].push(x); else if (d >= yd) g['Kemarin'].push(x); else if (d >= wa) g['Minggu Ini'].push(x); else g['Lebih Lama'].push(x); });
  return Object.entries(g).filter(([, v]) => v.length > 0);
};

const S = {
  w: { position: 'relative' },
  btn: { position: 'relative', padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, color: '#6b7280', transition: 'color .15s', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  bg: { position: 'absolute', top: 0, right: -2, minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', lineHeight: 1 },
  dt: { width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'block', marginTop: 2, boxShadow: '0 0 0 2px rgba(239,68,68,.25)', animation: 'np 2s ease-in-out infinite' },
  pn: { position: 'absolute', top: '100%', right: -8, marginTop: 8, width: 400, background: '#fff', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,.15)', border: '1px solid #e5e7eb', zIndex: 9999, overflow: 'hidden' },
  hd: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  ht: { fontSize: 14, fontWeight: 700, color: '#111827' },
  ha: { display: 'flex', gap: 8, alignItems: 'center' },
  ma: { fontSize: 11, color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  cx: { padding: 4, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6b7280' },
  lw: { maxHeight: 420, overflowY: 'auto' },
  sp: { width: 22, height: 22, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#3b82f6', animation: 'spin .6s linear infinite', margin: '0 auto' },
  em: { padding: 32, textAlign: 'center' },
  ei: { fontSize: 28, color: '#d1d5db', marginBottom: 8, display: 'block' },
  et: { fontSize: 13, color: '#9ca3af', margin: 0 },
  sl: { padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em' },
  rw: { display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', transition: 'background .1s', borderLeft: '3px solid transparent' },
  ri: { width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 },
  rb: { flex: 1, minWidth: 0 },
  rm: { margin: 0, fontSize: 13, color: '#111827', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  rt: { margin: '3px 0 0', fontSize: 10, color: '#9ca3af' },
  rd: { display: 'inline-block', marginTop: 2, fontSize: 9, color: '#b0b0b0', fontStyle: 'italic' },
  rc: { display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600, color: '#2563eb', background: '#eff6ff', borderRadius: 4, border: 'none', cursor: 'pointer', textDecoration: 'none' },
  bd: { width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 4 },
  ft: { padding: '8px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: 11, color: '#9ca3af' },
};

export default function NotifBell() {
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [filter, setFilter] = useState('all');
  const ref = useRef(null);

  const loadCount = async () => { const r = await getUnreadCount(); setCount(r.result || 0); };
  const loadList = async () => { setLoad(true); const r = await getNotifByUser(); setList(r.result || []); setLoad(false); };

  useEffect(() => { loadCount(); const iv = setInterval(loadCount, 30000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (open) loadList(); else { setList([]); setFilter('all'); } }, [open]);
  useEffect(() => { if (!open) return; const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [open]);

  const onRead = async n => { if (n.read) return; await markRead(n.id); setList(p => p.map(x => x.id === n.id ? { ...x, read: true } : x)); setCount(p => Math.max(0, p - 1)); };
  const onReadAll = async () => { await markAllRead(); setList(p => p.map(x => ({ ...x, read: true }))); setCount(0); toast.success('Semua notifikasi ditandai dibaca'); };
  const goTo = (link, n) => { if (link) window.location.hash = link; onRead(n); setOpen(false); };

  const filtered = filter === 'unread' ? list.filter(n => !n.read) : list;
  const groups = grp(filtered);
  const ur = filtered.filter(n => !n.read).length;

  return (
    <div ref={ref} style={S.w}>
      <button onClick={() => setOpen(!open)} style={S.btn} onMouseEnter={e => e.currentTarget.style.color = '#111827'} onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
        <FaBell style={{ fontSize: 18 }} />
        {count > 0 && <span style={S.bg}>{count > 99 ? '99+' : count}</span>}
        {count > 0 && <span style={S.dt} />}
      </button>
      {open && (
        <div style={S.pn}>
          <div style={S.hd}>
            <span style={S.ht}>Notifikasi</span>
            <div style={S.ha}>
              <button onClick={() => setFilter(f => f === 'all' ? 'unread' : 'all')} style={{ ...S.ma, color: filter === 'unread' ? '#111827' : '#2563eb', fontWeight: filter === 'unread' ? 700 : 600 }}>{filter === 'unread' ? 'Semua' : 'Belum Dibaca'}</button>
              {count > 0 && <button onClick={onReadAll} style={S.ma} onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'} onMouseLeave={e => e.currentTarget.style.color = '#2563eb'}><FaCheckDouble style={{ fontSize: 10 }} />Tandai semua</button>}
              <button onClick={() => setOpen(false)} style={S.cx}><FaTimes style={{ fontSize: 10 }} /></button>
            </div>
          </div>
          <div style={S.lw}>
            {load ? <div style={S.em}><div style={S.sp} /></div> : filtered.length === 0 ? <div style={S.em}><FaBell style={S.ei} /><p style={S.et}>{filter === 'unread' ? 'Tidak ada yang belum dibaca' : 'Belum ada notifikasi'}</p></div> : groups.map(([label, items]) => (
              <div key={label}>
                <div style={S.sl}>{label}</div>
                {items.map(n => { const t = tM(n.type); const rd = remain(n.expiresAt); return (
                  <div key={n.id} style={{ ...S.rw, background: n.read ? 'transparent' : '#f8faff', borderLeftColor: n.read ? 'transparent' : t.b }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : '#f8faff'} onClick={() => onRead(n)}>
                    <div style={{ ...S.ri, background: t.bg, color: t.c }}>{t.i}</div>
                    <div style={S.rb}>
                      <p style={{ ...S.rm, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                      <p style={S.rt}>{relTime(n.createdAt)} — {fmtWIB(n.createdAt)}</p>
                      {rd && <span style={S.rd}>⏳ {rd} lagi</span>}
                      {n.link && <button style={S.rc} onClick={e => { e.stopPropagation(); goTo(n.link, n); }}><FaEye style={{ fontSize: 9 }} />Lihat Detail</button>}
                    </div>
                    {!n.read && <div style={S.bd} />}
                  </div>
                ); })}
              </div>
            ))}
          </div>
          <div style={S.ft}>{ur > 0 ? `Ada ${ur} belum dibaca` : 'Tidak ada yang belum dibaca ✓'}</div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes np{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}`}</style>
    </div>
  );
}