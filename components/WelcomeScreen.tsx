import React, { useEffect, useState } from 'react';
import { Map, GraduationCap, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [visible, setVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  const handleStart = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setVisible(false);
      onStart();
    }, 800); // Wait for animation to finish
  };

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-indigo-900 flex flex-col items-center justify-center text-white transition-all duration-700 ease-in-out ${
        animateOut ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="relative mb-8 p-6">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative bg-white text-indigo-900 p-6 rounded-3xl shadow-2xl transform transition-transform hover:scale-105 duration-500">
          <Map size={64} strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-4 tracking-tight text-center">
        UniMap <span className="text-indigo-300">Querétaro</span>
      </h1>
      
      <p className="text-lg text-indigo-200 mb-12 max-w-md text-center leading-relaxed px-4">
        Explora la oferta educativa, compara universidades y encuentra tu camino profesional en el mapa interactivo más completo.
      </p>

      <button 
        onClick={handleStart}
        className="group relative px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-3"
      >
        <GraduationCap size={20} />
        <span>Comenzar Búsqueda</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="absolute bottom-8 text-xs text-indigo-400 opacity-60">
        Datos oficiales • Actualizado 2024
      </div>
    </div>
  );
};

export default WelcomeScreen;