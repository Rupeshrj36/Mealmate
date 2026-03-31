import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiStar, FiUsers, FiCalendar, FiMessageSquare, FiAlertCircle, FiEdit3 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [mess, setMess] = useState(null);
  const [todayMenus, setTodayMenus] = useState({});
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'general' });
  const [showAnnForm, setShowAnnForm] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const messRes = await api.get('/messes/my-mess');
      const m = messRes.data.mess;
      setMess(m);
      if (m) {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const [menusRes, fbRes, annRes] = await Promise.all([
          api.get(`/menus/my-menus?startDate=${dateStr}&endDate=${dateStr}`),
          api.get(`/feedback/mess/${m._id}?limit=5`),
          api.get(`/announcements/mess/${m._id}`)
        ]);
        const grouped = {};
        menusRes.data.menus.forEach(m => { grouped[m.mealType] = m; });
        setTodayMenus(grouped);
        setRecentFeedback(fbRes.data.feedbacks?.slice(0, 4) || []);
        setAnnouncements(annRes.data.announcements || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const postAnnouncement = async () => {
    if (!annForm.title || !annForm.content) { toast.error('Fill title and content'); return; }
    try {
      await api.post('/announcements', annForm);
      toast.success('Announcement posted!');
      setAnnForm({ title: '', content: '', type: 'general' });
      setShowAnnForm(false);
      fetchData();
    } catch { toast.error('Failed to post'); }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch {}
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="dash-title-row">
            <div>
              <h1>{mess ? mess.name : 'Owner Dashboard'}</h1>
              <p>Welcome back, {user?.name}!</p>
            </div>
            <div className="dash-actions">
              {!user?.isApproved && <span className="badge badge-warning"><FiAlertCircle /> Awaiting admin approval</span>}
              <Link to="/owner/menus" className="btn btn-primary"><FiPlus /> Add Menu</Link>
              <Link to="/owner/profile" className="btn btn-secondary"><FiEdit3 /> Edit Profile</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-body">
        {!mess ? (
          <div className="create-mess-prompt card">
            <span style={{ fontSize: 48 }}>🏪</span>
            <h2>Set Up Your Mess Profile</h2>
            <p>Create your mess profile so students can discover you and view your menus.</p>
            <Link to="/owner/profile" className="btn btn-primary btn-lg">Create Mess Profile</Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--accent)' }}>⭐</div><div className="stat-info"><div className="stat-value">{mess.rating?.average?.toFixed(1) || '—'}</div><div className="stat-label">Avg Rating</div></div></div>
              <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--dinner)' }}><FiUsers /></div><div className="stat-info"><div className="stat-value">{mess.subscriberCount || 0}</div><div className="stat-label">Followers</div></div></div>
              <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--success)' }}><FiMessageSquare /></div><div className="stat-info"><div className="stat-value">{mess.rating?.count || 0}</div><div className="stat-label">Reviews</div></div></div>
              <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--primary)' }}><FiCalendar /></div><div className="stat-info"><div className="stat-value">{Object.keys(todayMenus).length}/3</div><div className="stat-label">Today's Menus</div></div></div>
            </div>

            <div className="owner-grid">
              {/* Today's Menu Status */}
              <div className="card owner-panel">
                <div className="panel-header">
                  <h2><FiCalendar /> Today's Menu Status</h2>
                  <Link to="/owner/menus" className="btn btn-primary btn-sm"><FiPlus /> Add</Link>
                </div>
                <div className="today-status-list">
                  {['breakfast', 'lunch', 'dinner'].map(type => (
                    <div key={type} className={`today-status-row ${todayMenus[type] ? 'done' : 'missing'}`}>
                      <span className="today-status-icon">{type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : '🌙'}</span>
                      <span className="today-status-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      {todayMenus[type]
                        ? <><span className="today-status-items">{todayMenus[type].items?.length} items</span><span className="status-check">✓ Posted</span></>
                        : <span className="status-missing">Not posted</span>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="card owner-panel">
                <div className="panel-header">
                  <h2><FiStar /> Recent Reviews</h2>
                  <Link to="/owner/feedback" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                {recentFeedback.length === 0
                  ? <div className="empty-mini">No reviews yet</div>
                  : recentFeedback.map(f => (
                    <div key={f._id} className="fb-mini">
                      <div className="fb-mini-top">
                        <span className="fb-mini-user">{f.isAnonymous ? 'Anonymous' : f.user?.name}</span>
                        <span className="fb-mini-stars">{'★'.repeat(f.rating)}</span>
                      </div>
                      {f.comment && <p className="fb-mini-comment">{f.comment.slice(0, 80)}{f.comment.length > 80 ? '…' : ''}</p>}
                    </div>
                  ))
                }
              </div>

              {/* Announcements */}
              <div className="card owner-panel">
                <div className="panel-header">
                  <h2>📢 Announcements</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAnnForm(p => !p)}>
                    <FiPlus /> Post
                  </button>
                </div>
                {showAnnForm && (
                  <div className="ann-form animate-fade">
                    <input className="input-field" placeholder="Title" value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} />
                    <textarea className="input-field" rows={3} placeholder="Content" value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))} />
                    <select className="input-field" value={annForm.type} onChange={e => setAnnForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="general">General</option>
                      <option value="special">Special</option>
                      <option value="holiday">Holiday</option>
                      <option value="menu_change">Menu Change</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    <div className="flex gap-8">
                      <button className="btn btn-primary btn-sm" onClick={postAnnouncement}>Post</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowAnnForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                {announcements.length === 0
                  ? <div className="empty-mini">No announcements yet</div>
                  : announcements.map(a => (
                    <div key={a._id} className="ann-mini">
                      <div className="ann-mini-title">{a.title}</div>
                      <div className="ann-mini-content">{a.content.slice(0, 80)}…</div>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => deleteAnnouncement(a._id)}>Delete</button>
                    </div>
                  ))
                }
              </div>

              {/* Mess Info */}
              <div className="card owner-panel">
                <div className="panel-header">
                  <h2>🏪 Mess Info</h2>
                  <Link to="/owner/profile" className="btn btn-ghost btn-sm"><FiEdit3 /> Edit</Link>
                </div>
                <div className="mess-info-list">
                  <div className="mess-info-row"><span>Status</span><span className={`status-badge ${mess.isApproved ? 'active' : 'pending'}`}>{mess.isApproved ? 'Approved' : 'Pending'}</span></div>
                  <div className="mess-info-row"><span>Location</span><span>{mess.location?.city}</span></div>
                  <div className="mess-info-row"><span>Veg Only</span><span>{mess.isVeg ? 'Yes 🌿' : 'No'}</span></div>
                  <div className="mess-info-row"><span>Monthly Plan</span><span>{mess.pricing?.monthly ? `₹${mess.pricing.monthly}` : '—'}</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .owner-dashboard { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 28px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dash-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dash-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .dashboard-body { padding: 28px 0 60px; }
        .create-mess-prompt { padding: 60px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 500px; margin: 40px auto; }
        .create-mess-prompt h2 { font-size: 22px; }
        .create-mess-prompt p { color: var(--gray-500); font-size: 15px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .stat-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: color-mix(in srgb, var(--stat-color) 15%, transparent); color: var(--stat-color); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .stat-value { font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 3px; }
        .stat-label { font-size: 13px; color: var(--gray-500); }
        .owner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .owner-panel { padding: 20px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
        .panel-header h2 { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
        .today-status-list { display: flex; flex-direction: column; gap: 10px; }
        .today-status-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-md); }
        .today-status-row.done { background: var(--lunch-bg); }
        .today-status-row.missing { background: var(--gray-100); }
        [data-theme="dark"] .today-status-row.missing { background: var(--gray-200); }
        .today-status-icon { font-size: 18px; }
        .today-status-label { font-size: 14px; font-weight: 600; flex: 1; text-transform: capitalize; }
        .today-status-items { font-size: 12px; color: var(--gray-500); }
        .status-check { font-size: 12px; color: #0A7A40; font-weight: 700; }
        .status-missing { font-size: 12px; color: var(--gray-400); }
        .fb-mini { padding: 10px 0; border-bottom: 1px solid var(--gray-200); }
        .fb-mini:last-child { border-bottom: none; }
        .fb-mini-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .fb-mini-user { font-size: 13px; font-weight: 600; }
        .fb-mini-stars { color: var(--accent); font-size: 13px; }
        .fb-mini-comment { font-size: 12px; color: var(--gray-500); line-height: 1.5; }
        .ann-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding: 14px; background: var(--gray-100); border-radius: var(--radius-md); }
        [data-theme="dark"] .ann-form { background: var(--gray-200); }
        .ann-mini { padding: 10px 0; border-bottom: 1px solid var(--gray-200); }
        .ann-mini:last-child { border-bottom: none; }
        .ann-mini-title { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
        .ann-mini-content { font-size: 12px; color: var(--gray-500); margin-bottom: 6px; }
        .empty-mini { color: var(--gray-500); font-size: 14px; padding: 16px 0; text-align: center; }
        .mess-info-list { display: flex; flex-direction: column; gap: 10px; }
        .mess-info-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 8px 0; border-bottom: 1px solid var(--gray-200); }
        .mess-info-row:last-child { border-bottom: none; }
        .mess-info-row span:first-child { color: var(--gray-500); }
        .mess-info-row span:last-child { font-weight: 600; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .status-badge.active { background: var(--lunch-bg); color: #0A7A40; }
        .status-badge.pending { background: #FFF8E1; color: #956900; }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .owner-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
