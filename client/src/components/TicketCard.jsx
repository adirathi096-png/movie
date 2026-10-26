import React from 'react';
import { Ticket, Calendar, Clock, MapPin, Printer, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';

export const TicketCard = ({ booking, onCancel, showActions = true }) => {
  if (!booking) return null;

  const movie = booking.movieId || {};
  const cinema = booking.cinemaId || {};
  const screen = booking.screenId || {};
  const showtime = booking.showtimeId || {};

  const formatShowDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShowTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isConfirmed = booking.status === 'confirmed';
  const isCancelled = booking.status === 'cancelled';

  // Can be cancelled if confirmed and showtime > 2 hours away
  const canCancel =
    isConfirmed &&
    showtime.startTime &&
    (new Date(showtime.startTime).getTime() - Date.now()) / (1000 * 60 * 60) > 2;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-container my-3">
      {/* Top Header of Ticket */}
      <div className="p-4 p-md-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary rounded-3 p-2 text-white">
              <Ticket size={24} />
            </div>
            <div>
              <span className="text-muted small text-uppercase tracking-wider">E-Ticket Reference</span>
              <h4 className="text-white fw-black mb-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {booking.bookingReference}
              </h4>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge py-2 px-3 text-uppercase fw-bold ${
                isConfirmed ? 'bg-success' : isCancelled ? 'bg-danger' : 'bg-secondary'
              }`}
            >
              {booking.status}
            </span>
            <span className="badge bg-dark border border-secondary text-secondary py-2 px-3">
              {showtime.format || '2D'}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="row g-4 align-items-center">
          {/* Movie Details */}
          <div className="col-lg-8 col-md-7">
            <div className="d-flex gap-3 align-items-start">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="rounded-3 shadow flex-shrink-0 d-none d-sm-block"
                  style={{ width: '80px', height: '120px', objectFit: 'cover' }}
                />
              )}
              <div>
                <h3 className="text-white fw-bold mb-2">{movie.title || 'Movie Title'}</h3>
                <div className="d-flex flex-wrap gap-2 text-secondary small mb-3">
                  <span className="badge bg-dark border border-secondary text-secondary">
                    {movie.certification || 'UA'}
                  </span>
                  <span>{movie.genres?.join(', ')}</span>
                  <span>•</span>
                  <span>{movie.durationMinutes} mins</span>
                </div>

                <div className="d-flex flex-column gap-1 text-light small">
                  <div className="d-flex align-items-center gap-2">
                    <MapPin size={15} color="var(--accent-cyan)" />
                    <strong>{cinema.name}</strong> — {cinema.city}
                  </div>
                  <div className="text-muted ps-4">{screen.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Date, Time & QR representation */}
          <div className="col-lg-4 col-md-5 d-flex flex-column align-items-md-end text-md-end">
            <div className="d-flex align-items-center gap-2 text-white fs-5 fw-bold mb-1">
              <Calendar size={18} color="var(--accent-cyan)" />
              {formatShowDate(showtime.startTime)}
            </div>
            <div className="d-flex align-items-center gap-2 text-warning fs-5 fw-bold mb-3">
              <Clock size={18} />
              {formatShowTime(showtime.startTime)}
            </div>

            {/* Mock QR Pass */}
            <div className="bg-white p-2 rounded-2 shadow-sm d-inline-block">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ width: '80px', height: '80px', background: '#000000' }}
              >
                <QrCode size={64} color="#ffffff" />
              </div>
            </div>
            <span className="text-muted small mt-1" style={{ fontSize: '0.65rem' }}>Scan at Cinema Turnstile</span>
          </div>
        </div>
      </div>

      {/* Perforated Divider */}
      <div className="ticket-divider">
        <div className="ticket-dashed-line"></div>
      </div>

      {/* Bottom Stub of Ticket */}
      <div className="p-4 p-md-5 bg-dark">
        <div className="row g-4 align-items-center justify-content-between">
          {/* Seats Info */}
          <div className="col-md-7">
            <div className="text-muted small text-uppercase mb-2">Reserved Seats:</div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {booking.seats?.map((seat) => (
                <span
                  key={seat.seatId}
                  className="badge bg-primary text-white py-2 px-3 fs-6 fw-bold"
                >
                  {seat.seatId} <span className="small opacity-75">({seat.category})</span>
                </span>
              ))}
            </div>

            <div className="small text-secondary">
              Transaction ID: <span className="text-white font-monospace">{booking.payment?.transactionId}</span>
            </div>
          </div>

          {/* Pricing Total */}
          <div className="col-md-5 text-md-end">
            <div className="text-muted small">Total Paid</div>
            <div className="display-6 fw-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              ₹{booking.pricing?.totalAmount}
            </div>
            <div className="small text-muted">
              (Includes ₹{booking.pricing?.convenienceFee} convenience fee & ₹{booking.pricing?.taxes} GST)
            </div>
          </div>
        </div>

        {/* Cancellation Notice if cancelled */}
        {isCancelled && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mt-4 mb-0 small">
            <AlertTriangle size={18} />
            <div>
              Booking was cancelled on {new Date(booking.cancellation?.cancelledAt).toLocaleString()}.
              Refund of <strong>₹{booking.cancellation?.refundAmount}</strong> has been credited to original payment method.
            </div>
          </div>
        )}

        {/* Ticket Action Buttons */}
        {showActions && (
          <div className="d-flex align-items-center justify-content-between pt-4 mt-4 border-top border-secondary flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-secondary-imovies btn-sm"
              onClick={handlePrint}
            >
              <Printer size={16} /> Print / Save PDF
            </button>

            {canCancel && onCancel && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => onCancel(booking)}
              >
                Cancel Booking & Refund
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
