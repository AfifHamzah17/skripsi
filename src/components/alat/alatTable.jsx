// src/components/alat/AlatTable.jsx
import React from 'react';
import Table from '../table';
import Button from '../button';
import Modal from '../modal';
import AlatForm from './alatForm';
import { FaEdit, FaTrash, FaSync } from 'react-icons/fa';

const AlatTable = ({ 
  alats, 
  loading, 
  onEdit, 
  onDelete,
  onRefresh 
}) => {
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedAlat, setSelectedAlat] = React.useState(null);

  const columns = [
    { header: 'Nama Alat', field: 'nama' },
    { header: 'Stok', field: 'stok' },
    { header: 'Kondisi', field: 'kondisi' },
    { 
      header: 'Tanggal Dibuat', 
      field: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  ];

  const actions = (row) => (
    <div className="flex justify-end space-x-2">
      <Button 
        onClick={() => {
          setSelectedAlat(row);
          setEditModalOpen(true);
        }}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <FaEdit className="mr-1 h-4 w-4" />
        Edit
      </Button>
      <Button 
        onClick={() => onDelete(row.id)}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <FaTrash className="mr-1 h-4 w-4" />
        Hapus
      </Button>
    </div>
  );

  const handleUpdate = async (alatData) => {
    try {
      await onEdit(alatData);
      setEditModalOpen(false);
      setSelectedAlat(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating alat:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Daftar Alat</h2>
        <Button 
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FaSync className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Table 
        columns={columns}
        data={alats}
        actions={actions}
        loading={loading}
        emptyMessage="Tidak ada alat tersedia"
      />

      <Modal 
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAlat(null);
        }}
        title="Edit Alat"
        size="md"
      >
        <AlatForm 
          initialData={selectedAlat}
          onSubmit={handleUpdate}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default AlatTable;