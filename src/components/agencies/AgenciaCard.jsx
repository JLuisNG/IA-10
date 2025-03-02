import React from 'react';

const AgenciaCard = ({ agencia, onEdit, onDelete }) => {
  const { id, name, email, address, phone, status, docs, logo, patients } = agencia;
  
  // Obtener la clase CSS correcta según el estado
  const getStatusClass = (status) => {
    if (!status) return 'active';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'activo' || statusLower === 'active') return 'active';
    if (statusLower === 'inactivo' || statusLower === 'inactive') return 'inactive';
    if (statusLower === 'pendiente' || statusLower === 'pending') return 'pending';
    
    return 'active';
  };
  
  // Obtener la clase CSS correcta para los documentos
  const getDocsClass = (docs) => {
    if (!docs) return 'no';
    
    const docsLower = docs.toLowerCase();
    if (docsLower === 'sí' || docsLower === 'si' || docsLower === 'yes') return 'yes';
    
    return 'no';
  };

  return (
    <div className="agency-card">
      <div className="agency-card__header">
        <div className="agency-card__header-info">
          <img src={logo} alt={name} className="agency-card__header-logo" />
          <h3 className="agency-card__header-name">{name}</h3>
        </div>
        <div className="agency-card__header-actions">
          <button 
            className="agency-card__header-button edit" 
            onClick={onEdit}
            title="Editar"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="agency-card__header-button delete" 
            onClick={onDelete}
            title="Eliminar"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div className="agency-card__info">
        <div className="agency-card__info-item">
          <i className="fas fa-map-marker-alt"></i>
          <span>{address}</span>
        </div>
        
        {phone && (
          <div className="agency-card__info-item">
            <i className="fas fa-phone-alt"></i>
            <span>{phone}</span>
          </div>
        )}
        
        {email && (
          <div className="agency-card__info-item agency-card__info-email">
            <i className="fas fa-envelope"></i>
            <span>{email}</span>
          </div>
        )}
      </div>
      
      <div className="agency-card__counter">
        <div className="agency-card__counter-number">{patients}</div>
        <div className="agency-card__counter-label">Pacientes de esta Agencia</div>
      </div>
      
      <div className="agency-card__footer">
        <div className={`agency-card__footer-status agency-card__footer-status--${getStatusClass(status)}`}>
          <span>Estado: {status || 'Activo'}</span>
        </div>
        
        <div className={`agency-card__footer-docs agency-card__footer-docs--${getDocsClass(docs)}`}>
          <span>Documentos: {docs || 'No'}</span>
        </div>
      </div>
    </div>
  );
};

export default AgenciaCard;