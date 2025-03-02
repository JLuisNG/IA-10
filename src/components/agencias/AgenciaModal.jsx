import React, { useState, useEffect } from 'react';

const AgenciaModal = ({ agencia, onClose, onSave }) => {
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
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agencia) {
      setFormData({
        name: agencia.name || '',
        email: agencia.email || '',
        address: agencia.address || 'Los Angeles, California',
        phone: agencia.phone || '',
        status: agencia.status || 'Activo',
        docs: agencia.docs || 'No',
        logo: agencia.logo || '/api/placeholder/64/64',
        patients: agencia.patients || 0
      });
    }
  }, [agencia]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (formData.phone && !/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? 0 : parseInt(value);
    if (!isNaN(numberValue) && numberValue >= 0) {
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simular carga para mejor experiencia de usuario
      setTimeout(() => {
        onSave(formData);
        setIsSubmitting(false);
      }, 500);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="agencia-modal">
        <div className="agencia-modal__header">
          <h2>{agencia ? 'Editar Agencia' : 'Nueva Agencia'}</h2>
          <button className="agencia-modal__close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="agencia-modal__form">
          <div className="form-group">
            <label htmlFor="name">Nombre*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Nombre de la agencia"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
              placeholder="(000) 000-0000"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
            
            <div className="form-group half">
              <label htmlFor="docs">Documentos</label>
              <select
                id="docs"
                name="docs"
                value={formData.docs}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
                <option value="Pendientes">Pendientes</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="patients">Pacientes</label>
            <input
              type="number"
              id="patients"
              name="patients"
              value={formData.patients}
              onChange={handleNumberChange}
              min="0"
              placeholder="Número de pacientes"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Guardando...
                </>
              ) : (
                agencia ? 'Actualizar' : 'Crear'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgenciaModal;