import React, { useState, useEffect } from 'react';

const AgenciaModal = ({ isOpen, onClose, onSave, agencia }) => {
  // Estado para los campos del formulario
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

  // Actualizar el formulario cuando se abre en modo edición
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
    } else {
      // Restablecer valores predeterminados al crear una nueva agencia
      setFormData({
        name: '',
        email: '',
        address: 'Los Angeles, California',
        phone: '',
        status: 'Activo',
        docs: 'No',
        logo: '/api/placeholder/64/64',
        patients: 0
      });
    }
  }, [agencia, isOpen]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Validar que al menos se ingrese un nombre
  const isFormValid = formData.name.trim() !== '';

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`modal ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__header-title">
            {agencia ? 'Editar Agencia' : 'Nueva Agencia'}
          </h2>
          <button className="modal__header-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal__body">
          <form className="modal__form" onSubmit={handleSubmit}>
            <div className="modal__form-group">
              <label className="modal__form-label required" htmlFor="name">
                <i className="fas fa-building"></i>
                Nombre de la Agencia
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="modal__form-input"
                placeholder="Ingrese el nombre de la agencia"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="modal__form-group">
              <label className="modal__form-label" htmlFor="email">
                <i className="fas fa-envelope"></i>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="modal__form-input"
                placeholder="Ingrese el correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="modal__form-group">
              <label className="modal__form-label" htmlFor="address">
                <i className="fas fa-map-marker-alt"></i>
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="modal__form-input"
                placeholder="Ingrese la dirección"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="modal__form-group">
              <label className="modal__form-label" htmlFor="phone">
                <i className="fas fa-phone-alt"></i>
                Teléfono
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="modal__form-input"
                placeholder="Ingrese el número de teléfono"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="modal__form-group">
              <label className="modal__form-label" htmlFor="status">
                <i className="fas fa-chart-line"></i>
                Estado
              </label>
              <select
                id="status"
                name="status"
                className="modal__form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
            
            <div className="modal__form-group">
              <label className="modal__form-label" htmlFor="docs">
                <i className="fas fa-file-alt"></i>
                Documentos
              </label>
              <select
                id="docs"
                name="docs"
                className="modal__form-select"
                value={formData.docs}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
            
            {agencia && (
              <div className="modal__form-group">
                <label className="modal__form-label" htmlFor="patients">
                  <i className="fas fa-users"></i>
                  Número de Pacientes
                </label>
                <input
                  type="number"
                  id="patients"
                  name="patients"
                  className="modal__form-input"
                  placeholder="Ingrese el número de pacientes"
                  value={formData.patients}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            )}
          </form>
        </div>
        
        <div className="modal__footer">
          <button 
            className="modal__footer-button modal__footer-button--cancel" 
            onClick={onClose}
          >
            <i className="fas fa-times"></i> Cancelar
          </button>
          <button 
            className="modal__footer-button modal__footer-button--save" 
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            <i className="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgenciaModal;