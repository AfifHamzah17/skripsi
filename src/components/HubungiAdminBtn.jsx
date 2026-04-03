// src/components/HubungiAdminBtn.jsx
import React, { useState } from 'react';
import { FaWhatsapp, FaRandom, FaTimes, FaUserCircle, FaEnvelope } from 'react-icons/fa';

const API = () => import.meta.env.VITE_API_BASE;
const fmtPhone = (p) => { if (!p) return '-'; const d = p.replace(/\D/g, ''); if (d.length < 10) return p; return d.slice(0, 4) + '-' + d.slice(4, 8) + '-' + d.slice(8); };
const waLink = (p) => 'https://wa.me/62' + (p || '').replace(/\D/g, '').replace(/^0/, '');

export default function HubungiAdminBtn() {
  const [show, setShow] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    setShow(true);
    try {
      const base = await API();
      const token = localStorage.getItem('token');
      const res = await fetch(base + '/users/petugas-contacts', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if (!res.ok || data.error) { setAdmin(null); }
      else {
        const list = data.result || [];
        if (list.length === 0) setAdmin(null);
        else setAdmin(list[Math.floor(Math.random() * list.length)]);
      }
    } catch { setAdmin(null); }
    setLoading(false);
  };

  return (
    <>
      <button type="button" onClick={fetchRandom} disabled={loading} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',backgroundColor:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',transition:'background 0.2s',opacity:loading?0.6:1}}>
        <FaWhatsapp style={{fontSize:14}}/>Hubungi Admin<FaRandom style={{fontSize:10,opacity:0.8}}/>
      </button>
      {show && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{position:'absolute',inset:0,backgroundColor:'rgba(0,0,0,0.4)'}} onClick={() => setShow(false)}/>
          <div style={{position:'relative',backgroundColor:'#fff',borderRadius:12,boxShadow:'0 20px 40px rgba(0,0,0,0.15)',padding:24,width:'100%',maxWidth:340}}>
            <button type="button" onClick={() => setShow(false)} style={{position:'absolute',top:12,right:12,background:'#f3f4f6',border:'none',borderRadius:6,padding:4,cursor:'pointer',color:'#6b7280'}}><FaTimes style={{fontSize:12}}/></button>
            <h3 style={{fontSize:16,fontWeight:700,color:'#111827',margin:'0 0 16px'}}>Kontak Petugas</h3>
            {loading ? <div style={{textAlign:'center',padding:20}}><div style={{width:24,height:24,borderRadius:'50%',border:'2px solid #d1d5db',borderTopColor:'#16a34a',animation:'spin 1s linear infinite',margin:'0 auto'}}/></div> : !admin ? <p style={{fontSize:13,color:'#6b7280',textAlign:'center',padding:16}}>Tidak ada petugas dengan nomor HP.</p> : (
              <div style={{textAlign:'center'}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',overflow:'hidden'}}>{admin.foto?<img src={admin.foto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<FaUserCircle style={{fontSize:28,color:'#16a34a'}}/>}</div>
                <p style={{fontSize:15,fontWeight:600,color:'#111827',margin:'0 0 4px'}}>{admin.nama}</p>
                {admin.email && <a href={'mailto:'+admin.email} style={{fontSize:12,color:'#2563eb',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4,marginBottom:8}}><FaEnvelope style={{fontSize:10}}/>{admin.email}</a>}
                <div style={{marginTop:12}}>
                  <a href={waLink(admin.nohp)} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',backgroundColor:'#16a34a',color:'#fff',textDecoration:'none',borderRadius:8,fontSize:14,fontWeight:600}}>
                    <FaWhatsapp style={{fontSize:16}}/>{fmtPhone(admin.nohp)}
                  </a>
                  <p style={{fontSize:10,color:'#9ca3af',margin:'8px 0 0'}}>Klik tombol di atas untuk chat WhatsApp</p>
                </div>
              </div>
            )}
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </>
  );
}