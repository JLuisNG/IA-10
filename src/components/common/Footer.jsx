import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPhoneAlt, 
  faEnvelope 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faTwitter, 
  faLinkedinIn, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__section footer__about">
          <img 
            src="/assets/logo.jpeg" 
            alt="Motive Homecare Logo" 
            className="footer__logo"
          />
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
              <Link to="/ubicacion" className="header__link">UBICACIÓN DE SERVICIOS</Link>
            </li>
            <li className="header__item">
              <Link to="/referrals" className="header__link">REFERRALS</Link>
            </li>
            <li className="header__item">
              <Link to="/freq" className="header__link">FRECUENCIAS</Link>
            </li>
            <li className="header__item">
              <Link to="/pacientes" className="header__link">PACIENTES</Link>
            </li>
            <li className="header__item">
              <Link to="/agencias" className="header__link">AGENCIAS</Link>
            </li>
            <li className="header__item">
              <Link to="/support" className="header__link">SOPORTE</Link>
            </li>
          </ul>
        </div>
        
        <div className="footer__section footer__contact">
          <h3 className="footer__title">Contacto</h3>
          <ul className="footer__contact-list">
            <li className="footer__contact-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="footer__icon" />
              <span>Los Angeles, California</span>
            </li>
            <li className="footer__contact-item">
              <FontAwesomeIcon icon={faPhoneAlt} className="footer__icon" />
              <span>+1 (213) 495-0092</span>
            </li>
            <li className="footer__contact-item">
              <FontAwesomeIcon icon={faEnvelope} className="footer__icon" />
              <span>info@motivehomecare.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer__bottom">
        <p className="footer__copyright">
          © {currentYear} Motive Homecare. Todos los derechos reservados.
        </p>
        <div className="footer__social">
          <a href="#" className="footer__social-link" title="Facebook">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="#" className="footer__social-link" title="Twitter">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="#" className="footer__social-link" title="LinkedIn">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
          <a href="#" className="footer__social-link" title="Instagram">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;