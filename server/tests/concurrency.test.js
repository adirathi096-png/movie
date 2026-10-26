import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Movie } from '../src/models/Movie.js';
import { Cinema } from '../src/models/Cinema.js';
import { Screen } from '../src/models/Screen.js';
import { Showtime } from '../src/models/Showtime.js';
import { Booking } from '../src/models/Booking.js';
import { SeatReservation } from '../src/models/SeatReservation.js';

let app;
let user1Token, user1Id;
let user2Token, user2Id;
let showtime;

beforeAll(async () => {
  await connectDB();
  app = createApp();

  // Clean DB
  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Cinema.deleteMany({}),
    Screen.deleteMany({}),
    Showtime.deleteMany({}),
    Booking.deleteMany({}),
    SeatReservation.deleteMany({}),
  ]);

  // Create User 1 & 2
  const hash1 = await User.hashPassword('Pass@123');
  const u1 = await User.create({ name: 'User One', email: 'user1@imovies.com', passwordHash: hash1 });
  user1Id = u1._id;

  const hash2 = await User.hashPassword('Pass@123');
  const u2 = await User.create({ name: 'User Two', email: 'user2@imovies.com', passwordHash: hash2 });
  user2Id = u2._id;

  const login1 = await request(app).post('/api/v1/auth/login').send({ email: 'user1@imovies.com', password: 'Pass@123' });
  user1Token = login1.body.data.token;

  const login2 = await request(app).post('/api/v1/auth/login').send({ email: 'user2@imovies.com', password: 'Pass@123' });
  user2Token = login2.body.data.token;

  // Create Movie, Cinema, Screen, Showtime
  const movie = await Movie.create({
    title: 'Interstellar IMAX',
    slug: 'interstellar-imax',
    synopsis: 'A team of explorers travel through a wormhole in space.',
    posterUrl: 'https://example.com/poster.jpg',
    genres: ['Sci-Fi'],
    durationMinutes: 169,
    releaseDate: new Date(),
  });

  const cinema = await Cinema.create({
    name: 'IMovies Metropolis',
    address: 'City Center',
    city: 'Mumbai',
  });

  const screen = await Screen.create({
    cinemaId: cinema._id,
    name: 'Audi 1',
    format: 'IMAX 2D',
    totalSeats: 20,
    seatLayout: [
      {
        row: 'A',
        category: 'standard',
        priceMultiplier: 1.0,
        seats: [
          { seatId: 'A1', seatNumber: 1, isAccessible: false, isBlocked: false },
          { seatId: 'A2', seatNumber: 2, isAccessible: false, isBlocked: false },
          { seatId: 'A3', seatNumber: 3, isAccessible: false, isBlocked: false },
        ],
      },
      {
        row: 'B',
        category: 'premium',
        priceMultiplier: 1.3,
        seats: [
          { seatId: 'B1', seatNumber: 1, isAccessible: false, isBlocked: false },
          { seatId: 'B2', seatNumber: 2, isAccessible: false, isBlocked: false },
        ],
      },
    ],
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  showtime = await Showtime.create({
    movieId: movie._id,
    cinemaId: cinema._id,
    screenId: screen._id,
    startTime: tomorrow,
    endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
    pricing: { standard: 200, premium: 300, vip: 450 },
    status: 'active',
  });
});

afterAll(async () => {
  await disconnectDB();
});

describe('Seat Availability & Concurrency Safety', () => {
  test('User 1 reserves seat B1 successfully', async () => {
    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        showtimeId: showtime._id,
        seatIds: ['B1'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.seatIds).toContain('B1');
    expect(res.body.data.reservationId).toBeDefined();
  });

  test('User 2 attempting to reserve the same seat B1 receives 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        showtimeId: showtime._id,
        seatIds: ['B1'],
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/held by another customer/i);
  });

  test('User 1 can confirm booking for held seat B1', async () => {
    const holdRes = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        showtimeId: showtime._id,
        seatIds: ['B1'],
      });

    const reservationId = holdRes.body.data.reservationId;

    const bookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        showtimeId: showtime._id,
        reservationId,
        seatIds: ['B1'],
        paymentMethod: 'demo_checkout',
      });

    expect(bookRes.status).toBe(201);
    expect(bookRes.body.success).toBe(true);
    expect(bookRes.body.data.booking.bookingReference).toBeDefined();
    expect(bookRes.body.data.booking.status).toBe('confirmed');
  });

  test('After confirmation, seat B1 cannot be booked or reserved by User 2', async () => {
    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        showtimeId: showtime._id,
        seatIds: ['B1'],
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already booked/i);
  });

  test('User 1 can view booking in history and cancel with refund', async () => {
    const myBookingsRes = await request(app)
      .get('/api/v1/bookings/my')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(myBookingsRes.status).toBe(200);
    expect(myBookingsRes.body.data.bookings.length).toBeGreaterThan(0);

    const bookingId = myBookingsRes.body.data.bookings[0]._id;

    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ reason: 'Schedule changed' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.status).toBe('cancelled');
    expect(cancelRes.body.data.refundAmount).toBeGreaterThan(0);
  });

  test('After cancellation, seat B1 is freed and User 2 can now reserve it', async () => {
    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        showtimeId: showtime._id,
        seatIds: ['B1'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
