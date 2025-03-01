import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import AgencyCard from './AgencyCard';
import NewAgencyModal from './NewAgencyModal';
import EditAgencyModal from './EditAgencyModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import api from '../../services/api';

import '../../styles/agencies.scss';

const AgenciesList = () => {
  // Estado para la lista de agencias
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para los modales
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAgency, setCurrentAgency] = useState(null);

  // Cargar agencias desde el backend
  useEffect(() => {
    fetchAgencies();
  }, []);

  // Filtrar agencias cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAgencies(agencies);
    } else {
      const filtered = agencies.filter(agency => 
        agency.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgencies(filtered);
    }
  }, [searchTerm, agencies]);

  // Función para obtener las agencias desde el backend
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener lista de agencias
      const data = await api.get('/agencias');
      setAgencies(data);
      setFilteredAgencies(data);
      
      // Calcular el total de pacientes
      const total = data.reduce((sum, agency) => sum + (agency.patients || 0), 0);
      setTotalPatients(total);
    } catch (error) {
      console.error('Error al cargar las agencias:', error);
      setError('No se pudieron cargar las agencias. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar agencias por nombre (usa backend)
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredAgencies(agencies);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Usar búsqueda del backend
      const data = await api.get(`/agencias/search/${searchTerm}`);
      setFilteredAgencies(data);
    } catch (error) {
      console.error('Error al buscar agencias:', error);
      // Fallback a búsqueda local si hay error
      const filtered = agencies.filter(agency => 
        agency.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgencies(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar las acciones de las agencias
  const handleAddAgency = async (newAgency) => {
    try {
      setLoading(true);
      await api.post('/agencias', newAgency);
      await fetchAgencies(); // Recargar la lista después de agregar
      setShowNewModal(false);
    } catch (error) {
      console.error('Error al agregar la agencia:', error);
      alert('Error al agregar la agencia: ' + (error.message || 'Inténtelo de nuevo más tarde'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgency = async (updatedAgency) => {
    try {
      setLoading(true);
      await api.put(`/agencias/${updatedAgency.id}`, updatedAgency);
      await fetchAgencies(); // Recargar la lista después de editar
      setShowEditModal(false);
    } catch (error) {
      console.error('Error al actualizar la agencia:', error);
      alert('Error al actualizar la agencia: ' + (error.message || 'Inténtelo de nuevo más tarde'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!currentAgency) return;
    
    try {
      setLoading(true);
      await api.delete(`/agencias/${currentAgency.id}`);
      await fetchAgencies(); // Recargar la lista después de eliminar
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar la agencia:', error);
      alert('Error al eliminar la agencia: ' + (error.message || 'Inténtelo de nuevo más tarde'));
    } finally {
      setLoading(false);
    }
  };

  // Manejadores para abrir modales
  const openEditModal = (agency) => {
    setCurrentAgency(agency);
    setShowEditModal(true);
  };

  const openDeleteModal = (agency) => {
    setCurrentAgency(agency);
    setShowDeleteModal(true);
  };

  // Renderizado de la interfaz
  return (
    <main className="agencies-container">
      {/* Contador Global de Pacientes */}
      <section className="global-patients-counter">
        <div className="global-patients-card">
          <h2>Pacientes que hemos recibido</h2>
          <div className="global-counter">
            <span className="counter-number">{totalPatients.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Barra de búsqueda y botón para agregar */}
      <section className="agencies-search">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar agencia..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <button 
          className="add-agency-btn" 
          onClick={() => setShowNewModal(true)}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Agencia
        </button>
      </section>

      {/* Grid de agencias */}
      <div className="agencies-grid">
        {loading ? (
          <p className="loading-message">Cargando agencias...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredAgencies.length === 0 ? (
          <p className="no-results-message">No se encontraron agencias</p>
        ) : (
          filteredAgencies.map(agency => (
            <AgencyCard 
              key={agency.id} 
              agency={agency} 
              onEdit={() => openEditModal(agency)} 
              onDelete={() => openDeleteModal(agency)} 
            />
          ))
        )}
      </div>

      {/* Modales */}
      {showNewModal && (
        <NewAgencyModal 
          onClose={() => setShowNewModal(false)} 
          onSave={handleAddAgency} 
          isLoading={loading}
        />
      )}
      
      {showEditModal && currentAgency && (
        <EditAgencyModal 
          agency={currentAgency} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleEditAgency} 
          isLoading={loading}
        />
      )}
      
      {showDeleteModal && currentAgency && (
        <DeleteConfirmModal 
          agency={currentAgency} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={handleDeleteAgency} 
          isLoading={loading}
        />
      )}
    </main>
  );
};

export default AgenciesList;