import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginCard from './components/Login/LoginCard';
import Welcome from './components/Welcome/Welcome';
import UbicacionServicios from './components/servicios/Ubicacion/UbicacionServicios';
import Agencias from './components/agencies/Agencias';
import Referrals from './components/servicios/referrals/Referrals';
import Pacientes from './components/servicios/pacientes/Pacientes';

// Importar FontAwesome

import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginCard />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/ubicacion" element={<UbicacionServicios />} />
        <Route path="/agencias" element={<Agencias />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/pacientes" element={<Pacientes />} />
        
        <Route path="/frecuencias" element={<Welcome />} />
        <Route path="/therapy-sync" element={<Welcome />} />
        <Route path="/soporte" element={<Welcome />} />
        
        {/* Rutas adicionales para las acciones rápidas */}
        <Route path="/reportes" element={<Welcome />} />
      </Routes>
    </HashRouter>
  );
}

export default App;