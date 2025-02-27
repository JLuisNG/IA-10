import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import LoginCard from './components/Login/LoginCard';
import Welcome from './components/Welcome/Welcome';
import './App.css';

function App() {
  // Usamos HashRouter en lugar de BrowserRouter para GitHub Pages
  // HashRouter usa # en las URLs (ejemplo: /#/welcome) lo que funciona mejor en GitHub Pages
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