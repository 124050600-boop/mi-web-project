import React from 'react';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comparator: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 text-indigo-600 rotate-3 hover:rotate-6 transition-transform">
            <LayoutGrid size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-4">Comparador Académico</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
            Estamos construyendo una herramienta poderosa para que puedas comparar planes de estudio, costos y ubicaciones lado a lado.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 text-left mb-8">
            <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
            <div>
                <h4 className="font-bold text-yellow-800 text-sm">Próximamente</h4>
                <p className="text-yellow-700 text-xs mt-1">Esta función estará disponible en la próxima actualización de UniMap.</p>
            </div>
        </div>

        <Link to="/" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
            Volver al Mapa
        </Link>
      </div>
    </div>
  );
};

export default Comparator;