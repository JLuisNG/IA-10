import React, { useState, useEffect } from 'react';

const TerapeutaModal = ({ terapeuta, categories, disciplines, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    areas: '',
    languages: '',
    phone: '',
    email: '',
    status: 'active',
    availability: 'full'
  });

  // Configurar el formulario con los datos del terapeuta si está en modo edición
  useEffect(() => {
    if (terapeuta) {
      setFormData({
        ...terapeuta,
        availability: terapeuta.availability || 'full'
      });
    }
  }, [terapeuta]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('edit', '').toLowerCase()]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    onSave(formData);
  };

  const handleClickOutside = (e) => {
    if (e.target.className === 'edit-modal active') {
      onClose();
    }
  };

  return (
    <div className="edit-modal active" onClick={handleClickOutside}>
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h3 className="modal-title">
            <i className="fas fa-user-edit"></i>
            {terapeuta ? 'Editar Terapeuta' : 'Agregar Terapeuta'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="edit-modal-body">
          <form id="editTherapistForm" onSubmit={handleSubmit}>
            {/* Información Personal */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="editName">
                  <i className="fas fa-user"></i>
                  Nombre
                </label>
                <input 
                  type="text" 
                  id="editName" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label htmlFor="editType">
                    <i className="fas fa-briefcase"></i>
                    Tipo
                  </label>
                  <select 
                    id="editType" 
                    value={formData.type} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {Object.entries(disciplines).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editCategory">
                    <i className="fas fa-star"></i>
                    Categoría
                  </label>
                  <select 
                    id="editCategory" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Áreas e Idiomas */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="editAreas">
                  <i className="fas fa-map-marker-alt"></i>
                  Áreas de Cobertura
                </label>
                <textarea 
                  id="editAreas" 
                  value={formData.areas} 
                  onChange={handleChange} 
                  required 
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="editLanguages">
                  <i className="fas fa-language"></i>
                  Idiomas
                </label>
                <input 
                  type="text" 
                  id="editLanguages" 
                  value={formData.languages || ''} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="form-section">
              <div className="form-row two-cols">
                <div className="form-group">
                  <label htmlFor="editPhone">
                    <i className="fas fa-phone"></i>
                    Teléfono
                  </label>
                  <input 
                    type="tel" 
                    id="editPhone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editEmail">
                    <i className="fas fa-envelope"></i>
                    Email
                  </label>
                  <input 
                    type="email" 
                    id="editEmail" 
                    value={formData.email || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Estado y Configuración */}
            <div className="form-section">
              <div className="form-row two-cols">
                <div className="form-group">
                  <label htmlFor="editStatus">
                    <i className="fas fa-toggle-on"></i>
                    Estado
                  </label>
                  <select 
                    id="editStatus" 
                    value={formData.status} 
                    onChange={handleChange}
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Documentos Pendientes</option>
                    <option value="unsigned">No ha firmado</option>
                    <option value="NO PTA">NO PTA</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editAvailability">
                    <i className="fas fa-clock"></i>
                    Disponibilidad
                  </label>
                  <select 
                    id="editAvailability" 
                    value={formData.availability || 'full'} 
                    onChange={handleChange}
                  >
                    <option value="full">Tiempo Completo</option>
                    <option value="part">Medio Tiempo</option>
                    <option value="weekends">Solo Fines de Semana</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={onClose}>
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          <button type="submit" className="btn btn-save" form="editTherapistForm">
            <i className="fas fa-save"></i>
            {terapeuta ? 'Guardar Cambios' : 'Agregar Terapeuta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerapeutaModal;