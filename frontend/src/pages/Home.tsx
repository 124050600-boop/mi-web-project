
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, School, X, BookOpen, MapPin } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { getEscuelasMap, getOfertas } from '../api';
import { Escuela, Oferta } from '../types';

const Home = () => {
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEscuela, setSelectedEscuela] = useState<Escuela | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const initData = async () => {
        const [escuelasData, ofertasData] = await Promise.all([
            getEscuelasMap(),
            getOfertas()
        ]);
        setEscuelas(escuelasData);
        setOfertas(ofertasData);
    };
    initData();
  }, []);

  const filteredEscuelas = useMemo(() => {
    if (!search.trim()) return escuelas;
    const lowerSearch = search.toLowerCase().trim();
    
    return escuelas.filter(e => {
        // Search by Campus Name
        if (e.nombre.toLowerCase().includes(lowerSearch)) return true;
        // Search by Institution Name
        if (e.inst_nombre && e.inst_nombre.toLowerCase().includes(lowerSearch)) return true;
        // Search by Acronym (Siglas)
        if (e.siglas && e.siglas.toLowerCase().includes(lowerSearch)) return true;
        // Search by Municipality (Zoom Seccional)
        if (e.municipio_nombre && e.municipio_nombre.toLowerCase().includes(lowerSearch)) return true;

        // Search by Career Name (Offer Matching)
        const hasCareerMatch = ofertas.some(o => 
            o.escuela?.id_escuela == e.id_escuela && 
            o.carrera.nombre.toLowerCase().includes(lowerSearch)
        );

        return hasCareerMatch;
    });
  }, [search, escuelas, ofertas]);

  const handleSelect = (escuela: Escuela) => {
      setSelectedEscuela(escuela);
      setSearch(escuela.nombre); 
      setShowResults(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setShowResults(true);
      if(e.target.value === '') setSelectedEscuela(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapComponent 
            escuelas={filteredEscuelas} 
            ofertas={ofertas} 
            selectedEscuela={selectedEscuela} 
        />
      </div>

      <div className="absolute top-4 left-4 z-[500] w-full max-w-sm pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-1 flex items-center transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white">
                <div className="p-3 text-slate-400"><Search size={20} /></div>
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-sm font-medium h-10"
                    placeholder="Buscar universidad, carrera o municipio..."
                    value={search}
                    onChange={handleSearchChange}
                    onFocus={() => setShowResults(true)}
                />
                {search && (
                    <button onClick={() => { setSearch(''); setSelectedEscuela(null); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"><X size={16} /></button>
                )}
            </div>

            {showResults && search && (
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up origin-top max-h-[60vh] overflow-y-auto custom-scroll">
                    {filteredEscuelas.length > 0 ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1 flex justify-between">
                                <span>{filteredEscuelas.length} Resultados</span>
                            </div>
                            {filteredEscuelas.slice(0, 8).map(esc => {
                                // Find stats for preview
                                const campusOffers = ofertas.filter(o => o.escuela?.id_escuela == esc.id_escuela);
                                const careerPreview = campusOffers.slice(0, 1).map(o => o.carrera.nombre).join('');
                                const extraCount = campusOffers.length - 1;

                                return (
                                    <button key={esc.id_escuela} onClick={() => handleSelect(esc)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 group border-b border-slate-50 last:border-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-[10px] shadow-sm overflow-hidden border border-slate-100 bg-white`}>
                                            {esc.logoUrl ? <img src={esc.logoUrl} className="w-full h-full object-cover" /> : <span className="text-slate-600">{esc.siglas}</span>}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-indigo-700">{esc.inst_nombre}</h4>
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                                <MapPin size={10} /> {esc.nombre} {esc.municipio_nombre ? `(${esc.municipio_nombre})` : ''}
                                            </p>
                                            {campusOffers.length > 0 && (
                                                <p className="text-[10px] text-indigo-500 mt-0.5 truncate">
                                                    <BookOpen size={10} className="inline mr-1"/>
                                                    {careerPreview} {extraCount > 0 && `+${extraCount}`}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-400" />
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-slate-400">
                            <School size={24} className="mx-auto mb-2 opacity-50"/>
                            <p className="text-xs font-medium">No hay coincidencias.</p>
                            <p className="text-[10px] mt-1 opacity-70">Prueba con otro nombre o municipio.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Home;
