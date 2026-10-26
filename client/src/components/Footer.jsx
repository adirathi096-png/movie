import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart, MapPin, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-top border-secondary mt-5 pt-5 pb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary rounded-3 p-2 d-flex align-items-center justify-content-center shadow">
                <Film size={20} className="text-white" />
              </div>
              <span className="fs-4 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                I<span style={{ color: 'var(--accent-cyan)' }}>MOVIES</span>
              </span>
            </div>
            <p className="text-secondary small leading-relaxed mb-3">
              Movie Ticket Booking Made Simple. Experience seamless cinema seat selection, IMAX & Dolby Atmos bookings, and instant confirmations with zero hassle.
            </p>
            <div className="d-flex align-items-center gap-2 small text-muted">
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <span>Certified Concurrency-Safe Booking Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold text-uppercase small tracking-wider mb-3">Movies</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/now-showing" className="text-secondary text-decoration-none hover-text-white">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/upcoming" className="text-secondary text-decoration-none hover-text-white">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-secondary text-decoration-none hover-text-white">
                  Search Catalog
                </Link>
              </li>
              <li>
                <Link to="/cinemas" className="text-secondary text-decoration-none hover-text-white">
                  Cinema Theatres
                </Link>
              </li>
            </ul>
          </div>

          {/* User Account */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold text-uppercase small tracking-wider mb-3">Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/my-bookings" className="text-secondary text-decoration-none hover-text-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-secondary text-decoration-none hover-text-white">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary text-decoration-none hover-text-white">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-secondary text-decoration-none hover-text-white">
                  Join IMovies Club
                </Link>
              </li>
            </ul>
          </div>

          {/* Cinemas & Cities */}
          <div className="col-lg-4 col-md-12">
            <h6 className="text-white fw-bold text-uppercase small tracking-wider mb-3">Cinema Networks</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-dark border border-secondary text-light py-2 px-3 d-inline-flex align-items-center gap-1">
                <MapPin size={13} color="var(--accent-cyan)" /> Mumbai Palladium
              </span>
              <span className="badge bg-dark border border-secondary text-light py-2 px-3 d-inline-flex align-items-center gap-1">
                <MapPin size={13} color="var(--accent-cyan)" /> Bengaluru CineDome
              </span>
              <span className="badge bg-dark border border-secondary text-light py-2 px-3 d-inline-flex align-items-center gap-1">
                <MapPin size={13} color="var(--accent-cyan)" /> Delhi NCR Luxe
              </span>
            </div>
            <div className="p-3 rounded-3 border border-secondary bg-dark small text-secondary">
              <div className="d-flex align-items-center gap-2 text-warning fw-semibold mb-1">
                <Sparkles size={16} /> Demo & Sandbox Environment
              </div>
              All payments on this demo platform simulate real cinema ticketing with verifiable server-side inventory locking and reservation expiry.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-top border-secondary d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} IMovies Inc. Built with MERN Stack, React, Vite & Bootstrap 5.
          </div>
          <div className="d-flex align-items-center gap-1">
            Engineered with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for cinema lovers everywhere.
          </div>
        </div>
      </div>
    </footer>
  );
};
