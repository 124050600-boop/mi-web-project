
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstituciones, getOfertas } from '../api';
import { Institucion, Oferta } from '../types';
import { MapPin, Globe, BookOpen, Building2, ChevronRight, School, Monitor, Users, Search } from 'lucide-react';

const InstitutionsList: React.FC = () => {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [allOfertas, setAllOfertas] = useState<Oferta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const insts = await getInstituciones();
        const ofertas = await getOfertas();
        setInstituciones(insts || []);
        setAllOfertas(ofertas || []);
      } catch (error) {
        console.error("Failed to load list data", error);
      }
    };
    loadData();
  }, []);

  const getInstDetails = (instId: number) => {
    const instOfertas = allOfertas.filter(o => o.inst_id === instId);
    
    // Safety check for potential undefined nested objects (municipio, modalidad)
    const municipios = Array.from(new Set(
        instOfertas.map(o => o.municipio?.nombre).filter(Boolean)
    )).slice(0, 2);
    
    const municipiosStr = municipios.length > 0 
        ? municipios.join(', ') + (instOfertas.length > 0 && municipios.length < 2 ? '' : '') 
        : 'Ubicación no especificada';

    const modalidades = Array.from(new Set(
        instOfertas.map(o => o.modalidad?.nombre).filter(Boolean)
    ));

    // Get Top 3 Careers
    const topCarreras = instOfertas
        .slice(0, 3)
        .map(o => o.carrera?.nombre)
        .filter(Boolean);

    return { 
        count: instOfertas.length, 
        municipiosStr,
        modalidades,
        topCarreras
    };
  };

  const filteredInstituciones = instituciones.filter(inst => 
    inst.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.siglas && inst.siglas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Directorio de Instituciones</h1>
            <p className="text-slate-500 mt-2">Explora las universidades y centros educativos registrados en Querétaro.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredInstituciones.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
             <School size={48} className="mx-auto mb-4 opacity-50"/>
             <p>{instituciones.length === 0 ? "Cargando instituciones..." : "No se encontraron instituciones."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstituciones.map((inst) => {
              const details = getInstDetails(inst.id_institucion);
              return (
                <Link 
                  to={`/instituciones/${inst.id_institucion}`} 
                  key={inst.id_institucion}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Header: Logo y Nombre */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl shadow-md shrink-0 overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
                        {inst.logoUrl ? (
                            <img src={inst.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                        ) : (
                            <div className={`w-full h-full ${inst.color || 'bg-slate-600'} flex items-center justify-center text-white font-bold`}>
                                {inst.siglas || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {inst.nombre}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border mt-1 inline-block ${inst.tipo === 'Pública' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                            {inst.tipo}
                        </span>
                    </div>
                  </div>
                  
                  {/* Detalles Principales */}
                  <div className="flex-1 space-y-3 mb-4">
                    
                    {/* Municipio */}
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{details.municipiosStr}</span>
                    </div>

                    {/* Web */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Globe size={16} className="text-indigo-500 shrink-0" />
                        <span className="truncate hover:underline">{inst.www || 'Sitio no registrado'}</span>
                    </div>

                    {/* Lista carreras */}
                    <div className="pt-2 border-t border-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Principales Programas:</p>
                        <div className="space-y-1">
                            {details.topCarreras.length > 0 ? details.topCarreras.map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                    <span className="truncate">{c}</span>
                                </div>
                            )) : <span className="text-xs text-slate-400 italic">No hay datos</span>}
                        </div>
                    </div>
                  </div>

                  {/* Footer: Count y Modalidades */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                     <div className="flex flex-wrap gap-1">
                        {details.modalidades.map(mod => (
                            <span key={mod} className="text-[10px] flex items-center gap-1 bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                {mod.includes('LÍNEA') ? <Monitor size={8} /> : <Users size={8} />}
                                {mod}
                            </span>
                        ))}
                     </div>
                     <div className="flex items-center gap-1 text-slate-500 ml-auto">
                        <BookOpen size={14} className="text-indigo-600" />
                        <span className="text-xs font-bold text-slate-700">{details.count}</span>
                     </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionsList;