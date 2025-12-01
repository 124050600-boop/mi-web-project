import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import InstitutionDetail from './pages/InstitutionDetail';
import InstitutionsList from './pages/InstitutionsList';
import OfertaEducativa from './pages/OfertaEducativa';
import VocationalTest from './pages/VocationalTest';
import Comparator from './pages/Comparator';
import WelcomeScreen from './components/WelcomeScreen';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  // We can use localStorage to show intro only once per session if desired
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      {showIntro && <WelcomeScreen onStart={() => setShowIntro(false)} />}
      
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* New Dedicated Pages */}
            <Route path="/instituciones" element={<InstitutionsList />} />
            <Route path="/oferta" element={<OfertaEducativa />} />
            
            <Route path="/instituciones/:id" element={<InstitutionDetail />} />
            <Route path="/test" element={<VocationalTest />} />
            <Route path="/comparador" element={<Comparator />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;