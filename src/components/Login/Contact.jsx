import React, { useState } from 'react';
import logoImg from '../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';

const Contact = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace('contact-', '')]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { name, email, message } = formData;
    
    // Validación básica
    if (!name || !email || !message) {
      alert("Please fill in all fields");
      return;
    }
    
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    
    // Cambiar botón para indicar éxito
    setIsSubmitting(true);
    const button = e.target.querySelector(".login__button");
    button.textContent = "MESSAGE SENT!";
    button.style.background = "linear-gradient(135deg, #4CAF50, #2E7D32)";
    
    // Simular envío (esto se conectaría con el backend)
    setTimeout(() => {
      alert(`Thank you, ${name}! Your message has been sent to our support team.`);
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
      onBackToLogin();
    }, 1500);
  };

  return (
    <>
      <div className="login__logo">
        <img src={logoImg} alt="Motive Homecare Logo" className="login__logo-img" />
      </div>
      
      <h2 className="login__title">Contact Us</h2>
      <p className="password-recovery__text">
        Need assistance? Contact us directly at:
        <a href="mailto:ContactSupportJG@gmail.com" className="contact-email">
          <i className="fas fa-envelope"></i> ContactSupportJG@gmail.com
        </a>
      </p>
      
      <form id="contactForm" className="login__form" onSubmit={handleSubmit}>
        <div className="login__form-group">
          <label htmlFor="contact-name" className="login__label">
            <i className="fas fa-user"></i>
            Your Name
          </label>
          <div className="login__input-wrapper">
            <input 
              type="text" 
              id="contact-name" 
              className="login__input" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={handleInputChange}
              required 
            />
          </div>
        </div>
        
        <div className="login__form-group">
          <label htmlFor="contact-email" className="login__label">
            <i className="fas fa-envelope"></i>
            Your Email
          </label>
          <div className="login__input-wrapper">
            <input 
              type="email" 
              id="contact-email" 
              className="login__input" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
          </div>
        </div>
        
        <div className="login__form-group">
          <label htmlFor="contact-message" className="login__label">
            <i className="fas fa-comment"></i>
            Message
          </label>
          <div className="login__input-wrapper">
            <textarea 
              id="contact-message" 
              className="login__input login__textarea" 
              placeholder="Enter your message" 
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="login__button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
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

export default Contact;