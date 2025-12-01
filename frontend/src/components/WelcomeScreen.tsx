import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Map } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    setTimeout(onStart, 600);
  };

  if (fading) return null; // Or keep rendering with opacity 0 for transition

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center text-white transition-opacity duration-700 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-900/50 transform hover:scale-105 transition-transform duration-500">
            <Map size={48} className="text-white" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
          MapEDU
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-12 leading-relaxed">
          La plataforma inteligente para descubrir tu futuro académico en <span className="text-white font-bold">Querétaro</span>.
        </p>

        <button 
          onClick={handleStart}
          className="group relative px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-3 mx-auto"
        >
          <span>Comenzar ahora</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-8 text-slate-500 text-xs uppercase tracking-widest font-bold">
        Versión 2.0 • Sistema Educativo
      </div>
    </div>
  );
};

export default WelcomeScreen;