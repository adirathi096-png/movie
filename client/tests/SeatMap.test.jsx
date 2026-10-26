import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { SeatMap } from '../src/components/SeatMap.jsx';

describe('SeatMap Component', () => {
  const sampleLayout = [
    {
      row: 'A',
      category: 'standard',
      basePrice: 200,
      seats: [
        { seatId: 'A1', seatNumber: 1, state: 'available', price: 200 },
        { seatId: 'A2', seatNumber: 2, state: 'booked', price: 200 },
        { seatId: 'A3', seatNumber: 3, state: 'reserved', price: 200 },
      ],
    },
  ];

  test('renders curved screen label and seat categories', () => {
    render(
      <SeatMap
        seatLayout={sampleLayout}
        selectedSeats={[]}
        onToggleSeat={() => {}}
      />
    );

    expect(screen.getByText(/Screen This Way/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Classic Tier/i)).toBeInTheDocument();
  });

  test('calls onToggleSeat when an available seat is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <SeatMap
        seatLayout={sampleLayout}
        selectedSeats={[]}
        onToggleSeat={handleToggle}
      />
    );

    const availableSeat = screen.getByLabelText(/Seat A1/i);
    fireEvent.click(availableSeat);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  test('disables booked and reserved seats from selection', () => {
    const handleToggle = vi.fn();
    render(
      <SeatMap
        seatLayout={sampleLayout}
        selectedSeats={[]}
        onToggleSeat={handleToggle}
      />
    );

    const bookedSeat = screen.getByLabelText(/Seat A2/i);
    expect(bookedSeat).toBeDisabled();

    const reservedSeat = screen.getByLabelText(/Seat A3/i);
    expect(reservedSeat).toBeDisabled();
  });
});
