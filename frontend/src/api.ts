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
  Modalidad,
  Carrera,
  Escuela,
  DetalleOferta,
  InfoCarrera,
  GaleriaImagen
} from './types';

const hostname = window.location.hostname;
const API_URL = `http://${hostname}:3000/api`; 

// Mock Data for fallback with VALID coordinates for map
export const MOCK_INSTITUCIONES: Institucion[] = [
  { 
    id_institucion: 1, 
    nombre: 'Universidad Autónoma de Querétaro', siglas: 'UAQ',
    latitud: 20.5922, longitud: -100.4124, 
    tipo: 'Pública', color_hex: 'bg-blue-600',
    descripcion: 'Máxima casa de estudios de Querétaro.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Logo_UAQ.svg/1200px-Logo_UAQ.svg.png'
  },
  { 
    id_institucion: 2, 
    nombre: 'Tecnológico de Monterrey', siglas: 'ITESM',
    latitud: 20.6136, longitud: -100.4047, 
    tipo: 'Privada', color_hex: 'bg-red-600',
    descripcion: 'Innovación y emprendimiento.',
    logo_url: 'https://brandcenter.tec.mx/sites/default/files/Logotipo_Borregos_0.png'
  }
];

async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    try {
        const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`[API] Error en ${endpoint}`, error);
        if (endpoint.includes('instituciones') && method === 'GET') return MOCK_INSTITUCIONES as unknown as T;
        if (method === 'GET') {
            return [] as unknown as T;
        }
        throw error;
    }
}

const fixInstData = (i: Institucion): Institucion => ({
    ...i,
    id_institucion: Number(i.id_institucion),
    logo: i.siglas || 'U',
    color: i.color_hex || 'bg-slate-600',
    www: i.sitio_web,
    bannerUrl: i.banner_url || undefined,
    logoUrl: i.logo_url || undefined,
    latitud: parseFloat(i.latitud as any) || 0,
    longitud: parseFloat(i.longitud as any) || 0,
});

// --- INSTITUCIONES ---
export const getInstituciones = () => apiCall<Institucion[]>('/instituciones').then(list => Array.isArray(list) ? list.map(fixInstData) : []);
export const getInstitucionById = async (id: number) => {
    const res = await apiCall<Institucion>(`/instituciones/${id}`);
    return res ? fixInstData(res) : undefined;
};
export const updateInstitucion = async (id: number, data: Partial<Institucion>) => {
    const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        telefono: data.telefono,
        www: data.www,
        bannerUrl: data.bannerUrl,
        logoUrl: data.logoUrl
    };
    const res = await apiCall<Institucion>(`/instituciones/${id}`, 'PUT', payload);
    return fixInstData(res);
};

// --- OFERTAS ---
export const getOfertas = () => apiCall<any[]>('/ofertas').then(list => 
    list.map(o => ({
        ...o,
        id_oferta: Number(o.id_oferta),
        inst_id: Number(o.inst_id),
        escuela: { 
            ...o.escuela, 
            id_escuela: Number(o.escuela?.id_escuela),
            latitud: parseFloat(o.escuela?.latitud || 0),
            longitud: parseFloat(o.escuela?.longitud || 0)
        },
        institucion: {
            ...o.institucion,
            id_institucion: Number(o.institucion?.id_institucion)
        }
    }))
);

export const getOfertasByInstitucion = (id: number) => apiCall<Oferta[]>(`/ofertas?institucion=${id}`);
export const addOferta = (data: any) => apiCall('/ofertas', 'POST', data);
export const deleteOferta = (id: number) => apiCall(`/ofertas/${id}`, 'DELETE');

// --- DETALLES OFERTA ---
export const getOfertaDetails = async (id: number): Promise<DetalleOferta | null> => {
    const data = await apiCall<any>(`/ofertas/${id}/detalles`);
    if (!data) return null;
    return {
        id_detalle: data.id_detalle,
        id_oferta: data.id_oferta,
        mapaCurricularUrl: data.mapa_curricular_url,
        perfilIngreso: data.perfil_ingreso,
        perfilEgreso: data.perfil_egreso,
        campoLaboral: data.campo_laboral,
        habilidades: data.habilidades
    };
};

export const updateOfertaDetails = (id: number, data: Partial<DetalleOferta>) => {
    const payload = {
        mapaCurricularUrl: data.mapaCurricularUrl,
        perfilIngreso: data.perfilIngreso,
        perfilEgreso: data.perfilEgreso,
        campoLaboral: data.campoLaboral,
        habilidades: data.habilidades
    };
    return apiCall(`/ofertas/${id}/detalles`, 'PUT', payload);
};

// --- INFO CARRERAS ---
export const getInfoCarreras = () => apiCall<any[]>('/info-carreras').then(list => 
    list.map(i => ({
        ...i,
        imagenUrl: i.imagen_url,
        tituloMarketing: i.titulo_marketing,
        descripcionBreve: i.descripcion_breve,
        palabraClave: i.palabra_clave
    }))
);

// --- REVIEWS & CONVOCATORIAS ---
export const getReviewsByInstitucion = (id: number) => apiCall<Review[]>(`/reviews?institucion=${id}`);
export const postReview = (review: Partial<Review>) => apiCall<Review>('/reviews', 'POST', review);

export const getConvocatoriasByInstitucion = (id: number) => 
    apiCall<any[]>(`/convocatorias?institucion=${id}`).then(items => 
        items.map(i => ({ ...i, imagenUrl: i.imagenUrl || i.imagen_url }))
    );

export const postConvocatoria = (data: Partial<Convocatoria>) => apiCall<Convocatoria>('/convocatorias', 'POST', data);
export const sendInterest = (userId: number, instId: number) => apiCall('/intereses', 'POST', { userId, instId });

// --- GALERIA ---
export const getGalleryByInstitucion = (id: number) => 
    apiCall<any[]>(`/galeria?institucion=${id}`).then(items => 
        items.map(i => ({ ...i, imagenUrl: i.imagen_url, descripcion: i.descripcion }))
    );

export const addGalleryImage = (data: { id_institucion: number, imagenUrl: string, descripcion: string }) => 
    apiCall('/galeria', 'POST', data);

export const deleteGalleryImage = (id: number) => 
    apiCall(`/galeria/${id}`, 'DELETE');

// --- AUTH ---
export const loginUser = (role: UserRole, identifier: string, password?: string) => 
    apiCall<User>('/login', 'POST', { role, identifier, password });

export const registerUser = (data: any) => apiCall<User>('/register', 'POST', data);
export const updateStudent = (id: number, data: any) => apiCall<User>(`/students/${id}`, 'PUT', data);

// --- UTILS & CATALOGS ---
export const importSQL = (sql: string) => apiCall<{message: string}>('/import', 'POST', { sql });
export const clearDatabase = () => apiCall('/admin/clear', 'POST'); 

export const getFilters = async () => ({
    municipios: await apiCall<Municipio[]>('/municipios').catch(()=>[]),
    niveles: await apiCall<Nivel[]>('/niveles').catch(()=>[]),
    campos: await apiCall<CampoFormacion[]>('/campos').catch(()=>[]),
    modalidades: await apiCall<Modalidad[]>('/modalidades').catch(()=>[])
});

export const getCarreras = () => apiCall<Carrera[]>('/carreras');
export const createCarrera = (data: any) => apiCall<Carrera>('/carreras', 'POST', data);

// MAP-READY SCHOOLS
export const getEscuelasByInstitucion = (id: number) => apiCall<any[]>(`/escuelas?institucion=${id}`).then(list => list.map(e => ({
    ...e,
    id_escuela: Number(e.id_escuela),
    latitud: parseFloat(e.latitud) || 0,
    longitud: parseFloat(e.longitud) || 0,
})));

export const getEscuelasMap = () => apiCall<any[]>('/escuelas').then(list => list.map(e => ({
    ...e,
    id_escuela: Number(e.id_escuela),
    id_institucion: Number(e.id_institucion),
    latitud: parseFloat(e.latitud) || 0,
    longitud: parseFloat(e.longitud) || 0,
    logoUrl: e.logo_url,
    color: e.color_hex,
    bannerUrl: e.banner_url,
    municipio_nombre: e.municipio_nombre
})));

export const addEscuela = (data: any) => apiCall('/escuelas', 'POST', data);
