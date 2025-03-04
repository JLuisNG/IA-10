import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Referrals.scss';
import logoImg from '../../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';
import LoadingModal from '../pacientes/LoadingModal'; // Asegúrate de que la ruta sea correcta

const Referrals = () => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    requerimientos: [],
    direccion: '',
    agencia_id: '',
    notas: '',
    link_correo: ''
  });
  
  // Estado para las agencias
  const [agencias, setAgencias] = useState([]);
  const [filteredAgencias, setFilteredAgencias] = useState([]);
  const [showAgenciasList, setShowAgenciasList] = useState(false);
  const [searchAgencia, setSearchAgencia] = useState('');
  
  // Referencias para manipulación del DOM
  const agenciasListRef = useRef(null);
  const agenciaInputRef = useRef(null);
  const formRef = useRef(null);
  
  // Estados para validación
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  // Estados para modal de carga
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('loading');

  // Estado para la animación de la página
  const [pageReady, setPageReady] = useState(false);

  // Disciplinas disponibles
  const disciplinas = [
    { value: 'PT', label: 'PT (Physical Therapist)' },
    { value: 'PTA', label: 'PTA (Physical Therapist Assistant)' },
    { value: 'OT', label: 'OT (Occupational Therapist)' },
    { value: 'COTA', label: 'COTA (Certified Occupational Therapy Assistant)' },
    { value: 'ST', label: 'ST (Speech Therapist)' },
    { value: 'STA', label: 'STA (Speech Therapist Assistant)' }
  ];

  // Cargar datos iniciales y mostrar animación de entrada
  useEffect(() => {
    // Cargar agencias
    fetchAgencias();

    // Simular tiempo de carga para mostrar animación de entrada
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Cerrar la lista de agencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (agenciasListRef.current && !agenciasListRef.current.contains(event.target) &&
          agenciaInputRef.current && !agenciaInputRef.current.contains(event.target)) {
        setShowAgenciasList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar el dropdown del usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.header__dropdown');
      const userButton = document.querySelector('.header__username');
      
      if (dropdown && userButton && showUserDropdown && 
          !dropdown.contains(event.target) && 
          !userButton.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Filtrar agencias cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchAgencia.trim() === '') {
      setFilteredAgencias(agencias);
    } else {
      const filtered = agencias.filter(agencia => 
        agencia.name.toLowerCase().includes(searchAgencia.toLowerCase())
      );
      setFilteredAgencias(filtered);
    }
  }, [searchAgencia, agencias]);

  // Función para obtener agencias
  const fetchAgencias = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/agencias');
      if (!response.ok) {
        throw new Error('Error al cargar las agencias');
      }
      const data = await response.json();
      setAgencias(data);
      setFilteredAgencias(data);
    } catch (error) {
      console.error('Error al cargar agencias:', error);
      // Mostrar una notificación toast aquí para errores no bloqueantes
    }
  };

  // Manejo de cambios en campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marcar campo como tocado
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Limpiar error específico si el valor es válido
    if (errors[name] && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Manejo de cambios en checkboxes de requerimientos
  const handleRequirementChange = (value) => {
    let updatedRequerimientos = [...formData.requerimientos];
    
    if (updatedRequerimientos.includes(value)) {
      updatedRequerimientos = updatedRequerimientos.filter(req => req !== value);
    } else {
      updatedRequerimientos.push(value);
    }
    
    setFormData(prev => ({
      ...prev,
      requerimientos: updatedRequerimientos
    }));
    
    // Marcar campo como tocado
    if (!touchedFields['requerimientos']) {
      setTouchedFields(prev => ({
        ...prev,
        requerimientos: true
      }));
    }
    
    // Limpiar error de requerimientos si hay al menos uno seleccionado
    if (updatedRequerimientos.length > 0 && errors.requerimientos) {
      setErrors(prev => ({
        ...prev,
        requerimientos: null
      }));
    }
  };

  // Manejo de búsqueda de agencias
  const handleSearchAgencia = (e) => {
    setSearchAgencia(e.target.value);
    setShowAgenciasList(true);
  };

  // Seleccionar una agencia
  const handleSelectAgencia = (agencia) => {
    setFormData(prev => ({
      ...prev,
      agencia_id: agencia.id
    }));
    setSearchAgencia(agencia.name);
    setShowAgenciasList(false);
    
    // Marcar campo como tocado
    if (!touchedFields['agencia_id']) {
      setTouchedFields(prev => ({
        ...prev,
        agencia_id: true
      }));
    }
    
    // Limpiar error de agencia
    if (errors.agencia_id) {
      setErrors(prev => ({
        ...prev,
        agencia_id: null
      }));
    }
  };

  // Toggle para mostrar/ocultar lista de agencias
  const toggleAgenciasList = () => {
    setShowAgenciasList(!showAgenciasList);
  };

  // Toggle para el dropdown del usuario
  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setLoadingModalOpen(true);
    setLoadingMessage('Cerrando sesión...');
    setLoadingStatus('loading');
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del paciente es obligatorio';
    }
    
    if (formData.requerimientos.length === 0) {
      newErrors.requerimientos = 'Debe seleccionar al menos un requerimiento';
    }
    
    if (!formData.agencia_id) {
      newErrors.agencia_id = 'Debe seleccionar una agencia';
    }
    
    if (!formData.link_correo.trim()) {
      newErrors.link_correo = 'El link del correo es obligatorio';
    }
    
    setErrors(newErrors);
    
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouchedFields(allTouched);
    
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Animación suave hacia el primer error
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorElement = document.querySelector(`[name="${firstErrorKey}"]`) || 
                               document.querySelector(`[data-error="${firstErrorKey}"]`);
      
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus();
      }
      return;
    }
    
    // Mostrar modal de carga
    setLoadingModalOpen(true);
    setLoadingMessage('Registrando paciente...');
    setLoadingStatus('loading');
    
    try {
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        requerimientos: formData.requerimientos.join(', ')
      };
      
      // Enviar datos al servidor
      const response = await fetch('http://localhost:3003/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        throw new Error('Error al registrar paciente');
      }
      
      const data = await response.json();
      
      // Simular una pequeña demora para mostrar animación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar éxito
      setLoadingStatus('success');
      setLoadingMessage('¡Paciente registrado correctamente!');
      
      // Otra pequeña demora antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la página de pacientes
      navigate('/pacientes');
      
    } catch (error) {
      console.error('Error:', error);
      
      // Mostrar error
      setLoadingStatus('error');
      setLoadingMessage('Error al registrar paciente. Intente nuevamente.');
      
      // Demora para mostrar mensaje de error
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingModalOpen(false);
    }
  };

  return (
    <div className={`app-container ${pageReady ? 'fade-in' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header__logo" onClick={() => navigate('/welcome')}>
          <img src={logoImg} alt="Motive Homecare Logo" />
        </div>
        
        <nav className="header__nav">
          <ul className="header__menu">
            <li className="header__item">
              <span 
                className="header__link"
                onClick={() => navigate('/ubicacion')}
              >
                UBICACIÓN
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link active"
                onClick={() => navigate('/referrals')}
              >
                REFERRALS
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link"
                onClick={() => navigate('/pacientes')}
              >
                PACIENTES
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link"
                onClick={() => navigate('/frecuencias')}
              >
                FRECUENCIAS
              </span>
            </li>
          </ul>
        </nav>
        
        <div className="header__user">
          <span className="header__username" onClick={toggleUserDropdown}>
            Luis Nava <i className="fas fa-chevron-down"></i>
          </span>
          <div className={`header__dropdown ${showUserDropdown ? 'show' : ''}`}>
            <ul>
              <li>
                <button className="dropdown-item">
                  <i className="fas fa-id-card"></i> Ver Credenciales
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="referrals-container">
        <div className="container-backdrop"></div>
        
        <div className="referrals-form-wrapper">
          <div className="referrals-form-header">
            <div className="header-content">
              <h1>Registro de Paciente</h1>
              <p>Complete los datos del nuevo paciente referido</p>
              <span className="header-icon">
                <i className="fas fa-user-plus"></i>
              </span>
            </div>
            <div className="header-divider"></div>
          </div>
          
          <form ref={formRef} className="referrals-form" onSubmit={handleSubmit} noValidate>
            {/* Nombre del Paciente */}
            <div className={`form-group ${errors.nombre ? 'has-error' : ''} ${touchedFields.nombre && formData.nombre ? 'has-success' : ''}`}>
              <div className="input-container">
                <label htmlFor="nombre">
                  <i className="fas fa-user"></i> Nombre del Paciente <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre completo del paciente"
                  className={errors.nombre ? 'error' : ''}
                />
                {errors.nombre && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.nombre}
                  </div>
                )}
                {touchedFields.nombre && formData.nombre && !errors.nombre && (
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                )}
              </div>
            </div>
            
            {/* Requerimientos/Disciplinas */}
            <div className={`form-group ${errors.requerimientos ? 'has-error' : ''}`} data-error="requerimientos">
              <label>
                <i className="fas fa-clipboard-list"></i> Requerimientos <span className="required">*</span>
              </label>
              <div className="requirements-container">
                {disciplinas.map((req) => (
                  <div 
                    key={req.value}
                    className={`requirement-card ${formData.requerimientos.includes(req.value) ? 'selected' : ''}`}
                    onClick={() => handleRequirementChange(req.value)}
                  >
                    <div className="requirement-icon">
                      {req.value === 'PT' && <i className="fas fa-walking"></i>}
                      {req.value === 'PTA' && <i className="fas fa-user-md"></i>}
                      {req.value === 'OT' && <i className="fas fa-hands"></i>}
                      {req.value === 'COTA' && <i className="fas fa-hand-holding-medical"></i>}
                      {req.value === 'ST' && <i className="fas fa-comment-medical"></i>}
                      {req.value === 'STA' && <i className="fas fa-comments"></i>}
                    </div>
                    <div className="requirement-info">
                      <strong>{req.value}</strong>
                      <span>{req.label.replace(`${req.value} `, '')}</span>
                    </div>
                    <div className="check-indicator">
                      <i className="fas fa-check"></i>
                    </div>
                  </div>
                ))}
              </div>
              {errors.requerimientos && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {errors.requerimientos}
                </div>
              )}
            </div>
            
            {/* Dirección del Paciente */}
            <div className={`form-group ${touchedFields.direccion && formData.direccion ? 'has-success' : ''}`}>
              <div className="input-container">
                <label htmlFor="direccion">
                  <i className="fas fa-map-marker-alt"></i> Dirección del Paciente
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingrese la dirección del paciente (opcional)"
                />
                {touchedFields.direccion && formData.direccion && (
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                )}
              </div>
            </div>
            
            {/* Agencia */}
            <div className={`form-group ${errors.agencia_id ? 'has-error' : ''} ${touchedFields.agencia_id && formData.agencia_id ? 'has-success' : ''}`}>
              <div className="input-container">
                <label htmlFor="agencia">
                  <i className="fas fa-hospital"></i> Agencia <span className="required">*</span>
                </label>
                <div className="search-container">
                  <input
                    ref={agenciaInputRef}
                    type="text"
                    id="agencia"
                    name="agencia"
                    value={searchAgencia}
                    onChange={handleSearchAgencia}
                    onClick={toggleAgenciasList}
                    placeholder="Buscar agencia..."
                    className={errors.agencia_id ? 'error' : ''}
                  />
                  
                  {showAgenciasList && (
                    <div ref={agenciasListRef} className="dropdown-results">
                      {filteredAgencias.length > 0 ? (
                        filteredAgencias.map(agencia => (
                          <div 
                            key={agencia.id} 
                            className="dropdown-item"
                            onClick={() => handleSelectAgencia(agencia)}
                          >
                            <i className="fas fa-building"></i> {agencia.name}
                          </div>
                        ))
                      ) : (
                        <div className="no-results">
                          <i className="fas fa-info-circle"></i> No se encontraron agencias
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.agencia_id && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.agencia_id}
                  </div>
                )}
                {touchedFields.agencia_id && formData.agencia_id && !errors.agencia_id && (
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                )}
              </div>
            </div>
            
            {/* Notas del Correo */}
            <div className={`form-group ${touchedFields.notas && formData.notas ? 'has-success' : ''}`}>
              <div className="input-container">
                <label htmlFor="notas">
                  <i className="fas fa-sticky-note"></i> Notas del Correo
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Copie y pegue aquí información relevante del correo"
                  rows={4}
                ></textarea>
              </div>
            </div>
            
            {/* Link del Correo Original */}
            <div className={`form-group ${errors.link_correo ? 'has-error' : ''} ${touchedFields.link_correo && formData.link_correo ? 'has-success' : ''}`}>
              <div className="input-container">
                <label htmlFor="link_correo">
                  <i className="fas fa-link"></i> Link del Correo Original <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="link_correo"
                  name="link_correo"
                  value={formData.link_correo}
                  onChange={handleInputChange}
                  placeholder="Ingrese el link al correo original"
                  className={errors.link_correo ? 'error' : ''}
                />
                {errors.link_correo && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {errors.link_correo}
                  </div>
                )}
                {touchedFields.link_correo && formData.link_correo && !errors.link_correo && (
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botón de envío */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/pacientes')}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Registrar Paciente
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={logoImg} alt="Motive Homecare Logo" className="footer-logo" />
            <div className="footer-info">
              <p>Motive Homecare &copy; 2025</p>
              <p>Mejorando la calidad de vida a través de terapias especializadas</p>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-contact">
              <h3>Contacto</h3>
              <p><i className="fas fa-map-marker-alt"></i> Los Angeles, CA</p>
              <p><i className="fas fa-phone-alt"></i> (213) 495-0092</p>
              <p><i className="fas fa-envelope"></i> info@motivehomecare.com</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modal de carga */}
      <LoadingModal 
        isOpen={loadingModalOpen}
        status={loadingStatus}
        message={loadingMessage}
      />
    </div>
  );
};

export default Referrals;