import React, { useEffect, useState } from 'react';
import { cinemasAPI, showtimesAPI } from '../services/api.js';
import { MapPin, Phone, Sparkles, Film, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CinemasPage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const res = await cinemasAPI.getCinemas({ city: selectedCity === 'All' ? undefined : selectedCity });
        if (res.success) {
          setCinemas(res.data.cinemas);
          if (res.data.cities) {
            setCities(res.data.cities);
          }
        }
      } catch (err) {
        console.error('Failed to load cinemas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [selectedCity]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-primary small text-uppercase fw-bold tracking-wider mb-1">
          <MapPin size={16} /> Our Theatres
        </div>
        <h1 className="text-white fw-black tracking-tight mb-2">Cinema Venues & Multiplexes</h1>
        <p className="text-secondary small">
          State-of-the-art cinematic venues equipped with Laser IMAX, Dolby Atmos, and luxurious recliner seating.
        </p>
      </div>

      {/* City Filter Tabs */}
      <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2">
        <button
          type="button"
          className={`btn btn-sm ${selectedCity === 'All' ? 'btn-primary' : 'btn-dark border border-secondary text-secondary'}`}
          onClick={() => setSelectedCity('All')}
        >
          All Locations
        </button>
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            className={`btn btn-sm ${selectedCity === city ? 'btn-primary' : 'btn-dark border border-secondary text-secondary'}`}
            onClick={() => setSelectedCity(city)}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Cinema Cards List */}
      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary me-2"></div>
          Loading cinemas...
        </div>
      ) : cinemas.length === 0 ? (
        <div className="glass-panel p-5 text-center text-secondary">
          No cinemas found in this location.
        </div>
      ) : (
        <div className="row g-4">
          {cinemas.map((cinema) => (
            <div key={cinema._id} className="col-lg-4 col-md-6">
              <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary text-uppercase px-2 py-1 small">
                      {cinema.city}
                    </span>
                    <span className="text-success small fw-semibold d-flex align-items-center gap-1">
                      <span className="badge bg-success p-1 rounded-circle">•</span> Active Venue
                    </span>
                  </div>

                  <h4 className="text-white fw-bold mb-2">{cinema.name}</h4>

                  <p className="text-secondary small d-flex align-items-start gap-2 mb-3">
                    <MapPin size={16} className="text-primary flex-shrink-0 mt-1" />
                    <span>{cinema.address}</span>
                  </p>

                  {cinema.contactPhone && (
                    <div className="text-muted small d-flex align-items-center gap-2 mb-3">
                      <Phone size={14} />
                      <span>{cinema.contactPhone}</span>
                    </div>
                  )}

                  <div className="d-flex flex-wrap gap-1 mb-4">
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

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary-imovies w-100 btn-sm"
                    onClick={() => navigate('/now-showing')}
                  >
                    View Showtimes for this Venue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
