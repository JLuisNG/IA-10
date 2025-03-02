import React from 'react';

const AgenciaCard = ({ agencia, onEdit, onDelete }) => {
  return (
    <div className="agencia-card">
      <div className="agencia-card__header">
        <div className="agencia-card__logo-container">
          <img src={agencia.logo || '/api/placeholder/64/64'} alt={`${agencia.name} Logo`} className="agencia-card__logo" />
        </div>
        <div className="agencia-card__title-container">
          <h3 className="agencia-card__title">{agencia.name}</h3>
          <div className="agencia-card__actions">
            <button className="agencia-card__edit-btn" onClick={onEdit} title="Editar agencia">
              <i className="fas fa-edit"></i>
            </button>
            <button className="agencia-card__delete-btn" onClick={onDelete} title="Eliminar agencia">
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="agencia-card__info">
        <div className="agencia-card__location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{agencia.address || 'Los Angeles, California'}</span>
        </div>
        
        <div className="agencia-card__phone">
          <i className="fas fa-phone-alt"></i>
          <span>{agencia.phone || 'No disponible'}</span>
        </div>
        
        <div className="agencia-card__email">
          <i className="fas fa-envelope"></i>
          <span>{agencia.email || 'No disponible'}</span>
        </div>
      </div>
      
      <div className="agencia-card__stats">
        <div className="agencia-card__patients-count">
          {agencia.patients || 0}
        </div>
        <div className="agencia-card__patients-label">
          Pacientes de esta Agencia
        </div>
      </div>
      
      <div className="agencia-card__footer">
        <div className="agencia-card__status">
          <span className="agencia-card__status-label">Estado:</span>
          <span className={`agencia-card__status-value ${agencia.status === 'Activo' ? 'status-active' : 'status-inactive'}`}>
            {agencia.status || 'Activo'}
          </span>
        </div>
        
        <div className="agencia-card__docs">
          <span className="agencia-card__docs-label">Documentos:</span>
          <span className="agencia-card__docs-value">
            {agencia.docs || 'No'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AgenciaCard;