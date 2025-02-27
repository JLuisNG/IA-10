import { useState, useEffect, useMemo } from 'react';

// Constantes y configuración
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

// Datos iniciales (en un entorno real, estos vendrían de una API)
const initialTerapeutas = [
  {
    "name": "Ivan Lins",
    "type": "PTA",
    "category": "standard",
    "areas": "San Fernando Valley, Van Nuys, Sherman Oaks, Northridge, Winnetka, Woodland Hills, West Hills, Porter Ranch, Reseda",
    "languages": "english",
    "phone": "(818) 697-3948",
    "email": "ivanlins24@yahoo.com",
    "status": "active"
  },
  {
    "name": "Mikaela Chua",
    "type": "PTA",
    "category": "basic",
    "areas": "Marina, Venice (some), Playa del Rey, Playa Vista, El Segundo, Manhattan Beach, Hermosa Beach, Redondo Beach, Lawndale, Torrance, Santa Monica (weekends for $75)",
    "languages": "english",
    "phone": "(310) 658-0493",
    "email": "mikavchua@gmail.com",
    "status": "active"
  }
];

export const useTerapeutas = (searchTerm = '', filters = {}) => {
  // Estado para almacenar los terapeutas
  const [terapeutas, setTerapeutas] = useState([]);
  
  // Cargar datos iniciales
  useEffect(() => {
    // En un entorno real, aquí haríamos una llamada a la API
    // Por ahora, cargamos de localStorage o usamos los datos iniciales
    const storedTerapeutas = JSON.parse(localStorage.getItem('therapists'));
    if (storedTerapeutas && storedTerapeutas.length > 0) {
      setTerapeutas(storedTerapeutas);
    } else {
      setTerapeutas(initialTerapeutas);
      localStorage.setItem('therapists', JSON.stringify(initialTerapeutas));
    }
  }, []);

  // Guardar cambios en localStorage (simulando guardado en DB)
  useEffect(() => {
    if (terapeutas.length > 0) {
      localStorage.setItem('therapists', JSON.stringify(terapeutas));
    }
  }, [terapeutas]);

  // Extraer áreas únicas
  const areas = useMemo(() => {
    const allAreas = terapeutas.flatMap(t => {
      const areasStr = t.areas || '';
      return areasStr
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
    });
    
    return [...new Set(allAreas)].sort((a, b) => a.localeCompare(b));
  }, [terapeutas]);

  // Filtrar terapeutas según búsqueda y filtros
  const filteredTerapeutas = useMemo(() => {
    let filtered = [...terapeutas];
    
    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(terapeuta => 
        Object.values(terapeuta).some(value => 
          value && value.toString().toLowerCase().includes(term)
        )
      );
    }
    
    // Aplicar filtros
    if (filters.area) {
      filtered = filtered.filter(t => 
        t.areas && t.areas.toLowerCase().includes(filters.area.toLowerCase())
      );
    }
    
    if (filters.discipline) {
      filtered = filtered.filter(t => t.type === filters.discipline);
    }
    
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    return filtered;
  }, [terapeutas, searchTerm, filters]);

  // Funciones CRUD
  const addTerapeuta = (newTerapeuta) => {
    // Validar que no exista un terapeuta con el mismo nombre
    if (terapeutas.some(t => t.name === newTerapeuta.name)) {
      alert(`Ya existe un terapeuta con el nombre: ${newTerapeuta.name}`);
      return false;
    }
    
    setTerapeutas(prev => [...prev, newTerapeuta]);
    return true;
  };

  const updateTerapeuta = (originalName, updatedTerapeuta) => {
    // Si el nombre cambió, validar que no exista otro terapeuta con ese nombre
    if (originalName !== updatedTerapeuta.name && 
        terapeutas.some(t => t.name === updatedTerapeuta.name)) {
      alert(`Ya existe un terapeuta con el nombre: ${updatedTerapeuta.name}`);
      return false;
    }
    
    setTerapeutas(prev => 
      prev.map(t => t.name === originalName ? updatedTerapeuta : t)
    );
    return true;
  };

  const deleteTerapeuta = (name) => {
    setTerapeutas(prev => prev.filter(t => t.name !== name));
    return true;
  };

  // Función para exportar los datos
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
    addTerapeuta,
    updateTerapeuta,
    deleteTerapeuta,
    exportTerapeutas
  };
};