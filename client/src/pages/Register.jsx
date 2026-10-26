import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Film, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, phone, password });
      showToast('Account created successfully! Welcome to IMovies.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Registration failed. Email may already be registered.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 shadow-lg glow-cyan" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary rounded-3 p-3 d-inline-flex align-items-center justify-content-center mb-3 shadow">
            <Film size={28} className="text-white" />
          </div>
          <h2 className="text-white fw-black tracking-tight mb-1">Create Account</h2>
          <p className="text-secondary small">Join IMovies to book cinema tickets and access VIP lounges.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small mb-1">Full Name</label>
            <div className="position-relative">
              <User size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="text"
                className="form-control imovies-input ps-5"
                placeholder="Aditya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="mb-3">
            <label className="text-secondary small mb-1">Phone Number (Optional)</label>
            <div className="position-relative">
              <Phone size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="tel"
                className="form-control imovies-input ps-5"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-secondary small mb-1">Password</label>
            <div className="position-relative">
              <Lock size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="password"
                className="form-control imovies-input ps-5"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-secondary small mb-1">Confirm Password</label>
            <div className="position-relative">
              <Lock size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="password"
                className="form-control imovies-input ps-5"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-secondary small">
          Already have an account?{' '}
          <Link to="/login" className="text-white fw-bold text-decoration-none hover-cyan">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
