// Matching your SQL Table Structure

export interface Nivel {
  id_nivel: number;
  nombre: string;
}

export interface Municipio {
  id_municipio: number;
  nombre: string;
}

export interface CampoFormacion {
  id_campo: number;
  nombre: string;
}

export interface Modalidad {
  id_modalidad: number;
  nombre: string;
}

export interface Institucion {
  id_institucion: number;
  nombre: string;
  latitud: number;
  longitud: number;
  telefono?: string;
  www?: string;
  correo?: string | null;
  // New Social Fields
  descripcion?: string;
  bannerUrl?: string;
  logoUrl?: string;
}

export interface Escuela {
  id_escuela: number;
  id_localidad: number; // Linked to Localidad -> Municipio
  nombre: string;
  duracion: string;
}

export interface Carrera {
  id_carrera: number;
  clave: string;
  nombre: string;
}

// The central join table in your logic
export interface Oferta {
  id_oferta: number;
  institucion: Institucion;
  escuela: Escuela;
  carrera: Carrera;
  nivel: Nivel;
  campo: CampoFormacion;
  modalidad: Modalidad;
  municipio: Municipio; // Denormalized slightly for easier frontend filtering
}

export interface Review {
  id_review: number;
  id_institucion: number;
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

// --- NEW AUTH TYPES ---

export type UserRole = 'student' | 'institution' | 'guest';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}