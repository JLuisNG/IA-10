import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AgenciaCard from './AgenciaCard';
import AgenciaModal from './AgenciaModal';
import ConfirmModal from './ConfirmModal';
import LoadingModal from './LoadingModal';
import '../../styles/Welcome.scss';
import '../../styles/Agencies.scss';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';

const Agencias = () => {
  const navigate = useNavigate();
  const [agencias, setAgencias] = useState([]);
  const [filteredAgencias, setFilteredAgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('loading'); // loading, success, error
  const [currentAgencia, setCurrentAgencia] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Función para cargar los datos de las agencias
  const fetchAgencias = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3002/api/agencias');
      if (!response.ok) {
        throw new Error('Error al cargar las agencias');
      }
      const data = await response.json();
      setAgencias(data);
      setFilteredAgencias(data);
      
      // Calcular el total de pacientes
      const total = data.reduce((sum, agencia) => sum + (agencia.patients || 0), 0);
      setTotalPatients(total);
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencias();
  }, [fetchAgencias]);

  // Filtrar agencias cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAgencias(agencias);
    } else {
      const filtered = agencias.filter(agencia => 
        agencia.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgencias(filtered);
    }
  }, [searchTerm, agencias]);

  // Manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Abrir modal para agregar una nueva agencia
  const handleAddAgencia = () => {
    setCurrentAgencia(null);
    setModalOpen(true);
  };

  // Abrir modal para editar una agencia existente
  const handleEditAgencia = (agencia) => {
    setCurrentAgencia(agencia);
    setModalOpen(true);
  };

  // Abrir modal de confirmación para eliminar una agencia
  const handleDeletePrompt = (agencia) => {
    setCurrentAgencia(agencia);
    setConfirmModalOpen(true);
  };

  // Toggle para el dropdown del usuario
  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
  };

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserDropdown) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Función para cerrar sesión
  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  // Función para guardar una agencia (crear o actualizar)
  const handleSaveAgencia = async (agenciaData) => {
    setModalOpen(false);
    setLoadingMessage(currentAgencia ? 'Actualizando agencia...' : 'Creando agencia...');
    setLoadingStatus('loading');
    setLoadingModalOpen(true);
    
    try {
      const url = currentAgencia 
        ? `http://localhost:3002/api/agencias/${currentAgencia.id}` 
        : 'http://localhost:3002/api/agencias';
      
      const method = currentAgencia ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agenciaData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la agencia');
      }

      // Simular una pequeña demora para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoadingStatus('success');
      setLoadingMessage(currentAgencia ? 'Agencia actualizada' : 'Agencia creada');
      
      // Otra pequeña demora para mostrar el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar las agencias
      await fetchAgencias();
      setLoadingModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingStatus('error');
      setLoadingMessage('Error al procesar la solicitud');
      
      // Demora para mostrar el mensaje de error
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingModalOpen(false);
    }
  };

  // Función para eliminar una agencia
  const handleDeleteAgencia = async () => {
    setConfirmModalOpen(false);
    
    if (!currentAgencia) return;
    
    setLoadingMessage('Eliminando agencia...');
    setLoadingStatus('loading');
    setLoadingModalOpen(true);
    
    try {
      const response = await fetch(`http://localhost:3002/api/agencias/${currentAgencia.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la agencia');
      }

      // Simular una pequeña demora para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoadingStatus('success');
      setLoadingMessage('Agencia eliminada');
      
      // Otra pequeña demora para mostrar el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar las agencias
      await fetchAgencias();
      setCurrentAgencia(null);
      setLoadingModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingStatus('error');
      setLoadingMessage('Error al eliminar la agencia');
      
      // Demora para mostrar el mensaje de error
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingModalOpen(false);
    }
  };

  return (
    <>
      {/* Pantalla de carga */}
      <div className={`loading-screen ${!loading ? 'hidden' : ''}`}>
        <div className="loading-screen__content">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
      
      {/* Header de Welcome */}
      <header className="header">
        <div className="header__logo">
          <img src={logoImg} alt="Logo" className="header__logo-img" onClick={() => navigate('/welcome')} style={{ cursor: 'pointer' }} />
        </div>
        <nav className="header__nav">
          <ul className="header__menu">

            <li className="header__item">
              <span 
                className="header__link active" 
                onClick={() => navigate('/agencias')}
                style={{ cursor: 'pointer' }}
              >
                AGENCIAS
              </span>
            </li>

          </ul>
        </nav>
        <div className="header__user">
          <span className="header__username" onClick={toggleUserDropdown}>Luis Nava <i className="fas fa-chevron-down"></i></span>
          <ul className="header__dropdown" style={{ display: showUserDropdown ? 'block' : 'none' }}>
            <li className="header__dropdown-item">
              <button className="header__dropdown-link">Ver Credenciales</button>
            </li>
            <li className="header__dropdown-item">
              <button className="header__dropdown-link" onClick={handleLogout}>Log Out</button>
            </li>
          </ul>
        </div>
      </header>
      
      {/* Contenido principal de Agencias */}
      <div className="agencies-container">
        {/* Header con título y contador de pacientes */}
        <div className="agencies-container__header">
          <h2 className="agencies-container__header-title">AGENCIAS</h2>
          <h1 className="agencies-container__header-subtitle">
            {totalPatients.toLocaleString()}
          </h1>
          <p className="agencies-container__header-description">Pacientes que hemos recibido</p>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="agencies-container__search">
          <div className="agencies-container__search-wrapper">
            <input 
              type="text" 
              className="agencies-container__search-input" 
              placeholder="Buscar agencia..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="agencies-container__search-button">
              <i className="fas fa-search"></i>
            </button>
            <button className="agencies-container__search-add" onClick={handleAddAgencia}>
              <i className="fas fa-plus"></i> Nueva Agencia
            </button>
          </div>
        </div>
        
        {/* Grid de agencias */}
        <div className="agencies-container__grid">
          {loading ? (
            <p className="agencies-container__loading">Cargando agencias...</p>
          ) : filteredAgencias.length > 0 ? (
            filteredAgencias.map(agencia => (
              <AgenciaCard 
                key={agencia.id} 
                agencia={agencia} 
                onEdit={() => handleEditAgencia(agencia)}
                onDelete={() => handleDeletePrompt(agencia)}
              />
            ))
          ) : (
            <p className="agencies-container__empty">No se encontraron agencias</p>
          )}
        </div>
      </div>
      
      {/* Footer de Welcome */}
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
              <li><span className="footer__link" onClick={() => navigate('/welcome')} style={{ cursor: 'pointer' }}>Inicio</span></li>
              <li><span className="footer__link" onClick={() => navigate('/pacientes')} style={{ cursor: 'pointer' }}>Pacientes</span></li>
              <li><span className="footer__link" onClick={() => navigate('/ubicacion')} style={{ cursor: 'pointer' }}>Terapeutas</span></li>
              <li><span className="footer__link" onClick={() => navigate('/reportes')} style={{ cursor: 'pointer' }}>Reportes</span></li>
              <li><span className="footer__link" onClick={() => navigate('/soporte')} style={{ cursor: 'pointer' }}>Soporte</span></li>
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
            &copy; 2025 Motive Homecare. Todos los derechos reservados.
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
      
      {/* Modal para crear/editar agencia */}
      <AgenciaModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAgencia}
        agencia={currentAgencia}
      />
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal 
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteAgencia}
        title="Eliminar Agencia"
        message={`¿Estás seguro de que deseas eliminar la agencia "${currentAgencia?.name}"? Esta acción no se puede deshacer.`}
      />
      
      {/* Modal de carga para operaciones */}
      <LoadingModal 
        isOpen={loadingModalOpen}
        status={loadingStatus}
        message={loadingMessage}
      />
    </>
  );
};

export default Agencias;