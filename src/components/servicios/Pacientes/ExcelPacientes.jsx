import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/ExcelPacientes.scss';
import logoImg from '../../../images/32A90059-EE8B-4689-A398-D08AC03A1AC6.jpeg';
import LoadingModal from './LoadingModal';
import EmailModal from './EmailModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ExcelPacientes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Estados para los pacientes
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para filtros
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterAgencia, setFilterAgencia] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  const [showRejected, setShowRejected] = useState(true);
  
  // Estados para edición
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  
  // Estados para modales
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('loading');
  
  // Estado para modal de email
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState(null);
  
  // Estado para modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState(null);

  // Carga inicial de datos
  useEffect(() => {
    // Simulación de pantalla de carga
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Cargar pacientes
    fetchPacientes();
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Filtrar pacientes cuando cambian los filtros
  useEffect(() => {
    if (!pacientes.length) return;
    
    let filtered = [...pacientes];
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        paciente => 
          paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paciente.agencia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paciente.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por fecha
    if (filterStartDate && filterEndDate) {
      filtered = filtered.filter(paciente => {
        const pacienteDate = new Date(paciente.fecha_creacion);
        return pacienteDate >= filterStartDate && pacienteDate <= filterEndDate;
      });
    } else if (filterStartDate) {
      filtered = filtered.filter(paciente => {
        const pacienteDate = new Date(paciente.fecha_creacion);
        return pacienteDate >= filterStartDate;
      });
    } else if (filterEndDate) {
      filtered = filtered.filter(paciente => {
        const pacienteDate = new Date(paciente.fecha_creacion);
        return pacienteDate <= filterEndDate;
      });
    }
    
    // Filtrar por agencia
    if (filterAgencia !== '') {
      filtered = filtered.filter(paciente => 
        paciente.agencia_nombre?.toLowerCase().includes(filterAgencia.toLowerCase())
      );
    }
    
    // Filtrar por disciplina
    if (filterDisciplina !== '') {
      filtered = filtered.filter(paciente => 
        paciente.requerimientos.toLowerCase().includes(filterDisciplina.toLowerCase())
      );
    }
    
    // Filtrar rechazados
    if (!showRejected) {
      filtered = filtered.filter(paciente => paciente.estado !== 'no_asistido');
    }
    
    setFilteredPacientes(filtered);
  }, [pacientes, searchTerm, filterStartDate, filterEndDate, filterAgencia, filterDisciplina, showRejected]);

  // Función para obtener pacientes
  const fetchPacientes = async () => {
    try {
      setLoadingModalOpen(true);
      setLoadingMessage('Cargando pacientes...');
      setLoadingStatus('loading');
      
      const response = await fetch('http://localhost:3003/api/pacientes');
      if (!response.ok) {
        throw new Error('Error al cargar los pacientes');
      }
      
      const data = await response.json();
      
      // Agregar la fecha formateada para mostrar
      const dataWithFormattedDate = data.map(paciente => ({
        ...paciente,
        fecha_formateada: new Date(paciente.fecha_creacion).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }));
      
      setPacientes(dataWithFormattedDate);
      setFilteredPacientes(dataWithFormattedDate);
      
      setLoadingModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingStatus('error');
      setLoadingMessage('Error al cargar pacientes. Intente nuevamente.');
      setTimeout(() => setLoadingModalOpen(false), 1500);
    }
  };

  // Toggle para el dropdown del usuario
  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
  };

  // Cerrar el dropdown del usuario cuando se hace clic fuera
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

  // Función para cerrar sesión
  const handleLogout = () => {
    setLoadingModalOpen(true);
    setLoadingMessage('Cerrando sesión...');
    setLoadingStatus('loading');
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejar cambio en los filtros de fecha
  const handleDateFilterChange = (dates) => {
    const [start, end] = dates;
    setFilterStartDate(start);
    setFilterEndDate(end);
  };

  // Manejar cambio en los otros filtros
  const handleFilterChange = (e, filterType) => {
    const value = e.target.value;
    
    switch (filterType) {
      case 'agencia':
        setFilterAgencia(value);
        break;
      case 'disciplina':
        setFilterDisciplina(value);
        break;
      default:
        break;
    }
  };

  // Toggle para mostrar/ocultar rechazados
  const toggleShowRejected = () => {
    setShowRejected(!showRejected);
  };

  // Resetear todos los filtros
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterAgencia('');
    setFilterDisciplina('');
    setShowRejected(true);
  };

  // Iniciar edición de una celda
  const handleStartEdit = (pacienteId, campo, valorActual) => {
    setEditingCell({ pacienteId, campo });
    setEditValue(valorActual || '');
    // Enfocar el input tras renderizarlo
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Manejar cambio en el valor de edición
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  // Manejar teclas en el input (Enter para guardar, Escape para cancelar)
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Guardar la edición de una celda
  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    const { pacienteId, campo } = editingCell;
    
    // Encontrar el paciente que se está editando
    const paciente = pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;
    
    // Si el valor no ha cambiado, no hacer nada
    if (paciente[campo] === editValue) {
      setEditingCell(null);
      return;
    }
    
    // Mostrar modal de carga
    setLoadingMessage('Guardando cambios...');
    setLoadingStatus('loading');
    setLoadingModalOpen(true);
    
    try {
      // Crear objeto con los datos actualizados
      const datosActualizados = { ...paciente, [campo]: editValue };
      
      // Enviar actualización al servidor
      const response = await fetch(`http://localhost:3003/api/pacientes/${pacienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el paciente');
      }
      
      // Simular una pequeña demora para mostrar animación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar el estado local
      setPacientes(pacientes.map(p => 
        p.id === pacienteId ? { ...p, [campo]: editValue } : p
      ));
      
      // Mostrar éxito
      setLoadingStatus('success');
      setLoadingMessage('Cambios guardados correctamente');
      
      // Otra pequeña demora antes de cerrar el modal
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLoadingModalOpen(false);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Mostrar error
      setLoadingStatus('error');
      setLoadingMessage('Error al guardar los cambios');
      
      // Demora para mostrar mensaje de error
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingModalOpen(false);
    }
    
    // Limpiar estado de edición
    setEditingCell(null);
  };

  // Marcar un paciente como rechazado
  const handleMarkRejected = (pacienteId) => {
    // Encontrar el paciente
    const paciente = pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;
    
    // Abrir modal de confirmación para eliminación
    setPacienteToDelete(paciente);
    setDeleteModalOpen(true);
  };

  // Eliminar un paciente (marcar como rechazado)
  const handleDeletePaciente = async () => {
    if (!pacienteToDelete) return;
    
    setDeleteModalOpen(false);
    
    // Mostrar modal de carga
    setLoadingMessage('Procesando rechazo...');
    setLoadingStatus('loading');
    setLoadingModalOpen(true);
    
    try {
      // Enviar actualización al servidor
      const response = await fetch(`http://localhost:3003/api/pacientes/${pacienteToDelete.id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'no_asistido' })
      });
      
      if (!response.ok) {
        throw new Error('Error al procesar rechazo');
      }
      
      // Simular una pequeña demora para mostrar animación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar el estado local
      setPacientes(pacientes.map(p => 
        p.id === pacienteToDelete.id ? { ...p, estado: 'no_asistido' } : p
      ));
      
      // Mostrar éxito
      setLoadingStatus('success');
      setLoadingMessage('Paciente marcado como no asistido');
      
      // Otra pequeña demora antes de cerrar el modal
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLoadingModalOpen(false);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Mostrar error
      setLoadingStatus('error');
      setLoadingMessage('Error al procesar rechazo');
      
      // Demora para mostrar mensaje de error
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingModalOpen(false);
    }
    
    // Limpiar estado
    setPacienteToDelete(null);
  };

  // Abrir modal de email
  const handleOpenEmailModal = (paciente) => {
    setCurrentPaciente(paciente);
    setEmailModalOpen(true);
  };

  // Cerrar modal de email
  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
    setCurrentPaciente(null);
  };

  // Renderizar celda editable o de visualización
  const renderCell = (paciente, campo, valorActual, claseCustom = '') => {
    const isEditing = editingCell && 
                    editingCell.pacienteId === paciente.id && 
                    editingCell.campo === campo;
    
    const isRejected = paciente.estado === 'no_asistido';
    
    if (isEditing) {
      return (
        <td className="editable-cell active">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleEditChange}
            onBlur={handleSaveEdit}
            onKeyDown={handleEditKeyDown}
            className="cell-input"
          />
        </td>
      );
    }
    
    return (
      <td 
        className={`editable-cell ${claseCustom} ${isRejected ? 'rejected' : ''}`}
        onClick={() => handleStartEdit(paciente.id, campo, valorActual)}
      >
        {valorActual || <span className="empty-value">--</span>}
      </td>
    );
  };

  // Obtener disciplinas únicas para el filtro
  const disciplinasUnicas = React.useMemo(() => {
    if (!pacientes.length) return [];
    
    const allDisciplinas = pacientes.flatMap(p => {
      const disciplinas = p.requerimientos.split(',').map(d => d.trim());
      return disciplinas;
    });
    
    return [...new Set(allDisciplinas)];
  }, [pacientes]);

  // Obtener agencias únicas para el filtro
  const agenciasUnicas = React.useMemo(() => {
    if (!pacientes.length) return [];
    
    return [...new Set(pacientes.map(p => p.agencia_nombre).filter(Boolean))];
  }, [pacientes]);

  // Función auxiliar para obtener estilo de fila según estado
  const getRowClassName = (paciente) => {
    if (paciente.estado === 'no_asistido') return 'row-rejected';
    if (paciente.estado === 'nuevo') return 'row-new';
    if (paciente.estado === 'asignado') return 'row-assigned';
    return '';
  };

  return (
    <div className="excel-pacientes-container">
      {/* Header con navegación */}
      <header className="app-header">
        <div className="header-logo" onClick={() => navigate('/welcome')}>
          <img src={logoImg} alt="Logo" />
        </div>
        <nav className="header-nav">
          <ul className="nav-menu">
            <li className="nav-item">
              <span 
                className="nav-link"
                onClick={() => navigate('/ubicacion')}
              >
                UBICACIÓN
              </span>
            </li>
            <li className="nav-item">
              <span 
                className="nav-link"
                onClick={() => navigate('/referrals')}
              >
                REFERRALS
              </span>
            </li>
            <li className="nav-item">
              <span 
                className="nav-link active"
                onClick={() => navigate('/pacientes')}
              >
                PACIENTES
              </span>
            </li>
            <li className="nav-item">
              <span 
                className="nav-link"
                onClick={() => navigate('/frecuencias')}
              >
                FRECUENCIAS
              </span>
            </li>
          </ul>
        </nav>
        <div className="user-profile">
          <span className="username" onClick={toggleUserDropdown}>
            Luis Nava <i className="fas fa-chevron-down"></i>
          </span>
          <div className={`user-dropdown ${showUserDropdown ? 'show' : ''}`}>
            <ul>
              <li>
                <button>
                  <i className="fas fa-id-card"></i> Ver Credenciales
                </button>
              </li>
              <li>
                <button onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="main-content">
        <div className="content-header">
          <h1>Tabla de Pacientes</h1>
          
          <div className="filters-container">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="fas fa-search"></i>
            </div>
            
            <div className="date-filter">
              <DatePicker
                selectsRange={true}
                startDate={filterStartDate}
                endDate={filterEndDate}
                onChange={handleDateFilterChange}
                placeholderText="Filtrar por fecha"
                className="date-picker"
                dateFormat="MM/dd/yyyy"
              />
              <i className="fas fa-calendar-alt"></i>
            </div>
            
            <select 
              className="filter-select"
              value={filterAgencia}
              onChange={(e) => handleFilterChange(e, 'agencia')}
            >
              <option value="">Todas las agencias</option>
              {agenciasUnicas.map((agencia, index) => (
                <option key={index} value={agencia}>{agencia}</option>
              ))}
            </select>
            
            <select 
              className="filter-select"
              value={filterDisciplina}
              onChange={(e) => handleFilterChange(e, 'disciplina')}
            >
              <option value="">Todas las disciplinas</option>
              {disciplinasUnicas.map((disciplina, index) => (
                <option key={index} value={disciplina}>{disciplina}</option>
              ))}
            </select>
            
            <div className="rejected-toggle">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showRejected} 
                  onChange={toggleShowRejected}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">Mostrar rechazados</span>
            </div>
            
            <button className="reset-filters" onClick={resetFilters}>
              <i className="fas fa-sync-alt"></i> Resetear filtros
            </button>
          </div>
        </div>
        
        <div className="excel-table-container">
          <table className="excel-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre del Paciente</th>
                <th>Disciplinas</th>
                <th>Notas</th>
                <th>Rechazos</th>
                <th>Dirección</th>
                <th>Agencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.length > 0 ? (
                filteredPacientes.map((paciente) => (
                  <tr 
                    key={paciente.id} 
                    className={getRowClassName(paciente)}
                  >
                    <td className="fecha-cell">
                      {paciente.fecha_formateada}
                    </td>
                    
                    {renderCell(paciente, 'nombre', paciente.nombre, 'nombre-cell')}
                    
                    {renderCell(paciente, 'requerimientos', paciente.requerimientos, 'disciplinas-cell')}
                    
                    {renderCell(paciente, 'notas', paciente.notas, 'notas-cell')}
                    
                    {renderCell(paciente, 'rechazos', paciente.rechazos, 'rechazos-cell')}
                    
                    {renderCell(paciente, 'direccion', paciente.direccion, 'direccion-cell')}
                    
                    {renderCell(paciente, 'agencia_nombre', paciente.agencia_nombre, 'agencia-cell')}
                    
                    <td className="actions-cell">
                      <button 
                        className="action-btn email"
                        onClick={() => handleOpenEmailModal(paciente)}
                        title="Enviar correo"
                      >
                        <i className="fas fa-envelope"></i>
                      </button>
                      
                      <button 
                        className="action-btn delete"
                        onClick={() => handleMarkRejected(paciente.id)}
                        title="Marcar como rechazado"
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                      
                      <button 
                        className="action-btn view"
                        onClick={() => window.open(paciente.link_correo, '_blank')}
                        title="Ver correo original"
                      >
                        <i className="fas fa-external-link-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-results">
                  <td colSpan="8">
                    {pacientes.length ? 
                      'No se encontraron pacientes con los filtros aplicados.' : 
                      'Cargando pacientes...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="table-actions">
          <button className="add-btn" onClick={() => navigate('/referrals')}>
            <i className="fas fa-plus"></i> Nuevo Paciente
          </button>
          
          <button className="export-btn">
            <i className="fas fa-file-export"></i> Exportar a Excel
          </button>
        </div>
        
        <div className="table-stats">
          <div className="stat-item">
            <span className="stat-label">Total pacientes:</span>
            <span className="stat-value">{filteredPacientes.length}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Nuevos:</span>
            <span className="stat-value new-count">
              {filteredPacientes.filter(p => p.estado === 'nuevo').length}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Asignados:</span>
            <span className="stat-value assigned-count">
              {filteredPacientes.filter(p => p.estado === 'asignado').length}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Rechazados:</span>
            <span className="stat-value rejected-count">
              {filteredPacientes.filter(p => p.estado === 'no_asistido').length}
            </span>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2025 Motive Homecare. Todos los derechos reservados.</p>
      </footer>
      
      {/* Modal de carga */}
      <LoadingModal 
        isOpen={loadingModalOpen}
        status={loadingStatus}
        message={loadingMessage}
      />
      
      {/* Modal de email */}
      {emailModalOpen && (
        <EmailModal
          isOpen={emailModalOpen}
          onClose={handleCloseEmailModal}
          paciente={currentPaciente}
        />
      )}
      
      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePaciente}
        paciente={pacienteToDelete}
      />
    </div>
  );
};

export default ExcelPacientes;