// src/components/LaporanTable.jsx
import React from 'react';
import Table from '../table';

const LaporanTable = ({ 
  title, 
  data, 
  columns 
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        <Table 
          columns={columns}
          data={data}
          emptyMessage="Tidak ada data laporan tersedia"
        />
      </div>
    </div>
  );
};

export default LaporanTable;