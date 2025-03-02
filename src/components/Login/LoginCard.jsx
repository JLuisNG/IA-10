import React, { useState, useEffect } from 'react';
import Login from './Login';
import PasswordRecovery from './PasswordRecovery';
import '../../styles/Login.scss';
import backgroundImg from '../../images/LosAngelesCity.jpg';

const LoginCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeCard, setActiveCard] = useState('login'); // 'login', 'recovery', 'contact'

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setActiveCard('recovery');
    setIsFlipped(true);
  };

  const handleContactUs = (e) => {
    e.preventDefault();
    setActiveCard('contact');
    setIsFlipped(true);
  };

  const handleBackToLogin = () => {
    // Iniciar la animación de volteo
    setIsFlipped(false);
    
    // Después de que termine la animación, actualizamos la tarjeta activa
    setTimeout(() => {
      setActiveCard('login');
    }, 500);
  };

  useEffect(() => {
    // Efecto de entrada suave al cargar
    const timeout = setTimeout(() => {
      document.getElementById('username')?.focus();
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="page">
      <div 
        className="page__background" 
        style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
      <div className="login-container">
        <div 
          className={`login-card ${isFlipped ? 'flipped' : ''} ${activeCard === 'recovery' ? 'flipped-recovery' : ''} ${activeCard === 'contact' ? 'flipped-contact' : ''}`} 
          id="loginCard"
        >
          {/* Parte frontal (login) */}
          <div className="login-card__front login">
            <Login 
              onForgotPassword={handleForgotPassword} 
              onContactUs={handleContactUs} 
            />
          </div>
          
          {/* Parte trasera (recuperación de contraseña) */}
          <div 
            className="login-card__back" 
            id="passwordRecoveryCard" 
            style={{ display: activeCard === 'recovery' ? 'block' : 'none' }}
          >
            <PasswordRecovery onBackToLogin={handleBackToLogin} />
          </div>
          
          {/* Parte trasera para contacto */}

        </div>
      </div>
    </div>
  );
};

export default LoginCard;