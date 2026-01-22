// src/components/table.jsx
import React from 'react';

const Table = ({ 
  columns, 
  data, 
  actions, 
  loading = false, 
  emptyMessage = 'Tidak ada data tersedia',
  className = '' 
}) => {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  
  // Fungsi helper untuk render cell dengan aman
  const renderCell = (column, row) => {
    const value = row[column.field];
    
    // Jika value null atau undefined, tampilkan placeholder
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">-</span>;
    }
    
    // Jika ada fungsi render kustom, gunakan itu
    if (column.render) {
      return column.render(row);
    }
    
    // Default rendering untuk string
    return <span>{value}</span>;
  };

  // Fungsi helper untuk render header
  const renderHeader = (column) => {
    return (
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {column.header}
      </th>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden border-b border-gray-200 rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <React.Fragment key={index}>
                {renderHeader(column)}
              </React.Fragment>
            ))}
            {actions && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-sm text-gray-500">
                <div className="flex flex-col items-center">
<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                  <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            safeData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(column, row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;