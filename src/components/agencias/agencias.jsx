import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/agencias.scss';

const Agencias = () => {
  // Estados
  const [agenciesList, setAgenciesList] = useState([]);
  const [totalPatientsCounter, setTotalPatientsCounter] = useState(6467);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1);
  const [currentDeleteIndex, setCurrentDeleteIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [newAgencyModal, setNewAgencyModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  
  // Estados para nuevo formulario
  const [newAgency, setNewAgency] = useState({
    name: '',
    email: '',
    address: 'Los Angeles, California',
    phone: '',
    status: 'Activo',
    docs: 'No',
    logo: '/api/placeholder/64/64',
    patients: 0
  });
  
  // Estados para editar formulario
  const [editAgency, setEditAgency] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    status: '',
    docs: '',
    logo: '',
    patients: 0
  });

  // Cargar agencias desde la API
  useEffect(() => {
    const fetchAgencias = async () => {
      try {
        setLoading(true);
        console.log('Intentando cargar agencias desde el servidor...');
        
        // Hacemos un fetch directamente a la URL completa
        const response = await fetch('http://localhost:3002/api/agencias');
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
        }
        
        // Intentamos parsear la respuesta como JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('La respuesta no es JSON:', text.substring(0, 200));
          throw new Error('La respuesta del servidor no es JSON válido');
        }
        
        const data = await response.json();
        console.log('Datos recibidos de la API:', data);
        
        if (Array.isArray(data)) {
          console.log(`Cargadas ${data.length} agencias desde la API`);
          setAgenciesList(data);
        } else {
          console.error('Los datos recibidos no son un array:', data);
          throw new Error('Formato de datos incorrecto');
        }
        
        setError(null);
      } catch (error) {
        console.error('Error al cargar las agencias:', error);
        setError(`Error al cargar las agencias: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgencias();
  }, []);

  // Función para generar teléfono aleatorio
  const generateRandomPhone = () => {
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `(213) ${prefix}-${line}`;
  };

  // Función para generar email basado en el nombre
  const generateEmail = (name) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return `contact@${cleanName}.com`;
  };

  // Función para validar formulario
  const validateForm = (form) => {
    if (!form.name.trim()) {
      alert('El nombre de la agencia es obligatorio');
      return false;
    }
    if (!form.email.trim()) {
      alert('El correo electrónico es obligatorio');
      return false;
    }
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert('Por favor ingrese un correo electrónico válido');
      return false;
    }
    return true;
  };

  // Manejar cambios en el formulario de nueva agencia
  const handleNewAgencyChange = (e) => {
    const { name, value } = e.target;
    setNewAgency(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en el formulario de editar agencia
  const handleEditAgencyChange = (e) => {
    const { name, value } = e.target;
    setEditAgency(prev => ({ ...prev, [name]: value }));
  };

  // Manejar previsualización del logo
  const handleLogoPreview = (e, setAgencyFunc) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAgencyFunc(prev => ({ ...prev, logo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir modal para nueva agencia
  const openNewAgencyModal = () => {
    setNewAgency({
      name: '',
      email: '',
      address: 'Los Angeles, California',
      phone: '',
      status: 'Activo',
      docs: 'No',
      logo: '/api/placeholder/64/64',
      patients: 0
    });
    setNewAgencyModal(true);
  };

  // Crear nueva agencia
  const createNewAgency = async () => {
    if (!validateForm(newAgency)) return;

    // Si el teléfono está vacío, generar uno aleatorio
    const agencyToCreate = { 
      ...newAgency,
      phone: newAgency.phone || generateRandomPhone()
    };

    try {
      const response = await fetch('http://localhost:3002/api/agencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agencyToCreate)
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear la agencia: ${response.status} ${response.statusText}`);
      }
      
      const newAgencyData = await response.json();
      console.log('Agencia creada:', newAgencyData);
      
      setAgenciesList(prevList => [...prevList, newAgencyData]);
      setNewAgencyModal(false);
    } catch (error) {
      console.error('Error al crear nueva agencia:', error);
      alert(`Error al crear la agencia: ${error.message}`);
    }
  };

  // Preparar edición de agencia
  const prepareEditAgency = (index) => {
    setCurrentEditIndex(index);
    setEditAgency({...agenciesList[index]});
    setEditModal(true);
  };

  // Guardar cambios de agencia
  const saveAgencyChanges = async () => {
    if (!validateForm(editAgency)) return;

    try {
      const response = await fetch(`http://localhost:3002/api/agencias/${editAgency.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editAgency)
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar la agencia: ${response.status} ${response.statusText}`);
      }
      
      const updatedAgencyData = await response.json();
      console.log('Agencia actualizada:', updatedAgencyData);
      
      const updatedAgencies = [...agenciesList];
      updatedAgencies[currentEditIndex] = updatedAgencyData;
      setAgenciesList(updatedAgencies);
      
      setEditModal(false);
      setCurrentEditIndex(-1);
    } catch (error) {
      console.error('Error al actualizar agencia:', error);
      alert(`Error al actualizar la agencia: ${error.message}`);
    }
  };

  // Preparar eliminación de agencia
  const prepareDeleteAgency = (index) => {
    setCurrentDeleteIndex(index);
    setDeleteModal(true);
  };

  // Confirmar eliminación de agencia
  const confirmDeleteAgency = async () => {
    if (currentDeleteIndex !== -1) {
      const agencyId = agenciesList[currentDeleteIndex].id;
      
      try {
        const response = await fetch(`http://localhost:3002/api/agencias/${agencyId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error al eliminar la agencia: ${response.status} ${response.statusText}`);
        }
        
        console.log('Agencia eliminada con ID:', agencyId);
        
        const updatedAgencies = agenciesList.filter((_, index) => index !== currentDeleteIndex);
        setAgenciesList(updatedAgencies);
        
        setDeleteModal(false);
        setCurrentDeleteIndex(-1);
      } catch (error) {
        console.error('Error al eliminar agencia:', error);
        alert(`Error al eliminar la agencia: ${error.message}`);
      }
    }
  };

  // Filtrar agencias según término de búsqueda
  const filteredAgencies = agenciesList.filter(agency => 
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Contenido principal */}
      <main className="agencies-container">
        {/* Contador Global de Pacientes */}
        <section className="global-patients-counter">
          <div className="global-patients-card">
            <h2>Pacientes que hemos recibido</h2>
            <div className="global-counter">
              <span className="counter-number" id="totalPatientsCounter">{totalPatientsCounter.toLocaleString()}</span>
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
              <i className="fas fa-search"></i>
            </button>
          </div>
          <button className="add-agency-btn" onClick={openNewAgencyModal}>
            <i className="fas fa-plus"></i>
            Nueva Agencia
          </button>
        </section>

        {/* Mostrar mensaje de carga o error */}
        {loading && <p className="loading-message">Cargando agencias...</p>}
        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <p>Asegúrate de que el servidor esté en ejecución en el puerto 3002</p>
          </div>
        )}

        {/* Grid de agencias */}
        <div className="agencies-grid" id="agenciesGrid">
          {filteredAgencies.length === 0 && !loading ? (
            <p className="no-results">No se encontraron agencias</p>
          ) : (
            filteredAgencies.map((agency, index) => (
              <div className="agency-card" key={agency.id || index}>
                <div className="agency-card__header">
                  <div className="agency-logo">
                    <img src={agency.logo} alt={`${agency.name} Logo`} />
                  </div>
                  <h3 className="agency-card__name">{agency.name}</h3>
                  <div className="agency-card__actions">
                    <button className="edit-btn" onClick={() => prepareEditAgency(index)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => prepareDeleteAgency(index)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="agency-card__content">
                  <div className="agency-contact-info">
                    <p className="agency-address">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{agency.address}</span>
                    </p>
                    <p className="agency-phone">
                      <i className="fas fa-phone"></i>
                      <span>{agency.phone}</span>
                    </p>
                    <p className="agency-email">
                      <i className="fas fa-envelope"></i>
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
      {newAgencyModal && (
        <div className="modal active" id="newAgencyModal">
          <div className="modal__overlay" onClick={() => setNewAgencyModal(false)}></div>
          <div className="modal__content">
            <div className="modal__header">
              <h2>Nueva Agencia</h2>
              <button className="modal__close" onClick={() => setNewAgencyModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <form id="newAgencyForm" className="form">
                {/* Sección de Logo */}
                <div className="agency-logo-upload">
                  <div className="agency-logo-preview" id="newLogoPreview">
                    <img src={newAgency.logo} alt="Vista previa del logo" id="newLogoImg" />
                  </div>
                  <input 
                    type="file" 
                    id="newLogo" 
                    name="logo" 
                    accept="image/*" 
                    onChange={(e) => handleLogoPreview(e, setNewAgency)}
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
                        value={newAgency.name}
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
                        value={newAgency.email}
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
                        value={newAgency.phone}
                        onChange={handleNewAgencyChange}
                      />
                    </div>
                    <div className="form__group">
                      <label htmlFor="newAddress">Dirección</label>
                      <input 
                        type="text" 
                        id="newAddress" 
                        name="address" 
                        placeholder="Ej: Los Angeles, California"
                        value={newAgency.address}
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
                        value={newAgency.status}
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
                        value={newAgency.docs}
                        onChange={handleNewAgencyChange}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setNewAgencyModal(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={createNewAgency}>Crear Agencia</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar agencia */}
      {editModal && (
        <div className="modal active" id="editModal">
          <div className="modal__overlay" onClick={() => setEditModal(false)}></div>
          <div className="modal__content">
            <div className="modal__header">
              <h2>Editar Agencia</h2>
              <button className="modal__close" onClick={() => setEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <form id="editAgencyForm" className="form">
                {/* Sección de Logo */}
                <div className="agency-logo-upload">
                  <div className="agency-logo-preview" id="editLogoPreview">
                    <img src={editAgency.logo} alt="Vista previa del logo" id="editLogoImg" />
                  </div>
                  <input 
                    type="file" 
                    id="editLogo" 
                    name="logo" 
                    accept="image/*" 
                    onChange={(e) => handleLogoPreview(e, setEditAgency)}
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
                        value={editAgency.name}
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
                        value={editAgency.email}
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
                        value={editAgency.phone}
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
                        value={editAgency.address}
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
                        value={editAgency.status}
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
                        value={editAgency.docs}
                        onChange={handleEditAgencyChange}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setEditModal(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={saveAgencyChanges}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {deleteModal && (
        <div className="modal active" id="deleteModal">
          <div className="modal__overlay" onClick={() => setDeleteModal(false)}></div>
          <div className="modal__content modal__content--small">
            <div className="modal__header">
              <h2>Confirmar Eliminación</h2>
              <button className="modal__close" onClick={() => setDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <p>¿Estás seguro que deseas eliminar esta agencia?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setDeleteModal(false)}>Cancelar</button>
              <button className="btn btn--danger" onClick={confirmDeleteAgency}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Agencias;