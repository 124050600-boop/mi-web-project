
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getFilters, getOfertas, getInstituciones, getInfoCarreras, getOfertaDetails } from '../api';
import { Oferta, Municipio, CampoFormacion, Nivel, Modalidad, Institucion, InfoCarrera, DetalleOferta } from '../types';
import { Search, Filter, BookOpen, MapPin, Clock, X, Check, Monitor, Users, Layers, Building2, ArrowRight, Image, Briefcase, GraduationCap, Zap, ZoomIn, ZoomOut, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper to ignore accents and case
const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const OfertaEducativa = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [infoCarreras, setInfoCarreras] = useState<InfoCarrera[]>([]);
  
  // Catalogs
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [campos, setCampos] = useState<CampoFormacion[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [filterNivel, setFilterNivel] = useState<string[]>([]);
  const [filterPeriodo, setFilterPeriodo] = useState<string[]>([]);
  const [filterModalidad, setFilterModalidad] = useState<string[]>([]);
  const [filterMunicipio, setFilterMunicipio] = useState<string>('');
  const [filterCampo, setFilterCampo] = useState<string[]>([]);

  // DETAILS MODAL STATE
  const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
  const [ofertaDetails, setOfertaDetails] = useState<DetalleOferta | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // CAROUSEL STATE (APPLE STYLE)
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      const data = await getFilters();
      setMunicipios(data.municipios);
      setCampos(data.campos);
      setNiveles(data.niveles);
      setModalidades(data.modalidades);
      
      const allOfertas = await getOfertas();
      setOfertas(allOfertas);
      
      const insts = await getInstituciones();
      setInstituciones(insts);

      const infos = await getInfoCarreras();
      setInfoCarreras(infos);
    };
    init();
  }, []);

  const filtered = useMemo(() => {
    return ofertas.filter(o => {
      const inst = instituciones.find(i => i.id_institucion === o.inst_id);
      const matchSearch = o.carrera.nombre.toLowerCase().includes(search.toLowerCase()) || inst?.nombre.toLowerCase().includes(search.toLowerCase());
      const matchNivel = filterNivel.length === 0 || filterNivel.includes(o.nivel.nombre);
      const matchModalidad = filterModalidad.length === 0 || filterModalidad.includes(o.modalidad.nombre);
      const periodo = o.duracion.toLowerCase().includes('cuatri') ? 'Cuatrimestral' : 'Semestral';
      const matchPeriodo = filterPeriodo.length === 0 || filterPeriodo.includes(periodo);
      const matchCampo = filterCampo.length === 0 || filterCampo.includes(o.campo?.id_campo?.toString() || '');
      const matchMunicipio = !filterMunicipio || o.municipio.id_municipio?.toString() === filterMunicipio;

      return matchSearch && matchNivel && matchPeriodo && matchModalidad && matchCampo && matchMunicipio;
    });
  }, [ofertas, instituciones, search, filterNivel, filterPeriodo, filterModalidad, filterCampo, filterMunicipio]);

  // --- CAROUSEL LOGIC ---
  const isShowcaseMode = !search && filterNivel.length === 0 && filterPeriodo.length === 0 && filterModalidad.length === 0 && filterCampo.length === 0 && !filterMunicipio;

  useEffect(() => {
      if (isShowcaseMode && infoCarreras.length > 0) {
          startAutoPlay();
      }
      return () => stopAutoPlay();
  }, [isShowcaseMode, infoCarreras.length]);

  const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayRef.current = setInterval(() => {
          setActiveIndex((prev) => (prev + 1) % infoCarreras.length);
      }, 5000); 
  };

  const stopAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const nextSlide = () => {
      stopAutoPlay();
      setActiveIndex((prev) => (prev + 1) % infoCarreras.length);
      startAutoPlay();
  };

  const prevSlide = () => {
      stopAutoPlay();
      setActiveIndex((prev) => (prev - 1 + infoCarreras.length) % infoCarreras.length);
      startAutoPlay();
  };

  const goToSlide = (idx: number) => {
      stopAutoPlay();
      setActiveIndex(idx);
      startAutoPlay();
  };

  const toggleFilter = (item: string, state: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(n => n !== item) : [...prev, item]);
  }

  const clearFilters = () => {
    setSearch('');
    setFilterNivel([]);
    setFilterPeriodo([]);
    setFilterModalidad([]);
    setFilterCampo([]);
    setFilterMunicipio('');
    setIsDrawerOpen(false); 
  };

  const handleOpenPlan = async (oferta: Oferta) => {
      setSelectedOferta(oferta);
      setIsLoadingDetails(true);
      setOfertaDetails(null);
      setZoomLevel(1);
      try {
          const details = await getOfertaDetails(oferta.id_oferta);
          setOfertaDetails(details);
      } catch (error) {
          console.error(error);
      } finally {
          setIsLoadingDetails(false);
      }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-6rem)] bg-slate-50">
      
      {/* Sidebar Filters */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-r border-slate-200 lg:z-auto lg:w-72 lg:flex
        ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center lg:hidden bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800">Filtros</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-white rounded-full text-slate-500 shadow-sm"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
                 <div className="flex items-center justify-between lg:mb-4">
                    <div className="hidden lg:flex items-center gap-2 text-indigo-600">
                        <Filter size={20} />
                        <span className="font-bold text-lg">Filtros</span>
                    </div>
                    {!isShowcaseMode && (
                        <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-indigo-600 underline">Limpiar todo</button>
                    )}
                 </div>

                {/* Search */}
                <div className="relative">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Búsqueda</label>
                    <Search className="absolute left-3 top-9 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Ej. Derecho, Sistemas..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Nivel */}
                <div>
                <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Nivel Académico</h4>
                <div className="space-y-2">
                    {niveles.map(n => (
                    <label key={n.id_nivel} className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filterNivel.includes(n.nombre) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                        {filterNivel.includes(n.nombre) && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={filterNivel.includes(n.nombre)} onChange={() => toggleFilter(n.nombre, filterNivel, setFilterNivel)} />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{n.nombre}</span>
                    </label>
                    ))}
                </div>
                </div>

                {/* Modalidad */}
                <div>
                    <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Modalidad</h4>
                    <div className="space-y-2">
                        {modalidades.map(m => (
                        <label key={m.id_modalidad} className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filterModalidad.includes(m.nombre) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                            {filterModalidad.includes(m.nombre) && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>
                            <input type="checkbox" className="hidden" checked={filterModalidad.includes(m.nombre)} onChange={() => toggleFilter(m.nombre, filterModalidad, setFilterModalidad)} />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 flex items-center gap-2">
                                {m.nombre.includes('Línea') ? <Monitor size={14} className="text-slate-400"/> : m.nombre.includes('Mixta') ? <Layers size={14} className="text-slate-400"/> : <Users size={14} className="text-slate-400"/>}
                                {m.nombre}
                            </span>
                        </label>
                        ))}
                    </div>
                </div>

                {/* Campos */}
                <div>
                      <h3 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Área de Estudio</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {campos.map(c => (
                              <label key={c.id_campo} className="flex items-start gap-3 cursor-pointer group">
                                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${filterCampo.includes(c.id_campo?.toString() || '') ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                      {filterCampo.includes(c.id_campo?.toString() || '') && <X size={12} className="text-white rotate-45" strokeWidth={4} />}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden"
                                    onChange={() => toggleFilter(c.id_campo?.toString() || '', filterCampo, setFilterCampo)}
                                  />
                                  <span className="text-sm text-slate-600 group-hover:text-slate-900 leading-tight">{c.nombre}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                   {/* Municipio */}
                   <div>
                      <h3 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Ubicación</h3>
                      <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                        value={filterMunicipio}
                        onChange={(e) => setFilterMunicipio(e.target.value)}
                      >
                          <option value="">Todo el estado</option>
                          {municipios.map(m => (
                              <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>
                          ))}
                      </select>
                  </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 lg:hidden bg-white">
                <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    Ver Resultados
                </button>
            </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full bg-slate-50/50 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-lg font-bold text-slate-800">Oferta Educativa</h1>
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Filter size={20}/></button>
        </div>

        {/* --- SHOWCASE MODE: APPLE STYLE CAROUSEL --- */}
        {isShowcaseMode && infoCarreras.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-100 to-white overflow-hidden relative">
                
                {/* Carousel Container */}
                <div 
                    className="relative w-full max-w-5xl h-[550px] flex items-center justify-center perspective-1000"
                    onMouseEnter={stopAutoPlay}
                    onMouseLeave={startAutoPlay}
                >
                    {infoCarreras.map((info, idx) => {
                        let position = 'hidden';
                        if (idx === activeIndex) position = 'active';
                        else if (idx === (activeIndex - 1 + infoCarreras.length) % infoCarreras.length) position = 'prev';
                        else if (idx === (activeIndex + 1) % infoCarreras.length) position = 'next';

                        // Advanced Matching Logic (Normalized Text)
                        const key = normalizeText(info.palabraClave || '');
                        const matchingOffers = ofertas
                            .filter(o => normalizeText(o.carrera.nombre).includes(key))
                            // Create unique entries by Institution + Campus
                            .filter((offer, index, self) => 
                                index === self.findIndex((t) => (
                                    t.inst_id === offer.inst_id && t.escuela.id_escuela === offer.escuela.id_escuela
                                ))
                            )
                            .slice(0, 3); // Top 3

                        let cardStyle = "translate-x-0 scale-100 opacity-100 z-30";
                        if (position === 'prev') cardStyle = "-translate-x-[60%] scale-90 opacity-40 z-10 blur-[2px] cursor-pointer hover:opacity-60";
                        if (position === 'next') cardStyle = "translate-x-[60%] scale-90 opacity-40 z-10 blur-[2px] cursor-pointer hover:opacity-60";
                        if (position === 'hidden') cardStyle = "opacity-0 scale-50 z-0 pointer-events-none absolute";

                        return (
                            <div 
                                key={info.id_info}
                                onClick={() => {
                                    if (position === 'active') setSearch(info.palabraClave || '');
                                    else if (position === 'prev') prevSlide();
                                    else if (position === 'next') nextSlide();
                                }}
                                className={`absolute w-[320px] md:w-[450px] h-[550px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${cardStyle}`}
                            >
                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group bg-slate-900">
                                    {info.imagenUrl && (
                                        <img 
                                            src={info.imagenUrl} 
                                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-70 group-hover:scale-105 transition-all duration-1000" 
                                            alt={info.tituloMarketing} 
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                                    
                                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col h-full justify-end">
                                        <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest w-fit">
                                            Explora
                                        </span>
                                        <h3 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[0.9] tracking-tight drop-shadow-xl">
                                            {info.tituloMarketing}
                                        </h3>
                                        <p className="text-slate-200 text-sm md:text-base mb-8 leading-relaxed line-clamp-3 font-medium opacity-90">
                                            {info.descripcionBreve}
                                        </p>
                                        
                                        {/* Auto-generated Offer List with Campus & Modality */}
                                        <div className="mt-auto">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                                                Disponibilidad Destacada:
                                            </p>
                                            <div className="space-y-2">
                                                {matchingOffers.map(o => (
                                                     <div key={o.id_oferta} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 transition-transform hover:scale-[1.02] cursor-pointer">
                                                        {/* Logo */}
                                                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                                            {o.institucion.logoUrl ? <img src={o.institucion.logoUrl} className="w-full h-full object-cover"/> : <span className="text-[10px] font-bold text-slate-800">{o.institucion.siglas}</span>}
                                                        </div>
                                                        {/* Info */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs font-bold text-white truncate pr-2">{o.institucion.nombre}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] text-slate-300 truncate max-w-[120px] flex items-center gap-1">
                                                                    <MapPin size={10} /> {o.escuela.nombre}
                                                                </span>
                                                                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                   {o.modalidad.nombre.includes('Línea') ? <Monitor size={8}/> : <Users size={8}/>} {o.modalidad.nombre}
                                                                </span>
                                                            </div>
                                                        </div>
                                                     </div>
                                                ))}
                                                {matchingOffers.length === 0 && <span className="text-xs text-slate-500 italic">Varias opciones disponibles en el estado.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="absolute bottom-10 flex gap-6 z-40 items-center">
                    <button onClick={prevSlide} className="p-4 rounded-full bg-white/90 hover:bg-white shadow-xl text-slate-900 transition-all hover:scale-110 active:scale-95"><ChevronLeft size={24} /></button>
                    <div className="flex gap-3 items-center px-6 py-3 bg-black/10 rounded-full backdrop-blur-md border border-white/10">
                        {infoCarreras.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => goToSlide(idx)}
                                className={`h-2 rounded-full transition-all duration-500 ${idx === activeIndex ? 'bg-indigo-600 w-8' : 'bg-slate-400/50 w-2 hover:bg-slate-400'}`}
                            />
                        ))}
                    </div>
                    <button onClick={nextSlide} className="p-4 rounded-full bg-white/90 hover:bg-white shadow-xl text-slate-900 transition-all hover:scale-110 active:scale-95"><ChevronRight size={24} /></button>
                </div>

            </div>
        ) : (
            /* GRID MODE (FILTERED) */
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scroll animate-fade-in">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6 hidden lg:block">
                        <h1 className="text-2xl font-bold text-slate-800">Resultados de búsqueda</h1>
                        <p className="text-slate-500 text-sm">{filtered.length} programas encontrados</p>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-slate-600">No se encontraron resultados</h3>
                            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                                Ver todo
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filtered.map(oferta => {
                                const inst = instituciones.find(i => i.id_institucion === oferta.inst_id);
                                return (
                                    <div key={oferta.id_oferta} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full group animate-slide-up">
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <div className="flex gap-2 flex-wrap">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                                                    ${oferta.nivel.nombre.includes('POSGRADO') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                                                `}>
                                                    {oferta.nivel.nombre}
                                                </span>
                                                {/* --- NEW BADGE: INSTITUTION TYPE --- */}
                                                {inst?.tipo && (
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border ${
                                                        inst.tipo === 'Pública' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                        {inst.tipo}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* ENHANCED MODALITY BADGE */}
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                                                oferta.modalidad.nombre.includes('LÍNEA') ? 'bg-green-100 text-green-700' :
                                                oferta.modalidad.nombre.includes('MIXTA') ? 'bg-orange-100 text-orange-700' :
                                                'bg-indigo-50 text-indigo-700'
                                            }`}>
                                                {oferta.modalidad.nombre.includes('LÍNEA') ? <Monitor size={10}/> : <Users size={10}/>}
                                                {oferta.modalidad.nombre}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                            {oferta.carrera.nombre}
                                        </h3>
                                        
                                        <div className="flex-1 mt-3 mb-4 space-y-2">
                                            <Link to={`/instituciones/${oferta.inst_id}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 font-medium pb-2 border-b border-slate-50">
                                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200">
                                                    {inst?.logoUrl ? <img src={inst.logoUrl} className="w-full h-full object-cover"/> : <Building2 size={12}/>}
                                                </div>
                                                <span className="truncate">{inst?.nombre}</span>
                                            </Link>
                                            
                                            {/* ENHANCED DETAILS: Campus & Duration */}
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-1.5 rounded-lg">
                                                    <Clock size={12} className="text-slate-400 shrink-0"/> 
                                                    <span className="truncate">{oferta.duracion}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-1.5 rounded-lg">
                                                    <MapPin size={12} className="text-slate-400 shrink-0"/> 
                                                    <span className="truncate">{oferta.escuela.nombre}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 flex gap-2">
                                            <Link 
                                            to={`/instituciones/${oferta.inst_id}`}
                                            className="flex-1 text-center py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                                            >
                                                Ver Universidad
                                            </Link>
                                            <button 
                                                onClick={() => handleOpenPlan(oferta)}
                                                className="flex-1 text-center py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                Ver Plan
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- MODAL DETALLE OFERTA (SPLIT VIEW) --- */}
        {selectedOferta && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-slide-up ring-1 ring-white/20">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-20 shadow-sm">
                        <div>
                            <h2 className="text-xl font-black text-slate-800">{selectedOferta.carrera.nombre}</h2>
                            <p className="text-sm text-slate-500">{selectedOferta.institucion.nombre} • {selectedOferta.nivel.nombre}</p>
                        </div>
                        <button onClick={() => setSelectedOferta(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={24}/></button>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        {isLoadingDetails ? (
                            <div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <>
                                {/* Left: Map Zoom (2/3) */}
                                <div className="lg:w-2/3 h-1/2 lg:h-full bg-slate-100 relative overflow-hidden flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200">
                                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 p-1.5 rounded-xl shadow-lg border border-slate-100 backdrop-blur">
                                        <button onClick={() => setZoomLevel(z => Math.min(z + 0.5, 4))} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors"><ZoomIn size={20}/></button>
                                        <button onClick={() => setZoomLevel(1)} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors"><RefreshCw size={18}/></button>
                                        <button onClick={() => setZoomLevel(z => Math.max(z - 0.5, 0.5))} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors"><ZoomOut size={20}/></button>
                                    </div>
                                    <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing bg-slate-50/50">
                                        {ofertaDetails?.mapaCurricularUrl ? (
                                            <img 
                                                src={ofertaDetails.mapaCurricularUrl} 
                                                alt="Mapa Curricular" 
                                                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                                                className="max-w-none shadow-2xl rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Image size={64} className="mx-auto mb-4 opacity-30"/>
                                                <p>Plan de estudios no disponible</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white/90 backdrop-blur border-t border-slate-200 py-2 text-center text-xs text-slate-500 font-medium">
                                        Arrastra y usa zoom para explorar el plan de estudios
                                    </div>
                                </div>

                                {/* Right: Info (1/3) */}
                                <div className="lg:w-1/3 h-1/2 lg:h-full overflow-y-auto bg-white custom-scroll">
                                    <div className="p-8 space-y-10">
                                        <div className="pb-6 border-b border-slate-100">
                                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2"><GraduationCap size={16}/> Perfil de Ingreso</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{ofertaDetails?.perfilIngreso || 'Información no disponible.'}</p>
                                        </div>
                                        <div className="pb-6 border-b border-slate-100">
                                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={16}/> Campo Laboral</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{ofertaDetails?.campoLaboral || 'Información no disponible.'}</p>
                                        </div>
                                        <div className="pb-6 border-b border-slate-100">
                                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={16}/> Perfil de Egreso</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{ofertaDetails?.perfilEgreso || 'Información no disponible.'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={16}/> Habilidades</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {ofertaDetails?.habilidades ? ofertaDetails.habilidades.split(',').map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-sm">{s.trim()}</span>
                                                )) : <span className="text-sm text-slate-400">No especificadas</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default OfertaEducativa;
