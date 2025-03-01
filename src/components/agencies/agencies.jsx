import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash, faTimes, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';
import '../../styles/agencies.scss';
import '../../styles/Welcome.scss';

/**
 * Componente para la gestión de agencias
 * Este componente muestra una lista de agencias obtenidas desde MySQL,
 * permite crear nuevas agencias, editar y eliminar existentes.
 * 
 * @returns {JSX.Element} Componente de Agencias
 */
const Agencies = () => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Estados para manejar las agencias y los modales
  const [agencies, setAgencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);
  
  // Estados para modales
  const [newAgencyModalActive, setNewAgencyModalActive] = useState(false);
  const [editModalActive, setEditModalActive] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  
  // Estado para la agencia actual (editar/eliminar)
  const [currentAgency, setCurrentAgency] = useState(null);
  
  // Estado para formularios
  const [newAgencyForm, setNewAgencyForm] = useState({
    name: '',
    email: '',
    address: 'Los Angeles, California',
    phone: '',
    status: 'Activo',
    docs: 'No',
    logo: '/api/placeholder/64/64'
  });
  
  const [editAgencyForm, setEditAgencyForm] = useState({
    id: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    status: '',
    docs: '',
    logo: '/api/placeholder/64/64'
  });

  // Toggle para el dropdown del usuario
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.header__user')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Cargar agencias desde el servidor
  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/agencies');
      if (!response.ok) {
        throw new Error('Error al cargar las agencias');
      }
      const data = await response.json();
      setAgencies(data);
      
      // Calcular el total de pacientes
      const total = data.reduce((sum, agency) => sum + agency.patients, 0);
      setTotalPatients(total);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores de eventos para los formularios
  const handleNewAgencyChange = (e) => {
    const { name, value } = e.target;
    setNewAgencyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditAgencyChange = (e) => {
    const { name, value } = e.target;
    setEditAgencyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones para manejar el logo
  const handleNewLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewAgencyForm(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditAgencyForm(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Funciones para manejar los modales
  const openNewAgencyModal = () => {
    setNewAgencyForm({
      name: '',
      email: '',
      address: 'Los Angeles, California',
      phone: '',
      status: 'Activo',
      docs: 'No',
      logo: '/api/placeholder/64/64'
    });
    setNewAgencyModalActive(true);
  };

  const openEditModal = (agency) => {
    setCurrentAgency(agency);
    setEditAgencyForm({
      id: agency.id,
      name: agency.name,
      email: agency.email,
      address: agency.address,
      phone: agency.phone,
      status: agency.status,
      docs: agency.docs,
      logo: agency.logo
    });
    setEditModalActive(true);
  };

  const openDeleteModal = (agency) => {
    setCurrentAgency(agency);
    setDeleteModalActive(true);
  };

  const closeNewAgencyModal = () => {
    setNewAgencyModalActive(false);
  };

  const closeEditModal = () => {
    setEditModalActive(false);
  };

  const closeDeleteModal = () => {
    setDeleteModalActive(false);
  };

  // Validación de formularios
  const validateForm = (form) => {
    if (!form.name.trim()) {
      alert('El nombre de la agencia es obligatorio');
      return false;
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      alert('El correo electrónico es obligatorio y debe ser válido');
      return false;
    }
    return true;
  };

  // Crear nueva agencia
  const createNewAgency = async () => {
    if (!validateForm(newAgencyForm)) return;

    try {
      const response = await fetch('http://localhost:3001/api/agencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgencyForm),
      });

      if (!response.ok) {
        throw new Error('Error al crear la agencia');
      }

      // Recargar agencias
      await fetchAgencies();
      closeNewAgencyModal();
    } catch (error) {
      console.error("Error creating agency:", error);
      alert('Error al crear la agencia. Por favor, inténtalo de nuevo.');
    }
  };

  // Actualizar agencia
  const updateAgency = async () => {
    if (!validateForm(editAgencyForm)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/agencies/${editAgencyForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editAgencyForm),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la agencia');
      }

      // Recargar agencias
      await fetchAgencies();
      closeEditModal();
    } catch (error) {
      console.error("Error updating agency:", error);
      alert('Error al actualizar la agencia. Por favor, inténtalo de nuevo.');
    }
  };

  // Eliminar agencia
  const deleteAgency = async () => {
    if (!currentAgency) return;

    try {
      const response = await fetch(`http://localhost:3001/api/agencies/${currentAgency.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la agencia');
      }

      // Recargar agencias
      await fetchAgencies();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert('Error al eliminar la agencia. Por favor, inténtalo de nuevo.');
    }
  };

  // Filtrar agencias por término de búsqueda
  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      {/* Pantalla de carga */}
      <div className={`loading-screen ${!loading ? 'hidden' : ''}`} id="loading-screen">
        <div className="loading-screen__content">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img 
            src={logoImg} 
            alt="Logo" 
            className="header__logo-img" 
            onClick={() => navigate('/welcome')}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <nav className="header__nav">
          <ul className="header__menu">
            <li className="header__item">
              <span className="header__link active">AGENCIAS</span>
            </li>
          </ul>
        </nav>
        <div className="header__user">
          <span className="header__username" onClick={toggleUserDropdown} style={{ cursor: 'pointer' }}>
            Luis Nava <i className="fas fa-chevron-down arrow-down"></i>
          </span>
          <ul className="header__dropdown" style={{ display: showUserDropdown ? 'block' : 'none' }}>
            <li className="header__dropdown-item">
              <a href="#" className="header__dropdown-link">Ver Credenciales</a>
            </li>
            <li className="header__dropdown-item">
              <a href="#" className="header__dropdown-link" onClick={handleLogout}>Log Out</a>
            </li>
          </ul>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="agencies-container">
        {/* Contador Global de Pacientes */}
        <section className="global-patients-counter">
          <div className="global-patients-card">
            <h2>Pacientes que hemos recibido</h2>
            <div className="global-counter">
              <span className="counter-number" id="totalPatientsCounter">
                {totalPatients.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Sección de búsqueda y filtros */}
        <section className="agencies-search">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Buscar agencia..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          <button className="add-agency-btn" onClick={openNewAgencyModal}>
            <FontAwesomeIcon icon={faPlus} />
            Nueva Agencia
          </button>
        </section>

        {/* Grid de agencias */}
        <div className="agencies-grid" id="agenciesGrid">
          {loading ? (
            <div className="loading-message">Cargando agencias...</div>
          ) : filteredAgencies.length === 0 ? (
            <div className="no-agencies-message">No se encontraron agencias con ese nombre</div>
          ) : (
            filteredAgencies.map(agency => (
              <div className="agency-card" key={agency.id}>
                <div className="agency-card__header">
                  <div className="agency-logo">
                    <img src={agency.logo || '/api/placeholder/64/64'} alt={`${agency.name} Logo`} />
                  </div>
                  <h3 className="agency-card__name">{agency.name}</h3>
                  <div className="agency-card__actions">
                    <button className="edit-btn" onClick={() => openEditModal(agency)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="delete-btn" onClick={() => openDeleteModal(agency)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                <div className="agency-card__content">
                  <div className="agency-contact-info">
                    <p className="agency-address">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{agency.address}</span>
                    </p>
                    <p className="agency-phone">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{agency.phone}</span>
                    </p>
                    <p className="agency-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{agency.email}</span>
                    </p>
                  </div>
                  <div className="agency-patient-counter">
                    <span className="counter-number">{agency.patients}</span>
                    <span className="counter-label">Pacientes de esta Agencia</span>
                  </div>
                  <div className="agency-status-docs">
                    <p><strong>Estado:</strong> {agency.status}</p>
                    <p><strong>Documentos:</strong> {agency.docs}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal para nueva agencia */}
      <div className={`modal ${newAgencyModalActive ? 'active' : ''}`} id="newAgencyModal">
        <div className="modal__overlay"></div>
        <div className="modal__content">
          <div className="modal__header">
            <h2>Nueva Agencia</h2>
            <button className="modal__close" onClick={closeNewAgencyModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="modal__body">
            <form id="newAgencyForm" className="form">
              {/* Sección de Logo */}
              <div className="agency-logo-upload">
                <div className="agency-logo-preview" id="newLogoPreview">
                  <img src={newAgencyForm.logo} alt="Vista previa del logo" id="newLogoImg" />
                </div>
                <input 
                  type="file" 
                  id="newLogo" 
                  name="logo" 
                  accept="image/*" 
                  onChange={handleNewLogoChange} 
                />
                <label htmlFor="newLogo" className="logo-upload-btn">Subir Logo</label>
              </div>

              {/* Información Básica en dos columnas */}
              <div className="form__section">
                <h3>Información Básica</h3>
                <div className="form__two-columns">
                  <div className="form__group">
                    <label htmlFor="newName">Nombre de la Agencia</label>
                    <input 
                      type="text" 
                      id="newName" 
                      name="name" 
                      placeholder="Ej: Sunshine Care" 
                      required
                      value={newAgencyForm.name}
                      onChange={handleNewAgencyChange}
                    />
                    <span className="validation-error">El nombre es obligatorio</span>
                  </div>
                  <div className="form__group">
                    <label htmlFor="newEmail">Correo Electrónico</label>
                    <input 
                      type="email" 
                      id="newEmail" 
                      name="email" 
                      placeholder="Ej: info@sunshinecare.com" 
                      required
                      value={newAgencyForm.email}
                      onChange={handleNewAgencyChange}
                    />
                    <span className="validation-error">Ingrese un correo válido</span>
                  </div>
                </div>
              </div>

              {/* Información de Contacto en dos columnas */}
              <div className="form__section">
                <h3>Información de Contacto</h3>
                <div className="form__two-columns">
                  <div className="form__group">
                    <label htmlFor="newPhone">Teléfono</label>
                    <input 
                      type="tel" 
                      id="newPhone" 
                      name="phone" 
                      placeholder="Ej: (213) 555-1234"
                      value={newAgencyForm.phone}
                      onChange={handleNewAgencyChange}
                    />
                  </div>
                  <div className="form__group">
                    <label htmlFor="newAddress">Dirección</label>
                    <input 
                      type="text" 
                      id="newAddress" 
                      name="address" 
                      value={newAgencyForm.address}
                      placeholder="Ej: Los Angeles, California"
                      onChange={handleNewAgencyChange}
                    />
                  </div>
                </div>
              </div>

              {/* Estado y Documentos en dos columnas */}
              <div className="form__section">
                <h3>Estado y Documentos</h3>
                <div className="form__two-columns">
                  <div className="form__group">
                    <label htmlFor="newStatus">Estado</label>
                    <input 
                      type="text" 
                      id="newStatus" 
                      name="status" 
                      placeholder="Ej: Activo"
                      value={newAgencyForm.status}
                      onChange={handleNewAgencyChange}
                    />
                  </div>
                  <div className="form__group">
                    <label htmlFor="newDocs">Contrato Firmado / Docs Enviados</label>
                    <input 
                      type="text" 
                      id="newDocs" 
                      name="docs" 
                      placeholder="Ej: Sí / No"
                      value={newAgencyForm.docs}
                      onChange={handleNewAgencyChange}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={closeNewAgencyModal}>Cancelar</button>
            <button className="btn btn--primary" onClick={createNewAgency}>Crear Agencia</button>
          </div>
        </div>
      </div>

      {/* Modal para editar agencia */}
      <div className={`modal ${editModalActive ? 'active' : ''}`} id="editModal">
        <div className="modal__overlay"></div>
        <div className="modal__content">
          <div className="modal__header">
            <h2>Editar Agencia</h2>
            <button className="modal__close" onClick={closeEditModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="modal__body">
            <form id="editAgencyForm" className="form">
              {/* Sección de Logo */}
              <div className="agency-logo-upload">
                <div className="agency-logo-preview" id="editLogoPreview">
                  <img src={editAgencyForm.logo} alt="Vista previa del logo" id="editLogoImg" />
                </div>
                <input 
                  type="file" 
                  id="editLogo" 
                  name="logo" 
                  accept="image/*" 
                  onChange={handleEditLogoChange} 
                />
                <label htmlFor="editLogo" className="logo-upload-btn">Cambiar Logo</label>
              </div>

              {/* Información Básica en dos columnas */}
              <div className="form__section">
                <h3>Información Básica</h3>
                <div className="form__two-columns">
                  <div className="form__group">
                    <label htmlFor="editName">Nombre de la Agencia</label>
                    <input 
                      type="text" 
                      id="editName" 
                      name="name" 
                      placeholder="Ej: Sunshine Care" 
                      required
                      value={editAgencyForm.name}
                      onChange={handleEditAgencyChange}
                    />
                    <span className="validation-error">El nombre es obligatorio</span>
                  </div>
                  <div className="form__group">
                    <label htmlFor="editEmail">Correo Electrónico</label>
                    <input 
                      type="email" 
                      id="editEmail" 
                      name="email" 
                      placeholder="Ej: info@sunshinecare.com" 
                      required
                      value={editAgencyForm.email}
                      onChange={handleEditAgencyChange}
                    />
                    <span className="validation-error">Ingrese un correo válido</span>
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
                      value={editAgencyForm.phone}
                      onChange={handleEditAgencyChange}
                    />
                  </div>
                  <div className="form__group">
                    <label htmlFor="editAddress">Dirección</label>
                    <input 
                      type="text" 
                      id="editAddress" 
                      name="address" 
                      placeholder="Ej: Los Angeles, California"
                      value={editAgencyForm.address}
                      onChange={handleEditAgencyChange}
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
                      value={editAgencyForm.status}
                      onChange={handleEditAgencyChange}
                    />
                  </div>
                  <div className="form__group">
                    <label htmlFor="editDocs">Contrato Firmado / Docs Enviados</label>
                    <input 
                      type="text" 
                      id="editDocs" 
                      name="docs" 
                      placeholder="Ej: Sí / No"
                      value={editAgencyForm.docs}
                      onChange={handleEditAgencyChange}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={closeEditModal}>Cancelar</button>
            <button className="btn btn--primary" onClick={updateAgency}>Guardar Cambios</button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <div className={`modal ${deleteModalActive ? 'active' : ''}`} id="deleteModal">
        <div className="modal__overlay"></div>
        <div className="modal__content modal__content--small">
          <div className="modal__header">
            <h2>Confirmar Eliminación</h2>
            <button className="modal__close" onClick={closeDeleteModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="modal__body">
            <p>¿Estás seguro que deseas eliminar esta agencia?</p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
          </div>
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={closeDeleteModal}>Cancelar</button>
            <button className="btn btn--danger" onClick={deleteAgency}>Eliminar</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__section footer__about">
            <img src={logoImg} alt="Motive Homecare Logo" className="footer__logo" />
            <p className="footer__description">
              Motive Homecare proporciona servicios de terapia física, ocupacional y del habla de alta calidad con profesionales comprometidos con mejorar la calidad de vida de nuestros pacientes.
            </p>
            <p className="footer__founder">
              Fundado por <span className="footer__founder-name">Alex Martinez</span>
            </p>
          </div>
          
          <div className="footer__section footer__links">
            <h3 className="footer__title">Enlaces Rápidos</h3>
            <ul className="footer__menu">
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/ubicacion')} style={{cursor: 'pointer'}}>
                  UBICACIÓN DE SERVICIOS
                </span>
              </li>
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/welcome')} style={{cursor: 'pointer'}}>
                  REFERRALS
                </span>
              </li>
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/welcome')} style={{cursor: 'pointer'}}>
                  FRECUENCIAS
                </span>
              </li>
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/therapy-sync')} style={{cursor: 'pointer'}}>
                  THERAPY SYNC
                </span>
              </li>
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/welcome')} style={{cursor: 'pointer'}}>
                  PACIENTES
                </span>
              </li>
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/agencies')} style={{cursor: 'pointer'}}>
                  AGENCIAS
                </span>
              </li>
              <li className="header__item">
                <span className="header__link" onClick={() => navigate('/soporte')} style={{cursor: 'pointer'}}>
                  SOPORTE
                </span>
              </li>
            </ul>
          </div>
          
          <div className="footer__section footer__contact">
            <h3 className="footer__title">Contacto</h3>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <i className="fas fa-map-marker-alt footer__icon"></i>
                <span>Los Angeles, California</span>
              </li>
              <li className="footer__contact-item">
                <i className="fas fa-phone-alt footer__icon"></i>
                <span>+1 (213) 495-0092</span>
              </li>
              <li className="footer__contact-item">
                <i className="fas fa-envelope footer__icon"></i>
                <span>info@motivehomecare.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2025 Motive Homecare. Todos los derechos reservados.
          </p>
          <div className="footer__social">
            <a href="#" className="footer__social-link" title="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="footer__social-link" title="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="footer__social-link" title="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="footer__social-link" title="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Agencies;