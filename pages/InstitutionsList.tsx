import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstituciones, getOfertas } from '../services/dataService';
import { Institucion, Oferta } from '../types';
import { MapPin, Globe, BookOpen, Building2, ChevronRight } from 'lucide-react';

const InstitutionsList: React.FC = () => {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [allOfertas, setAllOfertas] = useState<Oferta[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const insts = await getInstituciones();
      const ofertas = await getOfertas();
      setInstituciones(insts);
      setAllOfertas(ofertas);
    };
    loadData();
  }, []);

  const getStats = (instId: number) => {
    const instOfertas = allOfertas.filter(o => o.institucion.id_institucion === instId);
    const niveles = new Set(instOfertas.map(o => o.nivel.nombre));
    const topCarreras = instOfertas.slice(0, 3);
    return { count: instOfertas.length, niveles: Array.from(niveles), topCarreras };
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Instituciones</h1>
        <p className="text-slate-500">Explora las universidades y centros educativos registrados en Querétaro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instituciones.map((inst) => {
          const stats = getStats(inst.id_institucion);
          return (
            <Link 
              to={`/instituciones/${inst.id_institucion}`} 
              key={inst.id_institucion}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Building2 size={24} />
                </div>
                <span className="bg-slate-50 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                  {stats.count} Programas
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                {inst.nombre}
              </h3>
              
              <div className="flex items-center text-xs text-slate-400 mb-6">
                 {inst.www ? (
                    <span className="flex items-center gap-1"><Globe size={12}/> {inst.www}</span>
                 ) : (
                    <span className="flex items-center gap-1"><MapPin size={12}/> Ver ubicación</span>
                 )}
              </div>

              {/* Mini Offer Preview */}
              <div className="flex-1 space-y-2 mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Principales Carreras:</p>
                {stats.topCarreras.length > 0 ? (
                    stats.topCarreras.map(c => (
                        <div key={c.id_oferta} className="text-sm text-slate-600 flex items-center gap-2 truncate">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0"></div>
                            <span className="truncate">{c.carrera.nombre}</span>
                        </div>
                    ))
                ) : (
                    <span className="text-sm text-slate-400 italic">No hay oferta registrada visible.</span>
                )}
                {stats.count > 3 && (
                    <p className="text-xs text-indigo-500 font-medium pl-3">+ {stats.count - 3} más...</p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex gap-1">
                   {stats.niveles.map(n => (
                       <span key={n} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                           {n}
                       </span>
                   ))}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default InstitutionsList;