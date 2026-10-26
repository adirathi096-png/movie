import React, { useEffect, useState } from 'react';
import { moviesAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ConfirmationModal } from '../components/ConfirmationModal.jsx';
import { Film, Plus, Edit, Trash2, Star, Clock, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [genres, setGenres] = useState('Sci-Fi, Action');
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [certification, setCertification] = useState('UA');
  const [status, setStatus] = useState('now_showing');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [rating, setRating] = useState(8.5);
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');

  const { showToast } = useToast();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await moviesAPI.getMovies({ limit: 50 });
      if (res.success) {
        setMovies(res.data.movies);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const resetForm = () => {
    setEditingMovie(null);
    setTitle('');
    setSynopsis('');
    setPosterUrl('');
    setBackdropUrl('');
    setGenres('Sci-Fi, Action');
    setDurationMinutes(150);
    setCertification('UA');
    setStatus('now_showing');
    setTrailerUrl('');
    setRating(8.5);
    setDirector('');
    setCast('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMovie(m);
    setTitle(m.title);
    setSynopsis(m.synopsis);
    setPosterUrl(m.posterUrl);
    setBackdropUrl(m.backdropUrl || '');
    setGenres(m.genres?.join(', ') || '');
    setDurationMinutes(m.durationMinutes);
    setCertification(m.certification);
    setStatus(m.status);
    setTrailerUrl(m.trailerUrl || '');
    setRating(m.rating || 8.0);
    setDirector(m.director || '');
    setCast(m.cast?.join(', ') || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !synopsis || !posterUrl) {
      showToast('Title, synopsis, and poster URL are required.', 'warning');
      return;
    }

    const payload = {
      title,
      synopsis,
      posterUrl,
      backdropUrl,
      genres: genres.split(',').map((g) => g.trim()).filter(Boolean),
      durationMinutes: Number(durationMinutes),
      certification,
      status,
      trailerUrl,
      rating: Number(rating),
      director,
      cast: cast.split(',').map((c) => c.trim()).filter(Boolean),
    };

    try {
      setSaving(true);
      if (editingMovie) {
        await moviesAPI.updateMovie(editingMovie._id, payload);
        showToast(`Updated movie '${title}' successfully!`, 'success');
      } else {
        await moviesAPI.createMovie(payload);
        showToast(`Movie '${title}' added successfully!`, 'success');
      }
      setModalOpen(false);
      resetForm();
      await fetchMovies();
    } catch (err) {
      showToast(err.message || 'Failed to save movie', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await moviesAPI.deleteMovie(deleteTarget._id);
      showToast(`Movie '${deleteTarget.title}' removed.`, 'success');
      setDeleteTarget(null);
      await fetchMovies();
    } catch (err) {
      showToast(err.message || 'Failed to delete movie', 'error');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <ArrowLeft size={14} className="me-1" /> Back to Dashboard
          </Link>
          <h1 className="text-white fw-black tracking-tight mb-1">Movie Catalogue Management</h1>
          <p className="text-secondary small mb-0">Create, edit, and organize movie premiere titles.</p>
        </div>

        <button type="button" className="btn btn-primary-imovies btn-sm" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Movie
        </button>
      </div>

      {/* Movies Table */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center py-5 text-secondary">
            <div className="spinner-border text-primary me-2"></div>
            Loading movie database...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-muted small text-uppercase">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genres</th>
                  <th>Duration</th>
                  <th>Certification</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded shadow-sm"
                        style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div className="text-white fw-bold small">{m.title}</div>
                      <div className="text-muted small">{m.director}</div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.genres?.slice(0, 2).map((g) => (
                          <span key={g} className="badge bg-dark border border-secondary text-secondary" style={{ fontSize: '0.65rem' }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="small text-secondary">{m.durationMinutes}m</td>
                    <td>
                      <span className="badge bg-secondary">{m.certification}</span>
                    </td>
                    <td>
                      <span className="text-warning small fw-bold d-flex align-items-center gap-1">
                        <Star size={12} fill="#fbbf24" /> {m.rating}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge small ${
                          m.status === 'now_showing'
                            ? 'bg-success'
                            : m.status === 'upcoming'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm p-1 px-2"
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Movie"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          onClick={() => setDeleteTarget(m)}
                          title="Delete Movie"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Movie Modal */}
      {modalOpen && (
        <div
          className="position-fixed inset-0 bg-black bg-opacity-75 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 2500, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            className="glass-card p-4 shadow-lg w-100 overflow-auto"
            style={{ maxWidth: '640px', maxHeight: '90vh' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary">
              <h5 className="text-white fw-bold mb-0">
                {editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Movie Record'}
              </h5>
              <button
                type="button"
                className="btn btn-link text-secondary p-0"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-secondary small mb-1">Movie Title *</label>
                  <input
                    type="text"
                    className="form-control imovies-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="text-secondary small mb-1">Synopsis *</label>
                  <textarea
                    rows={3}
                    className="form-control imovies-input"
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Poster Image URL *</label>
                  <input
                    type="url"
                    className="form-control imovies-input"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    className="form-control imovies-input"
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-secondary small mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    className="form-control imovies-input"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="text-secondary small mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    className="form-control imovies-input"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="text-secondary small mb-1">Certification</label>
                  <select
                    className="form-select imovies-input"
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                  >
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="text-secondary small mb-1">Release Status</label>
                  <select
                    className="form-select imovies-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="text-secondary small mb-1">IMDb Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control imovies-input"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="text-secondary small mb-1">Director</label>
                  <input
                    type="text"
                    className="form-control imovies-input"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="text-secondary small mb-1">YouTube Trailer URL</label>
                  <input
                    type="url"
                    className="form-control imovies-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="text-secondary small mb-1">Cast Members (comma separated)</label>
                  <input
                    type="text"
                    className="form-control imovies-input"
                    placeholder="Actor One, Actor Two, Actor Three"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary-imovies btn-sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-imovies btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Movie"
        message={`Are you sure you want to permanently remove '${deleteTarget?.title}' from the database? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
