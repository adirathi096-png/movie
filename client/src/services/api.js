import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  // In production, fallback to relative /api/v1 (never localhost)
  if (import.meta.env.PROD) {
    return '/api/v1';
  }
  // Local development fallback
  return 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };

    // If 401 Unauthorized and not already on login, we could handle session expiry
    if (error.response?.status === 401) {
      if (localStorage.getItem('imovies_token')) {
        localStorage.removeItem('imovies_token');
        localStorage.removeItem('imovies_user');
      }
    }

    return Promise.reject(errorData);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.patch('/auth/me', profileData),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
};

export const moviesAPI = {
  getMovies: (params) => api.get('/movies', { params }),
  getMovieById: (id) => api.get(`/movies/${id}`),
  getMovieBySlug: (slug) => api.get(`/movies/slug/${slug}`),
  createMovie: (data) => api.post('/movies', data),
  updateMovie: (id, data) => api.patch(`/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/movies/${id}`),
};

export const cinemasAPI = {
  getCinemas: (params) => api.get('/cinemas', { params }),
  getCinemaById: (id) => api.get(`/cinemas/${id}`),
  getCinemaScreens: (id) => api.get(`/cinemas/${id}/screens`),
  createCinema: (data) => api.post('/cinemas', data),
  updateCinema: (id, data) => api.patch(`/cinemas/${id}`, data),
  deleteCinema: (id) => api.delete(`/cinemas/${id}`),
  createScreen: (cinemaId, data) => api.post(`/cinemas/${cinemaId}/screens`, data),
  updateScreen: (screenId, data) => api.patch(`/cinemas/screens/${screenId}`, data),
};

export const showtimesAPI = {
  getShowtimes: (params) => api.get('/showtimes', { params }),
  getShowtimeById: (id) => api.get(`/showtimes/${id}`),
  getShowtimeSeats: (id) => api.get(`/showtimes/${id}/seats`),
  createShowtime: (data) => api.post('/showtimes', data),
  updateShowtime: (id, data) => api.patch(`/showtimes/${id}`, data),
  deleteShowtime: (id) => api.delete(`/showtimes/${id}`),
};

export const reservationsAPI = {
  createReservation: (data) => api.post('/reservations', data),
  getReservation: (id) => api.get(`/reservations/${id}`),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
};

export const bookingsAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
};

export default api;
