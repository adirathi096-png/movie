import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Ticket, User, LogOut, ShieldAlert, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="imovies-navbar py-2 px-3 px-md-4">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Brand Logo */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-white">
          <div className="bg-primary rounded-3 p-2 d-flex align-items-center justify-content-center shadow">
            <Film size={22} className="text-white" />
          </div>
          <div>
            <span className="fs-4 fw-black tracking-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
              I<span style={{ color: 'var(--accent-cyan)' }}>MOVIES</span>
            </span>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-link text-white d-md-none p-1"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Nav Links */}
        <div className={`d-md-flex align-items-center gap-2 ${navOpen ? 'd-flex flex-column position-absolute top-100 start-0 w-100 p-3 bg-dark border-bottom border-secondary' : 'd-none'}`}>
          <Link
            to="/now-showing"
            className={`nav-link-custom ${isActive('/now-showing') ? 'active' : ''}`}
            onClick={() => setNavOpen(false)}
          >
            Now Showing
          </Link>
          <Link
            to="/upcoming"
            className={`nav-link-custom ${isActive('/upcoming') ? 'active' : ''}`}
            onClick={() => setNavOpen(false)}
          >
            Upcoming
          </Link>
          <Link
            to="/cinemas"
            className={`nav-link-custom ${isActive('/cinemas') ? 'active' : ''}`}
            onClick={() => setNavOpen(false)}
          >
            Cinemas
          </Link>
          <Link
            to="/search"
            className={`nav-link-custom d-flex align-items-center gap-1 ${isActive('/search') ? 'active' : ''}`}
            onClick={() => setNavOpen(false)}
          >
            <Search size={16} /> Search
          </Link>
        </div>

        {/* User / Auth Controls */}
        <div className="d-none d-md-flex align-items-center gap-3">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1 py-1 px-3 rounded-pill"
                >
                  <ShieldAlert size={15} /> Admin Portal
                </Link>
              )}

              <Link
                to="/my-bookings"
                className="btn btn-secondary-imovies btn-sm d-flex align-items-center gap-2 py-1 px-3 rounded-pill"
              >
                <Ticket size={16} color="var(--accent-cyan)" /> My Bookings
              </Link>

              {/* User Dropdown */}
              <div className="position-relative">
                <button
                  type="button"
                  className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-1"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: '1px solid var(--accent-cyan)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="small fw-semibold d-none d-lg-inline">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-secondary" />
                </button>

                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 glass-panel p-2 shadow-lg rounded-3"
                    style={{ width: '220px', zIndex: 1100 }}
                  >
                    <div className="px-3 py-2 border-bottom border-secondary mb-1">
                      <div className="fw-bold small text-white text-truncate">{user?.name}</div>
                      <div className="text-muted small text-truncate">{user?.email}</div>
                      <span className="badge bg-secondary mt-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-light rounded-2 hover-bg small"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} /> My Profile
                    </Link>

                    <Link
                      to="/my-bookings"
                      className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-light rounded-2 hover-bg small"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Ticket size={16} /> Ticket History
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-warning rounded-2 hover-bg small"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldAlert size={16} /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-top border-secondary my-1"></div>

                    <button
                      type="button"
                      className="btn btn-link text-danger w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-decoration-none small"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-secondary-imovies btn-sm py-1 px-3">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary-imovies btn-sm py-1 px-3">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
