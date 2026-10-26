import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const SearchBar = ({
  searchTerm,
  setSearchTerm,
  selectedGenre,
  setSelectedGenre,
  genres = [],
  selectedLanguage,
  setSelectedLanguage,
  languages = [],
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="glass-card p-4 mb-4">
      <div className="row g-3 align-items-center">
        {/* Search Input */}
        <div className="col-lg-5 col-md-12">
          <div className="position-relative">
            <Search
              size={18}
              className="position-absolute top-50 translate-middle-y text-secondary"
              style={{ left: '14px' }}
            />
            <input
              type="text"
              id="search-input"
              className="form-control imovies-input ps-5 pe-5 w-100"
              placeholder="Search by movie title, director or actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-link position-absolute top-50 translate-middle-y text-secondary p-1"
                style={{ right: '12px' }}
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Genre Selector */}
        <div className="col-lg-3 col-sm-6">
          <select
            id="genre-filter"
            className="form-select imovies-input"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="col-lg-3 col-sm-6">
          <select
            id="sort-select"
            className="form-select imovies-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Release Date (Newest)</option>
            <option value="rating">Top Rated (IMDb)</option>
            <option value="title">Alphabetical (A - Z)</option>
          </select>
        </div>

        {/* Reset button if filtered */}
        {(searchTerm || selectedGenre !== 'All' || sortBy !== 'latest') && (
          <div className="col-lg-1 col-md-12 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary-imovies btn-sm w-100 py-2 text-nowrap"
              onClick={onReset}
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
