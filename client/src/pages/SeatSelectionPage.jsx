import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimesAPI } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SeatMap } from '../components/SeatMap.jsx';
import { ArrowLeft, Clock, Calendar, MapPin, Film, ShieldCheck } from 'lucide-react';

export const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const {
    selectedSeats,
    toggleSeat,
    setSelectedSeats,
    setSelectedMovie,
    setSelectedCinema,
    setSelectedShowtime,
    holdSeats,
    remainingSeconds,
  } = useBooking();

  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState(null);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await showtimesAPI.getShowtimeSeats(showtimeId);
      if (res.success && res.data) {
        setAvailability(res.data);
        if (res.data.showtime) {
          setSelectedMovie(res.data.showtime.movie);
          setSelectedCinema(res.data.showtime.cinema);
          setSelectedShowtime(res.data.showtime);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load seat availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [showtimeId]);

  const handleToggle = (seatObj) => {
    if (selectedSeats.length >= 10 && !selectedSeats.some((s) => s.seatId === seatObj.seatId)) {
      showToast('Maximum 10 seats allowed per booking.', 'warning');
      return;
    }
    toggleSeat(seatObj);
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      showToast('Please select at least 1 seat to continue.', 'warning');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in or create an account to reserve your seats.', 'info');
      navigate('/login', { state: { from: `/seat-selection/${showtimeId}` } });
      return;
    }

    try {
      setHolding(true);
      await holdSeats(showtimeId);
      showToast('Seats temporarily held for you! Complete your booking within the timer.', 'success');
      navigate('/booking/summary');
    } catch (err) {
      showToast(err.message || 'Seat reservation failed. Another user may have just held these seats.', 'error');
      // Refresh seats to display conflicting hold
      await fetchSeats();
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
        <div className="text-secondary small">Loading interactive cinema seat map...</div>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white mb-3">Unable to Load Seats</h3>
        <p className="text-secondary small mb-4">{error || 'This screening is currently unavailable.'}</p>
        <button className="btn btn-secondary-imovies" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Return to Showtimes
        </button>
      </div>
    );
  }

  const showtime = availability.showtime;
  const movie = showtime.movie || {};
  const cinema = showtime.cinema || {};
  const screen = showtime.screen || {};

  const formatShowDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatShowTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="container py-4">
      {/* Header with Movie & Screening Context */}
      <div className="glass-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-dark btn-sm text-secondary border-secondary p-2"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-primary text-uppercase px-2 py-1" style={{ fontSize: '0.7rem' }}>
                  {showtime.format || '2D'}
                </span>
                <span className="badge bg-dark border border-secondary text-secondary">
                  {movie.certification || 'UA'}
                </span>
              </div>
              <h3 className="text-white fw-bold mb-0">{movie.title}</h3>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
            <div className="d-flex align-items-center gap-1 text-light">
              <MapPin size={16} color="var(--accent-cyan)" />
              <strong>{cinema.name}</strong> ({screen.name})
            </div>
            <div className="d-flex align-items-center gap-1 text-white">
              <Calendar size={16} color="var(--accent-cyan)" />
              {formatShowDate(showtime.startTime)}
            </div>
            <div className="d-flex align-items-center gap-1 text-warning fw-bold">
              <Clock size={16} />
              {formatShowTime(showtime.startTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Seat Map Component */}
      <SeatMap
        seatLayout={availability.seatLayout}
        selectedSeats={selectedSeats}
        onToggleSeat={handleToggle}
        remainingSeconds={remainingSeconds}
        pricing={showtime.pricing}
        onProceed={handleProceed}
        loading={holding}
      />
    </div>
  );
};
