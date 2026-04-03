// src/components/MapelSelector.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaBook, FaSpinner } from 'react-icons/fa';
import { getAllMapel } from '../pages/models/mapel-model';

export default function MapelSelector({ selected = [], onChange, disabled = false }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getAllMapel();
      if (!res.error && res.result) setList(res.result.map(m => m.nama || m));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = list.filter(m => m.toLowerCase().includes(search.toLowerCase()) && !selected.includes(m));
  const toggle = (m) => {
    if (disabled) return;
    if (selected.includes(m)) onChange(selected.filter(s => s !== m));
    else onChange([...selected, m]);
  };
  const remove = (m, e) => { e.stopPropagation(); toggle(m); };

  return (
    <div style={{position:'relative'}}>
      {/* Selected tags */}
      <div onClick={() => !disabled && setOpen(!open)} style={{display:'flex',flexWrap:'wrap',gap:6,padding:'8px 12px',minHeight:44,border:'1px solid #d1d5db',borderRadius:8,cursor:disabled?'not-allowed':'pointer',backgroundColor:open?'#fff':'#fff',transition:'border 0.2s',borderColor:open?'#3b82f6':'#d1d5db'}}>
        {selected.length === 0 && <span style={{color:'#9ca3af',fontSize:13,lineHeight:'28px'}}>Pilih mata pelajaran...</span>}
        {selected.map(m => (
          <span key={m} onClick={(e) => remove(m, e)} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',backgroundColor:'#eef2ff',color:'#4338ca',borderRadius:9999,fontSize:12,fontWeight:500,border:'1px solid #c7d2fe',cursor:'pointer',transition:'background 0.15s'}}>
            {m}<FaTimes style={{fontSize:9,opacity:0.7}}/>
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:50,marginTop:4,backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:8,boxShadow:'0 10px 25px rgba(0,0,0,0.1)',maxHeight:240,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'8px 12px',borderBottom:'1px solid #f3f4f6'}}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari mapel..." style={{width:'100%',padding:'6px 8px',border:'1px solid #e5e7eb',borderRadius:6,fontSize:12,outline:'none'}} autoFocus onClick={e => e.stopPropagation()}/>
          </div>
          <div style={{overflowY:'auto',flex:1}}>
            {loading ? <div style={{padding:16,textAlign:'center'}}><FaSpinner style={{fontSize:16,color:'#9ca3af',animation:'spin 1s linear infinite'}}/></div> : filtered.length === 0 ? <div style={{padding:12,textAlign:'center',fontSize:12,color:'#9ca3af'}}>Tidak ada mapel tersedia</div> : filtered.map(m => (
              <div key={m} onClick={() => toggle(m)} style={{padding:'8px 12px',cursor:'pointer',fontSize:13,color:'#374151',display:'flex',alignItems:'center',gap:8,transition:'background 0.1s',backgroundColor: selected.includes(m)?'#eff6ff':'transparent'}} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor=selected.includes(m)?'#eff6ff':'transparent'}>
                <span style={{width:18,height:18,borderRadius:4,border: selected.includes(m)?'none':'1px solid #d1d5db',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor: selected.includes(m)?'#3b82f6':'transparent',flexShrink:0}}>{selected.includes(m)&&<FaCheck style={{fontSize:10,color:'#fff'}}/>}</span>
                <FaBook style={{fontSize:11,color:'#818cf8'}}/>{m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {open && <div style={{position:'fixed',inset:0,zIndex:40}} onClick={() => setOpen(false)}/>}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}