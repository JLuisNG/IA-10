import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DeleteConfirmModal = ({ agency, onClose, onConfirm, isLoading = false }) => {
  return (
    <div className="modal active">
      <div className="modal__overlay" onClick={isLoading ? null : onClose}></div>
      <div className="modal__content modal__content--small">
        <div className="modal__header">
          <h2>Confirmar Eliminación</h2>
          <button 
            className="modal__close" 
            onClick={isLoading ? null : onClose}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal__body">
          <div className="warning-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
          </div>
          <p>¿Estás seguro que deseas eliminar la agencia <strong>{agency?.name}</strong>?</p>
          <p className="warning-text">Esta acción no se puede deshacer.</p>
          
          {agency?.patients > 0 && (
            <div className="warning-box">
              <p>
                <FontAwesomeIcon icon={faExclamationTriangle} /> 
                Esta agencia tiene <strong>{agency.patients} pacientes</strong> asignados.
              </p>
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button 
            className="btn btn--secondary" 
            onClick={isLoading ? null : onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn btn--danger" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> 
                Procesando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;