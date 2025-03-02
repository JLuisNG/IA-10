import React from 'react';

const ConfirmModal = ({ title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  return (
    <div className="modal-backdrop">
      <div className="confirm-modal">
        <div className="confirm-modal__header">
          <h2>{title}</h2>
          <button className="confirm-modal__close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="confirm-modal__body">
          <div className="confirm-modal__icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <p className="confirm-modal__message">{message}</p>
        </div>
        
        <div className="confirm-modal__actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onCancel}
          >
            {cancelText || 'Cancelar'}
          </button>
          <button 
            type="button" 
            className="btn-delete"
            onClick={onConfirm}
          >
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;