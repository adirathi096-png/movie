import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          let Icon = Info;
          let borderColor = 'rgba(56, 189, 248, 0.4)';
          let iconColor = '#38bdf8';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderColor = 'rgba(16, 185, 129, 0.4)';
            iconColor = '#10b981';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderColor = 'rgba(244, 63, 94, 0.4)';
            iconColor = '#f43f5e';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderColor = 'rgba(245, 158, 11, 0.4)';
            iconColor = '#f59e0b';
          }

          return (
            <div
              key={toast.id}
              className="toast-item"
              style={{ borderLeft: `4px solid ${iconColor}`, borderColor }}
            >
              <Icon size={20} color={iconColor} className="flex-shrink-0" />
              <div className="flex-grow-1 small">{toast.message}</div>
              <button
                type="button"
                className="btn btn-link text-secondary p-0 ms-2"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
