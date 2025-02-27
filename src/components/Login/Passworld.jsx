import React, { useState } from 'react';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';

const PasswordRecovery = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar email
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    
    // Cambiar botón para indicar éxito
    setIsSubmitting(true);
    const button = e.target.querySelector(".login__button");
    button.textContent = "EMAIL SENT!";
    button.style.background = "linear-gradient(135deg, #4CAF50, #2E7D32)";
    
    // Simular envío (esto se conectaría con el backend)
    setTimeout(() => {
      alert(`Recovery instructions sent to ${email}. Please check your inbox.`);
      setEmail('');
      setIsSubmitting(false);
      onBackToLogin();
    }, 1500);
  };

  return (
    <>
      <div className="login__logo">
        <img src={logoImg} alt="Motive Homecare Logo" className="login__logo-img" />
      </div>
      
      <h2 className="login__title">Password Recovery</h2>
      <p className="password-recovery__text">Enter your email address below and we'll send you instructions to reset your password.</p>
      
      <form id="passwordRecoveryForm" className="login__form" onSubmit={handleSubmit}>
        <div className="login__form-group">
          <label htmlFor="recovery-email" className="login__label">
            <i className="fas fa-envelope"></i>
            Email Address
          </label>
          <div className="login__input-wrapper">
            <input 
              type="email" 
              id="recovery-email" 
              className="login__input" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="login__button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
        </button>
      </form>
      
      <div className="login__extra-links">
        <a className="login__link" onClick={onBackToLogin}>
          <i className="fas fa-arrow-left"></i> Back to Login
        </a>
      </div>
    </>
  );
};

export default PasswordRecovery;