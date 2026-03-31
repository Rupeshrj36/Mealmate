import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiHome, FiStar, FiMessageSquare, FiClock, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingMesses, setPendingMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, messesRes] = await Promise.all([
        api.get('/users/analytics'),
        api.get('/users?role=owner&limit=50'),
        api.get('/messes/admin/all')
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setPendingOwners(usersRes.data.users.filter(u => !u.isApproved));
      setPendingMesses(messesRes.data.messes.filter(m => !m.isApproved));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const approveOwner = async (id, approve) => {
    try {
      await api.put(`/users/${id}/approve`, { isApproved: approve });
      fetchData();
    } catch {}
  };

  const approveMess = async (id, approve) => {
    try {
      await api.put(`/messes/${id}/approve`, { isApproved: approve });
      fetchData();
    } catch {}
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="dash-title-row">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {user?.name}! Here's your overview.</p>
            </div>
            <div className="dash-actions">
              <Link to="/admin/users" className="btn btn-secondary">Manage Users</Link>
              <Link to="/admin/messes" className="btn btn-primary">Manage Messes</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-body">
        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={<FiUsers />} label="Total Users" value={analytics?.totalUsers || 0} color="var(--primary)" />
          <StatCard icon={<FiHome />} label="Active Messes" value={analytics?.totalMesses || 0} color="var(--success)" />
          <StatCard icon={<FiUsers />} label="Students" value={analytics?.totalStudents || 0} color="var(--dinner)" />
          <StatCard icon={<FiClock />} label="Pending Approvals" value={analytics?.pendingApprovals || 0} color="var(--warning)" sub="owners awaiting review" />
          <StatCard icon={<FiStar />} label="Total Menus" value={analytics?.totalMenus || 0} color="var(--accent)" />
          <StatCard icon={<FiMessageSquare />} label="Reviews" value={analytics?.totalFeedback || 0} color="var(--info)" />
        </div>

        <div className="admin-grid">
          {/* Pending Owners */}
          <div className="card admin-panel">
            <div className="panel-header">
              <h2><FiClock /> Pending Owner Approvals</h2>
              <span className="badge badge-warning">{pendingOwners.length} pending</span>
            </div>
            {pendingOwners.length === 0
              ? <div className="empty-mini">✅ All owners approved</div>
              : pendingOwners.map(owner => (
                <div key={owner._id} className="approval-row">
                  <div className="approval-info">
                    <div className="approval-avatar">{owner.name[0]}</div>
                    <div>
                      <div className="approval-name">{owner.name}</div>
                      <div className="approval-email">{owner.email}</div>
                      {owner.phone && <div className="approval-phone">{owner.phone}</div>}
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn btn-success btn-sm" onClick={() => approveOwner(owner._id, true)}>
                      <FiCheck /> Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => approveOwner(owner._id, false)}>
                      <FiX /> Reject
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Pending Messes */}
          <div className="card admin-panel">
            <div className="panel-header">
              <h2><FiHome /> Pending Mess Approvals</h2>
              <span className="badge badge-warning">{pendingMesses.length} pending</span>
            </div>
            {pendingMesses.length === 0
              ? <div className="empty-mini">✅ All messes approved</div>
              : pendingMesses.map(mess => (
                <div key={mess._id} className="approval-row">
                  <div className="approval-info">
                    <div className="approval-avatar mess">🏪</div>
                    <div>
                      <div className="approval-name">{mess.name}</div>
                      <div className="approval-email">{mess.location?.address}, {mess.location?.city}</div>
                      <div className="approval-email">Owner: {mess.owner?.name}</div>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn btn-success btn-sm" onClick={() => approveMess(mess._id, true)}>
                      <FiCheck /> Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => approveMess(mess._id, false)}>
                      <FiX /> Reject
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Top Messes */}
          <div className="card admin-panel">
            <div className="panel-header">
              <h2><FiTrendingUp /> Top Rated Messes</h2>
            </div>
            {analytics?.topMesses?.map((mess, i) => (
              <div key={mess._id} className="top-mess-row">
                <span className="top-rank">#{i + 1}</span>
                <div className="top-mess-info">
                  <div className="top-mess-name">{mess.name}</div>
                  <div className="top-mess-loc">{mess.location?.city}</div>
                </div>
                <div className="top-mess-rating">
                  <span className="star">★</span> {mess.rating?.average?.toFixed(1)}
                  <span className="rating-cnt">({mess.rating?.count})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="card admin-panel">
            <div className="panel-header"><h2>Quick Actions</h2></div>
            <div className="quick-actions">
              <Link to="/admin/users" className="quick-action-btn"><FiUsers /> Manage All Users</Link>
              <Link to="/admin/messes" className="quick-action-btn"><FiHome /> Manage All Messes</Link>
              <Link to="/admin/feedback" className="quick-action-btn"><FiMessageSquare /> View All Feedback</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 28px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dash-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dashboard-header h1 { font-size: 26px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dash-actions { display: flex; gap: 10px; }
        .dashboard-body { padding: 28px 0 60px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .stat-icon { width: 48px; height: 48px; border-radius: var(--radius-md); background: color-mix(in srgb, var(--stat-color) 15%, transparent); color: var(--stat-color); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .stat-value { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 13px; color: var(--gray-500); font-weight: 500; }
        .stat-sub { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
        .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .admin-panel { padding: 20px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
        .panel-header h2 { font-size: 16px; display: flex; align-items: center; gap: 8px; }
        .approval-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--gray-200); gap: 10px; }
        .approval-row:last-child { border-bottom: none; }
        .approval-info { display: flex; align-items: center; gap: 10px; }
        .approval-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0; }
        .approval-avatar.mess { border-radius: var(--radius-md); font-size: 18px; background: var(--gray-100); }
        .approval-name { font-size: 14px; font-weight: 600; }
        .approval-email { font-size: 12px; color: var(--gray-500); }
        .approval-phone { font-size: 12px; color: var(--gray-500); }
        .approval-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .empty-mini { color: var(--gray-500); font-size: 14px; padding: 20px 0; text-align: center; }
        .top-mess-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--gray-200); }
        .top-mess-row:last-child { border-bottom: none; }
        .top-rank { font-size: 18px; font-weight: 800; color: var(--gray-300); width: 28px; text-align: center; }
        .top-mess-info { flex: 1; }
        .top-mess-name { font-size: 14px; font-weight: 600; }
        .top-mess-loc { font-size: 12px; color: var(--gray-500); }
        .top-mess-rating { display: flex; align-items: center; gap: 3px; font-size: 14px; font-weight: 700; white-space: nowrap; }
        .rating-cnt { font-size: 11px; color: var(--gray-400); font-weight: 400; }
        .quick-actions { display: flex; flex-direction: column; gap: 8px; }
        .quick-action-btn { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); background: var(--gray-100); color: var(--gray-700); font-size: 14px; font-weight: 500; transition: var(--transition); }
        .quick-action-btn:hover { background: var(--primary-bg); color: var(--primary); }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .admin-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
