import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    getInstitucionById, 
    getOfertasByInstitucion, 
    getReviewsByInstitucion, 
    getConvocatoriasByInstitucion,
    postReview, 
    postConvocatoria,
    sendInterest,
    updateInstitucion 
} from '../services/dataService';
import { Institucion, Oferta, Review, Convocatoria } from '../types';
import { MapPin, Globe, Phone, Star, Mail, ArrowLeft, Send, MessageSquarePlus, Edit3, Save, PlusCircle, Calendar, ImageIcon, X, RefreshCw } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';

const InstitutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [institucion, setInstitucion] = useState<Institucion | undefined>();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [activeTab, setActiveTab] = useState<'convocatorias' | 'oferta' | 'reviews'>('oferta');

  // --- EDIT MODE STATES (Institution) ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Institucion>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- NEW POST STATE (Institution) ---
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ titulo: '', contenido: '', imagenUrl: '' });
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // --- STUDENT STATES ---
  const [interestSent, setInterestSent] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Force map refresh state
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      const numId = parseInt(id);
      loadData(numId);
    }
  }, [id]);

  const loadData = async (numId: number) => {
      getInstitucionById(numId).then((data) => {
          setInstitucion(data);
          // Force map refresh once data is loaded
          setTimeout(() => setMapRefreshKey(k => k + 1), 500);
      });
      getOfertasByInstitucion(numId).then(setOfertas);
      getReviewsByInstitucion(numId).then(setReviews);
      getConvocatoriasByInstitucion(numId).then(setConvocatorias);
  };

  // CHECK OWNERSHIP
  const isOwner = user?.role === 'institution' && institucion && user.id === institucion.id_institucion;

  // HANDLERS
  const handleEditProfile = () => {
      setEditForm(institucion || {});
      setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
      if (!institucion) return;
      setIsSavingProfile(true);
      const updated = await updateInstitucion(institucion.id_institucion, editForm);
      setInstitucion(updated);
      setIsSavingProfile(false);
      setIsEditingProfile(false);
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
      const addedReview = await postReview({
          id_institucion: institucion.id_institucion,
          nombre_usuario: user.name,
          calificacion: newRating,
          comentario: newReview,
      });
      setReviews([addedReview, ...reviews]);
      setNewReview('');
      setIsSubmittingReview(false);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!institucion) return;
      setIsSubmittingPost(true);
      const addedPost = await postConvocatoria({
          id_institucion: institucion.id_institucion,
          titulo: newPost.titulo,
          contenido: newPost.contenido,
          imagenUrl: newPost.imagenUrl || undefined
      });
      setConvocatorias([addedPost, ...convocatorias]);
      setNewPost({ titulo: '', contenido: '', imagenUrl: '' });
      setIsPosting(false);
      setIsSubmittingPost(false);
      setActiveTab('convocatorias'); // Switch to tab to see result
  };

  if (!institucion) return <div className="p-10 text-center">Cargando...</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1) 
    : 'N/A';

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Volver al mapa
      </Link>

      {/* --- SOCIAL PROFILE HEADER --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 relative group">
        
        {/* Banner */}
        <div className="h-48 md:h-64 w-full bg-slate-200 relative overflow-hidden">
             {institucion.bannerUrl ? (
                 <img src={institucion.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-indigo-600 flex items-center justify-center">
                    <span className="text-white/20 text-6xl font-bold">UniMap</span>
                 </div>
             )}
             {/* Edit Button Overlay */}
             {isOwner && (
                 <button 
                    onClick={handleEditProfile}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center gap-2 transition-all"
                 >
                     <Edit3 size={16} /> Editar Perfil
                 </button>
             )}
        </div>

        <div className="px-6 md:px-8 pb-6 pt-16 relative">
            {/* Logo Avatar */}
            <div className="absolute -top-16 left-6 md:left-8 w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden z-10">
                {institucion.logoUrl ? (
                    <img src={institucion.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl">
                        {institucion.nombre.charAt(0)}
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="md:ml-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">{institucion.nombre}</h1>
                  
                  {/* Bio Description */}
                  <p className="text-slate-600 max-w-2xl mb-4 text-sm md:text-base leading-relaxed">
                      {institucion.descripcion || "Institución educativa comprometida con la excelencia académica en Querétaro."}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {institucion.www && (
                      <a href={`http://${institucion.www}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                        <Globe size={16} /> {institucion.www}
                      </a>
                    )}
                    {institucion.telefono && (
                      <div className="flex items-center gap-1">
                        <Phone size={16} /> {institucion.telefono}
                      </div>
                    )}
                     {institucion.correo && (
                      <div className="flex items-center gap-1">
                        <Mail size={16} /> {institucion.correo}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-yellow-500 font-medium text-sm">
                       <Star size={16} fill="currentColor" /> {averageRating} <span className="text-slate-400 font-normal">({reviews.length} reseñas)</span>
                  </div>
                </div>

                {/* STUDENT ACTION: Send Interest */}
                {user?.role === 'student' && (
                    <div className="md:pt-2">
                        {!interestSent ? (
                            <button 
                                onClick={handleSendInterest}
                                disabled={isSendingInterest}
                                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
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

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-slate-100 mt-8 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('oferta')}
                    className={`pb-3 px-1 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'oferta' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Oferta Educativa
                </button>
                <button 
                    onClick={() => setActiveTab('convocatorias')}
                    className={`pb-3 px-1 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'convocatorias' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Noticias y Convocatorias
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 px-1 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Reseñas y Opiniones
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* --- TAB: OFERTA --- */}
           {activeTab === 'oferta' && (
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in duration-300">
               <div className="flex justify-between items-center mb-4">
                   <h2 className="text-lg font-bold text-slate-800">Programas Disponibles</h2>
                   <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{ofertas.length} Carreras</span>
               </div>
               
               <div className="space-y-3">
                 {ofertas.map(oferta => (
                   <div key={oferta.id_oferta} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all group">
                     <div>
                       <div className="text-xs font-bold text-indigo-600 mb-1">{oferta.nivel.nombre}</div>
                       <div className="font-semibold text-slate-800 text-base">{oferta.carrera.nombre}</div>
                       <div className="text-xs text-slate-500 mt-1">{oferta.escuela.nombre} • <span className="font-medium text-slate-600">{oferta.escuela.duracion}</span></div>
                     </div>
                     <div className="mt-2 sm:mt-0">
                        <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                            {oferta.modalidad.nombre}
                        </span>
                     </div>
                   </div>
                 ))}
                 {ofertas.length === 0 && <p className="text-slate-500 italic">No hay oferta educativa registrada aún.</p>}
               </div>
             </div>
           )}

           {/* --- TAB: CONVOCATORIAS --- */}
           {activeTab === 'convocatorias' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                   {/* Create Post Widget (Owner Only) */}
                   {isOwner && (
                       <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                           {!isPosting ? (
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                      <Edit3 size={20} />
                                   </div>
                                   <button 
                                      onClick={() => setIsPosting(true)}
                                      className="flex-1 text-left bg-slate-50 hover:bg-slate-100 text-slate-500 px-4 py-2.5 rounded-full transition-colors text-sm"
                                   >
                                       Publicar una convocatoria, noticia o evento...
                                   </button>
                               </div>
                           ) : (
                               <form onSubmit={handleSubmitPost} className="space-y-3">
                                   <input 
                                     type="text" 
                                     placeholder="Título de la publicación"
                                     className="w-full font-bold text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 p-0 text-lg"
                                     value={newPost.titulo}
                                     onChange={e => setNewPost({...newPost, titulo: e.target.value})}
                                     required
                                     autoFocus
                                   />
                                   <textarea 
                                      placeholder="Escribe los detalles aquí..."
                                      className="w-full resize-none border-none focus:ring-0 p-0 text-slate-600 h-24 text-sm"
                                      value={newPost.contenido}
                                      onChange={e => setNewPost({...newPost, contenido: e.target.value})}
                                      required
                                   />
                                   <input 
                                     type="url" 
                                     placeholder="URL de imagen (opcional)"
                                     className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2"
                                     value={newPost.imagenUrl}
                                     onChange={e => setNewPost({...newPost, imagenUrl: e.target.value})}
                                   />
                                   <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                       <button type="button" onClick={() => setIsPosting(false)} className="text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
                                       <button 
                                          type="submit" 
                                          disabled={isSubmittingPost}
                                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                       >
                                           {isSubmittingPost ? 'Publicando...' : 'Publicar'}
                                       </button>
                                   </div>
                               </form>
                           )}
                       </div>
                   )}

                   {convocatorias.map(post => (
                       <div key={post.id_convocatoria} className="bg-white rounded-2xl p-0 shadow-sm border border-slate-100 overflow-hidden">
                           {post.imagenUrl && (
                               <div className="h-48 w-full bg-slate-100">
                                   <img src={post.imagenUrl} alt="Post" className="w-full h-full object-cover" />
                               </div>
                           )}
                           <div className="p-5">
                               <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                   <Calendar size={14} />
                                   <span>{post.fecha}</span>
                               </div>
                               <h3 className="text-lg font-bold text-slate-800 mb-2">{post.titulo}</h3>
                               <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{post.contenido}</p>
                           </div>
                       </div>
                   ))}

                   {convocatorias.length === 0 && (
                       <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
                           <p className="text-slate-400 text-sm">No hay publicaciones recientes.</p>
                       </div>
                   )}
               </div>
           )}

           {/* --- TAB: REVIEWS --- */}
           {activeTab === 'reviews' && (
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in duration-300">
               
               {/* REVIEW FORM (Student Only) */}
               {user?.role === 'student' ? (
                   <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                       <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                           <MessageSquarePlus size={18} /> Escribe tu opinión
                       </h3>
                       <form onSubmit={handleSubmitReview}>
                           <div className="mb-3">
                               <div className="flex gap-1">
                                   {[1,2,3,4,5].map(star => (
                                       <button 
                                          key={star} 
                                          type="button" 
                                          onClick={() => setNewRating(star)}
                                          className={`text-2xl transition-transform hover:scale-110 ${star <= newRating ? 'text-yellow-400' : 'text-slate-300'}`}
                                       >★</button>
                                   ))}
                               </div>
                           </div>
                           <textarea 
                              className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              placeholder="Comparte tu experiencia..."
                              rows={2}
                              value={newReview}
                              onChange={(e) => setNewReview(e.target.value)}
                              required
                           />
                           <div className="mt-2 text-right">
                               <button 
                                  type="submit" 
                                  disabled={isSubmittingReview}
                                  className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                               >
                                   {isSubmittingReview ? 'Enviando...' : 'Publicar'}
                               </button>
                           </div>
                       </form>
                   </div>
               ) : (
                   !user && (
                       <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm text-center border border-yellow-100">
                           <Link to="#" className="font-bold underline">Inicia sesión como estudiante</Link> para dejar una reseña.
                       </div>
                   )
               )}

               <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id_review} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                 {review.nombre_usuario.charAt(0)}
                             </div>
                             <span className="font-semibold text-slate-800 text-sm">{review.nombre_usuario}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(review.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-yellow-400 my-1 ml-10">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} size={12} fill={i < review.calificacion ? "currentColor" : "none"} className={i >= review.calificacion ? "text-slate-200" : ""} />
                          ))}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed ml-10 bg-slate-50 p-3 rounded-lg rounded-tl-none">{review.comentario}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && <p className="text-slate-500 italic text-center py-4">Aún no hay reseñas.</p>}
               </div>
             </div>
           )}
        </div>

        {/* Sidebar: Location */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sticky top-6">
            <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                   <MapPin size={16} className="text-indigo-600" /> Ubicación
                 </h3>
                 <button 
                    onClick={() => setMapRefreshKey(k => k + 1)} 
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    title="Recargar mapa"
                 >
                     <RefreshCw size={12} /> Centrar
                 </button>
            </div>
            
            <div className="w-full h-72 rounded-xl overflow-hidden relative z-0 border border-slate-200 bg-slate-100">
               {/* Key forces complete re-mount if manual refresh is clicked */}
               <MapComponent 
                 key={mapRefreshKey}
                 instituciones={[institucion]} 
                 ofertas={[]} 
                 center={[institucion.latitud, institucion.longitud]} 
                 zoom={15}
              />
            </div>
            <div className="mt-3 text-xs text-slate-400 text-center">
               Lat: {institucion.latitud.toFixed(4)}, Long: {institucion.longitud.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditingProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditingProfile(false)}></div>
              <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800">Editar Perfil Institucional</h3>
                      <button onClick={() => setIsEditingProfile(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Nombre Institución</label>
                          <input 
                             className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                             value={editForm.nombre} 
                             onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Descripción (Bio)</label>
                          <textarea 
                             className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                             rows={3}
                             value={editForm.descripcion || ''} 
                             onChange={e => setEditForm({...editForm, descripcion: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
                              <input 
                                 className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                                 value={editForm.telefono || ''} 
                                 onChange={e => setEditForm({...editForm, telefono: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Sitio Web</label>
                              <input 
                                 className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                                 value={editForm.www || ''} 
                                 onChange={e => setEditForm({...editForm, www: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">URL de Banner (Portada)</label>
                          <input 
                             className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-500" 
                             value={editForm.bannerUrl || ''} 
                             onChange={e => setEditForm({...editForm, bannerUrl: e.target.value})}
                             placeholder="https://..."
                          />
                      </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">URL de Logo</label>
                          <input 
                             className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-500" 
                             value={editForm.logoUrl || ''} 
                             onChange={e => setEditForm({...editForm, logoUrl: e.target.value})}
                             placeholder="https://..."
                          />
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-200 rounded-lg"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      >
                          {isSavingProfile ? 'Guardando...' : <><Save size={16} /> Guardar Cambios</>}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default InstitutionDetail;