
export interface Nivel { id_nivel?: number; nombre: string; }
export interface Municipio { id_municipio?: number; nombre: string; }
export interface CampoFormacion { id_campo?: number; nombre: string; }
export interface Modalidad { id_modalidad?: number; nombre: string; }

// Map-Ready School/Campus Type
export interface Escuela { 
    id_escuela: number; 
    id_institucion?: number;
    nombre: string; 
    latitud: number;
    longitud: number;
    // Joined Info from Institution for Map Display
    inst_nombre?: string;
    siglas?: string;
    logoUrl?: string;
    color?: string;
    tipo?: string;
    bannerUrl?: string;
    promedio_calificacion?: number;
    municipio_nombre?: string; // NEW FIELD
}

export interface Carrera { 
    id_carrera?: number; 
    nombre: string; 
    clave: string; 
    id_carrera_sql?: number; 
    id_info?: number;
}

export type UserRole = 'student' | 'institution' | 'guest';

export interface User {
  id: number;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  telefono?: string;
  apellido?: string;
}

export interface Review {
  id_review: number;
  id_institucion: number;
  id_carrera?: number;
  nombre_usuario: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

export interface Convocatoria {
  id_convocatoria: number;
  id_institucion: number;
  titulo: string;
  contenido: string;
  fecha: string;
  imagenUrl?: string;
}

export interface Institucion {
  id_institucion: number;
  nombre: string;
  siglas?: string;
  latitud: number;
  longitud: number;
  tipo: string;
  logo_url?: string;
  banner_url?: string;
  color_hex?: string;
  descripcion?: string;
  telefono?: string;
  sitio_web?: string;
  correo?: string | null;
  // Fallbacks for UI mapping
  logo?: string; 
  color?: string;
  www?: string;
  banner?: string; 
  bannerUrl?: string;
  logoUrl?: string;
  promedio_calificacion?: number;
  total_reviews?: number;
}

export interface Oferta {
  id_oferta: number;
  inst_id: number;
  institucion: Partial<Institucion>;
  carrera: Carrera;
  nivel: Nivel;
  modalidad: Modalidad;
  escuela: Escuela;
  municipio: Municipio;
  campo: CampoFormacion;
  duracion: string;
}

export interface DetalleOferta {
    id_detalle: number;
    id_oferta: number;
    mapaCurricularUrl?: string;
    perfilIngreso?: string;
    perfilEgreso?: string;
    campoLaboral?: string;
    habilidades?: string;
}

export interface InfoCarrera {
    id_info: number;
    titulo_marketing: string;
    descripcion_breve: string;
    imagen_url: string;
    palabra_clave: string;
    // Mapped for frontend
    tituloMarketing?: string;
    descripcionBreve?: string;
    imagenUrl?: string;
    palabraClave?: string;
}

export interface GaleriaImagen {
    id_imagen: number;
    id_institucion: number;
    imagenUrl: string;
    descripcion: string;
}