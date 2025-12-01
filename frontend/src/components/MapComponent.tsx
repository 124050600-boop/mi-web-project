
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Escuela, Oferta, Review } from '../types';
import { Star, BookOpen, Navigation, X, ArrowRight, MessageCircle, Users, Monitor, MapPin } from 'lucide-react';
import { getReviewsByInstitucion } from '../api';

// Fix for default Leaflet marker icons in React
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  escuelas: Escuela[];
  ofertas: Oferta[];
  selectedEscuela?: Escuela | null;
  center?: [number, number] | number[];
  zoom?: number;
  simpleMode?: boolean; // New Prop
}

// Controller to handle center updates, flyTo, and fitBounds
const MapController = ({ target, schools }: { target?: Escuela | null, schools: Escuela[] }) => {
  const map = useMap();
  
  useEffect(() => {
    // 1. Priority: Fly to specific target if selected (Single Selection Zoom)
    if (target && typeof target.latitud === 'number' && typeof target.longitud === 'number' && !isNaN(target.latitud)) {
      map.flyTo([target.latitud, target.longitud], 15, { 
          duration: 3, // Slow and smooth animation
          easeLinearity: 0.1 
      });
    } 
    // 2. Secondary: Fit bounds to show all filtered schools (Sectional Zoom / Municipality)
    else if (schools.length > 0) {
        const validCoords = schools.filter(s => typeof s.latitud === 'number' && !isNaN(s.latitud));
        if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords.map(s => [s.latitud, s.longitud]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { 
                    padding: [80, 80], 
                    maxZoom: 14, 
                    animate: true, 
                    duration: 2.5, // Slow animation for filtering
                    easeLinearity: 0.5
                });
            }
        }
    }
  }, [target, schools, map]);

  return null;
};

const MapClickHandler = ({ onClick }: { onClick: () => void }) => {
    useMapEvents({
        click: () => {
            onClick();
        },
    });
    return null;
};

const createCustomIcon = (escuela: Escuela) => {
    const isPublic = escuela.tipo === 'Pública';
    const borderColor = isPublic ? '#2563eb' : '#dc2626'; 
    const logoContent = escuela.logoUrl 
        ? `<img src="${escuela.logoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`
        : `<div style="width:100%; height:100%; border-radius:50%; background:${escuela.color || '#475569'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px;">${escuela.siglas || 'U'}</div>`;

    const html = `
      <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4); background: white; position: relative; transform-origin: center bottom;">
        <div style="position: absolute; inset: 2px; border-radius: 50%; overflow: hidden; background: #f1f5f9;">${logoContent}</div>
        <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid white;"></div>
        <div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: ${borderColor}; border: 2px solid white; border-radius: 50%;"></div>
      </div>
    `;
    
    return L.divIcon({ className: 'custom-avatar-marker', html: html, iconSize: [44, 44], iconAnchor: [22, 50] });
};

const MapComponent: React.FC<Props> = ({ escuelas, ofertas, selectedEscuela, center, zoom, simpleMode }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeEscuela, setActiveEscuela] = useState<Escuela | null>(null);
  
  const [activeReviews, setActiveReviews] = useState<Review[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      if (selectedEscuela) setActiveEscuela(selectedEscuela);
  }, [selectedEscuela]);

  useEffect(() => {
      if (activeEscuela && activeEscuela.id_institucion && !simpleMode) {
          getReviewsByInstitucion(activeEscuela.id_institucion).then(res => {
              setActiveReviews(res);
              setReviewIdx(0);
          });
      } else {
          setActiveReviews([]);
      }
  }, [activeEscuela, simpleMode]);

  useEffect(() => {
      if(activeReviews.length > 1 && activeEscuela) {
          const interval = setInterval(() => {
              setReviewIdx(prev => (prev + 1) % activeReviews.length);
          }, 4000); 
          return () => clearInterval(interval);
      }
  }, [activeReviews, activeEscuela]);

  const handleMarkerClick = (escuela: Escuela) => {
      if (simpleMode) return; 
      if (isMobile) {
          navigate(`/instituciones/${escuela.id_institucion}`);
      } else {
          setActiveEscuela(escuela);
      }
  };

  const validEscuelas = escuelas.filter(e => typeof e.latitud === 'number' && typeof e.longitud === 'number' && e.latitud !== 0 && e.longitud !== 0 && !isNaN(e.latitud));

  // Loose equality for robust matching
  const campusOffers = activeEscuela 
    ? ofertas.filter(o => o.escuela?.id_escuela == activeEscuela.id_escuela) 
    : [];
    
  const modalities = activeEscuela 
    ? [...new Set(campusOffers.map(o => o.modalidad.nombre))] 
    : [];

  return (
    <div className="relative w-full h-full">
        <MapContainer 
            center={(center as L.LatLngExpression) || [20.5888, -100.3899]} 
            zoom={zoom || 11} 
            className="w-full h-full z-0 bg-slate-100" 
            zoomControl={false}
        >
            <MapClickHandler onClick={() => setActiveEscuela(null)} />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            
            <MapController target={activeEscuela || selectedEscuela} schools={validEscuelas} />
            
            {validEscuelas.map((esc) => (
                <Marker 
                    key={esc.id_escuela} 
                    position={[esc.latitud, esc.longitud]} 
                    icon={createCustomIcon(esc)}
                    eventHandlers={{ 
                        click: (e) => { 
                            if (simpleMode) return; 
                            L.DomEvent.stopPropagation(e.originalEvent); 
                            handleMarkerClick(esc); 
                        } 
                    }}
                >
                    {simpleMode && (
                        <Popup closeButton={false} offset={[0, -40]}>
                            <div className="text-center p-2 min-w-[200px]">
                                <h3 className="font-bold text-slate-800 text-sm mb-0.5 leading-tight">{esc.nombre}</h3>
                                {esc.municipio_nombre && <p className="text-xs text-slate-400 mb-3 font-medium">{esc.municipio_nombre}</p>}
                                
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${esc.latitud},${esc.longitud}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full py-2.5 bg-indigo-100 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95 gap-2"
                                >
                                    <Navigation size={14} /> 
                                    Cómo llegar
                                </a>
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>

        {/* Floating Info Card (Desktop) - Only show if NOT simple mode */}
        {activeEscuela && !isMobile && !simpleMode && (
            <div className="absolute top-6 right-6 z-[400] w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-fade-in transition-all ring-1 ring-black/5">
                <button onClick={() => setActiveEscuela(null)} className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full text-slate-500 z-20 shadow-sm"><X size={16} /></button>

                <div className="h-28 bg-slate-100 relative">
                    {activeEscuela.bannerUrl ? (
                        <img src={activeEscuela.bannerUrl} className="w-full h-full object-cover" alt="Cover" />
                    ) : <div className={`w-full h-full ${activeEscuela.color || 'bg-slate-600'}`}></div>}
                    <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl border-[3px] border-white shadow-lg bg-white overflow-hidden flex items-center justify-center z-10">
                        {activeEscuela.logoUrl ? <img src={activeEscuela.logoUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-slate-700">{activeEscuela.siglas}</span>}
                    </div>
                </div>

                <div className="pt-10 px-6 pb-6">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-0.5">{activeEscuela.inst_nombre}</h3>
                    <p className="text-sm text-slate-500 mb-3">{activeEscuela.nombre}</p> 
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeEscuela.tipo === 'Pública' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{activeEscuela.tipo}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-500"><Star size={12} fill="currentColor" /> {Number(activeEscuela.promedio_calificacion).toFixed(1)}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            <BookOpen size={12}/> <strong>{campusOffers.length}</strong> Carreras
                        </div>
                        {modalities.map(m => (
                            <div key={m} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                {m.includes('Línea') ? <Monitor size={12}/> : <Users size={12}/>} {m}
                            </div>
                        ))}
                    </div>

                    {activeReviews.length > 0 ? (
                        <div className="mb-5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 relative">
                            <MessageCircle size={14} className="absolute top-3 left-3 text-indigo-300"/>
                            <div className="ml-5">
                                <p className="text-xs text-slate-600 italic line-clamp-2 min-h-[2.5em] transition-opacity duration-500 key={reviewIdx}">
                                    "{activeReviews[reviewIdx].comentario}"
                                </p>
                                <p className="text-[10px] text-indigo-500 font-bold mt-1 text-right">— {activeReviews[reviewIdx].nombre_usuario}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-5 p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic border border-slate-100">
                            Sin reseñas recientes
                        </div>
                    )}

                    <div className="space-y-2">
                        <Link to={`/instituciones/${activeEscuela.id_institucion}`} className="flex items-center justify-center w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg gap-2">
                            Ver Perfil <ArrowRight size={16} />
                        </Link>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeEscuela.latitud},${activeEscuela.longitud}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors gap-2">
                            <Navigation size={16} /> Cómo llegar
                        </a>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MapComponent;