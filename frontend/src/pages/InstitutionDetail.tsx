
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    getInstitucionById, getOfertasByInstitucion, getReviewsByInstitucion, getConvocatoriasByInstitucion,
    postReview, postConvocatoria, sendInterest, updateInstitucion, getFilters, getCarreras, getEscuelasByInstitucion, addOferta, deleteOferta,
    getOfertaDetails, updateOfertaDetails, createCarrera, addEscuela,
    getGalleryByInstitucion, addGalleryImage, deleteGalleryImage
} from '../api';
import { Institucion, Oferta, Review, Convocatoria, Nivel, Modalidad, Carrera, Escuela, DetalleOferta, CampoFormacion, Municipio, GaleriaImagen } from '../types';
import { MapPin, Globe, Phone, Star, Mail, ArrowLeft, Send, MessageSquarePlus, Edit3, Save, Calendar, X, RefreshCw, Image, Trash2, PlusCircle, Navigation, BookOpen, GraduationCap, Briefcase, Zap, ZoomIn, ZoomOut, Search, Monitor, Users, Clock, ArrowRight } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';

const InstitutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [institucion, setInstitucion] = useState<Institucion | undefined>();
  const [campusMap, setCampusMap] = useState<Escuela[]>([]); 
  const [gallery, setGallery] = useState<GaleriaImagen[]>([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0); // For Slideshow
  
  const [isLoading, setIsLoading] = useState(true); 
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [activeTab, setActiveTab] = useState<'convocatorias' | 'oferta' | 'reviews' | 'gestion' | 'campus'>('oferta');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Institucion>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ titulo: '', contenido: '', imagenUrl: '' });
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // GALLERY MANAGEMENT
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImage, setNewImage] = useState({ imagenUrl: '', descripcion: '' });

  // OFFER MANAGEMENT
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [catalogs, setCatalogs] = useState<{niveles: Nivel[], modalidades: Modalidad[], carreras: Carrera[], escuelas: Escuela[], campos: CampoFormacion[], municipios: Municipio[]}>({
      niveles: [], modalidades: [], carreras: [], escuelas: [], campos: [], municipios: []
  });
  const [newOffer, setNewOffer] = useState({ id_carrera: '', id_nivel: '', id_modalidad: '', id_escuela: '', duracion: '' });
  
  // CREATE NEW CAREER STATE
  const [isCreatingCarrera, setIsCreatingCarrera] = useState(false);
  const [newCarreraData, setNewCarreraData] = useState({ nombre: '', clave: '', id_campo: '' });

  // CAMPUS MANAGEMENT
  const [selectedCampus, setSelectedCampus] = useState<Escuela | null>(null);
  const [isAddingCampus, setIsAddingCampus] = useState(false);
  const [newCampus, setNewCampus] = useState({ nombre: '', id_municipio: '', latitud: '', longitud: '' });

  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  
  // FILTER STATES
  const [offerSearch, setOfferSearch] = useState('');
  const [offerNivel, setOfferNivel] = useState('');
  const [offerModalidad, setOfferModalidad] = useState('');
  const [offerCampo, setOfferCampo] = useState('');
  const [offerCampus, setOfferCampus] = useState('');

  const [selectedOferta, setSelectedOferta] = useState<Oferta | null>(null);
  const [ofertaDetails, setOfertaDetails] = useState<DetalleOferta | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState<Partial<DetalleOferta>>({});
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (numId: number) => {
      setIsLoading(true);
      try {
        const data = await getInstitucionById(numId);
        if (data) {
            setInstitucion(data);
            getEscuelasByInstitucion(numId).then(schools => {
                const mappedSchools = schools.map(s => ({
                    ...s,
                    inst_nombre: data.nombre,
                    siglas: data.siglas,
                    logoUrl: data.logoUrl,
                    color: data.color || data.color_hex,
                    tipo: data.tipo,
                    bannerUrl: data.bannerUrl
                }));
                setCampusMap(mappedSchools);
                setTimeout(() => setMapRefreshKey(k => k + 1), 500);
            });

            getOfertasByInstitucion(numId).then(setOfertas);
            getReviewsByInstitucion(numId).then(setReviews);
            getConvocatoriasByInstitucion(numId).then(setConvocatorias);
            getGalleryByInstitucion(numId).then(setGallery);
        }
      } catch (e) { 
          console.error("Error loading institution", e); 
      } finally {
          setIsLoading(false);
      }
  };

  // Gallery Slideshow Effect
  useEffect(() => {
      if (gallery.length > 1) {
          const interval = setInterval(() => {
              setCurrentGalleryIndex(prev => (prev + 1) % gallery.length);
          }, 4000);
          return () => clearInterval(interval);
      }
  }, [gallery.length]);

  const isOwner = user?.role === 'institution' && institucion && user.id === institucion.id_institucion;

  useEffect(() => {
      if (isOwner && id) {
          Promise.all([getFilters(), getCarreras(), getEscuelasByInstitucion(parseInt(id))])
            .then(([filters, carreras, escuelas]) => {
                setCatalogs({ 
                    niveles: filters.niveles, 
                    modalidades: filters.modalidades, 
                    campos: filters.campos,
                    municipios: filters.municipios,
                    carreras, 
                    escuelas 
                });
            });
      }
  }, [isOwner, id]);

  const filteredOffers = useMemo(() => {
      return ofertas.filter(o => {
          const matchSearch = o.carrera.nombre.toLowerCase().includes(offerSearch.toLowerCase());
          const matchNivel = !offerNivel || o.nivel.nombre === offerNivel;
          const matchMod = !offerModalidad || o.modalidad.nombre === offerModalidad;
          const matchCampo = !offerCampo || o.campo.nombre === offerCampo;
          const matchCampus = !offerCampus || (o.escuela && o.escuela.nombre === offerCampus);
          return matchSearch && matchNivel && matchMod && matchCampo && matchCampus;
      });
  }, [ofertas, offerSearch, offerNivel, offerModalidad, offerCampo, offerCampus]);

  const availableNiveles = useMemo(() => [...new Set(ofertas.map(o => o.nivel.nombre))], [ofertas]);
  const availableModalidades = useMemo(() => [...new Set(ofertas.map(o => o.modalidad.nombre))], [ofertas]);
  const availableCampos = useMemo(() => [...new Set(ofertas.map(o => o.campo.nombre))], [ofertas]);
  const availableCampuses = useMemo(() => [...new Set(ofertas.map(o => o.escuela?.nombre).filter(Boolean))], [ofertas]);

  // HANDLERS
  const handleEditProfile = () => { 
      if (!institucion) return;
      setEditForm({
          nombre: institucion.nombre || '',
          descripcion: institucion.descripcion || '',
          telefono: institucion.telefono || '',
          www: institucion.www || '',
          bannerUrl: institucion.bannerUrl || '',
          logoUrl: institucion.logoUrl || '',
      });
      setIsEditingProfile(true); 
  };
  const handleSaveProfile = async () => {
      if (!institucion) return;
      setIsSavingProfile(true);
      try {
        const updated = await updateInstitucion(institucion.id_institucion, editForm);
        setInstitucion(updated);
        setIsEditingProfile(false);
      } catch (e) { alert("Error al guardar cambios."); } finally { setIsSavingProfile(false); }
  };
  const handleSendInterest = async () => {
      if (!user || !institucion) return;
      setIsSendingInterest(true);
      await sendInterest(user.id, institucion.id_institucion);
      setInterestSent(true);
      setIsSendingInterest(false);
  };
  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !institucion) return;
      setIsSubmittingReview(true);
      await postReview({ id_institucion: institucion.id_institucion, nombre_usuario: user.name, calificacion: newRating, comentario: newReview });
      getReviewsByInstitucion(institucion.id_institucion).then(setReviews);
      setNewReview('');
      setIsSubmittingReview(false);
  };
  const handleSubmitPost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!institucion) return;
      setIsSubmittingPost(true);
      try {
        await postConvocatoria({ id_institucion: institucion.id_institucion, titulo: newPost.titulo, contenido: newPost.contenido, imagenUrl: newPost.imagenUrl });
        getConvocatoriasByInstitucion(institucion.id_institucion).then(setConvocatorias);
        setNewPost({ titulo: '', contenido: '', imagenUrl: '' });
        setIsPosting(false);
      } catch (error) { alert("Error al publicar."); } finally { setIsSubmittingPost(false); }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!institucion) return;
      
      let carreraId = newOffer.id_carrera;

      // Handle New Career Creation
      if (isCreatingCarrera) {
          if(!newCarreraData.nombre || !newCarreraData.id_campo) {
              alert("Nombre y Área son requeridos para la nueva carrera");
              return;
          }
          try {
              const created = await createCarrera(newCarreraData);
              carreraId = created.id_carrera?.toString() || '';
              setCatalogs(prev => ({...prev, carreras: [...prev.carreras, created]}));
          } catch(e) {
              alert("Error creando carrera");
              return;
          }
      }

      if (!carreraId) return;

      await addOferta({ 
          id_institucion: institucion.id_institucion, 
          ...newOffer, 
          id_carrera: carreraId 
      });
      
      getOfertasByInstitucion(institucion.id_institucion).then(setOfertas);
      setIsAddingOffer(false);
      setIsCreatingCarrera(false);
      setNewCarreraData({ nombre: '', clave: '', id_campo: '' });
      setNewOffer({ id_carrera: '', id_nivel: '', id_modalidad: '', id_escuela: '', duracion: '' });
  };

  const handleSaveCampus = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!institucion) return;
      try {
          await addEscuela({ 
              id_institucion: institucion.id_institucion, 
              ...newCampus
          });
          
          const schools = await getEscuelasByInstitucion(institucion.id_institucion);
          const mappedSchools = schools.map(s => ({
              ...s,
              inst_nombre: institucion.nombre,
              siglas: institucion.siglas,
              logoUrl: institucion.logoUrl,
              color: institucion.color || institucion.color_hex,
              tipo: institucion.tipo,
              bannerUrl: institucion.bannerUrl
          }));
          setCampusMap(mappedSchools);
          setCatalogs(prev => ({...prev, escuelas: schools})); 
          
          setIsAddingCampus(false);
          setNewCampus({ nombre: '', id_municipio: '', latitud: '', longitud: '' });
          setMapRefreshKey(k => k + 1);
      } catch(e) {
          alert("Error al agregar campus");
      }
  };

  const handleAddGalleryImage = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!institucion) return;
      try {
          await addGalleryImage({ id_institucion: institucion.id_institucion, ...newImage });
          const updated = await getGalleryByInstitucion(institucion.id_institucion);
          setGallery(updated);
          setIsAddingImage(false);
          setNewImage({ imagenUrl: '', descripcion: '' });
      } catch(e) { alert("Error al agregar imagen"); }
  };

  const handleDeleteGalleryImage = async (id: number) => {
      if(!window.confirm("¿Borrar imagen?")) return;
      try {
          await deleteGalleryImage(id);
          setGallery(prev => prev.filter(img => img.id_imagen !== id));
      } catch(e) { alert("Error al borrar"); }
  };

  const handleDeleteOffer = async (id_oferta: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm('¿Borrar carrera?')) {
          await deleteOferta(id_oferta);
          if (institucion) getOfertasByInstitucion(institucion.id_institucion).then(setOfertas);
      }
  };
  const handleOpenOffer = async (oferta: Oferta) => {
      setSelectedOferta(oferta);
      setIsLoadingDetails(true);
      setOfertaDetails(null);
      setIsEditingDetails(false);
      setZoomLevel(1);
      try {
          const details = await getOfertaDetails(oferta.id_oferta);
          setOfertaDetails(details);
      } catch (error) { console.error("Error details", error); } finally { setIsLoadingDetails(false); }
  };
  const handleSaveDetails = async () => {
      if(!selectedOferta) return;
      setIsSavingDetails(true);
      try {
          await updateOfertaDetails(selectedOferta.id_oferta, detailsForm);
          setOfertaDetails({ ...ofertaDetails, ...detailsForm } as DetalleOferta);
          setIsEditingDetails(false);
      } catch(e) { alert("Error al guardar detalles"); } finally { setIsSavingDetails(false); }
  };
  const handleEditDetails = () => {
      setDetailsForm(ofertaDetails || {});
      setIsEditingDetails(true);
  };

  if (isLoading) return <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-2 border-indigo-600 rounded-full border-t-transparent"></div></div>;
  if (!institucion) return <div className="p-10 text-center">Institución no encontrada</div>;

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1) : 'N/A';
  
  const mapCenter: [number, number] = selectedCampus && selectedCampus.latitud 
      ? [selectedCampus.latitud, selectedCampus.longitud]
      : (campusMap.length > 0 && campusMap[0].latitud ? [campusMap[0].latitud, campusMap[0].longitud] : [20.5888, -100.3899]);

  const displayedCampuses = selectedCampus ? [selectedCampus] : campusMap;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto pb-10 p-4">
        <Link to="/instituciones" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
            <ArrowLeft size={16} className="mr-1" /> Volver al directorio
        </Link>

        {/* --- HEADER --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 relative">
            <div className="h-48 md:h-72 w-full bg-slate-200 relative overflow-hidden">
                {institucion.bannerUrl ? (
                    <img src={institucion.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-800 to-indigo-900 flex items-center justify-center">
                        <span className="text-white/10 text-6xl font-bold tracking-widest">MapEDU</span>
                    </div>
                )}
                {isOwner && (
                    <button onClick={handleEditProfile} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                        <Edit3 size={16} /> Editar Perfil
                    </button>
                )}
            </div>

            <div className="px-6 md:px-10 pb-8 relative">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative -mt-16 mb-2 md:mb-0 shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-[6px] border-white shadow-xl bg-white overflow-hidden flex items-center justify-center">
                            {institucion.logoUrl ? (
                                <img src={institucion.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-4xl font-bold text-indigo-600">{institucion.siglas || 'U'}</div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 pt-2 md:pt-4">
                        <h1 className="text-3xl font-black text-slate-800 mb-2">{institucion.nombre}</h1>
                        <p className="text-slate-600 mb-4">{institucion.descripcion}</p>
                        
                        {ofertas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[...new Set(ofertas.map(o => o.modalidad?.nombre).filter(Boolean))].map(mod => (
                                    <span key={mod} className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                                        {mod}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                            {institucion.www && <a href={`http://${institucion.www}`} target="_blank" className="flex items-center gap-1 hover:text-indigo-600"><Globe size={16} /> {institucion.www}</a>}
                            {institucion.telefono && <div className="flex items-center gap-1"><Phone size={16} /> {institucion.telefono}</div>}
                            <div className="flex items-center gap-1 text-yellow-500"><Star size={16} fill="currentColor"/> {averageRating}</div>
                        </div>
                    </div>
                    
                    {user?.role === 'student' && (
                        <div className="md:pt-6">
                            {!interestSent ? (
                                <button onClick={handleSendInterest} disabled={isSendingInterest} className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                    {isSendingInterest ? 'Enviando...' : <><Send size={18} /> Me Interesa</>}
                                </button>
                            ) : (
                                <div className="w-full md:w-auto px-6 py-3 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 flex items-center justify-center gap-2">
                                    <span className="text-xl">✓</span> Solicitud Enviada
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex gap-6 border-b border-slate-100 mt-8 overflow-x-auto">
                    {['oferta', 'convocatorias', 'reviews'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t as any)} className={`pb-3 border-b-2 font-bold text-sm uppercase transition-colors ${activeTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{t}</button>
                    ))}
                    <button onClick={() => setActiveTab('campus')} className={`pb-3 border-b-2 font-bold text-sm uppercase transition-colors ${activeTab === 'campus' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Campus</button>
                    {isOwner && <button onClick={() => setActiveTab('gestion')} className={`pb-3 border-b-2 font-bold text-sm uppercase ${activeTab === 'gestion' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-emerald-500'}`}>Gestionar</button>}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                {/* --- OFERTA EDUCATIVA --- */}
                {activeTab === 'oferta' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-slide-up">
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-3">
                            <div className="flex-1 relative w-full md:w-auto">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input 
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                                    placeholder="Buscar carrera..."
                                    value={offerSearch}
                                    onChange={e => setOfferSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex w-full md:w-auto gap-2 overflow-x-auto">
                                <select className="p-2 text-sm border border-slate-200 rounded-lg bg-white min-w-[110px]" value={offerNivel} onChange={e => setOfferNivel(e.target.value)}>
                                    <option value="">Nivel</option>
                                    {availableNiveles.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <select className="p-2 text-sm border border-slate-200 rounded-lg bg-white min-w-[130px]" value={offerModalidad} onChange={e => setOfferModalidad(e.target.value)}>
                                    <option value="">Modalidad</option>
                                    {availableModalidades.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select className="p-2 text-sm border border-slate-200 rounded-lg bg-white min-w-[120px]" value={offerCampo} onChange={e => setOfferCampo(e.target.value)}>
                                    <option value="">Área</option>
                                    {availableCampos.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select className="p-2 text-sm border border-slate-200 rounded-lg bg-white min-w-[120px]" value={offerCampus} onChange={e => setOfferCampus(e.target.value)}>
                                    <option value="">Campus</option>
                                    {availableCampuses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredOffers.map((o, index) => (
                                <div 
                                    key={o.id_oferta} 
                                    onClick={() => handleOpenOffer(o)} 
                                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md cursor-pointer hover:border-indigo-200 group transition-all bg-white animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                                            o.nivel.nombre.includes('LIC') ? 'bg-blue-50 text-blue-600' : 
                                            o.nivel.nombre.includes('ING') ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                                        }`}>
                                            <GraduationCap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {o.carrera.nombre}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium border border-slate-200">{o.nivel.nombre}</span>
                                                <span className="flex items-center gap-1">
                                                    {o.modalidad.nombre.includes('Línea') ? <Monitor size={12}/> : <Users size={12}/>}
                                                    {o.modalidad.nombre}
                                                </span>
                                                <span className="flex items-center gap-1"><Clock size={12}/> {o.duracion}</span>
                                                {o.escuela && <span className="flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 rounded"><MapPin size={12}/> {o.escuela.nombre}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            ))}
                            {filteredOffers.length === 0 && <p className="text-center text-slate-400 py-8">No se encontraron resultados.</p>}
                        </div>
                    </div>
                )}

                {/* --- CONVOCATORIAS --- */}
                {activeTab === 'convocatorias' && (
                    <div className="space-y-6">
                        {isOwner && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                {!isPosting ? (
                                    <button onClick={() => setIsPosting(true)} className="w-full text-left bg-slate-50 text-slate-500 px-4 py-3 rounded-xl hover:bg-slate-100 flex items-center gap-3">
                                        <Edit3 size={18} /> Publicar noticia...
                                    </button>
                                ) : (
                                    <form onSubmit={handleSubmitPost} className="space-y-3">
                                        <input className="w-full font-bold text-lg border-none focus:ring-0 p-0" placeholder="Título" value={newPost.titulo} onChange={e => setNewPost({...newPost, titulo: e.target.value})} autoFocus required />
                                        <textarea className="w-full border-none focus:ring-0 p-0 text-slate-600" placeholder="Contenido..." rows={3} value={newPost.contenido} onChange={e => setNewPost({...newPost, contenido: e.target.value})} required />
                                        <input className="w-full text-xs bg-slate-50 p-2 rounded" placeholder="URL Imagen" value={newPost.imagenUrl} onChange={e => setNewPost({...newPost, imagenUrl: e.target.value})} />
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => setIsPosting(false)} className="text-sm text-slate-500">Cancelar</button>
                                            <button type="submit" disabled={isSubmittingPost} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Publicar</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                        {convocatorias.map(c => (
                            <div key={c.id_convocatoria} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-5 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2"><Calendar size={14}/> {new Date(c.fecha).toLocaleDateString()}</div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">{c.titulo}</h3>
                                <p className="text-slate-600 text-sm whitespace-pre-line mb-4">{c.contenido}</p>
                                {c.imagenUrl && <img src={c.imagenUrl} className="w-full h-auto rounded-lg mt-3" alt="Convocatoria" />}
                            </div>
                        ))}
                        {convocatorias.length === 0 && <p className="text-center text-slate-400">Sin noticias recientes.</p>}
                    </div>
                )}

                {/* --- REVIEWS --- */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in">
                        {user?.role === 'student' && (
                            <form onSubmit={handleSubmitReview} className="mb-8 bg-slate-50 p-4 rounded-xl">
                                <h4 className="font-bold text-sm mb-2">Deja tu opinión</h4>
                                <div className="flex gap-1 mb-2 text-yellow-400">
                                    {[1,2,3,4,5].map(s => <button type="button" key={s} onClick={() => setNewRating(s)} className="text-xl">★</button>)}
                                </div>
                                <textarea className="w-full p-2 rounded border mb-2 text-sm" rows={2} placeholder="Comentario..." value={newReview} onChange={e => setNewReview(e.target.value)} required />
                                <button disabled={isSubmittingReview} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold w-full">Publicar</button>
                            </form>
                        )}
                        <div className="space-y-4">
                            {reviews.map(r => (
                                <div key={r.id_review} className="pb-4 border-b border-slate-50 last:border-0">
                                    <div className="flex justify-between mb-1"><span className="font-bold text-slate-800 text-sm">{r.nombre_usuario}</span><span className="text-xs text-slate-400">{new Date(r.fecha).toLocaleDateString()}</span></div>
                                    <div className="flex text-yellow-400 text-xs mb-1">{"★".repeat(r.calificacion)}</div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{r.comentario}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- CAMPUS --- */}
                {activeTab === 'campus' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-slate-800">Campus y Sedes</h2>
                            <select 
                                className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full md:w-auto"
                                onChange={(e) => {
                                    const c = campusMap.find(s => s.id_escuela.toString() === e.target.value);
                                    setSelectedCampus(c || null);
                                    if(c) setMapRefreshKey(k => k + 1);
                                }}
                            >
                                <option value="">Ver todos</option>
                                {campusMap.map(c => (
                                    <option key={c.id_escuela} value={c.id_escuela}>{c.nombre} ({c.municipio_nombre})</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-96 rounded-xl overflow-hidden border border-slate-200 mb-6 bg-slate-100">
                            <MapComponent 
                                key={mapRefreshKey}
                                escuelas={displayedCampuses}
                                ofertas={[]} 
                                center={mapCenter} 
                                zoom={selectedCampus ? 15 : 10}
                                simpleMode={true} 
                            />
                        </div>

                        {/* Admin Campus Management */}
                        {isOwner && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-700">Gestionar Campus</h3>
                                    <button onClick={() => setIsAddingCampus(!isAddingCampus)} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                        {isAddingCampus ? 'Cancelar' : '+ Agregar Campus'}
                                    </button>
                                </div>

                                {isAddingCampus && (
                                    <form onSubmit={handleSaveCampus} className="bg-slate-50 p-5 rounded-xl border border-slate-200 animate-slide-up">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input placeholder="Nombre del Campus" required className="p-2 border rounded text-sm" value={newCampus.nombre} onChange={e => setNewCampus({...newCampus, nombre: e.target.value})} />
                                            <select required className="p-2 border rounded text-sm" value={newCampus.id_municipio} onChange={e => setNewCampus({...newCampus, id_municipio: e.target.value})}>
                                                <option value="">Seleccionar Municipio</option>
                                                {catalogs.municipios.map(m => <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>)}
                                            </select>
                                            <input placeholder="Latitud (ej. 20.59)" required type="number" step="any" className="p-2 border rounded text-sm" value={newCampus.latitud} onChange={e => setNewCampus({...newCampus, latitud: e.target.value})} />
                                            <input placeholder="Longitud (ej. -100.41)" required type="number" step="any" className="p-2 border rounded text-sm" value={newCampus.longitud} onChange={e => setNewCampus({...newCampus, longitud: e.target.value})} />
                                        </div>
                                        <div className="text-right">
                                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700">Guardar Campus</button>
                                        </div>
                                    </form>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {campusMap.map(c => (
                                        <div key={c.id_escuela} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-sm text-slate-600">
                                            <span>{c.nombre}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">{c.municipio_nombre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- GESTION --- */}
                {activeTab === 'gestion' && isOwner && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Gestión de Oferta</h2>
                            <button onClick={() => setIsAddingOffer(!isAddingOffer)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-700">
                                {isAddingOffer ? 'Cancelar' : <><PlusCircle size={18}/> Agregar Carrera</>}
                            </button>
                        </div>
                        {isAddingOffer && (
                            <form onSubmit={handleAddOffer} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Carrera</label>
                                        <select 
                                            required 
                                            className="w-full p-2 rounded border text-sm" 
                                            value={isCreatingCarrera ? 'new' : newOffer.id_carrera}
                                            onChange={e => {
                                                if(e.target.value === 'new') {
                                                    setIsCreatingCarrera(true);
                                                    setNewOffer({...newOffer, id_carrera: ''});
                                                } else {
                                                    setIsCreatingCarrera(false);
                                                    setNewOffer({...newOffer, id_carrera: e.target.value});
                                                }
                                            }}
                                        >
                                            <option value="">Seleccionar existente...</option>
                                            {catalogs.carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.nombre}</option>)}
                                            <option value="new" className="font-bold text-indigo-600 bg-indigo-50">+ Crear nueva carrera</option>
                                        </select>
                                    </div>

                                    {/* NEW CAREER SUB-FORM */}
                                    {isCreatingCarrera && (
                                        <div className="col-span-1 md:col-span-2 p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3 animate-fade-in">
                                            <h4 className="text-sm font-bold text-indigo-800 flex items-center gap-2"><PlusCircle size={14}/> Nueva Carrera</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input placeholder="Nombre Carrera" className="p-2 rounded border text-sm w-full" value={newCarreraData.nombre} onChange={e => setNewCarreraData({...newCarreraData, nombre: e.target.value})} />
                                                <input placeholder="Clave (ej. ISC)" className="p-2 rounded border text-sm w-full" value={newCarreraData.clave} onChange={e => setNewCarreraData({...newCarreraData, clave: e.target.value})} />
                                                <select className="p-2 rounded border text-sm w-full" value={newCarreraData.id_campo} onChange={e => setNewCarreraData({...newCarreraData, id_campo: e.target.value})}>
                                                    <option value="">Área de Formación</option>
                                                    {catalogs.campos.map(c => <option key={c.id_campo} value={c.id_campo}>{c.nombre}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <select required className="p-2 rounded border" onChange={e => setNewOffer({...newOffer, id_nivel: e.target.value})}>
                                        <option value="">Nivel</option>
                                        {catalogs.niveles.map(n => <option key={n.id_nivel} value={n.id_nivel}>{n.nombre}</option>)}
                                    </select>
                                    <select required className="p-2 rounded border" onChange={e => setNewOffer({...newOffer, id_modalidad: e.target.value})}>
                                        <option value="">Modalidad</option>
                                        {catalogs.modalidades.map(m => <option key={m.id_modalidad} value={m.id_modalidad}>{m.nombre}</option>)}
                                    </select>
                                    <select required className="p-2 rounded border" onChange={e => setNewOffer({...newOffer, id_escuela: e.target.value})}>
                                        <option value="">Campus</option>
                                        {catalogs.escuelas.map(e => <option key={e.id_escuela} value={e.id_escuela}>{e.nombre}</option>)}
                                    </select>
                                    <input className="p-2 rounded border" placeholder="Duración" required value={newOffer.duracion} onChange={e => setNewOffer({...newOffer, duracion: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 mt-4">
                                    {isCreatingCarrera ? 'Crear Carrera y Guardar Oferta' : 'Guardar Oferta'}
                                </button>
                            </form>
                        )}
                        {ofertas.map(o => (
                            <div key={o.id_oferta} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                                <div><p className="font-bold text-sm">{o.carrera.nombre}</p><p className="text-xs text-slate-500">{o.nivel.nombre} • {o.modalidad.nombre}</p></div>
                                <button onClick={(e) => handleDeleteOffer(o.id_oferta, e)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* SIDEBAR: GALLERY & LOCATION */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* GALLERY WIDGET (Slideshow) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <Image size={16} className="text-indigo-600" /> Galería
                        </h3>
                        {isOwner && (
                            <button onClick={() => setIsAddingImage(!isAddingImage)} className="text-xs text-indigo-600 font-bold hover:text-indigo-800">
                                {isAddingImage ? 'Cancelar' : '+ Agregar'}
                            </button>
                        )}
                    </div>

                    {isAddingImage && (
                        <form onSubmit={handleAddGalleryImage} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input className="w-full text-xs p-2 border rounded mb-2" placeholder="URL Imagen" value={newImage.imagenUrl} onChange={e => setNewImage({...newImage, imagenUrl: e.target.value})} required/>
                            <input className="w-full text-xs p-2 border rounded mb-2" placeholder="Descripción" value={newImage.descripcion} onChange={e => setNewImage({...newImage, descripcion: e.target.value})} required/>
                            <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-bold">Subir</button>
                        </form>
                    )}

                    {gallery.length > 0 ? (
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 group">
                            {gallery.map((img, idx) => (
                                <div 
                                    key={img.id_imagen}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentGalleryIndex ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <img src={img.imagenUrl} alt={img.descripcion} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-4">
                                        <p className="text-white text-sm font-medium line-clamp-2">{img.descripcion}</p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Delete button specific to current image if owner */}
                            {isOwner && (
                                <button 
                                    onClick={() => handleDeleteGalleryImage(gallery[currentGalleryIndex].id_imagen)}
                                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-md z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            )}

                            {/* Dots */}
                            <div className="absolute bottom-2 left-0 w-full flex justify-center gap-1.5 p-2 z-10">
                                {gallery.map((_, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setCurrentGalleryIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentGalleryIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-square bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 border-dashed">
                            <Image size={24} className="mb-2 opacity-50" />
                            <span className="text-xs">Sin imágenes</span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Resumen Académico</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="block text-2xl font-bold text-indigo-600">{ofertas.length}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Carreras</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="block text-2xl font-bold text-emerald-600">{[...new Set(ofertas.map(o => o.nivel.nombre))].length}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Niveles</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- MODAL DETALLE OFERTA (SPLIT VIEW) --- */}
        {selectedOferta && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-slide-up ring-1 ring-white/20">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-20 shadow-sm">
                        <div>
                            <h2 className="text-xl font-black text-slate-800">{selectedOferta.carrera.nombre}</h2>
                            <p className="text-sm text-slate-500">{selectedOferta.institucion.nombre} • {selectedOferta.nivel.nombre}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isOwner && !isEditingDetails && (
                                <button onClick={handleEditDetails} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100">
                                    <Edit3 size={16}/> Editar Contenido
                                </button>
                            )}
                            <button onClick={() => setSelectedOferta(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={24}/></button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        {isLoadingDetails ? (
                            <div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : isEditingDetails ? (
                            <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
                                <h3 className="font-bold text-lg mb-6 text-slate-800 border-b pb-2">Editar Detalles del Programa</h3>
                                <div className="space-y-5 max-w-3xl mx-auto">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">URL Mapa Curricular (Imagen)</label>
                                        <input className="w-full border p-2 rounded-lg" value={detailsForm.mapaCurricularUrl || ''} onChange={e => setDetailsForm({...detailsForm, mapaCurricularUrl: e.target.value})} placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Perfil de Ingreso</label>
                                        <textarea className="w-full border p-2 rounded-lg" rows={3} value={detailsForm.perfilIngreso || ''} onChange={e => setDetailsForm({...detailsForm, perfilIngreso: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Perfil de Egreso</label>
                                        <textarea className="w-full border p-2 rounded-lg" rows={3} value={detailsForm.perfilEgreso || ''} onChange={e => setDetailsForm({...detailsForm, perfilEgreso: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Campo Laboral</label>
                                        <textarea className="w-full border p-2 rounded-lg" rows={2} value={detailsForm.campoLaboral || ''} onChange={e => setDetailsForm({...detailsForm, campoLaboral: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Habilidades (separadas por comas)</label>
                                        <input className="w-full border p-2 rounded-lg" value={detailsForm.habilidades || ''} onChange={e => setDetailsForm({...detailsForm, habilidades: e.target.value})} />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button onClick={() => setIsEditingDetails(false)} className="px-4 py-2 text-slate-600 font-bold">Cancelar</button>
                                        <button onClick={handleSaveDetails} disabled={isSavingDetails} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">{isSavingDetails ? 'Guardando...' : 'Guardar Cambios'}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Left: Image (2/3) */}
                                <div className="lg:w-2/3 h-1/2 lg:h-full bg-slate-100 relative overflow-hidden flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200">
                                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 p-1.5 rounded-xl shadow-lg border border-slate-100 backdrop-blur">
                                        <button onClick={() => setZoomLevel(z => Math.min(z + 0.5, 4))} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600"><ZoomIn size={20}/></button>
                                        <button onClick={() => setZoomLevel(1)} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600"><RefreshCw size={18}/></button>
                                        <button onClick={() => setZoomLevel(z => Math.max(z - 0.5, 0.5))} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600"><ZoomOut size={20}/></button>
                                    </div>
                                    <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing bg-slate-50/50">
                                        {ofertaDetails?.mapaCurricularUrl ? (
                                            <img src={ofertaDetails.mapaCurricularUrl} alt="Mapa" style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s' }} className="max-w-none shadow-2xl rounded-lg" />
                                        ) : (
                                            <div className="text-center text-slate-400"><Image size={64} className="mx-auto mb-4 opacity-30"/><p>Plan de estudios no disponible</p></div>
                                        )}
                                    </div>
                                </div>
                                {/* Right: Info (1/3) */}
                                <div className="lg:w-1/3 h-1/2 lg:h-full overflow-y-auto bg-white custom-scroll p-8 space-y-10">
                                    <div className="pb-6 border-b border-slate-100">
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2"><GraduationCap size={16}/> Perfil de Ingreso</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">{ofertaDetails?.perfilIngreso || 'Información no disponible.'}</p>
                                    </div>
                                    <div className="pb-6 border-b border-slate-100">
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={16}/> Campo Laboral</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">{ofertaDetails?.campoLaboral || 'Información no disponible.'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={16}/> Habilidades</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ofertaDetails?.habilidades ? ofertaDetails.habilidades.split(',').map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">{s.trim()}</span>
                                            )) : <span className="text-sm text-slate-400">No especificadas</span>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ... (EDIT PROFILE MODAL) ... */}
        {isEditingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                    <h3 className="font-bold text-lg mb-4">Editar Perfil</h3>
                    <div className="space-y-4">
                        <div><label className="text-xs font-bold text-slate-500">Nombre</label><input className="w-full border p-2 rounded text-sm" value={editForm.nombre || ''} onChange={e => setEditForm({...editForm, nombre: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-slate-500">Descripción</label><textarea className="w-full border p-2 rounded text-sm" rows={3} value={editForm.descripcion || ''} onChange={e => setEditForm({...editForm, descripcion: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-2">
                            <input className="w-full border p-2 rounded text-sm" placeholder="Teléfono" value={editForm.telefono || ''} onChange={e => setEditForm({...editForm, telefono: e.target.value})} />
                            <input className="w-full border p-2 rounded text-sm" placeholder="Sitio Web" value={editForm.www || ''} onChange={e => setEditForm({...editForm, www: e.target.value})} />
                        </div>
                        <div><label className="text-xs font-bold text-slate-500">URL Portada</label><input className="w-full border p-2 rounded text-xs" value={editForm.bannerUrl || ''} onChange={e => setEditForm({...editForm, bannerUrl: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-slate-500">URL Logo</label><input className="w-full border p-2 rounded text-xs" value={editForm.logoUrl || ''} onChange={e => setEditForm({...editForm, logoUrl: e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                        <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-slate-600 text-sm font-bold">Cancelar</button>
                        <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">{isSavingProfile ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default InstitutionDetail;