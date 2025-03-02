import React from 'react';

const LoadingModal = ({ isOpen, status = 'loading', message = 'Cargando...' }) => {
  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`loading-modal ${isOpen ? 'open' : ''}`}>
        {status === 'loading' && (
          <div className="loading-modal__spinner"></div>
        )}
        
        {status === 'success' && (
          <div className="loading-modal__success-icon">
            <i className="fas fa-check"></i>
          </div>
        )}
        
        {status === 'error' && (
          <div className="loading-modal__error-icon">
            <i className="fas fa-times"></i>
          </div>
        )}
        
        <p className="loading-modal__message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;