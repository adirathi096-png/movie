import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, Clock, Info, X } from 'lucide-react';

export const MovieHero = ({ movie }) => {
  const [trailerModal, setTrailerModal] = useState(false);

  if (!movie) return null;

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

  const embedUrl = getYoutubeEmbed(movie.trailerUrl);

  return (
    <>
      <div
        className="cinematic-hero p-4 p-md-5 mb-5 shadow-lg position-relative"
        style={{
          backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
        }}
      >
        <div className="hero-overlay"></div>

        <div className="position-relative z-1 col-lg-7 col-md-9 text-white">
          {/* Badge line */}
          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span className="badge bg-primary text-uppercase px-3 py-2 fw-bold tracking-wider" style={{ fontSize: '0.75rem' }}>
              Featured Premiere
            </span>
            {movie.rating && (
              <span className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-1 px-2 py-1">
                <Star size={13} fill="#fbbf24" /> {movie.rating.toFixed(1)} / 10
              </span>
            )}
            <span className="badge bg-dark border border-secondary text-secondary">
              {movie.certification || 'UA'}
            </span>
            <span className="badge bg-dark border border-secondary text-secondary d-flex align-items-center gap-1">
              <Clock size={13} /> {formatDuration(movie.durationMinutes)}
            </span>
          </div>

          {/* Title */}
          <h1 className="display-4 fw-black text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
            {movie.title}
          </h1>

          {/* Synopsis */}
          <p className="text-secondary fs-6 leading-relaxed mb-4 text-clamp-3" style={{ maxWidth: '620px' }}>
            {movie.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <Link
              to={`/movie/${movie.slug || movie._id}`}
              className="btn btn-primary-imovies px-4 py-3 fs-6"
            >
              <Ticket size={20} /> Book Tickets Now
            </Link>

            {embedUrl && (
              <button
                type="button"
                className="btn btn-secondary-imovies px-4 py-3 fs-6"
                onClick={() => setTrailerModal(true)}
              >
                <Play size={18} fill="#ffffff" /> Watch Trailer
              </button>
            )}

            <Link
              to={`/movie/${movie.slug || movie._id}`}
              className="btn btn-link text-secondary text-decoration-none d-flex align-items-center gap-1"
            >
              <Info size={18} /> Details
            </Link>
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
    </>
  );
};
