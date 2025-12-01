import React, { useState } from 'react';
import { ArrowRight, CheckCircle, RefreshCcw, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUESTIONS = [
  { id: 1, text: "¿Te gusta resolver problemas matemáticos y lógicos?", type: 'R' }, // Realista/Investigativo (Simplified)
  { id: 2, text: "¿Disfrutas ayudar a otras personas y enseñar?", type: 'S' }, // Social
  { id: 3, text: "¿Te interesa dibujar, escribir o tocar música?", type: 'A' }, // Artistico
  { id: 4, text: "¿Te gusta organizar eventos y liderar equipos?", type: 'E' }, // Emprendedor
  { id: 5, text: "¿Prefieres trabajar con datos, archivos y orden?", type: 'C' }, // Convencional
];

const RESULTS = {
  'R': { title: 'Ingeniería y Tecnología', desc: 'Te van bien las carreras técnicas, ingenierías y ciencias exactas.', fieldId: 2 },
  'S': { title: 'Salud y Educación', desc: 'Podrías destacar en medicina, enfermería o docencia.', fieldId: 3 },
  'A': { title: 'Artes y Humanidades', desc: 'Considera diseño gráfico, arquitectura o literatura.', fieldId: 1 },
  'E': { title: 'Negocios y Liderazgo', desc: 'Administración, marketing y derecho son buenas opciones.', fieldId: 1 },
  'C': { title: 'Administración y Datos', desc: 'Contaduría, biblioteconomía y gestión administrativa.', fieldId: 1 }
};

const VocationalTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({'R':0,'S':0,'A':0,'E':0,'C':0});
  const [finished, setFinished] = useState(false);

  const handleAnswer = (val: number) => {
    const q = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [q.type]: answers[q.type] + val };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setFinished(true);
    }
  };

  const getResult = () => {
    const maxKey = Object.keys(answers).reduce((a, b) => answers[a] > answers[b] ? a : b);
    return RESULTS[maxKey as keyof typeof RESULTS];
  };

  if (finished) {
    const result = getResult();
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-indigo-50">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Resultado Listo!</h2>
          <p className="text-slate-500 mb-8">Según tus respuestas, tu perfil se alinea con:</p>
          
          <div className="bg-indigo-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-indigo-700 mb-2">{result.title}</h3>
            <p className="text-indigo-900/70">{result.desc}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => { setFinished(false); setCurrentStep(0); setAnswers({'R':0,'S':0,'A':0,'E':0,'C':0}); }}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Repetir
            </button>
            <Link 
              to={`/`} 
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              <BookOpen size={18} /> Ver Carreras Relacionadas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Descubre tu Vocación</h1>
        <p className="text-slate-500">Responde rápido y con sinceridad. No hay respuestas incorrectas.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
           <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="py-8">
           <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2 block">Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
           <h3 className="text-2xl font-medium text-slate-800 leading-snug">
             {QUESTIONS[currentStep].text}
           </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <button onClick={() => handleAnswer(3)} className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">¡Sí, mucho!</span>
              <span className="text-xs text-slate-400">Me identifico totalmente</span>
           </button>
           <button onClick={() => handleAnswer(2)} className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">Un poco</span>
              <span className="text-xs text-slate-400">A veces o depende</span>
           </button>
           <button onClick={() => handleAnswer(1)} className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">Casi nada</span>
              <span className="text-xs text-slate-400">Rara vez</span>
           </button>
           <button onClick={() => handleAnswer(0)} className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group">
              <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">No, para nada</span>
              <span className="text-xs text-slate-400">No me gusta</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default VocationalTest;
