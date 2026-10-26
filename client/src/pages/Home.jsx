import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api.js';
import { MovieHero } from '../components/MovieHero.jsx';
import { MovieGrid } from '../components/MovieGrid.jsx';
import { Film, Sparkles, ShieldCheck, Armchair, Volume2, ArrowRight } from 'lucide-react';

export const Home = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [nowShowingRes, upcomingRes] = await Promise.all([
          moviesAPI.getMovies({ status: 'now_showing', limit: 8 }),
          moviesAPI.getMovies({ status: 'upcoming', limit: 4 }),
        ]);

        if (nowShowingRes.success) {
          const movies = nowShowingRes.data.movies;
          setNowShowing(movies);
          const featured = movies.find((m) => m.featured) || movies[0];
          setFeaturedMovie(featured);
        }

        if (upcomingRes.success) {
          setUpcoming(upcomingRes.data.movies);
        }
      } catch (err) {
        console.error('Failed to load home movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="container py-4">
      {/* Cinematic Billboard Hero Section */}
      {featuredMovie && <MovieHero movie={featuredMovie} />}

      {/* Experience Highlights Strip */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="glass-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="bg-primary rounded-3 p-3 text-white flex-shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h6 className="text-white fw-bold mb-1">IMAX & Laser 4K</h6>
              <p className="text-secondary small mb-0">Crystal clear projection and immersive cinematic aspect ratios.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="bg-primary rounded-3 p-3 text-white flex-shrink-0">
              <Volume2 size={24} />
            </div>
            <div>
              <h6 className="text-white fw-bold mb-1">Dolby Atmos Sound</h6>
              <p className="text-secondary small mb-0">64-channel spatial audio moving in 3D space all around you.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 d-flex align-items-center gap-3 h-100">
            <div className="bg-primary rounded-3 p-3 text-white flex-shrink-0">
              <Armchair size={24} />
            </div>
            <div>
              <h6 className="text-white fw-bold mb-1">VIP Recliner Lounges</h6>
              <p className="text-secondary small mb-0">Plush motorized leather loungers with gourmet in-seat service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Now Showing Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 text-primary small text-uppercase fw-bold tracking-wider mb-1">
              <Film size={16} /> In Theatres Now
            </div>
            <h2 className="text-white fw-black tracking-tight mb-0">Now Showing</h2>
          </div>
          <Link
            to="/now-showing"
            className="btn btn-secondary-imovies btn-sm d-flex align-items-center gap-1"
          >
            Explore All <ArrowRight size={16} />
          </Link>
        </div>

        <MovieGrid movies={nowShowing} loading={loading} />
      </section>

      {/* Upcoming Releases Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 text-warning small text-uppercase fw-bold tracking-wider mb-1">
              <Sparkles size={16} /> Coming Soon
            </div>
            <h2 className="text-white fw-black tracking-tight mb-0">Anticipated Releases</h2>
          </div>
          <Link
            to="/upcoming"
            className="btn btn-secondary-imovies btn-sm d-flex align-items-center gap-1"
          >
            View Calendar <ArrowRight size={16} />
          </Link>
        </div>

        <MovieGrid movies={upcoming} loading={loading} emptyMessage="No upcoming releases scheduled currently." />
      </section>
    </div>
  );
};
