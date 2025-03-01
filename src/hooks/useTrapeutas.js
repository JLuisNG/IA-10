import { useState, useEffect, useMemo } from 'react';
import { getTherapists, createTherapist, updateTherapist, deleteTherapist } from '../components/servicios/therapistAPI';

const CATEGORIES = {
  'premium': 'Premium (Verde)',
  'standard': 'Estándar (Azul)',
  'basic': 'Básico (Naranja)'
};

const DISCIPLINES = {
  'PT': 'Physical Therapy',
  'PTA': 'Physical Therapy Assistant',
  'OT': 'Occupational Therapy',
  'COTA': 'Occupational Therapy Assistant',
  'ST': 'Speech Therapy',
  'STA': 'Speech Therapy Assistant'
};

export const useTerapeutas = (searchTerm = '', filters = {}) => {
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar terapeutas desde la API
  useEffect(() => {
    const fetchTerapeutas = async () => {
      try {
        setLoading(true);
        const data = await getTherapists();
        setTerapeutas(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar terapeutas:', err);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchTerapeutas();
  }, []);

  // Obtener áreas únicas
  const areas = useMemo(() => {
    const areasList = terapeutas.flatMap(t => {
      const areasStr = t.areas || '';
      return areasStr
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
    });
    
    return [...new Set(areasList)].sort();
  }, [terapeutas]);

  // Filtrar terapeutas
  const filteredTerapeutas = useMemo(() => {
    return terapeutas.filter(terapeuta => {
      // Filtro de búsqueda por término
      const matchesSearch = !searchTerm || 
        Object.values(terapeuta).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Filtros adicionales
      const matchesArea = !filters.area || 
        (terapeuta.areas && terapeuta.areas.toLowerCase().includes(filters.area.toLowerCase()));
      
      const matchesDiscipline = !filters.discipline || 
        terapeuta.type === filters.discipline;
      
      const matchesCategory = !filters.category || 
        terapeuta.category === filters.category;
      
      return matchesSearch && matchesArea && matchesDiscipline && matchesCategory;
    });
  }, [terapeutas, searchTerm, filters]);

  // Agregar un nuevo terapeuta
  const addTerapeuta = async (terapeutaData) => {
    try {
      const newTerapeuta = await createTherapist(terapeutaData);
      setTerapeutas(prev => [...prev, newTerapeuta]);
      return true;
    } catch (error) {
      console.error('Error al agregar terapeuta:', error);
      return false;
    }
  };

  // Actualizar un terapeuta existente
  const updateTerapeuta = async (name, terapeutaData) => {
    try {
      // Primero buscamos el terapeuta por nombre para obtener su ID
      const terapeutaToUpdate = terapeutas.find(t => t.name === name);
      
      if (!terapeutaToUpdate || !terapeutaToUpdate.id) {
        throw new Error('No se pudo encontrar el terapeuta para actualizar');
      }
      
      const updatedTerapeuta = await updateTherapist(terapeutaToUpdate.id, terapeutaData);
      
      setTerapeutas(prev => 
        prev.map(t => t.id === terapeutaToUpdate.id ? updatedTerapeuta : t)
      );
      
      return true;
    } catch (error) {
      console.error('Error al actualizar terapeuta:', error);
      return false;
    }
  };

  // Eliminar un terapeuta
  const deleteTerapeuta = async (name) => {
    try {
      // Primero buscamos el terapeuta por nombre para obtener su ID
      const terapeutaToDelete = terapeutas.find(t => t.name === name);
      
      if (!terapeutaToDelete || !terapeutaToDelete.id) {
        throw new Error('No se pudo encontrar el terapeuta para eliminar');
      }
      
      await deleteTherapist(terapeutaToDelete.id);
      
      setTerapeutas(prev => 
        prev.filter(t => t.id !== terapeutaToDelete.id)
      );
      
      return true;
    } catch (error) {
      console.error('Error al eliminar terapeuta:', error);
      return false;
    }
  };

  // Exportar terapeutas a un archivo
  const exportTerapeutas = () => {
    const therapistsString = JSON.stringify(terapeutas, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, "'");
    
    const codeString = `// Datos actualizados de los terapeutas - ${new Date().toLocaleDateString()}
const therapists = ${therapistsString};`;
    
    const element = document.createElement('a');
    const file = new Blob([codeString], {type: 'text/javascript'});
    element.href = URL.createObjectURL(file);
    element.download = `therapists-data-${new Date().toISOString().split('T')[0]}.js`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return {
    terapeutas,
    filteredTerapeutas,
    categories: CATEGORIES,
    disciplines: DISCIPLINES,
    areas,
    loading,
    error,
    addTerapeuta,
    updateTerapeuta,
    deleteTerapeuta,
    exportTerapeutas
  };
};


