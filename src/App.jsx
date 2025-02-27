import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginCard from './components/Login/LoginCard';
import Welcome from './components/Welcome/Welcome';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginCard />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </HashRouter>
  );
}

export default App;