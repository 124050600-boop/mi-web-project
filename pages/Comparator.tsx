import React from 'react';
import { LayoutGrid } from 'lucide-react';

const Comparator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <LayoutGrid size={40} />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Comparador de Universidades</h1>
      <p className="text-slate-500 max-w-md">
        Selecciona hasta 3 universidades o carreras para ver sus diferencias lado a lado.
        <br/><span className="text-xs mt-2 block">(Funcionalidad en desarrollo)</span>
      </p>
      <button className="mt-8 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
        Explorar Mapa para añadir
      </button>
    </div>
  );
};

export default Comparator;
