import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, showtimesAPI } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import { ShowtimeSelector } from '../components/ShowtimeSelector.jsx';
import { Star, Clock, Calendar, Play, Ticket, MapPin, X, ArrowLeft } from 'lucide-react';

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedCinema, setSelectedShowtime, selectedDate, setSelectedDate } = useBooking();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [trailerModal, setTrailerModal] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Movie Data
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);

        let res;
        // Check if ID is 24 hex characters or a slug
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          res = await moviesAPI.getMovieById(id);
        } else {
          res = await moviesAPI.getMovieBySlug(id);
        }

        if (res.success && res.data.movie) {
          setMovie(res.data.movie);
          setSelectedMovie(res.data.movie);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, setSelectedMovie]);

  // Fetch Showtimes for this Movie
  useEffect(() => {
    if (!movie?._id) return;

    const fetchShowtimes = async () => {
      try {
        setShowtimesLoading(true);
        const res = await showtimesAPI.getShowtimes({
          movieId: movie._id,
        });
        if (res.success) {
          setShowtimes(res.data.showtimes);
        }
      } catch (err) {
        console.error('Failed to load showtimes:', err);
      } finally {
        setShowtimesLoading(false);
      }
    };

    fetchShowtimes();
  }, [movie]);

  const handleSelectShowtime = (st) => {
    setSelectedMovie(movie);
    setSelectedCinema(st.cinemaId);
    setSelectedShowtime(st);
    navigate(`/seat-selection/${st._id}`);
  };

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  const embedUrl = movie ? getYoutubeEmbed(movie.trailerUrl) : null;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
        <div className="text-secondary small">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white mb-3">Movie Not Found</h3>
        <p className="text-secondary small mb-4">{error || 'The requested movie does not exist.'}</p>
        <button className="btn btn-secondary-imovies" onClick={() => navigate('/now-showing')}>
          <ArrowLeft size={16} /> Return to Movies
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Backdrop Banner */}
      <div
        className="position-relative w-100"
        style={{
          minHeight: '440px',
          backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="hero-overlay"></div>

        <div className="container position-relative py-5 z-1">
          <button
            className="btn btn-sm btn-dark bg-opacity-75 text-secondary border-secondary mb-4 d-inline-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="row g-4 align-items-end">
            {/* Poster Card */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div
                className="rounded-4 overflow-hidden shadow-lg border border-secondary mx-auto"
                style={{ maxWidth: '260px', aspectRatio: '2/3' }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>

            {/* Info details */}
            <div className="col-md-8 col-lg-9 text-white">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-primary text-uppercase px-2 py-1 small">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Upcoming Release'}
                </span>
                {movie.rating ? (
                  <span className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-1 px-2 py-1">
                    <Star size={13} fill="#fbbf24" /> {movie.rating.toFixed(1)} IMDb
                  </span>
                ) : null}
                <span className="badge bg-dark border border-secondary text-secondary">
                  {movie.certification}
                </span>
                <span className="badge bg-dark border border-secondary text-secondary d-flex align-items-center gap-1">
                  <Clock size={13} /> {formatDuration(movie.durationMinutes)}
                </span>
              </div>

              <h1 className="display-4 fw-black text-white mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((g) => (
                  <span key={g} className="badge bg-dark border border-secondary text-secondary px-3 py-2">
                    {g}
                  </span>
                ))}
              </div>

              {embedUrl && (
                <button
                  type="button"
                  className="btn btn-secondary-imovies px-4 py-2 d-inline-flex align-items-center gap-2"
                  onClick={() => setTrailerModal(true)}
                >
                  <Play size={18} fill="#ffffff" /> Watch Official Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Showtimes Booking Area */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Left Column: Synopsis, Cast, Director */}
          <div className="col-lg-8">
            {/* Showtimes Booking Component if Now Showing */}
            {movie.status === 'now_showing' && (
              <section className="mb-5">
                <div className="d-flex align-items-center gap-2 text-primary small text-uppercase fw-bold tracking-wider mb-2">
                  <Ticket size={18} /> Book Tickets
                </div>
                <h3 className="text-white fw-bold mb-4">Available Showtimes & Cinema Theatres</h3>

                {showtimesLoading ? (
                  <div className="glass-panel p-5 text-center text-secondary">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading cinema schedules...
                  </div>
                ) : (
                  <ShowtimeSelector
                    showtimes={showtimes}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onSelectShowtime={handleSelectShowtime}
                  />
                )}
              </section>
            )}

            {/* Synopsis */}
            <div className="glass-card p-4 mb-4">
              <h4 className="text-white fw-bold mb-3">About the Movie</h4>
              <p className="text-secondary leading-relaxed fs-6 mb-0">{movie.synopsis}</p>
            </div>

            {/* Cast & Director */}
            {(movie.director || (movie.cast && movie.cast.length > 0)) && (
              <div className="glass-card p-4">
                <h4 className="text-white fw-bold mb-3">Cast & Crew</h4>
                {movie.director && (
                  <div className="mb-3">
                    <span className="text-muted small text-uppercase">Director:</span>
                    <div className="text-white fw-semibold">{movie.director}</div>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <span className="text-muted small text-uppercase">Starring:</span>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {movie.cast.map((actor) => (
                        <span
                          key={actor}
                          className="badge bg-dark border border-secondary text-light px-3 py-2 small"
                        >
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Cinema Experience Perks */}
          <div className="col-lg-4">
            <div className="glass-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3">Cinema Features</h5>
              <ul className="list-unstyled d-flex flex-column gap-3 text-secondary small mb-0">
                <li className="d-flex align-items-start gap-2">
                  <span className="badge bg-primary p-1 rounded-circle mt-1">•</span>
                  <div>
                    <strong className="text-white">IMAX with Laser:</strong> Unrivaled brightness and color saturation.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="badge bg-primary p-1 rounded-circle mt-1">•</span>
                  <div>
                    <strong className="text-white">Dolby Atmos:</strong> Object-based sound design for total immersion.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="badge bg-primary p-1 rounded-circle mt-1">•</span>
                  <div>
                    <strong className="text-white">Easy Cancellation:</strong> Cancel up to 2 hours before showtime for a direct refund.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerModal && embedUrl && (
        <div
          className="position-fixed inset-0 bg-black bg-opacity-90 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 3000, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="position-relative w-100" style={{ maxWidth: '900px' }}>
            <button
              className="btn btn-dark position-absolute top-0 end-0 m-2 rounded-circle p-2 text-white border border-secondary shadow"
              style={{ zIndex: 10 }}
              onClick={() => setTrailerModal(false)}
            >
              <X size={20} />
            </button>
            <div className="ratio ratio-16x9 rounded-4 overflow-hidden border border-secondary shadow-lg">
              <iframe
                src={embedUrl}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
