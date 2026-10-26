import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { reservationsAPI } from '../services/api.js';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Selected seats state: array of seat objects { seatId, row, seatNumber, category, price }
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Active temporary reservation hold
  const [reservation, setReservation] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Countdown timer for seat hold
  useEffect(() => {
    if (!reservation || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto release expired hold
          setReservation((old) => (old ? { ...old, isExpired: true } : null));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation, remainingSeconds]);

  // Toggle seat selection
  const toggleSeat = (seatObj) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seatObj.seatId);
      if (exists) {
        return prev.filter((s) => s.seatId !== seatObj.seatId);
      }
      if (prev.length >= 10) {
        return prev; // Maximum 10 seats
      }
      return [...prev, seatObj];
    });
  };

  // Create temporary hold on backend
  const holdSeats = async (showtimeId) => {
    const seatIds = selectedSeats.map((s) => s.seatId);
    if (!showtimeId || seatIds.length === 0) {
      throw new Error('Please select at least one seat before proceeding.');
    }

    const res = await reservationsAPI.createReservation({
      showtimeId,
      seatIds,
    });

    if (res.success && res.data) {
      setReservation(res.data);
      setRemainingSeconds(res.data.remainingSeconds || 480);
      return res.data;
    }
  };

  // Release hold
  const releaseHold = useCallback(async () => {
    if (reservation?.reservationId) {
      try {
        await reservationsAPI.deleteReservation(reservation.reservationId);
      } catch {
        // Ignore error if already expired
      }
    }
    setReservation(null);
    setRemainingSeconds(0);
  }, [reservation]);

  // Reset entire booking context
  const resetBookingFlow = useCallback(async () => {
    await releaseHold();
    setSelectedMovie(null);
    setSelectedCinema(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
  }, [releaseHold]);

  // Derived pricing breakdown
  const basePrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  const convenienceFee = selectedSeats.length * 30;
  const taxes = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + convenienceFee + taxes;

  const pricing = {
    basePrice,
    convenienceFee,
    taxes,
    totalAmount,
  };

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        selectedCinema,
        setSelectedCinema,
        selectedShowtime,
        setSelectedShowtime,
        selectedDate,
        setSelectedDate,
        selectedSeats,
        setSelectedSeats,
        toggleSeat,
        reservation,
        remainingSeconds,
        pricing,
        holdSeats,
        releaseHold,
        resetBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
