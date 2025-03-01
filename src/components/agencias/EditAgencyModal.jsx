import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const EditAgencyModal = ({ agency, onClose, onSave }) => {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    status: '',
    docs: '',
    logo: '/api/placeholder/64/64',
    patients: 0
  });
  
  // Estado para el logo (vista previa)
  const [logoPreview, setLogoPreview] = useState('/api/placeholder/64/64');
  
  // Estado para validación
  const [errors, setErrors] = useState({});

  // Cargar datos de la agencia cuando se abre el modal
  useEffect(() => {
    if (agency) {
      setFormData({
        id: agency.id,
        name: agency.name || '',
        email: agency.email || '',
        address: agency.address || 'Los Angeles, California',
        phone: agency.phone || '',
        status: agency.status || 'Activo',
        docs: agency.docs || 'No',
        logo: agency.logo || '/api/placeholder/64/64',
        patients: agency.patients || 0
      });
      setLogoPreview(agency.logo || '/api/placeholder/64/64');
    }
  }, [agency]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al escribir en un campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Manejar cambio de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        setLogoPreview(logoUrl);
        setFormData(prev => ({
          ...prev,
          logo: logoUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal active">
      <div className="modal__overlay" onClick={onClose}></div>
      <div className="modal__content">
        <div className="modal__header">
          <h2>Editar Agencia</h2>
          <button className="modal__close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal__body">
          <form id="editAgencyForm" className="form" onSubmit={handleSubmit}>
            {/* Sección de Logo */}
            <div className="agency-logo-upload">
              <div className="agency-logo-preview">
                <img src={logoPreview} alt="Vista previa del logo" />
              </div>
              <input 
                type="file" 
                id="editLogo" 
                name="logo" 
                accept="image/*" 
                onChange={handleLogoChange} 
              />
              <label htmlFor="editLogo" className="logo-upload-btn">Cambiar Logo</label>
            </div>

            {/* Información Básica en dos columnas */}
            <div className="form__section">
              <h3>Información Básica</h3>
              <div className="form__two-columns">
                <div className={`form__group ${errors.name ? 'invalid' : ''}`}>
                  <label htmlFor="editName">Nombre de la Agencia</label>
                  <input 
                    type="text" 
                    id="editName" 
                    name="name" 
                    placeholder="Ej: Sunshine Care" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                  {errors.name && <span className="validation-error">{errors.name}</span>}
                </div>
                <div className={`form__group ${errors.email ? 'invalid' : ''}`}>
                  <label htmlFor="editEmail">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="editEmail" 
                    name="email" 
                    placeholder="Ej: info@sunshinecare.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                  {errors.email && <span className="validation-error">{errors.email}</span>}
                </div>
              </div>
            </div>

            {/* Información de Contacto en dos columnas */}
            <div className="form__section">
              <h3>Información de Contacto</h3>
              <div className="form__two-columns">
                <div className="form__group">
                  <label htmlFor="editPhone">Teléfono</label>
                  <input 
                    type="tel" 
                    id="editPhone" 
                    name="phone" 
                    placeholder="Ej: (213) 555-1234" 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="editAddress">Dirección</label>
                  <input 
                    type="text" 
                    id="editAddress" 
                    name="address" 
                    placeholder="Ej: Los Angeles, California" 
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Estado y Documentos en dos columnas */}
            <div className="form__section">
              <h3>Estado y Documentos</h3>
              <div className="form__two-columns">
                <div className="form__group">
                  <label htmlFor="editStatus">Estado</label>
                  <input 
                    type="text" 
                    id="editStatus" 
                    name="status" 
                    placeholder="Ej: Activo" 
                    value={formData.status}
                    onChange={handleChange}
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="editDocs">Contrato Firmado / Docs Enviados</label>
                  <input 
                    type="text" 
                    id="editDocs" 
                    name="docs" 
                    placeholder="Ej: Sí / No" 
                    value={formData.docs}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn--primary" onClick={handleSubmit}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default EditAgencyModal;