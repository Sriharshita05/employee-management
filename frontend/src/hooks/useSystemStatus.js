import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function getHealthUrl() {
  const base = api.defaults.baseURL || '';
  return base.replace(/\/api\/?$/, '') + '/up';
}

export function useSystemStatus() {
  const [status, setStatus] = useState('checking'); // 'up' | 'down' | 'checking'
  const [checkedAt, setCheckedAt] = useState(null);

  const check = useCallback(async () => {
    setStatus('checking');
    try {
      const response = await fetch(getHealthUrl(), { method: 'GET' });
      setStatus(response.ok ? 'up' : 'down');
    } catch {
      setStatus('down');
    } finally {
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, checkedAt, recheck: check };
}
