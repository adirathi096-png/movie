import React, { useEffect, useState } from 'react';
import { moviesAPI } from '../services/api.js';
import { MovieCard } from '../components/MovieCard.jsx';
import { Sparkles, Calendar } from 'lucide-react';

export const Upcoming = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const res = await moviesAPI.getMovies({ status: 'upcoming', limit: 20 });
        if (res.success) {
          setMovies(res.data.movies);
        }
      } catch (err) {
        console.error('Failed to fetch upcoming movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-warning small text-uppercase fw-bold tracking-wider mb-1">
          <Sparkles size={16} /> Coming Soon to Theatres
        </div>
        <h1 className="text-white fw-black tracking-tight mb-2">Upcoming Blockbusters</h1>
        <p className="text-secondary small">
          Stay ahead of the curve. Watch trailers and get ready for the biggest theatrical premieres.
        </p>
      </div>

      {loading ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="col">
              <div className="movie-card h-100 p-3 bg-dark opacity-50" style={{ minHeight: '380px' }}></div>
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-panel p-5 text-center text-secondary">
          No upcoming movies scheduled currently.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
