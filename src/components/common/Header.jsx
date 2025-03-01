import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  // Función para determinar si el enlace está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Manejar clic en el botón del perfil de usuario
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Cerrar el menú desplegable al hacer clic fuera de él
  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    onLogout();
    closeDropdown();
  };

  return (
    <header className="header">
      <div className="header__logo">
        <Link to="/welcome">
          <img src="/assets/logo.jpeg" alt="Logo" className="header__logo-img" />
        </Link>
      </div>
      <nav className="header__nav">
        <ul className="header__menu">
          <li className="header__item">
            <Link 
              to="/agencias" 
              className={`header__link ${isActive('/agencias') ? 'active' : ''}`}
            >
              AGENCIAS
            </Link>
          </li>
          <li className="header__item">
            <Link 
              to="/ubicacion" 
              className={`header__link ${isActive('/ubicacion') ? 'active' : ''}`}
            >
              UBICACIÓN DE SERVICIOS
            </Link>
          </li>
          <li className="header__item">
            <Link 
              to="/referrals" 
              className={`header__link ${isActive('/referrals') ? 'active' : ''}`}
            >
              REFERRALS
            </Link>
          </li>
          <li className="header__item">
            <Link 
              to="/freq" 
              className={`header__link ${isActive('/freq') ? 'active' : ''}`}
            >
              FRECUENCIAS
            </Link>
          </li>
          <li className="header__item">
            <Link 
              to="/pacientes" 
              className={`header__link ${isActive('/pacientes') ? 'active' : ''}`}
            >
              PACIENTES
            </Link>
          </li>
          <li className="header__item">
            <Link 
              to="/support" 
              className={`header__link ${isActive('/support') ? 'active' : ''}`}
            >
              SOPORTE
            </Link>
          </li>
        </ul>
      </nav>
      <div className="header__user">
        <span className="header__username" onClick={toggleDropdown} id="user-menu-toggle">
          {user?.name || 'Usuario'} <FontAwesomeIcon icon={faChevronDown} className="arrow-down" />
        </span>
        {showDropdown && (
          <ul className="header__dropdown" id="user-dropdown">
            <li className="header__dropdown-item">
              <Link to="/profile" className="header__dropdown-link" onClick={closeDropdown}>
                <FontAwesomeIcon icon={faUser} /> Ver Credenciales
              </Link>
            </li>
            <li className="header__dropdown-item">
              <button className="header__dropdown-link logout-btn" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;