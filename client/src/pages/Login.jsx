import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Film, Lock, Mail, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@imovies.com');
    setPassword('User@12345');
    showToast('Filled demonstration customer credentials.', 'info');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@12345');
    showToast('Filled administrator credentials.', 'info');
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 shadow-lg glow-cyan" style={{ maxWidth: '460px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-primary rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3 shadow">
            <Film size={28} className="text-white" />
          </div>
          <h2 className="text-white fw-black tracking-tight mb-1">Welcome Back</h2>
          <p className="text-secondary small">Sign in to manage your tickets and book cinema shows.</p>
        </div>

        {/* Demo Fast Fill Helpers */}
        <div className="p-3 rounded-3 bg-dark border border-secondary mb-4">
          <div className="d-flex align-items-center gap-1 text-warning small fw-semibold mb-2">
            <Sparkles size={14} /> Quick Demo Logins
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-info btn-sm flex-grow-1"
              style={{ fontSize: '0.75rem' }}
              onClick={handleFillDemoUser}
            >
              Fill Demo User
            </button>
            <button
              type="button"
              className="btn btn-outline-warning btn-sm flex-grow-1"
              style={{ fontSize: '0.75rem' }}
              onClick={handleFillDemoAdmin}
            >
              Fill Demo Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small mb-1">Email Address</label>
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

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="text-secondary small">Password</label>
              <Link to="/forgot-password" className="text-primary text-decoration-none small hover-cyan">
                Forgot Password?
              </Link>
            </div>
            <div className="position-relative">
              <Lock size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="password"
                className="form-control imovies-input ps-5"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-imovies w-100 py-3 fs-6 justify-content-center mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-secondary small">
          Don't have an account?{' '}
          <Link to="/register" className="text-white fw-bold text-decoration-none hover-cyan">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
