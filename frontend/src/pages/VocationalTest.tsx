import React, { useState } from 'react';
import { ArrowRight, CheckCircle, RefreshCcw, BookOpen, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUESTIONS = [
  { id: 1, text: "¿Te gusta resolver problemas matemáticos complejos?", type: 'Ingeniería' },
  { id: 2, text: "¿Disfrutas ayudar a las personas y cuidar de su bienestar?", type: 'Salud' },
  { id: 3, text: "¿Te interesa cómo funcionan las leyes y la justicia?", type: 'Sociales' },
  { id: 4, text: "¿Te gusta dibujar, diseñar o crear contenido visual?", type: 'Artes' },
  { id: 5, text: "¿Prefieres liderar proyectos y organizar equipos?", type: 'Negocios' },
];

const VocationalTest: React.FC = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const handleAnswer = (weight: number) => {
    const type = QUESTIONS[step].type;
    setScores(prev => ({ ...prev, [type]: (prev[type] || 0) + weight }));
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const getResult = () => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'General';
  };

  if (finished) {
    const result = getResult();
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl p-10 shadow-xl border border-indigo-50 text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Test Completado!</h2>
          <p className="text-slate-500 mb-8">Tu perfil tiene una fuerte afinidad con el área de:</p>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-lg shadow-indigo-200 transform hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold mb-1">{result}</h3>
            <p className="text-indigo-100 text-sm">Explora carreras relacionadas a esta área.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              to={`/oferta`} 
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen size={20} /> Ver Oferta Educativa
            </Link>
            <button 
              onClick={() => { setFinished(false); setStep(0); setScores({}); }}
              className="w-full py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCcw size={20} /> Repetir Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-indigo-600 font-bold text-sm mb-4">
            <BrainCircuit size={18} /> Orientación Vocacional
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Descubre tu Camino</h1>
        <p className="text-slate-500 max-w-md mx-auto">Responde sinceramente para encontrar las carreras que mejor se adaptan a ti.</p>
      </div>

      <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full">
            <div 
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
        </div>

        <div className="py-8 text-center">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pregunta {step + 1} de {QUESTIONS.length}</span>
           <h3 className="text-2xl font-bold text-slate-800 mt-4 mb-2 min-h-[4rem] flex items-center justify-center">
             {QUESTIONS[step].text}
           </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <button onClick={() => handleAnswer(3)} className="p-5 rounded-xl border-2 border-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block text-lg">😍 ¡Me encanta!</span>
           </button>
           <button onClick={() => handleAnswer(2)} className="p-5 rounded-xl border-2 border-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block text-lg">🙂 Me gusta</span>
           </button>
           <button onClick={() => handleAnswer(1)} className="p-5 rounded-xl border-2 border-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block text-lg">😐 Me da igual</span>
           </button>
           <button onClick={() => handleAnswer(0)} className="p-5 rounded-xl border-2 border-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block text-lg">😫 No me gusta</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default VocationalTest;