// src/pages/guru/guruPresenter.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'sonner';
import { GuruModel } from './guru-model';
import GuruView from './guru-view';

export function useGuruPresenter() {
  const { user, mapelData } = useAuth();
  const model = useMemo(() => new GuruModel(), []);
  const [peminjamans, setPeminjamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [statistics, setStatistics] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await model.fetchPeminjaman();
      if (!response.success) { setMessage(response.message); setPeminjamans([]); setStatistics({}); }
      else { setPeminjamans(response.data); setStatistics(model.calculateStatistics(response.data)); }
    } catch (error) { setMessage('Gagal mengambil data peminjaman'); }
    finally { setLoading(false); }
  }, [model]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const chartData = useMemo(() => model.prepareChartData(statistics.mapelStats), [statistics.mapelStats, model]);
  const filteredPeminjamans = useMemo(() => model.filterByStatus(peminjamans, statusFilter), [peminjamans, statusFilter, model]);

  const handleRefreshData = useCallback(() => { fetchDashboardData(); toast.success('Data berhasil diperbarui'); }, [fetchDashboardData]);
  const handleStatusFilterChange = useCallback((filter) => setStatusFilter(filter), []);
  const formatTanggal = useCallback((d) => model.formatTanggal(d), [model]);
  const mapStatusLabel = useCallback((s) => model.mapStatusLabel(s), [model]);
  const getStatusBadgeClass = useCallback((s) => model.getStatusBadgeClass(s), [model]);
  const getKondisiBadgeClass = useCallback((k) => model.getKondisiBadgeClass(k), [model]);

  return { user, mapelData, peminjamans: filteredPeminjamans, loading, message, statistics, statusFilter, chartData, handleRefreshData, handleStatusFilterChange, formatTanggal, mapStatusLabel, getStatusBadgeClass, getKondisiBadgeClass };
}

export default function GuruPresenter({ activeTab }) {
  return <GuruView {...useGuruPresenter()} activeTab={activeTab} />;
}