import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi('/messes?limit=6');
 *
 * @param {string}  url        - API endpoint (relative, no base URL)
 * @param {*}       initial    - initial value for data (default null)
 * @param {boolean} immediate  - fetch on mount (default true)
 */
const useApi = (url, initial = null, immediate = true) => {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (overrideUrl) => {
    if (!url && !overrideUrl) return;
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(overrideUrl || url);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) fetch();
  }, [fetch, immediate]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;
