// src/components/alat/AlatCard.jsx
import React from 'react';
import { FaEye, FaEdit, FaTrash, FaChartLine } from 'react-icons/fa';

const AlatCard = ({ alat, onEdit, onDelete, onView, onTrack }) => {
  const getStockStyle = (stok) => stok === 0 ? 'bg-red-100 text-red-800' : stok <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  const getStockText = (stok) => stok === 0 ? 'Habis' : stok <= 10 ? 'Terbatas' : 'Tersedia';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
        {alat.gambar ? (<img src={alat.gambar} alt={alat.nama} className="w-full h-full object-cover" />) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4M16 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
          </div>
        )}
        <div className="absolute top-2 right-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStyle(alat.stok)}`}>{getStockText(alat.stok)}</span></div>
      </div>
      <div className="p-4">
        <div className="mb-2"><h3 className="text-lg font-semibold text-gray-900 truncate">{alat.nama}</h3><p className="text-sm text-gray-500">{alat.merek}</p></div>
        <div className="mb-3 space-y-1">
          <div className="flex items-center text-sm text-gray-600"><span className="font-medium">Stok:</span><span className="ml-2">{alat.stok}</span></div>
          {alat.kategori && (<div className="flex items-center text-sm text-gray-600"><span className="font-medium">Kategori:</span><span className="ml-2">{alat.kategori}</span></div>)}
        </div>
        {alat.deskripsi && (<div className="mb-3"><p className="text-sm text-gray-600 line-clamp-2">{alat.deskripsi}</p></div>)}
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex justify-between"><span className="text-gray-600">Total Pinjam:</span><span className="font-medium">{alat.totalPinjam || 0}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Sedang Dipinjam:</span><span className="font-medium">{alat.sedangDipinjam || 0}</span></div>
        </div>
        <div className="flex justify-between border-t pt-3">
          <div className="flex space-x-2">
            <button onClick={() => onView(alat.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50" title="Lihat Detail"><FaEye className="h-4 w-4" /></button>
            <button onClick={() => onTrack(alat.id)} className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50" title="Lihat Tracking"><FaChartLine className="h-4 w-4" /></button>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(alat)} className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-50" title="Edit"><FaEdit className="h-4 w-4" /></button>
            <button onClick={() => onDelete(alat.id)} className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50" title="Hapus"><FaTrash className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlatCard;