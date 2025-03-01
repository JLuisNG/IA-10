import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope 
} from '@fortawesome/free-solid-svg-icons';

const AgencyCard = ({ agency, onEdit, onDelete }) => {
  // Destructuring de la información de la agencia
  const { name, address, phone, email, patients, status, docs, logo } = agency;

  return (
    <div className="agency-card">
      <div className="agency-card__header">
        <div className="agency-logo">
          <img src={logo || '/api/placeholder/64/64'} alt={`${name} Logo`} />
        </div>
        <h3 className="agency-card__name">{name}</h3>
        <div className="agency-card__actions">
          <button className="edit-btn" onClick={onEdit}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button className="delete-btn" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
      <div className="agency-card__content">
        <div className="agency-contact-info">
          <p className="agency-address">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{address}</span>
          </p>
          <p className="agency-phone">
            <FontAwesomeIcon icon={faPhone} />
            <span>{phone}</span>
          </p>
          <p className="agency-email">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>{email}</span>
          </p>
        </div>
        <div className="agency-patient-counter">
          <span className="counter-number">{patients}</span>
          <span className="counter-label">Pacientes de esta Agencia</span>
        </div>
        <div className="agency-status-docs">
          <p><strong>Estado:</strong> {status}</p>
          <p><strong>Documentos:</strong> {docs}</p>
        </div>
      </div>
    </div>
  );
};

export default AgencyCard;