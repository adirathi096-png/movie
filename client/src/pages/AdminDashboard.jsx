import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  DollarSign,
  Ticket,
  Film,
  Users,
  MapPin,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboardStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load admin stats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning my-5" role="status"></div>
        <div className="text-secondary small">Loading administrative analytics...</div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 text-warning small text-uppercase fw-bold tracking-wider mb-1">
            <ShieldAlert size={16} /> Central Command
          </div>
          <h1 className="text-white fw-black tracking-tight mb-1">Administrator Dashboard</h1>
          <p className="text-secondary small mb-0">
            Real-time analytics, revenue tracking, and inventory management.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/movies" className="btn btn-primary-imovies btn-sm">
            <Film size={15} /> Manage Movies
          </Link>
          <Link to="/admin/showtimes" className="btn btn-secondary-imovies btn-sm">
            <Calendar size={15} /> Schedule Showtimes
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-5">
        <div className="col-lg-3 col-sm-6">
          <div className="glass-card p-4 h-100 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small text-uppercase fw-bold">Total Revenue</span>
              <div className="p-2 rounded-3 bg-success bg-opacity-20 text-success">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="display-6 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              ₹{stats.totalRevenue?.toLocaleString() || 0}
            </div>
            <span className="text-success small fw-semibold">Net Confirmed Sales</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="glass-card p-4 h-100 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small text-uppercase fw-bold">Confirmed Tickets</span>
              <div className="p-2 rounded-3 bg-primary bg-opacity-20 text-primary">
                <Ticket size={20} />
              </div>
            </div>
            <div className="display-6 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {stats.confirmedBookingsCount || 0}
            </div>
            <span className="text-muted small">{stats.cancelledBookingsCount || 0} cancelled</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="glass-card p-4 h-100 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small text-uppercase fw-bold">Now Showing</span>
              <div className="p-2 rounded-3 bg-warning bg-opacity-20 text-warning">
                <Film size={20} />
              </div>
            </div>
            <div className="display-6 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {stats.activeMoviesCount || 0}
            </div>
            <span className="text-muted small">Active in theatres</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="glass-card p-4 h-100 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small text-uppercase fw-bold">Registered Users</span>
              <div className="p-2 rounded-3 bg-info bg-opacity-20 text-info">
                <Users size={20} />
              </div>
            </div>
            <div className="display-6 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {stats.totalUsers || 0}
            </div>
            <span className="text-muted small">Platform members</span>
          </div>
        </div>
      </div>

      {/* Navigation Quick Grid */}
      <div className="row g-3 mb-5">
        <div className="col-md-2 col-6">
          <Link to="/admin/movies" className="glass-card p-3 d-block text-decoration-none text-center hover-scale">
            <Film size={24} className="text-primary mb-2" />
            <div className="text-white small fw-bold">Movies</div>
          </Link>
        </div>
        <div className="col-md-2 col-6">
          <Link to="/admin/cinemas" className="glass-card p-3 d-block text-decoration-none text-center hover-scale">
            <MapPin size={24} className="text-success mb-2" />
            <div className="text-white small fw-bold">Cinemas & Screens</div>
          </Link>
        </div>
        <div className="col-md-2 col-6">
          <Link to="/admin/showtimes" className="glass-card p-3 d-block text-decoration-none text-center hover-scale">
            <Calendar size={24} className="text-warning mb-2" />
            <div className="text-white small fw-bold">Showtimes</div>
          </Link>
        </div>
        <div className="col-md-2 col-6">
          <Link to="/admin/bookings" className="glass-card p-3 d-block text-decoration-none text-center hover-scale">
            <Ticket size={24} className="text-info mb-2" />
            <div className="text-white small fw-bold">All Bookings</div>
          </Link>
        </div>
        <div className="col-md-2 col-6">
          <Link to="/admin/users" className="glass-card p-3 d-block text-decoration-none text-center hover-scale">
            <Users size={24} className="text-danger mb-2" />
            <div className="text-white small fw-bold">User Accounts</div>
          </Link>
        </div>
        <div className="col-md-2 col-6">
          <Link to="/" className="glass-card p-3 d-block text-decoration-none text-center hover-scale">
            <ArrowRight size={24} className="text-secondary mb-2" />
            <div className="text-white small fw-bold">Live Portal</div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings Audit Table */}
      <div className="glass-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="text-white fw-bold mb-0">Recent Platform Transactions</h4>
          <Link to="/admin/bookings" className="text-primary small text-decoration-none hover-cyan">
            View All Bookings &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Reference</th>
                <th>Customer</th>
                <th>Movie</th>
                <th>Cinema</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b._id}>
                  <td className="font-monospace text-primary fw-bold small">{b.bookingReference}</td>
                  <td>
                    <div className="text-white fw-semibold small">{b.userId?.name || 'Customer'}</div>
                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                      {b.userId?.email}
                    </div>
                  </td>
                  <td className="text-white small">{b.movieId?.title}</td>
                  <td className="text-secondary small">{b.cinemaId?.name}</td>
                  <td className="text-white small font-monospace">
                    {b.seats?.map((s) => s.seatId).join(', ')}
                  </td>
                  <td className="text-white fw-bold small">₹{b.pricing?.totalAmount}</td>
                  <td>
                    <span
                      className={`badge text-uppercase small ${
                        b.status === 'confirmed'
                          ? 'bg-success'
                          : b.status === 'cancelled'
                          ? 'bg-danger'
                          : 'bg-secondary'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
