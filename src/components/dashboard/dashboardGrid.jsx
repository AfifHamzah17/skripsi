// src/components/DashboardGrid.jsx
import React from 'react';
import DashboardCard from './dashboardCard';
import { FaTools, FaClock, FaCheckCircle, FaUndo } from 'react-icons/fa';

const DashboardGrid = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total Peminjaman"
        value={statistics.totalPeminjaman || 0}
        icon={<FaTools className="h-6 w-6" />}
        color="blue"
      />
      <DashboardCard
        title="Pending"
        value={statistics.pending || 0}
        icon={<FaClock className="h-6 w-6" />}
        color="yellow"
      />
      <DashboardCard
        title="Disetujui"
        value={statistics.disetujui || 0}
        icon={<FaCheckCircle className="h-6 w-6" />}
        color="green"
      />
      <DashboardCard
        title="Dikembalikan"
        value={statistics.kembali || 0}
        icon={<FaUndo className="h-6 w-6" />}
        color="purple"
      />
    </div>
  );
};

export default DashboardGrid;