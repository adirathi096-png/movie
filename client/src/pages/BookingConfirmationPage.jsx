import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api.js';
import { TicketCard } from '../components/TicketCard.jsx';
import { CheckCircle2, Ticket, ArrowRight, Home } from 'lucide-react';

export const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (booking) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingsAPI.getBookingById(id);
        if (res.success && res.data.booking) {
          setBooking(res.data.booking);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, booking]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
        <div className="text-secondary small">Retrieving confirmed ticket details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white mb-3">Booking Not Found</h3>
        <p className="text-secondary small mb-4">{error || 'Could not locate this ticket record.'}</p>
        <Link to="/" className="btn btn-secondary-imovies">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Success Banner */}
      <div className="glass-card p-4 p-md-5 text-center mb-4 border-success glow-cyan">
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success bg-opacity-20 text-success p-3 mb-3"
          style={{ width: '70px', height: '70px' }}
        >
          <CheckCircle2 size={40} />
        </div>

        <h1 className="text-white fw-black tracking-tight mb-2">Booking Confirmed!</h1>
        <p className="text-secondary small mb-3" style={{ maxWidth: '520px', margin: '0 auto' }}>
          Your cinema tickets have been issued and locked in our system. Present this e-ticket or reference code at the cinema entrance.
        </p>

        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="text-muted small">Reference Code:</span>
          <span className="badge bg-primary text-white fs-6 py-2 px-3 fw-bold font-monospace">
            {booking.bookingReference}
          </span>
        </div>
      </div>

      {/* Ticket Component */}
      <div className="mx-auto" style={{ maxWidth: '820px' }}>
        <TicketCard booking={booking} showActions={true} />

        {/* Post-booking Navigation */}
        <div className="d-flex align-items-center justify-content-between pt-4 mt-2 flex-wrap gap-3">
          <Link to="/my-bookings" className="btn btn-secondary-imovies btn-sm">
            <Ticket size={16} /> View in My Bookings
          </Link>

          <Link to="/" className="btn btn-primary-imovies btn-sm">
            <Home size={16} /> Back to Homepage <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
