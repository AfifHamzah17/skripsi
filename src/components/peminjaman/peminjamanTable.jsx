// src/components/PeminjamanTable.jsx
import React from 'react';
import Table from '../table';
import Button from '../button';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';

const PeminjamanTable = ({ 
  peminjamans, 
  loading, 
  onApprove, 
  onReject, 
  onReturn 
}) => {
  const columns = [
    { 
      header: 'Siswa', 
      field: 'user',
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-800 text-xs font-medium">
              {row.user?.nama ? row.user.nama.charAt(0) : 'U'}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row.user?.nama || row.userId}
            </div>
            <div className="text-xs text-gray-500">
              {row.user?.kelas || '-'}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Alat', 
      field: 'alat',
      render: (row) => row.alat?.nama || row.alatId
    },
    { header: 'Jumlah', field: 'jumlah' },
    { header: 'Mapel', field: 'mapel' },
    { 
      header: 'Guru', 
      field: 'guru',
      render: (row) => row.guru?.nama || row.guruId
    },
    { 
      header: 'Tanggal Pinjam', 
      field: 'tanggalPeminjaman',
      render: (row) => new Date(row.tanggalPeminjaman).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => {
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
          disetujui: { color: 'bg-green-100 text-green-800', text: 'Disetujui' },
          ditolak: { color: 'bg-red-100 text-red-800', text: 'Ditolak' },
          kembali: { color: 'bg-blue-100 text-blue-800', text: 'Dikembalikan' },
        };
        
        const config = statusConfig[row.status] || statusConfig.pending;
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
            {config.text}
          </span>
        );
      }
    }
  ];

  const actions = (row) => (
    <div className="flex justify-end space-x-2">
      {row.status === 'pending' && (
        <>
          <Button 
            onClick={() => onApprove(row.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaCheck className="mr-1 h-4 w-4" />
            Setujui
          </Button>
          <Button 
            onClick={() => onReject(row.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaTimes className="mr-1 h-4 w-4" />
            Tolak
          </Button>
        </>
      )}
      {row.status === 'disetujui' && (
        <Button 
          onClick={() => onReturn(row.id)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaUndo className="mr-1 h-4 w-4" />
          Kembalikan
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Daftar Peminjaman</h2>
      </div>
      <Table 
        columns={columns}
        data={peminjamans}
        actions={actions}
        loading={loading}
        emptyMessage="Tidak ada peminjaman tersedia"
      />
    </div>
  );
};

export default PeminjamanTable;