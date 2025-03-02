import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/UbicacionServicios.scss';
import logoImg from '../../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';
import TerapeutaModal from './TerapeutaModal';
import TerapeutasTabla from './TerapeutasTabla';
import { useTerapeutas } from '../../../hooks/useTrapeutas';

const UbicacionServicios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentTerapeuta, setCurrentTerapeuta] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    area: '',
    discipline: '',
    category: ''
  });

  const { 
    terapeutas, 
    categories, 
    disciplines, 
    areas,
    filteredTerapeutas, 
    addTerapeuta, 
    updateTerapeuta, 
    deleteTerapeuta,
    exportTerapeutas
  } = useTerapeutas(searchTerm, filters);

  useEffect(() => {
    // Simular pantalla de carga
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(loadingTimeout);
  }, []);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

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

  const handleAddTerapeuta = () => {
    setCurrentTerapeuta(null);
    setShowModal(true);
  };

  const handleEditTerapeuta = (terapeuta) => {
    setCurrentTerapeuta(terapeuta);
    setShowModal(true);
  };

  const handleDeleteTerapeuta = (name) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este terapeuta?')) {
      deleteTerapeuta(name);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [id.replace('Filter', '')]: value
    }));
  };

  const handleSaveTerapeuta = (terapeuta) => {
    if (currentTerapeuta) {
      updateTerapeuta(currentTerapeuta.name, terapeuta);
    } else {
      addTerapeuta(terapeuta);
    }
    setShowModal(false);
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
      
      {/* Header con navegación */}
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
              <span 
                className="header__link active"
                onClick={() => navigate('/ubicacion')}
                style={{ cursor: 'pointer' }}
              >
                UBICACIÓN DE SERVICIOS
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link"
                onClick={() => navigate('/referrals')}
                style={{ cursor: 'pointer' }}
              >
                REFERRALS NEWS
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link"
                onClick={() => navigate('/pacientes')}
                style={{ cursor: 'pointer' }}
              >
                PACIENTES
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link"
                onClick={() => navigate('/frecuencias')}
                style={{ cursor: 'pointer' }}
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
          <ul className="header__dropdown" style={{ display: showUserDropdown ? 'block' : 'none' }}>
            <li className="header__dropdown-item">
              <button className="header__dropdown-link">Ver Credenciales</button>
            </li>
            <li className="header__dropdown-item">
              <button className="header__dropdown-link" onClick={handleLogout}>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        <div className="main-content__container">
          <div className="main-content__header">
            <h1 className="main-content__title">Ubicación de Servicios - Terapeutas</h1>
            <div className="action-buttons">
              <button className="add-therapist-btn" onClick={handleAddTerapeuta}>
                <i className="fas fa-plus"></i> Agregar Terapeuta
              </button>
              <button className="add-therapist-btn export-btn" onClick={exportTerapeutas}>
                <i className="fas fa-download"></i> Exportar Datos
              </button>
            </div>
          </div>

          <div className="search-section">
            <div className="search-container">
              <div className="search-box">
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Buscar por nombre, área, idioma..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="filter-container">
                <select 
                  id="areaFilter" 
                  className="filter-select"
                  value={filters.area}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las áreas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <select 
                  id="disciplineFilter" 
                  className="filter-select"
                  value={filters.discipline}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las disciplinas</option>
                  {Object.entries(disciplines).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                <select 
                  id="categoryFilter" 
                  className="filter-select"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las categorías</option>
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <TerapeutasTabla 
            terapeutas={filteredTerapeutas}
            categories={categories}
            disciplines={disciplines}
            onEdit={handleEditTerapeuta}
            onDelete={handleDeleteTerapeuta}
          />
        </div>

        {/* Modal para editar/agregar terapeuta */}
        {showModal && (
          <TerapeutaModal
            terapeuta={currentTerapeuta}
            categories={categories}
            disciplines={disciplines}
            onSave={handleSaveTerapeuta}
            onClose={() => setShowModal(false)}
          />
        )}
      </main>
    </>
  );
};

export default UbicacionServicios;