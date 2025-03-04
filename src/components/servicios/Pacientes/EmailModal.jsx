import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/EmailModal.scss';

const EmailModal = ({ isOpen, onClose, paciente }) => {
  const [activeTab, setActiveTab] = useState('original');
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantilla, setSelectedPlantilla] = useState(null);
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [adjuntos, setAdjuntos] = useState([]);
  
  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  // Estados para el editor
  const [showEditor, setShowEditor] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editorTools, setEditorTools] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 'normal',
    align: 'left',
    color: 'default'
  });
  
  // Estado para etiquetas de datos
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showRecipientsDropdown, setShowRecipientsDropdown] = useState(false);
  
  // Estado para destinatarios
  const [recipients, setRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [bccRecipients, setBccRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState('');
  
  // Referencias para el editor y para el input de archivos
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Controlar apertura/cierre con animación
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      // Pequeño retraso para que la animación funcione correctamente
      setTimeout(() => setAnimate(true), 10);
      
      // Cargar plantillas y configurar correo
      fetchTemplates();
      setupEmail();
    } else {
      setAnimate(false);
      // Esperar a que termine la animación antes de ocultar el modal
      const timer = setTimeout(() => {
        setShowModal(false);
        resetState();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, paciente]);
  
  // Resetear el estado cuando se cierra el modal
  const resetState = () => {
    setActiveTab('original');
    setSelectedPlantilla(null);
    setAsunto('');
    setCuerpo('');
    setAdjuntos([]);
    setShowEditor(false);
    setPreviewMode(false);
    setEditorTools({
      bold: false,
      italic: false,
      underline: false,
      fontSize: 'normal',
      align: 'left',
      color: 'default'
    });
    setShowTagsDropdown(false);
    setRecipients([]);
    setCcRecipients([]);
    setBccRecipients([]);
    setNewRecipient('');
  };
  
  // Configurar datos iniciales del correo
  const setupEmail = () => {
    if (paciente) {
      setAsunto(`RE: Referral Request - ${paciente.nombre}`);
      
      // Configurar destinatarios
      const agenciaEmail = getAgenciaEmail(paciente.agencia_nombre);
      if (agenciaEmail) {
        setRecipients([{ email: agenciaEmail, name: paciente.agencia_nombre }]);
      }
    }
  };
  
  // Obtener correo de la agencia (simulado)
  const getAgenciaEmail = (agenciaNombre) => {
    if (!agenciaNombre) return null;
    
    // Simplificación: convertir el nombre de la agencia en un correo de ejemplo
    const normalizedName = agenciaNombre
      .toLowerCase()
      .replace(/\s+/g, '.') // Espacios a puntos
      .replace(/[^a-z0-9.]/g, ''); // Remover caracteres especiales
    
    return `info@${normalizedName}.com`;
  };
  
  // Cargar plantillas de correo
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3004/api/plantillas-correo');
      if (response.ok) {
        const data = await response.json();
        setPlantillas(data);
      }
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Seleccionar una plantilla
  const handleSelectPlantilla = (plantilla) => {
    setSelectedPlantilla(plantilla);
    setAsunto(plantilla.asunto);
    
    // Personalizar el cuerpo del mensaje con datos del paciente
    let mensaje = plantilla.cuerpo;
    
    // Reemplazar marcadores con datos del paciente
    if (paciente) {
      mensaje = reemplazarDatosPaciente(mensaje);
    }
    
    setCuerpo(mensaje);
    setShowEditor(true);
    setPreviewMode(false);
  };
  
  // Reemplazar etiquetas de datos con información real del paciente
  const reemplazarDatosPaciente = (texto) => {
    if (!paciente) return texto;
    
    return texto
      .replace(/\{nombre\}/g, paciente.nombre || 'paciente')
      .replace(/\{servicios\}/g, paciente.requerimientos || 'servicios solicitados')
      .replace(/\{direccion\}/g, paciente.direccion || 'dirección del paciente')
      .replace(/\{agencia\}/g, paciente.agencia_nombre || 'agencia')
      .replace(/\{fecha\}/g, new Date().toLocaleDateString('es-MX'));
  };
  
  // Crear mensaje personalizado
  const handleCustomMessage = () => {
    setSelectedPlantilla(null);
    setAsunto(`RE: Referral Request - ${paciente?.nombre || 'Paciente'}`);
    
    // Crear un mensaje personalizado con los datos del paciente
    const mensaje = `
Dear ${paciente?.agencia_nombre || 'Agency'} Team,

Thank you for the referral for ${paciente?.nombre || 'the patient'}.

[Write your message here]

Best regards,
Motive Homecare Team
Tel: +1 (213) 495-0092
Email: info@motivehomecare.com
    `;
    
    setCuerpo(mensaje);
    setShowEditor(true);
    setPreviewMode(false);
  };
  
  // Aplicar formato al texto seleccionado
  const applyFormat = (format, value) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    // Si no hay texto seleccionado, actualizar solo el estado
    if (!selectedText) {
      switch (format) {
        case 'bold':
          setEditorTools(prev => ({ ...prev, bold: !prev.bold }));
          break;
        case 'italic':
          setEditorTools(prev => ({ ...prev, italic: !prev.italic }));
          break;
        case 'underline':
          setEditorTools(prev => ({ ...prev, underline: !prev.underline }));
          break;
        case 'fontSize':
          setEditorTools(prev => ({ ...prev, fontSize: value }));
          break;
        case 'align':
          setEditorTools(prev => ({ ...prev, align: value }));
          break;
        case 'color':
          setEditorTools(prev => ({ ...prev, color: value }));
          break;
        default:
          break;
      }
      return;
    }
    
    // Guardar la selección actual
    const range = selection.getRangeAt(0);
    
    // Crear un nuevo elemento con el formato deseado
    const formattedElement = document.createElement('span');
    
    // Aplicar estilos según el formato
    switch (format) {
      case 'bold':
        formattedElement.style.fontWeight = 'bold';
        setEditorTools(prev => ({ ...prev, bold: !prev.bold }));
        break;
      case 'italic':
        formattedElement.style.fontStyle = 'italic';
        setEditorTools(prev => ({ ...prev, italic: !prev.italic }));
        break;
      case 'underline':
        formattedElement.style.textDecoration = 'underline';
        setEditorTools(prev => ({ ...prev, underline: !prev.underline }));
        break;
      case 'fontSize':
        formattedElement.style.fontSize = value;
        setEditorTools(prev => ({ ...prev, fontSize: value }));
        break;
      case 'align':
        // No se aplica a un span, sino al contenedor
        editor.style.textAlign = value;
        setEditorTools(prev => ({ ...prev, align: value }));
        break;
      case 'color':
        formattedElement.style.color = value;
        setEditorTools(prev => ({ ...prev, color: value }));
        break;
      default:
        break;
    }
    
    // No aplicar el formato si es alineación (ya se aplicó al contenedor)
    if (format !== 'align') {
      // Aplicar el formato
      formattedElement.appendChild(document.createTextNode(selectedText));
      range.deleteContents();
      range.insertNode(formattedElement);
      
      // Restaurar la selección
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Actualizar el cuerpo del mensaje
    setCuerpo(editor.innerHTML);
  };
  
  // Manejar cambios en el editor
  const handleEditorChange = () => {
    if (editorRef.current) {
      setCuerpo(editorRef.current.innerHTML);
    }
  };
  
  // Insertar etiqueta de datos del paciente
  const insertDataTag = (tag) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = window.getSelection();
    
    // Crear el texto de la etiqueta
    let tagText = '';
    switch (tag) {
      case 'nombre':
        tagText = '{nombre}';
        break;
      case 'servicios':
        tagText = '{servicios}';
        break;
      case 'direccion':
        tagText = '{direccion}';
        break;
      case 'agencia':
        tagText = '{agencia}';
        break;
      case 'fecha':
        tagText = '{fecha}';
        break;
      default:
        return;
    }
    
    // Insertar la etiqueta en la posición del cursor
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const tagElement = document.createElement('span');
      tagElement.className = 'data-tag';
      tagElement.textContent = tagText;
      
      range.deleteContents();
      range.insertNode(tagElement);
      
      // Mover el cursor después de la etiqueta
      range.setStartAfter(tagElement);
      range.setEndAfter(tagElement);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Actualizar el cuerpo del mensaje
    setCuerpo(editor.innerHTML);
    setShowTagsDropdown(false);
  };
  
  // Adjuntar archivo
  const handleAttachFile = () => {
    fileInputRef.current.click();
  };
  
  // Manejar cambio en el input de archivo
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAdjuntos = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      setAdjuntos([...adjuntos, ...newAdjuntos]);
    }
  };
  
  // Eliminar adjunto
  const handleRemoveAttachment = (index) => {
    const updatedAdjuntos = [...adjuntos];
    updatedAdjuntos.splice(index, 1);
    setAdjuntos(updatedAdjuntos);
  };
  
  // Alternar vista previa
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  // Añadir un destinatario
  const handleAddRecipient = (type) => {
    if (newRecipient.trim() === '') return;
    
    const recipient = { email: newRecipient, name: '' };
    
    switch (type) {
      case 'to':
        setRecipients([...recipients, recipient]);
        break;
      case 'cc':
        setCcRecipients([...ccRecipients, recipient]);
        break;
      case 'bcc':
        setBccRecipients([...bccRecipients, recipient]);
        break;
      default:
        break;
    }
    
    setNewRecipient('');
    setShowRecipientsDropdown(false);
  };
  
  // Eliminar un destinatario
  const handleRemoveRecipient = (index, type) => {
    switch (type) {
      case 'to':
        setRecipients(recipients.filter((_, i) => i !== index));
        break;
      case 'cc':
        setCcRecipients(ccRecipients.filter((_, i) => i !== index));
        break;
      case 'bcc':
        setBccRecipients(bccRecipients.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };
  
  // Enviar correo (simulado)
  const handleSendEmail = () => {
    alert(`Correo enviado exitosamente a ${recipients.map(r => r.email).join(', ')}`);
    onClose();
  };
  
  // Manejar cambios en los campos de texto
  const handleInputChange = (e, field) => {
    switch (field) {
      case 'asunto':
        setAsunto(e.target.value);
        break;
      case 'newRecipient':
        setNewRecipient(e.target.value);
        break;
      default:
        break;
    }
  };
  
  // Obtener el tamaño de archivo formateado
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!showModal) return null;

  return (
    <div className={`email-modal-overlay ${animate ? 'show' : ''}`}>
      <div className="email-modal">
        <div className="email-modal-header">
          <h2>
            {activeTab === 'original' ? 'Correo Original' : 'Responder Correo'}
          </h2>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'original' ? 'active' : ''}`}
              onClick={() => setActiveTab('original')}
            >
              <i className="fas fa-envelope-open"></i> Original
            </button>
            <button 
              className={`tab ${activeTab === 'responder' ? 'active' : ''}`}
              onClick={() => setActiveTab('responder')}
            >
              <i className="fas fa-reply"></i> Responder
            </button>
          </div>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="email-modal-content">
          {activeTab === 'original' ? (
            <div className="original-email">
              <div className="email-header">
                <div className="email-field">
                  <span className="label">De:</span>
                  <span className="value">{paciente?.agencia_nombre || 'Agencia'}</span>
                </div>
                <div className="email-field">
                  <span className="label">Asunto:</span>
                  <span className="value">Referral Request - {paciente?.nombre || 'Paciente'}</span>
                </div>
                <div className="email-field">
                  <span className="label">Fecha:</span>
                  <span className="value">
                    {new Date(paciente?.fecha_creacion || new Date()).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="email-body">
                <div className="email-content">
                  <h3>Información del Paciente</h3>
                  <div className="patient-info-card">
                    <div className="patient-info-item">
                      <i className="fas fa-user"></i>
                      <div>
                        <label>Nombre:</label>
                        <span>{paciente?.nombre || 'No especificado'}</span>
                      </div>
                    </div>
                    <div className="patient-info-item">
                      <i className="fas fa-briefcase-medical"></i>
                      <div>
                        <label>Servicios requeridos:</label>
                        <span>{paciente?.requerimientos || 'No especificados'}</span>
                      </div>
                    </div>
                    <div className="patient-info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <div>
                        <label>Dirección:</label>
                        <span>{paciente?.direccion || 'No especificada'}</span>
                      </div>
                    </div>
                    <div className="patient-info-item">
                      <i className="fas fa-hospital"></i>
                      <div>
                        <label>Agencia:</label>
                        <span>{paciente?.agencia_nombre || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3>Notas</h3>
                  <pre className="notas-correo">
                    {paciente?.notas || 'No hay notas disponibles.'}
                  </pre>
                </div>
                
                <div className="email-actions">
                  <button 
                    className="action-button secondary"
                    onClick={() => setActiveTab('responder')}
                  >
                    <i className="fas fa-reply"></i> Responder
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => window.open(paciente?.link_correo, '_blank')}
                  >
                    <i className="fas fa-external-link-alt"></i> Ver en Gmail
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="responder-email">
              <div className="email-layout">
                <div className="plantillas-section">
                  <h3><i className="fas fa-clipboard-list"></i> Plantillas</h3>
                  {loading ? (
                    <div className="loading-plantillas">
                      <div className="loading-spinner"></div>
                      <span>Cargando plantillas...</span>
                    </div>
                  ) : (
                    <div className="plantillas-list">
                      {plantillas.map(plantilla => (
                        <div 
                          key={plantilla.id}
                          className={`plantilla-item ${selectedPlantilla?.id === plantilla.id ? 'selected' : ''}`}
                          onClick={() => handleSelectPlantilla(plantilla)}
                        >
                          <div className="plantilla-title">
                            <i className="fas fa-file-alt"></i>
                            {plantilla.nombre}
                          </div>
                          <div className="plantilla-preview">{plantilla.cuerpo.substring(0, 50)}...</div>
                        </div>
                      ))}
                      <div 
                        className={`plantilla-item custom ${!selectedPlantilla ? 'selected' : ''}`}
                        onClick={handleCustomMessage}
                      >
                        <div className="plantilla-title">
                          <i className="fas fa-pencil-alt"></i> Mensaje Personalizado
                        </div>
                        <div className="plantilla-preview">Escribir respuesta personalizada...</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="composer-section">
                  <div className="recipients-container">
                    <div className="recipients-field">
                      <span className="field-label">Para:</span>
                      <div className="recipients-list">
                        {recipients.map((recipient, index) => (
                          <div key={index} className="recipient-tag">
                            <span>{recipient.email}</span>
                            <button onClick={() => handleRemoveRecipient(index, 'to')}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                        <div className="recipient-input-container">
                          <input
                            type="text"
                            value={newRecipient}
                            onChange={(e) => handleInputChange(e, 'newRecipient')}
                            placeholder="Agregar destinatario..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient('to')}
                          />
                        </div>
                      </div>
                      <div className="recipients-actions">
                        <button 
                          className="add-cc-btn"
                          onClick={() => setShowRecipientsDropdown(!showRecipientsDropdown)}
                        >
                          CC/CCO <i className="fas fa-caret-down"></i>
                        </button>
                        
                        {showRecipientsDropdown && (
                          <div className="recipients-dropdown">
                            <div className="cc-section">
                              <span className="field-label">CC:</span>
                              <div className="recipients-list">
                                {ccRecipients.map((recipient, index) => (
                                  <div key={index} className="recipient-tag">
                                    <span>{recipient.email}</span>
                                    <button onClick={() => handleRemoveRecipient(index, 'cc')}>
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                ))}
                                <div className="recipient-input-container">
                                  <input
                                    type="text"
                                    value={newRecipient}
                                    onChange={(e) => handleInputChange(e, 'newRecipient')}
                                    placeholder="Agregar CC..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient('cc')}
                                  />
                                  <button 
                                    className="add-btn"
                                    onClick={() => handleAddRecipient('cc')}
                                  >
                                    <i className="fas fa-plus"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bcc-section">
                              <span className="field-label">CCO:</span>
                              <div className="recipients-list">
                                {bccRecipients.map((recipient, index) => (
                                  <div key={index} className="recipient-tag">
                                    <span>{recipient.email}</span>
                                    <button onClick={() => handleRemoveRecipient(index, 'bcc')}>
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                ))}
                                <div className="recipient-input-container">
                                  <input
                                    type="text"
                                    value={newRecipient}
                                    onChange={(e) => handleInputChange(e, 'newRecipient')}
                                    placeholder="Agregar CCO..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient('bcc')}
                                  />
                                  <button 
                                    className="add-btn"
                                    onClick={() => handleAddRecipient('bcc')}
                                  >
                                    <i className="fas fa-plus"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="subject-field">
                      <span className="field-label">Asunto:</span>
                      <input
                        type="text"
                        value={asunto}
                        onChange={(e) => handleInputChange(e, 'asunto')}
                        placeholder="Ingrese el asunto..."
                      />
                    </div>
                  </div>
                  
                  {showEditor && (
                    <div className="editor-toolbar">
                      <div className="toolbar-group">
                        <button 
                          type="button"
                          className={`toolbar-button ${editorTools.bold ? 'active' : ''}`}
                          onClick={() => applyFormat('bold')}
                          title="Negrita"
                        >
                          <i className="fas fa-bold"></i>
                        </button>
                        <button 
                          type="button"
                          className={`toolbar-button ${editorTools.italic ? 'active' : ''}`}
                          onClick={() => applyFormat('italic')}
                          title="Cursiva"
                        >
                          <i className="fas fa-italic"></i>
                        </button>
                        <button 
                          type="button"
                          className={`toolbar-button ${editorTools.underline ? 'active' : ''}`}
                          onClick={() => applyFormat('underline')}
                          title="Subrayado"
                        >
                          <i className="fas fa-underline"></i>
                        </button>
                      </div>
                      
                      <div className="toolbar-group">
                        <div className="toolbar-dropdown-container">
                          <button 
                            type="button"
                            className="toolbar-button"
                            onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                            title="Insertar etiqueta"
                          >
                            <i className="fas fa-tag"></i> Etiquetas <i className="fas fa-caret-down"></i>
                          </button>
                          
                          {showTagsDropdown && (
                            <div className="toolbar-dropdown">
                              <button onClick={() => insertDataTag('nombre')}>
                                <i className="fas fa-user"></i> Nombre del paciente
                              </button>
                              <button onClick={() => insertDataTag('servicios')}>
                                <i className="fas fa-briefcase-medical"></i> Servicios
                              </button>
                              <button onClick={() => insertDataTag('direccion')}>
                                <i className="fas fa-map-marker-alt"></i> Dirección
                              </button>
                              <button onClick={() => insertDataTag('agencia')}>
                                <i className="fas fa-hospital"></i> Agencia
                              </button>
                              <button onClick={() => insertDataTag('fecha')}>
                                <i className="fas fa-calendar-alt"></i> Fecha actual
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="toolbar-group">
                        <select 
                          className="toolbar-select"
                          value={editorTools.fontSize}
                          onChange={(e) => applyFormat('fontSize', e.target.value)}
                          title="Tamaño de fuente"
                        >
                          <option value="small">Pequeña</option>
                          <option value="normal">Normal</option>
                          <option value="large">Grande</option>
                          <option value="x-large">Muy grande</option>
                        </select>
                      </div>
                      
                      <div className="toolbar-group">
                        <button 
                          type="button"
                          className={`toolbar-button ${editorTools.align === 'left' ? 'active' : ''}`}
                          onClick={() => applyFormat('align', 'left')}
                          title="Alinear a la izquierda"
                        >
                          <i className="fas fa-align-left"></i>
                        </button>
                        <button 
                          type="button"
                          className={`toolbar-button ${editorTools.align === 'center' ? 'active' : ''}`}
                          onClick={() => applyFormat('align', 'center')}
                          title="Centrar"
                        >
                          <i className="fas fa-align-center"></i>
                        </button>
                        <button 
                          type="button"
                          className={`toolbar-button ${editorTools.align === 'right' ? 'active' : ''}`}
                          onClick={() => applyFormat('align', 'right')}
                          title="Alinear a la derecha"
                        >
                          <i className="fas fa-align-right"></i>
                        </button>
                      </div>
                      
                      <div className="toolbar-group">
                        <button 
                          type="button"
                          className={`toolbar-button ${previewMode ? 'active' : ''}`}
                          onClick={togglePreview}
                          title="Vista previa"
                        >
                          <i className="fas fa-eye"></i> Vista previa
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!previewMode ? (
                    <div className="editor-container">
                      <div
                        ref={editorRef}
                        className="rich-text-editor"
                        contentEditable
                        dangerouslySetInnerHTML={{ __html: cuerpo }}
                        onInput={handleEditorChange}
                        style={{ textAlign: editorTools.align }}
                      ></div>
                    </div>
                  ) : (
                    <div className="preview-container">
                      <div 
                        className="preview-content"
                        dangerouslySetInnerHTML={{ __html: reemplazarDatosPaciente(cuerpo) }}
></div>
                    </div>
                  )}
                  
                  {adjuntos.length > 0 && (
                    <div className="attachments-container">
                      <h4><i className="fas fa-paperclip"></i> Archivos adjuntos</h4>
                      <div className="attachments-list">
                        {adjuntos.map((archivo, index) => (
                          <div key={index} className="attachment-item">
                            <div className="attachment-icon">
                              {archivo.type.includes('image') ? (
                                <i className="fas fa-file-image"></i>
                              ) : archivo.type.includes('pdf') ? (
                                <i className="fas fa-file-pdf"></i>
                              ) : archivo.type.includes('word') ? (
                                <i className="fas fa-file-word"></i>
                              ) : (
                                <i className="fas fa-file"></i>
                              )}
                            </div>
                            <div className="attachment-details">
                              <span className="attachment-name">{archivo.name}</span>
                              <span className="attachment-size">({formatFileSize(archivo.size)})</span>
                            </div>
                            <button 
                              className="attachment-remove"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="composer-actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      multiple
                    />
                    <button 
                      className="action-button outline"
                      onClick={handleAttachFile}
                    >
                      <i className="fas fa-paperclip"></i> Adjuntar
                    </button>
                    <button 
                      className="action-button secondary"
                      onClick={onClose}
                    >
                      <i className="fas fa-times"></i> Cancelar
                    </button>
                    <button 
                      className="action-button primary"
                      onClick={handleSendEmail}
                      disabled={recipients.length === 0 || !asunto.trim() || !cuerpo.trim()}
                    >
                      <i className="fas fa-paper-plane"></i> Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailModal;