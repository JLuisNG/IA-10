import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Welcome.scss';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';

const Welcome = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Simular un cierre de sesión
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-logo">
          <img src={logoImg} alt="Motive Homecare Logo" />
        </div>
        
        <h1 className="welcome-title">Welcome to Motive Homecare</h1>
        
        <p className="welcome-message">
          You have successfully logged in to your account.
          This is where your dashboard or main application would be displayed.
        </p>
        
        <div className="welcome-actions">
          <button className="welcome-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;