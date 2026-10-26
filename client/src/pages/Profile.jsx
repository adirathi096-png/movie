import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authAPI } from '../services/api.js';
import { User, Mail, Phone, Lock, ShieldCheck, Check } from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await authAPI.updateProfile({ name, phone, avatar });
      if (res.success) {
        updateUser(res.data.user);
        showToast('Profile information updated successfully.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setPwLoading(true);
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast('Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '900px' }}>
      <div className="mb-4">
        <h1 className="text-white fw-black tracking-tight mb-1">User Profile</h1>
        <p className="text-secondary small">Manage your account information and credentials.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Account Info Card */}
        <div className="col-md-5">
          <div className="glass-card p-4 text-center mb-4">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center text-white display-5 fw-bold mb-3 shadow"
              style={{
                width: '90px',
                height: '90px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: '2px solid var(--accent-cyan)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <h4 className="text-white fw-bold mb-1">{user?.name}</h4>
            <div className="text-muted small mb-3">{user?.email}</div>

            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className="badge bg-secondary text-uppercase py-2 px-3 small">
                Role: {user?.role}
              </span>
              <span className="badge bg-success bg-opacity-20 text-success py-2 px-3 small d-flex align-items-center gap-1">
                <ShieldCheck size={14} /> Active
              </span>
            </div>

            <div className="pt-3 border-top border-secondary text-secondary small text-start">
              <div>Member Since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="col-md-7">
          {/* Edit Profile Form */}
          <div className="glass-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <User size={18} color="var(--accent-cyan)" /> Personal Details
            </h5>

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="text-secondary small mb-1">Full Name</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1">Email Address</label>
                <input
                  type="email"
                  className="form-control imovies-input bg-dark text-muted"
                  value={user?.email}
                  disabled
                />
                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                  Email address cannot be changed directly for security.
                </span>
              </div>

              <div className="mb-4">
                <label className="text-secondary small mb-1">Contact Phone</label>
                <input
                  type="tel"
                  className="form-control imovies-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-imovies btn-sm px-4"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <Lock size={18} color="var(--accent-amber)" /> Security & Password
            </h5>

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="text-secondary small mb-1">Current Password</label>
                <input
                  type="password"
                  className="form-control imovies-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1">New Password</label>
                <input
                  type="password"
                  className="form-control imovies-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="text-secondary small mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control imovies-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary-imovies btn-sm px-4"
                disabled={pwLoading}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
