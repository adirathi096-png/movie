import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Ticket, Clock, ShieldCheck, Tag, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

export const BookingSummaryPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    selectedMovie,
    selectedCinema,
    selectedShowtime,
    selectedSeats,
    reservation,
    remainingSeconds,
    pricing,
  } = useBooking();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // If no seats or expired reservation
  if (!selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white mb-3">No Active Booking Session</h3>
        <p className="text-secondary small mb-4">Please select a movie and seats to view your booking summary.</p>
        <Link to="/now-showing" className="btn btn-primary-imovies">
          Browse Movies
        </Link>
      </div>
    );
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'IMOVIES20') {
      const disc = Math.round(pricing.basePrice * 0.2);
      setDiscount(disc);
      setPromoApplied(true);
      showToast('Promo code applied! 20% discount on base price.', 'success');
    } else {
      showToast('Invalid promo code. Try "IMOVIES20" for demo discount.', 'error');
    }
  };

  const finalTotal = Math.max(0, pricing.totalAmount - discount);

  const formatShowDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatShowTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="container py-4">
      {/* Hold Expiration Alert */}
      {remainingSeconds > 0 ? (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4 glass-panel border-warning">
          <div className="d-flex align-items-center gap-2 small">
            <Clock size={18} />
            <span>
              Your seats are temporarily locked. Complete booking within{' '}
              <strong className="text-white">{formatTimer(remainingSeconds)}</strong>
            </span>
          </div>
          <span className="badge bg-warning text-dark text-uppercase">Hold Active</span>
        </div>
      ) : (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertTriangle size={18} />
          <span>Seat hold expired. Please return to seat selection to refresh availability.</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Booking Overview */}
        <div className="col-lg-7">
          <div className="glass-card p-4 mb-4">
            <h4 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
              <Ticket size={22} color="var(--accent-cyan)" /> Booking Overview
            </h4>

            {/* Movie Snippet */}
            <div className="d-flex gap-3 align-items-center mb-4 pb-4 border-bottom border-secondary">
              {selectedMovie?.posterUrl && (
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="rounded-3 shadow"
                  style={{ width: '70px', height: '100px', objectFit: 'cover' }}
                />
              )}
              <div>
                <h4 className="text-white fw-bold mb-1">{selectedMovie?.title}</h4>
                <div className="text-secondary small mb-2">
                  {selectedMovie?.certification} • {selectedMovie?.genres?.join(', ')} • {selectedShowtime?.format || '2D'}
                </div>
                <div className="text-light small">
                  <strong>{selectedCinema?.name}</strong> ({selectedShowtime?.screen?.name || selectedShowtime?.screenId?.name || 'Screen 1'})
                </div>
                <div className="text-muted small">
                  {formatShowDate(selectedShowtime?.startTime)} at {formatShowTime(selectedShowtime?.startTime)}
                </div>
              </div>
            </div>

            {/* Selected Seats Itemized */}
            <div className="mb-3">
              <h6 className="text-white fw-bold mb-3">Selected Tickets ({selectedSeats.length})</h6>
              <div className="d-flex flex-column gap-2">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.seatId}
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-dark border border-secondary small"
                  >
                    <div>
                      <strong className="text-white me-2">Seat {seat.seatId}</strong>
                      <span className="badge bg-secondary text-uppercase">{seat.category}</span>
                    </div>
                    <div className="text-white fw-bold">₹{seat.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Price Breakdown & Checkout Button */}
        <div className="col-lg-5">
          <div className="glass-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3">Payment Summary</h5>

            <div className="d-flex flex-column gap-2 pb-3 mb-3 border-bottom border-secondary small text-secondary">
              <div className="d-flex justify-content-between">
                <span>Base Ticket Price ({selectedSeats.length} seats)</span>
                <span className="text-white">₹{pricing.basePrice}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Convenience Fee (₹30 / seat)</span>
                <span className="text-white">₹{pricing.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Integrated GST (18%)</span>
                <span className="text-white">₹{pricing.taxes}</span>
              </div>

              {promoApplied && (
                <div className="d-flex justify-content-between text-success fw-semibold">
                  <span>Promo Discount (20%)</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5 text-white fw-bold">Total Amount</span>
              <span className="fs-3 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                ₹{finalTotal}
              </span>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="mb-4">
              <label className="text-muted small mb-1 d-flex align-items-center gap-1">
                <Tag size={14} /> Have a Promo Code? (Use "IMOVIES20")
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control imovies-input uppercase"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button
                  type="submit"
                  className="btn btn-secondary-imovies btn-sm px-3"
                  disabled={promoApplied || !promoCode}
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            </form>

            {/* Security Guarantee */}
            <div className="d-flex align-items-center gap-2 p-2 rounded-2 bg-dark border border-secondary text-secondary small mb-4">
              <ShieldCheck size={20} color="var(--accent-emerald)" className="flex-shrink-0" />
              <span>Safe & instant mock checkout with real server-side seat verification.</span>
            </div>

            {/* Actions */}
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-primary-imovies py-3 w-100 fs-6 justify-content-center"
                disabled={remainingSeconds <= 0}
                onClick={() => navigate('/booking/checkout', { state: { finalTotal } })}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="btn btn-link text-secondary text-decoration-none small"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={14} className="me-1" /> Change Selected Seats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
