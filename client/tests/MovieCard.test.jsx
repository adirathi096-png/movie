import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { MovieCard } from '../src/components/MovieCard.jsx';

describe('MovieCard Component', () => {
  const sampleMovie = {
    _id: 'movie123',
    title: 'Interstellar',
    slug: 'interstellar',
    rating: 8.7,
    certification: 'UA',
    durationMinutes: 169,
    genres: ['Sci-Fi', 'Adventure'],
    posterUrl: 'https://example.com/poster.jpg',
    status: 'now_showing',
  };

  test('renders movie title, certification and duration', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={sampleMovie} />
      </BrowserRouter>
    );

    expect(screen.getByText('Interstellar')).toBeInTheDocument();
    expect(screen.getByText('UA')).toBeInTheDocument();
    expect(screen.getByText('8.7')).toBeInTheDocument();
    expect(screen.getByText(/2h 49m/)).toBeInTheDocument();
    expect(screen.getByText('Book Tickets')).toBeInTheDocument();
  });
});
