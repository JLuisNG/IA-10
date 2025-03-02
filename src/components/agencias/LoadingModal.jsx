import React from 'react';

const LoadingModal = ({ message }) => {
  return (
    <div className="modal-backdrop">
      <div className="loading-modal">
        <div className="loading-modal__spinner"></div>
        <p className="loading-modal__message">{message || 'Cargando...'}</p>
      </div>
    </div>
  );
};

export default LoadingModal;