import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiBookmark, FiStar, FiBell } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MessCard from '../../components/mess/MessCard';
import MealCard from '../../components/meals/MealCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [todayMenus, setTodayMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subRes, todayRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/menus/today')
      ]);
      setSubscriptions(subRes.data.subscriptions || []);
      setTodayMenus(todayRes.data.grouped || []);
    } catch {} finally { setLoading(false); }
  };

  const handleUnsubscribe = async (messId) => {
    try {
      await api.delete(`/subscriptions/${messId}`);
      setSubscriptions(prev => prev.filter(s => s._id !== messId));
      toast.success('Unfollowed');
    } catch {}
  };

  const subIds = subscriptions.map(s => s._id);
  const myMesses = todayMenus.filter(({ mess }) => subIds.includes(mess._id));
  const unread = user?.notifications?.filter(n => !n.read) || [];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="dash-title-row">
            <div>
              <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
              <p>{format(new Date(), 'EEEE, MMMM d')} · {subscriptions.length} mess{subscriptions.length !== 1 ? 'es' : ''} followed</p>
            </div>
            <div className="dash-actions">
              <Link to="/messes" className="btn btn-primary">Explore Messes</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-body">
        {/* Notifications */}
        {unread.length > 0 && (
          <div className="notif-banner card">
            <FiBell size={16} />
            <span><strong>{unread.length} new notification{unread.length > 1 ? 's' : ''}</strong></span>
            <div className="notif-items">
              {unread.slice(0, 3).map((n, i) => <span key={i} className="notif-item">· {n.message}</span>)}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--primary)' }}><FiBookmark /></div><div className="stat-info"><div className="stat-value">{subscriptions.length}</div><div className="stat-label">Followed Messes</div></div></div>
          <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--success)' }}><FiCalendar /></div><div className="stat-info"><div className="stat-value">{myMesses.length}</div><div className="stat-label">Menus Today</div></div></div>
          <div className="stat-card card"><div className="stat-icon" style={{ '--stat-color': 'var(--accent)' }}><FiStar /></div><div className="stat-info"><div className="stat-value">{user?.notifications?.length || 0}</div><div className="stat-label">Notifications</div></div></div>
        </div>

        {/* Today's menus from followed messes */}
        <div className="section-header">
          <h2>Today from Your Messes</h2>
          <Link to="/weekly-menu" className="btn btn-outline btn-sm">Full Calendar</Link>
        </div>

        {myMesses.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-icon">🍽️</span>
            <h3>{subscriptions.length === 0 ? 'No messes followed yet' : 'No menus posted today from your messes'}</h3>
            <p>{subscriptions.length === 0 ? 'Follow messes to see their daily menus here.' : 'Check back later or explore other messes.'}</p>
            <Link to="/messes" className="btn btn-primary mt-16">Explore Messes</Link>
          </div>
        ) : (
          <div className="today-list">
            {myMesses.map(({ mess, meals }) => (
              <div key={mess._id} className="card today-item">
                <div className="today-mess-header">
                  <Link to={`/messes/${mess._id}`} className="today-mess-name">{mess.name}</Link>
                  <span className="today-mess-city">{mess.location?.city}</span>
                </div>
                <div className="today-meals-row">
                  {['breakfast', 'lunch', 'dinner'].map(t => (
                    meals[t] ? <MealCard key={t} menu={meals[t]} compact /> : null
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: 40 }}>
              <h2>Your Followed Messes</h2>
              <Link to="/student/subscriptions" className="btn btn-ghost btn-sm">Manage</Link>
            </div>
            <div className="grid-3">
              {subscriptions.slice(0, 3).map(mess => (
                <MessCard key={mess._id} mess={mess} isSubscribed onSubscribe={(id, isSub) => isSub && handleUnsubscribe(id)} />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .student-dashboard { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 28px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dash-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dash-actions { display: flex; gap: 10px; }
        .dashboard-body { padding: 28px 0 60px; }
        .notif-banner { display: flex; align-items: flex-start; gap: 10px; padding: 14px 18px; background: var(--dinner-bg); border-left: 3px solid var(--dinner); margin-bottom: 20px; flex-wrap: wrap; }
        .notif-items { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .notif-item { font-size: 13px; color: var(--gray-600); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .stat-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: color-mix(in srgb, var(--stat-color) 15%, transparent); color: var(--stat-color); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .stat-value { font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 3px; }
        .stat-label { font-size: 13px; color: var(--gray-500); }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-header h2 { font-size: 20px; }
        .today-list { display: flex; flex-direction: column; gap: 16px; }
        .today-item { padding: 18px; }
        .today-mess-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .today-mess-name { font-size: 16px; font-weight: 700; color: var(--gray-900); }
        .today-mess-name:hover { color: var(--primary); }
        .today-mess-city { font-size: 13px; color: var(--gray-500); }
        .today-meals-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .empty-state { padding: 48px 24px; text-align: center; }
        .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
        .empty-state h3 { font-size: 18px; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: var(--gray-500); }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr; } .today-meals-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export const StudentSubscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions').then(({ data }) => { setSubs(data.subscriptions || []); setLoading(false); });
  }, []);

  const handleUnsubscribe = async (messId) => {
    await api.delete(`/subscriptions/${messId}`);
    setSubs(prev => prev.filter(s => s._id !== messId));
    toast.success('Unfollowed');
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="student-subs-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>My Subscriptions</h1>
          <p>Messes you follow · {subs.length} followed</p>
        </div>
      </div>
      <div className="container dashboard-body">
        {subs.length === 0
          ? <div className="empty-state"><span className="empty-icon">🔖</span><h3>No messes followed yet</h3><p>Go explore and follow messes to get updates here.</p><Link to="/messes" className="btn btn-primary mt-16">Explore Messes</Link></div>
          : <div className="grid-3">{subs.map(mess => <MessCard key={mess._id} mess={mess} isSubscribed onSubscribe={(id, isSub) => isSub && handleUnsubscribe(id)} />)}</div>
        }
      </div>
      <style>{`
        .student-subs-page { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dashboard-body { padding: 28px 0 60px; }
        .empty-state { text-align: center; padding: 80px 20px; }
        .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: var(--gray-500); }
      `}</style>
    </div>
  );
};

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill both fields'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 chars'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="profile-page">
      <div className="dashboard-header">
        <div className="container"><h1>My Profile</h1><p>Manage your account settings</p></div>
      </div>
      <div className="container-sm dashboard-body">
        <div className="card profile-card">
          <div className="profile-avatar-section">
            <div className="profile-big-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div><h2>{user?.name}</h2><p className="text-muted">{user?.email}</p><span className="badge badge-primary">{user?.role}</span></div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '20px 0' }} />
          <h3 style={{ marginBottom: 16 }}>Edit Profile</h3>
          <div className="profile-form">
            <div className="input-group"><label>Full Name</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="input-group"><label>College</label><input className="input-field" value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} placeholder="MIT Pune" /></div>
            <div className="input-group"><label>Phone</label><input className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '24px 0' }} />
          <h3 style={{ marginBottom: 16 }}>Change Password</h3>
          <div className="profile-form">
            <div className="input-group"><label>Current Password</label><input type="password" className="input-field" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
            <div className="input-group"><label>New Password</label><input type="password" className="input-field" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
            <button className="btn btn-secondary" onClick={changePassword} disabled={savingPw}>{savingPw ? 'Updating…' : 'Change Password'}</button>
          </div>
        </div>
      </div>
      <style>{`
        .profile-page { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dashboard-body { padding: 28px 0 60px; }
        .profile-card { padding: 32px; }
        .profile-avatar-section { display: flex; align-items: center; gap: 20px; }
        .profile-big-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 28px; flex-shrink: 0; }
        .profile-avatar-section h2 { font-size: 20px; margin-bottom: 4px; }
        .profile-avatar-section .badge { margin-top: 6px; display: inline-block; }
        .profile-form { display: flex; flex-direction: column; gap: 14px; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
