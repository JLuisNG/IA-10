import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Welcome.scss';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';


const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    // Simular pantalla de carga
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      
      // Animar los valores estadísticos
      animateStatValues();
      
      // Animar el contador de pacientes
      animateCounter(6467, 2000);
    }, 2000);

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

  // Animación para el contador de pacientes
  const animateCounter = (target, duration) => {
    const counterElement = document.querySelector('.counter-number');
    if (!counterElement) return;

    let start = 0;
    const increment = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      
      // Función de easing
      const easing = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const currentCount = Math.floor(easing(percentage) * target);
      
      counterElement.textContent = currentCount.toLocaleString();
      
      if (progress < duration) {
        requestAnimationFrame(increment);
      }
    };
    requestAnimationFrame(increment);
  };

  // Animación para los valores de estadísticas
  const animateStatValues = () => {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(element => {
      const finalValue = parseInt(element.getAttribute('data-value') || element.textContent.replace(/[^0-9.-]/g, ''));
      animateValue(element, 0, finalValue, 2000);
    });
  };
  
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easing = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const currentValue = Math.floor(easing(progress) * (end - start) + start);
      
      // Formatear según el tipo de valor
      if (element.textContent.includes('%')) {
        element.textContent = `${currentValue}%`;
      } else if (element.textContent.includes('m')) {
        element.textContent = `${currentValue}m`;
      } else {
        element.textContent = currentValue.toLocaleString();
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
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
      
      {/* Barra superior */}
      <header className="header">
        <div className="header__logo">
          <img src={logoImg} alt="Logo" className="header__logo-img" />
        </div>
        <nav className="header__nav">
          <ul className="header__menu">
            <li className="header__item">
              <span 
                className="header__link" 
                onClick={() => navigate('/ubicacion')}
                style={{ cursor: 'pointer' }}
              >
                SERVICIOS
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link" 
                onClick={() => navigate('/therapy-sync')}
                style={{ cursor: 'pointer' }}
              >
                THERAPY SYNC
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link" 
                onClick={() => navigate('/agencias')}
                style={{ cursor: 'pointer' }}
              >
                AGENCIAS
              </span>
            </li>
            <li className="header__item">
              <span 
                className="header__link" 
                onClick={() => navigate('/soporte')}
                style={{ cursor: 'pointer' }}
              >
                SOPORTE
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
      
      {/* Contenido principal */}
      <main className="main-content">
        <div className="main-content__text">
          <h1 className="main-content__title">¿Como puedo ayudarte el dia de hoy?</h1>
          <p className="main-content__description">Explora las herramientas disponibles para optimizar tus procesos.</p>
        </div>
      </main>
      
      {/* Contador de pacientes */}
      <div className="patient-counter">
        <div className="counter-circle">
          <span className="counter-number">0</span>
          <span className="counter-label">Pacientes Atendidos</span>
        </div>
      </div>
      
      {/* Estadísticas */}
      <section className="stats-container">
        <div className="stat-card">
          <h3 className="stat-title">Casos Activos</h3>
          <div className="stat-value" data-value="476">0</div>
          <p className="stat-description">Pacientes actualmente en tratamiento</p>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-title">Tiempo de Respuesta</h3>
          <div className="stat-value" data-value="45">0m</div>
          <p className="stat-description">Promedio de tiempo de asignación</p>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-title">Terapeutas Disponibles</h3>
          <div className="stat-value" data-value="340">0</div>
          <p className="stat-description">Profesionales listos para asignación</p>
        </div>
        
        <div className="stat-card">
          <h3 className="stat-title">Tasa de Aceptación</h3>
          <div className="stat-value" data-value="89">0%</div>
          <p className="stat-description">De casos asignados exitosamente</p>
        </div>
      </section>
      
      {/* Acciones rápidas */}
      <section className="quick-actions">
        <h2 className="quick-actions__title">Acciones Rápidas</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate('/nuevo-caso')}>
            <div className="action-icon">📝</div>
            <h3 className="action-title">Nuevo Caso</h3>
            <p className="action-description">Registrar nueva solicitud de paciente</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/asignar-terapeuta')}>
            <div className="action-icon">👥</div>
            <h3 className="action-title">Asignar Terapeuta</h3>
            <p className="action-description">Buscar y asignar terapeuta disponible</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/therapy-sync')}>
            <div className="action-icon">🔄</div>
            <h3 className="action-title">Therapy Sync</h3>
            <p className="action-description">Actualizar información en el sistema</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/reportes')}>
            <div className="action-icon">📊</div>
            <h3 className="action-title">Reportes</h3>
            <p className="action-description">Ver estadísticas y análisis</p>
          </div>
        </div>
      </section>
      
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
     
    </>
  );
};

export default Welcome;