import React, { useEffect, useState } from 'react';
import { cinemasAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { MapPin, Plus, Trash2, ArrowLeft, X, Film, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cinemaModalOpen, setCinemaModalOpen] = useState(false);
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [targetCinema, setTargetCinema] = useState(null);

  // Cinema Form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [facilities, setFacilities] = useState('IMAX with Laser, Dolby Atmos, Recliner Lounges');
  const [contactPhone, setContactPhone] = useState('+91 22 1234 5678');

  // Screen Form
  const [screenName, setScreenName] = useState('Audi 3 - VIP Atmos');
  const [screenFormat, setScreenFormat] = useState('Dolby Cinema');

  const { showToast } = useToast();

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const res = await cinemasAPI.getCinemas({ active: 'true' });
      if (res.success) {
        setCinemas(res.data.cinemas);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load cinemas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleCreateCinema = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        address,
        city,
        facilities: facilities.split(',').map((f) => f.trim()).filter(Boolean),
        contactPhone,
        active: true,
      };
      await cinemasAPI.createCinema(payload);
      showToast(`Cinema '${name}' created!`, 'success');
      setCinemaModalOpen(false);
      setName('');
      setAddress('');
      setCity('');
      await fetchCinemas();
    } catch (err) {
      showToast(err.message || 'Failed to create cinema', 'error');
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!targetCinema) return;

    // Generate standard 76-seat layout (A-H)
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

    try {
      await cinemasAPI.createScreen(targetCinema._id, {
        name: screenName,
        format: screenFormat,
        seatLayout: generateLayout(),
      });
      showToast(`Screen '${screenName}' added to ${targetCinema.name}!`, 'success');
      setScreenModalOpen(false);
      setTargetCinema(null);
    } catch (err) {
      showToast(err.message || 'Failed to add screen', 'error');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <ArrowLeft size={14} className="me-1" /> Back to Dashboard
          </Link>
          <h1 className="text-white fw-black tracking-tight mb-1">Cinemas & Screens Management</h1>
          <p className="text-secondary small mb-0">Configure multiplex properties and auditorium screen layouts.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary-imovies btn-sm"
          onClick={() => setCinemaModalOpen(true)}
        >
          <Plus size={16} /> Add Cinema Venue
        </button>
      </div>

      {/* Cinemas List */}
      <div className="row g-4">
        {cinemas.map((cinema) => (
          <div key={cinema._id} className="col-lg-6">
            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="badge bg-primary text-uppercase small mb-1">{cinema.city}</span>
                    <h4 className="text-white fw-bold mb-1">{cinema.name}</h4>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                      setTargetCinema(cinema);
                      setScreenModalOpen(true);
                    }}
                  >
                    <Plus size={14} /> Add Screen
                  </button>
                </div>

                <p className="text-secondary small mb-3">{cinema.address}</p>

                <div className="d-flex flex-wrap gap-1 mb-3">
                  {cinema.facilities?.map((f) => (
                    <span
                      key={f}
                      className="badge bg-dark border border-secondary text-secondary"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-top border-secondary text-muted small d-flex justify-content-between align-items-center">
                <span>Contact: {cinema.contactPhone || 'N/A'}</span>
                <span className="text-success small">• Active Multiplex</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Cinema Modal */}
      {cinemaModalOpen && (
        <div
          className="position-fixed inset-0 bg-black bg-opacity-75 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 2500, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="glass-card p-4 shadow-lg w-100" style={{ maxWidth: '520px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary">
              <h5 className="text-white fw-bold mb-0">Add Cinema Venue</h5>
              <button
                type="button"
                className="btn btn-link text-secondary p-0"
                onClick={() => setCinemaModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCinema}>
              <div className="mb-3">
                <label className="text-secondary small mb-1">Cinema Name *</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  placeholder="e.g. IMovies Grand Cinema"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1">City *</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1">Address *</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  placeholder="Street and Mall Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1">Facilities (comma separated)</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="text-secondary small mb-1">Phone</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary-imovies btn-sm"
                  onClick={() => setCinemaModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-imovies btn-sm">
                  Create Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {screenModalOpen && targetCinema && (
        <div
          className="position-fixed inset-0 bg-black bg-opacity-75 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 2500, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="glass-card p-4 shadow-lg w-100" style={{ maxWidth: '480px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary">
              <h5 className="text-white fw-bold mb-0">Add Screen to {targetCinema.name}</h5>
              <button
                type="button"
                className="btn btn-link text-secondary p-0"
                onClick={() => setScreenModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateScreen}>
              <div className="mb-3">
                <label className="text-secondary small mb-1">Screen Name</label>
                <input
                  type="text"
                  className="form-control imovies-input"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="text-secondary small mb-1">Screen Format</label>
                <select
                  className="form-select imovies-input"
                  value={screenFormat}
                  onChange={(e) => setScreenFormat(e.target.value)}
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX 2D">IMAX 2D</option>
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                  <option value="4DX">4DX</option>
                </select>
                <span className="text-muted small mt-1 d-block" style={{ fontSize: '0.7rem' }}>
                  Auto-generates 76 tiered seats: Standard (A-C), Premium (D-F), VIP Recliners (G-H).
                </span>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary-imovies btn-sm"
                  onClick={() => setScreenModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-imovies btn-sm">
                  Add Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
