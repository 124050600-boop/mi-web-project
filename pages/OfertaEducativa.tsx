import React, { useState, useEffect } from 'react';
import { getFilters, getOfertas } from '../services/dataService';
import { Oferta, Municipio, CampoFormacion, Nivel, Modalidad } from '../types';
import { Search, Filter, BookOpen, MapPin, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const OfertaEducativa: React.FC = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [filteredOfertas, setFilteredOfertas] = useState<Oferta[]>([]);
  
  // Catalogs
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [campos, setCampos] = useState<CampoFormacion[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [filterNivel, setFilterNivel] = useState<string[]>([]);
  const [filterCampo, setFilterCampo] = useState<string[]>([]);
  const [filterModalidad, setFilterModalidad] = useState<string[]>([]);
  const [filterMunicipio, setFilterMunicipio] = useState<string>('');

  // Mobile Filter Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const data = await getFilters();
      setMunicipios(data.municipios);
      setCampos(data.campos);
      setNiveles(data.niveles);
      setModalidades(data.modalidades);
      
      const allOfertas = await getOfertas();
      setOfertas(allOfertas);
      setFilteredOfertas(allOfertas);
    };
    init();
  }, []);

  // Filter Logic
  useEffect(() => {
    let res = ofertas;

    // Text Search
    if (search) {
      const lower = search.toLowerCase();
      res = res.filter(o => o.carrera.nombre.toLowerCase().includes(lower) || o.institucion.nombre.toLowerCase().includes(lower));
    }

    // Checkboxes (Nivel)
    if (filterNivel.length > 0) {
      res = res.filter(o => filterNivel.includes(o.nivel.id_nivel.toString()));
    }

    // Checkboxes (Campo)
    if (filterCampo.length > 0) {
        res = res.filter(o => filterCampo.includes(o.campo.id_campo.toString()));
    }

    // Checkboxes (Modalidad)
    if (filterModalidad.length > 0) {
        res = res.filter(o => filterModalidad.includes(o.modalidad.id_modalidad.toString()));
    }

    // Select (Municipio)
    if (filterMunicipio) {
        res = res.filter(o => o.municipio.id_municipio.toString() === filterMunicipio);
    }

    setFilteredOfertas(res);
  }, [search, filterNivel, filterCampo, filterModalidad, filterMunicipio, ofertas]);

  // Helper for toggle checkboxes
  const toggleFilter = (id: string, state: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      if (state.includes(id)) {
          setter(state.filter(x => x !== id));
      } else {
          setter([...state, id]);
      }
  };

  const clearFilters = () => {
      setFilterNivel([]);
      setFilterCampo([]);
      setFilterModalidad([]);
      setFilterMunicipio('');
      setSearch('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-6rem)] bg-slate-50">
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar carrera..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 bg-indigo-600 text-white rounded-lg"
          >
              <Filter size={20} />
          </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-r border-slate-200 lg:w-80
        ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <div className="p-6">
              <div className="flex justify-between items-center mb-6 lg:hidden">
                  <span className="font-bold text-lg">Filtros</span>
                  <button onClick={() => setIsDrawerOpen(false)}><X /></button>
              </div>

              <div className="space-y-8">
                  {/* Search Desktop */}
                  <div className="hidden lg:block relative">
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
                      <h3 className="font-bold text-slate-800 mb-3 text-sm">Nivel Educativo</h3>
                      <div className="space-y-2">
                          {niveles.map(n => (
                              <label key={n.id_nivel} className="flex items-center gap-3 cursor-pointer group">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filterNivel.includes(n.id_nivel.toString()) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                      {filterNivel.includes(n.id_nivel.toString()) && <X size={12} className="text-white rotate-45" strokeWidth={4} />}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={filterNivel.includes(n.id_nivel.toString())}
                                    onChange={() => toggleFilter(n.id_nivel.toString(), filterNivel, setFilterNivel)}
                                  />
                                  <span className="text-sm text-slate-600 group-hover:text-slate-900">{n.nombre}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                  {/* Modalidad */}
                  <div>
                      <h3 className="font-bold text-slate-800 mb-3 text-sm">Modalidad</h3>
                      <div className="space-y-2">
                          {modalidades.map(m => (
                              <label key={m.id_modalidad} className="flex items-center gap-3 cursor-pointer group">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filterModalidad.includes(m.id_modalidad.toString()) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                      {filterModalidad.includes(m.id_modalidad.toString()) && <X size={12} className="text-white rotate-45" strokeWidth={4} />}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden"
                                    onChange={() => toggleFilter(m.id_modalidad.toString(), filterModalidad, setFilterModalidad)}
                                  />
                                  <span className="text-sm text-slate-600 group-hover:text-slate-900 capitalize">{m.nombre.toLowerCase()}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                  {/* Campos */}
                  <div>
                      <h3 className="font-bold text-slate-800 mb-3 text-sm">Área de Estudio</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {campos.map(c => (
                              <label key={c.id_campo} className="flex items-start gap-3 cursor-pointer group">
                                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${filterCampo.includes(c.id_campo.toString()) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                      {filterCampo.includes(c.id_campo.toString()) && <X size={12} className="text-white rotate-45" strokeWidth={4} />}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden"
                                    onChange={() => toggleFilter(c.id_campo.toString(), filterCampo, setFilterCampo)}
                                  />
                                  <span className="text-sm text-slate-600 group-hover:text-slate-900 leading-tight">{c.nombre}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                   {/* Municipio */}
                   <div>
                      <h3 className="font-bold text-slate-800 mb-3 text-sm">Ubicación</h3>
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

                  <button onClick={clearFilters} className="w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                      Limpiar Filtros
                  </button>
              </div>
          </div>
      </aside>

      {/* Main Content: Catalog Grid */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Oferta Educativa</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Mostrando {filteredOfertas.length} programas académicos
                    </p>
                </div>
            </div>

            {filteredOfertas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-600">No se encontraron resultados</h3>
                    <p className="text-slate-400 text-sm">Intenta ajustar tus filtros de búsqueda.</p>
                    <button onClick={clearFilters} className="mt-4 text-indigo-600 font-bold hover:underline">Ver todo</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOfertas.map(oferta => (
                        <div key={oferta.id_oferta} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                                    ${oferta.nivel.nombre.includes('POSGRADO') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                                `}>
                                    {oferta.nivel.nombre}
                                </span>
                                {oferta.modalidad.nombre.includes('LÍNEA') && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-100 text-green-700 flex items-center gap-1">
                                        ● Virtual
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-indigo-600 transition-colors">
                                {oferta.carrera.nombre}
                            </h3>

                            <div className="space-y-2 mb-4 flex-1">
                                <Link to={`/instituciones/${oferta.institucion.id_institucion}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 font-medium">
                                    <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        U
                                    </div>
                                    <span className="truncate">{oferta.institucion.nombre}</span>
                                </Link>
                                
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock size={14} />
                                    <span>{oferta.escuela.duracion}</span>
                                </div>

                                {!oferta.modalidad.nombre.includes('LÍNEA') && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <MapPin size={14} />
                                        <span className="truncate">{oferta.municipio.nombre}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex gap-2">
                                <Link 
                                  to={`/instituciones/${oferta.institucion.id_institucion}`}
                                  className="flex-1 text-center py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                                >
                                    Ver Universidad
                                </Link>
                                <button className="flex-1 text-center py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors">
                                    Ver Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default OfertaEducativa;