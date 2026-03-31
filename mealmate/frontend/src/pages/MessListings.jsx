import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import api from '../services/api';
import MessCard from '../components/mess/MessCard';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const MessListings = () => {
  const { user, isStudent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    isVeg: searchParams.get('isVeg') || '',
    mealType: searchParams.get('mealType') || '',
    minRating: searchParams.get('minRating') || '',
    sort: '-rating.average'
  });

  const debouncedSearch = useDebounce(filters.search, 450);

  useEffect(() => { fetchMesses(); }, [debouncedSearch, filters.city, filters.isVeg, filters.mealType, filters.minRating, filters.sort, page]);
  useEffect(() => { if (isStudent) fetchSubscriptions(); }, [isStudent]);

  const fetchMesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.city) params.set('city', filters.city);
      if (filters.isVeg) params.set('isVeg', filters.isVeg);
      if (filters.mealType) params.set('mealType', filters.mealType);
      if (filters.minRating) params.set('minRating', filters.minRating);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', page);
      params.set('limit', 12);
      const { data } = await api.get(`/messes?${params}`);
      setMesses(data.messes);
      setTotal(data.total);
    } catch (e) {
      toast.error('Failed to load messes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSubscriptions(data.subscriptions.map(s => s._id));
    } catch {}
  };

  const handleSubscribe = async (messId, isSubscribed) => {
    if (!user) { toast.error('Please login to follow messes'); return; }
    try {
      if (isSubscribed) {
        await api.delete(`/subscriptions/${messId}`);
        setSubscriptions(prev => prev.filter(id => id !== messId));
        toast.success('Unfollowed');
      } else {
        await api.post(`/subscriptions/${messId}`);
        setSubscriptions(prev => [...prev, messId]);
        toast.success('Following!');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', isVeg: '', mealType: '', minRating: '', sort: '-rating.average' });
    setPage(1);
  };

  const hasFilters = filters.search || filters.city || filters.isVeg || filters.mealType || filters.minRating;

  return (
    <div className="mess-listings-page">
      <div className="listings-hero">
        <div className="container">
          <h1>Explore Messes</h1>
          <p>Find the perfect mess for your taste and budget</p>
          <div className="listings-search">
            <FiSearch className="ls-icon" />
            <input
              type="text"
              placeholder="Search by name, cuisine, or dish…"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="ls-input"
            />
            {filters.search && (
              <button onClick={() => updateFilter('search', '')} className="btn btn-ghost btn-icon btn-sm">
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container listings-body">
        {/* Filters */}
        <div className="filters-bar">
          <div className="filters-row">
            <select className="filter-select" value={filters.city} onChange={e => updateFilter('city', e.target.value)}>
              <option value="">All Cities</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
            </select>
            <select className="filter-select" value={filters.mealType} onChange={e => updateFilter('mealType', e.target.value)}>
              <option value="">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
            <select className="filter-select" value={filters.isVeg} onChange={e => updateFilter('isVeg', e.target.value)}>
              <option value="">Veg & Non-Veg</option>
              <option value="true">Pure Veg Only</option>
              <option value="false">Non-Veg Available</option>
            </select>
            <select className="filter-select" value={filters.minRating} onChange={e => updateFilter('minRating', e.target.value)}>
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
            <select className="filter-select" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              <option value="-rating.average">Top Rated</option>
              <option value="-createdAt">Newest</option>
              <option value="-subscriberCount">Most Popular</option>
            </select>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <FiX /> Clear
              </button>
            )}
          </div>
          <div className="results-count">
            <FiFilter size={14} /> {total} mess{total !== 1 ? 'es' : ''} found
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : messes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No messes found</h3>
            <p>Try adjusting your filters or search term</p>
            <button className="btn btn-outline mt-16" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid-3">
            {messes.map(mess => (
              <MessCard
                key={mess._id}
                mess={mess}
                isSubscribed={subscriptions.includes(mess._id)}
                onSubscribe={isStudent ? handleSubscribe : null}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="page-info">Page {page} of {Math.ceil(total / 12)}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      <style>{`
        .listings-hero { background: linear-gradient(135deg, var(--primary) 0%, #C23410 100%); padding: 48px 0 36px; color: white; }
        .listings-hero h1 { font-size: 36px; color: white; margin-bottom: 8px; }
        .listings-hero p { font-size: 16px; opacity: 0.85; margin-bottom: 24px; }
        .listings-search { display: flex; align-items: center; gap: 10px; background: white; border-radius: var(--radius-xl); padding: 8px 8px 8px 18px; max-width: 560px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .ls-icon { color: var(--gray-400); }
        .ls-input { flex: 1; border: none; outline: none; font-size: 15px; color: var(--gray-800); background: transparent; }
        .listings-body { padding-top: 32px; padding-bottom: 60px; }
        .filters-bar { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        [data-theme="dark"] .filters-bar { background: var(--gray-100); }
        .filters-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .filter-select { padding: 8px 12px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 13px; color: var(--gray-700); background: white; cursor: pointer; outline: none; transition: var(--transition); }
        [data-theme="dark"] .filter-select { background: var(--gray-200); border-color: var(--gray-300); color: var(--gray-800); }
        .filter-select:focus { border-color: var(--primary); }
        .results-count { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--gray-500); white-space: nowrap; }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 32px 0; }
        .page-info { font-size: 14px; color: var(--gray-600); }
        .empty-state { text-align: center; padding: 80px 20px; }
        .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--gray-500); }
      `}</style>
    </div>
  );
};

export default MessListings;
