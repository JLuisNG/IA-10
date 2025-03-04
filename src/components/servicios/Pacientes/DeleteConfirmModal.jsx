import React, { useState, useEffect } from 'react';
import '../../../styles/DeleteConfirmModal.scss';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, paciente }) => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [reasons, setReasons] = useState([
    { id: 1, text: 'No disponible en el área', selected: false },
    { id: 2, text: 'No habla español', selected: false },
    { id: 3, text: 'No hay terapeuta para esa disciplina', selected: false },
    { id: 4, text: 'Paciente rechazó el servicio', selected: false },
    { id: 5, text: 'Área no cubierta', selected: false },
    { id: 6, text: 'Fuera del horario de servicio', selected: false }
  ]);
  const [customReason, setCustomReason] = useState('');

  // Controlar apertura/cierre con animación
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      // Pequeño retraso para que la animación funcione correctamente
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      // Esperar a que termine la animación antes de ocultar el modal
      const timer = setTimeout(() => {
        setShowModal(false);
        setReasons(reasons.map(reason => ({ ...reason, selected: false })));
        setCustomReason('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manejar selección de razón
  const handleSelectReason = (id) => {
    setReasons(reasons.map(reason => ({
      ...reason,
      selected: reason.id === id ? !reason.selected : reason.selected
    })));
  };

  // Manejar cambio en razón personalizada
  const handleCustomReasonChange = (e) => {
    setCustomReason(e.target.value);
  };

  // Verificar si hay alguna razón seleccionada
  const isReasonSelected = () => {
    return reasons.some(reason => reason.selected) || customReason.trim() !== '';
  };

  // Manejador de confirmación
  const handleConfirm = () => {
    // Recopilar las razones seleccionadas
    const selectedReasons = reasons
      .filter(reason => reason.selected)
      .map(reason => reason.text);
    
    // Añadir razón personalizada si existe
    if (customReason.trim() !== '') {
      selectedReasons.push(customReason.trim());
    }
    
    // Llamar a la función de confirmación con las razones
    onConfirm(selectedReasons.join(', '));
  };

  if (!showModal) return null;

  return (
    <div className={`delete-modal-overlay ${animate ? 'show' : ''}`}>
      <div className="delete-modal">
        <div className="delete-modal-header">
          <h2>Confirmar rechazo de paciente</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="delete-modal-content">
          <div className="patient-info">
            <div className="patient-avatar">
              <i className="fas fa-user"></i>
            </div>
            
            <div className="patient-details">
              <div className="patient-name">
                {paciente?.nombre || 'Paciente'}
              </div>
              <div className="patient-meta">
                <span className="meta-item">
                  <i className="fas fa-map-marker-alt"></i> {paciente?.direccion || 'Sin dirección'}
                </span>
                <span className="meta-item">
                  <i className="fas fa-hospital"></i> {paciente?.agencia_nombre || 'Sin agencia'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="warning-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Está a punto de marcar a este paciente como "rechazado". Esta acción moverá al paciente a la sección de rechazados y registrará las razones seleccionadas.</p>
          </div>
          
          <div className="reasons-section">
            <h3>Seleccione las razones del rechazo:</h3>
            
            <div className="reasons-grid">
              {reasons.map(reason => (
                <div 
                  key={reason.id} 
                  className={`reason-item ${reason.selected ? 'selected' : ''}`}
                  onClick={() => handleSelectReason(reason.id)}
                >
                  <div className="checkbox">
                    {reason.selected && <i className="fas fa-check"></i>}
                  </div>
                  <span className="reason-text">{reason.text}</span>
                </div>
              ))}
            </div>
            
            <div className="custom-reason">
              <label htmlFor="custom-reason">Otra razón (opcional):</label>
              <textarea
                id="custom-reason"
                placeholder="Especifique otra razón para el rechazo..."
                value={customReason}
                onChange={handleCustomReasonChange}
              ></textarea>
            </div>
          </div>
          
          <div className="therapists-section">
            <h3>Terapeutas que rechazaron:</h3>
            
            <div className="therapists-list">
              <div className="therapist-input-row">
                <input 
                  type="text" 
                  placeholder="Nombre del terapeuta"
                  className="therapist-name-input"
                />
                <select className="therapist-type-select">
                  <option value="">Disciplina</option>
                  <option value="PT">PT</option>
                  <option value="PTA">PTA</option>
                  <option value="OT">OT</option>
                  <option value="COTA">COTA</option>
                  <option value="ST">ST</option>
                  <option value="STA">STA</option>
                </select>
                <button className="add-therapist-btn">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              {/* Lista de terapeutas rechazantes (se llenaría dinámicamente) */}
              <div className="added-therapists">
                {/* Ejemplo de un terapeuta añadido */}
                <div className="therapist-tag">
                  <span className="therapist-name">María González</span>
                  <span className="therapist-type">PT</span>
                  <button className="remove-therapist">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="therapist-tag">
                  <span className="therapist-name">Juan Pérez</span>
                  <span className="therapist-type">OT</span>
                  <button className="remove-therapist">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="delete-modal-footer">
          <button 
            className="cancel-btn"
            onClick={onClose}
          >
            <i className="fas fa-times"></i> Cancelar
          </button>
          <button 
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={!isReasonSelected()}
          >
            <i className="fas fa-check"></i> Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;