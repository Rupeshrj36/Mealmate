import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import toast from 'react-hot-toast';

const OwnerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/messes/my-mess').then(({ data }) => {
      if (data.mess) {
        setMess(data.mess);
        return api.get(`/feedback/mess/${data.mess._id}`);
      }
    }).then(res => {
      if (res) setFeedbacks(res.data.feedbacks);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? feedbacks.filter(f => f.mealType === filter) : feedbacks;
  const avgRating = feedbacks.length ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '—';

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="owner-feedback-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>Student Reviews</h1>
          <p>{feedbacks.length} reviews · Avg rating: {avgRating} ⭐</p>
        </div>
      </div>
      <div className="container dashboard-body">
        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          {['', 'breakfast', 'lunch', 'dinner'].map(t => (
            <button key={t} className={`filter-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t || 'All'}
            </button>
          ))}
        </div>
        {filtered.length === 0
          ? <div className="empty-state"><span className="empty-icon">💬</span><h3>No reviews yet</h3></div>
          : filtered.map(f => <FeedbackCard key={f._id} feedback={f} isOwner onUpdate={() => api.get(`/feedback/mess/${mess._id}`).then(r => setFeedbacks(r.data.feedbacks))} />)
        }
      </div>
      <style>{`
        .owner-feedback-page { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dashboard-body { padding: 24px 0 60px; max-width: 760px; }
        .filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .filter-tab { padding: 7px 16px; border-radius: var(--radius-md); border: none; background: var(--gray-100); font-size: 13px; color: var(--gray-600); cursor: pointer; font-weight: 500; transition: var(--transition); text-transform: capitalize; }
        .filter-tab.active { background: var(--primary-bg); color: var(--primary); font-weight: 700; }
        .empty-state { text-align: center; padding: 60px; }
        .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
      `}</style>
    </div>
  );
};

export default OwnerFeedback;
