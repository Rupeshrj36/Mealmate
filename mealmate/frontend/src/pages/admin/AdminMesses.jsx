import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiTrash2, FiExternalLink } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminMesses = () => {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchMesses(); }, []);

  const fetchMesses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/messes/admin/all');
      setMesses(data.messes);
    } catch { toast.error('Failed to load messes'); }
    finally { setLoading(false); }
  };

  const approveMess = async (id, approve) => {
    try {
      await api.put(`/messes/${id}/approve`, { isApproved: approve });
      toast.success(approve ? 'Mess approved!' : 'Mess rejected');
      fetchMesses();
    } catch { toast.error('Action failed'); }
  };

  const deleteMess = async (id) => {
    if (!window.confirm('Delete this mess? This cannot be undone.')) return;
    try {
      await api.delete(`/messes/${id}`);
      toast.success('Mess deleted');
      fetchMesses();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = messes.filter(m =>
    filter === 'all' ? true : filter === 'pending' ? !m.isApproved : m.isApproved
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="container">
          <h1>Mess Management</h1>
          <p>{messes.length} total messes · {messes.filter(m => !m.isApproved).length} pending</p>
        </div>
      </div>
      <div className="container admin-page-body">
        <div className="card table-panel">
          <div className="table-controls">
            <div className="filter-tabs">
              {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved']].map(([v, l]) => (
                <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
          </div>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Mess</th><th>Owner</th><th>Location</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(mess => (
                    <tr key={mess._id}>
                      <td>
                        <div className="user-cell">
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏪</div>
                          <div><div className="user-cell-name">{mess.name}</div>{mess.isVeg && <span style={{ fontSize: 11, color: '#0A7A40' }}>🌿 Pure Veg</span>}</div>
                        </div>
                      </td>
                      <td><span className="text-sm">{mess.owner?.name}</span><br /><span className="text-xs text-muted">{mess.owner?.email}</span></td>
                      <td><span className="text-sm text-muted">{mess.location?.city}</span></td>
                      <td><span className="font-semibold">⭐ {mess.rating?.average?.toFixed(1) || '—'}</span><span className="text-xs text-muted ml-1">({mess.rating?.count})</span></td>
                      <td><span className={`status-badge ${mess.isApproved ? 'active' : 'pending'}`}>{mess.isApproved ? 'Approved' : 'Pending'}</span></td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/messes/${mess._id}`} className="btn btn-ghost btn-sm" title="View"><FiExternalLink /></Link>
                          {!mess.isApproved
                            ? <><button className="btn btn-success btn-sm" onClick={() => approveMess(mess._id, true)}><FiCheck /></button><button className="btn btn-danger btn-sm" onClick={() => approveMess(mess._id, false)}><FiX /></button></>
                            : <button className="btn btn-secondary btn-sm" onClick={() => approveMess(mess._id, false)}><FiX /> Revoke</button>
                          }
                          <button className="btn btn-danger btn-sm" onClick={() => deleteMess(mess._id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <AdminPageStyles />
    </div>
  );
};

export const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/feedback').then(({ data }) => { setFeedbacks(data.feedbacks); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const deleteFeedback = async (id) => {
    try {
      await api.delete(`/feedback/${id}`);
      toast.success('Deleted');
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch {}
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="container"><h1>All Feedback</h1><p>{feedbacks.length} total reviews</p></div>
      </div>
      <div className="container admin-page-body">
        <div className="card table-panel">
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Mess</th><th>Rating</th><th>Comment</th><th>Meal</th><th>Actions</th></tr></thead>
                <tbody>
                  {feedbacks.map(f => (
                    <tr key={f._id}>
                      <td><div className="user-cell-name">{f.user?.name}</div><div className="user-cell-email">{f.user?.email}</div></td>
                      <td><span className="text-sm font-semibold">{f.mess?.name}</span></td>
                      <td>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</td>
                      <td><span className="text-sm text-muted">{f.comment?.slice(0, 60) || '—'}{f.comment?.length > 60 ? '…' : ''}</span></td>
                      <td>{f.mealType ? <span className={`badge badge-${f.mealType}`}>{f.mealType}</span> : '—'}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteFeedback(f._id)}><FiTrash2 /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <AdminPageStyles />
    </div>
  );
};

const AdminPageStyles = () => (
  <style>{`
    .admin-page { background: var(--gray-50); min-height: calc(100vh - 64px); }
    .admin-page-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
    [data-theme="dark"] .admin-page-header { background: var(--gray-100); }
    .admin-page-header h1 { font-size: 24px; margin-bottom: 2px; }
    .admin-page-header p { font-size: 14px; color: var(--gray-500); }
    .admin-page-body { padding: 24px 0 60px; }
    .table-panel { overflow: hidden; }
    .table-controls { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--gray-200); gap: 16px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; }
    .filter-tab { padding: 6px 14px; border-radius: var(--radius-md); border: none; background: transparent; font-size: 13px; color: var(--gray-600); cursor: pointer; transition: var(--transition); font-weight: 500; }
    .filter-tab.active { background: var(--primary-bg); color: var(--primary); font-weight: 700; }
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--gray-200); background: var(--gray-50); white-space: nowrap; }
    [data-theme="dark"] .data-table th { background: var(--gray-200); }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-cell-name { font-size: 14px; font-weight: 600; }
    .user-cell-email { font-size: 12px; color: var(--gray-500); }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .status-badge.active { background: var(--lunch-bg); color: #0A7A40; }
    .status-badge.pending { background: #FFF8E1; color: #956900; }
    .table-actions { display: flex; gap: 6px; }
    .ml-1 { margin-left: 4px; }
  `}</style>
);

export default AdminMesses;
