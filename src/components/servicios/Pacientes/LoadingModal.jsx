import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../../../styles/LoadingModal.scss';

const LoadingModal = ({ isOpen, status, message }) => {
  const [progress, setProgress] = useState(0);
  const [showSpinner, setShowSpinner] = useState(true);
  const [showStatusIcon, setShowStatusIcon] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Pasos del proceso de registro (para animación)
  const steps = [
    'Inicializando proceso...',
    'Validando información...',
    'Conectando con base de datos...',
    'Guardando registro...',
    'Finalizando proceso...'
  ];
  
  // Efecto para manejar la animación de progreso
  useEffect(() => {
    let interval;
    let stepInterval;
    
    if (isOpen && status === 'loading') {
      // Resetear estados al abrirse
      setProgress(0);
      setShowSpinner(true);
      setShowStatusIcon(false);
      setCurrentStep(0);
      
      // Animar el progreso
      interval = setInterval(() => {
        setProgress(prev => {
          // Incrementar progreso con velocidad variable
          const increment = Math.random() * 8 + (prev < 50 ? 5 : prev < 80 ? 3 : 1);
          const newProgress = prev + increment;
          return newProgress > 90 ? 90 : newProgress; // Mantener en 90% hasta completar
        });
      }, 300);
      
      // Cambiar el paso actual periódicamente
      stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1200);
      
    } else if (status === 'success' || status === 'error') {
      // Completar el progreso
      setProgress(100);
      
      // Mostrar el ícono correspondiente después de completar la animación
      const timeout = setTimeout(() => {
        setShowSpinner(false);
        setShowStatusIcon(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [isOpen, status, steps.length]);
  
  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  // Determinar el mensaje a mostrar
  const displayMessage = status === 'loading' 
    ? steps[currentStep] 
    : message;
  
  return (
    <div className={`loading-overlay ${isOpen ? 'show' : ''}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          {showSpinner && (
            <>
              <div className="spinner-circle outer"></div>
              <div className="spinner-circle middle"></div>
              <div className="spinner-circle inner"></div>
              
              {/* Destellos decorativos */}
              <div className="spinner-sparkles">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="sparkle" style={{
                    animationDelay: `${i * 0.4}s`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}></div>
                ))}
              </div>
            </>
          )}
          
          {showStatusIcon && status === 'success' && (
            <div className="check-icon show">
              <i className="fas fa-check-circle"></i>
            </div>
          )}
          
          {showStatusIcon && status === 'error' && (
            <div className="error-icon show">
              <i className="fas fa-times-circle"></i>
            </div>
          )}
        </div>
        
        <h3 className={status !== 'loading' ? status : ''}>
          {status === 'loading' ? 'Procesando' : status === 'success' ? '¡Éxito!' : 'Error'}
        </h3>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-bar-inner" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="progress-percentage">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className={`status-message ${status !== 'loading' ? status : ''}`}>
          {displayMessage}
        </div>
        
        {status === 'loading' && (
          <div className="loading-steps">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`step-indicator ${index === currentStep ? 'current' : index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-dot">
                  {index < currentStep && <i className="fas fa-check"></i>}
                </div>
                <div className="step-name">{step}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

LoadingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(['loading', 'success', 'error']).isRequired,
  message: PropTypes.string.isRequired
};

export default LoadingModal;