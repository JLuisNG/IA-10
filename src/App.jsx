import React, { useState, useEffect } from 'react';
import './styles/agencies.scss';
import AgencyCard from './components/agencias/agencyCard';
import NewAgencyModal from './components/agencias/NewAgencyModal';
import EditAgencyModal from './components/agencias/EditAgencyModal';
import DeleteConfirmModal from './components/agencias/DeleteConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from './components/agencias/services/api'; // Asegúrate de que este archivo exista en /src/services/api.js

const App = () => {
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

  // Cargar agencias desde el backend cuando el componente se monta
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

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener lista de agencias (mantén la ruta que ya estás usando)
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchButton = async () => {
    if (!searchTerm.trim()) {
      setFilteredAgencies(agencies);
      return;
    }
    
    try {
      setLoading(true);
      
      // También puedes usar búsqueda local si lo prefieres
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
      // Mantén la ruta que ya usas
      await api.post('/agencies', newAgency);
      await fetchAgencies(); // Recargar la lista después de agregar
      setShowNewModal(false);
    } catch (error) {
      console.error('Error al agregar la agencia:', error);
      alert('Error al agregar la agencia. Inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgency = async (updatedAgency) => {
    try {
      setLoading(true);
      // Mantén la ruta que ya usas
      await api.put(`/agencies/${updatedAgency.id}`, updatedAgency);
      await fetchAgencies(); // Recargar la lista después de editar
      setShowEditModal(false);
    } catch (error) {
      console.error('Error al actualizar la agencia:', error);
      alert('Error al actualizar la agencia. Inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!currentAgency) return;
    
    try {
      setLoading(true);
      // Mantén la ruta que ya usas
      await api.delete(`/agencies/${currentAgency.id}`);
      await fetchAgencies(); // Recargar la lista después de eliminar
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar la agencia:', error);
      alert('Error al eliminar la agencia. Inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Manejadores para abrir modales
  const handleNewAgency = () => {
    setCurrentAgency(null);
    setShowNewModal(true);
  };
  
  const openEditModal = (agency) => {
    setCurrentAgency(agency);
    setShowEditModal(true);
  };

  const openDeleteModal = (agency) => {
    setCurrentAgency(agency);
    setShowDeleteModal(true);
  };

  return (
    <main className="agencies-container">
      {/* Contador Global de Pacientes (nuevo elemento) */}
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
            onChange={handleSearch}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchButton()}
          />
          <button className="search-btn" onClick={handleSearchButton}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <button 
          className="add-agency-btn" 
          onClick={handleNewAgency}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Agencia
        </button>
      </section>

      {/* Grid de agencias */}
      <div className="agencies-grid">
        {loading ? (
          <p className="loading-message">
            <FontAwesomeIcon icon={faSpinner} spin /> Cargando agencias...
          </p>
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

export default App;