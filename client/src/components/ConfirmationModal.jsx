import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="position-fixed inset-0 bg-black bg-opacity-75 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 2500, top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="glass-card p-4 shadow-lg w-100" style={{ maxWidth: '480px' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={22} className={isDanger ? 'text-danger' : 'text-warning'} />
            <h5 className="text-white fw-bold mb-0">{title}</h5>
          </div>
          <button
            type="button"
            className="btn btn-link text-secondary p-0"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-secondary small mb-4 leading-relaxed">{message}</p>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary-imovies btn-sm px-3"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary-imovies'} btn-sm px-3`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
