import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgenciaCard from './AgenciaCard.jsx';
import AgenciaModal from './AgenciaModal.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import LoadingModal from './LoadingModal.jsx';
import '../../styles/Agencias.scss';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';

const Agencias = () => {
  const navigate = useNavigate();
  const [agencias, setAgencias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModalForm, setShowModalForm] = useState(false);
  const [editingAgencia, setEditingAgencia] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agenciaToDelete, setAgenciaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Cargar agencias
  const fetchAgencias = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/agencias');
      const data = await response.json();
      setAgencias(data);
      
      // Calcular total de pacientes atendidos
      const total = data.reduce((sum, agencia) => sum + (agencia.patients || 0), 0);
      setTotalPatients(total);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener agencias:', error);
      setIsLoading(false);
    }
  };

  // Buscar agencias
  const searchAgencias = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/agencias/search?term=${searchTerm}`);
      const data = await response.json();
      setAgencias(data);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    }
  };

  useEffect(() => {
    fetchAgencias();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const debounceSearch = setTimeout(() => {
        searchAgencias();
      }, 300);
      return () => clearTimeout(debounceSearch);
    } else {
      fetchAgencias();
    }
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
  };

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

  const handleAddNew = () => {
    setEditingAgencia(null);
    setShowModalForm(true);
  };

  const handleEdit = (agencia) => {
    setEditingAgencia(agencia);
    setShowModalForm(true);
  };

  const handleDelete = (agencia) => {
    setAgenciaToDelete(agencia);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/agencias/${agenciaToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTimeout(() => {
          setIsDeleting(false);
          fetchAgencias();
        }, 1000); // Tiempo extra para la animación
      } else {
        console.error('Error al eliminar agencia');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error al eliminar agencia:', error);
      setIsDeleting(false);
    }
  };

  const handleSaveAgencia = async (agenciaData) => {
    try {
      if (editingAgencia) {
        // Actualizar agencia existente
        await fetch(`http://localhost:3001/api/agencias/${editingAgencia.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agenciaData),
        });
      } else {
        // Crear nueva agencia
        await fetch('http://localhost:3001/api/agencias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agenciaData),
        });
      }
      
      setShowModalForm(false);
      fetchAgencias();
    } catch (error) {
      console.error('Error al guardar agencia:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={logoImg} alt="Logo" className="header__logo-img" />
        </div>
        <nav className="header__nav">
          <ul className="header__menu">
            <li className="header__item">
              <span 
                className="header__link active-link" 
                onClick={() => navigate('/agencias')}
                style={{ cursor: 'pointer' }}
              >
                AGENCIAS
              </span>
            </li>
          </ul>
        </nav>
        <div className="header__user">
          <span className="header__username" onClick={toggleUserDropdown}>
            Luis Nava <i className="fas fa-chevron-down"></i>
          </span>
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

      {/* Contenido principal */}
      <div className="agencias-container">
        <div className="agencias-header">
          <h1>Pacientes que hemos recibido</h1>
          <div className="counter-number">{totalPatients.toLocaleString()}</div>
        </div>
        
        <div className="search-bar">
          <input 
            type="text"
            placeholder="Buscar agencia..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
          
          <button className="add-button" onClick={handleAddNew}>
            <i className="fas fa-plus"></i> Nueva Agencia
          </button>
        </div>
        
        <div className="agencias-grid">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando agencias...</p>
            </div>
          ) : agencias.length > 0 ? (
            agencias.map(agencia => (
              <AgenciaCard 
                key={agencia.id} 
                agencia={agencia} 
                onEdit={() => handleEdit(agencia)}
                onDelete={() => handleDelete(agencia)}
              />
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-search fa-3x"></i>
              <p>No se encontraron agencias</p>
              {searchTerm && (
                <button className="reset-button" onClick={() => setSearchTerm('')}>
                  Mostrar todas las agencias
                </button>
)}
</div>
)}
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

{/* Modales */}
{showModalForm && (
<AgenciaModal 
agencia={editingAgencia} 
onClose={() => setShowModalForm(false)} 
onSave={handleSaveAgencia}
/>
)}

{showDeleteConfirm && (
<ConfirmModal
title="Eliminar Agencia"
message={`¿Estás seguro de que deseas eliminar la agencia "${agenciaToDelete.name}"? Esta acción no se puede deshacer.`}
confirmText="Eliminar"
cancelText="Cancelar"
onConfirm={confirmDelete}
onCancel={() => setShowDeleteConfirm(false)}
/>
)}

{isDeleting && (
<LoadingModal message="Eliminando agencia..." />
)}
</>
);
};

export default Agencias;