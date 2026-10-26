import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI } from '../services/api.js';
import { SearchBar } from '../components/SearchBar.jsx';
import { MovieGrid } from '../components/MovieGrid.jsx';
import { Film } from 'lucide-react';

export const NowShowing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchTerm = searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || 'All';
  const sortBy = searchParams.get('sort') || 'latest';

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All' || (key === 'sort' && value === 'latest')) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await moviesAPI.getMovies({
          status: 'now_showing',
          search: searchTerm,
          genre: selectedGenre,
          sort: sortBy,
          limit: 24,
        });

        if (res.success) {
          setMovies(res.data.movies);
          if (res.data.filters?.availableGenres) {
            setGenres(res.data.filters.availableGenres);
          }
        }
      } catch (err) {
        console.error('Failed to fetch now showing movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchTerm, selectedGenre, sortBy]);

  const handleReset = () => {
    setSearchParams({});
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-primary small text-uppercase fw-bold tracking-wider mb-1">
          <Film size={16} /> Currently Playing
        </div>
        <h1 className="text-white fw-black tracking-tight mb-2">Now Showing in Theatres</h1>
        <p className="text-secondary small">
          Browse currently running blockbusters and reserve seats at top cinema screens near you.
        </p>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={(val) => updateParam('search', val)}
        selectedGenre={selectedGenre}
        setSelectedGenre={(val) => updateParam('genre', val)}
        genres={genres}
        sortBy={sortBy}
        setSortBy={(val) => updateParam('sort', val)}
        onReset={handleReset}
      />

      <MovieGrid
        movies={movies}
        loading={loading}
        emptyMessage="No movies match your current search or genre filter. Try resetting your filters."
      />
    </div>
  );
};
