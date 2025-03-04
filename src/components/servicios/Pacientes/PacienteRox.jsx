import React, { useState, useRef, useEffect } from 'react';
import { getTherapists } from '../therapistAPI';

const PacienteRow = ({
  paciente,
  estatusPaciente,
  estatusTerapeuta,
  editingCell,
  editValue,
  inputRef,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onChangeEstado,
  onAsignarTerapeuta,
  onOpenEmailModal
}) => {
  // Estado local para los dropdowns
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [showAccionesDropdown, setShowAccionesDropdown] = useState(false);
  const [showTerapeutaDropdown, setShowTerapeutaDropdown] = useState({ 
    pt: false, 
    pta: false, 
    ot: false, 
    cota: false, 
    st: false,
    sta: false
  });
  
  // Estado para almacenar los terapeutas disponibles de la API
  const [terapeutas, setTerapeutas] = useState([]);
  const [filtroNombreTerapeuta, setFiltroNombreTerapeuta] = useState('');
  const [terapeutasFiltrados, setTerapeutasFiltrados] = useState([]);
  const [cargandoTerapeutas, setCargandoTerapeutas] = useState(false);
  
  // Referencias para cerrar los dropdowns al hacer clic fuera
  const estadoDropdownRef = useRef(null);
  const accionesDropdownRef = useRef(null);
  const terapeutaDropdownRefs = {
    pt: useRef(null),
    pta: useRef(null),
    ot: useRef(null),
    cota: useRef(null),
    st: useRef(null),
    sta: useRef(null)
  };
  
  // Obtener el objeto de estado actual del paciente
  const estadoActual = estatusPaciente.find(e => e.id === paciente.estado) || estatusPaciente[0];
  
  // Cargar terapeutas desde la API al abrir cualquier dropdown
  useEffect(() => {
    const isAnyDropdownOpen = Object.values(showTerapeutaDropdown).some(isOpen => isOpen);
    
    if (isAnyDropdownOpen && terapeutas.length === 0) {
      fetchTerapeutas();
    }
  }, [showTerapeutaDropdown]);
  
  // Función para obtener terapeutas
  const fetchTerapeutas = async () => {
    try {
      setCargandoTerapeutas(true);
      const data = await getTherapists();
      setTerapeutas(data);
      setTerapeutasFiltrados(data);
      setCargandoTerapeutas(false);
    } catch (error) {
      console.error('Error al cargar terapeutas:', error);
      setCargandoTerapeutas(false);
    }
  };
  
  // Filtrar terapeutas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!terapeutas.length) return;
    
    if (filtroNombreTerapeuta.trim() === '') {
      setTerapeutasFiltrados(terapeutas);
    } else {
      const filtered = terapeutas.filter(terapeuta => 
        terapeuta.name.toLowerCase().includes(filtroNombreTerapeuta.toLowerCase())
      );
      setTerapeutasFiltrados(filtered);
    }
  }, [filtroNombreTerapeuta, terapeutas]);
  
  // Obtener asignaciones de terapeutas por disciplina
  const getTerapeutaAsignado = (disciplina) => {
    if (!paciente.terapeutas) return null;
    
    // Para manejar las disciplinas PT/PTA, OT/COTA, ST/STA correctamente
    let disciplinaPrefix;
    switch(disciplina) {
      case 'pt':
      case 'pta':
        disciplinaPrefix = 'p';
        break;
      case 'ot':
      case 'cota':
        disciplinaPrefix = 'o';
        break;
      case 'st':
      case 'sta':
        disciplinaPrefix = 's';
        break;
      default:
        disciplinaPrefix = disciplina.substring(0, 1);
    }
    
    // Filtrar por el tipo de disciplina exacta
    const asignaciones = paciente.terapeutas.filter(t => 
      t.disciplina.toLowerCase() === disciplina.toLowerCase()
    );
    
    return asignaciones.length > 0 ? asignaciones : null;
  };
  
  // Obtener el color de estado para un terapeuta
  const getColorEstadoTerapeuta = (estado) => {
    const estadoObj = estatusTerapeuta.find(e => e.id === estado);
    return estadoObj ? estadoObj.color : '#ffffff';
  };
  
  // Filtrar terapeutas por tipo
  const getTerapeutasPorTipo = (tipo) => {
    // Mapear el tipo de disciplina a tipos en la API de terapeutas
    const tipoMap = {
      'pt': 'pt',
      'pta': 'pta',
      'ot': 'ot',
      'cota': 'cota',
      'st': 'st',
      'sta': 'sta'
    };
    
    const tipoApi = tipoMap[tipo.toLowerCase()];
    return terapeutasFiltrados.filter(t => 
      t.type?.toLowerCase() === tipoApi
    );
  };
  
  // Manejar clic en el dropdown de estado
  const toggleEstadoDropdown = (e) => {
    e.stopPropagation();
    setShowEstadoDropdown(!showEstadoDropdown);
  };
  
  // Manejar clic en el dropdown de acciones
  const toggleAccionesDropdown = (e) => {
    e.stopPropagation();
    setShowAccionesDropdown(!showAccionesDropdown);
  };
  
  // Manejar clic en el dropdown de terapeuta
  const toggleTerapeutaDropdown = (disciplina, e) => {
    e.stopPropagation();
    
    // Resetear el filtro al abrir
    setFiltroNombreTerapeuta('');
    
    setShowTerapeutaDropdown({
      ...showTerapeutaDropdown,
      [disciplina]: !showTerapeutaDropdown[disciplina]
    });
  };
  
  // Manejar cambio en el filtro de nombre de terapeuta
  const handleFiltroTerapeutaChange = (e) => {
    setFiltroNombreTerapeuta(e.target.value);
  };
  
  // Manejar selección de terapeuta desde la lista
  const handleSelectTerapeuta = (disciplina, terapeuta) => {
    onAsignarTerapeuta(paciente.id, terapeuta.name, disciplina);
    setShowTerapeutaDropdown({
      ...showTerapeutaDropdown,
      [disciplina]: false
    });
    setFiltroNombreTerapeuta('');
  };
  
  // Escuchar clics fuera de los dropdowns para cerrarlos
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Para dropdown de estado
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target)) {
        setShowEstadoDropdown(false);
      }
      
      // Para dropdown de acciones
      if (accionesDropdownRef.current && !accionesDropdownRef.current.contains(event.target)) {
        setShowAccionesDropdown(false);
      }
      
      // Para dropdowns de terapeutas
      Object.keys(terapeutaDropdownRefs).forEach(key => {
        if (terapeutaDropdownRefs[key].current && 
            !terapeutaDropdownRefs[key].current.contains(event.target)) {
          setShowTerapeutaDropdown(prev => ({ ...prev, [key]: false }));
        }
      });
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Renderizar celda editable o de visualización
  const renderCell = (campo, valorActual) => {
    const isEditing = editingCell && 
                     editingCell.pacienteId === paciente.id && 
                     editingCell.campo === campo;
    
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={onEditChange}
          onBlur={onSaveEdit}
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
          className="editable-cell-input"
        />
      );
    }
    
    return (
      <div 
        className="cell-content"
        onClick={() => onStartEdit(paciente.id, campo, valorActual)}
      >
        {valorActual || <span className="empty-cell">--</span>}
      </div>
    );
  };
  
  // Renderizar celda de terapeuta con estilo neón
  const renderTerapeutaCell = (disciplina) => {
    const asignaciones = getTerapeutaAsignado(disciplina);
    const displayName = disciplina.toUpperCase();
    
    if (!asignaciones) {
      return (
        <div className="terapeuta-cell empty">
          <div className="terapeuta-discipline">{displayName}</div>
          <div 
            className="asignar-terapeuta"
            onClick={(e) => toggleTerapeutaDropdown(disciplina, e)}
          >
            <i className="fas fa-plus-circle"></i> Asignar
          </div>
          
          {showTerapeutaDropdown[disciplina] && (
            <div 
              ref={terapeutaDropdownRefs[disciplina]}
              className="terapeuta-dropdown"
            >
              <div className="terapeuta-dropdown-header">
                <input 
                  type="text" 
                  placeholder="Buscar terapeuta..."
                  value={filtroNombreTerapeuta}
                  onChange={handleFiltroTerapeutaChange}
                  className="terapeuta-search-input"
                />
              </div>
              
              <div className="terapeuta-dropdown-body">
                {cargandoTerapeutas ? (
                  <div className="loading-message">Cargando terapeutas...</div>
                ) : (
                  <>
                    {getTerapeutasPorTipo(disciplina).length > 0 ? (
                      <div className="terapeuta-list">
                        {getTerapeutasPorTipo(disciplina).map(terapeuta => (
                          <div 
                            key={terapeuta.id || terapeuta.name} 
                            className="terapeuta-list-item"
                            onClick={() => handleSelectTerapeuta(disciplina, terapeuta)}
                          >
                            <span className="terapeuta-name">{terapeuta.name}</span>
                            <span className="terapeuta-info">
                              {terapeuta.areas && <span className="terapeuta-area">{terapeuta.areas.split(',')[0]}</span>}
                              {terapeuta.languages && <span className="terapeuta-lang">{terapeuta.languages}</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-results">
                        No hay terapeutas disponibles para {displayName}
                      </div>
                    )}
                    
                    <div className="terapeuta-dropdown-footer">
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          placeholder="O ingrese nuevo nombre"
                          id={`${paciente.id}-${disciplina}-terapeuta`}
                          className="terapeuta-input"
                        />
                        <button 
                          className="asignar-button"
                          onClick={() => {
                            const input = document.getElementById(`${paciente.id}-${disciplina}-terapeuta`);
                            if (input && input.value.trim()) {
                              onAsignarTerapeuta(paciente.id, input.value.trim(), disciplina);
                              setShowTerapeutaDropdown({
                                ...showTerapeutaDropdown,
                                [disciplina]: false
                              });
                            }
                          }}
                        >
                          <i className="fas fa-check"></i> Asignar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="terapeuta-cell">
        <div className="terapeuta-discipline">{displayName}</div>
        {asignaciones.map((asignacion, index) => (
          <div 
            key={asignacion.id || index} 
            className="terapeuta-asignado neon-effect"
            style={{
              backgroundColor: `rgba(${getColorEstadoTerapeuta(asignacion.estado)}, 0.2)`,
              borderColor: getColorEstadoTerapeuta(asignacion.estado)
            }}
            onClick={(e) => toggleTerapeutaDropdown(`${disciplina}-${index}`, e)}
          >
            <span className="terapeuta-nombre">{asignacion.terapeuta_nombre}</span>
            <span className="terapeuta-estado">
              {estatusTerapeuta.find(e => e.id === asignacion.estado)?.label || 'Pendiente'}
            </span>
            
            {showTerapeutaDropdown[`${disciplina}-${index}`] && (
              <div 
                ref={terapeutaDropdownRefs[disciplina]}
                className="terapeuta-estado-dropdown"
              >
                {estatusTerapeuta.map(estado => (
                  <div 
                    key={estado.id}
                    className="terapeuta-estado-item"
                    style={{
                      backgroundColor: `rgba(${estado.color}, 0.2)`,
                      borderColor: estado.color
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAsignarTerapeuta(
                        paciente.id, 
                        asignacion.terapeuta_nombre, 
                        asignacion.disciplina, 
                        estado.id
                      );
                      setShowTerapeutaDropdown({
                        ...showTerapeutaDropdown,
                        [`${disciplina}-${index}`]: false
                      });
                    }}
                  >
                    {estado.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div 
          className="add-more-terapeuta"
          onClick={(e) => toggleTerapeutaDropdown(disciplina, e)}
        >
          <i className="fas fa-plus"></i>
        </div>
        
        {showTerapeutaDropdown[disciplina] && (
          <div 
            ref={terapeutaDropdownRefs[disciplina]}
            className="terapeuta-dropdown add-more"
          >
            <div className="terapeuta-dropdown-header">
              <input 
                type="text" 
                placeholder="Buscar terapeuta..."
                value={filtroNombreTerapeuta}
                onChange={handleFiltroTerapeutaChange}
                className="terapeuta-search-input"
              />
            </div>
              
            <div className="terapeuta-dropdown-body">
              {cargandoTerapeutas ? (
                <div className="loading-message">Cargando terapeutas...</div>
              ) : (
                <>
                  {getTerapeutasPorTipo(disciplina).length > 0 ? (
                    <div className="terapeuta-list">
                      {getTerapeutasPorTipo(disciplina).map(terapeuta => (
                        <div 
                          key={terapeuta.id || terapeuta.name} 
                          className="terapeuta-list-item"
                          onClick={() => handleSelectTerapeuta(disciplina, terapeuta)}
                        >
                          <span className="terapeuta-name">{terapeuta.name}</span>
                          <span className="terapeuta-info">
                            {terapeuta.areas && <span className="terapeuta-area">{terapeuta.areas.split(',')[0]}</span>}
                            {terapeuta.languages && <span className="terapeuta-lang">{terapeuta.languages}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">
                      No hay terapeutas disponibles para {displayName}
                    </div>
                  )}
                  
                  <div className="terapeuta-dropdown-footer">
                    <div className="input-wrapper">
                      <input 
                        type="text" 
                        placeholder="O ingrese nuevo nombre"
                        id={`${paciente.id}-${disciplina}-terapeuta-add`}
                        className="terapeuta-input"
                      />
                      <button 
                        className="asignar-button"
                        onClick={() => {
                          const input = document.getElementById(`${paciente.id}-${disciplina}-terapeuta-add`);
                          if (input && input.value.trim()) {
                            onAsignarTerapeuta(paciente.id, input.value.trim(), disciplina);
                            setShowTerapeutaDropdown({
                              ...showTerapeutaDropdown,
                              [disciplina]: false
                            });
                          }
                        }}
                      >
                        <i className="fas fa-check"></i> Asignar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Determinar si el paciente es "no asistido"
  const isNoAsistido = paciente.estado === 'no_asistido';
  
  return (
    <tr 
      className={`paciente-row estado-${paciente.estado} ${isNoAsistido ? 'no-asistido' : ''}`}
      style={{ 
        borderLeft: `5px solid ${estadoActual.color}` 
      }}
    >
      {/* Columna de Estado */}
      <td className="estado-column">
        <div className="estado-cell">
          <div 
            className="estado-actual"
            style={{ backgroundColor: estadoActual.color }}
            onClick={toggleEstadoDropdown}
          >
            {estadoActual.label}
          </div>
          
          {showEstadoDropdown && (
            <div 
              ref={estadoDropdownRef}
              className="estado-dropdown"
            >
              {estatusPaciente.map(estado => (
                <div 
                  key={estado.id}
                  className="estado-item"
                  style={{ backgroundColor: estado.color }}
                  onClick={() => {
                    onChangeEstado(paciente.id, estado.id);
                    setShowEstadoDropdown(false);
                  }}
                >
                  {estado.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
      
      {/* Columna de Nombre del Paciente */}
      <td>{renderCell('nombre', paciente.nombre)}</td>
      
      {/* Disciplinas en el orden especificado */}
      <td className="disciplinas-container">
        <div className="disciplinas-grid">
          {renderTerapeutaCell('pt')}
          {renderTerapeutaCell('pta')}
          {renderTerapeutaCell('ot')}
          {renderTerapeutaCell('cota')}
          {renderTerapeutaCell('st')}
          {renderTerapeutaCell('sta')}
        </div>
      </td>
      
      {/* Columna de Notas/Observaciones (si existe) */}
      <td className="notas-column">
        {paciente.notas ? (
          <div className="nota-importante">
            <i className="fas fa-exclamation-circle"></i>
            <span className="nota-texto">{paciente.notas}</span>
          </div>
        ) : (
          <span className="empty-cell">Sin notas</span>
        )}
      </td>
      
      {/* Columna de Dirección */}
      <td>{renderCell('direccion', paciente.direccion)}</td>
      
      {/* Columna de Agencia */}
      <td>
        <div className="cell-content agency-cell">
          {paciente.agencia_nombre || <span className="empty-cell">--</span>}
        </div>
      </td>
      
      {/* Columna de Acciones */}
      <td className="acciones-column">
        <div className="acciones-cell">
          <button 
            className="acciones-button"
            onClick={toggleAccionesDropdown}
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
          
          {showAccionesDropdown && (
            <div 
              ref={accionesDropdownRef}
              className="acciones-dropdown"
            >
              <div 
                className="accion-item"
                onClick={() => {
                  onOpenEmailModal(paciente);
                  setShowAccionesDropdown(false);
                }}
              >
                <i className="fas fa-envelope"></i> Correo
              </div>
              <div 
                className="accion-item"
                onClick={() => {
                  window.open(paciente.link_correo, '_blank');
                  setShowAccionesDropdown(false);
                }}
              >
                <i className="fas fa-external-link-alt"></i> Ver Original
              </div>
              <div className="accion-item separator"></div>
              <div 
                className="accion-item warning"
                onClick={() => {
                  if (window.confirm('¿Está seguro de que desea marcar este paciente como "No Asistido"?')) {
                    onChangeEstado(paciente.id, 'no_asistido');
                    setShowAccionesDropdown(false);
                  }
                }}
              >
                <i className="fas fa-times-circle"></i> No Asistido
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PacienteRow;