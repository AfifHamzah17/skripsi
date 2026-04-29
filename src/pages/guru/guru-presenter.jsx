// src/pages/guru/guruPresenter.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'sonner';
import { GuruModel } from './guru-model';
import { getPeminjamanByGuru } from '../models/peminjaman-model';
import { getMapelByUserId, getAllRoster } from '../models/roster-model';
import GuruView from './guru-view';

export function useGuruPresenter() {
  const { user } = useAuth();
  const model = useMemo(() => new GuruModel(), []);
  const [peminjamans, setPeminjamans] = useState([]);
  const [mapelData, setMapelData] = useState([]);
  const [rosterData, setRosterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [statistics, setStatistics] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [pinjamRes, mapelRes, rosterRes] = await Promise.all([model.fetchPeminjaman(), getMapelByUserId(user?.id), getAllRoster()]);
      if (!pinjamRes.success) { setMessage(pinjamRes.message); setPeminjamans([]); setStatistics({}); }
      else { setPeminjamans(pinjamRes.data); setStatistics(model.calculateStatistics(pinjamRes.data)); }
      setMapelData(!mapelRes.error ? mapelRes.result || [] : []);
      setRosterData(!rosterRes.error ? rosterRes.result || [] : []);
    } catch (error) { setMessage('Gagal mengambil data'); }
    finally { setLoading(false); }
  }, [model, user?.id]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
  const chartData = useMemo(() => model.prepareChartData(statistics.mapelStats), [statistics.mapelStats, model]);
  const filteredPeminjamans = useMemo(() => model.filterByStatus(peminjamans, statusFilter), [peminjamans, statusFilter, model]);
  const handleRefreshData = useCallback(() => { fetchDashboardData(); toast.success('Data berhasil diperbarui'); }, [fetchDashboardData]);
  const handleStatusFilterChange = useCallback((filter) => setStatusFilter(filter), []);
  const formatTanggal = useCallback((d) => model.formatTanggal(d), [model]);
  const mapStatusLabel = useCallback((s) => model.mapStatusLabel(s), [model]);
  const getStatusBadgeClass = useCallback((s) => model.getStatusBadgeClass(s), [model]);
  const getKondisiBadgeClass = useCallback((k) => model.getKondisiBadgeClass(k), [model]);

  return { user, mapelData, rosterData, peminjamans: filteredPeminjamans, loading, message, statistics, statusFilter, chartData, handleRefreshData, handleStatusFilterChange, formatTanggal, mapStatusLabel, getStatusBadgeClass, getKondisiBadgeClass };
}

export default function GuruPresenter({ activeTab }) {
  return <GuruView {...useGuruPresenter()} activeTab={activeTab} />;
}