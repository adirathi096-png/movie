import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword({ email });
      if (res.data?.demoResetToken) {
        setDemoToken(res.data.demoResetToken);
        showToast('Demo password reset token generated successfully.', 'success');
      } else {
        showToast(res.message, 'info');
      }
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 shadow-lg" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3">
            <KeyRound size={26} className="text-white" />
          </div>
          <h2 className="text-white fw-bold mb-1">Reset Password</h2>
          <p className="text-secondary small">Enter your email address to receive password reset instructions.</p>
        </div>

        {demoToken ? (
          <div className="p-3 rounded-3 bg-dark border border-warning mb-4">
            <div className="text-warning small fw-bold mb-2">Demo Reset Token Generated:</div>
            <div className="small font-monospace text-truncate text-secondary mb-3">{demoToken}</div>
            <button
              className="btn btn-primary-imovies btn-sm w-100 justify-content-center"
              onClick={() => navigate('/reset-password', { state: { token: demoToken } })}
            >
              Continue to Set New Password <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-secondary small mb-1">Registered Email Address</label>
              <div className="position-relative">
                <Mail size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
                <input
                  type="email"
                  className="form-control imovies-input ps-5"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-imovies w-100 py-3 mb-3 justify-content-center"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-secondary small text-decoration-none hover-white">
            <ArrowLeft size={14} className="me-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
