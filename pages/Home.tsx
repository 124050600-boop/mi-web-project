import React, { useState, useEffect } from 'react';
import { Search, MapPin, GraduationCap, Filter } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { getFilters, getOfertas, getInstituciones } from '../services/dataService';
import { Oferta, Institucion, Municipio, CampoFormacion, Nivel } from '../types';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  
  const [allOfertas, setAllOfertas] = useState<Oferta[]>([]);
  
  // Filters Data
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [campos, setCampos] = useState<CampoFormacion[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);

  // Filter State
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');
  const [selectedCampo, setSelectedCampo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const filterData = await getFilters();
      setMunicipios(filterData.municipios);
      setCampos(filterData.campos);
      setNiveles(filterData.niveles);

      const data = await getOfertas();
      setAllOfertas(data);
      setOfertas(data);

      const insts = await getInstituciones();
      setInstituciones(insts);
    };
    loadData();
  }, []);

  // Filter Logic
  useEffect(() => {
    let filtered = allOfertas;

    if (selectedMunicipio) {
      filtered = filtered.filter(o => o.municipio.id_municipio.toString() === selectedMunicipio);
    }
    if (selectedCampo) {
      filtered = filtered.filter(o => o.campo.id_campo.toString() === selectedCampo);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.carrera.nombre.toLowerCase().includes(lower) || 
        o.institucion.nombre.toLowerCase().includes(lower)
      );
    }

    setOfertas(filtered);

    // Update institutions on map based on filtered offers
    const visibleInstIds = new Set(filtered.map(o => o.institucion.id_institucion));
    
    // We need to fetch full institution objects for the filtered IDs.
    // In a real app, this logic would be cleaner or backend driven.
    // Here we just filter the original institution list.
    getInstituciones().then(all => {
       setInstituciones(all.filter(i => visibleInstIds.has(i.id_institucion)));
    });

  }, [selectedMunicipio, selectedCampo, searchTerm, allOfertas]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
      
      {/* Left Panel: Filters & List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        
        {/* Search & Filters Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar carrera o universidad..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-1">
                <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Municipio</label>
                <select 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={selectedMunicipio}
                  onChange={(e) => setSelectedMunicipio(e.target.value)}
                >
                  <option value="">Todos</option>
                  {municipios.map(m => (
                    <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>
                  ))}
                </select>
             </div>
             <div className="col-span-1">
                <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Campo</label>
                <select 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={selectedCampo}
                  onChange={(e) => setSelectedCampo(e.target.value)}
                >
                  <option value="">Todos</option>
                  {campos.map(c => (
                    <option key={c.id_campo} value={c.id_campo}>{c.nombre}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>{ofertas.length} resultados encontrados</span>
            <button 
              onClick={() => {setSelectedCampo(''); setSelectedMunicipio(''); setSearchTerm('')}}
              className="text-indigo-600 hover:underline"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {ofertas.map((oferta) => (
            <div key={oferta.id_oferta} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">
                  {oferta.nivel.nombre}
                </span>
                <span className="text-xs text-slate-400">{oferta.modalidad.nombre}</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">
                {oferta.carrera.nombre}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <MapPin size={12} />
                <span>{oferta.institucion.nombre}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Link 
                  to={`/instituciones/${oferta.institucion.id_institucion}`}
                  className="flex-1 text-center py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Ver Universidad
                </Link>
                {/* Placeholder for future specific career details page */}
                <button className="flex-1 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                   Más info
                </button>
              </div>
            </div>
          ))}
          {ofertas.length === 0 && (
             <div className="text-center py-10 text-slate-400">
               <GraduationCap size={40} className="mx-auto mb-2 opacity-50" />
               <p>No hay resultados para esta búsqueda.</p>
             </div>
          )}
        </div>

      </div>

      {/* Right Panel: Map */}
      <div className="w-full lg:w-2/3 h-64 lg:h-full">
         <MapComponent 
            instituciones={instituciones} 
            ofertas={allOfertas} 
            // Center map on the first result if available, else default
            center={instituciones.length > 0 ? [instituciones[0].latitud, instituciones[0].longitud] as [number, number] : undefined}
         />
      </div>

    </div>
  );
};

export default Home;