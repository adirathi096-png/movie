import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';

import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';

// Pages
import { Home } from './pages/Home.jsx';
import { NowShowing } from './pages/NowShowing.jsx';
import { Upcoming } from './pages/Upcoming.jsx';
import { MovieDetails } from './pages/MovieDetails.jsx';
import { CinemasPage } from './pages/CinemasPage.jsx';
import { SeatSelectionPage } from './pages/SeatSelectionPage.jsx';
import { BookingSummaryPage } from './pages/BookingSummaryPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';
import { ResetPassword } from './pages/ResetPassword.jsx';
import { Profile } from './pages/Profile.jsx';
import { MyBookings } from './pages/MyBookings.jsx';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminMovies } from './pages/AdminMovies.jsx';
import { AdminCinemas } from './pages/AdminCinemas.jsx';
import { AdminShowtimes } from './pages/AdminShowtimes.jsx';
import { AdminBookings } from './pages/AdminBookings.jsx';
import { AdminUsers } from './pages/AdminUsers.jsx';
import { NotFound } from './pages/NotFound.jsx';

export const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            <div className="d-flex flex-column min-vh-100 bg-dark text-white">
              <Navbar />

              <main className="flex-grow-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/now-showing" element={<NowShowing />} />
                  <Route path="/upcoming" element={<Upcoming />} />
                  <Route path="/search" element={<NowShowing />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/cinemas" element={<CinemasPage />} />

                  {/* Seat Selection & Booking Journey */}
                  <Route path="/seat-selection/:showtimeId" element={<SeatSelectionPage />} />
                  <Route path="/booking/summary" element={<BookingSummaryPage />} />
                  <Route
                    path="/booking/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/confirmation/:id"
                    element={
                      <ProtectedRoute>
                        <BookingConfirmationPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected User Account Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/movies"
                    element={
                      <AdminRoute>
                        <AdminMovies />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/cinemas"
                    element={
                      <AdminRoute>
                        <AdminCinemas />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/showtimes"
                    element={
                      <AdminRoute>
                        <AdminShowtimes />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/bookings"
                    element={
                      <AdminRoute>
                        <AdminBookings />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
