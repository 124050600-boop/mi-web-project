
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import OfertaEducativa from './pages/OfertaEducativa';
import InstitutionDetail from './pages/InstitutionDetail';
import InstitutionsList from './pages/InstitutionsList';
import VocationalTest from './pages/VocationalTest';
import Comparator from './pages/Comparator';
import AdminImport from './pages/AdminImport';
import StudentProfile from './pages/StudentProfile';
import WelcomeScreen from './components/WelcomeScreen';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      {showIntro && <WelcomeScreen onStart={() => setShowIntro(false)} />}
      
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oferta" element={<OfertaEducativa />} />
            <Route path="/instituciones" element={<InstitutionsList />} />
            <Route path="/instituciones/:id" element={<InstitutionDetail />} />
            <Route path="/test" element={<VocationalTest />} />
            <Route path="/comparador" element={<Comparator />} />
            <Route path="/perfil" element={<StudentProfile />} />
            <Route path="/admin" element={<AdminImport />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
