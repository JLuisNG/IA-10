import React from 'react';

const TerapeutasTabla = ({ terapeutas, categories, disciplines, onEdit, onDelete }) => {
  return (
    <div className="therapists-table-container">
      <table className="therapists-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Nombre</th>
            <th>Áreas</th>
            <th>Idiomas</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {terapeutas.length > 0 ? (
            terapeutas.map((terapeuta) => (
              <tr key={terapeuta.name} className={`category-${terapeuta.category}`}>
                <td>{disciplines[terapeuta.type] || terapeuta.type}</td>
                <td className={`name-${terapeuta.category}`}>{terapeuta.name}</td>
                <td>{terapeuta.areas}</td>
                <td>{terapeuta.languages || ''}</td>
                <td>{terapeuta.phone || ''}</td>
                <td>{terapeuta.email || ''}</td>
                <td>
                  <span className={`status-badge status-${terapeuta.status}`}>
                    {terapeuta.status}
                  </span>
                </td>
                <td>{categories[terapeuta.category] || terapeuta.category}</td>
                <td className="actions">
                  <button 
                    className="action-btn" 
                    onClick={() => onEdit(terapeuta)} 
                    title="Editar"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="action-btn" 
                    onClick={() => onDelete(terapeuta.name)} 
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-data">
                No se encontraron terapeutas con los criterios de búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TerapeutasTabla;