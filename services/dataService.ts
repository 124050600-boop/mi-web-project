import { 
  Oferta, 
  Institucion, 
  Review,
  User,
  UserRole,
  Convocatoria,
  Municipio,
  Nivel,
  CampoFormacion,
  Modalidad
} from '../types';

// ============================================================================
// CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS REAL
// ============================================================================
// Para que esto funcione, debes correr el servidor Node.js (backend) en tu máquina.
// El backend se encargará de hacer las consultas SQL reales (SELECT, INSERT, UPDATE).

const API_URL = 'http://localhost:3000/api'; 

// ============================================================================

// --- FALLBACK DATA (Solo se usa si el servidor no responde para que la demo no se rompa) ---
// Esto es temporal mientras levantas tu servidor SQL
const MOCK_INSTITUCIONES_FALLBACK: Institucion[] = [
  {
    id_institucion: 1,
    nombre: 'UNIVERSIDAD TECNOLOGICA DE SAN JUAN DEL RIO',
    latitud: 20.3753, 
    longitud: -99.9839, 
    telefono: '4272724118',
    www: 'WWW.ITSANJUAN.EDU.MX',
    correo: 'contacto@itsanjuan.edu.mx',
    descripcion: 'Ejemplo (Servidor desconectado)',
    bannerUrl: '',
    logoUrl: ''
  }
];

// --- HELPER FUNCTION FOR API CALLS ---
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.warn(`Fallo al conectar con ${endpoint}. Asegúrate de que tu servidor SQL (backend) esté corriendo en ${API_URL}.`, error);
        
        // Return null or empty arrays gracefully if server is down so UI doesn't crash completely
        if (endpoint.includes('instituciones') && method === 'GET') return MOCK_INSTITUCIONES_FALLBACK as unknown as T;
        if (method === 'GET') return [] as unknown as T;
        throw error;
    }
}

// ============================================================================
// DATA FETCHING METHODS
// ============================================================================

export const getFilters = async () => {
    try {
        // En un escenario real, haríamos endpoints específicos para catálogos
        // Por ahora simulamos obteniendo todo o endpoints dedicados
        const municipios = await apiCall<Municipio[]>('/municipios');
        const niveles = await apiCall<Nivel[]>('/niveles');
        const campos = await apiCall<CampoFormacion[]>('/campos');
        const modalidades = await apiCall<Modalidad[]>('/modalidades');
        
        // Fallback si la API devuelve arrays vacíos por error de conexión
        if (!Array.isArray(municipios) || municipios.length === 0) {
            return {
                municipios: [{id_municipio: 1, nombre: 'JALPAN (Demo)'} as Municipio],
                niveles: [{id_nivel: 1, nombre: 'SUPERIOR (Demo)'} as Nivel],
                campos: [{id_campo: 1, nombre: 'INGENIERÍA (Demo)'} as CampoFormacion],
                modalidades: [{id_modalidad: 1, nombre: 'PRESENCIAL (Demo)'} as Modalidad],
                sostenimientos: []
            };
        }

        return {
            municipios,
            niveles,
            campos,
            modalidades,
            sostenimientos: [] 
        };
    } catch (e) {
        // Fallback data structure
        return {
            municipios: [{id_municipio: 1, nombre: 'JALPAN (Demo)'} as Municipio],
            niveles: [{id_nivel: 1, nombre: 'SUPERIOR (Demo)'} as Nivel],
            campos: [{id_campo: 1, nombre: 'INGENIERÍA (Demo)'} as CampoFormacion],
            modalidades: [{id_modalidad: 1, nombre: 'PRESENCIAL (Demo)'} as Modalidad],
            sostenimientos: []
        };
    }
};

export const getOfertas = async (): Promise<Oferta[]> => {
  return await apiCall<Oferta[]>('/ofertas');
};

export const getInstituciones = async (): Promise<Institucion[]> => {
  return await apiCall<Institucion[]>('/instituciones');
};

export const getInstitucionById = async (id: number): Promise<Institucion | undefined> => {
  // La API puede retornar un objeto o un array de 1 objeto
  const result = await apiCall<Institucion | Institucion[]>(`/instituciones/${id}`);
  if (Array.isArray(result)) return result[0];
  return result as Institucion;
};

export const updateInstitucion = async (id: number, data: Partial<Institucion>): Promise<Institucion> => {
    // UPDATE SQL
    return await apiCall<Institucion>(`/instituciones/${id}`, 'PUT', data);
};

export const getOfertasByInstitucion = async (id: number): Promise<Oferta[]> => {
  return await apiCall<Oferta[]>(`/ofertas?institucion=${id}`);
};

export const getReviewsByInstitucion = async (id: number): Promise<Review[]> => {
  return await apiCall<Review[]>(`/reviews?institucion=${id}`);
};

export const getConvocatoriasByInstitucion = async (id: number): Promise<Convocatoria[]> => {
    return await apiCall<Convocatoria[]>(`/convocatorias?institucion=${id}`);
};

export const postConvocatoria = async (convocatoria: Omit<Convocatoria, 'id_convocatoria' | 'fecha'>): Promise<Convocatoria> => {
    return await apiCall<Convocatoria>('/convocatorias', 'POST', convocatoria);
};

export const postReview = async (review: Omit<Review, 'id_review' | 'fecha'>): Promise<Review> => {
    return await apiCall<Review>('/reviews', 'POST', review);
};

export const sendInterest = async (userId: number, institutionId: number) => {
    return await apiCall('/intereses', 'POST', { userId, institutionId });
};

// --- AUTH (Conectado a BD) ---
export const mockLogin = async (role: UserRole, email: string, accessCode?: string): Promise<User> => {
    // Endpoint: /api/login
    // El backend verificará el accessCode contra la tabla de instituciones o usuarios
    return await apiCall<User>('/login', 'POST', { role, email, accessCode });
};

// --- ADMIN / DATA MNGT ---
export const importSQL = async (sqlContent: string): Promise<{message: string}> => {
    try {
        return await apiCall<{message: string}>('/admin/import', 'POST', { sql: sqlContent });
    } catch (e) {
        console.warn("Import failed or API not ready", e);
        return { message: "Simulación: SQL Importado (Backend no respondió)" };
    }
};

export const clearDatabase = async (): Promise<void> => {
    try {
        await apiCall('/admin/clear', 'POST');
    } catch (e) {
        console.warn("Clear DB failed or API not ready", e);
    }
};