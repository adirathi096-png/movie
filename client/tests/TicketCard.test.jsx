import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { TicketCard } from '../src/components/TicketCard.jsx';

describe('TicketCard Component', () => {
  const sampleBooking = {
    _id: 'booking999',
    bookingReference: 'IMV-TEST77',
    status: 'confirmed',
    movieId: {
      title: 'Dune: Part Two',
      certification: 'UA',
      durationMinutes: 166,
      genres: ['Sci-Fi'],
    },
    cinemaId: {
      name: 'IMovies Grand IMAX',
      city: 'Mumbai',
    },
    screenId: {
      name: 'Audi 1 - Laser',
    },
    showtimeId: {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      format: 'IMAX 2D',
    },
    seats: [{ seatId: 'E4', category: 'premium', price: 350 }],
    pricing: {
      basePrice: 350,
      convenienceFee: 30,
      taxes: 63,
      totalAmount: 443,
    },
    payment: {
      transactionId: 'TXN-998877',
      status: 'paid',
    },
  };

  test('displays reference, movie title, seats, and total paid', () => {
    render(<TicketCard booking={sampleBooking} />);

    expect(screen.getByText('IMV-TEST77')).toBeInTheDocument();
    expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
    expect(screen.getByText(/E4/)).toBeInTheDocument();
    expect(screen.getByText('₹443')).toBeInTheDocument();
    expect(screen.getByText(/IMovies Grand IMAX/)).toBeInTheDocument();
  });
});
