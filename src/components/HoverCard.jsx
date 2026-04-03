// src/components/HoverCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaWhatsapp, FaSchool, FaIdCard } from 'react-icons/fa';

export default function HoverCard({ user, onClick, children }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => { if (!show) return; const h = () => setShow(false); window.addEventListener('scroll', h, true); return () => window.removeEventListener('scroll', h, true); }, [show]);

  if (!user) return <>{children}</>;
  const has = v => v && v !== '-' && v !== 'null' && v !== 'undefined';

  return (
    <span ref={ref} style={{position:'relative',display:'inline-block',cursor:'pointer'}} onMouseEnter={() => { const r = ref.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, left: r.left }); setShow(true); }} onMouseLeave={() => setShow(false)} onClick={() => { onClick?.(); setShow(false); }}>
      <span style={{color: show ? '#2563eb' : 'inherit', textDecoration: show ? 'underline' : 'none'}}>{children}</span>
      {show && (
        <div style={{position:'fixed',zIndex:9999,background:'#fff',borderRadius:8,boxShadow:'0 10px 25px rgba(0,0,0,0.15)',border:'1px solid #e5e7eb',padding:12,width:240,top:Math.min(pos.top, window.innerHeight - 220),left:Math.min(pos.left, window.innerWidth - 260)}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>{user.foto?<img src={user.foto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<FaUserCircle style={{fontSize:16,color:'#60a5fa'}}/>}</div>
            <div><p style={{fontSize:13,fontWeight:600,color:'#111827',margin:0,lineHeight:1.2}}>{user.nama}</p><span style={{fontSize:9,fontWeight:600,padding:'1px 6px',borderRadius:9999,backgroundColor:user.role==='siswa'?'#eef2ff':'#f5f3ff',color:user.role==='siswa'?'#4338ca':'#6d28d9',textTransform:'uppercase',display:'inline-block',marginTop:2}}>{user.role}</span></div>
          </div>
          {user.email&&<p style={{fontSize:11,color:'#6b7280',display:'flex',alignItems:'center',gap:4,margin:'2px 0'}}><FaEnvelope style={{fontSize:9}}/>{user.email}</p>}
          {user.nohp&&<p style={{fontSize:11,color:'#6b7280',display:'flex',alignItems:'center',gap:4,margin:'2px 0'}}><FaWhatsapp style={{fontSize:9,color:'#16a34a'}}/>{user.nohp}</p>}
          {user.role==='siswa'&&user.kelas&&<p style={{fontSize:11,color:'#6b7280',display:'flex',alignItems:'center',gap:4,margin:'2px 0'}}><FaSchool style={{fontSize:9}}/>Kelas: {user.kelas}</p>}
          {(user.nip||user.nisn)&&<p style={{fontSize:11,color:'#6b7280',margin:'2px 0'}}>{user.nip?`NIP: ${user.nip}`:`NISN: ${user.nisn}`}</p>}
          <p style={{fontSize:10,color:'#2563eb',marginTop:6,borderTop:'1px solid #f3f4f6',paddingTop:6}}>Klik untuk lihat profil →</p>
        </div>
      )}
    </span>
  );
}