import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Institucion, Oferta } from '../types';
import { Link } from 'react-router-dom';
import L from 'leaflet';

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

interface MapProps {
  instituciones: Institucion[];
  ofertas: Oferta[];
  center?: [number, number];
  zoom?: number;
}

// Helper to check if coordinates are valid
const isValidCoord = (lat: any, lng: any) => {
    return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
};

// Controller to handle center updates and resizing
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();

    useEffect(() => {
        if (!isValidCoord(center[0], center[1])) return;

        // 1. Force a resize calculation. This fixes "gray map" issues
        map.invalidateSize();
        
        // 2. Also try again after a short delay to ensure DOM is ready
        const timer = setTimeout(() => {
             map.invalidateSize();
             map.flyTo(center, zoom, {
                 animate: true,
                 duration: 1.5
             });
        }, 300);

        return () => clearTimeout(timer);
    }, [center, zoom, map]);

    return null;
};

const MapComponent: React.FC<MapProps> = ({ instituciones, ofertas, center, zoom = 9 }) => {
  
  // Default center fallback if prop is undefined OR contains invalid numbers
  const safeCenter: [number, number] = (center && isValidCoord(center[0], center[1])) 
    ? center 
    : [20.5888, -100.3899]; // Default to Querétaro center

  const getOfertasCount = (instId: number) => {
    return ofertas.filter(o => o.institucion.id_institucion === instId).length;
  };

  // Filter out institutions with invalid coordinates to prevent crashes
  const validInstituciones = instituciones.filter(inst => isValidCoord(inst.latitud, inst.longitud));

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden relative isolate z-0 bg-slate-100 border border-slate-200">
      {/* Key ensures map recreates if center changes dramatically, sometimes helpful */}
      <MapContainer 
          center={safeCenter} 
          zoom={zoom} 
          scrollWheelZoom={true} 
          className="h-full w-full min-h-[300px]" // Ensure min-height
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={safeCenter} zoom={zoom} />

        {validInstituciones.map((inst) => (
          <Marker 
            key={inst.id_institucion} 
            position={[inst.latitud, inst.longitud]}
          >
            <Popup>
              <div className="p-1 text-slate-800">
                <h3 className="font-bold text-sm mb-1">{inst.nombre}</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {getOfertasCount(inst.id_institucion)} carreras
                    </span>
                </div>
                <Link 
                  to={`/instituciones/${inst.id_institucion}`}
                  className="block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 px-3 rounded transition-colors"
                >
                  Ver detalles
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;