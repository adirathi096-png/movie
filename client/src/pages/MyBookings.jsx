import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TicketCard } from '../components/TicketCard.jsx';
import { ConfirmationModal } from '../components/ConfirmationModal.jsx';
import { Ticket, Film, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getMyBookings({ status: filterStatus });
      if (res.success && res.data.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load booking history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleCancelClick = (booking) => {
    setCancelTarget(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    try {
      setCancelling(true);
      const res = await bookingsAPI.cancelBooking(cancelTarget._id, {
        reason: 'Customer initiated cancellation from My Bookings',
      });

      if (res.success) {
        showToast(
          `Booking ${res.data.bookingReference} cancelled. Refund of ₹${res.data.refundAmount} initiated!`,
          'success'
        );
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
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-primary small text-uppercase fw-bold tracking-wider mb-1">
          <Ticket size={16} /> Ticket Wallet
        </div>
        <h1 className="text-white fw-black tracking-tight mb-2">My Cinema Bookings</h1>
        <p className="text-secondary small">
          View your confirmed e-tickets, showtime schedules, and manage eligible cancellations.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        <button
          type="button"
          className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-dark border border-secondary text-secondary'}`}
          onClick={() => setFilterStatus('all')}
        >
          All Bookings
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterStatus === 'confirmed' ? 'btn-primary' : 'btn-dark border border-secondary text-secondary'}`}
          onClick={() => setFilterStatus('confirmed')}
        >
          Confirmed Tickets
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterStatus === 'cancelled' ? 'btn-primary' : 'btn-dark border border-secondary text-secondary'}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled & Refunded
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary me-2"></div>
          Retrieving your tickets...
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-5 text-center text-secondary">
          <Ticket size={48} className="text-muted mb-3 opacity-50" />
          <h4 className="text-white fw-bold mb-2">No Bookings Found</h4>
          <p className="small mb-4">You have no tickets matching this filter status.</p>
          <Link to="/now-showing" className="btn btn-primary-imovies btn-sm">
            Explore Now Showing Movies
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {bookings.map((booking) => (
            <TicketCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelClick}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        title="Confirm Ticket Cancellation"
        message={`Are you sure you want to cancel booking ${cancelTarget?.bookingReference}? An estimated refund of ₹${Math.max(0, (cancelTarget?.pricing?.basePrice || 0) + (cancelTarget?.pricing?.taxes || 0))} will be credited to your original payment method. Convenience fees are non-refundable.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Tickets"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />
    </div>
  );
};
