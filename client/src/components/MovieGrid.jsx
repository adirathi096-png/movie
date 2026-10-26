import React from 'react';
import { MovieCard } from './MovieCard.jsx';
import { Film } from 'lucide-react';

export const MovieGrid = ({ movies, loading, emptyMessage = 'No movies found.' }) => {
  if (loading) {
    return (
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="col">
            <div className="movie-card h-100 p-0 border border-secondary" style={{ minHeight: '380px' }}>
              <div
                className="bg-secondary opacity-25 w-100"
                style={{ aspectRatio: '2/3', animation: 'pulse 1.5s infinite' }}
              ></div>
              <div className="p-3">
                <div className="bg-secondary opacity-25 rounded w-75 mb-2" style={{ height: '18px' }}></div>
                <div className="bg-secondary opacity-25 rounded w-50 mb-3" style={{ height: '14px' }}></div>
                <div className="bg-secondary opacity-25 rounded w-100" style={{ height: '36px' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-5 glass-panel my-4">
        <Film size={48} className="text-secondary mb-3 opacity-50" />
        <h4 className="text-white fw-bold mb-2">No Movies Found</h4>
        <p className="text-secondary small mb-0">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
      {movies.map((movie) => (
        <div key={movie._id} className="col">
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
};
