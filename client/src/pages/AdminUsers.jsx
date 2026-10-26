import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, Search, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllUsers({ role: roleFilter, search, limit: 50 });
      if (res.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleRole = async (targetUser) => {
    if (targetUser._id === currentUser._id) {
      showToast('You cannot revoke your own admin rights.', 'warning');
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminAPI.updateUserRole(targetUser._id, newRole);
      if (res.success) {
        showToast(`User ${targetUser.name} is now ${newRole}!`, 'success');
        await fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <ArrowLeft size={14} className="me-1" /> Back to Dashboard
          </Link>
          <h1 className="text-white fw-black tracking-tight mb-1">User & Access Management</h1>
          <p className="text-secondary small mb-0">Control customer accounts and assign administrative roles.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-3 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="row g-3"
        >
          <div className="col-md-7">
            <div className="position-relative">
              <Search size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="text"
                className="form-control imovies-input ps-5"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select imovies-input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">Standard Customers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary-imovies btn-sm w-100 py-2">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-5 text-secondary">
            <div className="spinner-border text-danger me-2"></div>
            Loading user list...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-muted small text-uppercase">
                  <th>User</th>
                  <th>Contact Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Role</th>
                  <th className="text-end">Role Privilege Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: u.role === 'admin' ? 'var(--accent-amber)' : 'var(--accent-blue)',
                            fontSize: '0.8rem',
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-white small fw-bold">{u.name}</div>
                      </div>
                    </td>
                    <td className="small text-secondary">{u.email}</td>
                    <td className="small text-secondary">{u.phone || 'N/A'}</td>
                    <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge text-uppercase small ${
                          u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="text-end">
                      {u._id !== currentUser?._id && (
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            u.role === 'admin' ? 'btn-outline-secondary' : 'btn-outline-warning'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleToggleRole(u)}
                        >
                          {u.role === 'admin' ? 'Demote to User' : 'Make Administrator'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
