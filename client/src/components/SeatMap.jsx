import React from 'react';
import { Armchair, Clock, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

export const SeatMap = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat,
  remainingSeconds = 0,
  maxSeats = 10,
  pricing = {},
  onProceed,
  loading = false,
}) => {
  const isSelected = (seatId) => selectedSeats.some((s) => s.seatId === seatId);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group rows by category
  const categories = ['vip', 'premium', 'standard'];
  const categoryLabels = {
    vip: { title: 'VIP Recliner Lounges', colorClass: 'tier-vip', iconColor: '#c084fc' },
    premium: { title: 'Premium Prime Rows', colorClass: 'tier-premium', iconColor: '#fbbf24' },
    standard: { title: 'Standard Classic Tier', colorClass: 'tier-standard', iconColor: '#38bdf8' },
  };

  return (
    <div className="seat-map-wrapper">
      {/* Curved Screen Indicator */}
      <div className="text-center mb-5">
        <div className="screen-curve"></div>
        <div className="screen-text">Screen This Way (Eyes Here)</div>
      </div>

      {/* Seat Layout by Category */}
      <div className="seat-grid-container mb-5 overflow-auto pb-3">
        {categories.map((catKey) => {
          const categoryRows = seatLayout.filter((r) => r.category === catKey);
          if (categoryRows.length === 0) return null;

          const meta = categoryLabels[catKey] || { title: catKey, colorClass: 'tier-standard' };
          const categoryPrice = categoryRows[0]?.basePrice || pricing[catKey] || 0;

          return (
            <div key={catKey} className="mb-4">
              {/* Category Header */}
              <div className="d-flex align-items-center justify-content-between mb-3 px-3">
                <span className={`tier-tag ${meta.colorClass}`}>
                  {meta.title} — ₹{categoryPrice}
                </span>
                <span className="small text-muted">
                  Max {maxSeats} seats per booking
                </span>
              </div>

              {/* Rows */}
              {categoryRows.map((rowObj) => (
                <div key={rowObj.row} className="seat-row">
                  {/* Left Row Label */}
                  <span className="seat-row-label">{rowObj.row}</span>

                  {/* Seat Items */}
                  <div className="d-flex align-items-center gap-2">
                    {rowObj.seats.map((seat) => {
                      const selected = isSelected(seat.seatId);
                      const isBooked = seat.state === 'booked';
                      const isReserved = seat.state === 'reserved';
                      const isBlocked = seat.state === 'blocked';

                      let stateClass = '';
                      if (selected) stateClass = 'seat-selected';
                      else if (isBooked) stateClass = 'seat-booked';
                      else if (isReserved) stateClass = 'seat-reserved';
                      else if (isBlocked) stateClass = 'seat-blocked';

                      let titleText = `Seat ${seat.seatId} (${rowObj.category.toUpperCase()} - ₹${seat.price})`;
                      if (isBooked) titleText = `Seat ${seat.seatId} - Booked`;
                      if (isReserved) titleText = `Seat ${seat.seatId} - Temporarily Held by Another Customer`;

                      return (
                        <button
                          key={seat.seatId}
                          type="button"
                          className={`cinema-seat ${stateClass}`}
                          title={titleText}
                          disabled={isBooked || isReserved || isBlocked || loading}
                          onClick={() => onToggleSeat(seat)}
                          aria-label={`Seat ${seat.seatId}, ${rowObj.category}, price ₹${seat.price}`}
                        >
                          {selected ? <Check size={14} strokeWidth={3} /> : seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Row Label */}
                  <span className="seat-row-label">{rowObj.row}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Seat Map Legend */}
      <div className="glass-panel p-3 mb-4 d-flex flex-wrap align-items-center justify-content-center gap-4 text-secondary small">
        <div className="d-flex align-items-center gap-2">
          <div className="cinema-seat" style={{ width: '22px', height: '22px', cursor: 'default' }}></div>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div
            className="cinema-seat seat-selected"
            style={{ width: '22px', height: '22px', cursor: 'default' }}
          ></div>
          <span className="text-white fw-semibold">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div
            className="cinema-seat seat-reserved"
            style={{ width: '22px', height: '22px', cursor: 'default' }}
          ></div>
          <span>Held by Another (Locked)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div
            className="cinema-seat seat-booked"
            style={{ width: '22px', height: '22px', cursor: 'default' }}
          ></div>
          <span>Sold Out</span>
        </div>
      </div>

      {/* Floating Sticky Bottom Selection Summary Bar */}
      {selectedSeats.length > 0 && (
        <div className="glass-card p-3 p-md-4 border border-primary glow-cyan sticky-bottom mb-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="text-white fw-bold">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected:
                </span>
                <div className="d-flex flex-wrap gap-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.seatId}
                      className="badge bg-primary text-white py-1 px-2"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {s.seatId} (₹{s.price})
                    </span>
                  ))}
                </div>
              </div>

              {/* Timer Notification if hold active */}
              {remainingSeconds > 0 && (
                <div className="d-flex align-items-center gap-1 text-warning small">
                  <Clock size={14} />
                  <span>
                    Temporary hold expires in:{' '}
                    <strong className="text-white">{formatTimer(remainingSeconds)}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-4">
              <div className="text-end">
                <div className="text-muted small">Total Payable</div>
                <div className="fs-4 fw-bold text-white">
                  ₹{selectedSeats.reduce((acc, s) => acc + s.price, 0)}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary-imovies px-4 py-2 fs-6 text-nowrap"
                onClick={onProceed}
                disabled={loading}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
