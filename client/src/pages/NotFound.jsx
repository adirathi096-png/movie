import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Home, Film } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
      <div className="glass-card p-5 text-center shadow-lg w-100" style={{ maxWidth: '560px' }}>
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-20 text-primary p-4 mb-4"
          style={{ width: '90px', height: '90px' }}
        >
          <Clapperboard size={48} />
        </div>

        <h1 className="display-4 fw-black text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          404
        </h1>
        <h3 className="text-white fw-bold mb-3">Scene Not Found</h3>
        <p className="text-secondary small mb-4 leading-relaxed">
          The reel you are looking for has either finished its theatrical run, been moved, or does not exist in our multiplex archive.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-primary-imovies btn-sm px-4">
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/now-showing" className="btn btn-secondary-imovies btn-sm px-4">
            <Film size={16} /> Now Showing
          </Link>
        </div>
      </div>
    </div>
  );
};
