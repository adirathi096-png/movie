import React, { useEffect, useState } from 'react';
import { showtimesAPI, moviesAPI, cinemasAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Calendar, Plus, Trash2, ArrowLeft, Clock, Film, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTimeStr, setStartTimeStr] = useState('19:00');
  const [standardPrice, setStandardPrice] = useState(250);
  const [premiumPrice, setPremiumPrice] = useState(350);
  const [vipPrice, setVipPrice] = useState(500);
  const [format, setFormat] = useState('2D');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, mRes, cRes] = await Promise.all([
        showtimesAPI.getShowtimes({ limit: 50 }),
        moviesAPI.getMovies({ status: 'now_showing', limit: 50 }),
        cinemasAPI.getCinemas({}),
      ]);

      if (stRes.success) setShowtimes(stRes.data.showtimes);
      if (mRes.success) {
        setMovies(mRes.data.movies);
        if (mRes.data.movies.length > 0) setSelectedMovieId(mRes.data.movies[0]._id);
      }
      if (cRes.success) {
        setCinemas(cRes.data.cinemas);
        if (cRes.data.cinemas.length > 0) {
          setSelectedCinemaId(cRes.data.cinemas[0]._id);
          fetchScreensForCinema(cRes.data.cinemas[0]._id);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load showtimes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchScreensForCinema = async (cinemaId) => {
    try {
      const res = await cinemasAPI.getCinemaScreens(cinemaId);
      if (res.success && res.data.screens) {
        setScreens(res.data.screens);
        if (res.data.screens.length > 0) {
          setSelectedScreenId(res.data.screens[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCinemaChange = (e) => {
    const cId = e.target.value;
    setSelectedCinemaId(cId);
    fetchScreensForCinema(cId);
  };

  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    if (!selectedMovieId || !selectedCinemaId || !selectedScreenId) {
      showToast('Please select movie, cinema, and screen.', 'warning');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTimeStr}:00`);
    const movieObj = movies.find((m) => m._id === selectedMovieId);
    const duration = movieObj?.durationMinutes || 150;
    const endDateTime = new Date(startDateTime.getTime() + (duration + 20) * 60 * 1000);

    const payload = {
      movieId: selectedMovieId,
      cinemaId: selectedCinemaId,
      screenId: selectedScreenId,
      startTime: startDateTime,
      endTime: endDateTime,
      format,
      pricing: {
        standard: Number(standardPrice),
        premium: Number(premiumPrice),
        vip: Number(vipPrice),
      },
    };

    try {
      setSubmitting(true);
      await showtimesAPI.createShowtime(payload);
      showToast('Showtime scheduled successfully!', 'success');
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Scheduling conflict or error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShowtime = async (id) => {
    try {
      await showtimesAPI.deleteShowtime(id);
      showToast('Showtime cancelled.', 'success');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel showtime', 'error');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <ArrowLeft size={14} className="me-1" /> Back to Dashboard
          </Link>
          <h1 className="text-white fw-black tracking-tight mb-1">Showtime Scheduling</h1>
          <p className="text-secondary small mb-0">Create screening sessions with automatic collision detection.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary-imovies btn-sm"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} /> Schedule New Showtime
        </button>
      </div>

      {/* Showtimes Table */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-5 text-secondary">
            <div className="spinner-border text-warning me-2"></div>
            Loading schedules...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-muted small text-uppercase">
                  <th>Movie</th>
                  <th>Cinema & Screen</th>
                  <th>Date & Time</th>
                  <th>Format</th>
                  <th>Standard Price</th>
                  <th>Premium Price</th>
                  <th>VIP Price</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <div className="text-white fw-bold small">{st.movieId?.title || 'Unknown'}</div>
                    </td>
                    <td>
                      <div className="text-white small">{st.cinemaId?.name}</div>
                      <div className="text-muted small">{st.screenId?.name}</div>
                    </td>
                    <td>
                      <div className="text-white small">
                        {new Date(st.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-warning small fw-bold">
                        {new Date(st.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-uppercase">{st.format}</span>
                    </td>
                    <td className="small text-white">₹{st.pricing?.standard}</td>
                    <td className="small text-white">₹{st.pricing?.premium}</td>
                    <td className="small text-white">₹{st.pricing?.vip}</td>
                    <td>
                      <span className={`badge ${st.status === 'active' ? 'bg-success' : 'bg-danger'} small`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 px-2"
                        onClick={() => handleDeleteShowtime(st._id)}
                        title="Cancel Showtime"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Showtime Modal */}
      {modalOpen && (
        <div
          className="position-fixed inset-0 bg-black bg-opacity-75 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 2500, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="glass-card p-4 shadow-lg w-100" style={{ maxWidth: '540px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary">
              <h5 className="text-white fw-bold mb-0">Schedule Screening</h5>
              <button
                type="button"
                className="btn btn-link text-secondary p-0"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateShowtime}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-secondary small mb-1">Movie</label>
                  <select
                    className="form-select imovies-input"
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    required
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.durationMinutes} mins)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Cinema Venue</label>
                  <select
                    className="form-select imovies-input"
                    value={selectedCinemaId}
                    onChange={handleCinemaChange}
                    required
                  >
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Auditorium Screen</label>
                  <select
                    className="form-select imovies-input"
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    required
                  >
                    {screens.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.format})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Screening Date</label>
                  <input
                    type="date"
                    className="form-control imovies-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Start Time</label>
                  <input
                    type="time"
                    className="form-control imovies-input"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-secondary small mb-1">Standard (₹)</label>
                  <input
                    type="number"
                    className="form-control imovies-input"
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-secondary small mb-1">Premium (₹)</label>
                  <input
                    type="number"
                    className="form-control imovies-input"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-secondary small mb-1">VIP (₹)</label>
                  <input
                    type="number"
                    className="form-control imovies-input"
                    value={vipPrice}
                    onChange={(e) => setVipPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary-imovies btn-sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-imovies btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Checking Schedule...' : 'Schedule Showtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
