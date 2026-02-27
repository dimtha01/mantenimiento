
/**
 * Modal component for alerts and confirmations
 * @param {boolean} open - Whether the modal is visible
 * @param {function} onClose - Called when modal is closed
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} type - 'alert' | 'confirm' | 'success' | 'error'
 * @param {function} onConfirm - Called when confirm button is clicked (only for confirm type)
 * @param {string} confirmText - Text for confirm button (default: 'Confirmar')
 * @param {string} cancelText - Text for cancel button (default: 'Cancelar')
 */
export const Modal = ({
  open,
  onClose,
  title,
  message,
  type = 'alert',
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  // Handle escape key and body scroll
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  const typeConfig = {
    alert: {
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-100',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    confirm: {
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-amber-100',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
    },
    success: {
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-emerald-100',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    error: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
    },
  };

  const config = typeConfig[type] || typeConfig.alert;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
                {config.icon}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            {type === 'confirm' && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${config.confirmBtn}`}
            >
              {type === 'confirm' ? confirmText : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook for alert modal
 */
export const useAlert = () => {
  const [state, setState] = useState({ open: false, title: '', message: '', type: 'alert' });

  const showAlert = ({ title, message, type = 'alert' }) => {
    setState({ open: true, title, message, type });
  };

  const closeAlert = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return { alertState: state, showAlert, closeAlert };
};

/**
 * Hook for confirm modal
 */
export const useConfirm = () => {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
  });
  const resolverRef = useRef(null);

  const confirm = ({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
      });
      resolverRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    resolverRef.current?.(true);
    setState((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    resolverRef.current?.(false);
    setState((prev) => ({ ...prev, open: false }));
  };

  return { confirmState: state, confirm, handleConfirm, handleCancel };
};

import { useState, useRef, useEffect } from 'react';
