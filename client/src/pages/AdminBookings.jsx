import React, { useEffect, useState } from 'react';
import { adminAPI, bookingsAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ConfirmationModal } from '../components/ConfirmationModal.jsx';
import { Ticket, Search, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllBookings({
        status: statusFilter,
        search,
        limit: 50,
      });
      if (res.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      const res = await bookingsAPI.cancelBooking(cancelTarget._id, {
        reason: 'Administrative override cancellation',
      });
      if (res.success) {
        showToast(`Booking ${res.data.bookingReference} cancelled.`, 'success');
        setCancelTarget(null);
        await fetchBookings();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <ArrowLeft size={14} className="me-1" /> Back to Dashboard
          </Link>
          <h1 className="text-white fw-black tracking-tight mb-1">Global Bookings Audit</h1>
          <p className="text-secondary small mb-0">Search, inspect, and manage cinema bookings platform-wide.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="position-relative">
              <Search size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
              <input
                type="text"
                className="form-control imovies-input ps-5"
                placeholder="Search by reference e.g. IMV-..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select
              className="form-select imovies-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-2">
            <button type="submit" className="btn btn-primary-imovies btn-sm w-100 py-2">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-5 text-secondary">
            <div className="spinner-border text-info me-2"></div>
            Loading bookings...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-muted small text-uppercase">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Venue</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace text-primary fw-bold small">{b.bookingReference}</td>
                    <td>
                      <div className="text-white small fw-semibold">{b.userId?.name}</div>
                      <div className="text-muted small">{b.userId?.email}</div>
                    </td>
                    <td className="text-white small">{b.movieId?.title}</td>
                    <td>
                      <div className="text-white small">{b.cinemaId?.name}</div>
                      <div className="text-muted small">{b.screenId?.name}</div>
                    </td>
                    <td className="small text-secondary">
                      {new Date(b.showtimeId?.startTime).toLocaleString()}
                    </td>
                    <td className="font-monospace small text-white">
                      {b.seats?.map((s) => s.seatId).join(', ')}
                    </td>
                    <td className="fw-bold small text-white">₹{b.pricing?.totalAmount}</td>
                    <td>
                      <span className={`badge small ${b.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm py-1 px-2"
                          onClick={() => setCancelTarget(b)}
                        >
                          Cancel
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

      <ConfirmationModal
        isOpen={!!cancelTarget}
        title="Admin Override: Cancel Booking"
        message={`Are you sure you want to cancel booking ${cancelTarget?.bookingReference}? This will immediately release reserved seats and refund ₹${cancelTarget?.pricing?.totalAmount}.`}
        confirmText="Confirm Cancellation"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />
    </div>
  );
};
