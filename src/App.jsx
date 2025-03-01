import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginCard from './components/Login/LoginCard';
import Welcome from './components/Welcome/Welcome';
import UbicacionServicios from './components/servicios/Ubicacion/UbicacionServicios';
import Agencies from './components/agencies/agencies';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginCard />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/ubicacion" element={<UbicacionServicios />} />
        <Route path="/therapy-sync" element={<Welcome />} />
        <Route path="/agencias" element={<Welcome />} />
        <Route path="/agencies" element={<Agencies />} /> {/* Añade esta ruta */}
        <Route path="/soporte" element={<Welcome />} />
        {/* Rutas adicionales para las acciones rápidas */}
        <Route path="/nuevo-caso" element={<Welcome />} />
        <Route path="/asignar-terapeuta" element={<Welcome />} />
        <Route path="/reportes" element={<Welcome />} />
      </Routes>
    </HashRouter>
  );
}

export default App;