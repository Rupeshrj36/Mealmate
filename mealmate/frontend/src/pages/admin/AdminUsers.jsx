import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchUsers(); }, [roleFilter, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      params.set('limit', 50);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const approveOwner = async (id, approve) => {
    try {
      await api.put(`/users/${id}/approve`, { isApproved: approve });
      toast.success(approve ? 'Owner approved' : 'Owner rejected');
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const toggleStatus = async (id) => {
    try {
      await api.put(`/users/${id}/toggle-status`);
      toast.success('Status updated');
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const roleColors = { admin: '#E8471A', owner: '#4B7BEC', student: '#26de81' };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="container">
          <h1>User Management</h1>
          <p>{total} total users</p>
        </div>
      </div>

      <div className="container admin-page-body">
        <div className="card table-panel">
          <div className="table-controls">
            <div className="table-search">
              <FiSearch />
              <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-tabs">
              {['', 'student', 'owner', 'admin'].map(r => (
                <button key={r} className={`filter-tab ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>
                  {r || 'All'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>College</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">{user.name[0]}</div>
                          <div>
                            <div className="user-cell-name">{user.name}</div>
                            <div className="user-cell-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="role-badge" style={{ background: `${roleColors[user.role]}22`, color: roleColors[user.role] }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {user.role === 'owner' && (
                          <span className={`status-badge ${user.isApproved ? 'active' : 'pending'}`}>
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        )}
                        {user.role !== 'owner' && <span className="text-muted text-sm">—</span>}
                      </td>
                      <td><span className="text-sm text-muted">{user.college || '—'}</span></td>
                      <td><span className="text-sm text-muted">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span></td>
                      <td>
                        <div className="table-actions">
                          {user.role === 'owner' && !user.isApproved && (
                            <>
                              <button className="btn btn-success btn-sm" title="Approve" onClick={() => approveOwner(user._id, true)}><FiCheck /></button>
                              <button className="btn btn-danger btn-sm" title="Reject" onClick={() => approveOwner(user._id, false)}><FiX /></button>
                            </>
                          )}
                          {user.role !== 'admin' && (
                            <button className={`btn btn-sm ${user.isActive ? 'btn-secondary' : 'btn-outline'}`} title="Toggle status" onClick={() => toggleStatus(user._id)}>
                              {user.isActive ? <FiToggleRight size={15} /> : <FiToggleLeft size={15} />}
                            </button>
                          )}
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

      <style>{`
        .admin-page { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .admin-page-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
        [data-theme="dark"] .admin-page-header { background: var(--gray-100); }
        .admin-page-header h1 { font-size: 24px; margin-bottom: 2px; }
        .admin-page-header p { font-size: 14px; color: var(--gray-500); }
        .admin-page-body { padding: 24px 0 60px; }
        .table-panel { overflow: hidden; }
        .table-controls { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--gray-200); gap: 16px; flex-wrap: wrap; }
        .table-search { display: flex; align-items: center; gap: 8px; background: var(--gray-100); border-radius: var(--radius-md); padding: 8px 14px; flex: 1; max-width: 320px; }
        .table-search input { border: none; background: transparent; outline: none; font-size: 14px; color: var(--gray-800); width: 100%; }
        .filter-tabs { display: flex; gap: 4px; }
        .filter-tab { padding: 6px 14px; border-radius: var(--radius-md); border: none; background: transparent; font-size: 13px; color: var(--gray-600); cursor: pointer; transition: var(--transition); font-weight: 500; }
        .filter-tab.active { background: var(--primary-bg); color: var(--primary); font-weight: 700; }
        .filter-tab:hover { background: var(--gray-100); }
        .table-wrap { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--gray-200); background: var(--gray-50); white-space: nowrap; }
        [data-theme="dark"] .data-table th { background: var(--gray-200); }
        .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: var(--gray-50); }
        [data-theme="dark"] .data-table tr:hover td { background: var(--gray-200); }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .user-cell-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .user-cell-name { font-size: 14px; font-weight: 600; white-space: nowrap; }
        .user-cell-email { font-size: 12px; color: var(--gray-500); }
        .role-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .status-badge.active { background: var(--lunch-bg); color: #0A7A40; }
        .status-badge.inactive { background: var(--gray-100); color: var(--gray-500); }
        .status-badge.pending { background: #FFF8E1; color: #956900; }
        .table-actions { display: flex; gap: 6px; }
      `}</style>
    </div>
  );
};

export default AdminUsers;
