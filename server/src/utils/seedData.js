import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';
import { Showtime } from '../models/Showtime.js';
import { Booking } from '../models/Booking.js';
import { SeatReservation } from '../models/SeatReservation.js';
import { connectDB, disconnectDB } from '../config/db.js';

export const seedInitialData = async () => {
  console.log('[Seed] Starting database seeding process...');

  // 1. Clean existing records
  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Cinema.deleteMany({}),
    Screen.deleteMany({}),
    Showtime.deleteMany({}),
    Booking.deleteMany({}),
    SeatReservation.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing collections.');

  // 2. Create Users
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@imovies.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';
  const userEmail = process.env.USER_SEED_EMAIL || 'user@imovies.com';
  const userPassword = process.env.USER_SEED_PASSWORD || 'User@12345';

  const adminHash = await User.hashPassword(adminPassword);
  const userHash = await User.hashPassword(userPassword);

  const [adminUser, demoUser] = await User.create([
    {
      name: 'IMovies Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash: adminHash,
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Aditya Demo User',
      email: userEmail.toLowerCase(),
      passwordHash: userHash,
      role: 'user',
      phone: '+91 91234 56789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  ]);
  console.log('[Seed] Seeded Users: 1 Admin, 1 Regular Demo User.');

  // 3. Create Sample Movies
  const movieDocs = [
    {
      title: 'Dune: Part Two',
      slug: 'dune-part-two',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      genres: ['Sci-Fi', 'Adventure', 'Action'],
      durationMinutes: 166,
      languages: ['English', 'Hindi'],
      releaseDate: new Date('2024-03-01'),
      certification: 'UA',
      status: 'now_showing',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      rating: 8.6,
      ratingSource: 'IMDb',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
      featured: true,
    },
    {
      title: 'Oppenheimer',
      slug: 'oppenheimer',
      synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the profound moral dilemmas and geopolitical fallout of the Manhattan Project.',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      genres: ['Biography', 'Drama', 'History'],
      durationMinutes: 180,
      languages: ['English'],
      releaseDate: new Date('2023-07-21'),
      certification: 'A',
      status: 'now_showing',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      rating: 8.9,
      ratingSource: 'IMDb',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
      featured: true,
    },
    {
      title: 'Interstellar',
      slug: 'interstellar',
      synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans through a newly discovered wormhole.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      durationMinutes: 169,
      languages: ['English', 'Hindi'],
      releaseDate: new Date('2014-11-07'),
      certification: 'UA',
      status: 'now_showing',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      rating: 8.7,
      ratingSource: 'IMDb',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      featured: true,
    },
    {
      title: 'The Dark Knight',
      slug: 'the-dark-knight',
      synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
      genres: ['Action', 'Crime', 'Drama'],
      durationMinutes: 152,
      languages: ['English', 'Hindi'],
      releaseDate: new Date('2008-07-18'),
      certification: 'UA',
      status: 'now_showing',
      trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      rating: 9.0,
      ratingSource: 'IMDb',
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
      featured: false,
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      slug: 'spider-man-across-the-spider-verse',
      synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
      genres: ['Animation', 'Action', 'Adventure'],
      durationMinutes: 140,
      languages: ['English', 'Hindi', 'Tamil'],
      releaseDate: new Date('2023-06-02'),
      certification: 'U',
      status: 'now_showing',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      rating: 8.7,
      ratingSource: 'IMDb',
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
      featured: false,
    },
    {
      title: 'Gladiator II',
      slug: 'gladiator-ii',
      synopsis: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home. With rage in his heart and the future of the empire at stake, he looks to the past to find strength.',
      posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
      genres: ['Action', 'Adventure', 'Drama'],
      durationMinutes: 148,
      languages: ['English'],
      releaseDate: new Date('2024-11-22'),
      certification: 'A',
      status: 'upcoming',
      trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
      rating: 8.2,
      ratingSource: 'IMDb',
      director: 'Ridley Scott',
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      featured: false,
    },
    {
      title: 'Avatar: Fire and Ash',
      slug: 'avatar-fire-and-ash',
      synopsis: 'Jake Sully and Neytiri encounter a new, aggressive volcanic clan of Na\'vi known as the "Ash People," challenging their understanding of Pandora\'s complex ecological balance and familial protection.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
      genres: ['Sci-Fi', 'Action', 'Adventure'],
      durationMinutes: 190,
      languages: ['English', 'Hindi'],
      releaseDate: new Date('2025-12-19'),
      certification: 'UA',
      status: 'upcoming',
      trailerUrl: '',
      rating: 8.5,
      ratingSource: 'IMDb',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
      featured: false,
    },
  ];

  const createdMovies = await Movie.create(movieDocs);
  console.log(`[Seed] Seeded ${createdMovies.length} Movies.`);

  // 4. Create Cinemas
  const cinemaDocs = [
    {
      name: 'IMovies Grand IMAX & Laser',
      address: 'Phoenix Palladium, 462 Senapati Bapat Marg, Lower Parel',
      city: 'Mumbai',
      facilities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Lounges', 'Valet Parking', 'Gourmet Dining'],
      contactPhone: '+91 22 4938 1000',
      active: true,
    },
    {
      name: 'IMovies CineDome Dolby Cinema',
      address: 'Orion Mall, Dr. Rajkumar Road, Rajajinagar',
      city: 'Bengaluru',
      facilities: ['Dolby Atmos', '4DX Motion Cinema', 'VIP Recliners', 'Cafeteria', 'Free Wi-Fi'],
      contactPhone: '+91 80 2268 2000',
      active: true,
    },
    {
      name: 'IMovies Luxe Royale',
      address: 'Select CITYWALK, A-3 District Centre, Saket',
      city: 'Delhi NCR',
      facilities: ['Dolby Cinema', 'Laser Projection', 'Pushback Loungers', 'Free Parking'],
      contactPhone: '+91 11 4211 4200',
      active: true,
    },
  ];

  const createdCinemas = await Cinema.create(cinemaDocs);
  console.log(`[Seed] Seeded ${createdCinemas.length} Cinemas.`);

  // 5. Generate Standard Screen Layout (Rows A to H, standard, premium, vip)
  const generateLayout = () => {
    const rows = [
      { row: 'A', category: 'standard', count: 10, mult: 1.0 },
      { row: 'B', category: 'standard', count: 10, mult: 1.0 },
      { row: 'C', category: 'standard', count: 10, mult: 1.0 },
      { row: 'D', category: 'premium', count: 10, mult: 1.3 },
      { row: 'E', category: 'premium', count: 10, mult: 1.3 },
      { row: 'F', category: 'premium', count: 10, mult: 1.3 },
      { row: 'G', category: 'vip', count: 8, mult: 1.8 },
      { row: 'H', category: 'vip', count: 8, mult: 1.8 },
    ];

    return rows.map((r) => {
      const seats = [];
      for (let i = 1; i <= r.count; i++) {
        seats.push({
          seatId: `${r.row}${i}`,
          seatNumber: i,
          isAccessible: r.row === 'A' && (i === 1 || i === 2),
          isBlocked: false,
        });
      }
      return {
        row: r.row,
        category: r.category,
        priceMultiplier: r.mult,
        seats,
      };
    });
  };

  const screensToCreate = [];
  createdCinemas.forEach((cinema) => {
    screensToCreate.push({
      cinemaId: cinema._id,
      name: 'Audi 1 - IMAX Experience',
      format: 'IMAX 2D',
      totalSeats: 76,
      seatLayout: generateLayout(),
    });
    screensToCreate.push({
      cinemaId: cinema._id,
      name: 'Audi 2 - Dolby Atmos VIP',
      format: 'Dolby Cinema',
      totalSeats: 76,
      seatLayout: generateLayout(),
    });
  });

  const createdScreens = await Screen.create(screensToCreate);
  console.log(`[Seed] Seeded ${createdScreens.length} Screens with full interactive seat maps.`);

  // 6. Create Showtimes across next 5 days
  const showtimesToCreate = [];
  const activeMovies = createdMovies.filter((m) => m.status === 'now_showing');

  const baseTimes = [
    { hour: 10, min: 30 },
    { hour: 14, min: 15 },
    { hour: 18, min: 45 },
    { hour: 22, min: 0 },
  ];

  for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
    for (const screen of createdScreens) {
      // Pick 2-3 movies per screen per day
      for (let i = 0; i < baseTimes.length; i++) {
        const movie = activeMovies[(dayOffset + i + screen.name.length) % activeMovies.length];
        const timeConfig = baseTimes[i];

        const startTime = new Date();
        startTime.setDate(startTime.getDate() + dayOffset);
        startTime.setHours(timeConfig.hour, timeConfig.min, 0, 0);

        const endTime = new Date(startTime.getTime() + (movie.durationMinutes + 25) * 60 * 1000);

        showtimesToCreate.push({
          movieId: movie._id,
          cinemaId: screen.cinemaId,
          screenId: screen._id,
          startTime,
          endTime,
          format: screen.format === 'IMAX 2D' ? 'IMAX 2D' : 'Dolby Cinema',
          pricing: {
            standard: 280,
            premium: 380,
            vip: 550,
          },
          status: 'active',
        });
      }
    }
  }

  const createdShowtimes = await Showtime.create(showtimesToCreate);
  console.log(`[Seed] Seeded ${createdShowtimes.length} future Showtimes.`);

  // 7. Create Demo Confirmed Booking for the Demo User
  // Pick a showtime tomorrow
  const sampleShowtime = createdShowtimes.find((s) => {
    const diff = (new Date(s.startTime) - new Date()) / (1000 * 60 * 60);
    return diff > 12 && diff < 36;
  }) || createdShowtimes[0];

  const sampleSeats = [
    { seatId: 'E4', row: 'E', seatNumber: 4, category: 'premium', price: 380 },
    { seatId: 'E5', row: 'E', seatNumber: 5, category: 'premium', price: 380 },
  ];
  const sampleBasePrice = 760;
  const sampleConvFee = 60;
  const sampleTax = Math.round(sampleBasePrice * 0.18);
  const sampleTotal = sampleBasePrice + sampleConvFee + sampleTax;

  const demoBooking = await Booking.create({
    bookingReference: 'IMV-DEMO88',
    userId: demoUser._id,
    showtimeId: sampleShowtime._id,
    movieId: sampleShowtime.movieId,
    cinemaId: sampleShowtime.cinemaId,
    screenId: sampleShowtime.screenId,
    seats: sampleSeats,
    pricing: {
      basePrice: sampleBasePrice,
      convenienceFee: sampleConvFee,
      taxes: sampleTax,
      totalAmount: sampleTotal,
    },
    payment: {
      method: 'demo_checkout',
      transactionId: 'TXN-DEMO-991823',
      status: 'paid',
      paidAt: new Date(),
    },
    status: 'confirmed',
  });

  // Also create a past confirmed booking for demo user so history has multiple items
  const pastShowtime = createdShowtimes[createdShowtimes.length - 1];
  await Booking.create({
    bookingReference: 'IMV-ARCHIVE01',
    userId: demoUser._id,
    showtimeId: pastShowtime._id,
    movieId: createdMovies[1]._id, // Oppenheimer
    cinemaId: pastShowtime.cinemaId,
    screenId: pastShowtime.screenId,
    seats: [
      { seatId: 'G3', row: 'G', seatNumber: 3, category: 'vip', price: 550 },
    ],
    pricing: {
      basePrice: 550,
      convenienceFee: 30,
      taxes: 99,
      totalAmount: 679,
    },
    payment: {
      method: 'credit_card',
      transactionId: 'TXN-DEMO-HIST44',
      status: 'paid',
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    status: 'confirmed',
  });

  console.log(`[Seed] Seeded demonstration bookings for user ${demoUser.email} (Ref: ${demoBooking.bookingReference}).`);
  console.log('[Seed] Seeding completed successfully!');
};

// Direct script execution support
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    try {
      await connectDB();
      await seedInitialData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]', err);
      process.exit(1);
    }
  })();
}
