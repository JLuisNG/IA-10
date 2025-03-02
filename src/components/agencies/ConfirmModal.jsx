import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  // Detener la propagación del clic para evitar cerrar el modal al hacer clic dentro de él
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`confirm-modal ${isOpen ? 'open' : ''}`}
        onClick={handleModalClick}
      >
        <div className="confirm-modal__icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        
        <h3 className="confirm-modal__title">{title || 'Confirmar acción'}</h3>
        <p className="confirm-modal__message">{message || '¿Estás seguro de realizar esta acción?'}</p>
        
        <div className="confirm-modal__buttons">
          <button 
            className="confirm-modal__buttons-button confirm-modal__buttons-button--cancel" 
            onClick={onClose}
          >
            <i className="fas fa-times"></i> Cancelar
          </button>
          <button 
            className="confirm-modal__buttons-button confirm-modal__buttons-button--confirm" 
            onClick={onConfirm}
          >
            <i className="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;