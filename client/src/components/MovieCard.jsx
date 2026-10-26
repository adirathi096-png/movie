import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const posterFallback = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="movie-card h-100 d-flex flex-column">
      {/* Poster Image & Badges */}
      <div className="movie-poster-wrap">
        <img
          src={movie.posterUrl || posterFallback}
          alt={movie.title}
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = posterFallback;
          }}
        />
        <div className="movie-poster-overlay"></div>

        {/* Rating Badge */}
        {movie.rating ? (
          <div className="rating-badge">
            <Star size={13} fill="#fbbf24" color="#fbbf24" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        ) : null}

        {/* Certification */}
        {movie.certification && (
          <div className="cert-badge">
            {movie.certification}
          </div>
        )}
      </div>

      {/* Movie Details Content */}
      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <h5 className="text-white text-truncate mb-1 fw-bold" title={movie.title}>
            <Link to={`/movie/${movie.slug || movie._id}`} className="text-white text-decoration-none hover-cyan">
              {movie.title}
            </Link>
          </h5>

          <div className="d-flex align-items-center gap-2 small text-muted mb-2">
            <span className="d-flex align-items-center gap-1">
              <Clock size={13} /> {formatDuration(movie.durationMinutes)}
            </span>
            <span>•</span>
            <span className="text-truncate">{movie.languages?.join(', ') || 'English'}</span>
          </div>

          <div className="d-flex flex-wrap gap-1 mb-3">
            {movie.genres?.slice(0, 3).map((g) => (
              <span
                key={g}
                className="badge bg-dark border border-secondary text-secondary"
                style={{ fontSize: '0.7rem', fontWeight: 500 }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <Link
            to={`/movie/${movie.slug || movie._id}`}
            className="btn btn-primary-imovies w-100 py-2 small"
          >
            <Ticket size={16} />
            {movie.status === 'upcoming' ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>
    </div>
  );
};
