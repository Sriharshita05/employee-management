import { useCallback, useEffect, useState } from 'react';
import { fetchOverviewReport } from '../services/reportService';

export function useReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverviewReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return { report, loading, error, loadReport };
}
