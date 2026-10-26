import React from 'react';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

export const ShowtimeSelector = ({
  showtimes = [],
  selectedDate,
  onSelectDate,
  selectedShowtime,
  onSelectShowtime,
}) => {
  // Generate next 5 dates starting from today
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayMonth = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push({ dateStr, dayName, dayMonth });
  }

  // Filter showtimes for the selected date
  const filteredShowtimes = showtimes.filter((st) => {
    if (!st.startTime) return false;
    const stDate = new Date(st.startTime).toISOString().split('T')[0];
    return stDate === selectedDate;
  });

  // Group showtimes by cinema
  const groupedByCinema = filteredShowtimes.reduce((acc, st) => {
    const cId = st.cinemaId?._id || st.cinemaId || 'default';
    if (!acc[cId]) {
      acc[cId] = {
        cinema: st.cinemaId,
        showtimes: [],
      };
    }
    acc[cId].showtimes.push(st);
    return acc;
  }, {});

  const formatTime = (timeStr) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="showtime-selector my-4">
      {/* Date Selection Strip */}
      <div className="mb-4">
        <label className="text-secondary small fw-semibold text-uppercase tracking-wider mb-2 d-flex align-items-center gap-1">
          <Calendar size={15} color="var(--accent-cyan)" /> Select Screening Date:
        </label>
        <div className="d-flex align-items-center gap-2 overflow-auto pb-2">
          {dates.map((item) => {
            const isActive = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                type="button"
                className={`date-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectDate(item.dateStr)}
              >
                <div className="small fw-bold">{item.dayName}</div>
                <div className="text-white fw-black" style={{ fontSize: '0.9rem' }}>
                  {item.dayMonth}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showtimes Grouped by Cinema */}
      <div className="showtimes-list">
        {Object.keys(groupedByCinema).length === 0 ? (
          <div className="glass-panel p-4 text-center text-secondary small">
            No showtimes scheduled for this date. Please pick another date above.
          </div>
        ) : (
          Object.values(groupedByCinema).map(({ cinema, showtimes: sList }) => (
            <div key={cinema?._id || Math.random()} className="glass-card p-4 mb-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom border-secondary">
                <div>
                  <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                    <MapPin size={18} color="var(--accent-cyan)" />
                    {cinema?.name || 'IMovies Cinema'}
                  </h5>
                  <div className="text-muted small ps-4">
                    {cinema?.address}, {cinema?.city}
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-1 ps-4 ps-md-0">
                  {cinema?.facilities?.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="badge bg-dark border border-secondary text-secondary"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes Grid */}
              <div className="d-flex flex-wrap gap-3">
                {sList.map((st) => {
                  const isSelected = selectedShowtime?._id === st._id;
                  const isPast = new Date(st.startTime) <= new Date();

                  return (
                    <button
                      key={st._id}
                      type="button"
                      disabled={isPast}
                      className={`btn p-2 text-start rounded-3 transition-all ${
                        isSelected
                          ? 'btn-primary border-cyan shadow glow-cyan'
                          : isPast
                          ? 'btn-dark opacity-50 cursor-not-allowed border-secondary'
                          : 'btn-dark border border-secondary hover-border-cyan'
                      }`}
                      style={{ minWidth: '145px' }}
                      onClick={() => !isPast && onSelectShowtime(st)}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold fs-6 text-white">{formatTime(st.startTime)}</span>
                        {isPast ? (
                          <span
                            className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25"
                            style={{ fontSize: '0.65rem' }}
                          >
                            Ended
                          </span>
                        ) : (
                          <span
                            className="badge bg-secondary text-uppercase"
                            style={{ fontSize: '0.65rem' }}
                          >
                            {st.format || '2D'}
                          </span>
                        )}
                      </div>
                      <div className="d-flex align-items-center justify-content-between small text-muted">
                        <span>{st.screenId?.name || 'Screen 1'}</span>
                        {isPast ? (
                          <span className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                            Closed
                          </span>
                        ) : (
                          <span className="text-warning fw-semibold">₹{st.pricing?.standard || 250}+</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
