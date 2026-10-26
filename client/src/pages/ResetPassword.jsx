import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [token, setToken] = useState(location.state?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) return;

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.resetPassword({ token, newPassword });
      showToast(res.message || 'Password has been reset successfully.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Password reset failed. Token may be expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 shadow-lg" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div className="bg-success rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3">
            <Lock size={26} className="text-white" />
          </div>
          <h2 className="text-white fw-bold mb-1">Set New Password</h2>
          <p className="text-secondary small">Enter your reset token and choose a strong new password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small mb-1">Reset Token</label>
            <input
              type="text"
              className="form-control imovies-input font-monospace small"
              placeholder="Paste JWT reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-secondary small mb-1">New Password</label>
            <input
              type="password"
              className="form-control imovies-input"
              placeholder="Minimum 6 characters"
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
            className="btn btn-primary-imovies w-100 py-3 mb-3 justify-content-center"
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Reset Password & Sign In'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-secondary small text-decoration-none hover-white">
            Cancel and Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
