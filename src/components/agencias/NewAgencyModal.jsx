import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

const NewAgencyModal = ({ onClose, onSave, isLoading = false }) => {
  // Estado inicial para una nueva agencia
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: 'Los Angeles, California',
    phone: '',
    status: 'Activo',
    docs: 'No',
    logo: '/api/placeholder/64/64',
    patients: 0
  });
  
  // Estado para el logo (vista previa)
  const [logoPreview, setLogoPreview] = useState('/api/placeholder/64/64');
  
  // Estado para validación
  const [errors, setErrors] = useState({});
  
  // Estado para controlar la validación del formulario
  const [formTouched, setFormTouched] = useState(false);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marcar el formulario como tocado cuando el usuario escribe
    if (!formTouched) {
      setFormTouched(true);
    }
    
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
      // Validar tamaño del archivo (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'El archivo es demasiado grande. Máximo 2MB.'
        }));
        return;
      }
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          logo: 'Solo se permiten archivos de imagen.'
        }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        setLogoPreview(logoUrl);
        setFormData(prev => ({
          ...prev,
          logo: logoUrl
        }));
        
        // Limpiar error de logo si existía
        if (errors.logo) {
          setErrors(prev => ({
            ...prev,
            logo: null
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }
    
    // Validar teléfono (opcional)
    if (formData.phone && !/^(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormTouched(true);
    
    if (validateForm()) {
      // Asegurar que patients sea un número
      const formattedData = {
        ...formData,
        patients: Number(formData.patients) || 0
      };
      
      onSave(formattedData);
    }
  };

  return (
    <div className="modal active">
      <div className="modal__overlay" onClick={isLoading ? null : onClose}></div>
      <div className="modal__content">
        <div className="modal__header">
          <h2>Nueva Agencia</h2>
          <button className="modal__close" onClick={isLoading ? null : onClose} disabled={isLoading}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal__body">
          <form id="newAgencyForm" className="form" onSubmit={handleSubmit}>
            {/* Sección de Logo */}
            <div className="agency-logo-upload">
              <div className="agency-logo-preview">
                <img src={logoPreview} alt="Vista previa del logo" />
              </div>
              <input 
                type="file" 
                id="logo" 
                name="logo" 
                accept="image/*" 
                onChange={handleLogoChange} 
                disabled={isLoading}
              />
              <label htmlFor="logo" className={`logo-upload-btn ${isLoading ? 'disabled' : ''}`}>
                Subir Logo
              </label>
              {errors.logo && <span className="validation-error logo-error">{errors.logo}</span>}
            </div>

            {/* Información Básica en dos columnas */}
            <div className="form__section">
              <h3>Información Básica</h3>
              <div className="form__two-columns">
                <div className={`form__group ${errors.name ? 'invalid' : ''}`}>
                  <label htmlFor="name">Nombre de la Agencia</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    placeholder="Ej: Sunshine Care" 
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    required 
                  />
                  {errors.name && <span className="validation-error">{errors.name}</span>}
                </div>
                <div className={`form__group ${errors.email ? 'invalid' : ''}`}>
                  <label htmlFor="email">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="Ej: info@sunshinecare.com" 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
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
                <div className={`form__group ${errors.phone ? 'invalid' : ''}`}>
                  <label htmlFor="phone">Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="Ej: (213) 555-1234" 
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.phone && <span className="validation-error">{errors.phone}</span>}
                </div>
                <div className="form__group">
                  <label htmlFor="address">Dirección</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    placeholder="Ej: Los Angeles, California" 
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Estado y Documentos en dos columnas */}
            <div className="form__section">
              <h3>Estado y Documentos</h3>
              <div className="form__two-columns">
                <div className="form__group">
                  <label htmlFor="status">Estado</label>
                  <input 
                    type="text" 
                    id="status" 
                    name="status" 
                    placeholder="Ej: Activo" 
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="docs">Contrato Firmado / Docs Enviados</label>
                  <input 
                    type="text" 
                    id="docs" 
                    name="docs" 
                    placeholder="Ej: Sí / No" 
                    value={formData.docs}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            {/* Pacientes */}
            <div className="form__section">
              <h3>Pacientes</h3>
              <div className="form__group">
                <label htmlFor="patients">Número de Pacientes</label>
                <input 
                  type="number" 
                  id="patients" 
                  name="patients" 
                  placeholder="0" 
                  value={formData.patients}
                  onChange={handleChange}
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
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
            className="btn btn--primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> 
                Procesando...
              </>
            ) : (
              'Crear Agencia'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAgencyModal;